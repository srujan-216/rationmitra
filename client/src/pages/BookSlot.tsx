import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import type { Slot } from '../types';

const BookSlot = () => {
  const [shops, setShops] = useState<{ _id: string; name: string }[]>([]);
  const [selectedShop, setSelectedShop] = useState('');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<(Slot & { available: boolean })[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/queue/shops-list').then(({ data }) => setShops(data.shops || [])).catch(() => {});
  }, []);

  const fetchSlots = async () => {
    if (!selectedShop || !date) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/queue/available-slots/${selectedShop}/${date}`);
      setSlots(data.slots);
    } catch {
      toast.error('Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  };

  const bookSlot = async (slotId: string) => {
    try {
      const { data } = await api.post('/queue/book-slot', { shopId: selectedShop, date, slotId });
      toast.success(`Booked! Ticket: ${data.ticketNumber} | Position: ${data.position}`);
      fetchSlots();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Book a Time Slot</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Shop</label>
            <select value={selectedShop} onChange={(e) => setSelectedShop(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="">Choose a shop</option>
              {shops.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
            <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div className="flex items-end">
            <button onClick={fetchSlots} disabled={!selectedShop || !date || loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50">
              {loading ? 'Loading...' : 'View Slots'}
            </button>
          </div>
        </div>
      </div>

      {slots.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {slots.map((slot) => (
            <div key={slot.slotId} className={`rounded-xl border-2 p-5 ${slot.available ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-gray-800">{slot.slotId}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${slot.available ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                  {slot.available ? 'Available' : 'Full'}
                </span>
              </div>
              <p className="text-gray-600">{slot.startTime} - {slot.endTime}</p>
              <p className="text-sm text-gray-500 mt-1">{slot.currentCount}/{slot.capacity} booked</p>
              {slot.available && (
                <button onClick={() => bookSlot(slot.slotId)}
                  className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition">
                  Book This Slot
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookSlot;
