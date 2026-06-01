'use client'
import { useState, useEffect, useRef } from 'react'
import BottomNav, { Sidebar } from '@/components/BottomNav'
import FloatingAI from '@/components/FloatingAI'
import { getItinerary, addItineraryItem, updateItineraryItem, deleteItineraryItem, subscribeToItinerary, getFlights, addFlight, deleteFlight } from '@/lib/supabase'

const TIME_SLOTS = ['Ochtend','Middag','Avond','Nacht']
const ITEM_TYPES = [
  { key:'activiteit', icon:'🎭', label:'Activiteit' },
  { key:'restaurant', icon:'🍽️', label:'Restaurant' },
  { key:'hotel',      icon:'🏨', label:'Hotel' },
  { key:'transport',  icon:'🚕', label:'Transport' },
  { key:'overig',     icon:'📌', label:'Overig' },
]

function FlightCard({ flight, onDelete }) {
  const [status, setStatus] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(false)

  async function fetchStatus() {
    setLoadingStatus(true)
    try {
      const date = flight.depart_at?.split('T')[0]
      const res = await fetch(`/api/flight/status?flight=${flight.flight_no}&date=${date}`)
      const data = await res.json()
      if (!data.error) setStatus(data)
    } finally { setLoadingStatus(false) }
  }

  const statusColor = {
    scheduled:'#4CAF50', active:'#2196F3', landed:'var(--brown-soft)',
    cancelled:'#F44336', diverted:'var(--rose)', incident:'#FF9800',
  }

  return (
    <div className="glass-sm p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">✈️</span>
          <div>
            <p className="font-bold text-sm">{flight.flight_no}</p>
            <p className="text-xs" style={{ color:'var(--brown-soft)' }}>{flight.airline}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {status && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                  style={{ background:`${statusColor[status.status]||'var(--gold)'}20`, color:statusColor[status.status]||'var(--gold)' }}>
              {status.status}
            </span>
          )}
          <button onClick={fetchStatus} disabled={loadingStatus} className="text-xs btn-ghost px-2.5 py-1">
            {loadingStatus ? '...' : '🔄 Status'}
          </button>
          <button onClick={() => onDelete(flight.id)} className="opacity-40 hover:opacity-80 text-sm">🗑️</button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="serif font-bold text-lg">{flight.from_code}</p>
          <p className="text-xs" style={{ color:'var(--brown-soft)' }}>
            {flight.depart_at ? new Date(flight.depart_at).toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'}) : '—'}
          </p>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full h-px" style={{ background:'var(--gold-line)' }} />
          <p className="text-xs mt-1" style={{ color:'var(--brown-soft)' }}>✈</p>
        </div>
        <div className="text-center">
          <p className="serif font-bold text-lg">{flight.to_code}</p>
          <p className="text-xs" style={{ color:'var(--brown-soft)' }}>
            {flight.arrive_at ? new Date(flight.arrive_at).toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'}) : '—'}
          </p>
        </div>
      </div>

      {status?.departure?.gate && (
        <p className="text-xs mt-2 text-center" style={{ color:'var(--gold)' }}>
          Gate: {status.departure.gate} {status.departure.terminal ? `· Terminal ${status.departure.terminal}` : ''}
          {status.departure.delay ? ` · ⚠️ ${status.departure.delay} min vertraging` : ''}
        </p>
      )}

      {flight.seat && (
        <p className="text-xs mt-1 text-center" style={{ color:'var(--brown-soft)' }}>
          Stoel {flight.seat} · Bevestiging: {flight.confirmation}
        </p>
      )}
    </div>
  )
}

function ItineraryItem({ item, onDelete, onEdit }) {
  const [open, setOpen] = useState(false)
  const typeInfo = ITEM_TYPES.find(t => t.key === item.type) || ITEM_TYPES[4]

  function openMaps() {
    if (!item.location) return
    const q = encodeURIComponent(item.location)
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank')
  }

  return (
    <div className="mb-2">
      <button className="glass-sm p-3 w-full text-left" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background:'rgba(201,162,75,0.12)', color:'var(--gold)' }}>
              {item.time_slot || '—'}
            </span>
            <span className="text-lg">{typeInfo.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{item.activity || item.title}</p>
            {item.location && <p className="text-xs truncate" style={{ color:'var(--brown-soft)' }}>📍 {item.location}</p>}
          </div>
          <span className="text-lg" style={{ color:'var(--brown-soft)' }}>{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="glass-sm p-3 mt-1 border-t" style={{ borderColor:'var(--gold-line)', borderRadius:'0 0 16px 16px' }}>
          {item.hotel && <p className="text-sm mb-1">🏨 {item.hotel}</p>}
          {item.notes && <p className="text-sm mb-2" style={{ color:'var(--brown-soft)' }}>{item.notes}</p>}
          {item.phone && <a href={`tel:${item.phone}`} className="text-sm text-blue-500 block mb-1">📞 {item.phone}</a>}
          <div className="flex gap-2 mt-2 flex-wrap">
            {item.location && <button onClick={openMaps} className="btn-ghost text-xs px-3 py-1.5">🧭 Route</button>}
            <button onClick={() => onEdit(item)} className="btn-ghost text-xs px-3 py-1.5">✏️ Bewerk</button>
            <button onClick={() => onDelete(item.id)} className="text-xs px-3 py-1.5 rounded-xl" style={{ background:'rgba(227,166,181,0.1)', color:'var(--rose)' }}>🗑️ Verwijder</button>
          </div>
          <p className="text-xs mt-2" style={{ color:'var(--brown-soft)' }}>
            Door: {item.created_by === 'lilia' ? '👰 Lilia' : '🤵 Abdul'}
          </p>
        </div>
      )}
    </div>
  )
}

