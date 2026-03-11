import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface FraudAlert {
  _id: string;
  userId: string;
  userName: string;
  alertType: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800',
};

const statusColors: Record<string, string> = {
  open: 'bg-red-100 text-red-700',
  investigating: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  dismissed: 'bg-gray-100 text-gray-700',
};

const FraudAlerts = () => {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    api.get('/analytics/fraud-alerts')
      .then(({ data }) => setAlerts(data.alerts || []))
      .catch(() => toast.error('Failed to load alerts'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (alertId: string, status: string) => {
    try {
      await api.put(`/analytics/fraud-alerts/${alertId}`, { status });
      setAlerts((prev) => prev.map((a) => a._id === alertId ? { ...a, status: status as FraudAlert['status'] } : a));
      toast.success(`Alert ${status}`);
    } catch {
      toast.error('Update failed');
    }
  };

  const filtered = filter === 'all' ? alerts : alerts.filter((a) => a.status === filter);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading alerts...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Fraud Detection Alerts</h1>
        <div className="flex gap-2">
          {['all', 'open', 'investigating', 'resolved'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition capitalize ${
                filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{alerts.filter((a) => a.status === 'open').length}</p>
          <p className="text-xs text-gray-500">Open</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{alerts.filter((a) => a.status === 'investigating').length}</p>
          <p className="text-xs text-gray-500">Investigating</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{alerts.filter((a) => a.status === 'resolved').length}</p>
          <p className="text-xs text-gray-500">Resolved</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{alerts.filter((a) => a.severity === 'critical' || a.severity === 'high').length}</p>
          <p className="text-xs text-gray-500">High Priority</p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">{filter === 'all' ? 'No fraud alerts detected. System is clean.' : `No ${filter} alerts.`}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => (
            <div key={alert._id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${severityColors[alert.severity]}`}>
                    {alert.severity}
                  </span>
                  <h3 className="font-semibold text-gray-800">{alert.alertType}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[alert.status]}`}>
                  {alert.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  User: {alert.userName} | {new Date(alert.createdAt).toLocaleString()}
                </p>
                {alert.status === 'open' && (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(alert._id, 'investigating')}
                      className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded-lg transition">
                      Investigate
                    </button>
                    <button onClick={() => updateStatus(alert._id, 'dismissed')}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-lg transition">
                      Dismiss
                    </button>
                  </div>
                )}
                {alert.status === 'investigating' && (
                  <button onClick={() => updateStatus(alert._id, 'resolved')}
                    className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-lg transition">
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FraudAlerts;
