const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

const Sidebar = ({ conversations, currentId, onSelect, onNew, onDelete, loading, open, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-gray-200 bg-gray-50 transition-transform duration-200 md:relative md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-800">
              <svg viewBox="0 0 64 64" className="h-5 w-5" fill="none">
                <path d="M16 44 L24 28 L32 36 L40 20 L48 44 Z" fill="#fff" />
                <circle cx="44" cy="22" r="3" fill="#fff" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">NovaMart</p>
              <p className="text-[10px] text-gray-500">AI Support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 md:hidden"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <button onClick={onNew} className="btn-primary m-3 justify-center">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New chat
        </button>

        <div className="flex-1 overflow-y-auto scroll-thin px-2 pb-2">
          {loading ? (
            <div className="space-y-2 px-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-gray-400">
              No conversations yet.
              <br />
              Start a new chat!
            </div>
          ) : (
            <ul className="space-y-1">
              {conversations.map((c) => (
                <li key={c._id} className="group relative">
                  <button
                    onClick={() => onSelect(c._id)}
                    className={`flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left text-sm transition ${
                      currentId === c._id
                        ? 'bg-brand-100 text-brand-900'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="line-clamp-1 w-full text-xs font-medium">
                      {c.title || 'New conversation'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {formatDate(c.updatedAt)}
                    </span>
                  </button>
                  {currentId === c._id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this conversation?')) onDelete(c._id);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 opacity-0 hover:bg-red-100 hover:text-red-600 group-hover:opacity-100"
                      aria-label="Delete conversation"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                      </svg>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