export default function ReisPage() {
  const [user] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('honeymoon_user') || 'abdul' : 'abdul')
  const [items, setItems] = useState([])
  const [flights, setFlights] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('schema')
  const [showForm, setShowForm] = useState(false)
  const [showFlightForm, setShowFlightForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ date:'', activity:'', location:'', hotel:'', notes:'', phone:'', time_slot:'Ochtend', type:'activiteit' })
  const [flightForm, setFlightForm] = useState({ flight_no:'', airline:'', from_code:'', to_code:'', depart_at:'', arrive_at:'', seat:'', confirmation:'' })
  const [parsing, setParsing] = useState(false)
  const ticketRef = useRef(null)

  useEffect(() => {
    load()
    const sub = subscribeToItinerary(load)
    return () => sub.unsubscribe()
  }, [])

  async function load() {
    const [it, fl] = await Promise.all([getItinerary(), getFlights()])
    setItems(it)
    setFlights(fl)
    setLoading(false)
  }

  function openAdd() { setEditing(null); setForm({ date:'', activity:'', location:'', hotel:'', notes:'', phone:'', time_slot:'Ochtend', type:'activiteit' }); setShowForm(true) }
  function openEdit(item) { setEditing(item); setForm({ date:item.date, activity:item.activity||'', location:item.location||'', hotel:item.hotel||'', notes:item.notes||'', phone:item.phone||'', time_slot:item.time_slot||'Ochtend', type:item.type||'activiteit' }); setShowForm(true) }

  async function saveItem() {
    if (!form.activity || !form.date) return
    if (editing) {
      const u = await updateItineraryItem(editing.id, form)
      if (u) setItems(prev => prev.map(i => i.id===editing.id?u:i))
    } else {
      const n = await addItineraryItem({ ...form, created_by:user })
      if (n) setItems(prev => [...prev, n].sort((a,b) => a.date.localeCompare(b.date)))
    }
    setShowForm(false)
  }

  async function handleDelete(id) {
    if (confirm('Item verwijderen?')) {
      await deleteItineraryItem(id)
      setItems(prev => prev.filter(i => i.id !== id))
    }
  }

  async function handleDeleteFlight(id) {
    await deleteFlight(id)
    setFlights(prev => prev.filter(f => f.id !== id))
  }

  async function saveFlight() {
    if (!flightForm.flight_no) return
    const f = await addFlight({ ...flightForm, created_by:user })
    if (f) setFlights(prev => [...prev, f])
    setFlightForm({ flight_no:'', airline:'', from_code:'', to_code:'', depart_at:'', arrive_at:'', seat:'', confirmation:'' })
    setShowFlightForm(false)
  }

  async function parseTicket(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setParsing(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/flight/parse', { method:'POST', body:fd })
      const data = await res.json()
      if (!data.error) {
        setFlightForm(prev => ({
          ...prev,
          flight_no: data.flightNo || prev.flight_no,
          airline: data.airline || prev.airline,
          from_code: data.fromCode || prev.from_code,
          to_code: data.toCode || prev.to_code,
          depart_at: data.departDate && data.departTime ? `${data.departDate}T${data.departTime}` : prev.depart_at,
          arrive_at: data.arriveDate && data.arriveTime ? `${data.arriveDate}T${data.arriveTime}` : prev.arrive_at,
          seat: data.seat || prev.seat,
          confirmation: data.confirmation || prev.confirmation,
        }))
        setShowFlightForm(true)
      }
    } finally { setParsing(false); e.target.value = '' }
  }

  const grouped = items.reduce((acc, item) => {
    const key = item.date
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const TABS = [{ key:'schema', label:'🗓️ Schema' }, { key:'vluchten', label:'✈️ Vluchten' }]

  return (
    <div className="app-shell">
      <Sidebar currentUser={user} />
      <div className="main-area">
        <div className="page-content px-4 max-w-xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="serif text-2xl font-bold">🗺️ Reisschema</h1>
              <p className="serif-italic text-xs mt-0.5" style={{ color:'var(--brown-soft)' }}>Jullie huwelijksreis</p>
            </div>
            <button onClick={activeTab==='schema' ? openAdd : () => setShowFlightForm(true)} className="btn-gold px-4 py-2 text-sm">
              {activeTab==='schema' ? '+ Dag' : '+ Vlucht'}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                      className={`chip flex-1 justify-center ${activeTab===t.key?'active':''}`}>{t.label}</button>
            ))}
          </div>

          {/* Schema tab */}
          {activeTab === 'schema' && (
            loading ? (
              <div className="flex flex-col gap-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20" />)}</div>
            ) : Object.entries(grouped).length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-4">🗺️</p>
                <h3 className="serif text-lg mb-2">Schema is leeg</h3>
                <p className="serif-italic text-sm" style={{ color:'var(--brown-soft)' }}>Voeg jullie eerste dag toe!</p>
              </div>
            ) : (
              Object.entries(grouped).sort(([a],[b])=>a.localeCompare(b)).map(([date, dayItems]) => (
                <div key={date} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold px-3 py-1 rounded-full"
                          style={{ background:'linear-gradient(135deg,rgba(227,166,181,0.18),rgba(201,162,75,0.18))', color:'var(--brown)' }}>
                      {new Date(date).toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long'})}
                    </span>
                  </div>
                  {dayItems.map(item => (
                    <ItineraryItem key={item.id} item={item} onDelete={handleDelete} onEdit={openEdit} />
                  ))}
                </div>
              ))
            )
          )}

          {/* Vluchten tab */}
          {activeTab === 'vluchten' && (
            <>
              {/* Ticket scanner */}
              <div className="glass-sm p-4 mb-4">
                <p className="font-semibold text-sm mb-2">📷 Boarding pass scannen</p>
                <p className="text-xs mb-3" style={{ color:'var(--brown-soft)' }}>Upload een foto of PDF van je boarding pass — Claude vult alles automatisch in.</p>
                <input ref={ticketRef} type="file" accept="image/*,application/pdf" onChange={parseTicket} className="hidden" />
                <button onClick={() => ticketRef.current?.click()} disabled={parsing} className="btn-ghost w-full text-sm">
                  {parsing ? '⏳ Analyseren...' : '📋 Ticket uploaden'}
                </button>
              </div>

              {flights.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">✈️</p>
                  <p className="serif-italic" style={{ color:'var(--brown-soft)' }}>Nog geen vluchten</p>
                </div>
              ) : (
                flights.map(f => <FlightCard key={f.id} flight={f} onDelete={handleDeleteFlight} />)
              )}
            </>
          )}
        </div>

        {/* Item formulier */}
        {showForm && (
          <div className="overlay" onClick={() => setShowForm(false)}>
            <div className="sheet" onClick={e => e.stopPropagation()}>
              <h2 className="serif text-xl mb-4">{editing ? 'Item bewerken' : 'Dag/activiteit toevoegen'}</h2>
              <div className="flex flex-col gap-3">
                <input type="date" value={form.date} onChange={e => setForm(p=>({...p,date:e.target.value}))} className="input" />
                <input type="text" placeholder="Activiteit / naam *" value={form.activity} onChange={e => setForm(p=>({...p,activity:e.target.value}))} className="input" />
                <div className="flex flex-wrap gap-2">
                  {ITEM_TYPES.map(t => <button key={t.key} onClick={() => setForm(p=>({...p,type:t.key}))} className={`chip ${form.type===t.key?'active':''}`}>{t.icon} {t.label}</button>)}
                </div>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map(s => <button key={s} onClick={() => setForm(p=>({...p,time_slot:s}))} className={`chip ${form.time_slot===s?'active':''}`}>{s}</button>)}
                </div>
                <input type="text" placeholder="Locatie" value={form.location} onChange={e => setForm(p=>({...p,location:e.target.value}))} className="input" />
                <input type="text" placeholder="Hotel" value={form.hotel} onChange={e => setForm(p=>({...p,hotel:e.target.value}))} className="input" />
                <input type="tel" placeholder="Telefoonnummer" value={form.phone} onChange={e => setForm(p=>({...p,phone:e.target.value}))} className="input" />
                <textarea placeholder="Notities" value={form.notes} onChange={e => setForm(p=>({...p,notes:e.target.value}))} rows={3} className="input resize-none" />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowForm(false)} className="flex-1 btn-ghost">Annuleer</button>
                <button onClick={saveItem} disabled={!form.activity||!form.date} className="flex-1 btn-gold disabled:opacity-40">Opslaan</button>
              </div>
            </div>
          </div>
        )}

        {/* Vlucht formulier */}
        {showFlightForm && (
          <div className="overlay" onClick={() => setShowFlightForm(false)}>
            <div className="sheet" onClick={e => e.stopPropagation()}>
              <h2 className="serif text-xl mb-4">Vlucht toevoegen</h2>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Vluchtnr. bijv. TK123" value={flightForm.flight_no} onChange={e => setFlightForm(p=>({...p,flight_no:e.target.value}))} className="input" />
                <input type="text" placeholder="Luchtvaartmaatschappij" value={flightForm.airline} onChange={e => setFlightForm(p=>({...p,airline:e.target.value}))} className="input" />
                <input type="text" placeholder="Van (AMS)" value={flightForm.from_code} onChange={e => setFlightForm(p=>({...p,from_code:e.target.value}))} className="input" />
                <input type="text" placeholder="Naar (IST)" value={flightForm.to_code} onChange={e => setFlightForm(p=>({...p,to_code:e.target.value}))} className="input" />
                <div>
                  <label className="text-xs" style={{ color:'var(--brown-soft)' }}>Vertrek</label>
                  <input type="datetime-local" value={flightForm.depart_at} onChange={e => setFlightForm(p=>({...p,depart_at:e.target.value}))} className="input mt-1" />
                </div>
                <div>
                  <label className="text-xs" style={{ color:'var(--brown-soft)' }}>Aankomst</label>
                  <input type="datetime-local" value={flightForm.arrive_at} onChange={e => setFlightForm(p=>({...p,arrive_at:e.target.value}))} className="input mt-1" />
                </div>
                <input type="text" placeholder="Stoel (bijv. 23A)" value={flightForm.seat} onChange={e => setFlightForm(p=>({...p,seat:e.target.value}))} className="input" />
                <input type="text" placeholder="Bevestigingsnr." value={flightForm.confirmation} onChange={e => setFlightForm(p=>({...p,confirmation:e.target.value}))} className="input" />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowFlightForm(false)} className="flex-1 btn-ghost">Annuleer</button>
                <button onClick={saveFlight} disabled={!flightForm.flight_no} className="flex-1 btn-gold disabled:opacity-40">Opslaan</button>
              </div>
            </div>
          </div>
        )}

        <BottomNav />
        <FloatingAI currentUser={user} />
      </div>
    </div>
  )
}
