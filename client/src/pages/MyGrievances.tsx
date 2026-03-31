import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface TimelineEntry {
  status: string;
  date: string;
  notes?: string;
}

interface Grievance {
  _id: string;
  grievanceNumber: string;
  type: string;
  status: string;
  priority: string;
  description: string;
  resolution?: string;
  timeline: TimelineEntry[];
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  closed: 'bg-gray-100 text-gray-600',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const MyGrievances = () => {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        const { data } = await api.get('/grievances/mine');
        setGrievances(data.grievances || data);
      } catch {
        toast.error('Failed to load grievances');
      } finally {
        setLoading(false);
      }
    };
    fetchGrievances();
  }, []);

  if (loading) return <LoadingSpinner message="Loading your grievances..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Grievances</h1>

      {grievances.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">You haven't filed any grievances yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grievances.map((g) => (
            <div key={g._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Card Header - Clickable */}
              <button
                onClick={() => setExpandedId(expandedId === g._id ? null : g._id)}
                className="w-full text-left p-4 sm:p-6 hover:bg-gray-50 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-800">{g.grievanceNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[g.status] || 'bg-gray-100 text-gray-600'}`}>
                        {g.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[g.priority] || 'bg-gray-100 text-gray-600'}`}>
                        {g.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 capitalize">Type: {g.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">{new Date(g.createdAt).toLocaleDateString()}</span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === g._id ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              {expandedId === g._id && (
                <div className="border-t border-gray-100 p-4 sm:p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
                    <p className="text-sm text-gray-600">{g.description}</p>
                  </div>

                  {g.resolution && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">Resolution</h3>
                      <p className="text-sm text-green-700 bg-green-50 rounded-lg p-3">{g.resolution}</p>
                    </div>
                  )}

                  {/* Timeline */}
                  {g.timeline && g.timeline.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Timeline</h3>
                      <div className="relative pl-6 space-y-4">
                        {g.timeline.map((entry, idx) => (
                          <div key={idx} className="relative">
                            {/* Vertical line */}
                            {idx < g.timeline.length - 1 && (
                              <div className="absolute left-[-16px] top-6 w-0.5 h-full bg-gray-200" />
                            )}
                            {/* Dot */}
                            <div className="absolute left-[-20px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary-500 border-2 border-white" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[entry.status] || 'bg-gray-100 text-gray-600'}`}>
                                  {entry.status}
                                </span>
                                <span className="text-xs text-gray-400">{new Date(entry.date).toLocaleString()}</span>
                              </div>
                              {entry.notes && <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGrievances;
