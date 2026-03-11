import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import type { Booking } from '../types';

const statusColors: Record<string, string> = {
  waiting: 'bg-yellow-100 text-yellow-800',
  in_service: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  no_show: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/queue/my-bookings');
      setBookings(data.bookings);
    } catch {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const cancelBooking = async (bookingId: string) => {
    try {
      await api.delete(`/queue/cancel-booking/${bookingId}`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading bookings...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">No bookings yet. Book a slot to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-800">{b.shop?.name || 'Shop'}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(b.date).toLocaleDateString()} | {b.slot.startTime} - {b.slot.endTime}
                </p>
                <p className="text-sm text-gray-600 mt-1">Ticket: <span className="font-mono font-medium">{b.ticketNumber}</span></p>
                {b.position && <p className="text-sm text-primary-600 mt-1">Queue Position: #{b.position}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[b.status]}`}>
                  {b.status.replace('_', ' ')}
                </span>
                {b.status === 'waiting' && (
                  <button onClick={() => cancelBooking(b.queueId)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
