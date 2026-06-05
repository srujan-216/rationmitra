import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface Notification {
  _id: string;
  notificationType: string;
  channel: string;
  message: string;
  status: string;
  createdAt: string;
  deliveredAt?: string | null;
}

const CHANNEL_STYLE: Record<string, { bg: string; fg: string; icon: JSX.Element }> = {
  sms: {
    bg: 'bg-emerald-50',
    fg: 'text-emerald-600',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 3v-3z" />,
  },
  email: {
    bg: 'bg-blue-50',
    fg: 'text-blue-600',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.9 5.3a2 2 0 002.2 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
  },
  push: {
    bg: 'bg-amber-50',
    fg: 'text-amber-600',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14V11a6 6 0 10-12 0v3a2 2 0 01-.6 1.6L4 17h5m6 0a3 3 0 11-6 0" />,
  },
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = () => {
    api.get('/notifications/my')
      .then(({ data }) => setNotifications(data.notifications || []))
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id: string) => {
    await api.put(`/notifications/mark-read/${id}`).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => n._id === id ? { ...n, deliveredAt: new Date().toISOString() } : n)
    );
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.put('/notifications/mark-all-read');
      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, deliveredAt: n.deliveredAt ?? now })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(notifications.length / PAGE_SIZE);
  const paged = notifications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const unreadCount = notifications.filter((n) => !n.deliveredAt).length;

  if (loading) return <LoadingSpinner message="Loading notifications..." />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {notifications.length > 0
              ? `${notifications.length} total · ${unreadCount} unread`
              : 'You have no notifications yet'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {markingAll ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14V11a6 6 0 10-12 0v3a2 2 0 01-.6 1.6L4 17h5m6 0a3 3 0 11-6 0" />
            </svg>
          </div>
          <p className="text-gray-700 font-medium">All caught up</p>
          <p className="text-sm text-gray-500 mt-1">
            You'll see slot reminders, alerts, and updates here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {paged.map((n) => {
            const isUnread = !n.deliveredAt;
            const style = CHANNEL_STYLE[n.channel] || CHANNEL_STYLE.push;
            return (
              <div
                key={n._id}
                onClick={() => isUnread && markRead(n._id)}
                className={`rounded-xl border p-4 hover:shadow-sm transition flex items-start gap-4 cursor-pointer ${
                  isUnread ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-5 h-5 ${style.fg}`}>
                    {style.icon}
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-sm capitalize ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                      {n.notificationType.replace(/_/g, ' ')}
                    </p>
                    <div className="flex items-center gap-2">
                      {isUnread && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                        n.status === 'sent' ? 'bg-emerald-100 text-emerald-700' :
                        n.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {n.status}
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm ${isUnread ? 'text-gray-800' : 'text-gray-600'}`}>{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1.5 capitalize">
                    {new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                    {' · via '}
                    {n.channel}
                    {!isUnread && n.deliveredAt && ' · read'}
                  </p>
                </div>
              </div>
            );
          })}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition">
                ← Previous
              </button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition">
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
