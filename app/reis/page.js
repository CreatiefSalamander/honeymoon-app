'use client'
import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import { getItinerary, addItineraryItem, updateItineraryItem, deleteItineraryItem, subscribeToItinerary } from '@/lib/supabase'

const TIME_SLOTS = ['Ochtend', 'Middag', 'Avond', 'Nacht']

function EmptyState() {
  return (
    <div className="text-center py-16">
      <p className="text-5xl mb-4">🗺️</p>
      <h3 className="heading-playfair text-xl mb-2">Begin met plannen</h3>
      <p className="heading-italic text-sm" style={{ color: '#9B8080' }}>
        Voeg jullie eerste dag toe met de + knop
      </p>
    </div>
  )
}

function ItineraryItemCard({ item, currentUser, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="glass-card-sm overflow-hidden mb-3 transition-all duration-200">
      <button className="w-full p-4 text-left" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full mb-1"
                  style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', fontFamily: 'DM Sans' }}>
              {item.time_slot || 'Dag'}
            </span>
            <div className="w-px h-full bg-gold-border" style={{ background: 'rgba(212,175,55,0.2)', minHeight: 20 }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-sm truncate"
                  style={{ color: '#3D2B1F', fontFamily: 'DM Sans' }}>
                {item.activity}
              </h3>
              <span className="text-lg flex-shrink-0">{expanded ? '▲' : '▼'}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {item.location && (
                <span className="text-xs flex items-center gap-1" style={{ color: '#9B8080' }}>
                  📍 {item.location}
                </span>
              )}
              <span className="text-xs" style={{ color: '#9B8080' }}>
                {new Date(item.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
          <div className="pt-3 flex flex-col gap-2">
            {item.hotel && (
              <div className="flex items-center gap-2 text-sm" style={{ color: '#3D2B1F' }}>
                <span>🏨</span> <span>{item.hotel}</span>
              </div>
            )}
            {item.notes && (
              <p className="text-sm" style={{ color: '#9B8080', lineHeight: 1.5 }}>
                {item.notes}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs" style={{ color: '#9B8080' }}>
              <span>Toegevoegd door: {item.created_by === 'lilia' ? '👰 Lilia' : '🤵 Abdul'}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => onEdit(item)}
                      className="flex-1 py-2 rounded-xl text-sm"
                      style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}>
                ✏️ Bewerken
              </button>
              <button onClick={() => onDelete(item.id)}
                      className="flex-1 py-2 rounded-xl text-sm"
                      style={{ background: 'rgba(232,164,184,0.1)', color: '#E8A4B8' }}>
                🗑️ Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ReisPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [currentUser, setCurrentUser] = useState('abdul')
  const [form, setForm] = useState({
    date: '', location: '', activity: '', hotel: '', notes: '', time_slot: 'Ochtend'
  })

  useEffect(() => {
    const u = localStorage.getItem('honeymoon_user') || 'abdul'
    setCurrentUser(u)
  }, [])

  useEffect(() => {
    async function load() {
      const data = await getItinerary()
      setItems(data)
      setLoading(false)
    }
    load()

    const sub = subscribeToItinerary(async () => {
      const data = await getItinerary()
      setItems(data)
    })
    return () => sub.unsubscribe()
  }, [])

  function openAdd() {
    setEditing(null)
    setForm({ date: '', location: '', activity: '', hotel: '', notes: '', time_slot: 'Ochtend' })
    setShowForm(true)
  }

  function openEdit(item) {
    setEditing(item)
    setForm({
      date: item.date,
      location: item.location || '',
      activity: item.activity,
      hotel: item.hotel || '',
      notes: item.notes || '',
      time_slot: item.time_slot || 'Ochtend',
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.activity || !form.date) return
    if (editing) {
      const updated = await updateItineraryItem(editing.id, form)
      setItems(prev => prev.map(i => i.id === editing.id ? updated : i))
    } else {
      const newItem = await addItineraryItem({ ...form, created_by: currentUser })
      if (newItem) setItems(prev => [...prev, newItem].sort((a, b) => new Date(a.date) - new Date(b.date)))
    }
    setShowForm(false)
  }

  async function handleDelete(id) {
    if (confirm('Dit item verwijderen?')) {
      await deleteItineraryItem(id)
      setItems(prev => prev.filter(i => i.id !== id))
    }
  }

  // Groepeer per dag
  const grouped = items.reduce((acc, item) => {
    const key = item.date
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  return (
    <div className="min-h-dvh">
      <div className="page-content px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="heading-playfair text-2xl">🗺️ Reisplanning</h1>
            <p className="heading-italic text-xs mt-0.5" style={{ color: '#9B8080' }}>
              Jullie huwelijksreis itinerary
            </p>
          </div>
          <button onClick={openAdd} className="btn-gold px-4 py-2 text-sm">+ Dag</button>
        </div>

        <div className="gold-line mb-4" />

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-24" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          Object.entries(grouped).map(([date, dayItems]) => (
            <div key={date} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ background: 'linear-gradient(135deg, rgba(232,164,184,0.2), rgba(212,175,55,0.2))', color: '#3D2B1F', fontFamily: 'DM Sans' }}>
                  {new Date(date).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
              {dayItems.map(item => (
                <ItineraryItemCard
                  key={item.id}
                  item={item}
                  currentUser={currentUser}
                  onDelete={handleDelete}
                  onEdit={openEdit}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Formulier modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h2 className="heading-playfair text-xl mb-4">
              {editing ? 'Item bewerken' : 'Dag toevoegen'}
            </h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#9B8080', fontFamily: 'DM Sans' }}>Datum *</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                       className="input-field" />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#9B8080', fontFamily: 'DM Sans' }}>Activiteit *</label>
                <input type="text" placeholder="b.v. Strand bezoeken" value={form.activity}
                       onChange={e => setForm(p => ({ ...p, activity: e.target.value }))}
                       className="input-field" />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#9B8080', fontFamily: 'DM Sans' }}>Tijdslot</label>
                <div className="flex gap-2 flex-wrap">
                  {TIME_SLOTS.map(slot => (
                    <button key={slot} onClick={() => setForm(p => ({ ...p, time_slot: slot }))}
                            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                            style={{
                              background: form.time_slot === slot ? 'rgba(212,175,55,0.3)' : 'rgba(212,175,55,0.1)',
                              color: form.time_slot === slot ? '#D4AF37' : '#9B8080',
                              border: `1px solid ${form.time_slot === slot ? 'rgba(212,175,55,0.5)' : 'transparent'}`,
                            }}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#9B8080', fontFamily: 'DM Sans' }}>Locatie</label>
                <input type="text" placeholder="b.v. Barcelona, Spanje" value={form.location}
                       onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                       className="input-field" />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#9B8080', fontFamily: 'DM Sans' }}>Hotel</label>
                <input type="text" placeholder="Hotelnaam" value={form.hotel}
                       onChange={e => setForm(p => ({ ...p, hotel: e.target.value }))}
                       className="input-field" />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#9B8080', fontFamily: 'DM Sans' }}>Notities</label>
                <textarea placeholder="Extra info, tips…" value={form.notes} rows={3}
                          onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                          className="input-field resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowForm(false)}
                      className="flex-1 py-3 rounded-2xl"
                      style={{ background: 'rgba(212,175,55,0.1)', color: '#9B8080' }}>
                Annuleer
              </button>
              <button onClick={handleSave}
                      disabled={!form.activity || !form.date}
                      className="flex-1 btn-gold py-3 disabled:opacity-50">
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
