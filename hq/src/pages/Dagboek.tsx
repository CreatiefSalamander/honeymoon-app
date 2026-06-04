import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Shell from '@/components/Shell'
import { useTrip } from '@/lib/store'
import { getMemories, uploadPhoto, addMemory, toggleLike, deleteMemory, logActivity } from '@/lib/supabase'
import { toast } from '@/lib/notify'

function compress(file: File, maxW = 1200): Promise<File> {
  return new Promise(res => {
    const img = new Image(); const url = URL.createObjectURL(file)
    img.onload = () => {
      const r = Math.min(maxW / img.width, 1), c = document.createElement('canvas')
      c.width = img.width * r; c.height = img.height * r
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      c.toBlob(b => { URL.revokeObjectURL(url); res(new File([b!], file.name, { type: 'image/jpeg' })) }, 'image/jpeg', 0.82)
    }
    img.onerror = () => res(file); img.src = url
  })
}

export default function Dagboek() {
  const { t } = useTranslation()
  const { phone } = useTrip()
  const [mem, setMem] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [box, setBox] = useState<number | null>(null)
  const [up, setUp] = useState(false)
  const [pending, setPending] = useState<{ file: File; preview: string } | null>(null)
  const [caption, setCaption] = useState(''); const [loc, setLoc] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { getMemories().then((d: any[]) => { setMem(d); setLoading(false) }) }, [])

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    const c = await compress(f); setPending({ file: c, preview: URL.createObjectURL(c) }); setUp(true); e.target.value = ''
  }
  async function upload() {
    if (!pending) return
    const url = await uploadPhoto(pending.file, phone)
    if (url) { const m = await addMemory({ url, caption: caption || null, location: loc || null, liked_by: [], created_by: phone }); if (m) { setMem(p => [m, ...p]); logActivity('foto', `${phone === 'lilia' ? 'Lilia' : 'Abdul'} voegde een foto toe`, phone) } }
    setUp(false); setPending(null); setCaption(''); setLoc(''); toast('✓ 📸')
  }
  async function like(id: string) { if ('vibrate' in navigator) navigator.vibrate(12); const u = await toggleLike(id, phone); if (u) setMem(p => p.map(m => m.id === id ? u : m)) }
  async function del(id: string) { if (confirm('Verwijderen?')) { await deleteMemory(id); setMem(p => p.filter(m => m.id !== id)); setBox(null) } }

  return (
    <Shell>
      <div className="s-head"><div className="s-title">{t('more.profile') && 'Dagboek'}</div><button className="btn btn-gold btn-sm" onClick={() => fileRef.current?.click()}>+ 📸</button></div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={pick} style={{ display: 'none' }} />

      {loading ? <div className="masonry">{[1, 2, 3, 4].map(i => <div key={i} className="masonry-item skel" style={{ height: i % 2 ? 180 : 140 }} />)}</div> :
        mem.length === 0 ? (
          <div className="card" style={{ padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 36 }}>📷</div>
            <p className="serif" style={{ fontSize: 18, marginTop: 8 }}>Nog geen foto's</p>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>Leg jullie eerste herinnering vast</p>
            <button className="btn btn-gold" style={{ marginTop: 14 }} onClick={() => fileRef.current?.click()}>📸 Foto toevoegen</button>
          </div>
        ) : (
          <div className="masonry">
            {mem.map((m, idx) => {
              const liked = m.liked_by?.includes(phone)
              return (
                <div key={m.id} className="masonry-item photo-card" onClick={() => setBox(idx)}>
                  <div style={{ position: 'relative' }}>
                    <img src={m.url} alt={m.caption || ''} style={{ width: '100%', display: 'block' }} loading="lazy" />
                    <button onClick={e => { e.stopPropagation(); like(m.id) }} style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: '50%', background: 'rgba(10,22,40,.55)', backdropFilter: 'blur(4px)', fontSize: 15 }}>{liked ? '❤️' : '🤍'}</button>
                  </div>
                  {(m.caption || m.location) && <div style={{ padding: '7px 9px' }}>
                    {m.caption && <div style={{ fontSize: 12, fontWeight: 600 }}>{m.caption}</div>}
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.created_by === 'lilia' ? '👰' : '🤵'} {m.location ? '· 📍' + m.location : ''}</div>
                  </div>}
                </div>
              )
            })}
          </div>
        )}

      {/* Upload sheet */}
      {up && pending && (
        <div className="overlay" onClick={() => setUp(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <img src={pending.preview} alt="" style={{ width: '100%', borderRadius: 16, maxHeight: 220, objectFit: 'cover', marginBottom: 12 }} />
            <input className="input" placeholder="Bijschrift" value={caption} onChange={e => setCaption(e.target.value)} style={{ marginBottom: 10 }} />
            <input className="input" placeholder="Locatie" value={loc} onChange={e => setLoc(e.target.value)} style={{ marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 10 }}><button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setUp(false); setPending(null) }}>{t('common.cancel')}</button><button className="btn btn-gold" style={{ flex: 2 }} onClick={upload}>📸 Uploaden</button></div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {box !== null && mem[box] && (
        <div className="overlay" style={{ alignItems: 'center', background: 'rgba(5,12,24,.95)' }} onClick={() => setBox(null)}>
          <div style={{ width: '100%', padding: 16 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <button onClick={() => setBox(b => b! > 0 ? b! - 1 : mem.length - 1)} style={{ color: '#fff', fontSize: 22 }}>‹</button>
              <button onClick={() => setBox(null)} style={{ color: '#fff', fontSize: 20 }}>✕</button>
              <button onClick={() => setBox(b => (b! + 1) % mem.length)} style={{ color: '#fff', fontSize: 22 }}>›</button>
            </div>
            <img src={mem[box].url} alt="" style={{ width: '100%', borderRadius: 16, maxHeight: '64vh', objectFit: 'contain' }} />
            <div style={{ color: '#fff', textAlign: 'center', marginTop: 10 }}>
              {mem[box].caption && <div className="serif" style={{ fontSize: 18 }}>{mem[box].caption}</div>}
              <div style={{ fontSize: 12, opacity: .6, marginTop: 4 }}>{mem[box].created_by === 'lilia' ? '👰 Lilia' : '🤵 Abdul'} · {new Date(mem[box].created_at).toLocaleDateString('nl-NL')}</div>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => del(mem[box].id)}>🗑️ {t('common.delete')}</button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
