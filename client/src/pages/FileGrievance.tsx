import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface Shop {
  _id: string;
  shopName: string;
}

const GRIEVANCE_TYPES = ['quality', 'quantity', 'denial', 'corruption', 'other'] as const;

const FileGrievance = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successNumber, setSuccessNumber] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: '',
    shopId: '',
    description: '',
  });
  const [attachment, setAttachment] = useState<File | null>(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const { data } = await api.get('/shops');
        setShops(data.shops || data);
      } catch {
        toast.error('Failed to load shops');
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.description.length < 20) {
      toast.error('Description must be at least 20 characters');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('type', form.type);
      formData.append('shopId', form.shopId);
      formData.append('description', form.description);
      if (attachment) formData.append('attachment', attachment);

      const { data } = await api.post('/grievances', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessNumber(data.grievanceNumber || data.grievance?.grievanceNumber);
      setForm({ type: '', shopId: '', description: '' });
      setAttachment(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to file grievance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading..." />;

  if (successNumber) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Grievance Filed Successfully</h2>
          <p className="text-gray-600">Your grievance number is:</p>
          <p className="text-2xl font-bold text-primary-600">{successNumber}</p>
          <p className="text-sm text-gray-500">Please save this number for tracking your grievance.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link to="/my-grievances"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium transition text-center">
              Track My Grievances
            </Link>
            <button onClick={() => setSuccessNumber(null)}
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2.5 rounded-lg font-medium transition">
              File Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">File a Grievance</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Grievance Type</label>
          <select required value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
            <option value="">Select type</option>
            {GRIEVANCE_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fair Price Shop</label>
          <select required value={form.shopId}
            onChange={(e) => setForm({ ...form, shopId: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
            <option value="">Select shop</option>
            {shops.map((s) => (
              <option key={s._id} value={s._id}>{s.shopName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-gray-400 font-normal">(min 20 characters)</span>
          </label>
          <textarea required value={form.description} minLength={20}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            rows={4} placeholder="Describe your grievance in detail..." />
          <p className="text-xs text-gray-400 mt-1">{form.description.length}/20 characters minimum</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attachment <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input type="file" onChange={(e) => setAttachment(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>

        <button type="submit" disabled={submitting}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50">
          {submitting ? 'Submitting...' : 'Submit Grievance'}
        </button>
      </form>
    </div>
  );
};

export default FileGrievance;
