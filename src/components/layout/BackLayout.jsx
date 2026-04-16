import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import Sidebar from '@/components/layout/Sidebar';
import ThemeToggle from '@/components/shared/ThemeToggle';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { getRoleLabel, getStoredSession } from '@/services/userApi';

export default function BackLayout() {
  const { t } = useTranslation('admin');
  const location = useLocation();
  const session = getStoredSession();
  const displayName = session?.user?.name || session?.user?.email || 'User';
  const roleLabel = getRoleLabel(session?.user?.role);
  const initials = displayName.trim().charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-card/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-2xl font-heading font-bold text-primary">{t('header.title')}</h1>
            <p className="text-sm text-muted-foreground font-medium">{t('header.subtitle')}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 bg-muted px-4 py-2 rounded-full border border-border">
              <Icon icon="lucide:search" className="text-muted-foreground" />
              <input type="text" placeholder={t('header.search')} className="bg-transparent border-none outline-none text-sm font-medium w-40" />
            </div>

            <button type="button" className="p-3 bg-muted rounded-full hover:bg-accent transition-colors relative">
              <Icon icon="lucide:bell" className="text-xl" />
              <span className="absolute top-2 right-2 w-3 h-3 bg-accent rounded-full border-2 border-card"></span>
            </button>

            <LanguageSwitcher />
            <ThemeToggle />

            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-primary">{displayName}</p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-card shadow-md bg-primary/10 text-primary font-bold flex items-center justify-center">
                {initials}
              </div>
            </div>
          </div>
        </header>
        <main key={location.pathname} className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
