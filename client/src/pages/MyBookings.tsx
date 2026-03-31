import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import type { Booking } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { QRCodeSVG } from 'qrcode.react';

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
  const [qrBooking, setQrBooking] = useState<Booking | null>(null);

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

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(bookings.length / PAGE_SIZE);
  const paged = bookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <LoadingSpinner message="Loading bookings..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">No bookings yet. Book a slot to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paged.map((b, i) => (
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
                <button onClick={() => setQrBooking(b)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Show QR
                </button>
                {b.status === 'waiting' && (
                  <button onClick={() => cancelBooking(b.queueId)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition">Previous</button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition">Next</button>
            </div>
          )}
        </div>
      )}
      {/* QR Code Modal */}
      {qrBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setQrBooking(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Queue Ticket</h3>
            <p className="text-sm text-gray-500 mb-4">{qrBooking.shop?.name || 'Shop'}</p>
            <div className="flex justify-center mb-4">
              <QRCodeSVG
                value={JSON.stringify({
                  ticket: qrBooking.ticketNumber,
                  shop: qrBooking.shop?.name,
                  date: qrBooking.date,
                  slot: `${qrBooking.slot.startTime}-${qrBooking.slot.endTime}`,
                  status: qrBooking.status,
                })}
                size={200}
                level="M"
              />
            </div>
            <p className="text-2xl font-mono font-bold text-primary-600 mb-1">{qrBooking.ticketNumber}</p>
            <p className="text-sm text-gray-500">{new Date(qrBooking.date).toLocaleDateString()} | {qrBooking.slot.startTime} - {qrBooking.slot.endTime}</p>
            <button onClick={() => setQrBooking(null)}
              className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
