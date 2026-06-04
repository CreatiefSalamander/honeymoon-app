import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Shell from '@/components/Shell'
import { useTrip } from '@/lib/store'
import { LANGS, setLang } from '@/lib/i18n'
import { hasSupabase } from '@/lib/supabase'
import { enablePush, pushSupported, pushEnabled } from '@/lib/push'
import { api } from '@/lib/api'
import { toast } from '@/lib/notify'

function Row({ icon, label, hint, children }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderTop: '1px solid var(--line)' }}>
      <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 1 }}>{hint}</div>}
      </div>
      {children}
    </div>
  )
}
function Group({ title, children }: any) {
  return (
    <div className="card" style={{ marginBottom: 14, overflow: 'hidden' }}>
      <div style={{ padding: '11px 16px', background: 'var(--glass-2)' }}><div className="eyebrow" style={{ color: 'var(--gold)' }}>{title}</div></div>
      {children}
    </div>
  )
}
function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return <button onClick={() => set(!on)} style={{ width: 46, height: 26, borderRadius: 13, background: on ? 'var(--ocean)' : 'var(--line)', position: 'relative', flexShrink: 0, transition: '.2s' }}><span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: '.2s' }} /></button>
}

export default function Settings() {
  const { t, i18n } = useTranslation()
  const { phone, setPhone, hotel, setHotel, settings, updateSettings } = useTrip()
  const [hotelInput, setHotelInput] = useState(hotel)

  async function turnOnPush() {
    const r = await enablePush(phone)
    if (r.ok) toast('🔔 ✓')
    else toast(r.reason === 'no-vapid-key' ? 'VAPID key nodig (zie rapport)' : r.reason === 'not-supported' ? 'Eerst op beginscherm zetten' : '🔕 ' + (r.reason || ''))
  }

  return (
    <Shell fab={false}>
      <div className="s-head"><div className="s-title">{t('settings.title')}</div></div>

      <Group title={'👤 ' + t('settings.whoPhone')}>
        <div style={{ display: 'flex', gap: 10, padding: 16 }}>
          {(['abdul', 'lilia'] as const).map(p => (
            <button key={p} onClick={() => setPhone(p)} className="card" style={{ flex: 1, padding: 16, textAlign: 'center', border: phone === p ? '2px solid var(--ocean)' : '1px solid var(--line)' }}>
              <div style={{ fontSize: 32 }}>{p === 'lilia' ? '👰' : '🤵'}</div>
              <div style={{ fontWeight: 600, textTransform: 'capitalize', marginTop: 4 }}>{p}</div>
            </button>
          ))}
        </div>
        <Row icon="🏨" label={t('travel.whereWeStay')}>
          <input className="input" style={{ width: 150 }} value={hotelInput} onChange={e => setHotelInput(e.target.value)} onBlur={() => { setHotel(hotelInput); toast('✓') }} placeholder="Hotel / villa" />
        </Row>
      </Group>

      <Group title={'🌐 ' + t('settings.language')}>
        <div style={{ display: 'flex', gap: 8, padding: 14 }}>
          {LANGS.map(l => <button key={l.code} className={`pill ${i18n.language === l.code ? 'on' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setLang(l.code)}>{l.flag} {l.name}</button>)}
        </div>
      </Group>

      <Group title={'🎨 ' + t('settings.app')}>
        <Row icon="🌓" label={t('settings.theme')}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className={`pill ${settings.theme === 'light' ? 'on' : ''}`} onClick={() => updateSettings({ theme: 'light' })}>{t('settings.themeLight')}</button>
            <button className={`pill ${settings.theme === 'night' ? 'on' : ''}`} onClick={() => updateSettings({ theme: 'night' })}>{t('settings.themeNight')}</button>
          </div>
        </Row>
        <Row icon="✨" label={t('settings.animations')}>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['full', 'reduced', 'off'] as const).map(a => <button key={a} className={`pill ${settings.animations === a ? 'on' : ''}`} onClick={() => updateSettings({ animations: a })}>{a}</button>)}
          </div>
        </Row>
        <Row icon="🔌" label={t('settings.firebaseStatus')} hint={hasSupabase ? t('settings.connected') : 'localStorage (offline)'}>
          <span className={`badge ${hasSupabase ? 'badge-ok' : 'badge-gold'}`}>{hasSupabase ? '●' : '○'}</span>
        </Row>
      </Group>

      <Group title={'🔔 ' + t('settings.notifications')}>
        <Row icon="🔔" label={t('settings.notifGlobal')}><Toggle on={settings.notifGlobal} set={v => updateSettings({ notifGlobal: v })} /></Row>
        <Row icon="📍" label={t('settings.nearbyAlerts')}><Toggle on={settings.nearbyAlerts} set={v => updateSettings({ nearbyAlerts: v })} /></Row>
        <Row icon="🥾" label={t('settings.bucketAlerts')}><Toggle on={settings.bucketAlerts} set={v => updateSettings({ bucketAlerts: v })} /></Row>
        <Row icon="🌙" label={t('settings.quietHours')}>
          <span className="mono" style={{ fontSize: 12 }}>{settings.quietFrom}–{settings.quietTo}</span>
        </Row>
        {pushSupported() && !pushEnabled() && <div style={{ padding: 12 }}><button className="btn btn-ocean" style={{ width: '100%' }} onClick={turnOnPush}>🔔 {t('settings.notifGlobal')}</button></div>}
        {pushSupported() && pushEnabled() && <div style={{ padding: 12, display: 'flex', gap: 8 }}>
          <span className="badge badge-ok" style={{ alignSelf: 'center' }}>● aan</span>
          <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={async () => { const r = await api.sendPush(phone, 'Honeymoon HQ ✦', 'Testmelding werkt! 💛'); toast(r.ok ? '✓ verstuurd' : 'Geen abonnement') }}>Stuur testmelding</button>
        </div>}
        {!pushSupported() && <div style={{ padding: 12, fontSize: 12, color: 'var(--text-3)' }}>📱 Zet de app eerst op je iPhone-beginscherm (Safari → Deel → Zet op beginscherm) voor meldingen.</div>}
      </Group>

      <Group title={'🧭 ' + t('settings.exploreMap')}>
        <Row icon="📏" label={t('settings.defaultRadius')}>
          <div style={{ display: 'flex', gap: 6 }}>{[1000, 5000, 10000].map(r => <button key={r} className={`pill ${settings.defaultRadius === r ? 'on' : ''}`} onClick={() => updateSettings({ defaultRadius: r })}>{r / 1000}km</button>)}</div>
        </Row>
        <Row icon="🛵" label={t('settings.defaultTransport')}>
          <div style={{ display: 'flex', gap: 6 }}>{(['walk', 'scooter', 'boat'] as const).map(tr => <button key={tr} className={`pill ${settings.defaultTransport === tr ? 'on' : ''}`} onClick={() => updateSettings({ defaultTransport: tr })}>{tr === 'walk' ? '🚶' : tr === 'scooter' ? '🛵' : '⛵'}</button>)}</div>
        </Row>
        <Row icon="📍" label={t('settings.location')} hint={t('settings.locationHint')}><span className="badge badge-ok">●</span></Row>
      </Group>

      <Group title={'💰 ' + t('settings.budgetSet')}>
        <Row icon="💶" label={t('settings.totalBudget')}>
          <input type="number" className="input" style={{ width: 100 }} value={settings.totalBudget} onChange={e => updateSettings({ totalBudget: Number(e.target.value) })} />
        </Row>
        <Row icon="💱" label={t('settings.currency')}>
          <div style={{ display: 'flex', gap: 6 }}>{(['EUR', 'IDR'] as const).map(c => <button key={c} className={`pill ${settings.currency === c ? 'on' : ''}`} onClick={() => updateSettings({ currency: c })}>{c}</button>)}</div>
        </Row>
      </Group>

      <div className="card" style={{ padding: 16, textAlign: 'center' }}>
        <div className="eyebrow">{t('settings.version')}</div>
        <div className="serif" style={{ fontSize: 18, fontStyle: 'italic', color: 'var(--ocean-deep)', marginTop: 4 }}>Honeymoon HQ · v4.0</div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 4 }}>Made with ❤️ for Abdul &amp; Lilia</div>
      </div>
    </Shell>
  )
}
