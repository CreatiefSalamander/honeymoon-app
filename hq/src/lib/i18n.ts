import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '@/locales/en.json'
import nl from '@/locales/nl.json'
import hy from '@/locales/hy.json'

const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('lang') : null

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    nl: { translation: nl },
    hy: { translation: hy },
  },
  lng: saved || 'en',          // standaardtaal Engels (brief §1)
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export const LANGS = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'hy', name: 'Հայերեն', flag: '🇦🇲' },
]

export function setLang(code: string) {
  i18n.changeLanguage(code)
  localStorage.setItem('lang', code)
  document.documentElement.lang = code
}

export default i18n
