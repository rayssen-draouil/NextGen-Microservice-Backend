/**
 * @page OrderArrivalPage
 * @description Live order tracking page with map placeholder and stepper.
 * @route /order-arrival
 * @htmlSource order-arrival.html
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import OrderStatusStep from '@/components/shared/OrderStatusStep';

const OrderArrivalPage = () => {
  const { t } = useTranslation('orders');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-background flex flex-col relative font-sans text-foreground overflow-hidden">
      <div className="h-[45vh] w-full relative bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="opacity-50 grayscale">
            <path d="M0 50 L400 50 M0 150 L400 150 M0 250 L400 250 M0 350 L400 350" stroke="white" strokeWidth="20" fill="none" />
            <path d="M50 0 L50 400 M150 0 L150 400 M250 0 L250 400 M350 0 L350 400" stroke="white" strokeWidth="20" fill="none" />
          </svg>
          <div className="absolute top-[40%] left-[30%] z-10"><div className="relative"><div className="absolute inset-0 bg-secondary rounded-full animate-ping opacity-75"></div><div className="relative w-10 h-10 bg-secondary rounded-full flex items-center justify-center shadow-lg border-2 border-card"><Icon icon="lucide:truck" className="text-secondary-foreground text-xl" /></div></div></div>
          <div className="absolute top-[60%] left-[70%] z-10"><div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-card"><Icon icon="lucide:house" className="text-primary-foreground text-xl" /></div></div>
        </div>
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between pointer-events-none">
          <button type="button" onClick={() => navigate(-1)} className="w-12 h-12 bg-card/90 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-center pointer-events-auto active:scale-90 transition-transform"><Icon icon="lucide:arrow-left" className="text-primary text-2xl" /></button>
          <div className="bg-primary/90 backdrop-blur-md px-4 py-2 rounded-full shadow-xl pointer-events-auto border border-card/10">
            <p className="text-[10px] font-bold text-primary-foreground uppercase tracking-widest text-center">{t('arrivingIn')}</p>
            <p className="text-lg font-heading font-bold text-primary-foreground text-center">12 Mins</p>
          </div>
        </div>
      </div>

      <div className="flex-grow bg-background rounded-t-[2.5rem] -mt-10 relative z-20 shadow-[0_-20px_40px_rgba(30,27,75,0.1)] flex flex-col">
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mt-4 mb-6"></div>
        <div className="px-8 pb-8 flex-grow overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-heading font-bold text-primary">{t('orderId')}</h2>
              <p className="text-sm text-muted-foreground font-medium">{t('orderMeta')}</p>
            </div>
            <div className="w-14 h-14 bg-muted rounded-2xl overflow-hidden border border-border">
              <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>

          <div className="space-y-8 relative">
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-muted"></div>
            <OrderStatusStep complete title={t('steps.placed')} time="12:45 PM" />
            <OrderStatusStep complete title={t('steps.preparing')} time="12:48 PM" />
            <OrderStatusStep active title={t('steps.onTheWay')} time={t('steps.activeStatus')} />
            <OrderStatusStep title={t('steps.delivered')} time={t('steps.eta')} />
          </div>

          <div className="mt-10 bg-muted/50 p-6 rounded-3xl border border-border flex items-center gap-4">
            <div className="relative">
              <img src="https://randomuser.me/api/portraits/men/44.jpg" className="w-16 h-16 rounded-2xl object-cover border-2 border-card shadow-md" loading="lazy" />
              <div className="absolute -bottom-1 -right-1 bg-tertiary px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-card shadow-sm">
                <Icon icon="lucide:star" className="text-primary-foreground text-[8px]" />
                <span className="text-[8px] font-bold text-primary-foreground">4.9</span>
              </div>
            </div>
            <div className="flex-grow">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{t('courier')}</p>
              <p className="text-lg font-heading font-bold text-primary">Marc L.</p>
              <p className="text-xs text-muted-foreground">White Honda SH150</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="w-11 h-11 bg-card rounded-full flex items-center justify-center shadow-sm border border-border text-primary hover:bg-primary hover:text-primary-foreground transition-all active:scale-90"><Icon icon="lucide:phone" className="text-xl" /></button>
              <button type="button" className="w-11 h-11 bg-card rounded-full flex items-center justify-center shadow-sm border border-border text-primary hover:bg-primary hover:text-primary-foreground transition-all active:scale-90"><Icon icon="lucide:message-circle" className="text-xl" /></button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border bg-background/80 backdrop-blur-md">
          <button type="button" onClick={() => navigate('/checkout')} className="w-full py-4 bg-primary text-primary-foreground rounded-full font-heading font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
            <Icon icon="lucide:share-2" className="text-xl" />
            <span>{t('shareProgress')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderArrivalPage;
