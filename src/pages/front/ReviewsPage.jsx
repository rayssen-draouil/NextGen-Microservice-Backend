import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import { createReclamation, fetchReclamations } from '@/services/reclamationApi';
import { getRoleLabel, getStoredSession, normalizeRole } from '@/services/userApi';
import { fetchRestaurants } from '@/services/restaurantApi';
import { fetchMenusByRestaurant } from '@/services/menuApi';

function normalizeReclamations(payload) {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];

  return list.map((item, index) => ({
    id: item?.id ?? index + 1,
    restaurantId: item?.restaurantId ?? item?.restaurant?.id ?? null,
    clientId: item?.clientId ?? item?.client?.id ?? null,
    description: item?.description || item?.message || 'No comment provided.',
    statut: String(item?.statut || item?.status || 'PENDING').toUpperCase(),
    dateReclamation: item?.dateReclamation || item?.createdAt || null,
  }));
}

export default function ReviewsPage() {
  const session = getStoredSession();
  const role = normalizeRole(session?.user?.role);
  const [restaurantFilter, setRestaurantFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [draftReview, setDraftReview] = useState('');
  const [menuItemName, setMenuItemName] = useState('');
  const [availableMenus, setAvailableMenus] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const hasLoadedRef = useRef(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [reviewsData, restaurantsData] = await Promise.all([
        fetchReclamations(),
        fetchRestaurants(),
      ]);

      setReviews(normalizeReclamations(reviewsData));
      setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load reviews.');
      setReviews([]);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }

    hasLoadedRef.current = true;
    void loadData();
  }, [loadData]);

  const filteredReviews = useMemo(() => {
    let data = [...reviews];

    if (role === 'restaurant' && session?.user?.email) {
      const myRestaurant = restaurants.find(
        (restaurant) => String(restaurant.email || '').toLowerCase() === String(session.user.email).toLowerCase(),
      );

      if (myRestaurant) {
        data = data.filter((review) => String(review.restaurantId) === String(myRestaurant.id));
      } else {
        data = [];
      }
    }

    if (restaurantFilter !== 'all') {
      data = data.filter((review) => String(review.restaurantId) === String(restaurantFilter));
    }

    data.sort((a, b) => {
      const left = new Date(a.dateReclamation || 0).getTime();
      const right = new Date(b.dateReclamation || 0).getTime();
      return right - left;
    });

    return data;
  }, [restaurantFilter, reviews, role, session?.user?.email, restaurants]);

  const canSubmitReview = role === 'client';

  useEffect(() => {
    if (!isModalOpen || !selectedRestaurantId) {
      setAvailableMenus([]);
      return;
    }

    let cancelled = false;

    async function loadMenusForRestaurant() {
      try {
        const menusPayload = await fetchMenusByRestaurant(selectedRestaurantId);
        const menus = Array.isArray(menusPayload)
          ? menusPayload
          : Array.isArray(menusPayload?.value)
            ? menusPayload.value
            : Array.isArray(menusPayload?.data)
              ? menusPayload.data
              : Array.isArray(menusPayload?.content)
                ? menusPayload.content
                : [];

        if (!cancelled) {
          setAvailableMenus(menus);
        }
      } catch {
        if (!cancelled) {
          setAvailableMenus([]);
        }
      }
    }

    void loadMenusForRestaurant();

    return () => {
      cancelled = true;
    };
  }, [isModalOpen, selectedRestaurantId]);

  const handleSubmitReview = async () => {
    setError('');
    setSuccessMessage('');

    if (!canSubmitReview) {
      setError('Only client accounts can submit reviews.');
      return;
    }

    if (!selectedRestaurantId) {
      setError('Please select a restaurant.');
      return;
    }

    if (!selectedRating || !draftReview.trim()) {
      setError('Please add a rating and a comment.');
      return;
    }

    try {
      const menuSegment = menuItemName.trim() ? ` | MENU_AVIS:${menuItemName.trim()}` : '';
      await createReclamation({
        restaurantId: Number(selectedRestaurantId),
        clientId: session?.user?.id || session?.user?.email || 1,
        description: `RATING:${selectedRating} | REVIEW:${draftReview.trim()}${menuSegment}`,
        statut: 'PENDING',
        dateReclamation: new Date(),
      });

      setSuccessMessage('Review submitted successfully.');
      setDraftReview('');
      setSelectedRating(0);
      setMenuItemName('');
      setIsModalOpen(false);
      await loadData();
    } catch (requestError) {
      setError(requestError.message || 'Unable to submit review.');
    }
  };

  const restaurantNameById = (id) => restaurants.find((restaurant) => String(restaurant.id) === String(id))?.name || `Restaurant #${id}`;

  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}
        {successMessage && <div className="rounded-2xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm font-medium text-secondary-foreground">{successMessage}</div>}

        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-primary">Reviews and avis</h1>
          <p className="text-muted-foreground text-lg">Connected role: {getRoleLabel(role)}</p>
          <div className="flex items-center justify-center gap-1 text-secondary text-3xl">
            {[1, 2, 3].map((star) => (<Icon key={star} icon="lucide:star" />))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 pt-4">
            <div className="bg-card border border-border rounded-2xl p-5"><p className="text-3xl font-extrabold text-primary">{reviews.length}</p><p className="text-muted-foreground">Total entries</p></div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-3xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={restaurantFilter} onChange={(e) => setRestaurantFilter(e.target.value)} className="bg-input border border-border rounded-xl px-3 py-2">
              <option value="all">All restaurants</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {!loading && filteredReviews.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 rounded-3xl border border-border bg-card p-8 text-center text-muted-foreground">
              No reviews available for this filter.
            </div>
          )}
          {filteredReviews.map((review) => (
            <article key={review.id} className="bg-card border border-border rounded-3xl p-6 hover:shadow-2xl hover:shadow-primary/10 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">{String(review.clientId || '?').slice(0, 2)}</div>
                <div>
                  <p className="font-bold text-primary">Client #{review.clientId || '-'}</p>
                  <p className="text-muted-foreground text-sm">{review.dateReclamation ? new Date(review.dateReclamation).toLocaleString() : '-'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{restaurantNameById(review.restaurantId)}</span>
                <span className="px-2 py-1 rounded-full text-xs bg-secondary/20 text-secondary-foreground">{review.statut || 'PENDING'}</span>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-2">{review.description}</p>
            </article>
          ))}
        </section>

        {canSubmitReview && (
          <section className="bg-primary text-primary-foreground rounded-3xl p-8 text-center space-y-3">
            <h3 className="text-2xl font-heading font-bold">Submit a restaurant review and menu avis</h3>
            <p className="text-primary-foreground/80">Share your rating and optionally mention a menu item.</p>
            <button type="button" onClick={() => setIsModalOpen(true)} className="px-8 py-3 bg-secondary text-secondary-foreground font-bold rounded-full hover:scale-105 transition-all">
              Leave a review
            </button>
          </section>
        )}

        <Pagination />
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit your review">
        <div className="space-y-4">
          <select value={selectedRestaurantId} onChange={(event) => {
            setSelectedRestaurantId(event.target.value);
            setMenuItemName('');
          }} className="w-full bg-input border border-border rounded-xl px-3 py-2">
            <option value="">Select restaurant</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-2 text-2xl text-secondary">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setSelectedRating(star)}>
                <Icon icon="lucide:star" className={star <= selectedRating ? 'opacity-100' : 'opacity-30'} />
              </button>
            ))}
          </div>
          <select value={menuItemName} onChange={(event) => setMenuItemName(event.target.value)} className="w-full bg-input border border-border rounded-xl px-3 py-2" disabled={!selectedRestaurantId}>
            <option value="">Menu item (optional)</option>
            {availableMenus.map((menu) => {
              const label = menu?.nom || menu?.name || `Menu #${menu?.id || ''}`;
              return <option key={menu?.id || label} value={label}>{label}</option>;
            })}
          </select>
          <textarea value={draftReview} onChange={(e) => setDraftReview(e.target.value)} minLength={10} maxLength={300} placeholder="Write your review" className="w-full min-h-28 bg-input border border-border rounded-xl px-3 py-2" />
          <p className="text-xs text-muted-foreground text-right">{draftReview.length}/300</p>
          <button type="button" onClick={handleSubmitReview} className="w-full py-3 bg-secondary text-secondary-foreground rounded-xl font-bold">Submit</button>
        </div>
      </Modal>
    </div>
  );
}
