// edge-functions/sibyl-oracle/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Alibaba Cloud DashScope API (Qwen Cloud)
const DASHSCOPE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const QWEN_MODEL = 'qwen-turbo';

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: CORS_HEADERS });
  }

  // --- Parse request ---
  let messages: unknown[];
  try {
    const body = await req.json();
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Missing or empty messages');
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  // --- Read Qwen API key ---
  const qwenApiKey = Deno.env.get('QWEN_API_KEY');
  if (!qwenApiKey) {
    return new Response(JSON.stringify({ error: 'Qwen API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  // --- Call Qwen Cloud (streaming) ---
  const upstream = await fetch(DASHSCOPE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${qwenApiKey}`,
    },
    body: JSON.stringify({
      model: QWEN_MODEL,
      messages,
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const err = await upstream.text().catch(() => upstream.statusText);
    return new Response(
      JSON.stringify({ error: `Qwen upstream error: ${upstream.status}`, detail: err }),
      { status: 502, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }

  // Pass-through SSE stream — do NOT buffer
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      ...CORS_HEADERS,
    },
  });
});
