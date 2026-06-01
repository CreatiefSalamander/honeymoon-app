'use client'
import { useState, useRef, useEffect } from 'react'

const STORAGE_KEY = 'honeymoon_chat_history'

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center px-4 py-3">
      {[0, 1, 2].map(i => (
        <div key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  )
}

export default function AIChat({ currentUser }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try { setMessages(JSON.parse(saved)) } catch {}
    }
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)))
    }
  }, [messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text, name: currentUser }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          user: currentUser,
        }),
      })

      if (!res.ok) throw new Error('API fout')
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, er ging iets mis. Probeer het opnieuw! 💕',
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function clearChat() {
    if (confirm('Chat-geschiedenis wissen?')) {
      setMessages([])
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="glass-card p-4 w-full flex items-center gap-3 active:scale-98 transition-transform"
        style={{ borderColor: 'rgba(212,175,55,0.3)' }}
      >
        <span className="text-2xl">✨</span>
        <div className="text-left flex-1">
          <p className="font-semibold text-sm" style={{ color: '#3D2B1F', fontFamily: 'DM Sans' }}>
            AI Reisassistent
          </p>
          <p className="text-xs" style={{ color: '#9B8080' }}>
            Vraag om tips, restaurants, ideeën…
          </p>
        </div>
        <span style={{ color: '#D4AF37' }}>→</span>
      </button>
    )
  }

  return (
    <div className="glass-card flex flex-col" style={{ height: 500 }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b"
           style={{ borderColor: 'rgba(212,175,55,0.2)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <div>
            <p className="font-semibold text-sm heading-playfair">Reisassistent</p>
            <p className="text-xs" style={{ color: '#D4AF37' }}>Online</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={clearChat} className="text-xs px-2 py-1 rounded-lg"
                  style={{ color: '#9B8080', background: 'rgba(212,175,55,0.1)' }}>
            Wis
          </button>
          <button onClick={() => setOpen(false)} className="text-xl">✕</button>
        </div>
      </div>

      {/* Berichten */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-3xl mb-3">🌍</p>
            <p className="heading-italic text-sm" style={{ color: '#9B8080' }}>
              Hallo! Ik ben jullie persoonlijke reisassistent.<br />
              Vraag me alles over jullie huwelijksreis! 💕
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {['Romantische restaurants', 'Packlist tips', 'Lokale cultuur', 'Activiteiten'].map(s => (
                <button key={s} onClick={() => setInput(s)}
                        className="text-xs px-3 py-1.5 rounded-full"
                        style={{ background: 'rgba(232,164,184,0.15)', color: '#E8A4B8', border: '1px solid rgba(232,164,184,0.3)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <span className="text-lg mr-2 self-end mb-1">✨</span>
            )}
            <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <span className="text-sm ml-2 self-end mb-1">
                {msg.name === 'lilia' ? '👰' : '🤵'}
              </span>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <span className="text-lg mr-2 self-end mb-1">✨</span>
            <div className="chat-bubble-ai">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t flex gap-2" style={{ borderColor: 'rgba(212,175,55,0.2)' }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Stel een vraag…"
          rows={1}
          className="input-field flex-1 resize-none"
          style={{ minHeight: 44, maxHeight: 120, paddingTop: 12, paddingBottom: 12 }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="btn-gold px-4 py-2 text-sm disabled:opacity-50"
        >
          ➤
        </button>
      </div>
    </div>
  )
}
