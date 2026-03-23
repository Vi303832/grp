import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar, Footer } from '../components/layout';

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <Outlet />
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontSize: '14px' },
          success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
        }}
      />
    </div>
  );
}
