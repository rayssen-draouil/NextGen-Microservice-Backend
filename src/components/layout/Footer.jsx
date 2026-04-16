import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Logo from '@/components/shared/Logo';

export default function Footer() {
  const { t } = useTranslation('common');

  return (
    <footer className="bg-primary text-primary-foreground pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Logo size="default" />
            <p className="text-primary-foreground/70 leading-relaxed">{t('footer.tagline')}</p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all" aria-label="facebook">
                <Icon icon="lucide:facebook" className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all" aria-label="instagram">
                <Icon icon="lucide:instagram" className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all" aria-label="twitter">
                <Icon icon="lucide:twitter" className="text-xl" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">{t('footer.quickLinks')}</h4>
            <ul className="space-y-4 text-primary-foreground/70">
              <li><Link to="/" className="hover:text-secondary transition-colors">{t('footer.links.home')}</Link></li>
              <li><Link to="/restaurants" className="hover:text-secondary transition-colors">{t('footer.links.restaurants')}</Link></li>
              <li><Link to="/reviews" className="hover:text-secondary transition-colors">{t('footer.links.reviews')}</Link></li>
              <li><a href="#" className="hover:text-secondary transition-colors">{t('footer.links.driver')}</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">{t('footer.links.addRestaurant')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6">{t('footer.support')}</h4>
            <ul className="space-y-4 text-primary-foreground/70">
              <li><a href="#" className="hover:text-secondary transition-colors">{t('footer.supportLinks.helpCenter')}</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">{t('footer.supportLinks.privacy')}</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">{t('footer.supportLinks.terms')}</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">{t('footer.supportLinks.contact')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6">{t('footer.newsletter')}</h4>
            <div className="flex flex-col gap-3">
              <input type="email" placeholder={t('footer.emailPlaceholder')} className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50" />
              <button type="button" className="w-full py-3 bg-secondary text-secondary-foreground font-bold rounded-xl hover:opacity-90 transition-all">
                {t('footer.subscribe')}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/50">
          <p>{t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
