import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface Grievance {
  _id: string;
  grievanceNumber: string;
  type: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'under_review' | 'resolved' | 'escalated';
  userName: string;
  shopName: string;
  createdAt: string;
}

interface GrievanceStats {
  open: number;
  under_review: number;
  resolved: number;
  escalated: number;
}

const STATUSES = ['all', 'open', 'under_review', 'resolved', 'escalated'] as const;
const TYPES = ['all', 'quality', 'quantity', 'availability', 'behaviour', 'other'] as const;
const PRIORITIES = ['all', 'low', 'medium', 'high', 'critical'] as const;

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    open: 'bg-yellow-100 text-yellow-800',
    under_review: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    escalated: 'bg-red-100 text-red-800',
  };
  return map[status] ?? 'bg-gray-100 text-gray-800';
};

const priorityBadge = (priority: string) => {
  const map: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  };
  return map[priority] ?? 'bg-gray-100 text-gray-700';
};

const GrievanceManagement = () => {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [stats, setStats] = useState<GrievanceStats>({ open: 0, under_review: 0, resolved: 0, escalated: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchGrievances = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;

      const { data } = await api.get('/grievances/all', { params });
      setGrievances(data.grievances ?? data.data ?? []);
      setTotalPages(data.totalPages ?? 1);
      if (data.stats) setStats(data.stats);
    } catch {
      toast.error('Failed to load grievances');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, priorityFilter, page]);

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  const updateStatus = async (id: string, status: string, notes?: string) => {
    setUpdatingId(id);
    try {
      await api.put(`/grievances/${id}/status`, { status, notes });
      toast.success(`Grievance ${status === 'resolved' ? 'resolved' : status === 'escalated' ? 'escalated' : 'updated'}`);
      setResolvingId(null);
      setResolutionNotes('');
      fetchGrievances();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update grievance');
    } finally {
      setUpdatingId(null);
    }
  };

  const StatCard = ({ label, count, color }: { label: string; count: number; color: string }) => (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 ${color} p-5`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-1">{count}</p>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Grievance Management</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Open" count={stats.open} color="border-yellow-500" />
        <StatCard label="Under Review" count={stats.under_review} color="border-blue-500" />
        <StatCard label="Resolved" count={stats.resolved} color="border-green-500" />
        <StatCard label="Escalated" count={stats.escalated} color="border-red-500" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        {/* Status tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                statusFilter === s
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p === 'all' ? 'All Priorities' : p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading grievances..." />
      ) : grievances.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
          No grievances found.
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Grievance #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Priority</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Shop</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {grievances.map((g) => (
                  <tr key={g._id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{g.grievanceNumber}</td>
                    <td className="px-4 py-3 capitalize">{g.type}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{g.description}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${priorityBadge(g.priority)}`}>
                        {g.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(g.status)}`}>
                        {g.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{g.userName}</td>
                    <td className="px-4 py-3 text-gray-600">{g.shopName}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(g.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {g.status === 'open' && (
                          <>
                            <button
                              onClick={() => updateStatus(g._id, 'under_review')}
                              disabled={updatingId === g._id}
                              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition disabled:opacity-50"
                            >
                              Start Review
                            </button>
                            <button
                              onClick={() => updateStatus(g._id, 'escalated')}
                              disabled={updatingId === g._id}
                              className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition disabled:opacity-50"
                            >
                              Escalate
                            </button>
                          </>
                        )}
                        {g.status === 'under_review' && (
                          resolvingId === g._id ? (
                            <div className="flex flex-col gap-2">
                              <textarea
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                placeholder="Resolution notes..."
                                rows={2}
                                className="text-xs border border-gray-300 rounded-lg px-2 py-1 w-48 resize-none focus:ring-2 focus:ring-primary-500 outline-none"
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={() => updateStatus(g._id, 'resolved', resolutionNotes)}
                                  disabled={updatingId === g._id}
                                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition disabled:opacity-50"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => { setResolvingId(null); setResolutionNotes(''); }}
                                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setResolvingId(g._id)}
                              className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition"
                            >
                              Resolve
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4 mb-4">
            {grievances.map((g) => (
              <div key={g._id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-gray-500">{g.grievanceNumber}</span>
                  <div className="flex gap-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${priorityBadge(g.priority)}`}>
                      {g.priority}
                    </span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(g.status)}`}>
                      {g.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-800 capitalize mb-1">{g.type}</p>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{g.description}</p>
                <div className="flex justify-between text-xs text-gray-500 mb-3">
                  <span>{g.userName} | {g.shopName}</span>
                  <span>{new Date(g.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {g.status === 'open' && (
                    <>
                      <button
                        onClick={() => updateStatus(g._id, 'under_review')}
                        disabled={updatingId === g._id}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        Start Review
                      </button>
                      <button
                        onClick={() => updateStatus(g._id, 'escalated')}
                        disabled={updatingId === g._id}
                        className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        Escalate
                      </button>
                    </>
                  )}
                  {g.status === 'under_review' && (
                    resolvingId === g._id ? (
                      <div className="w-full space-y-2">
                        <textarea
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          placeholder="Resolution notes..."
                          rows={2}
                          className="text-sm border border-gray-300 rounded-lg px-3 py-2 w-full resize-none focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(g._id, 'resolved', resolutionNotes)}
                            disabled={updatingId === g._id}
                            className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                          >
                            Confirm Resolve
                          </button>
                          <button
                            onClick={() => { setResolvingId(null); setResolutionNotes(''); }}
                            className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setResolvingId(g._id)}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition"
                      >
                        Resolve
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GrievanceManagement;
