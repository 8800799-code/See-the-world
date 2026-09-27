import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, User, Bot, ExternalLink, HelpCircle } from 'lucide-react';
import { askTourGuide } from '../services/api.ts';

interface TourGuideChatProps {
  landmarkName: string;
  city: string;
  country?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'guide';
  text: string;
  sources?: Array<{ title: string; uri: string }>;
  timestamp: string;
}

const QUICK_QUESTIONS = [
  'Why was it almost torn down or destroyed?',
  'What is the best time of day to take photos here?',
  'Can visitors access the very top or interior crypts?',
  'How much did it cost to construct in today\'s money?',
];

export const TourGuideChat: React.FC<TourGuideChatProps> = ({
  landmarkName,
  city,
  country,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'guide',
      text: `Greetings! I am your AI architectural docent at ${landmarkName}. What would you like to know about its history, engineering secrets, or visiting tips?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [isAsking, setIsAsking] = useState<boolean>(false);

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim() || isAsking) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: questionText,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsAsking(true);

    try {
      const response = await askTourGuide(questionText, landmarkName, city, country);
      const guideMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'guide',
        text: response.answer,
        sources: response.sources,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, guideMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'guide',
        text: 'Apologies, I encountered a brief connection issue. Please feel free to ask again.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-cyan-500/30 p-4 sm:p-6 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-sm text-slate-100">
                Ask On-Site Tour Docent
              </h3>
              <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                Grounded Q&A
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live inquiries answered using Google Search verified facts
            </p>
          </div>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="max-h-72 overflow-y-auto flex flex-col gap-3 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-cyan-500 text-slate-950 rounded-tr-none font-medium'
                  : 'bg-slate-950/90 text-slate-200 border border-slate-800 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>

              {/* Grounding sources pill */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[11px] font-mono-tech text-slate-400">
                  <span className="text-slate-500">Sources:</span>
                  {msg.sources.slice(0, 2).map((s, idx) => (
                    <a
                      key={idx}
                      href={s.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-0.5 truncate max-w-[140px]"
                    >
                      <span className="truncate">{s.title}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isAsking && (
          <div className="flex items-center gap-2 text-xs font-mono-tech text-cyan-400 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consulting Google Search archives & historical records...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
        <span className="text-[11px] font-mono-tech text-slate-500 self-center mr-1">
          Suggestions:
        </span>
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleAsk(q)}
            disabled={isAsking}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(inputQuestion);
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder={`Ask anything about ${landmarkName}...`}
          disabled={isAsking}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputQuestion.trim() || isAsking}
          className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition disabled:opacity-40 shrink-0"
          title="Send Question"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
