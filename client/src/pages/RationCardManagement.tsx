import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { TELANGANA_DISTRICTS, CARD_TYPES } from '../utils/telangana';

interface RationCardRow {
  _id: string;
  cardNumber: string;
  cardType: string;
  headOfFamily: { name: string; email: string };
  district: string;
  mandal: string;
  assignedFPS: { name: string } | null;
  familyMembers: { status: string }[];
}

interface SearchResults {
  cards: RationCardRow[];
  total: number;
  page: number;
  pages: number;
}

interface Shop {
  _id: string;
  name: string;
}

const CARD_TYPE_COLORS: Record<string, string> = {
  AAY: 'bg-red-100 text-red-800',
  PHH: 'bg-blue-100 text-blue-800',
  APL: 'bg-green-100 text-green-800',
  Annapurna: 'bg-purple-100 text-purple-800',
};

const RationCardManagement = () => {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState({
    cardNumber: '',
    district: '',
    cardType: '',
  });

  const [createForm, setCreateForm] = useState({
    cardNumber: '',
    cardType: '',
    headOfFamilyEmail: '',
    district: '',
    mandal: '',
    village: '',
    assignedFPS: '',
  });

  const fetchShops = async () => {
    try {
      const { data } = await api.get('/shops/list');
      setShops(data.shops || []);
    } catch {
      // shops list may not be critical
    }
  };

  useEffect(() => { fetchShops(); }, []);

  const handleSearch = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.cardNumber) params.append('cardNumber', search.cardNumber);
      if (search.district) params.append('district', search.district);
      if (search.cardType) params.append('cardType', search.cardType);
      params.append('page', String(p));

      const { data } = await api.get(`/ration-cards/search?${params.toString()}`);
      setResults(data);
      setPage(p);
    } catch {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/ration-cards', {
        cardNumber: createForm.cardNumber,
        cardType: createForm.cardType,
        headOfFamilyEmail: createForm.headOfFamilyEmail,
        district: createForm.district,
        mandal: createForm.mandal,
        village: createForm.village,
        assignedFPS: createForm.assignedFPS || undefined,
      });
      toast.success('Ration card created successfully');
      setShowCreateForm(false);
      setCreateForm({ cardNumber: '', cardType: '', headOfFamilyEmail: '', district: '', mandal: '', village: '', assignedFPS: '' });
      handleSearch(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create ration card');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Ration Card Management</h1>
        <button onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          {showCreateForm ? 'Cancel' : '+ Create New Card'}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Ration Card</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <input type="text" required value={createForm.cardNumber}
                onChange={(e) => setCreateForm({ ...createForm, cardNumber: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="e.g., TS-1234567890" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
              <select required value={createForm.cardType}
                onChange={(e) => setCreateForm({ ...createForm, cardType: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">Select type</option>
                {CARD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Head of Family (Email)</label>
              <input type="email" required value={createForm.headOfFamilyEmail}
                onChange={(e) => setCreateForm({ ...createForm, headOfFamilyEmail: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="user@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <select required value={createForm.district}
                onChange={(e) => setCreateForm({ ...createForm, district: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">Select district</option>
                {TELANGANA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mandal</label>
              <input type="text" required value={createForm.mandal}
                onChange={(e) => setCreateForm({ ...createForm, mandal: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Mandal name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
              <input type="text" required value={createForm.village}
                onChange={(e) => setCreateForm({ ...createForm, village: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Village name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned FPS</label>
              <select value={createForm.assignedFPS}
                onChange={(e) => setCreateForm({ ...createForm, assignedFPS: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">Select shop</option>
                {shops.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50">
                {submitting ? 'Creating...' : 'Create Card'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
            <input type="text" value={search.cardNumber}
              onChange={(e) => setSearch({ ...search, cardNumber: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Search by card number" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select value={search.district}
              onChange={(e) => setSearch({ ...search, district: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="">All Districts</option>
              {TELANGANA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
            <select value={search.cardType}
              onChange={(e) => setSearch({ ...search, cardType: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="">All Types</option>
              {CARD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => handleSearch(1)}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSpinner message="Searching ration cards..." />
      ) : results ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {results.cards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No ration cards found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Card Number</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Type</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Head of Family</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">District</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Mandal</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">FPS</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Members</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {results.cards.map((card) => (
                      <tr key={card._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800 text-sm">{card.cardNumber}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${CARD_TYPE_COLORS[card.cardType] || 'bg-gray-100 text-gray-800'}`}>
                            {card.cardType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{card.headOfFamily?.name || '-'}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{card.district}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{card.mandal}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{card.assignedFPS?.name || '-'}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{card.familyMembers?.filter(m => m.status === 'active').length ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {results.pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Page {results.page} of {results.pages} ({results.total} total)
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => handleSearch(page - 1)} disabled={page <= 1}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      Previous
                    </button>
                    <button onClick={() => handleSearch(page + 1)} disabled={page >= results.pages}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">Use the search bar above to find ration cards.</p>
        </div>
      )}
    </div>
  );
};

export default RationCardManagement;
