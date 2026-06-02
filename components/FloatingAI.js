'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const CHAT_KEY = 'honeymoon_chat_v2'

const APP_KENNIS = `
Je bent de AI-assistent van de Honeymoon App van Abdul & Lilia.
Je kent de app door en door en kunt de gebruiker er doorheen navigeren.

## PAGINA'S IN DE APP:
- 🏠 /          → Thuis: countdown, vandaag op schema, weer-glimp, budget-glimp, snelknoppen
- 🗺️ /reis       → Reisschema: dagplanning, activiteiten toevoegen, vluchten, boarding-pass scanner
- 🧭 /ontdek     → Ontdek: Google Places, restaurants/cafés/attracties zoeken op GPS of stad, AI-reviews
- 📸 /dagboek    → Dagboek: foto's uploaden, masonry grid, lightbox, gedeeld met partner
- ✅ /lijsten    → Lijsten: paklijst, bucketlist, to-do, boodschappen, checklists
- 💰 /budget     → Budget: uitgaven bijhouden, pie chart, valuta-omrekenen, bonnetje scannen
- ⛅ /weer       → Weer: uitgebreide weersinfo, 7-daagse voorspelling, kleding-tips
- ✈️ /vluchten   → Vluchten zoeken: vergelijk Skyscanner/Kayak/Google Flights, nabije vliegvelden
- ⚙️ /instellingen → Instellingen: profiel, datum, dark mode

## WAT JIJ KUNT DOEN:
1. Antwoord geven op vragen over de bestemming, cultuur, eten, tips
2. De gebruiker doorverwijzen naar de juiste pagina
3. Uitleggen hoe een functie werkt
4. Praktische reisadvies geven (wat meenemen, fooi, cultuur, halal opties etc.)
5. Geruststellende antwoorden geven als iemand gestrest is

## NAVIGATIE-ANTWOORDEN:
Als iemand iets wil doen, stuur ze naar de juiste pagina. Gebruik dit formaat in je antwoord:
[NAVIGEER:/pagina]

Voorbeelden:
- "hoe voeg ik een foto toe?" → leg uit + [NAVIGEER:/dagboek]
- "ik wil het weer zien" → [NAVIGEER:/weer]
- "vlucht zoeken" → [NAVIGEER:/vluchten]
- "uitgave toevoegen" → [NAVIGEER:/budget]
- "wat staat er vandaag op schema?" → [NAVIGEER:/reis]
- "wat kan ik eten in de buurt?" → [NAVIGEER:/ontdek]

## STIJL:
- Warm, persoonlijk, Nederlands
- Beknopt tenzij gevraagd om meer
- Gebruik emojis spaarzaam maar vriendelijk
- Als iemand gestrest is: gerust stellen eerst, dan praktisch
`

const PAGINA_SUGGESTIES = {
  '/':          ['Wat staat er vandaag op het schema?', 'Geruststellen — staat alles klaar?', 'Welke functies heeft de app?'],
  '/reis':      ['Plan een perfecte dag', 'Hoe voeg ik een vlucht toe?', 'Hoe scan ik een boarding pass?'],
  '/ontdek':   ['Halal restaurants in de buurt', 'Romantisch plekje voor vanavond', 'Wat moet ik weten over de lokale cultuur?'],
  '/dagboek':  ['Hoe upload ik een foto?', 'Stel een bijschrift voor mijn foto voor', 'Kan Lilia ook foto\'s zien?'],
  '/lijsten':  ['Genereer een paklijst voor onze reis', 'Wat moet ik zeker niet vergeten?', 'Douane-tips voor onze bestemming'],
  '/budget':   ['Wat is de fooi gewoonte hier?', 'Hoeveel cash moet ik meenemen?', 'Hoe scan ik een bonnetje?'],
  '/weer':     ['Is het goed zwemweer?', 'Wat moet ik aantrekken?', 'Hoe wordt het de rest van de week?'],
  '/vluchten': ['Wanneer is de beste tijd om te boeken?', 'Welke vliegvelden zijn dichtbij?', 'Tips voor een goedkope vlucht'],
  '/instellingen': ['Hoe wissel ik van profiel?', 'Hoe zet ik dark mode aan?'],
}

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center px-3 py-2.5">
      {[0, 1, 2].map(i => <div key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}
    </div>
  )
}

// Detecteer [NAVIGEER:/pad] in antwoord-tekst
function parseNavigatie(tekst) {
  const matches = [...tekst.matchAll(/\[NAVIGEER:([^\]]+)\]/g)]
  const schoon = tekst.replace(/\[NAVIGEER:[^\]]+\]/g, '').trim()
  return { schoon, links: matches.map(m => m[1]) }
}

function BubbleAI({ content, router }) {
  const { schoon, links } = parseNavigatie(content)
  const paginaNamen = {
    '/': '🏠 Thuis', '/reis': '🗺️ Reisschema', '/ontdek': '🧭 Ontdek',
    '/dagboek': '📸 Dagboek', '/lijsten': '✅ Lijsten', '/budget': '💰 Budget',
    '/weer': '⛅ Weer', '/vluchten': '✈️ Vluchten zoeken', '/instellingen': '⚙️ Instellingen',
  }

  return (
    <div className="bubble-ai flex flex-col gap-2">
      <p className="whitespace-pre-wrap leading-relaxed">{schoon}</p>
      {links.map(pad => (
        <button key={pad} onClick={() => router.push(pad)}
                className="text-left text-xs font-semibold px-3 py-2 rounded-xl transition-all active:scale-95"
                style={{ background: 'rgba(201,162,75,0.15)', color: 'var(--gold)', border: '1px solid rgba(201,162,75,0.3)' }}>
          → {paginaNamen[pad] || pad}
        </button>
      ))}
    </div>
  )
}

