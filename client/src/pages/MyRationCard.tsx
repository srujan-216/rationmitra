import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface FamilyMember {
  _id: string;
  name: string;
  relation: string;
  gender: string;
  dob: string;
  status: 'active' | 'removed';
}

interface RationCard {
  _id: string;
  cardNumber: string;
  cardType: string;
  district: string;
  mandal: string;
  village: string;
  assignedFPS: { shopName: string } | null;
  familyMembers: FamilyMember[];
}

interface FamilyRequest {
  _id: string;
  type: 'addition' | 'deletion';
  memberName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewNotes?: string;
}

const CARD_TYPE_COLORS: Record<string, string> = {
  AAY: 'bg-red-100 text-red-800',
  PHH: 'bg-blue-100 text-blue-800',
  APL: 'bg-green-100 text-green-800',
  Annapurna: 'bg-purple-100 text-purple-800',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const RELATIONS = ['Self', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Other'];

const MyRationCard = () => {
  const [card, setCard] = useState<RationCard | null>(null);
  const [requests, setRequests] = useState<FamilyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [removeModal, setRemoveModal] = useState<{ memberId: string; name: string } | null>(null);
  const [removeReason, setRemoveReason] = useState('');
  const [removeCertificate, setRemoveCertificate] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [addForm, setAddForm] = useState({
    name: '',
    aadhaar: '',
    relation: '',
    dob: '',
    gender: 'Male',
    reason: '',
  });
  const [addCertificate, setAddCertificate] = useState<File | null>(null);

  const fetchCard = async () => {
    try {
      const { data } = await api.get('/ration-cards/my-card');
      setCard(data);
    } catch {
      toast.error('Failed to load ration card');
    }
  };

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/ration-cards/family-requests/mine');
      setRequests(data);
    } catch {
      toast.error('Failed to load requests');
    }
  };

  useEffect(() => {
    Promise.all([fetchCard(), fetchRequests()]).finally(() => setLoading(false));
  }, []);

  const maskAadhaar = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits.length <= 4) return digits;
    return 'XXXX-XXXX-' + digits.slice(-4);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', addForm.name);
      formData.append('aadhaar', addForm.aadhaar);
      formData.append('relation', addForm.relation);
      formData.append('dob', addForm.dob);
      formData.append('gender', addForm.gender);
      formData.append('reason', addForm.reason);
      if (addCertificate) formData.append('certificate', addCertificate);

      await api.post('/ration-cards/family-request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Family member addition request submitted');
      setShowAddForm(false);
      setAddForm({ name: '', aadhaar: '', relation: '', dob: '', gender: 'Male', reason: '' });
      setAddCertificate(null);
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveSubmit = async () => {
    if (!removeModal) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('memberId', removeModal.memberId);
      formData.append('reason', removeReason);
      formData.append('type', 'deletion');
      if (removeCertificate) formData.append('certificate', removeCertificate);

      await api.post('/ration-cards/family-request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Removal request submitted');
      setRemoveModal(null);
      setRemoveReason('');
      setRemoveCertificate(null);
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your ration card..." />;

  if (!card) {
    return (
      <div className="text-center py-12 text-gray-500">
        No ration card found for your account.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-800">{card.cardNumber}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${CARD_TYPE_COLORS[card.cardType] || 'bg-gray-100 text-gray-800'}`}>
                {card.cardType}
              </span>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <p><span className="font-medium text-gray-700">District:</span> {card.district}</p>
              <p><span className="font-medium text-gray-700">Mandal:</span> {card.mandal}</p>
              <p><span className="font-medium text-gray-700">Village:</span> {card.village}</p>
              <p><span className="font-medium text-gray-700">Assigned FPS:</span> {card.assignedFPS?.shopName || 'Not assigned'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Family Members */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Family Members</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {showAddForm ? 'Cancel' : '+ Add Family Member'}
          </button>
        </div>

        {/* Add Member Form */}
        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="border border-gray-200 rounded-lg p-4 mb-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" required value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
                <input type="text" required value={addForm.aadhaar}
                  onChange={(e) => setAddForm({ ...addForm, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="12-digit Aadhaar" />
                {addForm.aadhaar && <p className="text-xs text-gray-400 mt-1">Display: {maskAadhaar(addForm.aadhaar)}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                <select required value={addForm.relation}
                  onChange={(e) => setAddForm({ ...addForm, relation: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="">Select relation</option>
                  {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" required value={addForm.dob}
                  onChange={(e) => setAddForm({ ...addForm, dob: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select value={addForm.gender}
                  onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate</label>
                <input type="file" onChange={(e) => setAddCertificate(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea required value={addForm.reason}
                onChange={(e) => setAddForm({ ...addForm, reason: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                rows={2} placeholder="Reason for adding family member" />
            </div>
            <button type="submit" disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        )}

        {/* Members Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Relation</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Gender</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">DOB</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {card.familyMembers.map((member) => (
                <tr key={member._id}>
                  <td className="px-4 py-3 font-medium text-gray-800">{member.name}</td>
                  <td className="px-4 py-3 text-gray-600">{member.relation}</td>
                  <td className="px-4 py-3 text-gray-600">{member.gender}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(member.dob).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {member.status === 'active' && (
                      <button
                        onClick={() => setRemoveModal({ memberId: member._id, name: member.name })}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      {removeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Remove Family Member</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to request removal of <span className="font-semibold">{removeModal.name}</span>?
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea required value={removeReason}
                onChange={(e) => setRemoveReason(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                rows={3} placeholder="Reason for removal" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certificate</label>
              <input type="file" onChange={(e) => setRemoveCertificate(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setRemoveModal(null); setRemoveReason(''); setRemoveCertificate(null); }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">
                Cancel
              </button>
              <button onClick={handleRemoveSubmit} disabled={submitting || !removeReason}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Confirm Removal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Requests */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">My Requests</h2>
        {requests.length === 0 ? (
          <p className="text-gray-500 text-sm">No family requests submitted yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((req) => (
              <div key={req._id} className="border border-gray-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[req.status]}`}>
                    {req.status}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm font-medium text-gray-800">{req.memberName}</p>
                <p className="text-xs text-gray-500 capitalize">Type: {req.type}</p>
                {req.reviewNotes && (
                  <p className="text-xs text-gray-500">Notes: {req.reviewNotes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRationCard;
