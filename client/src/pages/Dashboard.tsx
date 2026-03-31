import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axios';

const StatCard = ({ title, value, color }: { title: string; value: string | number; color: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border-l-4 ${color} p-6`}>
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

const CardholderDashboard = () => {
  const [stats, setStats] = useState({ bookings: 0, completed: 0, pending: 0 });

  useEffect(() => {
    api.get('/queue/my-bookings').then(({ data }) => {
      const bookings = data.bookings || [];
      setStats({
        bookings: bookings.length,
        completed: bookings.filter((b: any) => b.status === 'completed').length,
        pending: bookings.filter((b: any) => b.status === 'waiting').length,
      });
    }).catch(() => {});
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="My Bookings" value={stats.bookings} color="border-primary-500" />
        <StatCard title="Completed Visits" value={stats.completed} color="border-green-500" />
        <StatCard title="Pending Slots" value={stats.pending} color="border-accent-400" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/book-slot" className="block bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-xl p-6 transition">
          <h3 className="text-lg font-semibold text-primary-700">Book a Time Slot</h3>
          <p className="text-gray-600 mt-2">Select your preferred shop and time slot for ration collection</p>
        </Link>
        <Link to="/my-bookings" className="block bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl p-6 transition">
          <h3 className="text-lg font-semibold text-green-700">My Bookings</h3>
          <p className="text-gray-600 mt-2">View your upcoming and past booking history</p>
        </Link>
      </div>
    </>
  );
};

const ShopOwnerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ bookings: 0, waiting: 0, served: 0, lowStock: 0 });

  useEffect(() => {
    const shopId = user?.shopAssignedTo;
    if (!shopId) return;

    Promise.all([
      api.get(`/queue/live-status/${shopId}`).catch(() => ({ data: { status: [] } })),
      api.get(`/inventory/${shopId}`).catch(() => ({ data: { inventory: [] } })),
    ]).then(([queueRes, invRes]) => {
      let waiting = 0, served = 0, bookings = 0;
      (queueRes.data.status || []).forEach((q: any) => {
        waiting += q.waiting || 0;
        served += q.completed || 0;
        bookings += (q.waiting || 0) + (q.inService || 0) + (q.completed || 0);
      });
      const lowStock = (invRes.data.inventory || []).filter((i: any) => i.isLowStock).length;
      setStats({ bookings, waiting, served, lowStock });
    });
  }, [user]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Today's Bookings" value={stats.bookings} color="border-primary-500" />
        <StatCard title="Currently Waiting" value={stats.waiting} color="border-accent-400" />
        <StatCard title="Served Today" value={stats.served} color="border-green-500" />
        <StatCard title="Low Stock Items" value={stats.lowStock} color="border-red-500" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/queue-manage" className="block bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-xl p-6 transition">
          <h3 className="text-lg font-semibold text-primary-700">Manage Queue</h3>
          <p className="text-gray-600 mt-2">View live queue and serve customers</p>
        </Link>
        <Link to="/inventory" className="block bg-accent-50 hover:bg-accent-100 border border-accent-200 rounded-xl p-6 transition">
          <h3 className="text-lg font-semibold text-accent-600">Inventory</h3>
          <p className="text-gray-600 mt-2">Track and manage your stock levels</p>
        </Link>
        <Link to="/stock-forecast" className="block bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl p-6 transition">
          <h3 className="text-lg font-semibold text-red-700">Stock Forecast</h3>
          <p className="text-gray-600 mt-2">View depletion predictions and reorder alerts</p>
        </Link>
      </div>
    </>
  );
};

const AdminDashboardQuick = () => {
  const [stats, setStats] = useState({ users: 0, shops: 0, bookings: 0, alerts: 0 });

  useEffect(() => {
    api.get('/analytics/dashboard').then(({ data }) => {
      setStats({
        users: data.totalUsers || 0,
        shops: data.totalShops || 0,
        bookings: data.todayStats?.totalBookings || 0,
        alerts: data.openFraudAlerts || 0,
      });
    }).catch(() => {});
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.users} color="border-primary-500" />
        <StatCard title="Active Shops" value={stats.shops} color="border-green-500" />
        <StatCard title="Today's Bookings" value={stats.bookings} color="border-accent-400" />
        <StatCard title="Fraud Alerts" value={stats.alerts} color="border-red-500" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/admin" className="block bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-xl p-6 transition">
          <h3 className="text-lg font-semibold text-primary-700">Admin Panel</h3>
          <p className="text-gray-600 mt-2">Full system analytics, user management, and reports</p>
        </Link>
        <Link to="/fraud-alerts" className="block bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl p-6 transition">
          <h3 className="text-lg font-semibold text-red-700">Fraud Alerts</h3>
          <p className="text-gray-600 mt-2">Review and manage security alerts</p>
        </Link>
      </div>
    </>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">{t('welcome')}, {user.name}</h1>
      <p className="text-gray-500 mb-8">{t('role')}: <span className="capitalize font-medium text-primary-600">{user.role}</span></p>

      {user.role === 'cardholder' && <CardholderDashboard />}
      {user.role === 'shopowner' && <ShopOwnerDashboard />}
      {(user.role === 'admin' || user.role === 'sysadmin') && <AdminDashboardQuick />}
    </div>
  );
};

export default Dashboard;
