import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookSlot from './pages/BookSlot';
import MyBookings from './pages/MyBookings';
import QueueManage from './pages/QueueManage';
import Inventory from './pages/Inventory';
import StockForecast from './pages/StockForecast';
import FeedbackView from './pages/FeedbackView';
import SubmitFeedback from './pages/SubmitFeedback';
import AdminDashboard from './pages/AdminDashboard';
import FaceEnroll from './pages/FaceEnroll';
import FaceVerify from './pages/FaceVerify';
import DemandPrediction from './pages/DemandPrediction';
import FraudAlerts from './pages/FraudAlerts';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notifications" element={<Notifications />} />

            {/* Cardholder routes */}
            <Route path="/book-slot" element={<ProtectedRoute roles={['cardholder']}><BookSlot /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/submit-feedback" element={<ProtectedRoute roles={['cardholder']}><SubmitFeedback /></ProtectedRoute>} />
            <Route path="/face-enroll" element={<FaceEnroll />} />

            {/* Shop owner routes */}
            <Route path="/queue-manage" element={<ProtectedRoute roles={['shopowner', 'admin', 'sysadmin']}><QueueManage /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute roles={['shopowner', 'admin', 'sysadmin']}><Inventory /></ProtectedRoute>} />
            <Route path="/stock-forecast" element={<ProtectedRoute roles={['shopowner', 'admin', 'sysadmin']}><StockForecast /></ProtectedRoute>} />
            <Route path="/feedback-view" element={<ProtectedRoute roles={['shopowner', 'admin', 'sysadmin']}><FeedbackView /></ProtectedRoute>} />
            <Route path="/face-verify" element={<ProtectedRoute roles={['shopowner', 'admin', 'sysadmin']}><FaceVerify /></ProtectedRoute>} />
            <Route path="/demand-prediction" element={<ProtectedRoute roles={['shopowner', 'admin', 'sysadmin']}><DemandPrediction /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin', 'sysadmin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/fraud-alerts" element={<ProtectedRoute roles={['admin', 'sysadmin']}><FraudAlerts /></ProtectedRoute>} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
