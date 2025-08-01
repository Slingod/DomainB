import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationFR from './fr.json';
import translationEN from './en.json';
import translationES from './es.json';
import translationRU from './ru.json';
import translationZH from './zh.json';

const resources = {
  fr: { translation: translationFR },
  en: { translation: translationEN },
  es: { translation: translationES },
  ru: { translation: translationRU },
  zh: { translation: translationZH }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;