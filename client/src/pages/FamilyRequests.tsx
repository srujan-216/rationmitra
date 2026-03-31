import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface FamilyRequest {
  _id: string;
  cardNumber: string;
  requesterName: string;
  type: 'addition' | 'deletion';
  memberName: string;
  memberDetails: {
    aadhaar?: string;
    relation?: string;
    gender?: string;
    dob?: string;
  };
  reason: string;
  certificateUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const FamilyRequests = () => {
  const [requests, setRequests] = useState<FamilyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<{ id: string; action: 'approved' | 'rejected' } | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/ration-cards/family-requests/pending');
      setRequests(data);
    } catch {
      toast.error('Failed to load family requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleReview = async () => {
    if (!reviewModal) return;
    setSubmitting(true);
    try {
      await api.put(`/ration-cards/family-requests/${reviewModal.id}/review`, {
        status: reviewModal.action,
        reviewNotes,
      });
      toast.success(`Request ${reviewModal.action} successfully`);
      setReviewModal(null);
      setReviewNotes('');
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to review request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading family requests..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Family Requests Review</h1>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">No pending family requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Card Number</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Requester</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Member</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Reason</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Certificate</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td className="px-4 py-3 font-medium text-gray-800 text-sm">{req.cardNumber}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{req.requesterName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${req.type === 'addition' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                        {req.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      <p className="font-medium">{req.memberName}</p>
                      {req.memberDetails?.relation && <p className="text-xs text-gray-400">{req.memberDetails.relation}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm max-w-[200px] truncate">{req.reason}</td>
                    <td className="px-4 py-3">
                      {req.certificateUrl ? (
                        <a href={req.certificateUrl} target="_blank" rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 text-sm underline">
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setReviewModal({ id: req._id, action: 'approved' })}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setReviewModal({ id: req._id, action: 'rejected' })}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {requests.map((req) => (
              <div key={req._id} className="bg-white rounded-xl shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{req.cardNumber}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${req.type === 'addition' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                    {req.type}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Requester:</span> {req.requesterName}</p>
                  <p><span className="font-medium">Member:</span> {req.memberName} {req.memberDetails?.relation ? `(${req.memberDetails.relation})` : ''}</p>
                  <p><span className="font-medium">Reason:</span> {req.reason}</p>
                  <p><span className="font-medium">Date:</span> {new Date(req.createdAt).toLocaleDateString()}</p>
                  {req.certificateUrl && (
                    <a href={req.certificateUrl} target="_blank" rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800 underline text-sm">
                      View Certificate
                    </a>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setReviewModal({ id: req._id, action: 'approved' })}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition">
                    Approve
                  </button>
                  <button onClick={() => setReviewModal({ id: req._id, action: 'rejected' })}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-gray-800">
              {reviewModal.action === 'approved' ? 'Approve' : 'Reject'} Request
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes</label>
              <textarea value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                rows={3} placeholder="Add any notes for the review..." />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setReviewModal(null); setReviewNotes(''); }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">
                Cancel
              </button>
              <button onClick={handleReview} disabled={submitting}
                className={`px-4 py-2 rounded-lg font-medium text-white transition disabled:opacity-50 ${
                  reviewModal.action === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}>
                {submitting ? 'Processing...' : reviewModal.action === 'approved' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyRequests;
