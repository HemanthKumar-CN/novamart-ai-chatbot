import ReactMarkdown from 'react-markdown';

const formatTime = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      {!isUser && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-sm font-bold shadow-sm">
          N
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
          isUser
            ? 'rounded-br-sm bg-brand-600 text-white'
            : 'rounded-bl-sm bg-white border border-gray-200 text-gray-900'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-strong:text-gray-900 prose-a:text-brand-600">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        <div
          className={`mt-1 text-[10px] ${
            isUser ? 'text-brand-100' : 'text-gray-400'
          }`}
        >
          {formatTime(message.createdAt || new Date().toISOString())}
        </div>
      </div>
      {isUser && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700 text-sm font-bold">
          {(message._senderName || 'You').charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
