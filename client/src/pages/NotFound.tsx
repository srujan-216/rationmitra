import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center">
    <h1 className="text-6xl font-bold text-primary-600">404</h1>
    <p className="text-gray-500 mt-4 mb-8">Page not found</p>
    <Link to="/dashboard" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition">
      Go to Dashboard
    </Link>
  </div>
);

export default NotFound;
