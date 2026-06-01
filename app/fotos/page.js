'use client'
import { useState, useEffect, useRef } from 'react'
import BottomNav from '@/components/BottomNav'
import { getMemories, uploadMemory, addMemory, toggleMemoryLike, deleteMemory, subscribeToMemories } from '@/lib/supabase'

function compressImage(file, maxWidth = 1200) {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ratio = Math.min(maxWidth / img.width, 1)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url)
        resolve(new File([blob], file.name, { type: 'image/jpeg' }))
      }, 'image/jpeg', 0.85)
    }
    img.src = url
  })
}

function PhotoCard({ memory, currentUser, onLike, onDelete, onOpen }) {
  const liked = memory.liked_by?.includes(currentUser)

  return (
    <div className="masonry-item">
      <div className="glass-card-sm overflow-hidden"
           onClick={() => onOpen(memory)}
           style={{ cursor: 'pointer' }}>
        <div className="relative">
          <img src={memory.url} alt={memory.caption || 'Herinnering'}
               className="w-full object-cover"
               style={{ minHeight: 100, maxHeight: 240, objectFit: 'cover' }}
               loading="lazy" />
          <button
            onClick={e => { e.stopPropagation(); onLike(memory.id) }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)' }}>
            <span className={liked ? 'heart-beat' : ''} style={{ fontSize: '1rem' }}>
              {liked ? '❤️' : '🤍'}
            </span>
          </button>
        </div>
        <div className="p-2">
          {memory.caption && (
            <p className="text-xs font-medium truncate" style={{ color: '#3D2B1F', fontFamily: 'DM Sans' }}>
              {memory.caption}
            </p>
          )}
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px]" style={{ color: '#9B8080' }}>
              {memory.created_by === 'lilia' ? '👰' : '🤵'}{' '}
              {new Date(memory.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
            </span>
            {memory.location && (
              <span className="text-[10px]" style={{ color: '#9B8080' }}>📍 {memory.location}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Lightbox({ memory, onClose, onNext, onPrev }) {
  useEffect(() => {
    const handleKey = e => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft') onPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, onNext, onPrev])

  return (
    <div className="fixed inset-0 z-50 flex flex-col"
         style={{ background: 'rgba(26,10,16,0.95)' }}>
      <div className="flex items-center justify-between p-4">
        <button onClick={onPrev} className="text-2xl opacity-70">◀</button>
        <div className="text-center">
          {memory.caption && (
            <p className="text-white font-medium text-sm">{memory.caption}</p>
          )}
          {memory.location && (
            <p className="text-white/60 text-xs">📍 {memory.location}</p>
          )}
        </div>
        <button onClick={onClose} className="text-2xl text-white opacity-70">✕</button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <img src={memory.url} alt={memory.caption || ''}
             className="max-w-full max-h-full object-contain rounded-xl" />
      </div>
      <div className="p-4 text-center">
        <span className="text-white/50 text-xs">
          {memory.created_by === 'lilia' ? '👰 Lilia' : '🤵 Abdul'} ·{' '}
          {new Date(memory.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <button onClick={onNext} className="block text-2xl opacity-70 mx-auto mt-2">▶</button>
      </div>
    </div>
  )
}

export default function FotosPage() {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [currentUser, setCurrentUser] = useState('abdul')
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const [pendingPreview, setPendingPreview] = useState(null)
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    setCurrentUser(localStorage.getItem('honeymoon_user') || 'abdul')
  }, [])

  useEffect(() => {
    async function load() {
      const data = await getMemories()
      setMemories(data)
      setLoading(false)
    }
    load()

    const sub = subscribeToMemories(async () => {
      const data = await getMemories()
      setMemories(data)
    })
    return () => sub.unsubscribe()
  }, [])

  async function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    setPendingFile(compressed)
    setPendingPreview(URL.createObjectURL(compressed))
    setShowForm(true)
    e.target.value = ''
  }

  async function handleUpload() {
    if (!pendingFile) return
    setUploading(true)
    try {
      const url = await uploadMemory(pendingFile, currentUser)
      if (url) {
        const memory = await addMemory({
          url,
          caption: caption || null,
          location: location || null,
          liked_by: [],
          created_by: currentUser,
        })
        if (memory) setMemories(prev => [memory, ...prev])
      }
    } finally {
      setUploading(false)
      setShowForm(false)
      setPendingFile(null)
      setPendingPreview(null)
      setCaption('')
      setLocation('')
    }
  }

  async function handleLike(id) {
    if ('vibrate' in navigator) navigator.vibrate(15)
    const updated = await toggleMemoryLike(id, currentUser)
    if (updated) setMemories(prev => prev.map(m => m.id === id ? updated : m))
  }

  async function handleDelete(id) {
    const memory = memories.find(m => m.id === id)
    if (!memory || memory.created_by !== currentUser) return
    if (confirm('Foto verwijderen?')) {
      await deleteMemory(id, memory.url)
      setMemories(prev => prev.filter(m => m.id !== id))
    }
  }

  return (
    <div className="min-h-dvh">
      <div className="page-content px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="heading-playfair text-2xl">📸 Herinneringen</h1>
            <p className="heading-italic text-xs mt-0.5" style={{ color: '#9B8080' }}>
              Jullie mooiste momenten
            </p>
          </div>
          <button onClick={() => fileInputRef.current?.click()}
                  className="btn-rose px-4 py-2 text-sm">
            + Foto
          </button>
        </div>

        <div className="gold-line mb-4" />

        <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
               onChange={handleFileSelect} className="hidden" />

        {/* Stats */}
        {memories.length > 0 && (
          <div className="glass-card-sm p-3 mb-4 flex justify-around">
            <div className="text-center">
              <p className="font-bold text-lg heading-playfair" style={{ color: '#D4AF37' }}>
                {memories.length}
              </p>
              <p className="text-xs" style={{ color: '#9B8080', fontFamily: 'DM Sans' }}>Foto&apos;s</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg heading-playfair" style={{ color: '#E8A4B8' }}>
                {memories.filter(m => m.liked_by?.length > 0).length}
              </p>
              <p className="text-xs" style={{ color: '#9B8080', fontFamily: 'DM Sans' }}>Geliked</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg heading-playfair" style={{ color: '#D4AF37' }}>
                {memories.filter(m => m.created_by === 'lilia').length}
              </p>
              <p className="text-xs" style={{ color: '#9B8080', fontFamily: 'DM Sans' }}>Van Lilia</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="masonry-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="masonry-item">
                <div className="skeleton rounded-2xl" style={{ height: i % 2 === 0 ? 180 : 140 }} />
              </div>
            ))}
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📷</p>
            <h3 className="heading-playfair text-xl mb-2">Nog geen foto&apos;s</h3>
            <p className="heading-italic text-sm" style={{ color: '#9B8080' }}>
              Upload jullie eerste herinnering!
            </p>
          </div>
        ) : (
          <div className="masonry-grid">
            {memories.map((m, idx) => (
              <PhotoCard key={m.id} memory={m} currentUser={currentUser}
                         onLike={handleLike} onDelete={handleDelete}
                         onOpen={() => setLightboxIdx(idx)} />
            ))}
          </div>
        )}
      </div>

      {/* Upload formulier */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h2 className="heading-playfair text-xl mb-4">Foto toevoegen</h2>
            {pendingPreview && (
              <img src={pendingPreview} alt="" className="w-full rounded-2xl mb-4 object-cover"
                   style={{ maxHeight: 200 }} />
            )}
            <div className="flex flex-col gap-3">
              <input type="text" placeholder="Beschrijving (optioneel)" value={caption}
                     onChange={e => setCaption(e.target.value)} className="input-field" />
              <input type="text" placeholder="Locatie (optioneel)" value={location}
                     onChange={e => setLocation(e.target.value)} className="input-field" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowForm(false); setPendingFile(null); setPendingPreview(null) }}
                      className="flex-1 py-3 rounded-2xl" style={{ background: 'rgba(212,175,55,0.1)', color: '#9B8080' }}>
                Annuleer
              </button>
              <button onClick={handleUpload} disabled={uploading}
                      className="flex-1 btn-rose py-3 disabled:opacity-50">
                {uploading ? 'Uploaden…' : 'Uploaden 📸'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && memories[lightboxIdx] && (
        <Lightbox
          memory={memories[lightboxIdx]}
          onClose={() => setLightboxIdx(null)}
          onNext={() => setLightboxIdx(i => (i + 1) % memories.length)}
          onPrev={() => setLightboxIdx(i => (i - 1 + memories.length) % memories.length)}
        />
      )}

      <BottomNav />
    </div>
  )
}
