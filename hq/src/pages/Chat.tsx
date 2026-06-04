import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Shell from '@/components/Shell'
import { useTrip } from '@/lib/store'
import { QUICK_QS, Lang } from '@/data/trip'
import { api } from '@/lib/api'
import { getChat, addChat, subscribeChat } from '@/lib/supabase'

function avatar(name: string) { return name === 'lilia' ? '👰' : name === 'abdul' ? '🤵' : '✦' }

export default function Chat() {
  const { t, i18n } = useTranslation()
  const { phone } = useTrip()
  const lang = (i18n.language as Lang) || 'en'
  const [msgs, setMsgs] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const seen = useRef<Set<string>>(new Set())

  useEffect(() => {
    getChat().then((m: any[]) => { setMsgs(m || []); (m || []).forEach(x => x.id && seen.current.add(x.id)) })
    const sub = subscribeChat((m: any) => {
      if (m.id && seen.current.has(m.id)) return
      if (m.id) seen.current.add(m.id)
      setMsgs(prev => [...prev, m])
    })
    return () => { try { (sub as any).unsubscribe() } catch {} }
  }, [])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, thinking])

  async function aiRespond(history: any[]) {
    setThinking(true)
    try {
      const sys = `Je bent ✦ Claude, de AI-coworker in de gedeelde chat van Abdul & Lilia op huwelijksreis in Indonesië (Lombok→Gili→Bali, 12 jun–24 jul 2026). Je leest hun gesprek mee. Reageer warm, kort en praktisch, en stel concrete dingen voor (plekken, agenda, budget) als coworker. Allergie: gras + chloor (alleen zee, geen zwembad). Antwoord in het ${lang === 'nl' ? 'Nederlands' : lang === 'hy' ? 'Armeens' : 'Engels'}.`
      const r = await api.chat(history.slice(-12).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.role === 'assistant' ? m.content : `${m.name === 'lilia' ? 'Lilia' : 'Abdul'}: ${m.content}` })), sys)
      const aiMsg = { role: 'assistant', content: r.message || t('chat.offline'), name: 'claude', created_at: new Date().toISOString(), id: crypto.randomUUID() }
      seen.current.add(aiMsg.id); setMsgs(p => [...p, aiMsg]); addChat(aiMsg)
    } catch {
      setMsgs(p => [...p, { role: 'assistant', content: t('chat.offline'), name: 'claude', created_at: new Date().toISOString() }])
    } finally { setThinking(false) }
  }

  async function send(text?: string) {
    const content = (text || input).trim(); if (!content) return
    setInput('')
    const id = crypto.randomUUID()
    const userMsg = { role: 'user', content, name: phone, created_at: new Date().toISOString(), id }
    seen.current.add(id); const next = [...msgs, userMsg]; setMsgs(next); addChat(userMsg)
    const mentioned = /@claude/i.test(content)
    if (mentioned || Math.random() < 0.18) await aiRespond(next)
  }

  return (
    <Shell fab={false}>
      <div className="s-head"><div><div className="s-title">{t('chat.title')}</div><div className="eyebrow">✦ {t('chat.tagline')} · zeg <b style={{ color: 'var(--gold)' }}>@claude</b></div></div></div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12, minHeight: '46vh' }}>
        {msgs.length === 0 && (
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.55 }}>{t('chat.welcome')}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>💬 Dit is jullie gedeelde chat. Claude leest mee en springt bij als je <b style={{ color: 'var(--gold)' }}>@claude</b> zegt.</div>
          </div>
        )}
        {msgs.map((m, i) => {
          const mine = m.role === 'user' && m.name === phone
          const ai = m.role === 'assistant'
          return (
            <div key={m.id || i} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
              {!mine && <span style={{ fontSize: 18 }}>{ai ? '✦' : avatar(m.name)}</span>}
              <div style={{ maxWidth: '78%' }}>
                {!mine && <div style={{ fontSize: 10, color: ai ? 'var(--gold)' : 'var(--text-3)', marginBottom: 2, marginLeft: 4 }}>{ai ? 'Claude' : (m.name === 'lilia' ? 'Lilia' : 'Abdul')}</div>}
                <div style={{ padding: '10px 14px', borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap',
                  background: mine ? 'linear-gradient(135deg,var(--gold),var(--gold-light))' : ai ? 'var(--glass)' : 'var(--glass-2)',
                  color: mine ? '#0A1628' : 'var(--text)', border: mine ? 'none' : '1px solid var(--line)' }}>
                  {m.content}
                </div>
              </div>
            </div>
          )
        })}
        {thinking && <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '6px 10px' }}><span>✦</span><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div>}
        <div ref={endRef} />
      </div>

      {msgs.length === 0 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 10 }} className="no-sb">
          {(QUICK_QS[lang] || QUICK_QS.en).map((q, i) => <button key={i} className="pill" style={{ flexShrink: 0 }} onClick={() => send('@claude ' + q)}>@claude {q}</button>)}
        </div>
      )}

      <form onSubmit={e => { e.preventDefault(); send() }} style={{ display: 'flex', gap: 8, position: 'sticky', bottom: 8 }}>
        <input className="input" placeholder={'Bericht… (zeg @claude voor de AI)'} value={input} onChange={e => setInput(e.target.value)} />
        <button className="btn btn-gold" type="submit">➤</button>
      </form>
    </Shell>
  )
}
