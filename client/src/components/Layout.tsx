import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-500">
        <p>RationMitra &copy; 2026 · Smart PDS for Digital Bharat</p>
        <p className="mt-0.5">M.V.S.R. Engineering College</p>
      </footer>
    </div>
  );
};

export default Layout;
