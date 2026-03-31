import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import type { DashboardData } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
  PieChart, Pie, Cell,
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const COLORS = {
  blue: '#2563eb',
  green: '#16a34a',
  yellow: '#f59e0b',
  red: '#dc2626',
  gray: '#6b7280',
};

const StatCard = ({ title, value, color, subtitle }: { title: string; value: string | number; color: string; subtitle?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border-l-4 ${color} p-6`}>
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-3xl font-bold mt-1">{value}</p>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </div>
);

/* ---------- mock data helpers ---------- */

const buildWeeklyTrends = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day) => ({
    day,
    bookings: Math.floor(Math.random() * 40) + 20,
    served: Math.floor(Math.random() * 35) + 15,
    noShows: Math.floor(Math.random() * 8) + 1,
  }));
};

const ROLE_COLORS = [COLORS.blue, COLORS.green, COLORS.yellow];
const SENTIMENT_COLORS = [COLORS.green, COLORS.yellow, COLORS.red];

/* custom label renderer for pie slices */
const renderPieLabel = ({ name, percent }: { name?: string; percent?: number }) =>
  `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`;

/* ---------- component ---------- */

const AdminDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (!data) return <div className="text-center py-12 text-gray-500">Failed to load data.</div>;

  /* derived chart data */
  const completed = data.todayStats.totalBookings - data.todayStats.totalWaiting - data.todayStats.totalServed;
  const queueData = [
    { name: 'Waiting', count: data.todayStats.totalWaiting },
    { name: 'In Service', count: data.todayStats.totalServed },
    { name: 'Completed', count: completed > 0 ? completed : 0 },
  ];

  const weeklyTrends = buildWeeklyTrends();

  const roleData = [
    { name: 'Cardholder', value: Math.round(data.totalUsers * 0.75) },
    { name: 'Shopowner', value: data.totalShops },
    { name: 'Admin', value: Math.max(1, Math.round(data.totalUsers * 0.05)) },
  ];

  const positive = data.recentFeedbacks.filter((f) => f.sentiment === 'positive').length;
  const negative = data.recentFeedbacks.filter((f) => f.sentiment === 'negative').length;
  const neutral = data.recentFeedbacks.length - positive - negative;
  const sentimentData = [
    { name: 'Positive', value: positive || 4 },
    { name: 'Neutral', value: neutral || 3 },
    { name: 'Negative', value: negative || 1 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <button onClick={() => {
          const doc = new jsPDF();
          doc.setFontSize(20);
          doc.text('RationMitra - Admin Report', 14, 20);
          doc.setFontSize(10);
          doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
          doc.autoTable({
            startY: 35,
            head: [['Metric', 'Value']],
            body: [
              ['Total Users', String(data.totalUsers)],
              ['Active Shops', String(data.totalShops)],
              ["Today's Bookings", String(data.todayStats.totalBookings)],
              ['Currently Waiting', String(data.todayStats.totalWaiting)],
              ['Served Today', String(data.todayStats.totalServed)],
              ['Low Stock Items', String(data.lowStockItems)],
            ],
          });
          if (data.recentFeedbacks.length > 0) {
            doc.autoTable({
              startY: (doc as any).lastAutoTable.finalY + 10,
              head: [['Rating', 'Feedback', 'Date']],
              body: data.recentFeedbacks.map((f) => [
                `${f.rating}/5`,
                (f.textFeedback || 'N/A').slice(0, 60),
                new Date(f.createdAt).toLocaleDateString(),
              ]),
            });
          }
          doc.save('rationmitra-report.pdf');
          toast.success('Report downloaded!');
        }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          Export PDF Report
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={data.totalUsers} color="border-primary-500" />
        <StatCard title="Active Shops" value={data.totalShops} color="border-green-500" />
        <StatCard title="Today's Bookings" value={data.todayStats.totalBookings} color="border-accent-400"
          subtitle={`${data.todayStats.totalWaiting} waiting | ${data.todayStats.totalServed} served`} />
        <StatCard title="Low Stock Alerts" value={data.lowStockItems} color="border-red-500" />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1 -- Today's Queue Summary bar chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Queue Summary</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={queueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
                <Cell fill={COLORS.yellow} />
                <Cell fill={COLORS.blue} />
                <Cell fill={COLORS.green} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 2 -- Weekly Trends line chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Trends</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weeklyTrends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="bookings" stroke={COLORS.blue} strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="served" stroke={COLORS.green} strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="noShows" stroke={COLORS.red} strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 3 -- Role Distribution pie chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Role Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={roleData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={renderPieLabel}
              >
                {roleData.map((_entry, idx) => (
                  <Cell key={`role-${idx}`} fill={ROLE_COLORS[idx % ROLE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 4 -- Sentiment Overview donut chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Sentiment Overview</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={sentimentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                label={renderPieLabel}
              >
                {sentimentData.map((_entry, idx) => (
                  <Cell key={`sent-${idx}`} fill={SENTIMENT_COLORS[idx % SENTIMENT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Recent Feedback (moved below charts) */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Feedback</h2>
        {data.recentFeedbacks.length === 0 ? (
          <p className="text-gray-500 text-sm">No feedback yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.recentFeedbacks.map((f) => (
              <div key={f._id} className="border border-gray-100 rounded-lg p-4">
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
  );
};

export default AdminDashboard;
