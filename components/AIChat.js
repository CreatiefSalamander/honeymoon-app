'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'

// AI Chat overlay - agent met navigatie, spraak, typing indicator
export default function AIChat({ onClose, initialMessage = null }) {
  const router = useRouter()
  const { lang } = useLanguage()
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const dragY = useMotionValue(0)
  const recognitionRef = useRef(null)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hoi! Ik ben jullie reisassistent - ik ken Lilia haar allergieen (geen jungle of chloor) en ons budget. Vraag maar raak! 🌊', timestamp: new Date() }
  ])
  const [input, setInput] = useState(initialMessage || '')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [context, setContext] = useState({})
  const [currentUser] = useState(typeof window !== 'undefined' ? localStorage.getItem('currentUser') || 'abdul' : 'abdul')

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    Promise.all([
      supabase.from('itinerary').select('title').eq('date', today).limit(3),
      supabase.from('expenses').select('bedrag'),
    ]).then(([{ data: agenda }, { data: expenses }]) => {
      const uitgegeven = expenses?.reduce((s, e) => s + (e.bedrag || 0), 0) || 0
      setContext({ page: typeof window !== 'undefined' ? window.location.pathname : '/', destination: 'Lombok', today: agenda?.map(i => i.title).join(', ') || 'leeg', budget_remaining: Math.round(10000 - uitgegeven), current_user: currentUser })
    }).catch(() => {})
  }, [currentUser])

  useEffect(() => { if (initialMessage) setTimeout(() => sendMessage(initialMessage), 600) }, [])

  const toggleListening = useCallback(() => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Spraak niet beschikbaar'); return }
    const r = new SR()
    r.lang = lang === 'en' ? 'en-US' : 'nl-NL'
    r.onresult = (e) => { const t = e.results[0][0].transcript; setInput(t); setIsListening(false); setTimeout(() => sendMessage(t), 300) }
    r.onend = () => setIsListening(false)
    r.onerror = () => setIsListening(false)
    recognitionRef.current = r; r.start(); setIsListening(true)
  }, [isListening, lang])

  const sendMessage = async (text = input) => {
    const msg = (typeof text === 'string' ? text : input).trim()
    if (!msg || isTyping) return
    setInput('')
    const userMsg = { role: 'user', content: msg, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg].slice(-10).map(m => ({ role: m.role, content: m.content })), context: { ...context, page: typeof window !== 'undefined' ? window.location.pathname : '/' }, lang }) })
      const data = await res.json()
      let display = (data.message || 'Probeer opnieuw.').replace(/[NAVIGATE:[^]]+]/g, '').replace(/[ACTION:[^]]+]/g, '').trim()
      const aiMsg = { role: 'assistant', content: display, timestamp: new Date(), actions: data.actions }
      setMessages(prev => [...prev, aiMsg])
      if (data.actions?.length) {
        for (const action of data.actions) {
          if (action.type === 'navigate') { setTimeout(() => { router.push(action.path); onClose?.() }, 1200) }
          else if (action.type === 'add_agenda') { await supabase.from('itinerary').insert({ title: action.title, date: action.date, time: action.time, type: 'AI' }) }
          else if (action.type === 'add_budget') { await supabase.from('expenses').insert({ omschrijving: action.description, bedrag: action.amount, categorie: action.category }) }
        }
      }
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: 'Verbindingsfout. Probeer opnieuw.', timestamp: new Date() }]) }
    finally { setIsTyping(false) }
  }

  const handleDragEnd = (_, info) => { if (info.offset.y > 150 || info.velocity.y > 500) onClose?.(); else dragY.set(0) }

  const suggestions = lang === 'en' ? ['Activities for Lilia?','Budget status?','Best beaches'] : ['Activiteiten voor Lilia?','Hoe staat het budget?','Beste stranden Bali']

  return (
    <motion.div className="fixed inset-0 z-50" onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />
      <motion.div drag="y" dragConstraints={{ top: 0, bottom: 400 }} dragElastic={0.2} onDragEnd={handleDragEnd}
        style={{ y: dragY, position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '88vh', background: 'rgba(10,22,40,0.97)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(201,168,76,0.25)', borderRadius: '20px 20px 0 0', display: 'flex', flexDirection: 'column' }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        <div style={{ padding: '12px 20px 10px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 12px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#4ecdc4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✨</div>
              <div>
                <p style={{ color: '#f0ece4', fontWeight: 700, fontSize: '0.95rem', margin: 0, fontFamily: "'Cormorant Garamond',serif" }}>Reisassistent</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ecdc4', display: 'inline-block' }} />
                  <span style={{ color: '#4ecdc4', fontSize: '0.62rem' }}>Online - Claude AI</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', color: '#8a9ab5', fontSize: '1.2rem' }}>x</button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 12 }} className="hide-scrollbar">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                {msg.role === 'assistant' && <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#4ecdc4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>✨</div>}
                <div style={{ maxWidth: '78%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.role === 'user' ? 'linear-gradient(135deg,#c9a84c,#e8c97a)' : 'rgba(255,255,255,0.06)', border: msg.role === 'user' ? 'none' : '1px solid rgba(201,168,76,0.15)', color: msg.role === 'user' ? '#0a1628' : '#f0ece4', fontSize: '0.88rem', lineHeight: 1.55, fontFamily: msg.role === 'assistant' ? "'Cormorant Garamond',serif" : 'inherit' }}>
                  {msg.content}
                  {msg.actions?.find(a => a.type === 'navigate') && <div style={{ marginTop: 8, padding: '5px 10px', background: 'rgba(201,168,76,0.15)', borderRadius: 8, fontSize: '0.7rem', color: '#c9a84c' }}>Navigeer naar: {msg.actions.find(a => a.type === 'navigate')?.path}</div>}
                </div>
              </div>
              <p style={{ color: '#8a9ab5', fontSize: '0.58rem', margin: '3px 0 0', textAlign: msg.role === 'user' ? 'right' : 'left', paddingLeft: msg.role === 'assistant' ? 36 : 0 }}>{msg.timestamp?.toLocaleTimeString('nl', { hour: '2-digit', minute: '2-digit' })}</p>
            </motion.div>
          ))}
          <AnimatePresence>
            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#4ecdc4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>✨</div>
                  <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '18px 18px 18px 4px', display: 'flex', gap: 5, alignItems: 'center' }}>
                    <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        {messages.length <= 2 && (
          <div style={{ padding: '6px 16px 4px', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0 }} className="hide-scrollbar">
            {suggestions.map((s, i) => <button key={i} onClick={() => sendMessage(s)} style={{ padding: '5px 12px', borderRadius: 100, background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.25)', color: '#c9a84c', fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0 }}>{s}</button>)}
          </div>
        )}
        <div style={{ padding: '10px 16px', paddingBottom: 'calc(10px + env(safe-area-inset-bottom,0px))', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.20)', borderRadius: 24, padding: '8px 12px' }}>
            <button onClick={toggleListening} style={{ width: 32, height: 32, borderRadius: '50%', background: isListening ? 'rgba(239,68,68,0.2)' : 'rgba(78,205,196,0.10)', border: isListening ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(78,205,196,0.25)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>{isListening ? '🔴' : '🎙️'}</button>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} placeholder={isListening ? 'Luistert...' : 'Stel een vraag...'} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#f0ece4', fontSize: '0.88rem' }} disabled={isTyping || isListening} />
            <button onClick={() => sendMessage()} disabled={!input.trim() || isTyping} style={{ width: 32, height: 32, borderRadius: '50%', background: input.trim() && !isTyping ? 'linear-gradient(135deg,#c9a84c,#e8c97a)' : 'rgba(255,255,255,0.06)', border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', color: input.trim() ? '#0a1628' : '#8a9ab5', flexShrink: 0 }}>&#9658;</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
               }
