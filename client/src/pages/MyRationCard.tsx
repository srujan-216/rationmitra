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
  AAY: 'from-red-500 to-rose-600',
  PHH: 'from-blue-500 to-indigo-600',
  APL: 'from-emerald-500 to-green-600',
  Annapurna: 'from-purple-500 to-fuchsia-600',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
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
  const [cardError, setCardError] = useState<string | null>(null);

  const [addForm, setAddForm] = useState({
    name: '', aadhaar: '', relation: '', dob: '', gender: 'Male', reason: '',
  });
  const [addCertificate, setAddCertificate] = useState<File | null>(null);

  const fetchCard = async () => {
    try {
      const { data } = await api.get('/ration-cards/my-card');
      setCard(data.card);
      setCardError(null);
    } catch (err: any) {
      setCardError(err.response?.data?.message || null);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/ration-cards/family-requests/mine');
      setRequests(data.requests || []);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    Promise.all([fetchCard(), fetchRequests()]).finally(() => setLoading(false));
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('rationCardId', card._id);
      formData.append('type', 'addition');
      Object.entries(addForm).forEach(([k, v]) => formData.append(k, v));
      if (addCertificate) formData.append('certificate', addCertificate);
      await api.post('/ration-cards/family-request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Request submitted');
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
    if (!removeModal || !card) return;
    setSubmitting(true);
    try {
      const memberIndex = card.familyMembers.findIndex((m) => m._id === removeModal.memberId);
      const formData = new FormData();
      formData.append('rationCardId', card._id);
      formData.append('type', 'deletion');
      formData.append('memberIndex', String(memberIndex));
      formData.append('reason', removeReason);
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
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h.01M11 15h2M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">No Ration Card Linked</h2>
          <p className="text-gray-500 text-sm mt-2">
            {cardError || 'No ration card is linked to your account yet. Please contact your local FPS or admin.'}
          </p>
        </div>
      </div>
    );
  }

  const gradient = CARD_TYPE_COLORS[card.cardType] || 'from-gray-600 to-gray-800';
  const activeMembers = card.familyMembers.filter((m) => m.status === 'active');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Ration Card</h1>
        <p className="text-sm text-gray-500 mt-1">Card details and family members</p>
      </div>

      {/* Credit-card style visual */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg p-6`}>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -right-16 bottom-0 w-60 h-60 bg-white/5 rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/80 font-semibold">Ration Card</p>
            <p className="text-3xl font-bold font-mono mt-1">{card.cardNumber}</p>
            <span className="inline-block mt-2 text-xs bg-white/20 backdrop-blur px-2.5 py-1 rounded-full font-semibold">
              {card.cardType}
            </span>
          </div>
          <div className="text-sm text-right space-y-1">
            <p><span className="text-white/70">District:</span> <span className="font-medium">{card.district}</span></p>
            <p><span className="text-white/70">Mandal:</span> <span className="font-medium">{card.mandal}</span></p>
            {card.village && <p><span className="text-white/70">Village:</span> <span className="font-medium">{card.village}</span></p>}
            <p><span className="text-white/70">FPS:</span> <span className="font-medium">{(card.assignedFPS as any)?.name || '—'}</span></p>
          </div>
        </div>
        <div className="relative z-10 mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-xs text-white/70">
          <span>{activeMembers.length} active member{activeMembers.length !== 1 ? 's' : ''}</span>
          <span>Government of Telangana · PDS</span>
        </div>
      </div>

      {/* Family members */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Family Members</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
              showAddForm
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            {showAddForm ? 'Cancel' : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Member
              </>
            )}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="bg-slate-50 border border-gray-200 rounded-xl p-5 mb-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" required value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar (12 digits)</label>
                <input type="text" required value={addForm.aadhaar}
                  onChange={(e) => setAddForm({ ...addForm, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none font-mono text-sm"
                  placeholder="XXXX XXXX XXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                <select required value={addForm.relation}
                  onChange={(e) => setAddForm({ ...addForm, relation: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="">Select</option>
                  {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" required value={addForm.dob}
                  onChange={(e) => setAddForm({ ...addForm, dob: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select value={addForm.gender}
                  onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate (optional)</label>
                <input type="file" onChange={(e) => setAddCertificate(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-primary-50 file:text-primary-700 file:font-medium hover:file:bg-primary-100 cursor-pointer" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea required value={addForm.reason}
                onChange={(e) => setAddForm({ ...addForm, reason: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none"
                rows={2} placeholder="Reason for adding this member" />
            </div>
            <button type="submit" disabled={submitting}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50">
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
          </form>
        )}

        {/* Member cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {card.familyMembers.map((member) => (
            <div key={member._id} className={`border rounded-xl p-4 ${
              member.status === 'active' ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50 opacity-60'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    member.gender === 'Female' || member.gender === 'female' ? 'bg-pink-500' :
                    member.gender === 'Male' || member.gender === 'male' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{member.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{member.relation}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span>Born {new Date(member.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                {member.status === 'active' ? (
                  <button onClick={() => setRemoveModal({ memberId: member._id, name: member.name })}
                    className="text-red-600 hover:text-red-700 font-medium">
                    Remove
                  </button>
                ) : (
                  <span className="text-gray-400 font-medium">Removed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Remove modal */}
      {removeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900">Remove Family Member</h3>
            <p className="text-sm text-gray-600">
              Request removal of <span className="font-semibold">{removeModal.name}</span>?
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <textarea required value={removeReason}
                onChange={(e) => setRemoveReason(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                rows={3} placeholder="e.g. Deceased, moved to a different card..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certificate (optional)</label>
              <input type="file" onChange={(e) => setRemoveCertificate(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-primary-50 file:text-primary-700 file:font-medium hover:file:bg-primary-100 cursor-pointer" />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => { setRemoveModal(null); setRemoveReason(''); setRemoveCertificate(null); }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition">
                Cancel
              </button>
              <button onClick={handleRemoveSubmit} disabled={submitting || !removeReason}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50">
                {submitting ? 'Submitting…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Past requests */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Requests</h2>
        {requests.length === 0 ? (
          <p className="text-gray-500 text-sm">No requests submitted yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {requests.map((req) => (
              <div key={req._id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[req.status]}`}>
                    {req.status}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{req.memberName || '—'}</p>
                <p className="text-xs text-gray-500 capitalize mt-0.5">Type: {req.type}</p>
                {req.reviewNotes && (
                  <p className="text-xs text-gray-500 mt-2 border-t border-gray-100 pt-2">
                    {req.reviewNotes}
                  </p>
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
