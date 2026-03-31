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

interface Allocation {
  _id: string;
  shopName: string;
  district: string;
  month: number;
  year: number;
  commodities: CommodityAlloc[];
  status: string;
}

interface Shop {
  _id: string;
  name: string;
  district: string;
}

interface CommodityInput {
  commodityId: string;
  name: string;
  allocatedQty: number;
  rate: number;
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

const AllocationManagement = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [district, setDistrict] = useState('all');
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [districts, setDistricts] = useState<string[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [formMonth, setFormMonth] = useState(month);
  const [formYear, setFormYear] = useState(year);
  const [formDistrict, setFormDistrict] = useState('');
  const [formShopId, setFormShopId] = useState('');
  const [commodityInputs, setCommodityInputs] = useState<CommodityInput[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchAllocations = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { month, year };
      if (district !== 'all') params.district = district;
      const { data } = await api.get('/allocations/all', { params });
      setAllocations(data.allocations ?? data.data ?? data);
      if (data.districts) setDistricts(data.districts);
    } catch {
      toast.error('Failed to load allocations');
    } finally {
      setLoading(false);
    }
  }, [month, year, district]);

  useEffect(() => {
    fetchAllocations();
  }, [fetchAllocations]);

  // Load districts & shops for the form
  useEffect(() => {
    if (showForm) {
      api.get('/allocations/districts').then(({ data }) => {
        setDistricts(data.districts ?? data);
      }).catch(() => {});
      api.get('/allocations/shops').then(({ data }) => {
        setShops(data.shops ?? data);
      }).catch(() => {});
      api.get('/allocations/commodities').then(({ data }) => {
        const commodities = data.commodities ?? data;
        setCommodityInputs(
          commodities.map((c: any) => ({
            commodityId: c._id,
            name: c.name,
            allocatedQty: 0,
            rate: c.rate ?? 0,
          }))
        );
      }).catch(() => {});
    }
  }, [showForm]);

  const filteredShops = formDistrict
    ? shops.filter((s) => s.district === formDistrict)
    : shops;

  const handleCommodityChange = (idx: number, field: 'allocatedQty' | 'rate', value: number) => {
    setCommodityInputs((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!formDistrict) {
      toast.error('Please select a district');
      return;
    }
    if (!bulkMode && !formShopId) {
      toast.error('Please select a shop');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        month: formMonth,
        year: formYear,
        district: formDistrict,
        shopId: bulkMode ? undefined : formShopId,
        bulkMode,
        commodities: commodityInputs.map((c) => ({
          commodityId: c.commodityId,
          allocatedQty: c.allocatedQty,
          rate: c.rate,
        })),
      };
      await api.post('/allocations/', payload);
      toast.success(bulkMode ? 'Bulk allocation created for all shops in district' : 'Allocation created successfully');
      setShowForm(false);
      fetchAllocations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create allocation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Allocation Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg font-medium transition"
        >
          {showForm ? 'Close Form' : 'Create Allocation'}
        </button>
      </div>

      {/* Create Allocation Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {bulkMode ? 'Bulk Create Allocation' : 'Create Allocation'}
          </h2>

          <div className="flex items-center gap-3 mb-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={bulkMode}
                onChange={(e) => setBulkMode(e.target.checked)}
                className="rounded border-gray-300"
              />
              Bulk Mode (apply to all shops in district)
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select value={formMonth} onChange={(e) => setFormMonth(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input type="number" value={formYear} onChange={(e) => setFormYear(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <select value={formDistrict} onChange={(e) => setFormDistrict(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">Select District</option>
                {districts.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {!bulkMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop</label>
                <select value={formShopId} onChange={(e) => setFormShopId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="">Select Shop</option>
                  {filteredShops.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Commodities Grid */}
          {commodityInputs.length > 0 && (
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Commodity</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Allocated Qty</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Rate (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  {commodityInputs.map((c, idx) => (
                    <tr key={c.commodityId} className="border-t border-gray-100">
                      <td className="px-4 py-2 font-medium text-gray-800">{c.name}</td>
                      <td className="px-4 py-2">
                        <input type="number" min={0} value={c.allocatedQty}
                          onChange={(e) => handleCommodityChange(idx, 'allocatedQty', Number(e.target.value))}
                          className="w-28 border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 outline-none" />
                      </td>
                      <td className="px-4 py-2">
                        <input type="number" min={0} step={0.01} value={c.rate}
                          onChange={(e) => handleCommodityChange(idx, 'rate', Number(e.target.value))}
                          className="w-28 border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 outline-none" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button onClick={handleSubmit} disabled={submitting}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-lg font-medium transition disabled:opacity-50">
            {submitting ? 'Creating...' : bulkMode ? 'Bulk Create Allocation' : 'Create Allocation'}
          </button>
        </div>
      )}

      {/* Filters */}
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
          <div>
            <label className="block text-xs text-gray-500 mb-1">District</label>
            <select value={district} onChange={(e) => setDistrict(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="all">All Districts</option>
              {districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {loading ? (
        <LoadingSpinner message="Loading allocations..." />
      ) : allocations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-lg mx-auto">
          <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No Allocations Found</h2>
          <p className="text-gray-500 text-sm">No allocations found for the selected period. You can create a new allocation using the button above.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Shop Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">District</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Commodities</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((alloc) => (
                  <tr key={alloc._id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{alloc.shopName}</td>
                    <td className="px-4 py-3 text-gray-600">{alloc.district}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {alloc.commodities.map((c, idx) => (
                          <span key={idx} className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {c.name}: {c.allocatedQty}/{c.receivedQty}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(alloc.status)}`}>
                        {alloc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {allocations.map((alloc) => (
              <div key={alloc._id} className="bg-white rounded-xl shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{alloc.shopName}</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(alloc.status)}`}>
                    {alloc.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{alloc.district}</p>
                <div className="flex flex-wrap gap-1">
                  {alloc.commodities.map((c, idx) => (
                    <span key={idx} className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {c.name}: {c.allocatedQty}/{c.receivedQty}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AllocationManagement;
