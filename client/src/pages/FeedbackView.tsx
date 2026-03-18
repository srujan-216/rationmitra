import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface ShopSentiment {
  totalFeedbacks: number;
  averageRating: number;
  sentimentDistribution: { positive: number; neutral: number; negative: number };
  recentFeedbacks: {
    _id: string;
    rating: number;
    textFeedback: string;
    sentiment?: string;
    createdAt: string;
  }[];
}

const FeedbackView = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ShopSentiment | null>(null);
  const [loading, setLoading] = useState(true);

  const shopId = user?.shopAssignedTo;

  useEffect(() => {
    if (!shopId) return;
    api.get(`/feedback/shop-sentiment/${shopId}`)
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Failed to load feedback'))
      .finally(() => setLoading(false));
  }, [shopId]);

  if (!shopId) return <div className="text-center py-12 text-gray-500">No shop assigned.</div>;
  if (loading) return <LoadingSpinner message="Loading feedback..." />;
  if (!data) return null;

  const total = data.sentimentDistribution.positive + data.sentimentDistribution.neutral + data.sentimentDistribution.negative;
  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Customer Feedback</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-sm text-gray-500">Average Rating</p>
          <p className="text-4xl font-bold text-primary-600 mt-2">{data.averageRating}<span className="text-lg text-gray-400">/5</span></p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-sm text-gray-500">Total Feedbacks</p>
          <p className="text-4xl font-bold text-gray-800 mt-2">{data.totalFeedbacks}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-3">Sentiment Distribution</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs w-16 text-green-700">Positive</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${pct(data.sentimentDistribution.positive)}%` }}></div>
              </div>
              <span className="text-xs w-8 text-right">{pct(data.sentimentDistribution.positive)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-16 text-yellow-700">Neutral</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${pct(data.sentimentDistribution.neutral)}%` }}></div>
              </div>
              <span className="text-xs w-8 text-right">{pct(data.sentimentDistribution.neutral)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-16 text-red-700">Negative</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${pct(data.sentimentDistribution.negative)}%` }}></div>
              </div>
              <span className="text-xs w-8 text-right">{pct(data.sentimentDistribution.negative)}%</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Feedback</h2>
      {data.recentFeedbacks.length === 0 ? (
        <p className="text-gray-500">No feedback yet.</p>
      ) : (
        <div className="space-y-3">
          {data.recentFeedbacks.map((f) => (
            <div key={f._id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-lg ${star <= f.rating ? 'text-yellow-400' : 'text-gray-300'}`}>&#9733;</span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {f.sentiment && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      f.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                      f.sentiment === 'negative' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>{f.sentiment}</span>
                  )}
                  <span className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {f.textFeedback && <p className="text-gray-600 text-sm">{f.textFeedback}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackView;
