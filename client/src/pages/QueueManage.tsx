import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { io as socketIO, Socket } from 'socket.io-client';
import LoadingSpinner from '../components/LoadingSpinner';

interface QueueEntry {
  _id: string;
  userId: string;
  userName: string;
  ticketNumber: string;
  status: 'waiting' | 'in_service' | 'completed' | 'no_show' | 'cancelled';
  joinedAt: string;
  servedAt?: string;
  serviceTime?: number;
}

interface QueueSlot {
  _id: string;
  slot: { slotId: string; startTime: string; endTime: string; capacity: number; currentCount: number };
  queueEntries: QueueEntry[];
}

const QueueManage = () => {
  const { user } = useAuth();
  const [queues, setQueues] = useState<QueueSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  const shopId = user?.shopAssignedTo;

  const fetchQueues = useCallback(async () => {
    if (!shopId) return;
    try {
      const { data } = await api.get(`/queue/live-status/${shopId}`);
      setQueues(data.status || []);
    } catch {
      toast.error('Failed to load queue data');
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchQueues();

    const token = localStorage.getItem('accessToken');
    if (shopId && token) {
      const s = socketIO(import.meta.env.VITE_API_URL || window.location.origin, { auth: { token } });
      s.emit('queue:join-room', shopId);
      s.on('queue:completed', () => fetchQueues());
      s.on('queue:position-update', () => fetchQueues());
      s.on('queue:new-booking', () => fetchQueues());
      setSocket(s);
      return () => { s.disconnect(); };
    }
  }, [shopId, fetchQueues]);

  const markServed = async (queueId: string, entryId: string) => {
    try {
      await api.post('/queue/mark-served', { queueId, entryId });
      toast.success('Marked as served');
      fetchQueues();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const callNext = async (queueId: string, entryId: string) => {
    try {
      await api.post('/queue/call-next', { queueId, entryId });
      toast.success('Called next in queue');
      fetchQueues();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (!shopId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No shop assigned to your account. Contact admin.</p>
      </div>
    );
  }

  if (loading) return <LoadingSpinner message="Loading queue..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Queue Management</h1>
        <button onClick={fetchQueues} className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-200 transition">
          Refresh
        </button>
      </div>

      {queues.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">No queues for today yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {queues.map((q: any, idx: number) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-primary-50 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-primary-800">{q.slot?.slotId || `Slot ${idx + 1}`}</h3>
                  <p className="text-sm text-primary-600">{q.slot?.startTime} - {q.slot?.endTime}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">Waiting: {q.waiting}</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">In Service: {q.inService}</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">Completed: {q.completed}</span>
                </div>
              </div>

              {q.currentServing && (
                <div className="bg-blue-50 px-6 py-3 border-b">
                  <p className="text-sm text-blue-800">Currently serving: <span className="font-mono font-bold">{q.currentServing}</span></p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QueueManage;
