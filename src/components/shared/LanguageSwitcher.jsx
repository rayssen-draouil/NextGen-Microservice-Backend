import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('fr') ? 'fr' : 'en';

  const setLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('foodly-lang', lang);
  };

  return (
    <div className="flex items-center bg-muted p-1 rounded-full border border-border">
      <button
        type="button"
        onClick={() => setLang('en')}
        className={
          current === 'en'
            ? 'px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-bold shadow-sm'
            : 'px-4 py-1.5 text-muted-foreground rounded-full text-xs font-medium hover:bg-background transition-all'
        }
      >
        🇬🇧 EN
      </button>
      <button
        type="button"
        onClick={() => setLang('fr')}
        className={
          current === 'fr'
            ? 'px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-bold shadow-sm'
            : 'px-4 py-1.5 text-muted-foreground rounded-full text-xs font-medium hover:bg-background transition-all'
        }
      >
        🇫🇷 FR
      </button>
    </div>
  );
}
