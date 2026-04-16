import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import useTheme from '@/hooks/useTheme';

export default function FrontLayout() {
  const { theme } = useTheme();
  const location = useLocation();

  return (
    <div data-theme={theme} className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main key={location.pathname}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
