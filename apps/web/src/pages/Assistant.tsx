import { useEffect, useRef, useState } from 'react';
import { Bot, Send, Sparkles, User } from 'lucide-react';

import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/ui/PageHeader';
import { aiService, type ChatTurn } from '../services/aiService';
import { errorMessage } from '../services/extraServices';

const SUGGESTIONS = [
  'Which batches expire in the next 90 days?',
  'Show recent recalls',
  'What are my highest-risk batches?',
  'Which batches will run low on stock?',
  'Summarise my recent transfers',
];

export default function Assistant() {
  const [messages, setMessages] = useState<(ChatTurn & { source?: string })[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm the PharmaGuard AI assistant. Ask me about your inventory, expiring batches, recalls, transfers or risks. I only use data your role is allowed to see.",
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    aiService
      .status()
      .then((s) => setProvider(s.enabled ? `Gemini · ${s.model}` : 'Rule-based mode'))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || busy) return;
    const history = messages.slice(1).map(({ role, content }) => ({ role, content }));
    setMessages((m) => [...m, { role: 'user', content: message }]);
    setInput('');
    setBusy(true);
    try {
      const res = await aiService.chat(message, history);
      setMessages((m) => [...m, { role: 'assistant', content: res.answer, source: res.source }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: `Sorry, I couldn't answer that: ${errorMessage(e)}` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-9rem)] flex-col gap-4">
        <PageHeader
          title="AI Assistant"
          subtitle="Ask questions about your pharmaceutical supply chain in plain language."
          icon={<Bot size={22} />}
          actions={provider && <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700">{provider}</span>}
        />

        <div className="card flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center ${
                    m.role === 'user' ? 'bg-slate-200 text-slate-700' : 'bg-teal-600 text-white'
                  }`}
                >
                  {m.role === 'user' ? <User size={18} /> : <Sparkles size={18} />}
                </div>
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                    m.role === 'user' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {m.content}
                  {m.source === 'rules' && <span className="mt-2 block text-[11px] opacity-60">Answered by the rule engine</span>}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-teal-600 text-white flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-slate-500">Thinking…</div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 px-4 pb-3 sm:px-6">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:border-teal-400 hover:bg-teal-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-3 border-t border-slate-200 p-4"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about inventory, expiry, recalls…"
              maxLength={1000}
              aria-label="Message"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-teal-600"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-medium text-white hover:bg-teal-700 disabled:opacity-50"
            >
              <Send size={18} /> <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
