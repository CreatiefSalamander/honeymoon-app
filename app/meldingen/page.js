'use client'
import { useState, useEffect } from 'react'
import BottomNav, { Sidebar } from '@/components/BottomNav'
import { useLanguage } from '@/lib/i18n'
import { getActivityLog, subscribeToActivity } from '@/lib/activityLog'

const TYPE_INFO = {
  foto:     { icon: '📸', kleur: '#E3A6B5', bg: 'rgba(227,166,181,0.1)' },
  uitgave:  { icon: '💸', kleur: '#C9A24B', bg: 'rgba(201,162,75,0.1)'  },
  reis:     { icon: '🗺️', kleur: '#4CAF50', bg: 'rgba(76,175,80,0.1)'   },
  vlucht:   { icon: '✈️', kleur: '#2196F3', bg: 'rgba(33,150,243,0.1)'  },
  notitie:  { icon: '📝', kleur: '#9C27B0', bg: 'rgba(156,39,176,0.1)'  },
  plek:     { icon: '❤️', kleur: '#F44336', bg: 'rgba(244,67,54,0.1)'   },
  lijst:    { icon: '✅', kleur: '#4CAF50', bg: 'rgba(76,175,80,0.1)'   },
  budget:   { icon: '💰', kleur: '#FF9800', bg: 'rgba(255,152,0,0.1)'   },
}

function tijdGeleden(datum) {
  const diff = Date.now() - new Date(datum).getTime()
  const min = Math.floor(diff / 60000)
  const uur = Math.floor(diff / 3600000)
  const dag = Math.floor(diff / 86400000)
  if (min < 1) return 'Zojuist'
  if (min < 60) return `${min}m geleden`
  if (uur < 24) return `${uur}u geleden`
  return `${dag}d geleden`
}

function ActiviteitKaart({ item }) {
  const info = TYPE_INFO[item.type] || { icon: '📌', kleur: 'var(--gold)', bg: 'rgba(201,162,75,0.1)' }
  return (
    <div className="flex items-start gap-3 p-4 border-b" style={{ borderColor: 'var(--gold-line)' }}>
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
           style={{ background: info.bg }}>
        {info.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug" style={{ color: 'var(--brown)' }}>{item.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg">{item.created_by === 'lilia' ? '👰' : '🤵'}</span>
          <span className="text-[11px]" style={{ color: 'var(--brown-soft)' }}>
            {item.created_by === 'lilia' ? 'Lilia' : 'Abdul'} · {tijdGeleden(item.created_at)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function MeldingenPage() {
  const [user] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('honeymoon_user') || 'abdul' : 'abdul')
  const { t } = useLanguage()
  const [activiteiten, setActiviteiten] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('alles')
  const [nieuw, setNieuw] = useState(0)

  useEffect(() => {
    getActivityLog(80).then(data => {
      setActiviteiten(data)
      setLoading(false)
    })
    const sub = subscribeToActivity(payload => {
      setActiviteiten(prev => [payload.new, ...prev])
      setNieuw(n => n + 1)
    })
    return () => sub.unsubscribe()
  }, [])

  const filters = [
    { key: 'alles',   label: 'Alles',    icon: '🔔' },
    { key: 'foto',    label: "Foto's",   icon: '📸' },
    { key: 'uitgave', label: 'Budget',   icon: '💸' },
    { key: 'reis',    label: 'Reis',     icon: '🗺️' },
    { key: 'plek',    label: 'Plekken',  icon: '❤️' },
  ]

  const gefilterd = activeFilter === 'alles' ? activiteiten : activiteiten.filter(a => a.type === activeFilter)

  // Groepeer per dag
  const perDag = {}
  for (const item of gefilterd) {
    const dag = new Date(item.created_at).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })
    if (!perDag[dag]) perDag[dag] = []
    perDag[dag].push(item)
  }

  // Statistieken
  const vandaag = new Date().toDateString()
  const vandaagCount = activiteiten.filter(a => new Date(a.created_at).toDateString() === vandaag).length
  const abdulCount = activiteiten.filter(a => a.created_by === 'abdul').length
  const liliaCount = activiteiten.filter(a => a.created_by === 'lilia').length

  return (
    <div className="app-shell">
      <Sidebar currentUser={user} />
      <div className="main-area">
        <div className="page-content px-4 max-w-xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="serif text-2xl font-bold">
                🔔 {t('meldingen')}
                {nieuw > 0 && (
                  <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--rose)', color: 'white' }}>
                    {nieuw} nieuw
                  </span>
                )}
              </h1>
              <p className="serif-italic text-xs mt-0.5" style={{ color: 'var(--brown-soft)' }}>
                {t('recentWijzigingen')}
              </p>
            </div>
          </div>

          {/* Stats */}
          {!loading && activiteiten.length > 0 && (
            <div className="glass-sm p-4 mb-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="serif font-bold text-xl gold-text">{vandaagCount}</p>
                  <p className="text-[10px]" style={{ color: 'var(--brown-soft)' }}>Vandaag</p>
                </div>
                <div>
                  <p className="serif font-bold text-xl" style={{ color: 'var(--rose)' }}>{abdulCount}</p>
                  <p className="text-[10px]" style={{ color: 'var(--brown-soft)' }}>🤵 Abdul</p>
                </div>
                <div>
                  <p className="serif font-bold text-xl" style={{ color: 'var(--rose)' }}>{liliaCount}</p>
                  <p className="text-[10px]" style={{ color: 'var(--brown-soft)' }}>👰 Lilia</p>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {filters.map(f => (
              <button key={f.key} onClick={() => setActiveFilter(f.key)}
                      className={`chip flex-shrink-0 ${activeFilter === f.key ? 'active' : ''}`}>
                {f.icon} {f.label}
              </button>
            ))}
          </div>

          {/* Feed */}
          {loading ? (
            <div className="flex flex-col gap-2">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-20" />)}</div>
          ) : gefilterd.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🔔</p>
              <h3 className="serif text-xl mb-2">{t('geenMeldingen')}</h3>
              <p className="serif-italic text-sm" style={{ color: 'var(--brown-soft)' }}>
                Activiteiten verschijnen hier zodra jij of Lilia iets toevoegt
              </p>
            </div>
          ) : (
            Object.entries(perDag).map(([dag, items]) => (
              <div key={dag} className="mb-4">
                <p className="text-xs font-semibold mb-2 px-1" style={{ color: 'var(--gold)' }}>{dag}</p>
                <div className="glass overflow-hidden">
                  {items.map(item => <ActiviteitKaart key={item.id} item={item} />)}
                </div>
              </div>
            ))
          )}
        </div>
        <BottomNav />
      </div>
    </div>
  )
}
