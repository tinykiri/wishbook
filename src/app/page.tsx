'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import CutoutItem from '@/src/components/CutoutItem'

export default function Home() {
  const supabase = createClient()

  // State variables
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])

  // 1. Fetch existing items on load
  useEffect(() => {
    fetchItems()
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

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, file);

    if (error) {
      alert('Error uploading: ' + error.message);
      setLoading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    if (preview) {
      setPreview({ ...preview, image_url: publicUrlData.publicUrl });
    } else {
      setPreview({
        title: '',
        price: '',
        image_url: publicUrlData.publicUrl
      });
    }
    setLoading(false);
  };

  const handleScrape = async () => {
    if (!url) return
    setLoading(true)
    setPreview(null)

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        body: JSON.stringify({ url })
      })
      const data = await res.json()

      if (data.error) alert("Could not scrape this link!")
      else setPreview(data)

    } catch (e) {
      alert("Something went wrong")
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!preview) return

    const randomRotation = Math.random() * 6 - 3;
    const randomSeed = Math.floor(Math.random() * 1000);

    // NEW: Random start position near the top
    const startX = Math.random() * 200;
    const startY = Math.random() * 100;

    const { error } = await supabase.from('items').insert({
      title: preview.title,
      price: preview.price,
      image_url: preview.image_url,
      product_url: url,
      rotation: randomRotation,
      seed: randomSeed,
      x: startX, // Save X
      y: startY  // Save Y
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

    if (error) {
      alert('Error deleting: ' + error.message)
    } else {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen">

      {/* HEADER */}
      <h1 className="text-7xl font-bold text-center mb-16 mt-4 font-title transform -rotate-2 tracking-wide leading-tight">
        <span
          className="inline-block mr-4 text-crayon-green"
          style={{ color: '#27ae60', textShadow: '3px 3px 0px rgba(39, 174, 96, 0.2)', mixBlendMode: 'multiply' }}
        >
          My
        </span>
        <span
          className="inline-block text-crayon-red"
          style={{ color: '#e65a5a', textShadow: '3px 3px 0px rgba(230, 90, 90, 0.2)', mixBlendMode: 'multiply' }}
        >
          WishList
        </span>
      </h1>

      {/* INPUT SECTION: RIPPED YELLOW PAPER */}
      {/* We use a drop shadow wrapper because clip-path hides normal shadows */}
      <div className="relative mb-16 mx-auto max-w-2xl filter drop-shadow-xl rotate-1 group">

        {/* The Paper Itself */}
        <div
          className="bg-yellow-200 p-8 pb-12 relative"
          style={{
            // 1. The Ripped Paper Polygon Shape
            clipPath: 'polygon(2% 0%, 5% 2%, 8% 0%, 12% 2%, 18% 0%, 25% 3%, 35% 0%, 45% 2%, 55% 0%, 65% 3%, 75% 0%, 85% 2%, 92% 0%, 100% 3%, 100% 97%, 95% 100%, 90% 98%, 85% 100%, 75% 97%, 65% 100%, 55% 98%, 45% 100%, 35% 97%, 25% 100%, 15% 97%, 5% 100%, 0% 97%)',
            // 2. Yellow Notebook Lines
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 1.9rem, #94a3b8 1.9rem, #94a3b8 2rem)',
            backgroundAttachment: 'local'
          }}
        >
          <h2 className="text-3xl mb-6 font-title text-slate-700 opacity-90">Paste a link to cut it out:</h2>

          <div className="flex gap-3 items-stretch">
            <input
              type="text"
              placeholder="https://amazon.com/..."
              className="flex-1 p-3 bg-white/50 border-b-2 border-slate-400 outline-none font-body text-2xl placeholder:text-slate-400 focus:bg-white/80 transition-colors"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            {/* CUT IT BUTTON (Scissors) */}
            <button
              onClick={handleScrape}
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 font-bold hover:bg-blue-700 disabled:opacity-50 font-title text-xl flex items-center gap-2 transform hover:-rotate-2 transition-transform shadow-md rounded-sm"
            >
              <span>{loading ? '...' : 'Cut It!'}</span>
              {/* Scissors SVG Icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <line x1="20" y1="4" x2="8.12" y2="15.88" />
                <line x1="14.47" y1="14.48" x2="20" y2="20" />
                <line x1="8.12" y1="8.12" x2="12" y2="12" />
              </svg>
            </button>

            {/* Manual Add Button */}
            <button
              onClick={() => setPreview({ title: '', price: '', image_url: '' })}
              className="bg-yellow-400 text-yellow-900 px-3 py-2 font-bold hover:bg-yellow-500 shadow-sm font-title text-2xl rounded-sm"
              title="Add manually"
            >
              +
            </button>
          </div>

          {/* EDITABLE PREVIEW SECTION */}
          {preview && (
            <div className="mt-8 p-4 bg-white/60 border-2 border-dashed border-slate-400 flex flex-col gap-4 relative">

              {/* Little tape visual */}
              <div className="absolute -top-3 left-1/2 w-24 h-6 bg-yellow-200/80 -translate-x-1/2 rotate-1 shadow-sm"></div>

              <div className="flex gap-4 items-start">
                <div className="w-24 h-24 shrink-0 bg-white border border-slate-300 p-1 flex items-center justify-center overflow-hidden shadow-sm">
                  {preview.image_url ? (
                    <img src={preview.image_url} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs text-gray-400 text-center font-body">No Img</span>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    value={preview.title}
                    onChange={(e) => setPreview({ ...preview, title: e.target.value })}
                    className="w-full bg-transparent border-b border-slate-400 font-title font-bold text-2xl focus:border-blue-500 outline-none"
                    placeholder="Product Name"
                  />
                  <input
                    value={preview.price}
                    onChange={(e) => setPreview({ ...preview, price: e.target.value })}
                    className="w-1/3 bg-transparent border-b border-slate-400 text-crayon-red font-title font-bold text-3xl focus:border-blue-500 outline-none"
                    placeholder="Price"
                  />
                </div>
              </div>

              {/* URL Input */}
              <input
                value={preview.image_url || ''}
                onChange={(e) => setPreview({ ...preview, image_url: e.target.value })}
                className="w-full text-sm text-gray-500 bg-white/50 border border-slate-300 p-2 rounded focus:border-blue-500 outline-none mb-1 font-body"
                placeholder="Paste image link here if missing..."
              />

              {/* Upload Input */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold text-gray-400 font-title">OR</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-sm text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 font-body"
                />
              </div>

              {/* GLUE IT BUTTON */}
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-6 py-2 rounded shadow-md hover:bg-green-700 self-end font-title text-2xl flex items-center gap-2 transform hover:rotate-2 transition-transform"
              >
                <span>Glue It!</span>
                {/* Glue Bottle SVG Icon */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 22h8" /> {/* Bottom line */}
                  <path d="M18 22V12a6 6 0 0 0-12 0v10" /> {/* Bottle body */}
                  <path d="M9 6V2" /> {/* Nozzle left */}
                  <path d="M15 6V2" /> {/* Nozzle right */}
                  <path d="M9 2h6" /> {/* Top cap */}
                  <path d="M8 6h8" /> {/* Neck ring */}
                  <path d="M12 15v3" /> {/* Drop */}
                  <circle cx="12" cy="19" r="1" fill="currentColor" /> {/* Drop dot */}
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* THE CANVAS (Free form area) */}
      {/* We make this container HUGE so you can drag items far down */}
      <div className="relative w-full h-[200vh] border-t-4 border-dashed border-black/10 mt-12">
        <p className="absolute top-4 left-1/2 -translate-x-1/2 text-slate-400 font-title opacity-50 pointer-events-none">
          (Drag items anywhere to arrange your board)
        </p>

        {items.map((item) => (
          <CutoutItem
            key={item.id}
            item={item}
            onDelete={() => handleDelete(item.id)}
          />
        ))}
      </div>

      {items.length === 0 && !loading && (
        <p className="text-center text-3xl text-slate-400 mt-12 rotate-[-2deg] font-title opacity-70">
          Your list is empty! Start cutting...
        </p>
      )}

    </main>
  )
}