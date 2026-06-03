import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Shell from '@/components/Shell'
import { TRIP, IMAGES } from '@/data/trip'

const BAHASA = [
  { id: 'Terima kasih', nl: 'Dank je wel', en: 'Thank you' },
  { id: 'Selamat pagi', nl: 'Goedemorgen', en: 'Good morning' },
  { id: 'Berapa harganya?', nl: 'Hoeveel kost het?', en: 'How much is it?' },
  { id: 'Enak!', nl: 'Lekker!', en: 'Delicious!' },
  { id: 'Tolong', nl: 'Help / alstublieft', en: 'Help / please' },
  { id: 'Permisi', nl: 'Pardon / excuseer', en: 'Excuse me' },
  { id: 'Tidak pedas', nl: 'Niet pikant', en: 'Not spicy' },
  { id: 'Di mana toilet?', nl: 'Waar is het toilet?', en: 'Where is the toilet?' },
]

const EMERGENCY = [
  { label: 'Politie / Police', val: '110' },
  { label: 'Ambulance', val: '118 / 119' },
  { label: 'Brandweer / Fire', val: '113' },
  { label: 'SAR (redding)', val: '115' },
  { label: 'Toeristenpolitie Bali', val: '+62 361 754599' },
  { label: 'NL Ambassade Jakarta', val: '+62 21 5248200' },
]

export default function Profile() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [tab, setTab] = useState<'bahasa' | 'emergency'>('bahasa')
  const daysTotal = Math.round((new Date(TRIP.end).getTime() - new Date(TRIP.start).getTime()) / 86400000)

  return (
    <Shell fab={false}>
      <div style={{ position: 'relative', borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 16, minHeight: 150 }}>
        <img src={IMAGES.coupleA} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => (e.target as HTMLImageElement).style.opacity = '0'} />
        <div className="hero-grad" style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'relative', padding: 20, color: '#fff', display: 'flex', alignItems: 'flex-end', minHeight: 150 }}>
          <div>
            <div className="serif" style={{ fontSize: 26, fontWeight: 600 }}>Abdul &amp; Lilia</div>
            <div style={{ fontSize: 12.5, opacity: .9 }}>{t('profile.togetherSince')} · {daysTotal} {t('travel.nights')}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button className={`pill ${tab === 'bahasa' ? 'on' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setTab('bahasa')}>🗣️ {t('profile.bahasa')}</button>
        <button className={`pill ${tab === 'emergency' ? 'on' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setTab('emergency')}>🆘 {t('profile.emergency')}</button>
      </div>

      {tab === 'bahasa' ? BAHASA.map(b => (
        <div key={b.id} className="card" style={{ padding: '12px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div className="serif" style={{ fontSize: 17, fontWeight: 600, color: 'var(--ocean-deep)' }}>{b.id}</div><div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{lang === 'nl' ? b.nl : b.en}</div></div>
        </div>
      )) : EMERGENCY.map(e => (
        <a key={e.label} href={`tel:${e.val.split(' ')[0]}`} className="card" style={{ padding: '12px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14 }}>{e.label}</span>
          <span className="mono" style={{ fontSize: 13, color: 'var(--bad)', fontWeight: 600 }}>{e.val} 📞</span>
        </a>
      ))}
    </Shell>
  )
}
