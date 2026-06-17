const TypingIndicator = () => (
  <div className="flex items-end gap-2 animate-fade-in">
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-sm font-bold">
      N
    </div>
    <div className="rounded-2xl rounded-bl-sm bg-white border border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-1">
        <span
          className="h-2 w-2 rounded-full bg-gray-400 animate-bounce-dot"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="h-2 w-2 rounded-full bg-gray-400 animate-bounce-dot"
          style={{ animationDelay: '200ms' }}
        />
        <span
          className="h-2 w-2 rounded-full bg-gray-400 animate-bounce-dot"
          style={{ animationDelay: '400ms' }}
        />
      </div>
    </div>
  </div>
);

export default TypingIndicator;
