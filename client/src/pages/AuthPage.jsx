import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NovaMartLogo = () => (
  <div className="flex items-center justify-center gap-2">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 shadow-md">
      <svg viewBox="0 0 64 64" className="h-6 w-6" fill="none">
        <path d="M16 44 L24 28 L32 36 L40 20 L48 44 Z" fill="#fff" />
        <circle cx="44" cy="22" r="3" fill="#fff" />
      </svg>
    </div>
    <span className="text-2xl font-extrabold tracking-tight text-gray-900">
      Nova<span className="text-brand-600">Mart</span>
    </span>
  </div>
);

const AuthPage = () => {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { signup, login, loading, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate('/chat', { replace: true });
  }, [token, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (tab === 'signup') {
        await signup(form.name, form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
      navigate('/chat', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
          {/* Left: marketing */}
          <div className="hidden flex-col justify-center md:flex">
            <NovaMartLogo />
            <h1 className="mt-8 text-4xl font-extrabold leading-tight text-gray-900 lg:text-5xl">
              Hi, I'm <span className="text-brand-600">Nova</span>.
              <br />
              Your NovaMart support agent.
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Ask me anything about orders, returns, shipping, warranty, or
              payments. I'm here 24/7.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-gray-700">
              {[
                '📦  Track an order or get delivery updates',
                '🔄  30-day returns & refunds',
                '🛡️  Warranty & defective-item help',
                '💳  Payments, promos & account support',
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: auth card */}
          <div className="flex flex-col justify-center">
            <div className="mb-6 flex justify-center md:hidden">
              <NovaMartLogo />
            </div>
            <div className="card mx-auto w-full max-w-md p-8">
              <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
                {['login', 'signup'].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTab(t);
                      setError('');
                    }}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold capitalize transition ${
                      tab === t
                        ? 'bg-white text-brand-700 shadow'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t === 'login' ? 'Log in' : 'Sign up'}
                  </button>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                {tab === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {tab === 'login'
                  ? 'Log in to chat with Nova'
                  : 'Sign up to start chatting — it only takes a minute'}
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {tab === 'signup' && (
                  <div>
                    <label className="label" htmlFor="name">
                      Full name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={handleChange}
                      className="input"
                      placeholder="Jane Doe"
                    />
                  </div>
                )}

                <div>
                  <label className="label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    className="input"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    value={form.password}
                    onChange={handleChange}
                    className="input"
                    placeholder="At least 6 characters"
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading
                    ? 'Please wait...'
                    : tab === 'login'
                    ? 'Log in'
                    : 'Create account'}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-gray-400">
                By continuing you agree to NovaMart's Terms & Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
