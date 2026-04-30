import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import AdminDashboard from './AdminDashboard';

/* =====================================================================
 *  Shared card component
 * ===================================================================== */
const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  gradient,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: JSX.Element;
  gradient: string;
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1 leading-none">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
      </div>
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white flex-shrink-0 shadow-md`}>
        {icon}
      </div>
    </div>
  </div>
);

/* =====================================================================
 *  CARDHOLDER — simplified, action-focused
 * ===================================================================== */
const CardholderDashboard = () => {
  const { user } = useAuth();
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [totalBookings, setTotalBookings] = useState(0);

  useEffect(() => {
    api.get('/queue/my-bookings').then(({ data }) => {
      const bookings = data.bookings || [];
      setTotalBookings(bookings.length);
      const active = bookings.find(
        (b: any) => b.status === 'waiting' || b.status === 'in_service'
      );
      setActiveBooking(active || null);
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Active booking banner (only if one exists) */}
      {activeBooking && (
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-medium text-white/80">
                  {activeBooking.status === 'in_service' ? 'You are being served!' : 'Upcoming booking'}
                </span>
              </div>
              <h2 className="text-2xl font-bold">
                Ticket {activeBooking.ticketNumber}
              </h2>
              <p className="text-white/90 mt-1">
                {activeBooking.shop?.name} · {activeBooking.slot?.startTime}–{activeBooking.slot?.endTime}
              </p>
              {activeBooking.position != null && activeBooking.position > 0 && (
                <p className="text-white/80 text-sm mt-2">
                  Position in queue: <span className="font-bold">{activeBooking.position}</span>
                </p>
              )}
            </div>
            <Link
              to="/my-bookings"
              className="bg-white text-emerald-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-white/90 transition"
            >
              View Details →
            </Link>
          </div>
        </div>
      )}

      {/* Primary actions — large, obvious */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link
          to="/book-slot"
          className="group relative overflow-hidden bg-gradient-to-br from-primary-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
        >
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3M16 7V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold">Book a Slot</h3>
            <p className="text-white/80 mt-1">
              Find the nearest FPS shop and reserve your time
            </p>
            <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold group-hover:gap-2 transition-all">
              Get started →
            </span>
          </div>
        </Link>

        <Link
          to="/my-bookings"
          className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
        >
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h6M9 19h6M12 3v18M5 12h14M5 8l.5-3h13L19 8M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold">My Bookings</h3>
            <p className="text-white/80 mt-1">
              {totalBookings > 0 ? `${totalBookings} booking${totalBookings > 1 ? 's' : ''} so far` : 'View your history'}
            </p>
            <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold group-hover:gap-2 transition-all">
              View all →
            </span>
          </div>
        </Link>
      </div>

      {/* Quick links — compact row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/my-ration-card', label: 'My Ration Card', icon: 'M3 10h18M7 15h.01M11 15h2M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { to: '/distribution-history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { to: '/submit-feedback', label: 'Give Feedback', icon: 'M7 8h10M7 12h6M12 20l-5-3H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2l-5 3z' },
          { to: '/file-grievance', label: 'File Grievance', icon: 'M12 9v4m0 4h.01M10.3 3.9L2.4 18a1.8 1.8 0 001.6 2.7h16a1.8 1.8 0 001.6-2.7L13.7 3.9a1.8 1.8 0 00-3.4 0z' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary-300 hover:shadow-sm transition text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">{item.label}</p>
          </Link>
        ))}
      </div>

      {/* Info strip */}
      {user?.rationCardNumber && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 text-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-blue-600 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-blue-900">
            Your ration card number is <span className="font-mono font-semibold">{user.rationCardNumber}</span>
          </span>
        </div>
      )}
    </div>
  );
};

/* =====================================================================
 *  SHOP OWNER — rich metrics
 * ===================================================================== */
type ShopDashData = {
  shop: { _id: string; name: string; code: string; address: any; rating: number; totalRatings: number };
  today: {
    totalBookings: number;
    waiting: number;
    inService: number;
    completed: number;
    noShow: number;
    avgServiceTime: number;
    capacityUsed: number;
  };
  inventory: {
    itemCount: number;
    lowStockCount: number;
    totalCurrentStock: number;
    items: { itemName: string; currentStock: number; unit: string; reorderLevel: number; isLowStock: boolean; fillPercent: number }[];
  };
  allocation: null | {
    status: string;
    totalAllocated: number;
    totalReceived: number;
    percentReceived: number;
    commodities: { name: string; allocatedQty: number; receivedQty: number; rate: number }[];
  };
  month: { distributionsCount: number; uniqueFamiliesServed: number; totalRevenue: number };
  recentFeedbacks: { _id: string; rating: number; textFeedback?: string; sentiment?: string; createdAt: string }[];
};

const ShopOwnerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ShopDashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const shopId = user?.shopAssignedTo;
    if (!shopId) {
      setLoading(false);
      return;
    }
    api.get(`/analytics/shop-dashboard/${shopId}`)
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">Loading your shop metrics…</div>
    );
  }

  if (!data) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800">
        No shop assigned to your account. Please contact the administrator.
      </div>
    );
  }

  const { shop, today, inventory, allocation, month, recentFeedbacks } = data;
  const allocationStatusColors: Record<string, string> = {
    received: 'text-emerald-700 bg-emerald-100',
    partially_received: 'text-amber-700 bg-amber-100',
    dispatched: 'text-blue-700 bg-blue-100',
    planned: 'text-gray-700 bg-gray-100',
    discrepancy: 'text-red-700 bg-red-100',
  };

  return (
    <div className="space-y-6">
      {/* Shop info hero */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm text-white/80 font-medium">Fair Price Shop</p>
            <h2 className="text-2xl font-bold mt-1">{shop.name}</h2>
            <p className="text-white/90 text-sm mt-1">
              {shop.code} · {shop.address?.city}, {shop.address?.pincode}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-amber-200">
                <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
              </svg>
              <span className="text-2xl font-bold">{shop.rating?.toFixed(1) || '—'}</span>
            </div>
            <p className="text-xs text-white/70 mt-0.5">{shop.totalRatings || 0} ratings</p>
          </div>
        </div>
      </div>

      {/* Today's metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="inline-block w-1 h-6 bg-primary-600 rounded-full" />
          Today's Activity
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard
            title="Bookings"
            value={today.totalBookings}
            gradient="from-blue-500 to-indigo-600"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3M16 7V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
          />
          <MetricCard
            title="Waiting"
            value={today.waiting}
            gradient="from-amber-500 to-orange-500"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          />
          <MetricCard
            title="In Service"
            value={today.inService}
            gradient="from-purple-500 to-indigo-600"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}
          />
          <MetricCard
            title="Served Today"
            value={today.completed}
            subtitle={today.avgServiceTime ? `Avg ${today.avgServiceTime} min` : undefined}
            gradient="from-emerald-500 to-green-600"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          />
          <MetricCard
            title="No Shows"
            value={today.noShow}
            gradient="from-gray-500 to-slate-600"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>}
          />
          <MetricCard
            title="Capacity Used"
            value={`${today.capacityUsed}%`}
            gradient="from-rose-500 to-pink-600"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 17l4-4 4 4 5-5"/></svg>}
          />
        </div>
      </div>

      {/* Monthly snapshot + Allocation status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly metrics */}
        <MetricCard
          title="Distributions This Month"
          value={month.distributionsCount}
          subtitle={`${month.uniqueFamiliesServed} unique families`}
          gradient="from-teal-500 to-cyan-600"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>}
        />
        <MetricCard
          title="Revenue This Month"
          value={`₹${month.totalRevenue.toLocaleString('en-IN')}`}
          subtitle="From distributed commodities"
          gradient="from-green-500 to-emerald-600"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.7 0-3 1-3 2.3s1.3 2.3 3 2.3 3 1 3 2.3S13.7 17 12 17m0-9V5m0 12v3"/></svg>}
        />
        <MetricCard
          title="Low Stock Items"
          value={inventory.lowStockCount}
          subtitle={`of ${inventory.itemCount} total items`}
          gradient="from-red-500 to-rose-600"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9L2.4 18a1.8 1.8 0 001.6 2.7h16a1.8 1.8 0 001.6-2.7L13.7 3.9a1.8 1.8 0 00-3.4 0z"/></svg>}
        />
      </div>

      {/* Allocation + Stock levels */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Allocation status — 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Allocation</h3>
            {allocation && (
              <span className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide ${allocationStatusColors[allocation.status] || 'text-gray-700 bg-gray-100'}`}>
                {allocation.status.replace('_', ' ')}
              </span>
            )}
          </div>
          {allocation ? (
            <>
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{allocation.percentReceived}%</p>
                  <p className="text-sm text-gray-500">received</p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>{allocation.totalReceived} / {allocation.totalAllocated} units</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all"
                  style={{ width: `${allocation.percentReceived}%` }}
                />
              </div>
              <div className="space-y-2">
                {allocation.commodities.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{c.name}</span>
                    <span className={`font-medium ${c.receivedQty >= c.allocatedQty ? 'text-emerald-600' : c.receivedQty > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                      {c.receivedQty}/{c.allocatedQty}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm">No allocation recorded for this month yet.</p>
          )}
        </div>

        {/* Stock levels — 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Stock Levels</h3>
            <Link to="/inventory" className="text-sm text-primary-600 hover:underline font-medium">
              Manage →
            </Link>
          </div>
          {inventory.items.length === 0 ? (
            <p className="text-gray-500 text-sm">No inventory recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {inventory.items.map((item) => (
                <div key={item.itemName}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{item.itemName}</span>
                      {item.isLowStock && (
                        <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                          LOW
                        </span>
                      )}
                    </div>
                    <span className="text-gray-600 font-mono text-xs">
                      {item.currentStock} {item.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.isLowStock
                          ? 'bg-gradient-to-r from-red-400 to-red-600'
                          : item.fillPercent < 40
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                            : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                      }`}
                      style={{ width: `${item.fillPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick action links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/queue-manage', label: 'Manage Queue', color: 'from-blue-500 to-indigo-600' },
          { to: '/record-distribution', label: 'Record Distribution', color: 'from-emerald-500 to-green-600' },
          { to: '/inventory', label: 'Inventory', color: 'from-amber-500 to-orange-600' },
          { to: '/stock-forecast', label: 'Stock Forecast', color: 'from-rose-500 to-pink-600' },
        ].map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className={`bg-gradient-to-br ${action.color} text-white font-semibold rounded-xl p-4 text-center shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5`}
          >
            {action.label}
          </Link>
        ))}
      </div>

      {/* Recent feedback */}
      {recentFeedbacks && recentFeedbacks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Feedback</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentFeedbacks.slice(0, 3).map((f) => (
              <div key={f._id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-sm ${star <= f.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                  ))}
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(f.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {f.textFeedback && (
                  <p className="text-sm text-gray-600 line-clamp-2">{f.textFeedback}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* =====================================================================
 *  ROOT Dashboard — routes to correct role view
 * ===================================================================== */
const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  if (!user) return null;

  const isAdmin = user.role === 'admin' || user.role === 'sysadmin';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('welcome')}, {user.name.split(' ')[0]}
        </h1>
        <p className="text-gray-500 mt-1">
          <span className="capitalize">{user.role === 'sysadmin' ? 'System Admin' : user.role}</span>
          {' · '}
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {user.role === 'cardholder' && <CardholderDashboard />}
      {user.role === 'shopowner' && <ShopOwnerDashboard />}
      {isAdmin && <AdminDashboard />}
    </div>
  );
};

export default Dashboard;
