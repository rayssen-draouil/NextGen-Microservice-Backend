/**
 * @page MenuDetailPage
 * @description Restaurant menu page showing dishes grouped by category.
 * @route /restaurants/:id/menu
 * @htmlSource menu-detail.html
 */
 import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import QuantitySelector from '@/components/ui/QuantitySelector';
import { useCart } from '@/context/CartContext';
import { fetchMenusByRestaurant } from '@/services/menuApi';
import { fetchRestaurant } from '@/services/restaurantApi';
import { getStoredSession, normalizeRole } from '@/services/userApi';

export default function MenuDetailPage() {
  const { t } = useTranslation('menu');
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const { items, addItem, decreaseItem, totalQuantity, subtotal } = useCart();
  const session = getStoredSession();
  const role = normalizeRole(session?.user?.role);
  const canAddToCart = role === 'client';

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      setError('');

      try {
        const [restaurantData, menus] = await Promise.all([
          id ? fetchRestaurant(id) : Promise.resolve(null),
          id ? fetchMenusByRestaurant(id) : Promise.resolve([]),
        ]);

        if (!mounted) {
          return;
        }

        setRestaurant(restaurantData);
        setMenuItems(menus.map((menu, index) => ({
          id: Number(menu.id),
          name: menu.nom,
          description: menu.description,
          price: Number(menu.prix || 0),
          available: menu.disponible,
          restaurantId: menu.restaurantId ?? (id ? Number(id) : null),
          image: [
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80',
          ][index % 5],
        })));
      } catch (requestError) {
        if (mounted) {
          setError(requestError.message || 'Unable to load menu.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      mounted = false;
    };
  }, [id]);

  const restaurantName = restaurant?.name || t('hero.restaurantName');
  const restaurantStatus = restaurant?.status === 'CLOSED' ? t('hero.closed') || 'Closed' : t('hero.openNow');

  return (
    <div className="min-h-screen w-full bg-background flex flex-col relative font-sans text-foreground">
      <div className="relative h-72 md:h-96 w-full overflow-hidden">
        <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80" alt={t('hero.imageAlt')} className="w-full h-full object-cover scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent"></div>

        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <Link to="/restaurants" className="w-12 h-12 bg-card/20 backdrop-blur-md rounded-full flex items-center justify-center text-primary-foreground hover:bg-card hover:text-primary transition-all shadow-lg group">
            <Icon icon="lucide:arrow-left" className="text-2xl group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="flex gap-4">
            <button type="button" className="w-12 h-12 bg-card/20 backdrop-blur-md rounded-full flex items-center justify-center text-primary-foreground hover:bg-accent hover:text-primary-foreground transition-all shadow-lg">
              <Icon icon="lucide:heart" className="text-2xl" />
            </button>
            <button type="button" className="w-12 h-12 bg-card/20 backdrop-blur-md rounded-full flex items-center justify-center text-primary-foreground hover:bg-card hover:text-primary transition-all shadow-lg">
              <Icon icon="lucide:share-2" className="text-2xl" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground tracking-tight">{restaurantName}</h1>
              <span className="px-3 py-1 bg-tertiary text-primary-foreground text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">{restaurantStatus}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-primary-foreground/90 font-medium">
              <div className="flex items-center gap-1.5"><Icon icon="lucide:star" className="text-secondary" />{t('hero.rating')}</div>
              <span className="w-1.5 h-1.5 bg-primary-foreground/30 rounded-full"></span>
              <div className="flex items-center gap-1.5"><Icon icon="lucide:map-pin" className="text-secondary" />{t('hero.distance')}</div>
              <span className="w-1.5 h-1.5 bg-primary-foreground/30 rounded-full"></span>
              <div className="flex items-center gap-1.5"><Icon icon="lucide:clock" className="text-secondary" />{t('hero.delivery')}</div>
              <span className="w-1.5 h-1.5 bg-primary-foreground/30 rounded-full"></span>
              <div className="flex items-center gap-1.5"><Icon icon="lucide:wallet" className="text-secondary" />{t('hero.minOrder')}</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto w-full px-6 -mt-6 relative z-10 pb-40">
        {error && <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-2xl border border-border animate-pulse h-64" />
            <div className="bg-card p-6 rounded-2xl border border-border animate-pulse h-64" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item) => {
              const quantity = items.find((cartItem) => cartItem.id === item.id)?.quantity || 0;
              return (
                <div key={item.id} className="group bg-card p-4 rounded-2xl border border-border hover:shadow-xl transition-all duration-300 flex flex-col gap-4">
                  <div className="relative h-40 rounded-xl overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <span className={`w-8 h-8 bg-card/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm ${item.available ? 'text-tertiary' : 'text-destructive'}`} title={item.available ? 'Available' : 'Unavailable'}>
                        {item.available ? '✓' : '×'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-lg font-bold text-primary group-hover:text-secondary transition-colors">{item.name}</h3>
                      <span className="text-lg font-bold text-secondary">EUR {Number(item.price || 0).toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description || 'No description provided.'}</p>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    {canAddToCart ? (
                      <>
                        {quantity > 0 ? (
                          <QuantitySelector value={quantity} onDecrement={() => decreaseItem(item.id)} onIncrement={() => addItem(item)} />
                        ) : (
                          <button type="button" onClick={() => addItem(item)} className="bg-muted text-primary py-3 px-5 rounded-xl font-bold hover:bg-primary hover:text-primary-foreground transition-all border border-border flex items-center justify-center gap-2">
                            <Icon icon="lucide:plus" />
                            {t('actions.addToCart')}
                          </button>
                        )}
                        {quantity > 0 && (
                          <button type="button" onClick={() => addItem(item)} className="bg-primary text-primary-foreground p-3 rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg" aria-label={t('actions.addToCart')}>
                            <Icon icon="lucide:shopping-cart" className="text-xl" />
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="rounded-xl border border-border bg-muted px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Client account required
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <section className="mt-12">
          <h3 className="text-xl font-heading font-bold text-primary mb-4">{t('instructions.title')}</h3>
          <textarea
            value={specialInstructions}
            maxLength={250}
            onChange={(event) => setSpecialInstructions(event.target.value)}
            placeholder={t('instructions.placeholder')}
            className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm min-h-28 focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
          <p className="text-xs text-muted-foreground mt-2 text-right">
            {specialInstructions.length}/250 {t('instructions.characters')}
          </p>
        </section>
      </main>

      {canAddToCart && totalQuantity > 0 && (
        <Link to="/cart" className="fixed bottom-0 left-0 right-0 z-50 bg-primary text-primary-foreground py-4 px-6 transition-all duration-300 translate-y-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Icon icon="lucide:shopping-cart" className="text-xl" />
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold flex items-center justify-center">{totalQuantity}</span>
              </div>
              <span className="font-bold">{t('actions.viewCart')}</span>
            </div>
            <span className="font-extrabold">EUR {subtotal.toFixed(2)}</span>
          </div>
        </Link>
      )}
    </div>
  );
}
