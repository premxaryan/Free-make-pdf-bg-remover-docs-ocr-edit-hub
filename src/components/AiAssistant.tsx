import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Printer, 
  RotateCcw, 
  HelpCircle, 
  Zap, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { AiChatMessage } from '../types.ts';

const SAMPLE_QUESTIONS = [
  'How to edit text in a scanned PDF in Acrobat Pro?',
  'How to resize photo to 3.5x4.5cm and 20-50 KB for SSC?',
  'What is the standard proforma for Birth Certificate or Notary Identity Affidavit?',
  'How to fix Mantra MFS100 / Morpho biometric device not detected error in RD service?',
  'How to create 213x213 px 300 DPI photo for PAN card NSDL/UTI?',
  'How to print PVC Aadhaar / Ayushman card on Epson L805 tray?',
  'What are the mandatory documents required for Aadhaar Name & DOB update?',
  'Write a formal Leave Application format in Hindi for office work.',
];

export const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome_msg',
      sender: 'assistant',
      text: `### 🤖 Namaste! I am your Cyber Cafe & CSC Center AI Specialist.

I can help you with:
- **Exact Photo & Signature Sizing** for SSC, UPSC, NTA, IBPS, PAN, Police & State portals.
- **Step-by-step Software Guidance** for Photoshop, Adobe Acrobat Pro, NAPS2, and MS Paint.
- **CSC Hardware Troubleshooting** (Mantra MFS100, Morpho RD Service, Iris scanners, Epson L805 PVC tray printing).
- **Document & Legal Drafting** in Hindi and English (Bio-Data, Affidavits, Gap Year, Leave Letters, RTI).

*Click one of the quick questions below or type any question you have!*`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      source: 'Cyber Cafe Assistant'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || isLoading) return;

    const userMsg: AiChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text })
      });
      const data = await res.json();
      
      const assistantMsg: AiChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'I am ready to assist with your Cyber Cafe queries.',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        source: data.source
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: AiChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: `### 💡 Quick Cyber Cafe Pro Tip for: "${text}"

1. **For PDF Editing:** Use Adobe Acrobat Pro (Tools > Edit PDF) or open in MS Word 2019/365.
2. **For Resizing Photos:** Crop to 3.5 × 4.5 cm in Photoshop with 300 DPI, press Ctrl+Shift+Alt+S (Save for Web) and slide quality to target 20-50 KB.
3. **For Signatures:** Make Grayscale (Ctrl+Shift+U), increase contrast with Levels (Ctrl+L), save under 20 KB.
4. **Biometric RD Service:** Check \`services.msc\` -> restart Mantra AVDM / Morpho Smart Card service.`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        source: 'Local Knowledge Base'
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome_msg_reset',
        sender: 'assistant',
        text: '### 🔄 Chat cleared. Ask me any Cyber Cafe or CSC Center question anytime!',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  // Helper to render markdown text with headings, bold, bullet points
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-sm sm:text-base text-slate-900 dark:text-white pt-2 pb-0.5 border-b border-slate-200 dark:border-slate-700">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-bold text-base text-indigo-900 dark:text-indigo-300 pt-3 pb-1">
                {line.replace('## ', '')}
              </h3>
            );
          }
          if (line.startsWith('**') && line.endsWith('**')) {
            return (
              <p key={idx} className="font-bold text-slate-900 dark:text-white">
                {line.replace(/\*\*/g, '')}
              </p>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            const parsed = line.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-indigo-500 font-bold mt-1 text-xs">•</span>
                <span>{renderInlineFormatting(parsed)}</span>
              </div>
            );
          }
          if (/^\d+\.\s/.test(line)) {
            const match = line.match(/^(\d+\.)\s(.*)/);
            if (match) {
              return (
                <div key={idx} className="flex items-start gap-2 pl-2">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-xs">{match[1]}</span>
                  <span>{renderInlineFormatting(match[2])}</span>
                </div>
              );
            }
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-1" />;
          }
          return <p key={idx}>{renderInlineFormatting(line)}</p>;
        })}
      </div>
    );
  };

  const renderInlineFormatting = (text: string) => {
    // Replace **bold** with <strong> and `code` with <kbd>
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <kbd key={pIdx} className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-mono text-[11px] border border-slate-200 dark:border-slate-600">
            {part.slice(1, -1)}
          </kbd>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-4">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Smart Cyber Cafe & CSC Center AI Assistant
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instant answers for exam portal sizing rules, Photoshop tricks, PDF OCR editing, and biometric RD device fixes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Chat
            </button>
          </div>
        </div>

        {/* Quick Question Chips */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">
            Frequent Cyber Cafe Questions (Click to Ask):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-700/70 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 transition-all text-left cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col h-[580px] overflow-hidden">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isCopied = copiedId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-xs ${
                    isUser ? 'bg-indigo-600' : 'bg-gradient-to-br from-purple-600 to-indigo-700'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-xl p-4 shadow-2xs space-y-2 relative group ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-50 dark:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-700/50 pb-1">
                    <span className="text-[10px] font-bold opacity-75">
                      {isUser ? 'Operator' : (msg.source || 'AI Assistant')}
                    </span>
                    <span className="text-[10px] opacity-60 font-mono">{msg.timestamp}</span>
                  </div>

                  <div className="text-xs sm:text-sm">
                    {isUser ? <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p> : renderFormattedContent(msg.text)}
                  </div>

                  {!isUser && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
                        title="Copy Answer"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-750 rounded-xl p-3.5 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <span className="animate-pulse">Consulting Cyber Cafe Knowledge Base & Gemini AI...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Query Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-700">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="ai-query-input"
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything: e.g., How to make white background in Photoshop 7.0, SSC signature size, etc..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              id="ai-send-btn"
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-sm shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
