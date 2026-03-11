import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SubmitFeedback = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState<{ _id: string; name: string }[]>([]);
  const [form, setForm] = useState({ shopId: '', rating: 5, textFeedback: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/queue/shops-list').then(({ data }) => setShops(data.shops || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          <select required value={form.shopId} onChange={(e) => setForm({ ...form, shopId: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
            <option value="">Choose a shop</option>
            {shops.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setForm({ ...form, rating: star })}
                className={`text-3xl transition ${star <= form.rating ? 'text-yellow-400' : 'text-gray-300'} hover:scale-110`}>
                &#9733;
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Feedback</label>
          <textarea rows={4} value={form.textFeedback}
            onChange={(e) => setForm({ ...form, textFeedback: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            placeholder="Share your experience..." />
        </div>

        <button type="submit" disabled={loading || !form.shopId}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default SubmitFeedback;
