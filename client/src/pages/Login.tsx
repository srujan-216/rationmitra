import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

type Role = 'cardholder' | 'shopowner' | 'admin';

const ROLES: { id: Role; label: string; sublabel: string; icon: JSX.Element; accent: string; demo: string }[] = [
  {
    id: 'cardholder',
    label: 'Cardholder',
    sublabel: 'Book slots, collect ration',
    accent: 'from-emerald-500 to-green-600',
    demo: 'user1@rationmitra.in',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 'shopowner',
    label: 'Shop Owner',
    sublabel: 'Manage FPS, distribute ration',
    accent: 'from-amber-500 to-orange-600',
    demo: 'ramesh@rationmitra.in',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l2-5h14l2 5M3 9h18M3 9v11a1 1 0 001 1h4v-6h8v6h4a1 1 0 001-1V9" />
      </svg>
    ),
  },
  {
    id: 'admin',
    label: 'Admin',
    sublabel: 'Oversight, analytics, audit',
    accent: 'from-indigo-500 to-blue-700',
    demo: 'admin@rationmitra.in',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('cardholder');
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const current = ROLES.find((r) => r.id === role)!;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success(`Welcome back, ${current.label}!`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const useDemo = () => {
    setForm({ email: current.demo, password: 'password123' });
    toast.success(`Demo credentials filled for ${current.label}`);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left: Brand / illustration panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-indigo-900">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-emerald-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-64 h-64 bg-amber-300/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border border-white/30">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7l1-3h14l1 3M4 7h16M4 7v13a1 1 0 001 1h14a1 1 0 001-1V7M9 11h6" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">RationMitra</h1>
                <p className="text-white/70 text-sm">Smart PDS for Digital Bharat</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              Fair distribution.<br />
              <span className="text-emerald-300">Zero queues.</span><br />
              <span className="text-amber-300">Full transparency.</span>
            </h2>
            <p className="text-white/80 text-lg max-w-md">
              AI-powered Public Distribution System trusted by cardholders, shop owners, and civil supplies officers across Telangana.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-6">
              {[
                { k: '60+', v: 'FPS Shops' },
                { k: '3 km', v: 'Nearby radius' },
                { k: '< 5 min', v: 'Avg wait' },
              ].map((stat) => (
                <div key={stat.v} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white">{stat.k}</div>
                  <div className="text-xs text-white/70 mt-1">{stat.v}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-6 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                AES-256 Secure
              </div>
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Real-time queue
              </div>
            </div>
          </div>

          <div className="text-xs text-white/60">
            Government of Telangana · Civil Supplies Department
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-3xl font-bold text-primary-700">RationMitra</h1>
            <p className="text-gray-500 text-sm mt-1">Smart PDS for Digital Bharat</p>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1">Select your role and sign in to continue</p>
          </div>

          {/* Role toggle */}
          <div className="grid grid-cols-3 gap-2 mb-6 p-1.5 bg-gray-100 rounded-xl">
            {ROLES.map((r) => {
              const isActive = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`relative flex flex-col items-center gap-1 py-3 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? `bg-gradient-to-br ${r.accent} text-white shadow-lg scale-[1.02]`
                      : 'text-gray-600 hover:bg-white hover:text-gray-900'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-gray-500'}>{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Role description */}
          <div className={`mb-5 px-4 py-3 rounded-xl bg-gradient-to-r ${current.accent} bg-opacity-10 border border-gray-200`}>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-700 font-medium">{current.label}:</span>
              <span className="text-gray-500">{current.sublabel}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.9 5.3a2 2 0 002.2 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <button type="button" className="text-xs text-primary-600 hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-6V4a6 6 0 00-12 0v1H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2h-1zm-10 0V4a4 4 0 018 0v1H8z" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className={`w-full pl-11 pr-11 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10 10 0 0112 4c5 0 9.3 3.1 11 8-1 2.8-2.8 5.1-5.3 6.6M6.2 6.2A11.2 11.2 0 001 12c1.7 4.9 6 8 11 8 2 0 3.8-.5 5.4-1.3" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r ${current.accent} text-white font-semibold py-3 rounded-xl transition-all hover:shadow-lg hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                `Sign in as ${current.label}`
              )}
            </button>
          </form>

          {/* Demo credentials helper */}
          <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1 text-xs">
                <div className="font-semibold text-blue-900 mb-1">Demo account for {current.label}</div>
                <div className="text-blue-800/80 font-mono">{current.demo}</div>
                <div className="text-blue-800/80 font-mono">password123</div>
                <button
                  type="button"
                  onClick={useDemo}
                  className="mt-2 text-blue-700 font-semibold hover:underline"
                >
                  Use demo credentials →
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            New to RationMitra?{' '}
            <Link to="/register" className="text-primary-600 hover:underline font-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
