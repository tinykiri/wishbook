'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'
import CutoutItem from '@/src/components/CutoutItem'
import MobileBlocker from '@/src/components/MobileBlocker'
import AboutModal from '@/src/components/AboutModal'

export default function Home() {
  const supabase = createClient()
  const router = useRouter()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [canvasScale, setCanvasScale] = useState(1)
  const [showAbout, setShowAbout] = useState(false)

  const [isCheckingUser, setIsCheckingUser] = useState(true)

  // WIDTH CONSTRAINT (Safe Zone)
  const BOARD_WIDTH = 1250;

  useEffect(() => {
    const checkUserAndLoad = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setIsCheckingUser(false)
        fetchItems(user.id)
      }
    }
    checkUserAndLoad()

    const handleResize = () => {
      const screenW = window.innerWidth;
      const DESKTOP_WIDTH = BOARD_WIDTH;

      if (screenW < DESKTOP_WIDTH) {
        setCanvasScale((screenW - 10) / DESKTOP_WIDTH);
      } else {
        setCanvasScale(1);
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [router])

  const fetchItems = async (userId: string) => {
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .order('order', { ascending: true })

    if (data) {
      const needsOrderInit = data.some((item: any) => item.order === null || item.order === undefined);
      if (needsOrderInit) {
        const updates = data.map((item: any, index: number) => ({
          id: item.id,
          order: Math.max(0, item.order ?? index)
        }));

        for (const update of updates) {
          await supabase.from('items').update({ order: update.order }).eq('id', update.id);
        }

        const { data: refreshedData } = await supabase
          .from('items')
          .select('*')
          .eq('user_id', userId)
          .order('order', { ascending: true });

        if (refreshedData) setItems(refreshedData);
      } else {
        setItems(data);
      }
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setLoading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('uploads').upload(fileName, file);
    if (error) { alert('Error: ' + error.message); setLoading(false); return; }
    const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    setPreview((prev: any) => ({ ...prev, image_url: publicUrlData.publicUrl, product_url: prev?.product_url || '' }));
    setLoading(false);
  };

  const handleScrape = async () => {
    if (!url) return; setLoading(true); setPreview(null);
    try {
      const res = await fetch('/api/scrape', { method: 'POST', body: JSON.stringify({ url }) });
      const data = await res.json();
      if (data.error) alert("Could not scrape link!"); else setPreview({ ...data, product_url: url });
    } catch { alert("Error scraping"); }
    setLoading(false);
  }

  const handleCancel = () => { setPreview(null); setUrl(''); }

  const handleSave = async () => {
    if (!preview) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const startX = BOARD_WIDTH / 2 - 100;
    const startY = 100;

    const { data: existingItems } = await supabase
      .from('items')
      .select('order')
      .eq('user_id', user.id)
      .order('order', { ascending: false })
      .limit(1);

    const maxOrder = existingItems && existingItems.length > 0 && existingItems[0].order !== null
      ? Math.max(0, existingItems[0].order)
      : -1;
    const nextOrder = Math.max(0, maxOrder + 1);

    const { error } = await supabase.from('items').insert({
      title: preview.title,
      price: preview.price,
      image_url: preview.image_url,
      product_url: preview.product_url || url || '',
      rotation: Math.random() * 6 - 3,
      scale: 1,
      seed: Math.floor(Math.random() * 1000),
      x: startX,
      y: startY,
      order: nextOrder,
      user_id: user.id
    });

    if (error) alert('Error saving: ' + error.message);
    else { setPreview(null); setUrl(''); fetchItems(user.id); }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (!error) setItems(items.filter(i => i.id !== id));
  }

  const handleOrderChange = async (id: string, direction: 'up' | 'down') => {
    const currentItem = items.find(i => i.id === id);
    if (!currentItem || currentItem.order === null || currentItem.order === undefined) return;

    const currentOrder = Math.max(0, currentItem.order);
    const targetOrder = direction === 'up' ? currentOrder + 1 : Math.max(0, currentOrder - 1);

    if (targetOrder < 0) return;

    const targetItem = items.find(i => i.order === targetOrder);
    if (!targetItem) return;

    await supabase.from('items').update({ order: Math.max(0, targetOrder) }).eq('id', id);
    await supabase.from('items').update({ order: Math.max(0, currentOrder) }).eq('id', targetItem.id);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) fetchItems(user.id);
  }

  const handleItemUpdate = (id: string, updates: any) => { /* Update local state */ }
  const triggerFileUpload = () => fileInputRef.current?.click();

  const handleShare = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    let { data: profile } = await supabase.from('profiles').select('share_key').eq('id', user.id).single();
    let shareKey = profile?.share_key;

    if (!shareKey) {
      shareKey = Math.random().toString(36).substring(2, 12);
      const { error } = await supabase.from('profiles').insert({ id: user.id, share_key: shareKey });
      if (error) { alert("Error generating share link"); return; }
    }

    const shareUrl = `${window.location.origin}/share/${shareKey}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied! 🎁\n\n" + shareUrl);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push('/login');
  }

  if (isCheckingUser) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-yellow-50">
        <div className="animate-spin text-4xl">🖍️</div>
      </div>
    )
  }

  return (
    <main className="w-full min-h-screen relative overflow-x-hidden pt-20 md:pt-8 px-2 md:px-0 flex flex-col bg-transparent">

      <MobileBlocker />
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <div className="crayon-frame fixed inset-0 pointer-events-none z-100" />

      {/* MENU */}
      <div className="fixed top-4 right-4 md:right-8 z-200 flex items-center gap-2 md:gap-3 pointer-events-auto">
        <button onClick={() => setShowAbout(true)} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-2 border-slate-800 text-slate-800 font-title font-bold text-lg md:text-xl shadow-md hover:bg-yellow-100 hover:scale-110 transition-transform flex items-center justify-center hover:cursor-pointer">?</button>
        <button onClick={handleShare} className="bg-white border-2 border-slate-800 text-slate-800 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-title font-bold hover:bg-green-100 hover:text-green-800 transition-colors shadow-md flex items-center gap-2 text-xs md:text-sm transform hover:rotate-2 hover:cursor-pointer"><span>🔗 Share</span></button>
        <button onClick={handleSignOut} className="bg-red-50 border-2 border-red-200 text-red-400 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-title font-bold hover:bg-red-100 hover:text-red-600 hover:border-red-400 transition-all shadow-sm flex items-center gap-2 text-xs md:text-sm transform hover:-rotate-1 hover:cursor-pointer"><span>Exit ➜</span></button>
      </div>

      {/* CONTENT */}
      <div className="flex-none z-50">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-6 md:mb-8 font-title transform -rotate-2 tracking-wide leading-tight px-4 mt-8 md:mt-0">
          <span className="inline-block mr-2 md:mr-4 text-crayon-green" style={{ color: '#27ae60', textShadow: '3px 3px 0px rgba(39, 174, 96, 0.2)', mixBlendMode: 'multiply' }}>My</span>
          <span className="inline-block text-crayon-red" style={{ color: '#e65a5a', textShadow: '3px 3px 0px rgba(230, 90, 90, 0.2)', mixBlendMode: 'multiply' }}>WishList</span>
        </h1>

        {/* INPUT */}
        <div className="relative mb-8 mx-auto w-full md:max-w-xl filter drop-shadow-xl rotate-1 group z-50 px-2 md:px-0 transition-all">
          <div className="bg-yellow-200 p-4 md:p-6 pb-6 md:pb-8 relative" style={{ clipPath: 'polygon(2% 0%, 5% 2%, 8% 0%, 12% 2%, 18% 0%, 25% 3%, 35% 0%, 45% 2%, 55% 0%, 65% 3%, 75% 0%, 85% 2%, 92% 0%, 100% 3%, 100% 97%, 95% 100%, 90% 98%, 85% 100%, 75% 97%, 65% 100%, 55% 98%, 45% 100%, 35% 97%, 25% 100%, 15% 97%, 5% 100%, 0% 97%)', backgroundImage: 'repeating-linear-gradient(transparent, transparent 1.9rem, #94a3b8 1.9rem, #94a3b8 2rem)', backgroundAttachment: 'local' }}>
            <h2 className="text-lg md:text-2xl mb-2 md:mb-4 font-title text-slate-700 opacity-90 text-center md:text-left">Paste a link to cut it out:</h2>
            <div className="flex flex-col md:flex-row gap-2 items-stretch">
              <input type="text" placeholder="Paste link... (we'll try! if not, add manually)" className="flex-1 p-2 bg-white/50 border-b-2 border-slate-400 outline-none font-body text-base md:text-xl placeholder:text-slate-400 focus:bg-white/80 transition-colors rounded-sm placeholder:text-base" value={url} onChange={(e) => setUrl(e.target.value)} />
              <div className="flex gap-2 h-10 md:h-auto">
                <button onClick={handleScrape} disabled={loading} className="flex-1 md:flex-none bg-green-600/90 text-white px-6 font-bold hover:cursor-pointer hover:bg-green-700/90 disabled:opacity-50 font-title text-base md:text-lg flex items-center justify-center gap-2 transform hover:-rotate-1 transition-transform shadow-sm" style={{ clipPath: 'polygon(5% 0%, 100% 2%, 95% 100%, 0% 98%)' }}>
                  <span>{loading ? '...' : 'Cut It!'}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></svg>
                </button>
                <button onClick={() => setPreview({ title: '', price: '', image_url: '', product_url: url })} className="bg-yellow-400 text-yellow-900 px-3 font-bold hover:bg-yellow-500 shadow-sm font-title text-xl rounded-sm flex items-center hover:cursor-pointer" title="Add manually">+</button>
              </div>
            </div>
            {preview && (
              <div className="relative mt-6 md:mt-8 -mx-2 md:mx-2 filter drop-shadow-md z-10">

                {/* TAPE */}
                <div
                  className="absolute -top-4 left-1/2 w-20 h-6 bg-gray-200/90 -translate-x-1/2 rotate-1 shadow-sm pointer-events-none z-20"
                  style={{ clipPath: 'polygon(5% 0%, 100% 2%, 95% 100%, 0% 98%)' }}
                ></div>

                {/* PAPER */}
                <div
                  className="bg-white p-3 md:p-5 pb-6 relative z-10"
                  style={{ clipPath: 'polygon(1% 0%, 5% 2%, 10% 0%, 15% 2%, 20% 0%, 25% 1%, 30% 0%, 35% 2%, 40% 0%, 45% 1%, 50% 0%, 55% 2%, 60% 0%, 65% 2%, 70% 0%, 75% 2%, 80% 0%, 85% 2%, 90% 0%, 95% 2%, 99% 0%, 100% 5%, 98% 10%, 100% 15%, 98% 20%, 100% 25%, 98% 30%, 100% 35%, 98% 40%, 100% 45%, 98% 50%, 100% 55%, 98% 60%, 100% 65%, 98% 70%, 100% 75%, 98% 80%, 100% 85%, 98% 90%, 100% 95%, 99% 100%, 95% 98%, 90% 100%, 85% 98%, 80% 100%, 75% 98%, 70% 100%, 65% 98%, 60% 100%, 55% 98%, 50% 100%, 45% 98%, 40% 100%, 35% 98%, 30% 100%, 25% 98%, 20% 100%, 15% 98%, 10% 100%, 5% 98%, 1% 100%, 2% 95%, 0% 90%, 2% 85%, 0% 80%, 2% 75%, 0% 70%, 2% 65%, 0% 60%, 2% 55%, 0% 50%, 2% 45%, 0% 40%, 2% 35%, 0% 30%, 2% 25%, 0% 20%, 2% 15%, 0% 10%, 2% 5%)' }}
                >
                  <button onClick={handleCancel} className="absolute top-0 right-0 p-1 text-slate-300 hover:text-red-500 font-title font-bold text-lg transition-colors z-50 hover:cursor-pointer">✕</button>
                  <div className="flex flex-col md:flex-row gap-3 items-start mt-2">
                    <div onClick={triggerFileUpload} className="w-full md:w-20 h-32 md:h-20 shrink-0 bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden shadow-sm rotate-1 cursor-pointer group relative hover:border-blue-400 transition-colors">
                      {preview.image_url ? (<><img src={preview.image_url} alt="Preview" className="w-full h-full object-contain pointer-events-none" /><div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white text-[10px] font-bold bg-black/50 px-1 rounded">CHANGE</span></div></>) : (<div className="flex flex-col items-center justify-center h-full w-full text-slate-400 gap-1 group-hover:text-blue-500"><span className="text-xl font-bold">+</span><span className="text-[9px] font-bold">FOTO</span></div>)}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    <div className="flex-1 w-full space-y-2">
                      <input value={preview.title} onChange={(e) => setPreview({ ...preview, title: e.target.value })} className="w-full bg-transparent border-b border-slate-200 font-title font-bold text-lg md:text-xl text-slate-800 focus:border-blue-500 outline-none placeholder:text-slate-300" placeholder="Product Name" />
                      <input value={preview.price} onChange={(e) => setPreview({ ...preview, price: e.target.value })} className="w-1/2 bg-transparent border-b border-slate-200 text-crayon-red font-title font-bold text-xl md:text-2xl focus:border-blue-500 outline-none placeholder:text-red-200/50" placeholder="Price" style={{ opacity: 0.95, mixBlendMode: 'multiply', textShadow: '0px 0px 1px rgba(230, 90, 90, 1), 1px 1px 0px rgba(230, 90, 90, 0.8)' }} />
                    </div>
                  </div>
                  <div className="mt-4 border-t border-dashed border-slate-200 pt-3">
                    <input value={preview.product_url || ''} onChange={(e) => setPreview({ ...preview, product_url: e.target.value })} className="w-full text-[10px] text-slate-600 bg-slate-50 border border-slate-200 p-1.5 rounded focus:border-blue-500 outline-none mb-2 font-body hover:cursor-pointer" placeholder="Product link (where to buy)..." />
                    <button onClick={handleSave} className="w-full bg-green-600 text-white px-4 py-1.5 rounded shadow-sm hover:bg-green-700 font-title text-lg flex items-center justify-center gap-2 transform hover:rotate-1 transition-transform"><span>Glue It!</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 22V12a6 6 0 0 0-12 0v10" /><path d="M8 22h8" /><path d="M9 6V2" /><path d="M15 6V2" /><path d="M9 2h6" /><path d="M8 6h8" /><path d="M12 15v3" /><circle cx="12" cy="19" r="1" fill="currentColor" /></svg></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* THE CANVAS */}
      <div className="flex-1 relative w-full border-t-4 border-dashed border-black/5 overflow-x-hidden">
        <p className="absolute top-4 left-1/2 -translate-x-1/2 text-slate-400 font-title opacity-50 pointer-events-none text-center text-sm md:text-base w-full px-4 z-0">
          (Drag items anywhere to arrange your board)
        </p>

        <div
          style={{
            width: canvasScale < 1 ? `${BOARD_WIDTH}px` : '100%',
            transform: `scale(${canvasScale})`,
            transformOrigin: 'top left',
          }}
          className="relative min-h-screen pb-40"
        >
          {/* SAFE ZONE CONTAINER */}
          <div
            className="relative mx-auto border-4 border-dashed border-red-300/50 rounded-3xl"
            style={{
              width: `${BOARD_WIDTH}px`,
              minHeight: '100vh',
            }}
          >
            <div className="absolute top-2 right-4 text-red-300/50 font-title uppercase tracking-widest text-sm pointer-events-none">
              Safe Zone
            </div>

            {items.map((item) => (
              <CutoutItem
                key={item.id}
                item={item}
                onDelete={() => handleDelete(item.id)}
                onUpdate={handleItemUpdate}
                onOrderChange={(direction) => handleOrderChange(item.id, direction)}
                canvasScale={canvasScale}
                boardWidth={BOARD_WIDTH}
              />
            ))}
          </div>

          {items.length === 0 && !loading && (
            <p className="absolute top-24 left-1/2 -translate-x-1/2 w-full text-center text-2xl md:text-3xl text-slate-400 -rotate-2 font-title opacity-70 pointer-events-none">
              Your list is empty! Start cutting...
            </p>
          )}
        </div>
      </div>
    </main>
  )
}