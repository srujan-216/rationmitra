import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  open: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  escalated: 'bg-red-100 text-red-800',
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
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-lg mx-auto">
          <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No Grievances Filed Yet</h2>
          <p className="text-gray-500 text-sm mb-4">You have not filed any grievances. If you have an issue, you can file one now.</p>
          <Link
            to="/file-grievance"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium transition"
          >
            File a Grievance
          </Link>
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
