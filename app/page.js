'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'

// Bestemmingen met Unsplash fotos
const BGS = {
  lombok: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&q=80',
  gili: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
}

const ROUTE = [
  { naam: 'Lombok', emoji: '🏝️', start: '2026-06-12', eind: '2026-06-25', kleur: '#4ecdc4' },
  { naam: 'Gili Air', emoji: '🌊', start: '2026-06-25', eind: '2026-07-05', kleur: '#c9a84c' },
  { naam: 'Bali', emoji: '🌴', start: '2026-07-05', eind: '2026-07-24', kleur: '#e8813a' },
]

function getBestemming() {
  const now = new Date()
  for (const d of ROUTE) {
    if (now >= new Date(d.start) && now <= new Date(d.eind)) return d
  }
  return now < new Date(ROUTE[0].start) ? ROUTE[0] : ROUTE[ROUTE.length - 1]
}

function useCountdown(target) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 })
  useEffect(() => {
    const tick = () => {
      const diff = new Date(target) - new Date()
      if (diff <= 0) return
      setT({ d: Math.floor(diff/86400000), h: Math.floor((diff%86400000)/3600000), m: Math.floor((diff%3600000)/60000), s: Math.floor((diff%60000)/1000) })
    }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [target])
  return t
}

export default function HomePage() {
  const { t } = useLanguage()
  const heroRef = useRef(null)
  const { scrollY } = useScroll()
  const parallax = useTransform(scrollY, [0, 300], [0, -80])
  const cd = useCountdown('2026-06-12T00:00:00')
  const dest = getBestemming()
  const reisGestart = new Date() >= new Date('2026-06-12')
  const dagsSinds = reisGestart ? Math.max(0, Math.round((new Date() - new Date('2026-06-12'))/86400000)) : 0
  const [currentUser] = useState(typeof window !== 'undefined' ? localStorage.getItem('currentUser')||'abdul' : 'abdul')
  const [weer, setWeer] = useState(null)
  const [budget, setBudget] = useState({ totaal: 10000, uitgegeven: 0 })
  const [agenda, setAgenda] = useState([])

  useEffect(() => {
    fetch('/api/weather?location=' + dest.naam).then(r=>r.json()).then(setWeer).catch(()=>{})
    supabase.from('expenses').select('bedrag').then(({data}) => {
      if (data) setBudget(prev => ({...prev, uitgegeven: data.reduce((s,e) => s+(e.bedrag||0), 0)}))
    })
    const today = new Date().toISOString().split('T')[0]
    supabase.from('itinerary').select('*').eq('date', today).order('time').then(({data}) => setAgenda(data||[]))
  }, [dest.naam])

  const resterend = budget.totaal - budget.uitgegeven
  const budgetPct = Math.min((budget.uitgegeven/budget.totaal)*100, 100)

  return (
    <div className="page-content" style={{paddingTop:0}}>
      {/* HERO */}
      <div ref={heroRef} style={{position:'relative',height:420,overflow:'hidden'}}>
        <motion.div style={{y:parallax,position:'absolute',inset:'-40px 0 -40px 0'}}>
          <img src={BGS[dest.naam?.toLowerCase().replace(' ','')] || BGS.bali} alt={dest.naam}
            style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>e.target.style.display='none'} />
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(10,22,40,0.4) 0%,rgba(10,22,40,0.3) 40%,rgba(10,22,40,0.97) 100%)'}} />
        </motion.div>
        <div style={{height:'env(safe-area-inset-top,12px)'}} />
        <div style={{position:'relative',padding:'12px 20px 0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <p style={{color:'rgba(240,236,228,0.7)',fontSize:'0.78rem',margin:0}}>{reisGestart ? '🌏 '+dest.naam : '✈️ Vertrek over'}</p>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.6rem',fontWeight:600,color:'#f0ece4',margin:0}}>Abdul & Lilia</h1>
          </div>
          <div style={{display:'flex'}}>
            <Link href="/instellingen">
              <div style={{width:38,height:38,borderRadius:'50%',border:'2px solid #4ecdc4',background:'linear-gradient(135deg,#4ecdc4,#2980b9)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem'}}>👩</div>
            </Link>
            <Link href="/instellingen">
              <div style={{width:38,height:38,borderRadius:'50%',border:'2px solid #c9a84c',background:'linear-gradient(135deg,#c9a84c,#e8813a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',marginLeft:-10}}>👨</div>
            </Link>
          </div>
        </div>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
          style={{position:'absolute',bottom:20,left:20,right:20}}>
          <div className="glass" style={{padding:'14px 16px',borderRadius:16}}>
            {reisGestart ? (
              <div>
                <p style={{color:'#c9a84c',fontSize:'0.7rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',margin:'0 0 6px'}}>✨ Op huwelijksreis · {dagsSinds} dagen onderweg</p>
                <div style={{height:4,background:'rgba(255,255,255,0.08)',borderRadius:2,overflow:'hidden',marginBottom:10}}>
                  <div style={{height:'100%',width:Math.min((dagsSinds/43)*100,100)+'%',background:'linear-gradient(90deg,#c9a84c,#4ecdc4)',borderRadius:2}} />
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  {ROUTE.map((d,i) => (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:4}}>
                      <span style={{fontSize:'0.68rem',fontWeight:600,padding:'3px 8px',borderRadius:100,color:d.naam===dest.naam?'#0a1628':d.kleur,background:d.naam===dest.naam?d.kleur:'rgba(255,255,255,0.08)',border:'1px solid '+d.kleur+'40'}}>{d.emoji} {d.naam}</span>
                      {i<2&&<span style={{color:'rgba(240,236,228,0.3)',fontSize:'0.6rem'}}>→</span>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p style={{color:'#c9a84c',fontSize:'0.7rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',margin:'0 0 8px'}}>✨ Huwelijksreis begint over</p>
                <div style={{display:'flex',alignItems:'center',gap:20}}>
                  {[['d',cd.d],['u',cd.h],['m',cd.m],['s',cd.s]].map(([l,v]) => (
                    <div key={l} style={{textAlign:'center'}}>
                      <span style={{fontFamily:"'DM Mono',monospace",fontSize:'1.8rem',fontWeight:600,color:'#f0ece4',display:'block',lineHeight:1}}>{String(v).padStart(2,'0')}</span>
                      <span style={{fontSize:'0.58rem',color:'#8a9ab5',textTransform:'uppercase'}}>{l}</span>
                    </div>
                  ))}
                  <div style={{marginLeft:'auto',textAlign:'right'}}>
                    <p style={{color:'#f0ece4',fontSize:'0.75rem',margin:0}}>📍 Lombok</p>
                    <p style={{color:'#8a9ab5',fontSize:'0.62rem',margin:0,fontFamily:"'DM Mono',monospace"}}>12 jun 2026</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* WIDGETS */}
      <div style={{padding:'14px 14px 0'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
          <Link href="/weer" style={{textDecoration:'none'}}>
            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.2}} whileTap={{scale:0.96}} className="card" style={{padding:14,cursor:'pointer',height:'100%'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <div style={{width:32,height:32,borderRadius:8,background:'rgba(78,205,196,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem'}}>☀️</div>
                <div>
                  <p style={{color:'#8a9ab5',fontSize:'0.62rem',margin:0}}>{dest.naam}</p>
                  <p style={{color:'#f0ece4',fontWeight:600,fontSize:'0.9rem',margin:0,fontFamily:"'DM Mono',monospace"}}>{weer?.temp||'--'}°C</p>
                </div>
              </div>
              <p style={{color:'#8a9ab5',fontSize:'0.62rem',margin:0}}>{weer?.description||'Tik voor weer'}</p>
            </motion.div>
          </Link>
          <Link href="/budget" style={{textDecoration:'none'}}>
            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.25}} whileTap={{scale:0.96}} className="card" style={{padding:14,cursor:'pointer',height:'100%'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <div style={{width:32,height:32,borderRadius:8,background:'rgba(201,168,76,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem'}}>💰</div>
                <div>
                  <p style={{color:'#8a9ab5',fontSize:'0.62rem',margin:0}}>Budget over</p>
                  <p style={{color:'#c9a84c',fontWeight:600,fontSize:'0.9rem',margin:0,fontFamily:"'DM Mono',monospace"}}>€{Math.round(resterend).toLocaleString('nl')}</p>
                </div>
              </div>
              <div style={{height:4,background:'rgba(255,255,255,0.08)',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',width:budgetPct+'%',background:'linear-gradient(90deg,#c9a84c,'+(budgetPct>80?'#ef4444':'#e8c97a')+')',borderRadius:2}} />
              </div>
            </motion.div>
          </Link>
        </div>

        <Link href="/agenda" style={{textDecoration:'none'}}>
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.3}} whileTap={{scale:0.98}} className="card" style={{padding:'12px 14px',marginBottom:8,cursor:'pointer'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}><span>📅</span><span style={{color:'#f0ece4',fontWeight:600,fontSize:'0.85rem'}}>Vandaag</span></div>
              <span style={{color:'#8a9ab5',fontSize:'0.68rem',fontFamily:"'DM Mono',monospace"}}>{new Date().toLocaleDateString('nl',{day:'numeric',month:'short'})}</span>
            </div>
            {agenda.length > 0 ? agenda.slice(0,3).map((item,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <div style={{width:3,height:32,borderRadius:2,background:i===0?'#4ecdc4':i===1?'#c9a84c':'#e8c97a',flexShrink:0}} />
                <div><p style={{color:'#f0ece4',fontSize:'0.8rem',fontWeight:500,margin:0}}>{item.title||item.naam}</p><p style={{color:'#8a9ab5',fontSize:'0.65rem',fontFamily:"'DM Mono',monospace",margin:0}}>{item.time||item.date}</p></div>
              </div>
            )) : <p style={{color:'#8a9ab5',fontSize:'0.78rem',margin:0}}>Nog niets gepland vandaag ✨</p>}
          </motion.div>
        </Link>

        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.33}} className="card" style={{padding:'12px 14px',marginBottom:8,background:'linear-gradient(135deg,rgba(201,168,76,0.10),rgba(201,168,76,0.02))',border:'1px solid rgba(201,168,76,0.25)'}}>
          <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#c9a84c,#e8c97a)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>✨</div>
            <div style={{flex:1}}>
              <p style={{color:'#c9a84c',fontSize:'0.62rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',margin:'0 0 3px'}}>AI Suggestie</p>
              <p style={{color:'#f0ece4',fontSize:'0.8rem',lineHeight:1.5,margin:0,fontFamily:"'Cormorant Garamond',serif"}}>
                {reisGestart ? 'Snorkelen bij Gili Air is perfect voor Lilia — puur oceaan, geen chloor! 🐠' : 'Over '+cd.d+' dagen begint het avontuur! Check of alle documenten klaar zijn 💍'}
              </p>
            </div>
            <Link href="/meer" style={{color:'#c9a84c',textDecoration:'none',fontSize:'1.2rem',flexShrink:0}}>›</Link>
          </div>
        </motion.div>

        <p style={{color:'#8a9ab5',fontSize:'0.62rem',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',margin:'0 0 8px 4px'}}>Snel toevoegen</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
          {[
            {href:'/fotos',e:'📸',l:'Foto maken',s:'Vastleggen',c:'#4ecdc4'},
            {href:'/budget',e:'💸',l:'Uitgave',s:'Bijhouden',c:'#c9a84c'},
            {href:'/ontdek',e:'🧭',l:'Ontdek',s:'Activiteiten',c:'#e8813a'},
            {href:'/locatie',e:'🗺️',l:'Kaart',s:'Snap Map',c:'#9b59b6'},
          ].map((item,i) => (
            <Link key={i} href={item.href} style={{textDecoration:'none'}}>
              <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.35+i*0.05}} whileTap={{scale:0.95}} className="card" style={{padding:12,cursor:'pointer'}}>
                <div style={{width:32,height:32,borderRadius:8,background:item.c+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',marginBottom:6}}>{item.e}</div>
                <p style={{color:'#f0ece4',fontSize:'0.8rem',fontWeight:600,margin:0}}>{item.l}</p>
                <p style={{color:'#8a9ab5',fontSize:'0.65rem',margin:'2px 0 0'}}>{item.s}</p>
              </motion.div>
            </Link>
          ))}
        </div>

        <Link href="/vluchten" style={{textDecoration:'none'}}>
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.5}} whileTap={{scale:0.98}} className="card" style={{padding:'12px 14px',marginBottom:8,display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
            <div style={{width:38,height:38,borderRadius:10,background:'rgba(78,205,196,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem'}}>✈️</div>
            <div style={{flex:1}}><p style={{color:'#f0ece4',fontWeight:600,fontSize:'0.85rem',margin:0}}>Vluchten</p><p style={{color:'#8a9ab5',fontSize:'0.7rem',margin:'2px 0 0',fontFamily:"'DM Mono',monospace"}}>AMS → CGK · 12 jun 2026</p></div>
            <span style={{color:'#4ecdc4',fontSize:'0.68rem',fontWeight:600,background:'rgba(78,205,196,0.12)',padding:'3px 8px',borderRadius:100}}>Op schema</span>
          </motion.div>
        </Link>
        <div style={{height:20}} />
      </div>
    </div>
  )
              }—
