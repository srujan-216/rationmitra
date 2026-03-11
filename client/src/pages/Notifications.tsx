import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface Notification {
  _id: string;
  notificationType: string;
  channel: string;
  message: string;
  status: string;
  createdAt: string;
}

const channelIcons: Record<string, string> = { sms: '\u2709', email: '\u2709', push: '\uD83D\uDD14' };

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications/my')
      .then(({ data }) => setNotifications(data.notifications || []))
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading notifications...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n._id} className="bg-white rounded-xl shadow-sm p-5 flex items-start gap-4">
              <span className="text-2xl mt-0.5">{channelIcons[n.channel] || '\uD83D\uDD14'}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800 capitalize">{n.notificationType.replace(/_/g, ' ')}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    n.status === 'sent' ? 'bg-green-100 text-green-700' :
                    n.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{n.status}</span>
                </div>
                <p className="text-sm text-gray-600">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()} via {n.channel}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
