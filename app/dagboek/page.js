'use client'
import { useState, useEffect, useRef } from 'react'
import BottomNav, { Sidebar } from '@/components/BottomNav'
import FloatingAI from '@/components/FloatingAI'
import { getMemories, uploadPhoto, addMemory, toggleLike, deleteMemory, subscribeToMemories } from '@/lib/supabase'

function compress(file, maxW = 1200) {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const ratio = Math.min(maxW / img.width, 1)
      const canvas = document.createElement('canvas')
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(blob => { URL.revokeObjectURL(url); resolve(new File([blob], file.name, { type:'image/jpeg' })) }, 'image/jpeg', 0.82)
    }
    img.src = url
  })
}

function Lightbox({ memories, idx, onClose, onPrev, onNext }) {
  const m = memories[idx]
  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, onPrev, onNext])

  if (!m) return null
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background:'rgba(20,16,13,0.97)' }} onClick={onClose}>
      <div className="flex items-center justify-between p-4" onClick={e => e.stopPropagation()}>
        <button onClick={onPrev} className="text-white/60 text-2xl px-2">◀</button>
        <div className="text-center">
          {m.caption && <p className="text-white font-medium text-sm">{m.caption}</p>}
          {m.location && <p className="text-white/50 text-xs">📍 {m.location}</p>}
        </div>
        <button onClick={onClose} className="text-white/60 text-2xl px-2">✕</button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
        <img src={m.url} alt={m.caption||''} className="max-w-full max-h-full object-contain rounded-2xl" />
      </div>
      <div className="p-4 text-center" onClick={e => e.stopPropagation()}>
        <p className="text-white/40 text-xs">
          {m.created_by === 'lilia' ? '👰 Lilia' : '🤵 Abdul'} ·{' '}
          {new Date(m.created_at).toLocaleDateString('nl-NL', { day:'numeric', month:'long', year:'numeric' })}
        </p>
        <button onClick={onNext} className="text-white/50 text-2xl mt-1">▶</button>
      </div>
    </div>
  )
}

