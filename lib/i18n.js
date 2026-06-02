'use client'
import { createContext, useContext, useState, useEffect } from 'react'

export const TALEN = [
  { code: 'nl', naam: 'Nederlands', vlag: '🇳🇱', rtl: false },
  { code: 'en', naam: 'English',    vlag: '🇬🇧', rtl: false },
  { code: 'ar', naam: 'العربية', vlag: '🇸🇦', rtl: true  },
  { code: 'hy', naam: 'Hayeren',    vlag: '🇦🇲', rtl: false },
  { code: 'ru', naam: 'Russky',     vlag: '🇷🇺', rtl: false },
]

// Alle vertalingen
const T = {
  // Navigatie
  thuis:        { nl:'Thuis',        en:'Home',          ar:'الرئيسية',  hy:'Toун',      ru:'Главная'    },
  reis:         { nl:'Reis',         en:'Trip',           ar:'الرحلة',   hy:'Ճampar',    ru:'Поездка'    },
  ontdek:       { nl:'Ontdek',       en:'Discover',       ar:'اكتشف',    hy:'Batsakel',  ru:'Открыть'    },
  dagboek:      { nl:'Dagboek',      en:'Diary',          ar:'المذكرات', hy:'Oragir',    ru:'Дневник'    },
  lijsten:      { nl:'Checklist',    en:'Checklist',      ar:'قوائمي',   hy:'Checklist', ru:'Чеклист'    },
  budget:       { nl:'Budget',       en:'Budget',         ar:'الميزانية',hy:'Byuje',     ru:'Бюджет'     },
  agenda:       { nl:'Agenda',       en:'Calendar',       ar:'الأجندة',  hy:'Agenda',    ru:'Дела'       },
  favorieten:   { nl:'Favorieten',   en:'Favorites',      ar:'المفضلة',  hy:'Sireli',    ru:'Избранное'  },
  meldingen:    { nl:'Meldingen',    en:'Notifications',  ar:'الإشعارات',hy:'Tsanucumn', ru:'Уведомления'},
  instellingen: { nl:'Instellingen', en:'Settings',       ar:'الإعدادات',hy:'Kargor',    ru:'Настройки'  },
  vluchten:     { nl:'Vluchten',     en:'Flights',        ar:'الرحلات',  hy:'Reis',      ru:'Рейсы'      },
  weer:         { nl:'Weer',         en:'Weather',        ar:'الطقس',    hy:'Eghanak',   ru:'Погода'     },

  // Knoppen
  opslaan:      { nl:'Opslaan',      en:'Save',           ar:'حفظ',      hy:'Pahpanel',  ru:'Сохранить'  },
  annuleer:     { nl:'Annuleer',     en:'Cancel',         ar:'إلغاء',    hy:'Chelarckel',ru:'Отмена'     },
  voegToe:      { nl:'Toevoegen',    en:'Add',            ar:'إضافة',    hy:'Avelacnel', ru:'Добавить'   },
  verwijder:    { nl:'Verwijderen',  en:'Delete',         ar:'حذف',      hy:'Jnjel',     ru:'Удалить'    },
  bewerk:       { nl:'Bewerken',     en:'Edit',           ar:'تعديل',    hy:'Khmbagrr',  ru:'Изменить'   },
  zoek:         { nl:'Zoeken',       en:'Search',         ar:'بحث',      hy:'Pntrel',    ru:'Поиск'      },
  laden:        { nl:'Laden...',     en:'Loading...',     ar:'جارٍ...',  hy:'Bernum...',  ru:'Загрузка...' },
  sluiten:      { nl:'Sluiten',      en:'Close',          ar:'إغلاق',    hy:'Kagel',     ru:'Закрыть'    },

  // Thuis
  goedemorgen:  { nl:'Goedemorgen',  en:'Good morning',   ar:'صباح الخير',hy:'Bari loys', ru:'Доброе утро' },
  goedemiddag:  { nl:'Goedemiddag',  en:'Good afternoon', ar:'مساء الخير',hy:'Bari kesor',ru:'Добрый день'  },
  goedenavond:  { nl:'Goedenavond',  en:'Good evening',   ar:'مساء النور',hy:'Bari ireko', ru:'Добрый вечер' },
  vandaag:      { nl:'Vandaag',      en:'Today',          ar:'اليوم',    hy:'Aysor',     ru:'Сегодня'    },
  nogTot:       { nl:'Nog tot de grote dag', en:'Until the big day', ar:'حتى اليوم الكبير', hy:'Mints mets ore', ru:'До большого дня' },
  getrouwd:     { nl:'Jullie zijn getrouwd!', en:"You're married!", ar:'أنتما متزوجان!', hy:'Duk amousnacadek!', ru:'Вы поженились!' },
  nogOver:      { nl:'nog over',     en:'remaining',      ar:'المتبقي',   hy:'menum',     ru:'осталось'   },

  // Ontdek
  inDeBuurt:    { nl:'In de buurt',  en:'Nearby',         ar:'بالقرب',   hy:'Motakayqum',ru:'Рядом'      },
  open:         { nl:'Open',         en:'Open',           ar:'مفتوح',    hy:'Bac',       ru:'Открыто'    },
  gesloten:     { nl:'Gesloten',     en:'Closed',         ar:'مغلق',     hy:'Pak',       ru:'Закрыто'    },
  route:        { nl:'Route',        en:'Route',          ar:'المسار',   hy:'Ughy',      ru:'Маршрут'    },
  bellen:       { nl:'Bellen',       en:'Call',           ar:'اتصال',    hy:'Zanganek',  ru:'Позвонить'  },
  bewaar:       { nl:'Bewaar',       en:'Save',           ar:'احفظ',     hy:'Pahpanel',  ru:'Сохранить'  },

  // Budget
  uitgegeven:   { nl:'Uitgegeven',   en:'Spent',          ar:'أُنفق',    hy:'Tsakhsvel', ru:'Потрачено'  },
  totaal:       { nl:'Totaal',       en:'Total',          ar:'الإجمالي', hy:'Ampaginn',  ru:'Итого'      },
  prognose:     { nl:'Prognose',     en:'Forecast',       ar:'التنبؤ',   hy:'Kskhorem',  ru:'Прогноз'    },

  // Agenda
  morgen:       { nl:'Morgen',       en:'Tomorrow',       ar:'غداً',     hy:'Vagha',     ru:'Завтра'     },
  gisteren:     { nl:'Gisteren',     en:'Yesterday',      ar:'أمس',      hy:'Ereko',     ru:'Вчера'      },
  dag:          { nl:'Dag',          en:'Day',            ar:'يوم',      hy:'Or',        ru:'День'        },
  week:         { nl:'Week',         en:'Week',           ar:'أسبوع',    hy:'Shabat',    ru:'Неделя'     },
  afstand:      { nl:'Afstand',      en:'Distance',       ar:'المسافة',  hy:'Herevuty',  ru:'Расстояние' },

  // Lijsten / Checklist
  paklijst:     { nl:'Paklijst',     en:'Packing list',   ar:'قائمة التعبئة', hy:'Irgeri ts.', ru:'Список вещей' },
  bucketlist:   { nl:'Bucketlist',   en:'Bucket list',    ar:'قائمة الأمنيات', hy:'Tsankutyunneri ts.', ru:'Список желаний' },
  afgevinkt:    { nl:'Afgevinkt',    en:'Checked',        ar:'تم التحقق', hy:'Nshvel',    ru:'Отмечено'   },

  // Meldingen
  geenMeldingen:{ nl:'Geen meldingen', en:'No notifications', ar:'لا إشعارات', hy:'Tsanucumner chka', ru:'Нет уведомлений' },
  actiefeed:    { nl:'Activiteit',   en:'Activity',       ar:'النشاط',   hy:'Gorcuneut.',ru:'Активность'  },
  recentWijzigingen: { nl:'Recente wijzigingen', en:'Recent changes', ar:'التغييرات الأخيرة', hy:'Verjin p\'ophokhut.', ru:'Последние изменения' },

  // Instellingen
  taal:         { nl:'Taal',         en:'Language',       ar:'اللغة',    hy:'Lezou',     ru:'Язык'       },
  thema:        { nl:'Thema',        en:'Theme',          ar:'المظهر',   hy:'T\'ema',    ru:'Тема'       },
  profiel:      { nl:'Profiel',      en:'Profile',        ar:'الملف',    hy:'Prof\'il',  ru:'Профиль'    },
  huwelijksdatum:{ nl:'Huwelijksdatum', en:'Wedding date', ar:'تاريخ الزواج', hy:'Amousnuty. atar', ru:'Дата свадьбы' },
  valuta:       { nl:'Valuta',       en:'Currency',       ar:'العملة',   hy:'Ardzyuyt',  ru:'Валюта'     },
  locatie:      { nl:'Locatie',      en:'Location',       ar:'الموقع',   hy:'Teg',       ru:'Местополо.' },
  uitloggen:    { nl:'Uitloggen',    en:'Sign out',       ar:'تسجيل الخروج', hy:'Durs gal', ru:'Выйти'   },
}

const LangCtx = createContext({ lang: 'nl', setLang: () => {}, t: k => k })

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
