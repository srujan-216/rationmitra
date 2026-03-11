import { useState, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const FaceVerify = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [userId, setUserId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setResult(null);
    } catch {
      toast.error('Camera access denied');
    }
  };

  const verifyFace = async () => {
    if (!videoRef.current || !canvasRef.current || !userId) {
      toast.error('Please enter User ID and start camera');
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    setLoading(true);
    try {
      const { data } = await api.post('/face/verify', { userId, liveImage: base64 });
      setResult(data);
      if (data.verified) {
        toast.success('Identity verified!');
      } else {
        toast.error('Verification failed — face mismatch');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Verification error');
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Face Verification</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">User / Cardholder ID</label>
          <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="Enter user ID to verify" />
        </div>

        {!stream ? (
          <button onClick={startCamera}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition">
            Start Camera
          </button>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video ref={videoRef} autoPlay playsInline muted className="w-full" />
            </div>
            <div className="flex gap-3">
              <button onClick={stopCamera}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition">
                Stop Camera
              </button>
              <button onClick={verifyFace} disabled={loading || !userId}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50">
                {loading ? 'Verifying...' : 'Verify Now'}
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {result && (
          <div className={`rounded-xl p-5 ${result.verified ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-2xl`}>{result.verified ? '\u2713' : '\u2717'}</span>
              <h3 className={`font-bold text-lg ${result.verified ? 'text-green-800' : 'text-red-800'}`}>
                {result.verified ? 'VERIFIED' : 'MISMATCH'}
              </h3>
            </div>
            <p className={`text-sm ${result.verified ? 'text-green-600' : 'text-red-600'}`}>
              Confidence: {(result.confidence * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 mt-1">{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceVerify;
