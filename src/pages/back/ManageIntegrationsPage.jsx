import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

const openFeignRoutes = [
  {
    title: 'Restaurant -> Order',
    routes: ['/restaurants/order/{id}', '/restaurants/orders'],
    description: 'Le service restaurant lit les commandes via OpenFeign pour afficher les relations métier.',
  },
  {
    title: 'Restaurant -> Reclamation',
    routes: ['/restaurants/reclamation/{id}', '/restaurants/reclamations'],
    description: 'Le service restaurant expose les reclamations liees aux restaurants.',
  },
  {
    title: 'Order -> Menu',
    routes: ['/order/menus/{id}', '/order/menus'],
    description: 'Le service order consulte le menu pour enrichir les commandes.',
  },
  {
    title: 'Menu -> Order',
    routes: ['/menus/orders/{id}', '/menus/orders'],
    description: 'Le service menu peut interroger les commandes pour les relations inverses.',
  },
  {
    title: 'Order -> Delivery',
    routes: ['/order/delivery/{id}', '/order/deliveries'],
    description: 'Le service order relie une commande a la livraison associee.',
  },
  {
    title: 'Delivery -> Order',
    routes: ['/delivery/order/{id}', '/delivery/orders'],
    description: 'Le service delivery remonte les donnees de commande via OpenFeign.',
  },
  {
    title: 'Avis -> Restaurant',
    routes: ['/reclamations/{id}/restaurant', '/reclamations/restaurants'],
    description: 'Le service avis recupere les restaurants relies aux reclamations.',
  },
];

const rabbitMqItems = [
  { label: 'Management UI', value: 'http://localhost:16569' },
  { label: 'Exchange', value: 'orders.exchange' },
  { label: 'Queue', value: 'orders.created.queue' },
  { label: 'Routing key', value: 'order.created' },
  { label: 'Credentials', value: 'guest / guest' },
];

export default function ManageIntegrationsPage() {
  const { t } = useTranslation('admin');

  const openFeignScenarioSteps = [
    t('pages.openFeignScenarioStepOne'),
    t('pages.openFeignScenarioStepTwo'),
    t('pages.openFeignScenarioStepThree'),
  ];

  const rabbitMqScenarioSteps = [
    t('pages.rabbitMqScenarioStepOne'),
    t('pages.rabbitMqScenarioStepTwo'),
    t('pages.rabbitMqScenarioStepThree'),
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold text-primary">{t('pages.manageIntegrations')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('pages.manageIntegrationsDescription')}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-primary">
          <Icon icon="lucide:shuffle" className="text-lg" />
          {t('manage.integrationsActive')}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="bg-card rounded-3xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Icon icon="lucide:link-2" className="text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold text-primary">OpenFeign</h3>
              <p className="text-sm text-muted-foreground">{t('pages.openFeignSubtitle')}</p>
            </div>
          </div>

          <div className="space-y-4">
            {openFeignRoutes.map((item) => (
              <article key={item.title} className="rounded-2xl border border-border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-primary">{item.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-secondary-foreground">
                    Feign
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.routes.map((route) => (
                    <span key={route} className="rounded-full bg-background px-3 py-1 text-xs font-mono text-primary border border-border">
                      {route}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-card rounded-3xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center">
              <Icon icon="lucide:radio" className="text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold text-primary">RabbitMQ</h3>
              <p className="text-sm text-muted-foreground">{t('pages.rabbitMqSubtitle')}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-muted/30 p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {rabbitMqItems.map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-card px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{item.label}</p>
                  <p className="mt-1 break-all text-sm font-semibold text-primary">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-background border border-border px-4 py-3 text-sm text-muted-foreground">
              {t('pages.rabbitMqNote')}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <h4 className="font-bold text-primary">{t('pages.rabbitMqFlowTitle')}</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>1. {t('pages.rabbitMqFlowOne')}</p>
              <p>2. {t('pages.rabbitMqFlowTwo')}</p>
              <p>3. {t('pages.rabbitMqFlowThree')}</p>
            </div>
          </div>
        </section>
      </div>

      <section className="bg-card rounded-3xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary-foreground flex items-center justify-center">
            <Icon icon="lucide:workflow" className="text-2xl" />
          </div>
          <div>
            <h3 className="text-xl font-heading font-bold text-primary">{t('pages.scenariosTitle')}</h3>
            <p className="text-sm text-muted-foreground">{t('pages.scenariosSubtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <article className="rounded-3xl border border-border bg-muted/20 p-5">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-lg font-bold text-primary">{t('pages.openFeignScenarioTitle')}</h4>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">Feign</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t('pages.openFeignScenarioIntro')}</p>
            <ol className="mt-4 space-y-3">
              {openFeignScenarioSteps.map((step, index) => (
                <li key={step} className="flex gap-3 rounded-2xl bg-card border border-border px-4 py-3 text-sm text-primary">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  <Icon icon="lucide:badge-check" className="text-sm" />
                  Success
                </span>
                <span>{t('pages.openFeignSuccessMessage')}</span>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-border bg-muted/20 p-5">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-lg font-bold text-primary">{t('pages.rabbitMqScenarioTitle')}</h4>
              <span className="rounded-full bg-accent/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-accent">Queue</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t('pages.rabbitMqScenarioIntro')}</p>
            <ol className="mt-4 space-y-3">
              {rabbitMqScenarioSteps.map((step, index) => (
                <li key={step} className="flex gap-3 rounded-2xl bg-card border border-border px-4 py-3 text-sm text-primary">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  <Icon icon="lucide:badge-check" className="text-sm" />
                  Success
                </span>
                <span>{t('pages.rabbitMqSuccessMessage')}</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}