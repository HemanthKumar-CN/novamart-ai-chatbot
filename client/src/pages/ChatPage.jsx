import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';

const ChatPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  // Close profile menu on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Load conversation list on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get('/chat/conversations');
        if (cancelled) return;
        setConversations(data.conversations || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || 'Failed to load conversations.');
        }
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectConversation = async (id) => {
    if (id === currentId) {
      setSidebarOpen(false);
      return;
    }
    setCurrentId(id);
    setMessages([]);
    setLoadingChat(true);
    setError('');
    setSidebarOpen(false);
    try {
      const { data } = await api.get(`/chat/conversations/${id}`);
      setMessages(data.conversation?.messages || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load conversation.');
    } finally {
      setLoadingChat(false);
    }
  };

  const startNewChat = () => {
    setCurrentId(null);
    setMessages([]);
    setError('');
    setSidebarOpen(false);
  };

  const sendMessage = async (text) => {
    setError('');
    const userMsg = {
      _id: `tmp-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const { data } = await api.post('/chat/send', {
        conversationId: currentId,
        message: text,
      });

      setCurrentId(data.conversationId);
      setMessages(data.messages || []);

      // Refresh sidebar list (to show new conversation at top / new title)
      try {
        const list = await api.get('/chat/conversations');
        setConversations(list.data.conversations || []);
      } catch {
        /* non-fatal */
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send message. Please try again.';
      setError(msg);
      // Remove the optimistic message on error
      setMessages((prev) => prev.filter((m) => m._id !== userMsg._id));
    } finally {
      setIsTyping(false);
    }
  };

  const deleteConversation = async (id) => {
    try {
      await api.delete(`/chat/conversations/${id}`);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (currentId === id) {
        setCurrentId(null);
        setMessages([]);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete conversation.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const hasStarted = messages.length > 0;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <Sidebar
        conversations={conversations}
        currentId={currentId}
        onSelect={selectConversation}
        onNew={startNewChat}
        onDelete={deleteConversation}
        loading={loadingList}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 md:hidden"
              aria-label="Open sidebar"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-sm">
                <svg viewBox="0 0 64 64" className="h-5 w-5" fill="none">
                  <path d="M16 44 L24 28 L32 36 L40 20 L48 44 Z" fill="#fff" />
                  <circle cx="44" cy="22" r="3" fill="#fff" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Nova</p>
                <p className="text-[10px] text-gray-500">NovaMart AI Support</p>
              </div>
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full bg-gray-100 px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </span>
              <span className="hidden sm:block">{user?.name || 'Account'}</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-40">
                <div className="border-b border-gray-100 px-3 py-2">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="truncate text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Error banner */}
        {error && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
            <button
              onClick={() => setError('')}
              className="float-right text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Chat area */}
        <div className="flex min-h-0 flex-1 flex-col">
          {loadingChat ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
            </div>
          ) : (
            <ChatWindow
              messages={messages}
              isTyping={isTyping}
              onSuggestion={sendMessage}
              hasStarted={hasStarted}
            />
          )}

          <ChatInput onSend={sendMessage} disabled={isTyping} />
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
