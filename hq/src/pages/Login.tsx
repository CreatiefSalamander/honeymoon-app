import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useTrip, Phone } from '@/lib/store'
import { LANGS, setLang } from '@/lib/i18n'
import { IMAGES, TRIP } from '@/data/trip'

export default function Login() {
  const { t, i18n } = useTranslation()
  const { login } = useTrip()
  const days = Math.ceil((new Date(TRIP.start).getTime() - Date.now()) / 86400000)

  function choose(p: Phone) { if ('vibrate' in navigator) navigator.vibrate([15, 40, 15]); login(p) }

  return (
    <div className="app-bg">
      <div className="frame" style={{ justifyContent: 'flex-end' }}>
        {/* Sfeerfoto vol */}
        <img src={IMAGES.coupleB} alt="" onError={e => { (e.target as HTMLImageElement).src = IMAGES.hero }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,22,40,.96) 12%, rgba(10,22,40,.4) 55%, rgba(10,22,40,.55) 100%)' }} />

        {/* Taal rechtsboven */}
        <div style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top,0px) + 16px)', right: 16, display: 'flex', gap: 6, zIndex: 2 }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
              style={{ width: 34, height: 34, borderRadius: 11, fontSize: 16, background: i18n.language === l.code ? 'rgba(201,168,76,.9)' : 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)' }}>{l.flag}</button>
          ))}
        </div>

        {/* Inhoud */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'relative', zIndex: 2, padding: '0 24px calc(env(safe-area-inset-bottom,0px) + 40px)', color: '#fff' }}>
          <div style={{ fontSize: 38, marginBottom: 8 }}>✦</div>
          <div className="serif" style={{ fontStyle: 'italic', fontSize: 18, opacity: .9 }}>{t('home.welcome')}</div>
          <h1 className="serif" style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.04, margin: '4px 0 6px' }}>Honeymoon HQ</h1>
          <p style={{ fontSize: 14, opacity: .85, marginBottom: 4 }}>Indonesia · Lombok · Gili · Bali</p>
          <p style={{ fontSize: 13, color: 'var(--gold-light)', marginBottom: 26 }}>
            {days > 0 ? `${days} ${t('home.daysToGo')}` : t('home.dayOf', { x: Math.abs(days) + 1 })}
          </p>

          <p style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', opacity: .7, marginBottom: 12 }}>{t('settings.whoPhone')}</p>
          <div style={{ display: 'flex', gap: 12 }}>
            {([['abdul', '🤵'], ['lilia', '👰']] as [Phone, string][]).map(([p, e]) => (
              <button key={p} onClick={() => choose(p)} className="glass"
                style={{ flex: 1, padding: '20px 12px', borderRadius: 20, textAlign: 'center', border: '1px solid rgba(201,168,76,.4)', background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(14px)' }}>
                <div style={{ fontSize: 40, marginBottom: 6 }}>{e}</div>
                <div className="serif" style={{ fontSize: 22, fontWeight: 600, color: '#fff', textTransform: 'capitalize' }}>{p}</div>
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, opacity: .55, textAlign: 'center', marginTop: 18 }}>Geen wachtwoord nodig — jullie privé-app 💛</p>
        </motion.div>
      </div>
    </div>
  )
}
