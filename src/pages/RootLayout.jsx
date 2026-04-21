import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar, Footer } from '../components/layout';

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar />
      <Outlet />
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontSize: '14px', fontFamily: 'Manrope, sans-serif', background: '#fcf9f4', color: '#1c1c19', border: '1px solid #c7c7bc' },
          success: { iconTheme: { primary: '#58614e', secondary: '#fff' } },
        }}
      />
    </div>
  );
}
