/**
 * @page CheckoutPage
 * @description Checkout page with delivery form, payment methods, and live tracking preview.
 * @route /checkout
 * @htmlSource checkout.html
 */
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { createOrder } from '@/services/orderApi';
import { useCart } from '@/context/CartContext';
import { getStoredSession, normalizeRole } from '@/services/userApi';

const CheckoutPage = () => {
  const { t } = useTranslation('orders');
  const navigate = useNavigate();
  const [session] = useState(() => getStoredSession());
  const role = normalizeRole(session?.user?.role);
  const { items, subtotal, totalQuantity, clearCart } = useCart();
  const [method, setMethod] = useState('cash');
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [form, setForm] = useState({
    fullName: session?.user?.name || session?.user?.email || '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    postalCode: '',
    notes: '',
    promo: '',
  });

  const orderItems = useMemo(() => items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    unitPrice: Number(item.price || 0),
    restaurantId: item.restaurantId ?? null,
  })), [items]);

  const hasItems = orderItems.length > 0;

  const computedSubtotal = useMemo(() => orderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), [orderItems]);

  const deliveryFee = deliveryType === 'pickup' ? 0 : 2.99;
  const discount = 2.35;
  const baseSubtotal = subtotal || computedSubtotal;
  const total = baseSubtotal + deliveryFee - discount;

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handlePlaceOrder = async () => {
    if (role !== 'client') {
      setErrorMessage('Only clients can place orders.');
      return;
    }

    if (!session?.user) {
      setErrorMessage('Please sign in before placing an order.');
      return;
    }

    if (!hasItems) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    if (!form.fullName.trim() || !form.phone.trim()) {
      setErrorMessage('Please provide your full name and phone number.');
      return;
    }

    if (deliveryType === 'delivery' && (!form.address1.trim() || !form.city.trim())) {
      setErrorMessage('Delivery address and city are required for delivery orders.');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const payload = {
        customerName: form.fullName || session?.user?.name || session?.user?.email || 'Guest',
        productName: orderItems.map((item) => `${item.quantity}x ${item.name}`).join(' + '),
        quantity: totalQuantity || 1,
        price: baseSubtotal,
        restaurantId: orderItems.find((item) => item.restaurantId != null)?.restaurantId ?? null,
      };

      const order = await createOrder(payload);
      setCreatedOrder(order);
      clearCart();
      setSuccessMessage(`${t('orderPlacedSuccess')} #${order.id}`);
    } catch (requestError) {
      setErrorMessage(requestError.message || t('orderPlacedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col relative font-sans text-foreground">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button type="button" className="p-2 hover:bg-muted rounded-full transition-colors"><Icon icon="lucide:arrow-left" className="text-xl" /></button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><Icon icon="lucide:flame" className="text-primary-foreground text-xl" /></div>
            <span className="text-xl font-heading font-bold tracking-tight text-primary">{t('title')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full border border-border">
          <Icon icon="lucide:lock" className="text-tertiary text-sm" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('secureSession')}</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-6 py-12 flex flex-col lg:flex-row gap-12">
        <div className="flex-grow space-y-10">
          {role !== 'client' && (
            <div className="rounded-3xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm font-semibold text-destructive">
              This checkout flow is reserved for authenticated client accounts.
            </div>
          )}
          {successMessage && (
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500 text-white">
                  <Icon icon="lucide:badge-check" />
                </span>
                <span>{successMessage}</span>
              </div>
              <button type="button" onClick={() => navigate('/order-arrival')} className="shrink-0 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:opacity-90 transition-colors">
                {t('liveTrack')}
              </button>
            </div>
          )}
          {errorMessage && (
            <div className="rounded-3xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm font-semibold text-destructive">
              {errorMessage}
            </div>
          )}

          <section className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-primary flex items-center gap-3"><Icon icon="lucide:map-pin" className="text-secondary" />{t('deliveryAddress')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button type="button" onClick={() => setDeliveryType('delivery')} className={`rounded-2xl border px-4 py-3 text-left font-bold ${deliveryType === 'delivery' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-primary'}`}>
                Delivery
              </button>
              <button type="button" onClick={() => setDeliveryType('pickup')} className={`rounded-2xl border px-4 py-3 text-left font-bold ${deliveryType === 'pickup' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-primary'}`}>
                Pickup
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} placeholder={t('form.fullName')} className="bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
              <input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder={t('form.phone')} className="bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
              {deliveryType === 'delivery' && (
                <>
                  <input value={form.address1} onChange={(e) => handleChange('address1', e.target.value)} placeholder={t('form.address1')} className="bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 md:col-span-2" />
                  <input value={form.address2} onChange={(e) => handleChange('address2', e.target.value)} placeholder={t('form.address2')} className="bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 md:col-span-2" />
                  <input value={form.city} onChange={(e) => handleChange('city', e.target.value)} placeholder={t('form.city')} className="bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  <input value={form.postalCode} onChange={(e) => handleChange('postalCode', e.target.value)} placeholder={t('form.postalCode')} className="bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
                </>
              )}
              <textarea value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder={t('form.instructions')} className="bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 md:col-span-2 min-h-24" />
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-primary flex items-center gap-3"><Icon icon="lucide:credit-card" className="text-secondary" />{t('paymentMethod')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['cash', 'mobile'].map((option) => (
                <button key={option} type="button" onClick={() => setMethod(option)} className={`p-4 rounded-2xl border text-left font-bold transition-all ${method === option ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-muted text-primary'}`}>
                  {t(`methods.${option}`)}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{method === 'cash' ? 'No card details are required for this checkout.' : 'Continue with mobile payment on delivery.'}</p>
          </section>
        </div>

        <div className="w-full lg:w-96 space-y-8">
          <div className="bg-card rounded-3xl border border-border shadow-xl p-8 space-y-8 sticky top-24">
            <h3 className="text-xl font-heading font-bold text-primary">{t('orderSummary')}</h3>
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.name} className="flex justify-between gap-4">
                  <span>{item.quantity}x {item.name}</span>
                  <span>EUR {(item.quantity * item.unitPrice).toFixed(2)}</span>
                </div>
              ))}
              {!hasItems && <p className="text-sm text-muted-foreground">Your cart is currently empty.</p>}
            </div>
            <div className="flex gap-2">
              <input value={form.promo} onChange={(e) => handleChange('promo', e.target.value)} placeholder={t('promoPlaceholder')} className="flex-1 bg-input border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
              <button type="button" className="px-4 py-2 rounded-xl bg-muted border border-border font-bold hover:bg-background transition-all">{t('apply')}</button>
            </div>
            <div className="space-y-3 pt-6 border-t border-border">
              <div className="flex justify-between text-sm text-muted-foreground font-medium"><span>{t('subtotal')}</span><span>EUR {baseSubtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-muted-foreground font-medium"><span>{t('deliveryFee')}</span><span>EUR {deliveryFee.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-tertiary font-bold"><span>{t('discount')}</span><span>-EUR {discount.toFixed(2)}</span></div>
              <div className="flex justify-between text-xl font-bold text-primary pt-2"><span>{t('total')}</span><span>EUR {total.toFixed(2)}</span></div>
            </div>
            {createdOrder ? (
              <button type="button" onClick={() => navigate('/order-arrival')} className="w-full bg-secondary text-secondary-foreground py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 group">
                {t('liveTrack')}
              </button>
            ) : (
              <button type="button" onClick={handlePlaceOrder} disabled={isSubmitting || !hasItems || role !== 'client'} className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? t('placingOrder') : t('placeOrder')}
              </button>
            )}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium"><Icon icon="lucide:shield-check" className="text-tertiary text-sm" />{t('security')}</div>
            <p className="text-sm text-muted-foreground text-center">{t('estimatedDelivery')}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
