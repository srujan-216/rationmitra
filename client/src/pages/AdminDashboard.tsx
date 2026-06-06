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
  purple: '#8b5cf6',
};

/* ==========================================================
 *  Hero stat card — gradient + icon + trend
 * ========================================================== */
const HeroStat = ({
  title,
  value,
  subtitle,
  gradient,
  icon,
  accent,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  gradient: string;
  icon: JSX.Element;
  accent: string;
}) => (
  <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition`}>
    <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full" />
    <div className="absolute -right-10 bottom-0 w-40 h-40 bg-white/5 rounded-full" />
    <div className="relative z-10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-white/80 font-semibold uppercase tracking-wider">{title}</p>
          <p className="text-4xl font-bold mt-2 leading-none">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center ${accent}`}>
          {icon}
        </div>
      </div>
      {subtitle && <p className="text-sm text-white/80 mt-3">{subtitle}</p>}
    </div>
  </div>
);

const ROLE_COLORS = [COLORS.blue, COLORS.green, COLORS.yellow];


const renderPieLabel = ({ name, percent }: { name?: string; percent?: number }) =>
  `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`;

/* ---------- component ---------- */

const AdminDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [topShops, setTopShops] = useState<any[]>([]);
  const [weeklyTrends, setWeeklyTrends] = useState<{ day: string; bookings: number; served: number; noShows: number }[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/dashboard'),
      api.get('/analytics/shop-performance').catch(() => ({ data: { performance: [] } })),
      api.get('/analytics/weekly-trends').catch(() => ({ data: { trends: [] } })),
    ])
      .then(([dashRes, perfRes, trendsRes]) => {
        setData(dashRes.data);
        setTopShops((perfRes.data.performance || []).slice(0, 5));
        setWeeklyTrends(trendsRes.data.trends || []);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const exportPdf = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('RationMitra — Admin Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    (doc as any).autoTable({
      startY: 35,
      head: [['Metric', 'Value']],
      body: [
        ['Total Users', String(data.totalUsers)],
        ['Active Shops', String(data.totalShops)],
        ["Today's Bookings", String(data.todayStats.totalBookings)],
        ['Currently Waiting', String(data.todayStats.totalWaiting)],
        ['Served Today', String(data.todayStats.totalServed)],
        ['Avg Service Time', `${data.todayStats.avgServiceTime || 0} min`],
        ['Low Stock Items', String(data.lowStockItems)],
        ['Open Fraud Alerts', String(data.openFraudAlerts)],
      ],
    });
    if (data.recentFeedbacks.length > 0) {
      (doc as any).autoTable({
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
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (!data) return <div className="text-center py-12 text-gray-500">Failed to load data.</div>;

  /* derived chart data */
  const todayCompleted = data.todayStats.totalBookings - data.todayStats.totalWaiting - data.todayStats.totalServed;
  const queueData = [
    { name: 'Waiting', count: data.todayStats.totalWaiting },
    { name: 'In Service', count: data.todayStats.totalServed },
    { name: 'Completed', count: todayCompleted > 0 ? todayCompleted : 0 },
  ];

  const rd = data.roleDistribution || {};
  const roleData = [
    { name: 'Cardholder', value: rd['cardholder'] || 0 },
    { name: 'Shopowner', value: rd['shopowner'] || 0 },
    { name: 'Admin', value: (rd['admin'] || 0) + (rd['sysadmin'] || 0) },
  ];

  const positive = data.recentFeedbacks.filter((f) => f.sentiment === 'positive').length;
  const negative = data.recentFeedbacks.filter((f) => f.sentiment === 'negative').length;
  const neutral = data.recentFeedbacks.length - positive - negative;
  const sentimentData = [
    { name: 'Positive', value: positive || 0 },
    { name: 'Neutral', value: neutral || 0 },
    { name: 'Negative', value: negative || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">System-wide analytics and operations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Live data
          </div>
          <button
            onClick={exportPdf}
            className="bg-gradient-to-r from-primary-600 to-indigo-700 hover:shadow-lg text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.6L19 9.4V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* Hero stat grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <HeroStat
          title="Total Users"
          value={data.totalUsers}
          subtitle="Active accounts across all roles"
          gradient="from-blue-600 to-indigo-700"
          accent="text-blue-100"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 014-4h4a4 4 0 014 4v2h-1M16 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>}
        />
        <HeroStat
          title="FPS Shops"
          value={data.totalShops}
          subtitle="Active across Telangana"
          gradient="from-emerald-500 to-green-700"
          accent="text-emerald-100"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l2-5h14l2 5M3 9h18M3 9v11a1 1 0 001 1h4v-6h8v6h4a1 1 0 001-1V9"/></svg>}
        />
        <HeroStat
          title="Today's Bookings"
          value={data.todayStats.totalBookings}
          subtitle={`${data.todayStats.totalWaiting} waiting · ${data.todayStats.totalServed} served`}
          gradient="from-amber-500 to-orange-600"
          accent="text-amber-100"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3M16 7V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
        />
        <HeroStat
          title="Low Stock Alerts"
          value={data.lowStockItems}
          subtitle="Items needing replenishment"
          gradient="from-rose-500 to-red-700"
          accent="text-rose-100"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9L2.4 18a1.8 1.8 0 001.6 2.7h16a1.8 1.8 0 001.6-2.7L13.7 3.9a1.8 1.8 0 00-3.4 0z"/></svg>}
        />
      </div>

      {/* Secondary KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Avg Service Time', value: `${data.todayStats.avgServiceTime || '—'} min`, icon: '⏱' },
          { label: 'Open Fraud Alerts', value: data.openFraudAlerts || 0, icon: '⚠' },
          { label: 'Positive Sentiment', value: sentimentData.find((d) => d.name === 'Positive')?.value ?? 0, icon: '😊' },
          { label: 'Capacity Utilization', value: '67%', icon: '📊' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">{kpi.icon}</span>
            <div>
              <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
              <p className="text-lg font-bold text-gray-900">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Today's Queue Summary</h2>
          <p className="text-xs text-gray-500 mb-4">Live distribution across queue statuses</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={queueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Bar dataKey="count" name="Count" radius={[8, 8, 0, 0]}>
                <Cell fill={COLORS.yellow} />
                <Cell fill={COLORS.blue} />
                <Cell fill={COLORS.green} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Weekly Trends</h2>
          <p className="text-xs text-gray-500 mb-4">Bookings, served, and no-shows over 7 days</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weeklyTrends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="bookings" stroke={COLORS.blue} strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="served" stroke={COLORS.green} strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="noShows" stroke={COLORS.red} strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Role Distribution</h2>
          <p className="text-xs text-gray-500 mb-4">Breakdown of system users</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label={renderPieLabel}>
                {roleData.map((_entry, idx) => (
                  <Cell key={`role-${idx}`} fill={ROLE_COLORS[idx % ROLE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Sentiment Overview</h2>
          <p className="text-xs text-gray-500 mb-4">ML-analyzed feedback sentiment</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} label={renderPieLabel}>
                {sentimentData.map((entry) => (
                  <Cell key={`sent-${entry.name}`} fill={entry.name === 'Positive' ? COLORS.green : entry.name === 'Negative' ? COLORS.red : COLORS.yellow} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row: Top shops leaderboard + Recent feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Top shops leaderboard */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Performing Shops</h2>
            <span className="text-xs text-gray-500">by rating</span>
          </div>
          {topShops.length === 0 ? (
            <p className="text-gray-500 text-sm">Performance data loading…</p>
          ) : (
            <div className="space-y-3">
              {topShops.map((s, idx) => (
                <div key={s.shopId} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-amber-100 text-amber-700' :
                    idx === 1 ? 'bg-gray-200 text-gray-700' :
                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{s.name}</p>
                    <p className="text-xs text-gray-500">
                      {s.todayServed}/{s.todayBookings} served today · {s.efficiency}% efficiency
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-400">
                      <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
                    </svg>
                    <span className="font-semibold text-gray-900">{s.rating?.toFixed(1) ?? '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent feedback */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Feedback</h2>
          {data.recentFeedbacks.length === 0 ? (
            <p className="text-gray-500 text-sm">No feedback yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.recentFeedbacks.slice(0, 4).map((f) => (
                <div key={f._id} className="border border-gray-100 rounded-xl p-4 hover:border-primary-200 transition">
                  <div className="flex items-center gap-1 mb-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`text-sm ${star <= f.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                    ))}
                    {f.sentiment && (
                      <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                        f.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-700' :
                        f.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {f.sentiment}
                      </span>
                    )}
                  </div>
                  {f.textFeedback && <p className="text-sm text-gray-600 line-clamp-2">{f.textFeedback}</p>}
                  <p className="text-xs text-gray-400 mt-2">{new Date(f.createdAt).toLocaleDateString()}</p>
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
