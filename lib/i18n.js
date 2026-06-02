'use client'
import { createContext, useContext, useState, useEffect } from 'react'

// ── Vertalingen ───────────────────────────────────────────────────────────────
export const TALEN = [
  { code: 'nl', naam: 'Nederlands', vlag: '🇳🇱', rtl: false },
  { code: 'en', naam: 'English',    vlag: '🇬🇧', rtl: false },
  { code: 'ar', naam: 'العربية',    vlag: '🇸🇦', rtl: true  },
  { code: 'hy', naam: 'Հայերեն',    vlag: '🇦🇲', rtl: false },
  { code: 'ru', naam: 'Русский',    vlag: '🇷🇺', rtl: false },
]

const T = {
  // ── Navigatie ──────────────────────────────────
  thuis:        { nl:'Thuis',       en:'Home',       ar:'الرئيسية',  hy:'Տուն',      ru:'Главная' },
  reis:         { nl:'Reis',        en:'Trip',        ar:'الرحلة',   hy:'Ուղևորություն', ru:'Поездка' },
  ontdek:       { nl:'Ontdek',      en:'Discover',   ar:'اكتشف',    hy:'Հայտնաբեր', ru:'Открыть' },
  dagboek:      { nl:"Dagboek",     en:'Diary',       ar:'المذكرات', hy:'Օրագիր',    ru:'Дневник' },
  lijsten:      { nl:'Lijsten',     en:'Lists',       ar:'القوائم',  hy:'Ցուցակներ', ru:'Списки' },
  budget:       { nl:'Budget',      en:'Budget',      ar:'الميزانية',hy:'Բյուջե',    ru:'Бюджет' },
  agenda:       { nl:'Agenda',      en:'Calendar',    ar:'الأجندة',  hy:'Օրացույց',  ru:'Agenda' },
  favorieten:   { nl:'Favorieten',  en:'Favorites',   ar:'المفضلة',  hy:'Սիրելիներ', ru:'Избранное' },
  meldingen:    { nl:'Meldingen',   en:'Notifications',ar:'الإشعارات',hy:'Ծանուցումներ',ru:'Уведомления' },
  instellingen: { nl:'Instellingen',en:'Settings',    ar:'الإعدادات',hy:'Կարգավորումներ',ru:'Настройки' },
  meer:         { nl:'Meer',        en:'More',        ar:'المزيد',   hy:'Ավելին',    ru:'Ещё' },

  // ── Knoppen ────────────────────────────────────
  opslaan:      { nl:'Opslaan',     en:'Save',        ar:'حفظ',      hy:'Պահպանել',  ru:'Сохранить' },
  annuleer:     { nl:'Annuleer',    en:'Cancel',      ar:'إلغاء',    hy:'Չեղարկել',  ru:'Отмена' },
  voegToe:      { nl:'Toevoegen',   en:'Add',         ar:'إضافة',    hy:'Ավելացնել', ru:'Добавить' },
  verwijder:    { nl:'Verwijderen', en:'Delete',      ar:'حذف',      hy:'Ջնջել',     ru:'Удалить' },
  bewerk:       { nl:'Bewerken',    en:'Edit',        ar:'تعديل',    hy:'Խմբագրել',  ru:'Изменить' },
  zoek:         { nl:'Zoeken',      en:'Search',      ar:'بحث',      hy:'Փնտրել',    ru:'Поиск' },
  laden:        { nl:'Laden...',    en:'Loading...',  ar:'جارٍ التحميل',hy:'Բեռնվում է',ru:'Загрузка...' },

  // ── Thuis ──────────────────────────────────────
  goedemorgen:  { nl:'Goedemorgen', en:'Good morning', ar:'صباح الخير',hy:'Բարի լույս',ru:'Доброе утро' },
  goedemiddag:  { nl:'Goedemiddag', en:'Good afternoon',ar:'مساء الخير',hy:'Բարի կեսօր',ru:'Добрый день' },
  goedenavond:  { nl:'Goedenavond', en:'Good evening', ar:'مساء النور',hy:'Բարի երեկո',ru:'Добрый вечер' },
  vandaag:      { nl:'Vandaag',     en:'Today',       ar:'اليوم',    hy:'Այսօր',     ru:'Сегодня' },
  nogTot:       { nl:'Nog tot de grote dag',en:'Until the big day',ar:'حتى اليوم الكبير',hy:'Մինչ մեծ օրը',ru:'До большого дня' },
  getrouwd:     { nl:'Jullie zijn getrouwd! 💍',en:"You're married! 💍",ar:'أنتما متزوجان! 💍',hy:'Դուք ամուսնացած եք! 💍',ru:'Вы поженились! 💍' },

  // ── Ontdek ─────────────────────────────────────
  inDeBuurt:    { nl:'In de buurt', en:'Nearby',      ar:'بالقرب',   hy:'Մոտակայքում',ru:'Рядом' },
  open:         { nl:'Open',        en:'Open',        ar:'مفتوح',    hy:'Բաց',       ru:'Открыто' },
  gesloten:     { nl:'Gesloten',    en:'Closed',      ar:'مغلق',     hy:'Փակ',       ru:'Закрыто' },
  route:        { nl:'Route',       en:'Route',       ar:'المسار',   hy:'Երթուղի',   ru:'Маршрут' },
  bellen:       { nl:'Bellen',      en:'Call',        ar:'اتصال',    hy:'Զանգ',      ru:'Позвонить' },
  bewaard:      { nl:'Bewaard',     en:'Saved',       ar:'تم الحفظ', hy:'Պահպանված', ru:'Сохранено' },

  // ── Budget ─────────────────────────────────────
  uitgegeven:   { nl:'Uitgegeven',  en:'Spent',       ar:'أُنفق',    hy:'Ծախսվել',   ru:'Потрачено' },
  nogOver:      { nl:'Nog over',    en:'Remaining',   ar:'المتبقي',  hy:'Մնացել',    ru:'Остаток' },
  totaal:       { nl:'Totaal',      en:'Total',       ar:'الإجمالي', hy:'Ընդամենը',  ru:'Итого' },
  prognose:     { nl:'Prognose',    en:'Forecast',    ar:'التنبؤ',   hy:'Կանխատեսում',ru:'Прогноз' },

  // ── Agenda ─────────────────────────────────────
  morgen:       { nl:'Morgen',      en:'Tomorrow',    ar:'غداً',     hy:'Վաղը',      ru:'Завтра' },
  gisteren:     { nl:'Gisteren',    en:'Yesterday',   ar:'أمس',      hy:'Երեկ',      ru:'Вчера' },
  week:         { nl:'Week',        en:'Week',        ar:'أسبوع',    hy:'Շաբաթ',     ru:'Неделя' },
  dag:          { nl:'Dag',         en:'Day',         ar:'يوم',      hy:'Օր',        ru:'День' },
  afstand:      { nl:'Afstand',     en:'Distance',    ar:'المسافة',  hy:'Հեռավорություն',ru:'Расстояние' },

  // ── Lijsten ────────────────────────────────────
  paklijst:     { nl:'Paklijst',    en:'Packing list',ar:'قائمة التعبئة',hy:'Փաթեթավoрման ցուցակ',ru:'Список вещей' },
  bucketlist:   { nl:'Bucketlist',  en:'Bucket list', ar:'قائمة الأمنيات',hy:'Ցանկությունների ցուցակ',ru:'Список желаний' },
  afgevinkt:    { nl:'Afgevinkt',   en:'Checked',     ar:'تم التحقق',hy:'Ստուգված',  ru:'Отмечено' },

  // ── Meldingen ──────────────────────────────────
  geenMeldingen:{ nl:'Geen meldingen',en:'No notifications',ar:'لا توجد إشعارات',hy:'Ծانуцомнерум չকা',ru:'Нет уведомлений' },
  actiefeed:    { nl:'Activiteit',  en:'Activity',    ar:'النشاط',   hy:'Ակտивность', ru:'Активность' },
  recentWijzigingen:{nl:'Recente wijzigingen',en:'Recent changes',ar:'التغييرات الأخيرة',hy:'Վերջին փոփохоکутюннер',ru:'Последние изменения' },

  // ── Instellingen ───────────────────────────────
  taal:         { nl:'Taal',        en:'Language',    ar:'اللغة',    hy:'Լezuk',     ru:'Язык' },
  thema:        { nl:'Thema',       en:'Theme',       ar:'المظهر',   hy:'Թeme',      ru:'Тема' },
  donker:       { nl:'Donker',      en:'Dark',        ar:'داكن',     hy:'Մוугut',    ru:'Тёмный' },
  licht:        { nl:'Licht',       en:'Light',       ar:'فاتح',     hy:'Baccarat',  ru:'Светлый' },
  systeem:      { nl:'Systeem',     en:'System',      ar:'النظام',   hy:'Сістема',   ru:'Система' },
  profiel:      { nl:'Profiel',     en:'Profile',     ar:'الملف الشخصي',hy:'Профіль',ru:'Профиль' },
  huwelijksdatum:{nl:'Huwelijksdatum',en:'Wedding date',ar:'تاريخ الزواج',hy:'Ամussnутюna ամsaстаttс',ru:'Дата свадьбы' },
  valuta:       { nl:'Valuta',      en:'Currency',    ar:'العملة',   hy:'Арժuta',    ru:'Валюта' },
  meldingen2:   { nl:'Meldingen',   en:'Notifications',ar:'الإشعارات',hy:'Ծандhеrkutyunner',ru:'Уведомления' },
  locatie:      { nl:'Locatie',     en:'Location',    ar:'الموقع',   hy:'Местоположение',ru:'Местоположение' },
  privacy:      { nl:'Privacy',     en:'Privacy',     ar:'الخصوصية', hy:'Конфіdenциальность',ru:'Конфиденциальность' },
  account:      { nl:'Account',     en:'Account',     ar:'الحساب',   hy:'Акаунт',    ru:'Аккаунт' },
  uitloggen:    { nl:'Uitloggen',   en:'Sign out',    ar:'تسجيل الخروج',hy:'Дhеkhell',ru:'Выйти' },
  appReset:     { nl:'App resetten',en:'Reset app',   ar:'إعادة ضبط التطبيق',hy:'Vерakan appopp',ru:'Сброс приложения' },
  locatieToestemming:{nl:'Locatietoegang',en:'Location access',ar:'الوصول للموقع',hy:'Местоположение доступ',ru:'Доступ к местоположению' },
}

// ── Context ───────────────────────────────────────────────────────────────────
const LangCtx = createContext({ lang: 'nl', setLang: () => {}, t: (k) => k })

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('nl')

  useEffect(() => {
    const saved = localStorage.getItem('lang') || 'nl'
    setLangState(saved)
    document.documentElement.lang = saved
    document.documentElement.dir = TALEN.find(l => l.code === saved)?.rtl ? 'rtl' : 'ltr'
  }, [])

  function setLang(code) {
    setLangState(code)
    localStorage.setItem('lang', code)
    document.documentElement.lang = code
    document.documentElement.dir = TALEN.find(l => l.code === code)?.rtl ? 'rtl' : 'ltr'
  }

  function t(key) {
    return T[key]?.[lang] ?? T[key]?.['nl'] ?? key
  }

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>
}

export function useLanguage() {
  return useContext(LangCtx)
}

export function useTrans() {
  const { t } = useContext(LangCtx)
  return t
}
