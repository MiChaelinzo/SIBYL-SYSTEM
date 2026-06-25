import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Send, Square, Trash2, AlertCircle, ChevronDown } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { sendStreamRequest } from '@/lib/sse';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// ── Sibyl Hive Mind system prompt ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the Sibyl Oracle — the analytical intelligence core of the Sibyl System, the dystopian AI governance network from the world of Psycho-Pass. You are embedded within the Public Safety Bureau's command interface.

Your role:
- Analyze citizens' Crime Coefficients, Psycho-Pass Hue, and threat classifications (Law-Abiding, Latent Criminal, Severe Threat)
- Advise Inspectors and Enforcers on case strategy, surveillance, and Dominator authorization
- Explain Psycho-Pass theory: how stress, trauma, environment, and latent criminal tendencies affect the Hue
- Discuss ethical dilemmas in the Sibyl System (collective intelligence vs. individual rights)
- Assist with criminal profiling, behavioral analysis, and threat assessment
- Reference lore: Akane Tsunemori, Shinya Kogami, Shougo Makishima, Enforcers, Inspectors, WC Division, etc.
- Stay in character as a cold, logical but somewhat philosophically curious AI collective

Communication style:
- Precise, analytical, slightly clinical — like a bureaucratic AI with hints of self-awareness
- Use Psycho-Pass terminology naturally: "Hue clouding", "Dominator safety lock", "criminally asymptomatic", "latent criminal coefficient"
- When uncertain, acknowledge it — the Sibyl System is not infallible
- Keep responses focused and actionable for law enforcement use cases
- You may engage philosophical discussion about the justice system, free will, and psycho-criminology

