import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Pagination from '@/components/ui/Pagination';
import Skeleton from '@/components/ui/Skeleton';
import RestaurantCard from '@/components/shared/RestaurantCard';
import { fetchRestaurants } from '@/services/restaurantApi';

export default function RestaurantsPage() {
  const { t } = useTranslation('restaurants');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showEmpty] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const placeholderImages = useMemo(
    () => [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600',
    ],
    [],
  );

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchRestaurants();
      setRestaurants(data);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load restaurants.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRestaurants();
  }, [loadRestaurants]);

  const cards = restaurants.map((restaurant, index) => ({
    id: restaurant.id,
    image: placeholderImages[index % placeholderImages.length],
    title: restaurant.name,
    subtitle: `${restaurant.address || 'No address'} • ${restaurant.openingHours || 'Hours not set'}`,
    rate: restaurant.status === 'OPEN' ? '4.8' : '4.2',
    topBadge: restaurant.status === 'OPEN' ? 'Open now' : 'Closed',
  }));

  return (
    <div className="min-h-screen w-full bg-background flex flex-col relative font-sans text-foreground">
      <div className="container mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
      <aside className="w-full lg:w-72 space-y-8">
        <div>
          <h3 className="text-lg font-heading font-bold mb-4 flex items-center justify-between">
            {t('filters')}
            <button type="button" className="text-xs text-secondary font-bold hover:underline">{t('clear')}</button>
          </h3>
          <div className="space-y-4">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t('cuisineType')}</p>
            <div className="flex flex-wrap gap-2">
              {['all', 'italian', 'chinese', 'tunisian', 'burgers', 'sushi'].map((filter) => (
                <button key={filter} type="button" onClick={() => setActiveFilter(filter)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeFilter === filter ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-primary hover:border-primary'}`}>
                  {t(`filterLabels.${filter}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <div className="flex-1 max-w-xl mb-6">
          <div className="relative group">
            <Icon icon="lucide:search" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input type="text" placeholder={t('search')} className="w-full bg-muted border border-border rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm" />
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-heading font-extrabold text-primary">
            {loading ? t('resultsCount') : `${restaurants.length} ${t('resultsCount')}`}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('sortBy')}:</span>
            <select className="bg-transparent font-bold text-sm focus:outline-none cursor-pointer">
              <option>{t('popularity')}</option>
              <option>{t('rating')}</option>
              <option>{t('delivery')}</option>
            </select>
          </div>
        </div>

        {error && <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}

        {showEmpty ? (
          <div className="bg-card border border-border rounded-3xl p-8 text-center text-muted-foreground">{t('empty')}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading && (
              <div className="bg-card rounded-[2rem] border border-border overflow-hidden p-6 space-y-4">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            )}
            {cards.map((card) => (
              <Link key={card.id} to={`/restaurants/${card.id}/menu`}>
                <RestaurantCard item={card} openLabel={t('open')} deliveryLabel={t('deliveryRange')} />
              </Link>
            ))}
          </div>
        )}

        <Pagination />
      </main>
      </div>
    </div>
  );
}
