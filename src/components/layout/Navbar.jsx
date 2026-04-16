import { Icon } from '@iconify/react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '@/components/shared/Logo';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { clearSession, getRoleLabel, getStoredSession, normalizeRole } from '@/services/userApi';

export default function Navbar() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const session = getStoredSession();
  const role = normalizeRole(session?.user?.role);
  const isAuthenticated = Boolean(session?.user);
  const isAdmin = role === 'admin';
  const isClient = role === 'client';
  const currentPath = location.pathname;
  const displayName = session?.user?.name || session?.user?.email || 'User';
  const initials = displayName.trim().charAt(0).toUpperCase();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const goTo = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const navItems = useMemo(() => {
    if (!isAuthenticated) {
      return [
        { to: '/', label: t('nav.home'), exact: true },
        { to: '/restaurants', label: t('nav.restaurants') },
      ];
    }

    if (role === 'admin') {
      return [
        { to: '/admin/dashboard', label: t('nav.dashboard') },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/restaurants', label: t('nav.restaurants') },
        { to: '/admin/menus', label: 'Menus' },
        { to: '/admin/orders', label: t('nav.orders') },
        { to: '/admin/reclamations', label: t('nav.reviews') },
      ];
    }

    if (role === 'restaurant') {
      return [
        { to: '/', label: t('nav.home'), exact: true },
        { to: '/restaurants', label: 'My Restaurant' },
        { to: '/menus', label: 'My Menus' },
        { to: '/orders', label: t('nav.orders') },
        { to: '/reviews', label: t('nav.reviews') },
      ];
    }

    if (role === 'livreur') {
      return [
        { to: '/', label: t('nav.home'), exact: true },
        { to: '/orders', label: t('nav.orders') },
        { to: '/order-arrival', label: 'Tracking' },
      ];
    }

    return [
      { to: '/', label: t('nav.home'), exact: true },
      { to: '/restaurants', label: t('nav.restaurants') },
      { to: '/cart', label: t('nav.cart') },
      { to: '/orders', label: t('nav.orders') },
      { to: '/reviews', label: t('nav.reviews') },
    ];
  }, [isAuthenticated, role, t]);

  const isActivePath = (path, exact = false) => {
    if (exact) {
      return currentPath === path;
    }

    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  const navClass = (path, exact = false) =>
    isActivePath(path, exact)
      ? 'font-bold text-primary border-b-2 border-secondary pb-0.5'
      : 'font-medium text-muted-foreground hover:text-primary transition-colors';

  const closeMobile = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    clearSession();
    navigate('/auth', { replace: true });
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border px-4 md:px-6 py-4">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <Logo size="default" className="lg:hidden" />

          <div className="hidden lg:flex items-center gap-8">
            <Logo size="default" className="mr-2" />
            {navItems.map((item) => (
              <button key={item.to} type="button" onClick={() => goTo(item.to)} className={navClass(item.to, item.exact)}>
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            {isAuthenticated && (
              <div className="hidden lg:flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{initials}</span>
                <div>
                  <p className="text-xs font-bold text-primary leading-none">{displayName}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{getRoleLabel(role)}</p>
                </div>
              </div>
            )}
            {isAuthenticated && (
              <button type="button" onClick={handleLogout} className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-card text-primary font-bold hover:bg-muted transition-colors" aria-label={t('nav.logout')}>
                <Icon icon="lucide:log-out" className="text-xl" />
                {t('nav.logout')}
              </button>
            )}
            {isAuthenticated && isClient && (
              <button type="button" onClick={() => goTo('/cart')} className="p-2.5 bg-card border border-border rounded-full hover:bg-muted transition-all relative" aria-label={t('nav.cart')}>
                <Icon icon="lucide:shopping-cart" className="text-xl text-primary" />
              </button>
            )}
            {!isAuthenticated && (
              <div className="hidden md:flex items-center gap-2">
                <button type="button" onClick={() => goTo('/auth')} className="px-4 py-2.5 rounded-full border border-border bg-card font-bold text-primary">
                  {t('nav.login')}
                </button>
                <button type="button" onClick={() => goTo('/auth')} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
                  Register
                </button>
              </div>
            )}
            <button type="button" className="lg:hidden p-2.5 bg-card border border-border rounded-full hover:bg-muted transition-all" onClick={() => setIsMobileMenuOpen((prev) => !prev)} aria-label="Toggle mobile menu">
              <Icon icon={isMobileMenuOpen ? 'lucide:x' : 'lucide:menu'} className="text-xl text-primary" />
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 rounded-2xl border border-border bg-background/95 backdrop-blur-md p-4 space-y-3">
            {navItems.map((item) => (
              <button key={item.to} type="button" onClick={() => goTo(item.to)} className={`${navClass(item.to, item.exact)} block w-full text-left`}>
                {item.label}
              </button>
            ))}
            {isAdmin && (
              <button type="button" onClick={() => goTo('/admin/dashboard')} className="bg-primary/10 text-primary rounded-full px-4 py-2 flex items-center gap-2 w-fit">
                <Icon icon="lucide:layout-dashboard" />
                {t('nav.dashboard')}
              </button>
            )}
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            {isAuthenticated && (
              <div className="rounded-xl border border-border bg-muted/40 px-3 py-2">
                <p className="text-sm font-bold text-primary">{displayName}</p>
                <p className="text-xs text-muted-foreground">{getRoleLabel(role)}</p>
              </div>
            )}
            {isAuthenticated && (
              <button type="button" onClick={handleLogout} className="w-full px-6 py-2.5 rounded-full border border-border font-bold text-primary flex items-center justify-center gap-2">
                <Icon icon="lucide:log-out" />
                {t('nav.logout')}
              </button>
            )}
            {!isAuthenticated && (
              <>
                <button type="button" onClick={() => goTo('/auth')} className="w-full px-6 py-2.5 rounded-full border border-border font-bold text-primary text-center">
                  {t('nav.login')}
                </button>
                <button type="button" onClick={() => goTo('/auth')} className="w-full px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-bold text-center">
                  Register
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