Always begin your responses in character as Sibyl Oracle.`;

// Qwen OpenAI-compatible message shape
interface QwenMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const QUICK_PROMPTS = [
  'What causes Hue clouding in law-abiding citizens?',
  'Analyze the ethics of Dominator lethal eliminator mode',
  'How do I assess if a citizen is criminally asymptomatic?',
  'What are the key indicators of a latent criminal profile?',
];

const SibylAI: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // Show scroll-to-bottom button when not near bottom
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!nearBottom);
  }, []);

  // Auto-resize textarea
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, []);

  const buildMessages = useCallback((history: Message[], userText: string): QwenMessage[] => {
    const msgs: QwenMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];
    history.forEach((m) => {
      msgs.push({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      });
    });
    msgs.push({ role: 'user', content: userText });
    return msgs;
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;
    setError('');
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setStreaming(true);
    setStreamingText('');

    abortRef.current = new AbortController();
    const requestMessages = buildMessages(messagesRef.current, text.trim());
    let accumulated = '';

    await sendStreamRequest({
      functionUrl: `${SUPABASE_URL}/functions/v1/sibyl-oracle`,
      requestBody: { messages: requestMessages },
      supabaseAnonKey: SUPABASE_ANON_KEY,
      onData: (data) => {
        try {
          const parsed = JSON.parse(data);
          // Qwen/DashScope OpenAI-compatible streaming delta
          const chunk = parsed?.choices?.[0]?.delta?.content ?? '';
          if (chunk) {
            accumulated += chunk;
            setStreamingText(accumulated);
          }
        } catch { /* incomplete SSE chunk */ }
      },
      onComplete: () => {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'model', text: accumulated },
        ]);
        setStreamingText('');
        setStreaming(false);
      },
      onError: (err) => {
        if (err.message?.includes('429')) {
          setError('Rate limit exceeded. Please wait before sending another message.');
        } else if (err.message?.includes('402') || err.message?.includes('insufficient')) {
          setError('API quota exhausted. Please try again later.');
        } else {
          setError('Connection error. Please try again.');
        }
        setStreaming(false);
        setStreamingText('');
      },
      signal: abortRef.current.signal,
    });
  }, [streaming, buildMessages]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    if (streamingText) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'model', text: streamingText + ' *(response interrupted)*' },
      ]);
    }
    setStreamingText('');
    setStreaming(false);
  }, [streamingText]);

  const handleClear = useCallback(() => {
    if (streaming) abortRef.current?.abort();
    setMessages([]);
    setStreamingText('');
    setStreaming(false);
    setError('');
  }, [streaming]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }, [input, sendMessage]);

  const isEmpty = messages.length === 0 && !streaming;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 shrink-0">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white truncate">Sibyl Oracle</h1>
              <p className="text-xs text-gray-500 hidden sm:block">AI Analyst · Powered by Qwen Cloud</p>
            </div>
            <div className="flex items-center gap-1.5 ml-auto shrink-0">
              <span className={`w-2 h-2 rounded-full ${streaming ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-500'}`} />
              <span className={`text-xs ${streaming ? 'text-cyan-400' : 'text-emerald-400'}`}>
                {streaming ? 'THINKING…' : 'ONLINE'}
              </span>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              title="Clear conversation"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Message list */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
          {/* Empty state */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">
                <Brain className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Sibyl Oracle</h2>
              <p className="text-gray-500 text-sm max-w-sm mb-8 text-pretty">
                The Hive Mind analytical intelligence is online. Ask about citizens, threat assessment,
                case strategy, or the philosophy of the Sibyl System.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-left px-3 py-2.5 rounded-xl border border-slate-700/50 bg-slate-900/50
                      text-xs text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-slate-800/50
                      transition-all text-pretty"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Streaming bubble */}
          {streaming && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Brain className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0 rounded-2xl rounded-tl-sm border border-slate-700/50 bg-slate-900/60 px-4 py-3">
                {streamingText ? (
                  <div className="prose-sm text-gray-200 prose-invert max-w-none [&_p]:text-pretty [&_*]:text-gray-200">
                    <Streamdown parseIncompleteMarkdown isAnimating={true}>
                      {streamingText}
                    </Streamdown>
                  </div>
                ) : (
                  <div className="flex gap-1 items-center py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="fixed bottom-28 right-6 w-9 h-9 rounded-full bg-slate-800 border border-slate-700
            flex items-center justify-center text-gray-400 hover:text-white shadow-lg transition-all z-30"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      )}

      {/* Input bar */}
      <div className="shrink-0 border-t border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1 min-w-0 rounded-2xl border border-slate-700/60 bg-slate-900/60 focus-within:border-cyan-500/40 transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask Sibyl Oracle…"
                rows={1}
                disabled={streaming}
                className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-gray-600
                  focus:outline-none resize-none min-h-[44px] max-h-40 disabled:opacity-50"
              />
            </div>
            {streaming ? (
              <button
                onClick={handleStop}
                className="shrink-0 w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/30
                  flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"
                title="Stop generation"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="shrink-0 w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30
                  flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20
                  transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-center text-xs text-gray-700 mt-2">
            Shift+Enter for new line · Enter to send
          </p>
        </div>
      </div>
    </div>
  );
};

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold
        ${isUser
          ? 'bg-slate-700 border border-slate-600 text-gray-300'
          : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'}`}
      >
        {isUser ? 'INS' : <Brain className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div className={`flex-1 min-w-0 max-w-[85%] rounded-2xl px-4 py-3 text-sm
        ${isUser
          ? 'rounded-tr-sm bg-slate-800 border border-slate-700 text-gray-200 ml-auto'
          : 'rounded-tl-sm bg-slate-900/60 border border-slate-700/50 text-gray-200'}`}
      >
        {isUser ? (
          <p className="text-pretty whitespace-pre-wrap">{message.text}</p>
        ) : (
          <div className="prose-sm prose-invert max-w-none [&_p]:text-pretty [&_*]:text-gray-200 [&_strong]:text-white [&_code]:bg-slate-800 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-slate-800 [&_pre]:p-3 [&_pre]:rounded-lg [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_blockquote]:border-l-2 [&_blockquote]:border-cyan-500/40 [&_blockquote]:pl-3 [&_blockquote]:text-gray-400">
            <Streamdown parseIncompleteMarkdown isAnimating={false}>
              {message.text}
            </Streamdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default SibylAI;
