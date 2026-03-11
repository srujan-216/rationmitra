import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import type { InventoryItem } from '../types';

const Inventory = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    itemName: '',
    quantity: 0,
    transactionType: 'inward' as 'inward' | 'outward',
    unit: 'kg',
    remarks: '',
  });

  const shopId = user?.shopAssignedTo;

  const fetchInventory = async () => {
    if (!shopId) return;
    try {
      const { data } = await api.get(`/inventory/${shopId}`);
      setInventory(data.inventory);
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, [shopId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/inventory/update-stock', { shopId, ...form });
      toast.success('Stock updated');
      setShowForm(false);
      setForm({ itemName: '', quantity: 0, transactionType: 'inward', unit: 'kg', remarks: '' });
      fetchInventory();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  if (!shopId) {
    return <div className="text-center py-12 text-gray-500">No shop assigned to your account.</div>;
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading inventory...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          {showForm ? 'Cancel' : '+ Update Stock'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <input type="text" required value={form.itemName}
                onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="e.g., Rice, Wheat, Sugar" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" required min={1} value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="kg">Kg</option>
                <option value="liter">Liter</option>
                <option value="piece">Piece</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
              <select value={form.transactionType}
                onChange={(e) => setForm({ ...form, transactionType: e.target.value as 'inward' | 'outward' })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="inward">Stock In (Received)</option>
                <option value="outward">Stock Out (Distributed)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <input type="text" value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Optional notes" />
            </div>
            <div className="flex items-end">
              <button type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition">
                Update Stock
              </button>
            </div>
          </div>
        </form>
      )}

      {inventory.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">No inventory items yet. Add stock to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Item</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Current Stock</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Unit</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Reorder Level</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventory.map((item) => (
                <tr key={item._id} className={item.isLowStock ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 font-medium text-gray-800">{item.itemName}</td>
                  <td className="px-6 py-4 text-gray-600">{item.currentStock}</td>
                  <td className="px-6 py-4 text-gray-600 capitalize">{item.unit}</td>
                  <td className="px-6 py-4 text-gray-600">{item.reorderLevel}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.isLowStock ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                      {item.isLowStock ? 'Low Stock' : 'OK'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(item.lastStockUpdate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Inventory;
