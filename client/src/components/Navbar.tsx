import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

type NavItem = { to: string; label: string; icon: JSX.Element };

const ICON = {
  home: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10" />,
  card: <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h.01M11 15h2M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3M16 7V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  bookings: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h6M5 8l.5-3h13L19 8M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7M5 12h14" />,
  queue: <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h13M8 18h13M8 6h13M3 6h.01M3 12h.01M3 18h.01" />,
  inventory: <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
  chart: <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 17l4-4 4 4 5-5" />,
  users: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 014-4h4a4 4 0 014 4v2h-1M16 7a4 4 0 11-8 0 4 4 0 018 0z" />,
  shield: <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />,
  box: <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />,
  flag: <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V4m0 0h14l-2 4 2 4H3" />,
  bell: <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14V11a6 6 0 10-12 0v3a2 2 0 01-.6 1.6L4 17h5m6 0a3 3 0 11-6 0" />,
  more: <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01" />,
};

const sIcon = (path: JSX.Element) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    {path}
  </svg>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const moreRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetch = () => {
      api.get('/notifications/unread-count')
        .then(({ data }) => setUnreadCount(data.unreadCount || 0))
        .catch(() => {});
    };
    fetch();
    const id = setInterval(fetch, 30000);
    return () => clearInterval(id);
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  /* ---------- Primary + secondary menus per role ---------- */
  let primary: NavItem[] = [];
  let secondary: NavItem[] = [];

  if (user?.role === 'cardholder') {
    // Keep cardholder menu minimal — only 3 main items
    primary = [
      { to: '/dashboard', label: t('dashboard'), icon: sIcon(ICON.home) },
      { to: '/book-slot', label: t('bookSlot'), icon: sIcon(ICON.calendar) },
      { to: '/my-bookings', label: t('myBookings'), icon: sIcon(ICON.bookings) },
    ];
    secondary = [
      { to: '/my-ration-card', label: 'Ration Card', icon: sIcon(ICON.card) },
      { to: '/distribution-history', label: 'History', icon: sIcon(ICON.chart) },
      { to: '/face-enroll', label: 'Face ID', icon: sIcon(ICON.shield) },
      { to: '/submit-feedback', label: t('feedback'), icon: sIcon(ICON.chart) },
      { to: '/file-grievance', label: 'File Grievance', icon: sIcon(ICON.flag) },
      { to: '/my-grievances', label: 'My Grievances', icon: sIcon(ICON.flag) },
    ];
  } else if (user?.role === 'shopowner') {
    primary = [
      { to: '/dashboard', label: t('dashboard'), icon: sIcon(ICON.home) },
      { to: '/queue-manage', label: 'Queue', icon: sIcon(ICON.queue) },
      { to: '/record-distribution', label: 'Distribute', icon: sIcon(ICON.box) },
      { to: '/inventory', label: t('inventory'), icon: sIcon(ICON.inventory) },
    ];
    secondary = [
      { to: '/shop-allocation', label: 'Allocation', icon: sIcon(ICON.box) },
      { to: '/stock-forecast', label: 'Stock Forecast', icon: sIcon(ICON.chart) },
      { to: '/face-verify', label: 'Face Verify', icon: sIcon(ICON.shield) },
      { to: '/feedback-view', label: 'Feedback', icon: sIcon(ICON.chart) },
      { to: '/demand-prediction', label: 'Demand Prediction', icon: sIcon(ICON.chart) },
    ];
  } else if (user?.role === 'admin' || user?.role === 'sysadmin') {
    primary = [
      { to: '/dashboard', label: 'Analytics', icon: sIcon(ICON.chart) },
      { to: '/ration-card-management', label: 'Cards', icon: sIcon(ICON.card) },
      { to: '/grievance-management', label: 'Grievances', icon: sIcon(ICON.flag) },
      { to: '/fraud-alerts', label: 'Fraud', icon: sIcon(ICON.shield) },
    ];
    secondary = [
      { to: '/officer-dashboard', label: 'Officer View', icon: sIcon(ICON.users) },
      { to: '/family-requests', label: 'Family Requests', icon: sIcon(ICON.users) },
      { to: '/allocation-management', label: 'Allocations', icon: sIcon(ICON.box) },
      { to: '/queue-manage', label: 'Queues', icon: sIcon(ICON.queue) },
      { to: '/inventory', label: 'Inventory', icon: sIcon(ICON.inventory) },
    ];
  }

  const isActive = (to: string) => location.pathname === to;

  const roleAccent: Record<string, string> = {
    cardholder: 'from-emerald-500 to-green-600',
    shopowner: 'from-amber-500 to-orange-600',
    admin: 'from-indigo-500 to-blue-700',
    sysadmin: 'from-purple-600 to-indigo-800',
  };
  const roleLabel: Record<string, string> = {
    cardholder: 'Cardholder',
    shopowner: 'Shop Owner',
    admin: 'Admin',
    sysadmin: 'System Admin',
  };

  if (!user) {
    // Unauthenticated navbar — simple brand only
    return (
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary-700">RationMitra</Link>
          <div className="flex gap-2">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 rounded-lg transition">Sign in</Link>
            <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition">Sign up</Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${roleAccent[user.role] || 'from-primary-600 to-indigo-700'} flex items-center justify-center shadow-sm`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7l1-3h14l1 3M4 7h16M4 7v13a1 1 0 001 1h14a1 1 0 001-1V7M9 11h6" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">RationMitra</span>
          </Link>

          {/* Primary nav (desktop) */}
          <div className="hidden lg:flex items-center gap-1">
            {primary.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive(item.to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            {secondary.length > 0 && (
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    moreOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  More
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {moreOpen && (
                  <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {secondary.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm transition ${
                          isActive(item.to) ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side: notifications + user menu */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              to="/notifications"
              className={`relative p-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition ${
                isActive('/notifications') ? 'bg-primary-50 text-primary-700' : ''
              }`}
              title={t('notifications')}
              onClick={() => setUnreadCount(0)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                {ICON.bell}
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-gray-50 transition"
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleAccent[user.role] || 'from-primary-600 to-indigo-700'} flex items-center justify-center text-white text-sm font-semibold`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-sm font-medium text-gray-900 leading-none">{user.name.split(' ')[0]}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{roleLabel[user.role]}</p>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  <div className={`px-4 py-3 bg-gradient-to-br ${roleAccent[user.role]} text-white`}>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-white/80 mt-0.5">{user.email}</p>
                    <span className="inline-block mt-2 text-xs bg-white/20 backdrop-blur px-2 py-0.5 rounded-full font-medium">
                      {roleLabel[user.role]}
                    </span>
                  </div>
                  <div className="p-2">
                    <div className="px-3 py-2">
                      <p className="text-xs text-gray-500 mb-1.5">Language</p>
                      <div className="flex gap-1">
                        {(['en', 'hi', 'te'] as const).map((lang) => (
                          <button
                            key={lang}
                            onClick={() => { setLanguage(lang); setUserMenuOpen(false); }}
                            className={`flex-1 py-1 text-xs font-mono rounded transition ${
                              language === lang
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {lang === 'en' ? 'EN' : lang === 'hi' ? 'हि' : 'తె'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => { toggleTheme(); setUserMenuOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                    >
                      <span>Theme</span>
                      <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {theme === 'light' ? '☀ Light' : '☾ Dark'}
                      </span>
                    </button>
                  </div>
                  <div className="border-t border-gray-100 p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {t('logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-100">
            <div className="pt-4 pb-2">
              <div className="flex items-center gap-3 px-2 mb-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleAccent[user.role]} flex items-center justify-center text-white font-semibold`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{roleLabel[user.role]}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              {[...primary, ...secondary].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                    isActive(item.to)
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <Link
                to="/notifications"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  isActive('/notifications') ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setUnreadCount(0)}
              >
                <div className="relative">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    {ICON.bell}
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                {t('notifications')}
                {unreadCount > 0 && (
                  <span className="ml-auto text-xs font-semibold text-white bg-red-500 rounded-full px-1.5 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>

            <div className="border-t border-gray-100 mt-3 pt-3 space-y-1">
              <div className="px-3 py-2">
                <p className="text-xs text-gray-500 mb-1.5">Language</p>
                <div className="flex gap-1">
                  {(['en', 'hi', 'te'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`flex-1 py-1 text-xs font-mono rounded transition ${
                        language === lang
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {lang === 'en' ? 'EN' : lang === 'hi' ? 'हि' : 'తె'}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <span>Theme</span>
                <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">
                  {theme === 'light' ? '☀ Light' : '☾ Dark'}
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t('logout')}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
