import { useState, useRef, useEffect } from 'react';

const ChatInput = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const taRef = useRef(null);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-shrink-0 border-t border-gray-200 bg-white p-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          placeholder={disabled ? 'Nova is typing...' : 'Ask Nova anything about NovaMart...'}
          disabled={disabled}
          className="input scroll-thin resize-none py-2.5 leading-relaxed"
          style={{ maxHeight: 160 }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="btn-primary h-[42px] w-[42px] flex-shrink-0 p-0"
          aria-label="Send"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <p className="mt-1.5 text-center text-[10px] text-gray-400">
        Nova can make mistakes. Please verify important info at novamart.example.
      </p>
    </div>
  );
};

export default ChatInput;
