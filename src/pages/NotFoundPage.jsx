import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="bg-card border border-border rounded-3xl p-10 text-center shadow-xl max-w-lg w-full">
        <h1 className="text-4xl font-heading font-extrabold text-primary mb-3">404</h1>
        <p className="text-muted-foreground">{t('meta.notFound')}</p>
      </div>
    </div>
  );
}
