'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { useLanguage } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'

// Paginabewuste suggesties
const PAGE_SUGGESTIONS = {
  '/': ['Activiteiten voor Lilia?', 'Budget check', 'Wat is er vandaag?', 'Weer update'],
  '/budget': ['Analyseer mijn uitgaven', 'Bespaar tips', 'Resterende budget'],
  '/agenda': ['Voeg activiteit toe', 'Morgen plannen', 'Vrije dagen invullen'],
  '/locatie': ['Wat is hier in de buurt?', 'Strand aanbeveling', 'Halal restaurant nearby'],
  '/ontdek': ['Beste stranden Bali', 'Snorkelen tips', 'Activiteiten voor 2 personen'],
  '/vluchten': ['Vlucht status checken', 'Bagage tips', 'Check-in info'],
  '/dagboek': ['Help me schrijven', 'Samenvatten', 'Mooiste momenten'],
  default: ['Activiteiten voor Lilia?', 'Budget advies', 'Beste strand', 'Halal eten'],
}

// Geanimeerde orb component
function OrbAnimation({ isTyping, isListening, size = 44 }) {
  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      {/* Buitenste glow ring */}
      <motion.div
        animate={{ scale: isTyping || isListening ? [1, 1.2, 1] : 1, opacity: isTyping || isListening ? [0.4, 0.7, 0.4] : 0.3 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', inset: -6, borderRadius: '50%', background: isListening ? 'rgba(239,68,68,0.2)' : 'rgba(201,168,76,0.2)' }} />
      {/* Orb zelf */}
      <motion.div
        animate={{ scale: isTyping ? [1, 1.05, 1] : 1 }}
        transition={{ duration: 0.8, repeat: isTyping ? Infinity : 0, ease: 'easeInOut' }}
        style={{ width: '100%', height: '100%', borderRadius: '50%', background: isListening ? 'linear-gradient(135deg,#ef4444,#f87171)' : 'linear-gradient(135deg,#c9a84c,#4ecdc4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4, boxShadow: isTyping ? '0 0 20px rgba(201,168,76,0.5)' : '0 2px 10px rgba(0,0,0,0.3)' }}>
        {isListening ? '🎙️' : '✨'}
      </motion.div>
    </div>
  )
}

// Premium AI Chat overlay
export default function AIChat({ onClose, initialMessage = null, defaultExpanded = false }) {
  const router = useRouter()
  const pathname = usePathname()
  const { lang } = useLanguage()
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const dragY = useMotionValue(0)
  const recognitionRef = useRef(null)
  const abortRef = useRef(null)

  const [messages, setMessages] = useState(() => {
    if (typeof window === 'undefined') return [{ role: 'assistant', content: 'Hoi! Ik ben jullie reisassistent 🌊 Vraag me alles over jullie huwelijksreis - activiteiten, budget, restaurants... Ik ken Lilia haar allergieen en ons budget!', timestamp: new Date(), id: 1 }]
    try { return JSON.parse(localStorage.getItem('ai_chat_history') || 'null') || [{ role: 'assistant', content: 'Hoi! Ik ben jullie reisassistent 🌊 Vraag me alles over jullie huwelijksreis - activiteiten, budget, restaurants... Ik ken Lilia haar allergieen en ons budget!', timestamp: new Date(), id: 1 }] } catch { return [{ role: 'assistant', content: 'Hoi!', timestamp: new Date(), id: 1 }] }
  })
  const [input, setInput] = useState(initialMessage || '')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [context, setContext] = useState({})
  const [streamingId, setStreamingId] = useState(null)
  const [currentUser] = useState(typeof window !== 'undefined' ? localStorage.getItem('currentUser') || 'abdul' : 'abdul')
  const suggestions = PAGE_SUGGESTIONS[pathname] || PAGE_SUGGESTIONS.default

  // Sla chat op in localStorage
  useEffect(() => {
    if (messages.length > 1) {
      try { localStorage.setItem('ai_chat_history', JSON.stringify(messages.slice(-50))) } catch {}
    }
  }, [messages])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // App context ophalen
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    Promise.all([
      supabase.from('itinerary').select('title').eq('date', today).limit(3),
      supabase.from('expenses').select('bedrag'),
    ]).then(([{ data: agenda }, { data: expenses }]) => {
      const uitgegeven = expenses?.reduce((s, e) => s + (e.bedrag || 0), 0) || 0
      setContext({ page: pathname, destination: 'Lombok', today: agenda?.map(i => i.title).join(', ') || 'leeg', budget_remaining: Math.round(10000 - uitgegeven), current_user: currentUser })
    }).catch(() => {})
  }, [pathname, currentUser])

  useEffect(() => { if (initialMessage) setTimeout(() => sendMessage(initialMessage), 700) }, [])

  // Streaming bericht verzenden
  const sendMessage = async (text = input) => {
    const msg = (typeof text === 'string' ? text : input).trim()
    if (!msg || isTyping) return
    setInput('')
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const msgId = Date.now()
    const userMsg = { role: 'user', content: msg, timestamp: new Date(), id: msgId }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)
    const aiId = msgId + 1
    setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date(), id: aiId, streaming: true }])
    setStreamingId(aiId)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg].slice(-12).map(m => ({ role: m.role, content: m.content })), context: { ...context, page: pathname }, lang, stream: true })
      })
      if (!res.ok) throw new Error('API fout')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let actions = []
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.text) {
              fullText += data.text
              const display = fullText.replace(/\[NAVIGATE:[^\]]+\]/g, '').replace(/\[ACTION:[^\]]+\]/g, '').trim()
              setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: display, streaming: true } : m))
            }
            if (data.done) {
              actions = data.actions || []
              setMessages(prev => prev.map(m => m.id === aiId ? { ...m, streaming: false, actions } : m))
              if (actions.length) executeActions(actions)
            }
          } catch {}
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: 'Verbindingsfout. Probeer opnieuw.', streaming: false } : m))
    } finally { setIsTyping(false); setStreamingId(null) }
  }

  const executeActions = async (actions) => {
    for (const action of actions) {
      if (action.type === 'navigate') { setTimeout(() => { router.push(action.path); onClose?.() }, 1500) }
      else if (action.type === 'add_agenda') { await supabase.from('itinerary').insert({ title: action.title, date: action.date, time: action.time, type: 'AI' }) }
      else if (action.type === 'add_budget') { await supabase.from('expenses').insert({ omschrijving: action.description, bedrag: action.amount, categorie: action.category }) }
    }
  }

  const toggleListening = useCallback(() => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Spraak niet beschikbaar'); return }
    const r = new SR(); r.lang = lang === 'en' ? 'en-US' : 'nl-NL'
    r.onresult = (e) => { const t = e.results[0][0].transcript; setInput(t); setIsListening(false); setTimeout(() => sendMessage(t), 300) }
    r.onend = () => setIsListening(false); r.onerror = () => setIsListening(false)
    recognitionRef.current = r; r.start(); setIsListening(true)
    if (navigator.vibrate) navigator.vibrate(50)
  }, [isListening, lang])

  const handleDragEnd = (_, info) => { if (info.offset.y > 120 || info.velocity.y > 400) onClose?.(); else dragY.set(0) }
  const clearHistory = () => { localStorage.removeItem('ai_chat_history'); setMessages([{ role: 'assistant', content: 'Chat gewist! Stel gerust een nieuwe vraag 🌊', timestamp: new Date(), id: Date.now() }]) }

  const panelHeight = isExpanded ? '96vh' : '82vh'

  return (
    <motion.div className="fixed inset-0 z-50" onClick={e => e.target === e.currentTarget && onClose?.()}>
      {/* Backdrop */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'absolute', inset: 0, background: 'rgba(5,12,24,0.75)', backdropFilter: 'blur(12px) saturate(180%)' }} />

      {/* Chat panel */}
      <motion.div drag="y" dragConstraints={{ top: 0, bottom: 300 }} dragElastic={0.15}
        onDragEnd={handleDragEnd} style={{ y: dragY, position: 'absolute', bottom: 0, left: 0, right: 0, height: panelHeight,
          background: 'rgba(8,18,35,0.96)', backdropFilter: 'blur(32px) saturate(200%)',
          borderTop: '1px solid rgba(201,168,76,0.30)', borderRadius: '22px 22px 0 0',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.08)' }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 32 }}>

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 44, height: 4, background: 'rgba(255,255,255,0.18)', borderRadius: 2 }} />
        </div>

        {/* Header */}
        <div style={{ padding: '10px 18px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <OrbAnimation isTyping={isTyping} isListening={isListening} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ color: '#f0ece4', fontWeight: 700, fontSize: '1rem', margin: 0, fontFamily: "'Cormorant Garamond',serif", letterSpacing: '0.02em' }}>Reisassistent</p>
                <AnimatePresence>
                  {isTyping && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ fontSize: '0.62rem', color: '#4ecdc4', fontWeight: 600 }}>schrijft...</motion.span>}
                </AnimatePresence>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ecdc4', display: 'inline-block' }} />
                <span style={{ color: '#8a9ab5', fontSize: '0.62rem' }}>Claude AI - Honeymoon agent</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setIsExpanded(!isExpanded)} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', color: '#8a9ab5', fontSize: '0.8rem' }} title="Uitbreiden">
                {isExpanded ? '⊟' : '⊞'}
              </button>
              <button onClick={clearHistory} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', color: '#8a9ab5', fontSize: '0.75rem' }} title="Wis chat">
                🗑️
              </button>
              <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', color: '#8a9ab5', fontSize: '1rem' }}>
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Berichten */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 16 }} className="hide-scrollbar">
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              {msg.role === 'user' ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ maxWidth: '80%', padding: '11px 16px', borderRadius: '20px 20px 5px 20px', background: 'linear-gradient(135deg,#c9a84c,#e8c97a)', color: '#0a1628', fontSize: '0.88rem', lineHeight: 1.55, fontWeight: 500 }}>
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <OrbAnimation isTyping={msg.streaming} isListening={false} size={32} />
                  <div style={{ flex: 1, maxWidth: 'calc(100% - 44px)' }}>
                    <div style={{ padding: '11px 16px', borderRadius: '5px 20px 20px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.12)', color: '#f0ece4', fontSize: '0.9rem', lineHeight: 1.6, fontFamily: "'Cormorant Garamond',serif" }}>
                      {msg.content || (msg.streaming ? '' : '...')}
                      {msg.streaming && (
                        <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} style={{ display: 'inline-block', width: 2, height: '1em', background: '#c9a84c', marginLeft: 2, verticalAlign: 'text-bottom', borderRadius: 1 }} />
                      )}
                    </div>
                    {/* Agent actie badges */}
                    {msg.actions?.map((action, i) => (
                      <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ marginTop: 6, padding: '6px 12px', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 10, fontSize: '0.72rem', color: '#c9a84c', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        {action.type === 'navigate' && <><span>🧭</span><span>Navigeert naar {action.path}</span></>}
                        {action.type === 'add_agenda' && <><span>📅</span><span>Toegevoegd aan agenda: {action.title}</span></>}
                        {action.type === 'add_budget' && <><span>💰</span><span>Budget genoteerd: EUR {action.amount}</span></>}
                      </motion.div>
                    ))}
                    <p style={{ color: '#8a9ab5', fontSize: '0.58rem', margin: '4px 0 0', paddingLeft: 2 }}>
                      {new Date(msg.timestamp).toLocaleTimeString('nl', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {/* Typing indicator apart */}
          <AnimatePresence>
            {isTyping && !streamingId && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <OrbAnimation isTyping size={32} />
                  <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '5px 20px 20px 20px', display: 'flex', gap: 5, alignItems: 'center' }}>
                    <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Suggesties */}
        {messages.length <= 2 && (
          <div style={{ padding: '6px 16px 4px', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0 }} className="hide-scrollbar">
            {suggestions.map((s, i) => (
              <motion.button key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                onClick={() => sendMessage(s)} style={{ padding: '6px 13px', borderRadius: 100, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.22)', color: '#c9a84c', fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}>
                {s}
              </motion.button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '10px 14px', paddingBottom: 'calc(10px + env(safe-area-inset-bottom,0px))', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.22)', borderRadius: 28, padding: '9px 14px', transition: 'border-color 0.2s' }}>
            {/* Microfoon */}
            <motion.button onClick={toggleListening} whileTap={{ scale: 0.9 }}
              style={{ width: 34, height: 34, borderRadius: '50%', background: isListening ? 'rgba(239,68,68,0.15)' : 'rgba(78,205,196,0.08)', border: isListening ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(78,205,196,0.22)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
              {isListening ? (
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>🔴</motion.span>
              ) : '🎙️'}
            </motion.button>

            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={isListening ? 'Luistert...' : isTyping ? 'AI schrijft...' : 'Stel een vraag...'}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#f0ece4', fontSize: '0.88rem', fontFamily: 'inherit' }}
              disabled={isTyping || isListening} />

            <AnimatePresence>
              {input.trim() && !isTyping && (
                <motion.button initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                  onClick={() => sendMessage()} whileTap={{ scale: 0.9 }}
                  style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#e8c97a)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a1628', fontSize: '0.85rem', flexShrink: 0, fontWeight: 700 }}>
                  &#9658;
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
    }
