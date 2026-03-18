import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SubmitFeedback = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState<{ _id: string; name: string }[]>([]);
  const [form, setForm] = useState({ shopId: '', rating: 0, textFeedback: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get('/queue/shops-list').then(({ data }) => setShops(data.shops || [])).catch(() => {});
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.shopId) errs.shopId = 'Please select a shop';
    if (form.rating < 1 || form.rating > 5) errs.rating = 'Please select a rating (1-5)';
    if (form.textFeedback.trim().length < 10) errs.textFeedback = 'Feedback must be at least 10 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/feedback/submit', form);
      toast.success('Thank you for your feedback!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Submit Feedback</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Shop</label>
          <select value={form.shopId} onChange={(e) => { setForm({ ...form, shopId: e.target.value }); if (errors.shopId) setErrors({ ...errors, shopId: '' }); }}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${errors.shopId ? 'border-red-400' : 'border-gray-300'}`}>
            <option value="">Choose a shop</option>
            {shops.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          {errors.shopId && <p className="text-red-500 text-xs mt-1">{errors.shopId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => { setForm({ ...form, rating: star }); if (errors.rating) setErrors({ ...errors, rating: '' }); }}
                className={`text-3xl transition ${star <= form.rating ? 'text-yellow-400' : 'text-gray-300'} hover:scale-110`}>
                &#9733;
              </button>
            ))}
          </div>
          {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Feedback</label>
          <textarea rows={4} value={form.textFeedback}
            onChange={(e) => { setForm({ ...form, textFeedback: e.target.value }); if (errors.textFeedback) setErrors({ ...errors, textFeedback: '' }); }}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none ${errors.textFeedback ? 'border-red-400' : 'border-gray-300'}`}
            placeholder="Share your experience (at least 10 characters)..." />
          {errors.textFeedback && <p className="text-red-500 text-xs mt-1">{errors.textFeedback}</p>}
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default SubmitFeedback;
