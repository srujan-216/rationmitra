import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link to={to} className="block hover:text-primary-200 transition text-sm py-1" onClick={() => setMobileOpen(false)}>
      {children}
    </Link>
  );

  return (
    <nav className="bg-primary-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="text-xl font-bold tracking-wide">
            RationMitra
          </Link>

          {/* Mobile toggle */}
          {user && (
            <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          )}

          {/* Desktop nav */}
          {user && (
            <div className="hidden md:flex items-center gap-5">
              <NavLink to="/dashboard">{t('dashboard')}</NavLink>

              {user.role === 'cardholder' && (
                <>
                  <NavLink to="/book-slot">{t('bookSlot')}</NavLink>
                  <NavLink to="/my-bookings">{t('myBookings')}</NavLink>
                  <NavLink to="/face-enroll">{t('faceEnroll')}</NavLink>
                  <NavLink to="/submit-feedback">{t('feedback')}</NavLink>
                </>
              )}

              {(user.role === 'shopowner' || user.role === 'admin') && (
                <>
                  <NavLink to="/queue-manage">{t('queueManagement')}</NavLink>
                  <NavLink to="/inventory">{t('inventory')}</NavLink>
                  <NavLink to="/stock-forecast">{t('stockForecast')}</NavLink>
                  <NavLink to="/face-verify">{t('faceVerify')}</NavLink>
                  <NavLink to="/demand-prediction">{t('demandPrediction')}</NavLink>
                  <NavLink to="/feedback-view">{t('feedback')}</NavLink>
                </>
              )}

              {(user.role === 'admin' || user.role === 'sysadmin') && (
                <>
                  <NavLink to="/admin">{t('adminDashboard')}</NavLink>
                  <NavLink to="/fraud-alerts">{t('fraudAlerts')}</NavLink>
                </>
              )}

              <div className="flex items-center gap-3 ml-3 pl-3 border-l border-primary-500">
                <Link to="/notifications" className="hover:text-primary-200 transition text-sm">
                  {t('notifications')}
                </Link>
                <button
                  onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                  className="bg-primary-600 hover:bg-primary-500 px-2.5 py-1 rounded-full text-xs font-bold transition"
                  title={t('language')}
                >
                  {language === 'en' ? '\u0939\u093F' : 'EN'}
                </button>
                <button onClick={toggleTheme}
                  className="bg-primary-600 hover:bg-primary-500 px-2.5 py-1 rounded-full text-sm transition"
                  title={theme === 'light' ? 'Dark mode' : 'Light mode'}>
                  {theme === 'light' ? '\u263E' : '\u2600'}
                </button>
                <span className="text-sm text-primary-200">{user.name}</span>
                <button onClick={handleLogout}
                  className="bg-primary-800 hover:bg-primary-900 px-3 py-1.5 rounded text-sm transition">
                  {t('logout')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile nav */}
        {user && mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <NavLink to="/dashboard">{t('dashboard')}</NavLink>

            {user.role === 'cardholder' && (
              <>
                <NavLink to="/book-slot">{t('bookSlot')}</NavLink>
                <NavLink to="/my-bookings">{t('myBookings')}</NavLink>
                <NavLink to="/face-enroll">{t('faceEnroll')}</NavLink>
                <NavLink to="/submit-feedback">{t('feedback')}</NavLink>
              </>
            )}

            {(user.role === 'shopowner' || user.role === 'admin') && (
              <>
                <NavLink to="/queue-manage">{t('queueManagement')}</NavLink>
                <NavLink to="/inventory">{t('inventory')}</NavLink>
                <NavLink to="/stock-forecast">{t('stockForecast')}</NavLink>
                <NavLink to="/face-verify">{t('faceVerify')}</NavLink>
                <NavLink to="/demand-prediction">{t('demandPrediction')}</NavLink>
                <NavLink to="/feedback-view">{t('feedback')}</NavLink>
              </>
            )}

            {(user.role === 'admin' || user.role === 'sysadmin') && (
              <>
                <NavLink to="/admin">{t('adminDashboard')}</NavLink>
                <NavLink to="/fraud-alerts">{t('fraudAlerts')}</NavLink>
              </>
            )}

            <NavLink to="/notifications">{t('notifications')}</NavLink>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                className="bg-primary-600 hover:bg-primary-500 px-3 py-1.5 rounded text-sm transition">
                {language === 'en' ? '\u0939\u093F Hindi' : 'EN English'}
              </button>
              <button onClick={toggleTheme}
                className="bg-primary-600 hover:bg-primary-500 px-3 py-1.5 rounded text-sm transition">
                {theme === 'light' ? '\u263E Dark' : '\u2600 Light'}
              </button>
            </div>
            <button onClick={handleLogout}
              className="w-full text-left bg-primary-800 hover:bg-primary-900 px-3 py-1.5 rounded text-sm transition">
              {t('logout')} ({user.name})
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
