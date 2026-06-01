'use client'
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const CHAT_KEY = 'honeymoon_chat_v2'

const PAGE_LABELS = {
  '/': 'Thuis dashboard',
  '/reis': 'Reisschema',
  '/ontdek': 'Ontdek in de buurt',
  '/dagboek': 'Fotodagboek',
  '/lijsten': 'Checklists & paklijst',
  '/budget': 'Budget & uitgaven',
}

const SUGGESTIES = {
  '/': ['Geruststellen — staat alles klaar?', 'Tip voor vandaag', 'Wat vergeten?'],
  '/reis': ['Plan een perfecte dag', 'Hoe kom ik hier?', 'Wat is de dresscode?'],
  '/ontdek': ['Halal restaurants in de buurt', 'Romantisch plekje voor vanavond', 'Off-the-beaten-track tip'],
  '/dagboek': ['Stel een bijschrift voor', 'Schrijf ons reisverhaal', 'Beste foto van vandaag kiezen'],
  '/lijsten': ['Wat vergeten in de koffer?', 'Checklist voor morgen', 'Douane tips'],
  '/budget': ['Wat is de fooi hier?', 'Hoeveel cash meenemen?', 'Budget-vriendelijke tips'],
}

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center px-3 py-2.5">
      {[0,1,2].map(i => <div key={i} className="typing-dot" style={{ animationDelay: `${i*0.2}s` }} />)}
    </div>
  )
}

export default function FloatingAI({ currentUser, location, destination, today }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const pathname = usePathname()

  useEffect(() => {
    try { setMessages(JSON.parse(localStorage.getItem(CHAT_KEY)) || []) } catch { setMessages([]) }
  }, [])

  useEffect(() => {
    if (messages.length) localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-60)))
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, open])

  async function send(text) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    const userMsg = { role: 'user', content: msg, name: currentUser }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          context: {
            page: PAGE_LABELS[pathname] || pathname,
            location, destination, today,
          },
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || data.error || 'Fout opgetreden.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, even geen verbinding. Probeer het opnieuw! 💕' }])
    } finally {
      setLoading(false)
    }
  }

  const suggesties = SUGGESTIES[pathname] || SUGGESTIES['/']

  return (
    <>
      {/* Zwevende knop */}
      {!open && (
        <button className="ai-fab" onClick={() => setOpen(true)} aria-label="AI assistent openen">
          <span style={{ fontSize: '1.4rem' }}>✦</span>
        </button>
      )}

      {/* Chat-paneel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end pointer-events-none">
          <div className="pointer-events-auto flex flex-col"
               style={{
                 width: '100%', maxWidth: 420, height: '85dvh',
                 background: 'var(--cream)', borderRadius: '24px 24px 0 0',
                 boxShadow: '0 -8px 40px rgba(46,38,32,0.18)',
                 marginBottom: 0,
               }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b"
                 style={{ borderColor: 'var(--gold-line)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                     style={{ background: 'linear-gradient(135deg,#E3A6B5,#C9A24B)' }}>
                  ✦
                </div>
                <div>
                  <p className="font-semibold text-sm serif" style={{ color: 'var(--brown)' }}>Reisassistent</p>
                  <p className="text-xs" style={{ color: 'var(--gold)' }}>online · spreekt NL</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { if(confirm('Chat wissen?')) { setMessages([]); localStorage.removeItem(CHAT_KEY) }}}
                        className="text-xs px-2.5 py-1 rounded-lg"
                        style={{ color: 'var(--brown-soft)', background: 'rgba(201,162,75,0.08)' }}>
                  Wis
                </button>
                <button onClick={() => setOpen(false)} className="text-xl" style={{ color: 'var(--brown-soft)' }}>✕</button>
              </div>
            </div>

            {/* Berichten */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-3xl mb-3">✦</p>
                  <p className="serif-italic text-sm mb-4" style={{ color: 'var(--brown-soft)' }}>
                    Hallo! Ik ben jullie persoonlijke reisassistent.<br/>
                    Hoe kan ik jullie helpen vandaag? 💕
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggesties.map(s => (
                      <button key={s} onClick={() => send(s)}
                              className="text-xs px-3 py-1.5 rounded-full chip">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs mt-auto mb-1"
                         style={{ background: 'linear-gradient(135deg,#E3A6B5,#C9A24B)' }}>
                      ✦
                    </div>
                  )}
                  <div className={m.role === 'user' ? 'bubble-user' : 'bubble-ai'}>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                  {m.role === 'user' && (
                    <span className="text-sm self-end mb-1 flex-shrink-0">
                      {m.name === 'lilia' ? '👰' : '🤵'}
                    </span>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-2 items-end">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                       style={{ background: 'linear-gradient(135deg,#E3A6B5,#C9A24B)' }}>✦</div>
                  <div className="bubble-ai"><TypingIndicator /></div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Snelle suggesties na eerste bericht */}
            {messages.length > 0 && messages.length < 4 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                {suggesties.slice(0,2).map(s => (
                  <button key={s} onClick={() => send(s)}
                          className="text-xs px-3 py-1.5 rounded-full chip flex-shrink-0">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 pb-4 pt-2 border-t flex gap-2"
                 style={{ borderColor: 'var(--gold-line)', paddingBottom: 'calc(16px + env(safe-area-inset-bottom,0px))' }}>
              <textarea value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                        placeholder="Stel een vraag..."
                        rows={1} className="input flex-1 resize-none"
                        style={{ minHeight: 44, maxHeight: 110, paddingTop: 12, paddingBottom: 12 }} />
              <button onClick={() => send()} disabled={loading || !input.trim()} className="btn-gold px-4 disabled:opacity-40">
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
