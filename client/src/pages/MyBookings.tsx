import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import type { Booking } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { QRCodeSVG } from 'qrcode.react';

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  waiting:    { bg: 'bg-amber-50',    text: 'text-amber-700',    label: 'Waiting',     dot: 'bg-amber-500' },
  in_service: { bg: 'bg-blue-50',     text: 'text-blue-700',     label: 'In Service',  dot: 'bg-blue-500 animate-pulse' },
  completed:  { bg: 'bg-emerald-50',  text: 'text-emerald-700',  label: 'Completed',   dot: 'bg-emerald-500' },
  no_show:    { bg: 'bg-gray-100',    text: 'text-gray-600',     label: 'No Show',     dot: 'bg-gray-400' },
  cancelled:  { bg: 'bg-red-50',      text: 'text-red-700',      label: 'Cancelled',   dot: 'bg-red-500' },
};

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrBooking, setQrBooking] = useState<Booking | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'past'>('all');

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

  const filtered = bookings.filter((b) => {
    if (filter === 'active') return b.status === 'waiting' || b.status === 'in_service';
    if (filter === 'past') return b.status === 'completed' || b.status === 'cancelled' || b.status === 'no_show';
    return true;
  });

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <LoadingSpinner message="Loading bookings..." />;

  const counts = {
    all: bookings.length,
    active: bookings.filter((b) => b.status === 'waiting' || b.status === 'in_service').length,
    past: bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled' || b.status === 'no_show').length,
  };

  return (
    <div>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Your slot bookings and ticket history</p>
        </div>
        <Link
          to="/book-slot"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Booking
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="inline-flex gap-1 p-1 bg-gray-100 rounded-lg mb-5">
        {(['all', 'active', 'past'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Past'}{' '}
            <span className={`text-xs ${filter === f ? 'text-gray-500' : 'text-gray-400'}`}>
              ({counts[f]})
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3M16 7V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-700 font-medium">No bookings {filter !== 'all' ? `in ${filter}` : 'yet'}</p>
          <p className="text-sm text-gray-500 mt-1">Book a slot to reserve your time at an FPS.</p>
          <Link to="/book-slot" className="inline-block mt-4 text-primary-600 hover:underline font-semibold text-sm">
            Book your first slot →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {paged.map((b, i) => {
            const s = STATUS_STYLE[b.status] || STATUS_STYLE.waiting;
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{b.shop?.name || 'Shop'}</h3>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3M16 7V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {b.slot.startTime} – {b.slot.endTime}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h6M9 19h6M12 3v18M5 12h14" />
                        </svg>
                        {b.ticketNumber}
                      </span>
                    </div>
                    {b.position != null && b.position > 0 && (
                      <p className="text-sm text-primary-700 font-medium mt-2">
                        Position in queue: <span className="font-bold">#{b.position}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setQrBooking(b)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition flex items-center gap-1.5"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h4v4H4V4zM4 16h4v4H4v-4zM16 4h4v4h-4V4zM16 12h4v4h-4v-4zM16 20h4v.01H16V20zM10 4v4M10 12h4M10 16v4M20 12v.01" />
                      </svg>
                      QR
                    </button>
                    {b.status === 'waiting' && (
                      <button
                        onClick={() => cancelBooking(b.queueId)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition">
                ← Previous
              </button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition">
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* QR Modal */}
      {qrBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setQrBooking(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900">Your Ticket</h3>
            <p className="text-sm text-gray-500 mt-1">{qrBooking.shop?.name}</p>
            <div className="my-6 p-4 bg-gray-50 rounded-xl inline-block">
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
            <p className="text-2xl font-mono font-bold text-primary-700">{qrBooking.ticketNumber}</p>
            <p className="text-sm text-gray-600 mt-2">
              {new Date(qrBooking.date).toLocaleDateString()} · {qrBooking.slot.startTime}–{qrBooking.slot.endTime}
            </p>
            <p className="text-xs text-gray-500 mt-3">Show this QR at the shop counter</p>
            <button onClick={() => setQrBooking(null)}
              className="mt-6 w-full px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
