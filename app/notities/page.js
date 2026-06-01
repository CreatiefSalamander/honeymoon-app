'use client'
import { useState, useEffect, useRef } from 'react'
import BottomNav from '@/components/BottomNav'
import { getNotes, addNote, updateNote, deleteNote, subscribeToNotes } from '@/lib/supabase'

const CATEGORIES = [
  { key: 'idee',      label: 'Ideeën',       icon: '💡', color: '#F0D060', bg: 'rgba(240,208,96,0.12)' },
  { key: 'todo',      label: 'To-do',         icon: '📋', color: '#E8A4B8', bg: 'rgba(232,164,184,0.12)' },
  { key: 'liefde',   label: 'Lieve berichtjes', icon: '💕', color: '#D4AF37', bg: 'rgba(212,175,55,0.12)' },
  { key: 'winkelen', label: 'Winkelen',       icon: '🛍️', color: '#C8A8B0', bg: 'rgba(200,168,176,0.12)' },
]

function getCat(key) {
  return CATEGORIES.find(c => c.key === key) || CATEGORIES[0]
}

function NoteCard({ note, currentUser, onPin, onDelete, onEdit }) {
  const [swiping, setSwiping] = useState(false)
  const [startX, setStartX] = useState(null)
  const [offsetX, setOffsetX] = useState(0)
  const cat = getCat(note.category)

  function handleTouchStart(e) {
    setStartX(e.touches[0].clientX)
  }

  function handleTouchMove(e) {
    if (startX === null) return
    const diff = e.touches[0].clientX - startX
    if (diff < 0) setOffsetX(Math.max(diff, -80))
  }

  function handleTouchEnd() {
    if (offsetX < -60) {
      setSwiping(true)
      setTimeout(() => {
        onDelete(note.id)
        setSwiping(false)
        setOffsetX(0)
      }, 300)
    } else {
      setOffsetX(0)
    }
    setStartX(null)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl mb-3"
         style={{ transform: `translateX(${offsetX}px)`, transition: offsetX === 0 ? 'transform 0.3s ease' : 'none' }}
         onTouchStart={handleTouchStart}
         onTouchMove={handleTouchMove}
         onTouchEnd={handleTouchEnd}>
      {/* Verwijder achtergrond */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center px-5 rounded-r-2xl"
           style={{ background: 'rgba(232,164,184,0.3)', opacity: Math.abs(offsetX) / 80 }}>
        <span className="text-xl">🗑️</span>
      </div>

      <div className="glass-card-sm p-4" style={{ borderLeft: `3px solid ${cat.color}`, background: cat.bg }}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span>{cat.icon}</span>
            <span className="text-xs font-medium" style={{ color: cat.color, fontFamily: 'DM Sans' }}>
              {cat.label}
            </span>
            {note.pinned && <span className="text-xs">📌</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => onPin(note.id, !note.pinned)} className="text-sm opacity-60 active:opacity-100">
              {note.pinned ? '📌' : '📍'}
            </button>
            <button onClick={() => onEdit(note)} className="text-sm opacity-60 active:opacity-100">✏️</button>
            <button onClick={() => onDelete(note.id)} className="text-sm opacity-60 active:opacity-100">🗑️</button>
          </div>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: '#3D2B1F', fontFamily: 'DM Sans' }}>
          {note.content}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px]" style={{ color: '#9B8080' }}>
            {note.created_by === 'lilia' ? '👰 Lilia' : '🤵 Abdul'} ·{' '}
            {new Date(note.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function NotitiesPage() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState('abdul')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [form, setForm] = useState({ content: '', category: 'idee' })
  const textareaRef = useRef(null)

  useEffect(() => {
    setCurrentUser(localStorage.getItem('honeymoon_user') || 'abdul')
  }, [])

  useEffect(() => {
    async function load() {
      const data = await getNotes()
      setNotes(data)
      setLoading(false)
    }
    load()

    const sub = subscribeToNotes(async () => {
      const data = await getNotes()
      setNotes(data)
    })
    return () => sub.unsubscribe()
  }, [])

  useEffect(() => {
    if (showForm) setTimeout(() => textareaRef.current?.focus(), 100)
  }, [showForm])

  function openAdd() {
    setEditing(null)
    setForm({ content: '', category: 'idee' })
    setShowForm(true)
  }

  function openEdit(note) {
    setEditing(note)
    setForm({ content: note.content, category: note.category })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.content.trim()) return
    if (editing) {
      const updated = await updateNote(editing.id, { content: form.content, category: form.category })
      if (updated) setNotes(prev => prev.map(n => n.id === editing.id ? updated : n))
    } else {
      const newNote = await addNote({ content: form.content, category: form.category, created_by: currentUser, pinned: false })
      if (newNote) setNotes(prev => [newNote, ...prev])
    }
    setShowForm(false)
  }

  async function handlePin(id, pinned) {
    const updated = await updateNote(id, { pinned })
    if (updated) {
      const newNotes = notes.map(n => n.id === id ? updated : n)
      newNotes.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
      setNotes(newNotes)
    }
  }

  async function handleDelete(id) {
    if ('vibrate' in navigator) navigator.vibrate(30)
    await deleteNote(id)
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  const filtered = activeFilter === 'all' ? notes : notes.filter(n => n.category === activeFilter)

  return (
    <div className="min-h-dvh">
      <div className="page-content px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="heading-playfair text-2xl">📝 Notities</h1>
            <p className="heading-italic text-xs mt-0.5" style={{ color: '#9B8080' }}>
              Gedeeld notitieblok
            </p>
          </div>
          <button onClick={openAdd} className="btn-gold px-4 py-2 text-sm">+ Notitie</button>
        </div>

        <div className="gold-line mb-4" />

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
          <button onClick={() => setActiveFilter('all')}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: activeFilter === 'all' ? 'rgba(212,175,55,0.25)' : 'rgba(212,175,55,0.08)',
                    color: activeFilter === 'all' ? '#D4AF37' : '#9B8080',
                    border: `1px solid ${activeFilter === 'all' ? 'rgba(212,175,55,0.4)' : 'transparent'}`,
                  }}>
            Alles ({notes.length})
          </button>
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setActiveFilter(cat.key)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1"
                    style={{
                      background: activeFilter === cat.key ? `${cat.bg}` : 'rgba(212,175,55,0.08)',
                      color: activeFilter === cat.key ? cat.color : '#9B8080',
                      border: `1px solid ${activeFilter === cat.key ? cat.color + '40' : 'transparent'}`,
                    }}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-28" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📝</p>
            <h3 className="heading-playfair text-xl mb-2">Geen notities</h3>
            <p className="heading-italic text-sm" style={{ color: '#9B8080' }}>
              Schrijf jullie eerste notitie!
            </p>
          </div>
        ) : (
          filtered.map(note => (
            <NoteCard key={note.id} note={note} currentUser={currentUser}
                      onPin={handlePin} onDelete={handleDelete} onEdit={openEdit} />
          ))
        )}
      </div>

      {/* Formulier */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h2 className="heading-playfair text-xl mb-4">
              {editing ? 'Notitie bewerken' : 'Notitie toevoegen'}
            </h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs mb-2 block" style={{ color: '#9B8080', fontFamily: 'DM Sans' }}>
                  Categorie
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.key} onClick={() => setForm(p => ({ ...p, category: cat.key }))}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                            style={{
                              background: form.category === cat.key ? cat.bg : 'rgba(212,175,55,0.08)',
                              color: form.category === cat.key ? cat.color : '#9B8080',
                              border: `1px solid ${form.category === cat.key ? cat.color + '40' : 'transparent'}`,
                            }}>
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea ref={textareaRef} rows={5} placeholder="Schrijf hier je notitie…"
                        value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                        className="input-field resize-none" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowForm(false)}
                      className="flex-1 py-3 rounded-2xl"
                      style={{ background: 'rgba(212,175,55,0.1)', color: '#9B8080' }}>
                Annuleer
              </button>
              <button onClick={handleSave} disabled={!form.content.trim()}
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
