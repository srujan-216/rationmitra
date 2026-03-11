import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const FaceEnroll = () => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      api.get(`/face/enrollment-status/${user._id}`)
        .then(({ data }) => setEnrollmentStatus(data))
        .catch(() => {});
    }
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, [user]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch {
      toast.error('Camera access denied');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCaptured(dataUrl);
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  };

  const enrollFace = async () => {
    if (!captured) return;
    setLoading(true);
    try {
      const base64 = captured.split(',')[1];
      const endpoint = enrollmentStatus?.enrolled ? '/face/update' : '/face/enroll';
      const method = enrollmentStatus?.enrolled ? 'put' : 'post';
      await api[method](endpoint, { image: base64 });
      toast.success(enrollmentStatus?.enrolled ? 'Face updated!' : 'Face enrolled successfully!');
      setEnrollmentStatus({ enrolled: true });
      setCaptured(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Face Enrollment</h1>

      {enrollmentStatus?.enrolled && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-green-800 font-medium">Face already enrolled</p>
          <p className="text-sm text-green-600 mt-1">
            Enrolled: {new Date(enrollmentStatus.enrollmentDate).toLocaleDateString()} |
            Verifications: {enrollmentStatus.verificationCount}
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        {!stream && !captured && (
          <button onClick={startCamera}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition">
            {enrollmentStatus?.enrolled ? 'Update Face Photo' : 'Start Camera'}
          </button>
        )}

        {stream && (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video ref={videoRef} autoPlay playsInline muted className="w-full" />
              <div className="absolute inset-0 border-4 border-dashed border-white/30 m-12 rounded-full pointer-events-none" />
            </div>
            <button onClick={capturePhoto}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition">
              Capture Photo
            </button>
          </div>
        )}

        {captured && (
          <div className="space-y-4">
            <img src={captured} alt="Captured" className="w-full rounded-lg" />
            <div className="flex gap-3">
              <button onClick={() => { setCaptured(null); startCamera(); }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition">
                Retake
              </button>
              <button onClick={enrollFace} disabled={loading}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50">
                {loading ? 'Processing...' : 'Enroll Face'}
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        <div className="text-sm text-gray-500 space-y-1 pt-2 border-t">
          <p>Your face data is encrypted and stored securely.</p>
          <p>Only 128D mathematical embeddings are stored — no raw photos.</p>
        </div>
      </div>
    </div>
  );
};

export default FaceEnroll;
