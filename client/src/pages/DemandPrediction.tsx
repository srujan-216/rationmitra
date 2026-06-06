import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface Prediction {
  date: string;
  dayOfWeek: string;
  predictedFootfall: number;
  confidenceInterval: [number, number];
}

interface SlotRec {
  slotId: string;
  startTime: string;
  endTime: string;
  predictedLoad: number;
  loadPercentage: number;
  recommendation: 'low' | 'medium' | 'high';
}

const recColors = { low: 'bg-green-100 text-green-800', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-red-100 text-red-800' };

const DemandPrediction = () => {
  const [shops, setShops] = useState<{ _id: string; name: string }[]>([]);
  const [selectedShop, setSelectedShop] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [slotRecs, setSlotRecs] = useState<SlotRec[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/queue/shops-list').then(({ data }) => setShops(data.shops || [])).catch(() => {});
  }, []);

  const fetchPredictions = async () => {
    if (!selectedShop) return;
    setLoading(true);
    setPredictions([]);
    setSlotRecs([]);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await api.post('/ml/predict-demand', { shopId: selectedShop, date: today, numDays: 7 });
      setPredictions(data.predictions || []);
    } catch {
      toast.error('Prediction service unavailable');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlotRecs = async (date: string) => {
    try {
      const { data } = await api.post('/ml/recommend-slots', {
        shopId: selectedShop,
        date,
        slots: [
          { slotId: 'SLOT-1', startTime: '08:00', endTime: '10:00', capacity: 50 },
          { slotId: 'SLOT-2', startTime: '10:00', endTime: '12:00', capacity: 50 },
          { slotId: 'SLOT-3', startTime: '12:00', endTime: '14:00', capacity: 50 },
          { slotId: 'SLOT-4', startTime: '14:00', endTime: '16:00', capacity: 50 },
          { slotId: 'SLOT-5', startTime: '16:00', endTime: '18:00', capacity: 50 },
          { slotId: 'SLOT-6', startTime: '18:00', endTime: '20:00', capacity: 50 },
        ],
      });
      setSlotRecs(data.slotRecommendations || []);
    } catch {
      toast.error('Failed to get slot recommendations');
    }
  };

  const maxFootfall = Math.max(...predictions.map((p) => p.confidenceInterval[1]), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Demand Prediction</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Shop</label>
            <select value={selectedShop} onChange={(e) => setSelectedShop(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="">Choose a shop</option>
              {shops.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <button onClick={fetchPredictions} disabled={!selectedShop || loading}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50">
            {loading ? 'Loading...' : 'Predict Next 7 Days'}
          </button>
        </div>
      </div>

      {predictions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">7-Day Footfall Forecast</h2>
          <div className="space-y-3">
            {predictions.map((p) => (
              <div key={p.date} className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                onClick={() => fetchSlotRecs(p.date)}>
                <div className="w-24 text-sm">
                  <p className="font-medium text-gray-800">{p.dayOfWeek.slice(0, 3)}</p>
                  <p className="text-gray-500 text-xs">{p.date}</p>
                </div>
                <div className="flex-1">
                  <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                    <div className="absolute h-full bg-primary-200 rounded-full"
                      style={{ width: `${(p.confidenceInterval[1] / maxFootfall) * 100}%` }} />
                    <div className="absolute h-full bg-primary-500 rounded-full"
                      style={{ width: `${(p.predictedFootfall / maxFootfall) * 100}%` }} />
                    <span className="absolute inset-0 flex items-center pl-3 text-sm font-medium text-white drop-shadow">
                      {p.predictedFootfall} people
                    </span>
                  </div>
                </div>
                <div className="w-24 text-right text-xs text-gray-400">
                  {p.confidenceInterval[0]}–{p.confidenceInterval[1]}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">Click a day to see slot-level recommendations</p>
        </div>
      )}

      {slotRecs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Slot Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slotRecs.map((s) => (
              <div key={s.slotId} className="border rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-800">{s.slotId}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${recColors[s.recommendation]}`}>
                    {s.recommendation} demand
                  </span>
                </div>
                <p className="text-sm text-gray-600">{s.startTime} - {s.endTime}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Predicted: {s.predictedLoad}</span>
                    <span>{s.loadPercentage}% load</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${s.recommendation === 'low' ? 'bg-green-500' : s.recommendation === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(s.loadPercentage, 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandPrediction;
