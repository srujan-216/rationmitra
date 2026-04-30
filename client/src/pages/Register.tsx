import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

type Role = 'cardholder' | 'shopowner';

const ROLES: { id: Role; label: string; sublabel: string; accent: string; icon: JSX.Element }[] = [
  {
    id: 'cardholder',
    label: 'Cardholder',
    sublabel: 'Book slots, collect ration',
    accent: 'from-emerald-500 to-green-600',
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
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l2-5h14l2 5M3 9h18M3 9v11a1 1 0 001 1h4v-6h8v6h4a1 1 0 001-1V9" />
      </svg>
    ),
  },
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('cardholder');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const current = ROLES.find((r) => r.id === role)!;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit phone number';
    if (form.password.length < 8 || !/\d/.test(form.password)) errs.password = 'Min 8 chars with a number';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ ...form, role });
      toast.success(`Welcome to RationMitra, ${form.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-indigo-900">
        <div className="absolute -top-24 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-emerald-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border border-white/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7l1-3h14l1 3M4 7h16M4 7v13a1 1 0 001 1h14a1 1 0 001-1V7M9 11h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">RationMitra</h1>
              <p className="text-white/70 text-sm">Smart PDS for Digital Bharat</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              Join the future of<br />
              <span className="text-emerald-300">ration distribution.</span>
            </h2>
            <p className="text-white/80 text-lg max-w-md">
              Register in minutes. Book slots from your phone. Skip the queue. Track everything.
            </p>

            <div className="space-y-3 pt-4 max-w-md">
              {[
                'Nearby FPS shops sorted by distance',
                'Real-time queue with live position updates',
                'Secure face-based identity verification',
                'Bilingual support — English & हिंदी',
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-3 text-white/90">
                  <div className="w-6 h-6 bg-emerald-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 text-emerald-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-white/60">
            Government of Telangana · Civil Supplies Department
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-3xl font-bold text-primary-700">RationMitra</h1>
            <p className="text-gray-500 text-sm mt-1">Create your account</p>
          </div>

          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">Create an account</h2>
            <p className="text-gray-500 text-sm mt-1">Get started in less than a minute</p>
          </div>

          {/* Role toggle */}
          <div className="grid grid-cols-2 gap-2 mb-5 p-1.5 bg-gray-100 rounded-xl">
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

          <p className="text-xs text-gray-500 mb-5 text-center">
            Registering as <span className="font-semibold text-gray-700">{current.label}</span> — {current.sublabel}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Your full name"
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit number"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition ${errors.phone ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="Min 8 characters with a number"
                  className={`w-full px-4 pr-11 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
                placeholder="Repeat password"
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition ${errors.confirmPassword ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
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
                  Creating account…
                </span>
              ) : (
                `Create ${current.label} account`
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
