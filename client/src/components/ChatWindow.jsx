import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const SUGGESTIONS = [
  'Where is my order?',
  'What is your return policy?',
  'Do you offer free shipping?',
  'How long is the warranty?',
];

const ChatWindow = ({ messages, isTyping, onSuggestion, hasStarted }) => {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping]);

  if (!hasStarted) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10 text-center scroll-thin">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 shadow-lg">
          <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none">
            <path d="M16 44 L24 28 L32 36 L40 20 L48 44 Z" fill="#fff" />
            <circle cx="44" cy="22" r="3" fill="#fff" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Hi, I'm Nova 👋</h2>
        <p className="mt-1 max-w-md text-sm text-gray-500">
          Your NovaMart customer support agent. Ask me anything about orders, returns,
          shipping, warranty, or payments.
        </p>
        <div className="mt-6 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSuggestion(s)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto scroll-thin px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {messages.map((m, i) => (
            <MessageBubble key={m._id || `${m.role}-${i}`} message={m} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
