import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enRestaurants from './locales/en/restaurants.json';
import enOrders from './locales/en/orders.json';
import enAdmin from './locales/en/admin.json';
import enMenu from './locales/en/menu.json';
import enReviews from './locales/en/reviews.json';

import frCommon from './locales/fr/common.json';
import frHome from './locales/fr/home.json';
import frRestaurants from './locales/fr/restaurants.json';
import frOrders from './locales/fr/orders.json';
import frAdmin from './locales/fr/admin.json';
import frMenu from './locales/fr/menu.json';
import frReviews from './locales/fr/reviews.json';

const resources = {
  en: {
    common: enCommon,
    home: enHome,
    restaurants: enRestaurants,
    orders: enOrders,
    admin: enAdmin,
    menu: enMenu,
    reviews: enReviews,
  },
  fr: {
    common: frCommon,
    home: frHome,
    restaurants: frRestaurants,
    orders: frOrders,
    admin: frAdmin,
    menu: frMenu,
    reviews: frReviews,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'en',
    supportedLngs: ['en', 'fr'],
    ns: ['common', 'home', 'restaurants', 'orders', 'admin', 'menu', 'reviews'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'foodly-lang',
      caches: ['localStorage'],
    },
  });

export default i18n;
