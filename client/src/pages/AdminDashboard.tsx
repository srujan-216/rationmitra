import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import type { DashboardData } from '../types';

const StatCard = ({ title, value, color, subtitle }: { title: string; value: string | number; color: string; subtitle?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border-l-4 ${color} p-6`}>
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-3xl font-bold mt-1">{value}</p>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading dashboard...</div>;
  if (!data) return <div className="text-center py-12 text-gray-500">Failed to load data.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={data.totalUsers} color="border-primary-500" />
        <StatCard title="Active Shops" value={data.totalShops} color="border-green-500" />
        <StatCard title="Today's Bookings" value={data.todayStats.totalBookings} color="border-accent-400"
          subtitle={`${data.todayStats.totalWaiting} waiting | ${data.todayStats.totalServed} served`} />
        <StatCard title="Low Stock Alerts" value={data.lowStockItems} color="border-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Queue Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Queue Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Bookings</span>
              <span className="font-semibold">{data.todayStats.totalBookings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Currently Waiting</span>
              <span className="font-semibold text-yellow-600">{data.todayStats.totalWaiting}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Served Today</span>
              <span className="font-semibold text-green-600">{data.todayStats.totalServed}</span>
            </div>
            {data.todayStats.totalBookings > 0 && (
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-semibold text-primary-600">
                    {Math.round((data.todayStats.totalServed / data.todayStats.totalBookings) * 100)}%
                  </span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2.5">
                  <div className="bg-primary-500 h-2.5 rounded-full"
                    style={{ width: `${(data.todayStats.totalServed / data.todayStats.totalBookings) * 100}%` }}></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Feedback</h2>
          {data.recentFeedbacks.length === 0 ? (
            <p className="text-gray-500 text-sm">No feedback yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recentFeedbacks.map((f) => (
                <div key={f._id} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`text-sm ${star <= f.rating ? 'text-yellow-400' : 'text-gray-300'}`}>&#9733;</span>
                    ))}
                    <span className="text-xs text-gray-400 ml-2">{new Date(f.createdAt).toLocaleDateString()}</span>
                  </div>
                  {f.textFeedback && <p className="text-sm text-gray-600 line-clamp-2">{f.textFeedback}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
