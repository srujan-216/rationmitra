import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface CommodityAlloc {
  commodityId: string;
  name: string;
  allocatedQty: number;
  receivedQty: number;
  rate: number;
}

interface AllocationData {
  _id: string;
  month: number;
  year: number;
  status: string;
  dispatchDate: string;
  commodities: CommodityAlloc[];
}

const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
  { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
  { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    dispatched: 'bg-blue-100 text-blue-800',
    acknowledged: 'bg-green-100 text-green-800',
    discrepancy: 'bg-red-100 text-red-800',
  };
  return map[status] ?? 'bg-gray-100 text-gray-800';
};

const ShopAllocation = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [allocation, setAllocation] = useState<AllocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchAllocation = useCallback(async () => {
    setLoading(true);
    setAllocation(null);
    try {
      const { data } = await api.get('/allocations/my-shop', { params: { month, year } });
      const alloc = data.allocation ?? data;
      setAllocation(alloc);
      const qtys: Record<string, number> = {};
      alloc.commodities?.forEach((c: CommodityAlloc) => {
        qtys[c.commodityId] = c.receivedQty ?? c.allocatedQty;
      });
      setReceivedQtys(qtys);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        toast.error('Failed to load allocation');
      }
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchAllocation();
  }, [fetchAllocation]);

  const handleQtyChange = (commodityId: string, value: number) => {
    setReceivedQtys((prev) => ({ ...prev, [commodityId]: Math.max(0, value) }));
  };

  const hasDiscrepancy = allocation?.commodities.some(
    (c) => (receivedQtys[c.commodityId] ?? 0) !== c.allocatedQty
  );

  const isEditable = allocation && allocation.status !== 'acknowledged';

  const acknowledgeReceipt = async () => {
    if (!allocation) return;
    setSubmitting(true);
    try {
      const receivedCommodities = allocation.commodities.map((c) => ({
        commodityId: c.commodityId,
        receivedQty: receivedQtys[c.commodityId] ?? 0,
      }));
      await api.put(`/allocations/${allocation._id}/acknowledge`, { receivedCommodities });
      toast.success('Allocation receipt acknowledged');
      fetchAllocation();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to acknowledge receipt');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Shop Allocation</h1>

      {/* Month/Year Selectors */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Month</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
              {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Year</label>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))}
              className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading allocation..." />
      ) : !allocation ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
          No allocation found for the selected period.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Status & Dispatch Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${statusBadge(allocation.status)}`}>
                {allocation.status}
              </span>
              {allocation.dispatchDate && (
                <span className="text-sm text-gray-500">
                  Dispatched: {new Date(allocation.dispatchDate).toLocaleDateString()}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {MONTHS.find((m) => m.value === allocation.month)?.label} {allocation.year}
            </span>
          </div>

          {/* Discrepancy Warning */}
          {hasDiscrepancy && isEditable && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-yellow-800 text-sm font-medium">
                Discrepancy detected: Received quantities differ from allocated quantities.
              </p>
            </div>
          )}

          {/* Commodities Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Commodity</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Allocated Qty</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Received Qty</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Rate</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Match</th>
                </tr>
              </thead>
              <tbody>
                {allocation.commodities.map((c) => {
                  const received = receivedQtys[c.commodityId] ?? 0;
                  const match = received === c.allocatedQty;
                  return (
                    <tr key={c.commodityId} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                      <td className="px-4 py-3 text-gray-600">{c.allocatedQty}</td>
                      <td className="px-4 py-3">
                        {isEditable ? (
                          <input
                            type="number"
                            min={0}
                            value={received}
                            onChange={(e) => handleQtyChange(c.commodityId, Number(e.target.value))}
                            className={`w-24 border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 outline-none ${
                              !match ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'
                            }`}
                          />
                        ) : (
                          <span className={!match ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            {c.receivedQty}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">Rs. {c.rate}</td>
                      <td className="px-4 py-3">
                        {match ? (
                          <span className="text-green-600 text-xs font-medium">OK</span>
                        ) : (
                          <span className="text-red-600 text-xs font-medium">Mismatch</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {isEditable && (
            <button
              onClick={acknowledgeReceipt}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              {submitting ? 'Acknowledging...' : 'Acknowledge Receipt'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopAllocation;
