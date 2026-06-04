import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Shell from '@/components/Shell'
import { useTrip } from '@/lib/store'
import { getFlights, addFlight, deleteFlight, logActivity } from '@/lib/supabase'
import { toast } from '@/lib/notify'

const COMPARE = (from: string, to: string, d: string, r: string) => [
  { name: 'Google Flights', icon: '🔍', url: `https://www.google.com/travel/flights?q=flights%20from%20${from}%20to%20${to}%20${d}` },
  { name: 'Skyscanner', icon: '🌐', url: `https://www.skyscanner.nl/transport/vluchten/${from}/${to}/${d.replace(/-/g, '')}/${r ? r.replace(/-/g, '') : ''}` },
  { name: 'Kayak', icon: '🛫', url: `https://www.kayak.nl/flights/${from}-${to}/${d}${r ? '/' + r : ''}` },
  { name: 'Momondo', icon: '💡', url: `https://www.momondo.nl/flightssearch/${from}-${to}/${d}${r ? '/' + r : ''}` },
]
const NEARBY: Record<string, string[]> = { AMS: ['RTM (Rotterdam)', 'EIN (Eindhoven)', 'BRU (Brussel)', 'DUS (Düsseldorf)'] }

export default function Vluchten() {
  const { t } = useTranslation()
  const { phone } = useTrip()
  const [flights, setFlights] = useState<any[]>([])
  const [tab, setTab] = useState<'mine' | 'search'>('mine')
  const [add, setAdd] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [status, setStatus] = useState<Record<string, any>>({})
  const [form, setForm] = useState<any>({ flight_no: '', airline: '', from_code: 'AMS', to_code: '', depart_at: '', arrive_at: '', seat: '', confirmation: '' })
  const [sf, setSf] = useState({ from: 'AMS', to: 'DPS', depart: '2026-06-12', ret: '' })
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { getFlights().then(setFlights) }, [])

  async function save() {
    if (!form.flight_no) { toast('Vluchtnr?'); return }
    const f = await addFlight({ ...form, created_by: phone }); if (f) { setFlights(p => [...p, f]); logActivity('vlucht', `${phone === 'lilia' ? 'Lilia' : 'Abdul'} voegde vlucht ${form.flight_no} toe`, phone) }
    setAdd(false); setForm({ flight_no: '', airline: '', from_code: 'AMS', to_code: '', depart_at: '', arrive_at: '', seat: '', confirmation: '' }); toast('✓')
  }
  async function del(id: string) { await deleteFlight(id); setFlights(p => p.filter(f => f.id !== id)) }

  async function scan(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setParsing(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/.netlify/functions/flight-parse', { method: 'POST', body: fd })
      const d = await res.json()
      if (d && !d.error) { setForm((p: any) => ({ ...p, flight_no: d.flightNo || p.flight_no, airline: d.airline || p.airline, from_code: d.fromCode || p.from_code, to_code: d.toCode || p.to_code, depart_at: d.departDate && d.departTime ? `${d.departDate}T${d.departTime}` : p.depart_at, seat: d.seat || p.seat, confirmation: d.confirmation || p.confirmation })); setAdd(true); toast('✓ ingelezen') }
      else toast(d.error || 'Niet gelukt')
    } finally { setParsing(false); e.target.value = '' }
  }

  async function checkStatus(f: any) {
    const date = (f.depart_at || '').split('T')[0]
    try { const r = await fetch(`/.netlify/functions/flight-status?flight=${f.flight_no}&date=${date}`).then(x => x.json()); setStatus(s => ({ ...s, [f.id]: r })) }
    catch { setStatus(s => ({ ...s, [f.id]: { error: true } })) }
  }

  return (
    <Shell>
      <div className="s-head"><div className="s-title">Vluchten</div></div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button className={`pill ${tab === 'mine' ? 'on' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setTab('mine')}>🎫 Mijn vluchten</button>
        <button className={`pill ${tab === 'search' ? 'on' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setTab('search')}>🔎 Zoek & vergelijk</button>
      </div>

      {tab === 'mine' ? (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={scan} style={{ display: 'none' }} />
            <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => fileRef.current?.click()} disabled={parsing}>{parsing ? '⏳ Inlezen…' : '📷 Boarding pass scannen'}</button>
            <button className="btn btn-gold btn-sm" onClick={() => setAdd(true)}>+ Handmatig</button>
          </div>
          {flights.length === 0 ? <div className="card" style={{ padding: 24, textAlign: 'center' }}><div style={{ fontSize: 32 }}>✈️</div><p className="serif" style={{ fontSize: 17, marginTop: 6 }}>Nog geen vluchten</p><p style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 4 }}>Scan je boarding pass of voeg handmatig toe</p></div> :
            flights.map(f => (
              <div key={f.id} className="card" style={{ padding: 14, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>✈️</span>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{f.flight_no} {f.airline ? `· ${f.airline}` : ''}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{f.from_code} → {f.to_code} {f.depart_at ? '· ' + new Date(f.depart_at).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</div>
                    {f.seat && <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Stoel {f.seat} {f.confirmation ? '· ' + f.confirmation : ''}</div>}
                    {status[f.id] && !status[f.id].error && <div style={{ fontSize: 11.5, color: 'var(--teal)', marginTop: 2 }}>Status: {status[f.id].status || '—'} {status[f.id].departure?.gate ? `· gate ${status[f.id].departure.gate}` : ''}</div>}
                    {status[f.id]?.needKey && <div style={{ fontSize: 11, color: 'var(--text-3)' }}>🔑 AviationStack-sleutel nodig voor live status</div>}
                  </div>
                  <button onClick={() => del(f.id)} style={{ opacity: .5 }}>🗑️</button>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 8 }} onClick={() => checkStatus(f)}>🔄 Live status</button>
              </div>
            ))}
        </>
      ) : (
        <>
          <div className="card" style={{ padding: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input className="input" placeholder="Van (AMS)" value={sf.from} onChange={e => setSf(s => ({ ...s, from: e.target.value.toUpperCase() }))} />
              <input className="input" placeholder="Naar (DPS)" value={sf.to} onChange={e => setSf(s => ({ ...s, to: e.target.value.toUpperCase() }))} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="date" className="input" value={sf.depart} onChange={e => setSf(s => ({ ...s, depart: e.target.value }))} />
              <input type="date" className="input" value={sf.ret} onChange={e => setSf(s => ({ ...s, ret: e.target.value }))} />
            </div>
          </div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Vergelijk op</div>
          {COMPARE(sf.from, sf.to, sf.depart, sf.ret).map(c => (
            <a key={c.name} className="card" href={c.url} target="_blank" rel="noreferrer" style={{ padding: '13px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>{c.icon}</span><span style={{ flex: 1, fontWeight: 600 }}>{c.name}</span><span style={{ color: 'var(--gold)' }}>→</span>
            </a>
          ))}
          {NEARBY[sf.from] && <div className="card" style={{ padding: 14, marginTop: 6 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>🗺️ Ook vanaf in de buurt</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{NEARBY[sf.from].join(' · ')}</div>
          </div>}
          <div className="card" style={{ padding: 14, marginTop: 10 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>💡 Tips</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>· Boek 6–8 weken vooraf · Di/wo goedkoopst · Vergelijk min. 3 sites · Let op bagagekosten bij prikkers</div>
          </div>
        </>
      )}

      {add && (
        <div className="overlay" onClick={() => setAdd(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="s-title" style={{ fontSize: 20, marginBottom: 12 }}>Vlucht toevoegen</div>
            {[['flight_no', 'Vluchtnr (KL809)'], ['airline', 'Maatschappij'], ['from_code', 'Van (AMS)'], ['to_code', 'Naar (DPS)'], ['seat', 'Stoel'], ['confirmation', 'Boekingsnr']].map(([k, ph]) => (
              <input key={k} className="input" placeholder={ph} value={form[k]} onChange={e => setForm((f: any) => ({ ...f, [k]: e.target.value }))} style={{ marginBottom: 8 }} />
            ))}
            <input type="datetime-local" className="input" value={form.depart_at} onChange={e => setForm((f: any) => ({ ...f, depart_at: e.target.value }))} style={{ marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 10 }}><button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setAdd(false)}>{t('common.cancel')}</button><button className="btn btn-gold" style={{ flex: 2 }} onClick={save}>{t('common.save')}</button></div>
          </div>
        </div>
      )}
    </Shell>
  )
}
