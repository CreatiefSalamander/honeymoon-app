import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Shell from '@/components/Shell'
import { useTrip } from '@/lib/store'
import { QUICK_QS, Lang } from '@/data/trip'
import { api } from '@/lib/api'
import { getChat, addChat } from '@/lib/supabase'

export default function Chat() {
  const { t, i18n } = useTranslation()
  const { phone } = useTrip()
  const lang = (i18n.language as Lang) || 'en'
  const [msgs, setMsgs] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { getChat().then(m => setMsgs(m || [])) }, [])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, loading])

  async function send(text?: string) {
    const content = (text || input).trim()
    if (!content || loading) return
    setInput('')
    const userMsg = { role: 'user', content, name: phone, created_at: new Date().toISOString() }
    setMsgs(m => [...m, userMsg]); addChat(userMsg); setLoading(true)
    try {
      const sys = `Je bent de persoonlijke companion van Abdul & Lilia op huwelijksreis in Indonesië (Lombok→Gili→Bali, 12 jun–24 jul 2026). Je kent hun bucketlist, agenda, budget (€7000) en allergieën (gras + chloor → alleen zee, geen zwembad). Warm, romantisch, praktisch. Standaard ${lang === 'nl' ? 'Nederlands' : lang === 'hy' ? 'Armeens' : 'Engels'}, schakel op verzoek. Stel echte plekken voor met naam, reden, kosten, route, beste tijd. Help met Bahasa-zinnen, cultuur, gezondheid en de zakelijke vragen (KvK Indonesië, ondernemingsvormen).`
      const r = await api.chat([...msgs, userMsg].map(m => ({ role: m.role, content: m.content })), sys)
      const aiMsg = { role: 'assistant', content: r.message || t('chat.offline'), created_at: new Date().toISOString() }
      setMsgs(m => [...m, aiMsg]); addChat(aiMsg)
    } catch {
      const aiMsg = { role: 'assistant', content: t('chat.offline'), created_at: new Date().toISOString() }
      setMsgs(m => [...m, aiMsg])
    } finally { setLoading(false) }
  }

  return (
    <Shell fab={false}>
      <div className="s-head"><div><div className="s-title">{t('chat.title')}</div><div className="eyebrow">{t('chat.tagline')}</div></div></div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12, minHeight: '40vh' }}>
        {msgs.length === 0 && (
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>{t('chat.welcome')}</div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '82%', padding: '10px 14px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: m.role === 'user' ? 'var(--ocean)' : 'var(--glass)', color: m.role === 'user' ? '#fff' : 'var(--ink)', border: m.role === 'user' ? 'none' : '1px solid var(--line)', fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div style={{ display: 'flex', gap: 4, padding: '10px 14px' }}><span className="skel" style={{ width: 40, height: 12 }} /></div>}
        <div ref={endRef} />
      </div>

      {/* Quick questions */}
      {msgs.length === 0 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 10 }} className="no-sb">
          {(QUICK_QS[lang] || QUICK_QS.en).map((q, i) => <button key={i} className="pill" style={{ flexShrink: 0 }} onClick={() => send(q)}>{q}</button>)}
        </div>
      )}

      <form onSubmit={e => { e.preventDefault(); send() }} style={{ display: 'flex', gap: 8, position: 'sticky', bottom: 'calc(var(--nav-h) + 12px)' }}>
        <input className="input" placeholder={t('chat.placeholder')} value={input} onChange={e => setInput(e.target.value)} />
        <button className="btn btn-gold" type="submit" disabled={loading}>➤</button>
      </form>
    </Shell>
  )
}
