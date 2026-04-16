import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clearSession, getStoredSession, normalizeRole } from '@/services/userApi';

const roleShortcuts = {
  client: {
    title: 'Client area',
    subtitle: 'Browse restaurants, order food, track delivery and leave a review.',
    badge: 'Client',
    accent: 'secondary',
    items: [
      { label: 'Restaurants', icon: 'lucide:store', to: '/restaurants' },
      { label: 'My orders', icon: 'lucide:package', to: '/orders' },
      { label: 'Place order', icon: 'lucide:shopping-bag', to: '/checkout' },
      { label: 'Track delivery', icon: 'lucide:truck', to: '/order-arrival' },
      { label: 'Leave review', icon: 'lucide:star', to: '/reviews' },
    ],
  },
  restaurant: {
    title: 'Restaurant area',
    subtitle: 'Manage the profile, menus and incoming orders for your restaurant.',
    badge: 'Restaurant',
    accent: 'primary',
    items: [
        { label: 'Restaurant profile', icon: 'lucide:store', to: '/restaurants' },
        { label: 'Menus', icon: 'lucide:menu-square', to: '/menus' },
      { label: 'Incoming orders', icon: 'lucide:package', to: '/orders' },
        { label: 'Reclamations', icon: 'lucide:message-square-warning', to: '/reviews' },
    ],
  },
  livreur: {
    title: 'Delivery area',
    subtitle: 'See assigned deliveries, accept a trip and update the delivery status.',
    badge: 'Delivery',
    accent: 'tertiary',
    items: [
      { label: 'Deliveries', icon: 'lucide:truck', to: '/orders' },
      { label: 'Open orders', icon: 'lucide:package', to: '/orders' },
      { label: 'Delivery tracking', icon: 'lucide:route', to: '/order-arrival' },
    ],
  },
};