export default function FloatingAI({ currentUser, pagina, locatieNaam, vandaagSchema }) {
  const [open, setOpen] = useState(false)
  const [berichten, setBerichten] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    try { setBerichten(JSON.parse(localStorage.getItem(CHAT_KEY)) || []) } catch { setBerichten([]) }
  }, [])

  useEffect(() => {
    if (berichten.length) localStorage.setItem(CHAT_KEY, JSON.stringify(berichten.slice(-60)))
  }, [berichten])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [berichten, loading, open])

  const stuurBericht = useCallback(async (tekst) => {
    const msg = tekst || input.trim()
    if (!msg || loading) return
    setInput('')
    const userMsg = { role: 'user', content: msg, name: currentUser }
    setBerichten(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...berichten, userMsg].map(m => ({ role: m.role, content: m.content })),
          context: {
            page: pagina || pathname,
            location: locatieNaam,
            appKnowledge: true,
          },
          systemExtra: APP_KENNIS,
        }),
      })
      const data = await res.json()
      setBerichten(prev => [...prev, { role: 'assistant', content: data.message || 'Sorry, even geen verbinding.' }])
    } catch {
      setBerichten(prev => [...prev, { role: 'assistant', content: 'Even geen verbinding. Probeer opnieuw! 💕' }])
    } finally {
      setLoading(false)
    }
  }, [berichten, input, loading, currentUser, pagina, pathname, locatieNaam])

  const suggesties = PAGINA_SUGGESTIES[pathname] || PAGINA_SUGGESTIES['/']

  return (
    <>
      {/* Zwevende knop */}
      {!open && (
        <button className="ai-fab" onClick={() => setOpen(true)} aria-label="AI assistent">
          <span style={{ fontSize: '1.3rem', color: 'white' }}>✦</span>
        </button>
      )}

      {/* Chat-paneel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-end justify-center md:justify-end pointer-events-none">
          <div className="pointer-events-auto flex flex-col"
               style={{
                 width: '100%', maxWidth: 440,
                 height: 'min(85dvh, 620px)',
                 background: 'var(--cream)',
                 borderRadius: '24px 24px 0 0',
                 boxShadow: '0 -8px 40px rgba(46,38,32,0.2)',
               }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b flex-shrink-0"
                 style={{ borderColor: 'var(--gold-line)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg,#E3A6B5,#C9A24B)' }}>
                  <span className="text-white text-sm">✦</span>
                </div>
                <div>
                  <p className="font-semibold text-sm serif">Reisassistent</p>
                  <p className="text-xs" style={{ color: 'var(--gold)' }}>Kent de app · spreekt NL</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { if (confirm('Chat wissen?')) { setBerichten([]); localStorage.removeItem(CHAT_KEY) } }}
                        className="text-xs px-2.5 py-1 rounded-lg"
                        style={{ color: 'var(--brown-soft)', background: 'rgba(201,162,75,0.08)' }}>
                  Wis
                </button>
                <button onClick={() => setOpen(false)} className="text-xl leading-none" style={{ color: 'var(--brown-soft)' }}>✕</button>
              </div>
            </div>

            {/* Berichten */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {berichten.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-3xl mb-3">✦</p>
                  <p className="serif-italic text-sm mb-4" style={{ color: 'var(--brown-soft)' }}>
                    Hallo! Ik ken de app door en door.<br />
                    Vraag me alles — ik kan ook navigeren! 💕
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggesties.map(s => (
                      <button key={s} onClick={() => stuurBericht(s)}
                              className="text-xs px-3 py-1.5 rounded-full chip">
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--gold-line)' }}>
                    <button onClick={() => stuurBericht('Wat kan ik allemaal met deze app?')}
                            className="text-xs btn-ghost px-4 py-2">
                      🗺️ Wat kan ik allemaal met de app?
                    </button>
                  </div>
                </div>
              )}

              {berichten.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center self-end mb-1"
                         style={{ background: 'linear-gradient(135deg,#E3A6B5,#C9A24B)' }}>
                      <span className="text-white" style={{ fontSize: '0.6rem' }}>✦</span>
                    </div>
                  )}
                  {m.role === 'user' ? (
                    <div className="bubble-user">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                    </div>
                  ) : (
                    <BubbleAI content={m.content} router={router} />
                  )}
                  {m.role === 'user' && (
                    <span className="text-sm self-end mb-1 flex-shrink-0">
                      {(m.name || currentUser) === 'lilia' ? '👰' : '🤵'}
                    </span>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-2 items-end">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center"
                       style={{ background: 'linear-gradient(135deg,#E3A6B5,#C9A24B)' }}>
                    <span className="text-white" style={{ fontSize: '0.6rem' }}>✦</span>
                  </div>
                  <div className="bubble-ai"><TypingIndicator /></div>
                </div>
              )}

              {/* Suggesties na eerste antwoord */}
              {berichten.length >= 2 && berichten.length <= 4 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {suggesties.slice(0, 2).map(s => (
                    <button key={s} onClick={() => stuurBericht(s)} className="chip text-xs">
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 pb-4 pt-2 border-t flex-shrink-0 flex gap-2"
                 style={{ borderColor: 'var(--gold-line)', paddingBottom: 'calc(14px + env(safe-area-inset-bottom, 0px))' }}>
              <textarea value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); stuurBericht() } }}
                        placeholder="Stel een vraag of zeg 'navigeer naar weer'..."
                        rows={1} className="input flex-1 resize-none text-sm"
                        style={{ minHeight: 42, maxHeight: 100, paddingTop: 11, paddingBottom: 11 }} />
              <button onClick={() => stuurBericht()} disabled={loading || !input.trim()}
                      className="btn-gold px-4 py-2 disabled:opacity-40 text-sm">➤</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