export default function DagboekPage() {
  const [user] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('honeymoon_user') || 'abdul' : 'abdul')
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    load()
    const sub = subscribeToMemories(load)
    return () => sub.unsubscribe()
  }, [])

  async function load() {
    const data = await getMemories()
    setMemories(data)
    setLoading(false)
  }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compress(file)
    setPendingFile(compressed)
    setPreview(URL.createObjectURL(compressed))
    setShowForm(true)
    e.target.value = ''
  }

  async function handleUpload() {
    if (!pendingFile) return
    setUploading(true)
    try {
      const url = await uploadPhoto(pendingFile, user)
      if (url) {
        const memory = await addMemory({ url, caption: caption||null, location: location||null, liked_by:[], created_by:user })
        if (memory) setMemories(prev => [memory, ...prev])
      }
    } finally {
      setUploading(false)
      setShowForm(false)
      setPendingFile(null)
      setPreview(null)
      setCaption('')
      setLocation('')
    }
  }

  async function handleLike(id) {
    if ('vibrate' in navigator) navigator.vibrate(15)
    const updated = await toggleLike(id, user)
    if (updated) setMemories(prev => prev.map(m => m.id === id ? updated : m))
  }

  async function handleDelete(id) {
    if (confirm('Foto verwijderen?')) {
      await deleteMemory(id)
      setMemories(prev => prev.filter(m => m.id !== id))
    }
  }

  const liked = memories.filter(m => m.liked_by?.includes(user)).length

  return (
    <div className="app-shell">
      <Sidebar currentUser={user} />
      <div className="main-area">
        <div className="page-content px-4 max-w-xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="serif text-2xl font-bold">📸 Dagboek</h1>
              <p className="serif-italic text-xs mt-0.5" style={{ color:'var(--brown-soft)' }}>Jullie herinneringen</p>
            </div>
            <button onClick={() => fileRef.current?.click()} className="btn-rose px-4 py-2 text-sm">+ Foto</button>
          </div>

          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />

          {/* Stats */}
          {memories.length > 0 && (
            <div className="glass-sm p-3 mb-4 flex justify-around">
              {[
                { v:memories.length, l:"Foto's" },
                { v:liked, l:'Geliked' },
                { v:memories.filter(m=>m.created_by==='lilia').length, l:'Van Lilia' },
              ].map(({ v, l }) => (
                <div key={l} className="text-center">
                  <p className="serif text-xl font-bold gold-text">{v}</p>
                  <p className="text-xs" style={{ color:'var(--brown-soft)' }}>{l}</p>
                </div>
              ))}
            </div>
          )}

          {/* Masonry grid */}
          {loading ? (
            <div className="masonry">
              {[1,2,3,4].map(i => <div key={i} className={`masonry-item skeleton rounded-2xl`} style={{ height:i%2===0?180:140 }} />)}
            </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">📷</p>
              <h3 className="serif text-xl mb-2">Nog geen foto&apos;s</h3>
              <p className="serif-italic text-sm" style={{ color:'var(--brown-soft)' }}>Upload jullie eerste herinnering!</p>
            </div>
          ) : (
            <div className="masonry">
              {memories.map((m, idx) => {
                const liked = m.liked_by?.includes(user)
                return (
                  <div key={m.id} className="masonry-item">
                    <div className="glass-sm overflow-hidden" onClick={() => setLightboxIdx(idx)} style={{ cursor:'pointer' }}>
                      <div className="relative">
                        <img src={m.url} alt={m.caption||'Herinnering'} className="w-full object-cover"
                             style={{ minHeight:80, maxHeight:220 }} loading="lazy" />
                        <button onClick={e => { e.stopPropagation(); handleLike(m.id) }}
                                className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                                style={{ background:'rgba(255,255,255,0.85)', backdropFilter:'blur(4px)' }}>
                          <span className="text-base">{liked ? '❤️' : '🤍'}</span>
                        </button>
                      </div>
                      <div className="p-2">
                        {m.caption && <p className="text-xs font-medium truncate" style={{ color:'var(--brown)' }}>{m.caption}</p>}
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[10px]" style={{ color:'var(--brown-soft)' }}>
                            {m.created_by==='lilia'?'👰':'🤵'} {new Date(m.created_at).toLocaleDateString('nl-NL',{day:'numeric',month:'short'})}
                          </span>
                          {m.location && <span className="text-[10px] truncate" style={{ color:'var(--brown-soft)' }}>📍{m.location}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Upload form */}
        {showForm && (
          <div className="overlay" onClick={() => setShowForm(false)}>
            <div className="sheet" onClick={e => e.stopPropagation()}>
              <h2 className="serif text-xl mb-4">Foto toevoegen</h2>
              {preview && <img src={preview} alt="" className="w-full rounded-2xl mb-4 object-cover" style={{ maxHeight:200 }} />}
              <div className="flex flex-col gap-3">
                <input type="text" placeholder="Bijschrift (optioneel)" value={caption} onChange={e => setCaption(e.target.value)} className="input" />
                <input type="text" placeholder="Locatie (optioneel)" value={location} onChange={e => setLocation(e.target.value)} className="input" />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => { setShowForm(false); setPendingFile(null); setPreview(null) }} className="flex-1 btn-ghost">Annuleer</button>
                <button onClick={handleUpload} disabled={uploading} className="flex-1 btn-rose disabled:opacity-50">
                  {uploading ? 'Uploaden...' : 'Uploaden 📸'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox */}
        {lightboxIdx !== null && (
          <Lightbox memories={memories} idx={lightboxIdx} onClose={() => setLightboxIdx(null)}
                    onPrev={() => setLightboxIdx(i => (i-1+memories.length)%memories.length)}
                    onNext={() => setLightboxIdx(i => (i+1)%memories.length)} />
        )}

        <BottomNav />
        <FloatingAI currentUser={user} />
      </div>
    </div>
  )
}
