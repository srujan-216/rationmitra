import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
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
              <NavLink to="/dashboard">Dashboard</NavLink>

              {user.role === 'cardholder' && (
                <>
                  <NavLink to="/book-slot">Book Slot</NavLink>
                  <NavLink to="/my-bookings">My Bookings</NavLink>
                  <NavLink to="/face-enroll">Face ID</NavLink>
                  <NavLink to="/submit-feedback">Feedback</NavLink>
                </>
              )}

              {(user.role === 'shopowner' || user.role === 'admin') && (
                <>
                  <NavLink to="/queue-manage">Queue</NavLink>
                  <NavLink to="/inventory">Inventory</NavLink>
                  <NavLink to="/stock-forecast">Forecast</NavLink>
                  <NavLink to="/face-verify">Verify</NavLink>
                  <NavLink to="/demand-prediction">Predictions</NavLink>
                  <NavLink to="/feedback-view">Feedback</NavLink>
                </>
              )}

              {(user.role === 'admin' || user.role === 'sysadmin') && (
                <>
                  <NavLink to="/admin">Admin</NavLink>
                  <NavLink to="/fraud-alerts">Alerts</NavLink>
                </>
              )}

              <div className="flex items-center gap-3 ml-3 pl-3 border-l border-primary-500">
                <Link to="/notifications" className="hover:text-primary-200 transition text-sm">
                  Notifications
                </Link>
                <span className="text-sm text-primary-200">{user.name}</span>
                <button onClick={handleLogout}
                  className="bg-primary-800 hover:bg-primary-900 px-3 py-1.5 rounded text-sm transition">
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile nav */}
        {user && mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <NavLink to="/dashboard">Dashboard</NavLink>

            {user.role === 'cardholder' && (
              <>
                <NavLink to="/book-slot">Book Slot</NavLink>
                <NavLink to="/my-bookings">My Bookings</NavLink>
                <NavLink to="/face-enroll">Face ID</NavLink>
                <NavLink to="/submit-feedback">Feedback</NavLink>
              </>
            )}

            {(user.role === 'shopowner' || user.role === 'admin') && (
              <>
                <NavLink to="/queue-manage">Queue</NavLink>
                <NavLink to="/inventory">Inventory</NavLink>
                <NavLink to="/stock-forecast">Forecast</NavLink>
                <NavLink to="/face-verify">Verify</NavLink>
                <NavLink to="/demand-prediction">Predictions</NavLink>
                <NavLink to="/feedback-view">Feedback</NavLink>
              </>
            )}

            {(user.role === 'admin' || user.role === 'sysadmin') && (
              <>
                <NavLink to="/admin">Admin</NavLink>
                <NavLink to="/fraud-alerts">Alerts</NavLink>
              </>
            )}

            <NavLink to="/notifications">Notifications</NavLink>
            <button onClick={handleLogout}
              className="w-full text-left bg-primary-800 hover:bg-primary-900 px-3 py-1.5 rounded text-sm transition">
              Logout ({user.name})
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
