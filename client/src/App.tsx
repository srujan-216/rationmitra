import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
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
import LandingPage from './pages/LandingPage';
import MyRationCard from './pages/MyRationCard';
import FamilyRequests from './pages/FamilyRequests';
import RationCardManagement from './pages/RationCardManagement';
import RecordDistribution from './pages/RecordDistribution';
import DistributionHistory from './pages/DistributionHistory';
import DigitalReceipt from './pages/DigitalReceipt';
import FileGrievance from './pages/FileGrievance';
import MyGrievances from './pages/MyGrievances';
import GrievanceManagement from './pages/GrievanceManagement';
import AllocationManagement from './pages/AllocationManagement';
import ShopAllocation from './pages/ShopAllocation';
import OfficerDashboard from './pages/OfficerDashboard';

const App = () => {
  return (
    <ErrorBoundary>
    <ThemeProvider>
    <LanguageProvider>
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
            <Route path="/my-ration-card" element={<ProtectedRoute roles={['cardholder']}><MyRationCard /></ProtectedRoute>} />
            <Route path="/distribution-history" element={<ProtectedRoute roles={['cardholder']}><DistributionHistory /></ProtectedRoute>} />
            <Route path="/distribution-receipt/:id" element={<DigitalReceipt />} />
            <Route path="/file-grievance" element={<ProtectedRoute roles={['cardholder']}><FileGrievance /></ProtectedRoute>} />
            <Route path="/my-grievances" element={<ProtectedRoute roles={['cardholder']}><MyGrievances /></ProtectedRoute>} />

            {/* Shop owner routes */}
            <Route path="/queue-manage" element={<ProtectedRoute roles={['shopowner', 'admin', 'sysadmin']}><QueueManage /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute roles={['shopowner', 'admin', 'sysadmin']}><Inventory /></ProtectedRoute>} />
            <Route path="/stock-forecast" element={<ProtectedRoute roles={['shopowner', 'admin', 'sysadmin']}><StockForecast /></ProtectedRoute>} />
            <Route path="/feedback-view" element={<ProtectedRoute roles={['shopowner', 'admin', 'sysadmin']}><FeedbackView /></ProtectedRoute>} />
            <Route path="/face-verify" element={<ProtectedRoute roles={['shopowner', 'admin', 'sysadmin']}><FaceVerify /></ProtectedRoute>} />
            <Route path="/demand-prediction" element={<ProtectedRoute roles={['shopowner', 'admin', 'sysadmin']}><DemandPrediction /></ProtectedRoute>} />
            <Route path="/record-distribution" element={<ProtectedRoute roles={['shopowner']}><RecordDistribution /></ProtectedRoute>} />
            <Route path="/shop-allocation" element={<ProtectedRoute roles={['shopowner']}><ShopAllocation /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin', 'sysadmin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/fraud-alerts" element={<ProtectedRoute roles={['admin', 'sysadmin']}><FraudAlerts /></ProtectedRoute>} />
            <Route path="/ration-card-management" element={<ProtectedRoute roles={['admin', 'sysadmin']}><RationCardManagement /></ProtectedRoute>} />
            <Route path="/family-requests" element={<ProtectedRoute roles={['admin', 'sysadmin']}><FamilyRequests /></ProtectedRoute>} />
            <Route path="/grievance-management" element={<ProtectedRoute roles={['admin', 'sysadmin']}><GrievanceManagement /></ProtectedRoute>} />
            <Route path="/allocation-management" element={<ProtectedRoute roles={['admin', 'sysadmin']}><AllocationManagement /></ProtectedRoute>} />
            <Route path="/officer-dashboard" element={<ProtectedRoute roles={['admin', 'sysadmin']}><OfficerDashboard /></ProtectedRoute>} />
          </Route>

          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </LanguageProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
