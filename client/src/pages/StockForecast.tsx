import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface Forecast {
  itemName: string;
  currentStock: number;
  unit: string;
  avgDailyConsumption: number;
  daysUntilDepletion: number | null;
  depletionDate: string | null;
  reorderDate: string | null;
  reorderUrgency: string;
  recommendedReorder: number;
  trend: string;
  isLowStock: boolean;
}

const urgencyColors: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
  unknown: 'bg-gray-100 text-gray-800',
};

const trendIcons: Record<string, string> = {
  increasing: '\u2191',
  decreasing: '\u2193',
  stable: '\u2192',
  insufficient_data: '?',
};

const StockForecast = () => {
  const { user } = useAuth();
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);

  const shopId = user?.shopAssignedTo;

  useEffect(() => {
    if (!shopId) return;

    const fetchForecasts = async () => {
      try {
        // Get inventory first
        const { data: invData } = await api.get(`/inventory/${shopId}`);
        const items = invData.inventory || [];

        if (items.length === 0) {
          setLoading(false);
          return;
        }

        // Call ML batch forecast
        const { data: mlData } = await api.post('/ml/forecast-stock', {
          items: items.map((item: any) => ({
            itemName: item.itemName,
            currentStock: item.currentStock,
            stockHistory: item.stockHistory || [],
            reorderLevel: item.reorderLevel,
          })),
        });

        // ML returns single item forecast; batch via items array
        if (mlData.forecasts) {
          setForecasts(mlData.forecasts);
        } else {
          // Single item fallback
          setForecasts([{ ...mlData, itemName: items[0]?.itemName || 'Item' }]);
        }
      } catch {
        // Fallback: use basic forecast from backend
        try {
          const { data } = await api.get(`/inventory/forecast/${shopId}`);
          setForecasts(
            (data.forecasts || []).map((f: any) => ({
              ...f,
              depletionDate: f.daysUntilDepletion
                ? new Date(Date.now() + f.daysUntilDepletion * 86400000).toISOString().split('T')[0]
                : null,
              reorderDate: f.daysUntilDepletion && f.daysUntilDepletion > 7
                ? new Date(Date.now() + (f.daysUntilDepletion - 7) * 86400000).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
              reorderUrgency: !f.daysUntilDepletion ? 'unknown'
                : f.daysUntilDepletion <= 3 ? 'critical'
                : f.daysUntilDepletion <= 7 ? 'high'
                : f.daysUntilDepletion <= 14 ? 'medium' : 'low',
              recommendedReorder: Math.round((f.avgDailyConsumption || 0) * 14),
              trend: 'insufficient_data',
            }))
          );
        } catch {
          toast.error('Failed to load forecasts');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchForecasts();
  }, [shopId]);

  if (!shopId) return <div className="text-center py-12 text-gray-500">No shop assigned.</div>;
  if (loading) return <div className="text-center py-12 text-gray-500">Loading forecasts...</div>;

  const criticalItems = forecasts.filter((f) => f.reorderUrgency === 'critical' || f.reorderUrgency === 'high');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Stock Depletion Forecast</h1>

      {criticalItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-red-800 mb-2">Urgent Reorder Required</h2>
          <ul className="space-y-1">
            {criticalItems.map((f) => (
              <li key={f.itemName} className="text-sm text-red-700">
                <span className="font-medium">{f.itemName}</span> — {f.daysUntilDepletion ?? 0} days remaining,
                reorder <span className="font-medium">{f.recommendedReorder} {f.unit}</span> immediately
              </li>
            ))}
          </ul>
        </div>
      )}

      {forecasts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">No inventory items to forecast. Add stock first.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {forecasts.map((f) => (
            <div key={f.itemName} className={`bg-white rounded-xl shadow-sm overflow-hidden ${f.isLowStock ? 'ring-2 ring-red-300' : ''}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{f.itemName}</h3>
                    <p className="text-sm text-gray-500">{f.currentStock} {f.unit} remaining</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg" title={`Trend: ${f.trend}`}>{trendIcons[f.trend] || '?'}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${urgencyColors[f.reorderUrgency]}`}>
                      {f.reorderUrgency}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Avg Daily Use</p>
                    <p className="font-semibold">{f.avgDailyConsumption} {f.unit}/day</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Days Until Empty</p>
                    <p className={`font-semibold ${(f.daysUntilDepletion ?? 999) <= 7 ? 'text-red-600' : ''}`}>
                      {f.daysUntilDepletion ?? 'N/A'} days
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Depletion Date</p>
                    <p className="font-semibold">{f.depletionDate || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Recommended Reorder</p>
                    <p className="font-semibold text-primary-600">{f.recommendedReorder} {f.unit}</p>
                  </div>
                </div>

                {f.daysUntilDepletion != null && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Stock Level</span>
                      <span>{f.daysUntilDepletion} days supply</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          f.daysUntilDepletion <= 3 ? 'bg-red-500' :
                          f.daysUntilDepletion <= 7 ? 'bg-yellow-500' :
                          f.daysUntilDepletion <= 14 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, (f.daysUntilDepletion / 30) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {f.reorderDate && f.reorderUrgency !== 'low' && (
                <div className="bg-yellow-50 px-6 py-3 border-t text-sm text-yellow-800">
                  Reorder by <span className="font-medium">{f.reorderDate}</span> to prevent stockout
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockForecast;