export default function HomePage() {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const session = getStoredSession();
  const currentRole = normalizeRole(session?.user?.role || '');
  const rolePanel = roleShortcuts[currentRole];

  const handleLogout = () => {
    clearSession();
    navigate('/auth');
  };
  const cards = [
    {
      id: 'bella',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600',
      rate: '4.8',
      status: 'open',
      range: '25-35 min',
      descKey: 'cards.bellaDesc',
      free: true,
    },
    {
      id: 'burger',
      image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=600',
      rate: '4.5',
      status: 'open',
      range: '15-25 min',
      descKey: 'cards.burgerDesc',
      free: false,
    },
    {
      id: 'sakura',
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=600',
      rate: '4.9',
      status: 'closed',
      range: '30-45 min',
      descKey: 'cards.sakuraDesc',
      free: false,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-background flex flex-col relative font-sans text-foreground">
      <header className="relative w-full overflow-hidden pt-12 pb-24 lg:pt-24 lg:pb-32">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full text-secondary font-bold text-sm">
              <Icon icon="lucide:flame" className="text-lg" />
              <span>{t('hero.badge')}</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-heading font-extrabold text-primary leading-tight">
              {t('hero.title')} <span className="text-secondary">{t('hero.titleAccent')}</span>
              <br className="hidden lg:block" />
              <span className="text-3xl lg:text-5xl opacity-80">{t('hero.subtitle')}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">{t('hero.description')}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              {session && (
                <button type="button" onClick={handleLogout} className="w-full sm:w-auto px-10 py-4 bg-destructive text-destructive-foreground rounded-full font-extrabold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-destructive/20">
                  Logout
                </button>
              )}
              <button type="button" className="w-full sm:w-auto px-10 py-4 bg-secondary text-secondary-foreground rounded-full font-extrabold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-secondary/30">
                {t('hero.cta_primary')}
              </button>
              <button type="button" className="w-full sm:w-auto px-10 py-4 border-2 border-primary text-primary rounded-full font-bold text-lg hover:bg-primary hover:text-primary-foreground transition-all">
                {t('hero.cta_secondary')}
              </button>
            </div>

            {session && (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-2 text-sm font-bold text-secondary-foreground">
                  <Icon icon="lucide:badge-check" className="text-lg" />
                  Connected as {session.user?.name || session.user?.email || 'User'}
                </div>

                {rolePanel && (
                  <div className="rounded-[2rem] border border-border bg-card/95 p-6 shadow-xl shadow-primary/5 max-w-3xl">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-2xl font-heading font-extrabold text-primary">{rolePanel.title}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{rolePanel.subtitle}</p>
                      </div>
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${rolePanel.accent === 'primary' ? 'bg-primary/10 text-primary' : rolePanel.accent === 'tertiary' ? 'bg-tertiary/15 text-tertiary' : 'bg-secondary/15 text-secondary-foreground'}`}>
                        <Icon icon="lucide:badge-check" className="text-sm" />
                        {rolePanel.badge}
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {rolePanel.items.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => navigate(item.to)}
                          className="rounded-2xl border border-border bg-background px-4 py-4 text-left hover:border-primary/30 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                              <Icon icon={item.icon} className="text-xl" />
                            </div>
                            <div>
                              <p className="font-bold text-primary">{item.label}</p>
                              <p className="text-xs text-muted-foreground mt-1">Open</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-center lg:justify-start gap-6 pt-8">
              <div className="flex -space-x-3">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" className="w-12 h-12 rounded-full border-4 border-background" alt="User" loading="lazy" />
                <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-12 h-12 rounded-full border-4 border-background" alt="User" loading="lazy" />
                <img src="https://randomuser.me/api/portraits/men/85.jpg" className="w-12 h-12 rounded-full border-4 border-background" alt="User" loading="lazy" />
                <div className="w-12 h-12 rounded-full border-4 border-background bg-muted flex items-center justify-center text-xs font-bold">+10k</div>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                <span className="text-primary font-bold">{t('hero.customers')}</span>
              </p>
            </div>
          </div>

          <div className="flex-1 relative animate-slide-up">
            <div className="relative z-10 hover:scale-105 transition-transform duration-700 ease-out">
              <img
                src="https://uxmagic.blob.core.windows.net/public/agent-images/hero-delivery-scooter-1775746103252-kq5vcnd5gip.png"
                alt={t('hero.title')}
                className="w-full h-auto drop-shadow-2xl"
                loading="lazy"
              />
            </div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 -left-20 w-48 h-48 bg-tertiary/20 rounded-full blur-3xl animate-pulse delay-700"></div>
            <div className="absolute bottom-10 -left-4 bg-card p-4 rounded-2xl shadow-2xl border border-border flex items-center gap-4 animate-bounce duration-[3000ms]">
              <div className="w-12 h-12 bg-tertiary/20 rounded-xl flex items-center justify-center text-tertiary">
                <Icon icon="lucide:clock" className="text-2xl" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{t('hero.deliveryTime')}</p>
                <p className="text-lg font-extrabold text-primary">{t('hero.deliveryRange')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="py-24 bg-card border-y border-border">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-heading font-extrabold text-primary mb-4">{t('howItWorks.title')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="group text-center space-y-6 p-8 rounded-3xl hover:bg-background transition-all duration-500">
              <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                <Icon icon="lucide:search" className="text-4xl" />
              </div>
              <h3 className="text-2xl font-bold text-primary">{t('howItWorks.step1_title')}</h3>
              <p className="text-muted-foreground">{t('howItWorks.step1_desc')}</p>
            </div>

            <div className="group text-center space-y-6 p-8 rounded-3xl hover:bg-background transition-all duration-500">
              <div className="w-24 h-24 bg-secondary/5 rounded-full flex items-center justify-center mx-auto group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-500">
                <Icon icon="lucide:shopping-bag" className="text-4xl" />
              </div>
              <h3 className="text-2xl font-bold text-primary">{t('howItWorks.step2_title')}</h3>
              <p className="text-muted-foreground">{t('howItWorks.step2_desc')}</p>
            </div>

            <div className="group text-center space-y-6 p-8 rounded-3xl hover:bg-background transition-all duration-500">
              <div className="w-24 h-24 bg-tertiary/5 rounded-full flex items-center justify-center mx-auto group-hover:bg-tertiary group-hover:text-primary-foreground transition-all duration-500">
                <Icon icon="lucide:truck" className="text-4xl" />
              </div>
              <h3 className="text-2xl font-bold text-primary">{t('howItWorks.step3_title')}</h3>
              <p className="text-muted-foreground">{t('howItWorks.step3_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-6 mb-12 flex items-end justify-between">
          <div className="max-w-xl">
            <h2 className="text-4xl font-heading font-extrabold text-primary mb-4">{t('restaurants.title')}</h2>
            <p className="text-muted-foreground">{t('restaurants.subtitle')}</p>
          </div>
          <button type="button" className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all">
            {t('restaurants.viewAll')} <Icon icon="lucide:arrow-right" />
          </button>
        </div>

        <div className="flex gap-8 overflow-x-auto px-6 pb-12 no-scrollbar">
          {cards.map((card) => (
            <div key={card.id} className="min-w-[320px] bg-card rounded-[2rem] border border-border overflow-hidden group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
              <div className="relative h-48 overflow-hidden">
                <img src={card.image} alt={t(`cards.${card.id}`)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                <div className="absolute top-4 right-4 bg-card/90 backdrop-blur px-3 py-1 rounded-full text-xs font-extrabold text-primary flex items-center gap-1 shadow-sm"><Icon icon="lucide:star" className="text-secondary" /> {card.rate}</div>
                {card.free && <div className="absolute bottom-4 left-4 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">{t('restaurants.freeDelivery')}</div>}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xl font-bold text-primary">{t(`cards.${card.id}`)}</h4>
                  <span className="text-muted-foreground text-sm">{card.range}</span>
                </div>
                <p className="text-muted-foreground text-sm mb-4">{t(card.descKey)}</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 ${card.status === 'open' ? 'bg-tertiary animate-pulse' : 'bg-destructive'} rounded-full`}></span>
                  <span className={`text-xs font-bold uppercase ${card.status === 'open' ? 'text-tertiary' : 'text-destructive'}`}>{card.status === 'open' ? t('restaurants.open') : t('restaurants.closed')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
