import { Icon } from '@iconify/react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '@/components/shared/Logo';
import { clearSession, getStoredSession } from '@/services/userApi';

const links = [
  { to: '/admin/dashboard', icon: 'lucide:layout-dashboard', key: 'dashboard' },
  { to: '/admin/restaurants', icon: 'lucide:store', key: 'restaurants' },
  { to: '/admin/menus', icon: 'lucide:menu-square', key: 'menus' },
  { to: '/admin/orders', icon: 'lucide:package', key: 'orders' },
  { to: '/admin/deliveries', icon: 'lucide:truck', key: 'deliveries' },
  { to: '/admin/reclamations', icon: 'lucide:message-square-warning', key: 'reclamations' },
  { to: '/admin/integrations', icon: 'lucide:git-merge', key: 'integrations' },
  { to: '/admin/users', icon: 'lucide:users', key: 'users' },
];

export default function Sidebar() {
  const { t } = useTranslation('admin');
  const session = getStoredSession();

  const handleLogout = () => {
    clearSession();
    window.location.href = '/auth';
  };

  return (
    <aside className="w-20 lg:w-72 bg-card text-foreground flex flex-col h-screen sticky top-0 transition-all duration-300 z-50 shadow-2xl border-r border-border">
      <div className="p-6">
        <Logo size="default" className="justify-center lg:justify-start" />
        <hr className="border-border my-4" />
      </div>

      <nav className="px-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.key}
            to={link.to}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-4 p-4 bg-primary/10 text-primary border-l-4 border-primary font-bold rounded-r-2xl'
                : 'flex items-center gap-4 p-4 text-muted-foreground hover:bg-muted hover:text-primary border-l-4 border-transparent transition-all rounded-r-2xl'
            }
          >
            <Icon icon={link.icon} className="text-2xl" />
            <span className="hidden lg:block">{t(`nav.${link.key}`)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-4 pt-4">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary text-sm transition-colors">
          <Icon icon="lucide:arrow-left" />
          <span className="hidden lg:block">Back to Site / Retour au site</span>
        </Link>
      </div>

      <div className="mt-auto p-4 border-t border-border space-y-3">
        <div className="bg-muted rounded-2xl p-3 flex items-center gap-3">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Admin User" className="w-10 h-10 rounded-full object-cover" loading="lazy" />
          <div className="hidden lg:block">
            <p className="text-sm font-bold text-primary">Admin User</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase">Administrator</span>
          </div>
        </div>
        {session && (
          <button type="button" onClick={handleLogout} className="w-full flex items-center justify-center lg:justify-start gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all">
            <Icon icon="lucide:log-out" />
            <span className="hidden lg:block">{t('header.logout')}</span>
          </button>
        )}
      </div>
    </aside>
  );
}
