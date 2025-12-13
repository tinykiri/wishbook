'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import CutoutItem from '@/src/components/CutoutItem'

export default function Home() {
  const supabase = createClient()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])

  const [canvasScale, setCanvasScale] = useState(1)

  useEffect(() => {
    fetchItems()

    const handleResize = () => {
      const screenW = window.innerWidth;
      const DESKTOP_WIDTH = 1000;

      if (screenW < 768) {
        setCanvasScale(screenW / DESKTOP_WIDTH);
      } else {
        setCanvasScale(1);
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchItems = async () => {
    const { data } = await supabase.from('items').select('*').order('created_at', { ascending: false })
    if (data) setItems(data)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setLoading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('uploads').upload(fileName, file);

    if (error) {
      alert('Error uploading: ' + error.message);
      setLoading(false);
      return;
    }
    const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName);

    if (preview) {
      setPreview({ ...preview, image_url: publicUrlData.publicUrl });
    } else {
      setPreview({ title: '', price: '', image_url: publicUrlData.publicUrl });
    }
    setLoading(false);
  };

  const handleScrape = async () => {
    if (!url) return
    setLoading(true)
    setPreview(null)
    try {
      const res = await fetch('/api/scrape', { method: 'POST', body: JSON.stringify({ url }) })
      const data = await res.json()
      if (data.error) alert("Could not scrape this link!")
      else setPreview(data)
    } catch (e) {
      alert("Something went wrong")
    }
    setLoading(false)
  }

  const handleCancel = () => {
    setPreview(null)
    setUrl('')
  }

  const handleSave = async () => {
    if (!preview) return

    const randomRotation = Math.random() * 6 - 3;
    const randomSeed = Math.floor(Math.random() * 1000);
    const startX = Math.random() * 300 + 100;
    const startY = Math.random() * 100 + 50;

    const { error } = await supabase.from('items').insert({
      title: preview.title,
      price: preview.price,
      image_url: preview.image_url,
      product_url: url,
      rotation: randomRotation,
      scale: 1,
      seed: randomSeed,
      x: startX,
      y: startY
    })

    if (error) {
      alert('Error saving: ' + error.message)
    } else {
      setPreview(null)
      setUrl('')
      fetchItems()
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('items').delete().eq('id', id)
    if (error) alert('Error deleting: ' + error.message)
    else setItems(items.filter((item) => item.id !== id))
  }

  const handleItemUpdate = (id: string, updates: any) => {
    setItems(prevItems => prevItems.map(item => item.id === id ? { ...item, ...updates } : item))
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  }

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/share`;
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied! Send it to your friends 🎁");
  };

  return (
    // FIX: Removed 'bg-paper', added 'bg-transparent' so body background shows through
    <main className="w-full h-screen min-h-screen relative overflow-x-hidden overflow-y-auto pt-20 md:pt-12 px-2 md:px-0 flex flex-col pb-40 bg-transparent">

      {/* 1. THE CRAYON FRAME */}
      <div className="crayon-frame fixed inset-0 pointer-events-none z-[100]" />

      {/* HEADER & INPUT */}
      <div className="flex-none z-50">

        {/* SHARE BUTTON */}
        <div className="absolute top-4 right-4 md:right-8 z-[100]">
          <button
            onClick={handleShare}
            className="bg-white border-2 border-slate-800 text-slate-800 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-title font-bold hover:bg-yellow-200 transition-colors shadow-md flex items-center gap-2 text-xs md:text-sm transform hover:rotate-2"
          >
            <span>🔗 Share List</span>
          </button>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-center mb-10 md:mb-16 font-title transform -rotate-2 tracking-wide leading-tight px-4">
          <span className="inline-block mr-2 md:mr-4 text-crayon-green" style={{ color: '#27ae60', textShadow: '3px 3px 0px rgba(39, 174, 96, 0.2)', mixBlendMode: 'multiply' }}>My</span>
          <span className="inline-block text-crayon-red" style={{ color: '#e65a5a', textShadow: '3px 3px 0px rgba(230, 90, 90, 0.2)', mixBlendMode: 'multiply' }}>WishList</span>
        </h1>

        <div className="relative mb-12 mx-auto w-full md:max-w-2xl filter drop-shadow-xl rotate-1 group z-50 px-2 md:px-0">
          <div className="bg-yellow-200 p-6 md:p-8 pb-8 md:pb-12 relative" style={{ clipPath: 'polygon(2% 0%, 5% 2%, 8% 0%, 12% 2%, 18% 0%, 25% 3%, 35% 0%, 45% 2%, 55% 0%, 65% 3%, 75% 0%, 85% 2%, 92% 0%, 100% 3%, 100% 97%, 95% 100%, 90% 98%, 85% 100%, 75% 97%, 65% 100%, 55% 98%, 45% 100%, 35% 97%, 25% 100%, 15% 97%, 5% 100%, 0% 97%)', backgroundImage: 'repeating-linear-gradient(transparent, transparent 1.9rem, #94a3b8 1.9rem, #94a3b8 2rem)', backgroundAttachment: 'local' }}>
            <h2 className="text-xl md:text-3xl mb-4 md:mb-6 font-title text-slate-700 opacity-90 text-center md:text-left">Paste a link to cut it out:</h2>
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
              <input type="text" placeholder="https://amazon.com/..." className="flex-1 p-3 bg-white/50 border-b-2 border-slate-400 outline-none font-body text-lg md:text-2xl placeholder:text-slate-400 focus:bg-white/80 transition-colors rounded-sm" value={url} onChange={(e) => setUrl(e.target.value)} />
              <div className="flex gap-2 h-12 md:h-auto">
                <button onClick={handleScrape} disabled={loading} className="flex-1 md:flex-none bg-blue-600 text-white px-5 font-bold hover:bg-blue-700 disabled:opacity-50 font-title text-lg md:text-xl flex items-center justify-center gap-2 transform hover:-rotate-2 transition-transform shadow-md rounded-sm">
                  <span>{loading ? '...' : 'Cut It!'}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></svg>
                </button>
                <button onClick={() => setPreview({ title: '', price: '', image_url: '' })} className="bg-yellow-400 text-yellow-900 px-4 font-bold hover:bg-yellow-500 shadow-sm font-title text-2xl rounded-sm flex items-center" title="Add manually">+</button>
              </div>
            </div>

            {preview && (
              <div className="relative mt-8 md:mt-12 -mx-2 md:mx-2 filter drop-shadow-md z-10">
                <div className="bg-white p-4 md:p-6 pb-8 relative" style={{ clipPath: 'polygon(1% 0%, 5% 2%, 10% 0%, 15% 2%, 20% 0%, 25% 1%, 30% 0%, 35% 2%, 40% 0%, 45% 1%, 50% 0%, 55% 2%, 60% 0%, 65% 2%, 70% 0%, 75% 2%, 80% 0%, 85% 2%, 90% 0%, 95% 2%, 99% 0%, 100% 5%, 98% 10%, 100% 15%, 98% 20%, 100% 25%, 98% 30%, 100% 35%, 98% 40%, 100% 45%, 98% 50%, 100% 55%, 98% 60%, 100% 65%, 98% 70%, 100% 75%, 98% 80%, 100% 85%, 98% 90%, 100% 95%, 99% 100%, 95% 98%, 90% 100%, 85% 98%, 80% 100%, 75% 98%, 70% 100%, 65% 98%, 60% 100%, 55% 98%, 50% 100%, 45% 98%, 40% 100%, 35% 98%, 30% 100%, 25% 98%, 20% 100%, 15% 98%, 10% 100%, 5% 98%, 1% 100%, 2% 95%, 0% 90%, 2% 85%, 0% 80%, 2% 75%, 0% 70%, 2% 65%, 0% 60%, 2% 55%, 0% 50%, 2% 45%, 0% 40%, 2% 35%, 0% 30%, 2% 25%, 0% 20%, 2% 15%, 0% 10%, 2% 5%)' }}>
                  <div className="absolute -top-3 md:-top-4 left-1/2 w-24 md:w-32 h-6 md:h-8 bg-yellow-200/90 -translate-x-1/2 rotate-1 shadow-sm pointer-events-none"></div>
                  <button onClick={handleCancel} className="absolute top-0 right-0 p-2 text-slate-300 hover:text-red-500 font-title font-bold text-xl transition-colors z-50">✕</button>

                  <div className="flex flex-col md:flex-row gap-4 items-start mt-4">
                    <div
                      onClick={triggerFileUpload}
                      className="w-full md:w-24 h-48 md:h-24 shrink-0 bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden shadow-sm rotate-1 cursor-pointer group relative hover:border-blue-400 transition-colors"
                      title="Click to change image"
                    >
                      {preview.image_url ? (
                        <>
                          <img src={preview.image_url} alt="Preview" className="w-full h-full object-contain pointer-events-none" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-[10px] font-bold bg-black/50 px-1 rounded">CHANGE</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full w-full text-slate-400 gap-1 group-hover:text-blue-500">
                          <span className="text-2xl font-bold">+</span>
                          <span className="text-[10px] font-bold">ADD FOTO</span>
                        </div>
                      )}
                    </div>

                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

                    <div className="flex-1 w-full space-y-3">
                      <input value={preview.title} onChange={(e) => setPreview({ ...preview, title: e.target.value })} className="w-full bg-transparent border-b border-slate-200 font-title font-bold text-xl md:text-2xl text-slate-800 focus:border-blue-500 outline-none placeholder:text-slate-300" placeholder="Product Name" />
                      <input value={preview.price} onChange={(e) => setPreview({ ...preview, price: e.target.value })} className="w-1/2 bg-transparent border-b border-slate-200 text-crayon-red font-title font-bold text-2xl md:text-3xl focus:border-blue-500 outline-none placeholder:text-red-200/50" placeholder="Price" style={{ opacity: 0.95, mixBlendMode: 'multiply', textShadow: '0px 0px 1px rgba(230, 90, 90, 1), 1px 1px 0px rgba(230, 90, 90, 0.8)' }} />
                    </div>
                  </div>

                  <div className="mt-6 border-t border-dashed border-slate-200 pt-4">
                    <input
                      value={preview.image_url || ''}
                      onChange={(e) => setPreview({ ...preview, image_url: e.target.value })}
                      className="w-full text-xs text-slate-400 bg-slate-50 border border-slate-200 p-2 rounded focus:border-blue-500 outline-none mb-3 font-body"
                      placeholder="Or paste image URL here..."
                    />

                    <button onClick={handleSave} className="w-full bg-green-600 text-white px-5 py-2 rounded shadow-sm hover:bg-green-700 font-title text-xl flex items-center justify-center gap-2 transform hover:rotate-1 transition-transform">
                      <span>Glue It!</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 22V12a6 6 0 0 0-12 0v10" /><path d="M8 22h8" /><path d="M9 6V2" /><path d="M15 6V2" /><path d="M9 2h6" /><path d="M8 6h8" /><path d="M12 15v3" /><circle cx="12" cy="19" r="1" fill="currentColor" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* THE CANVAS */}
      <div className="flex-1 relative w-full border-t-4 border-dashed border-black/5">
        <p className="absolute top-4 left-1/2 -translate-x-1/2 text-slate-400 font-title opacity-50 pointer-events-none text-center text-sm md:text-base w-full px-4 z-0">
          (Drag items anywhere to arrange your board)
        </p>

        {/* VIRTUAL VIEWPORT CONTAINER */}
        <div
          style={{
            width: canvasScale < 1 ? '1000px' : '100%',
            height: '2000px',
            transform: `scale(${canvasScale})`,
            transformOrigin: 'top left',
          }}
          className="relative"
        >
          {items.map((item) => (
            <CutoutItem
              key={item.id}
              item={item}
              onDelete={() => handleDelete(item.id)}
              onUpdate={handleItemUpdate}
              canvasScale={canvasScale}
            />
          ))}
        </div>

        {items.length === 0 && !loading && (
          <p className="absolute top-24 left-1/2 -translate-x-1/2 w-full text-center text-2xl md:text-3xl text-slate-400 rotate-[-2deg] font-title opacity-70 pointer-events-none">
            Your list is empty! Start cutting...
          </p>
        )}
      </div>

    </main>
  )
}