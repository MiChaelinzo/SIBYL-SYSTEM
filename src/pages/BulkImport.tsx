import React, { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle2, XCircle, Loader2, AlertTriangle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { supabase } from '@/db/supabase';

interface ImportRow {
  name: string;
  age: string;
  occupation: string;
  location: string;
  initial_crime_coefficient: string;
  _rowIndex: number;
  _errors: string[];
}

interface ImportResult {
  imported: number;
  failed: number;
  errors: { row: number; name: string; reason: string }[];
}

const REQUIRED_COLS = ['name', 'age', 'occupation', 'location', 'initial_crime_coefficient'];
const MAX_FILE_MB = 10;

function normalizeHeader(h: string): string {
  return h.toLowerCase().trim().replace(/\s+/g, '_');
}

function validateRow(row: Record<string, string>, index: number): ImportRow {
  const errors: string[] = [];
  const name = (row['name'] || '').trim();
  const age = (row['age'] || '').trim();
  const occupation = (row['occupation'] || '').trim();
  const location = (row['location'] || '').trim();
  const cc = (row['initial_crime_coefficient'] || '').trim();

  if (!name) errors.push('Name is required');
  if (!age || isNaN(parseInt(age)) || parseInt(age) < 0) errors.push('Age must be a valid non-negative integer');
  if (!occupation) errors.push('Occupation is required');
  if (!location) errors.push('Location is required');
  if (!cc || isNaN(parseInt(cc)) || parseInt(cc) < 0 || parseInt(cc) > 999)
    errors.push('Crime Coefficient must be 0–999');

  return { name, age, occupation, location, initial_crime_coefficient: cc, _rowIndex: index, _errors: errors };
}

function determineThreatLevel(cc: number): string {
  if (cc >= 300) return 'severe_threat';
  if (cc >= 100) return 'latent_criminal';
  return 'law_abiding';
}

function determineHue(cc: number): string {
  if (cc >= 300) return 'red';
  if (cc >= 200) return 'orange';
  if (cc >= 100) return 'yellow';
  if (cc >= 50)  return 'green';
  return 'blue';
}

const BulkImport: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);

  const validRows = rows.filter((r) => r._errors.length === 0);
  const invalidRows = rows.filter((r) => r._errors.length > 0);

  const parseFile = useCallback((file: File) => {
    setParseError('');
    setRows([]);
    setResult(null);

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setParseError(`File too large. Maximum size is ${MAX_FILE_MB}MB.`);
      return;
    }
    setFileName(file.name);

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: normalizeHeader,
        complete: ({ data, errors }) => {
          if (errors.length) { setParseError('CSV parse error: ' + errors[0].message); return; }
          setRows(data.map((r, i) => validateRow(r, i + 2)));
        },
        error: (e: { message: string }) => setParseError('Failed to parse CSV: ' + e.message),
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target!.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const raw = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '', raw: false });
          const normalized = raw.map((r) => {
            const n: Record<string, string> = {};
            Object.keys(r).forEach((k) => { n[normalizeHeader(k)] = r[k]; });
            return n;
          });
          setRows(normalized.map((r, i) => validateRow(r, i + 2)));
        } catch {
          setParseError('Failed to parse Excel file. Ensure the file is a valid .xlsx or .xls.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setParseError('Unsupported file format. Please upload a .xlsx, .xls, or .csv file.');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const handleImport = useCallback(async () => {
    if (!validRows.length) return;
    setImporting(true);
    setImportProgress(0);

    const batchSize = 10;
    let imported = 0;
    const errors: ImportResult['errors'] = [];

    for (let i = 0; i < validRows.length; i += batchSize) {
      const batch = validRows.slice(i, i + batchSize);
      const records = batch.map((r) => {
        const cc = parseInt(r.initial_crime_coefficient);
        return {
          name: r.name,
          age: parseInt(r.age),
          occupation: r.occupation,
          location: r.location,
          current_crime_coefficient: cc,
          current_hue: determineHue(cc),
          threat_level: determineThreatLevel(cc),
          scan_count: 0,
          is_criminally_asymptomatic: false,
          citizen_id: `IMP-${Date.now()}-${i + batch.indexOf(r)}`,
        };
      });

      const { error } = await supabase.from('citizens').insert(records);
      if (error) {
        batch.forEach((r) => errors.push({ row: r._rowIndex, name: r.name, reason: error.message }));
      } else {
        imported += batch.length;
      }
      setImportProgress(Math.round(((i + batch.length) / validRows.length) * 100));
    }

    setResult({ imported, failed: errors.length, errors });
    setImporting(false);
  }, [validRows]);

  const downloadErrorReport = useCallback(() => {
    if (!result?.errors.length) return;
    const csv = ['Row,Name,Reason', ...result.errors.map((e) => `${e.row},"${e.name}","${e.reason}"`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'import_errors.csv';
    a.click();
  }, [result]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <FileSpreadsheet className="w-5 h-5 text-cyan-400 shrink-0" />
          <h1 className="text-base font-bold text-white truncate">Bulk Citizen Import</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 space-y-4">

        {/* Upload Zone */}
        {!rows.length && !result && (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-cyan-400" />
              Upload Citizen Data
            </h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
                ${dragging
                  ? 'border-cyan-400 bg-cyan-900/10'
                  : 'border-slate-600 hover:border-cyan-500/50 hover:bg-slate-800/30'
                }`}
            >
              <Upload className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-white font-medium mb-1">Drop your file here or click to browse</p>
              <p className="text-gray-500 text-sm">Supports .xlsx, .xls, .csv — max {MAX_FILE_MB}MB</p>
              <p className="text-gray-600 text-xs mt-2">
                Required columns: name, age, occupation, location, initial_crime_coefficient
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {parseError && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-2">
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-400 text-sm">{parseError}</p>
              </div>
            )}

            {/* Template hint */}
            <div className="mt-4 rounded-lg border border-slate-700/40 bg-slate-800/30 px-4 py-3">
              <p className="text-xs text-gray-500 mb-1 font-medium">Expected column headers (case-insensitive):</p>
              <p className="text-xs text-gray-400 font-mono">
                name | age | occupation | location | initial_crime_coefficient
              </p>
            </div>
          </div>
        )}

        {/* Data Preview */}
        {rows.length > 0 && !result && (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 md:p-6">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
                Data Preview — {fileName}
              </h2>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 rounded border border-emerald-500/30 bg-emerald-950/20 text-emerald-400">
                  {validRows.length} valid
                </span>
                {invalidRows.length > 0 && (
                  <span className="px-2 py-1 rounded border border-red-500/30 bg-red-950/20 text-red-400">
                    {invalidRows.length} errors
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-700/40 mb-4">
              <table className="w-full text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/50">
                    <th className="text-left px-3 py-2 text-gray-400 font-medium">#</th>
                    <th className="text-left px-3 py-2 text-gray-400 font-medium">Name</th>
                    <th className="text-left px-3 py-2 text-gray-400 font-medium">Age</th>
                    <th className="text-left px-3 py-2 text-gray-400 font-medium">Occupation</th>
                    <th className="text-left px-3 py-2 text-gray-400 font-medium">Location</th>
                    <th className="text-left px-3 py-2 text-gray-400 font-medium">CC</th>
                    <th className="text-left px-3 py-2 text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 50).map((r) => (
                    <tr
                      key={r._rowIndex}
                      className={`border-b border-slate-800/50 ${r._errors.length ? 'bg-red-950/10' : 'bg-transparent'}`}
                    >
                      <td className="px-3 py-2 text-gray-600">{r._rowIndex}</td>
                      <td className="px-3 py-2 text-white max-w-[120px] truncate">{r.name || '—'}</td>
                      <td className="px-3 py-2 text-gray-300">{r.age || '—'}</td>
                      <td className="px-3 py-2 text-gray-300 max-w-[120px] truncate">{r.occupation || '—'}</td>
                      <td className="px-3 py-2 text-gray-300 max-w-[100px] truncate">{r.location || '—'}</td>
                      <td className="px-3 py-2 text-gray-300">{r.initial_crime_coefficient || '—'}</td>
                      <td className="px-3 py-2">
                        {r._errors.length ? (
                          <span title={r._errors.join('; ')} className="flex items-center gap-1 text-red-400">
                            <XCircle className="w-3.5 h-3.5" />
                            Error
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 50 && (
                <p className="text-center text-gray-600 text-xs py-2">Showing first 50 of {rows.length} rows</p>
              )}
            </div>

            {/* Validation errors */}
            {invalidRows.length > 0 && (
              <div className="rounded-lg border border-red-500/20 bg-red-950/10 p-3 mb-4">
                <p className="text-red-400 text-xs font-medium mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Validation Errors ({invalidRows.length} rows will be skipped)
                </p>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {invalidRows.slice(0, 10).map((r) => (
                    <p key={r._rowIndex} className="text-xs text-red-400/80">
                      Row {r._rowIndex} ({r.name || 'unnamed'}): {r._errors.join('; ')}
                    </p>
                  ))}
                  {invalidRows.length > 10 && <p className="text-xs text-gray-600">…and {invalidRows.length - 10} more</p>}
                </div>
              </div>
            )}

            {/* Import progress bar */}
            {importing && (
              <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/10 p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-medium">Importing…</span>
                  <span className="text-cyan-400 text-xs">{importProgress}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-200 rounded-full"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleImport}
                disabled={importing || validRows.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30
                  text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 transition-all disabled:opacity-50"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {importing ? 'Importing…' : `Import ${validRows.length} Records`}
              </button>
              <button
                onClick={() => { setRows([]); setFileName(''); setResult(null); }}
                className="px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-gray-400
                  text-sm hover:text-white transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Import Results */}
        {result && (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Import Complete
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center">
                <p className="text-3xl font-bold text-emerald-400">{result.imported}</p>
                <p className="text-xs text-gray-500 mt-1">Successfully Imported</p>
              </div>
              <div className={`rounded-xl border p-4 text-center ${result.failed > 0 ? 'border-red-500/30 bg-red-950/20' : 'border-slate-700/40 bg-slate-800/30'}`}>
                <p className={`text-3xl font-bold ${result.failed > 0 ? 'text-red-400' : 'text-gray-500'}`}>{result.failed}</p>
                <p className="text-xs text-gray-500 mt-1">Failed</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="rounded-lg border border-red-500/20 bg-red-950/10 p-3 mb-4">
                <p className="text-red-400 text-xs font-medium mb-2">Failed Records:</p>
                {result.errors.slice(0, 5).map((e, i) => (
                  <p key={i} className="text-xs text-red-400/80">Row {e.row} ({e.name}): {e.reason}</p>
                ))}
                {result.errors.length > 5 && <p className="text-xs text-gray-600 mt-1">…and {result.errors.length - 5} more</p>}
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400
                  text-sm font-medium hover:bg-cyan-500/20 transition-all"
              >
                Back to Dashboard
              </button>
              {result.errors.length > 0 && (
                <button
                  onClick={downloadErrorReport}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700
                    text-gray-300 text-sm hover:text-white transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download Error Report
                </button>
              )}
              <button
                onClick={() => { setRows([]); setFileName(''); setResult(null); }}
                className="px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-gray-400
                  text-sm hover:text-white transition-all"
              >
                Import Another File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkImport;
