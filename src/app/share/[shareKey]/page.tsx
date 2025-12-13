'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import CutoutItem from '@/src/components/CutoutItem'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function SharePage() {
  const supabase = createClient()
  const params = useParams()

  const [items, setItems] = useState<any[]>([])
  const [canvasScale, setCanvasScale] = useState(1)
  const [loading, setLoading] = useState(true)
  const [offsetX, setOffsetX] = useState(0)

  useEffect(() => {
    async function loadSharedList() {
      if (!params || !params.shareKey) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('share_key', params.shareKey)
        .single();

      if (error || !profile) {
        setLoading(false);
        return;
      }

      fetchItems(profile.id);
    }

    loadSharedList();

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
  }, [params])

  // --- Center & Nudge Left Logic ---
  // useEffect(() => {
  //   if (items.length === 0) return;
  //   const CARD_WIDTH_APPROX = 280;
  //   const xPositions = items.map(item => item.x || 0);
  //   const minX = Math.min(...xPositions);
  //   const maxX = Math.max(...xPositions);
  //   const contentCenter = (minX + (maxX + CARD_WIDTH_APPROX)) / 2;

  //   const targetCenter = 480;

  //   setOffsetX(targetCenter - contentCenter);
  // }, [items]);

  const fetchItems = async (realUserId: string) => {
    setLoading(true)
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', realUserId)
      .order('created_at', { ascending: false })

    if (data) setItems(data)
    setLoading(false)
  }

  const isMobile = canvasScale < 1;


  console.log(items, "from shared")

  return (
    <main className="w-full min-h-screen relative overflow-x-hidden pt-12 px-2 md:px-0 flex flex-col bg-transparent">
      <div className="crayon-frame fixed inset-0 pointer-events-none z-[100]" />

      <div className="flex-none z-50 mb-8">
        <h1 className="text-5xl md:text-7xl font-bold text-center font-title transform -rotate-2 tracking-wide leading-tight px-4">
          <span className="inline-block mr-2 md:mr-4 text-crayon-green" style={{ color: '#27ae60', textShadow: '3px 3px 0px rgba(39, 174, 96, 0.2)', mixBlendMode: 'multiply' }}>My</span>
          <span className="inline-block text-crayon-red" style={{ color: '#e65a5a', textShadow: '3px 3px 0px rgba(230, 90, 90, 0.2)', mixBlendMode: 'multiply' }}>WishList</span>
        </h1>
        <p className="text-center text-slate-400 font-title opacity-60 mt-2 rotate-1">
          Check out this collection!
        </p>
      </div>

      <div className="flex-1 relative w-full md:w-300 mx-auto">
        <div
          style={{
            width: isMobile ? '1000px' : '100%',
            transform: `scale(${canvasScale})`,
            transformOrigin: 'top left',
          }}
          className="relative pb-40"
        >
          <div style={{ transform: isMobile ? `translateX(${offsetX}px)` : 'none', transition: 'transform 0.3s ease-out' }}>
            {items.map((item) => (
              <CutoutItem
                key={item.id}
                item={item}
                canvasScale={canvasScale}
                readOnly={true}
              />
            ))}
          </div>

          {items.length === 0 && !loading && (
            <div className="absolute top-20 w-full text-center text-slate-400 font-title text-2xl rotate-1">
              List not found (or empty) 👻
            </div>
          )}
        </div>
      </div>

      {/* --- 2. NEW VISITOR CTA (Bottom Right, Small, Green Button) --- */}
      <div className="fixed bottom-6 right-4 z-900 pointer-events-none">
        {/* New relative wrapper for the whole CTA block */}
        <div className="relative pointer-events-auto">

          {/* Yellow Tape - Placed first to be the lowest layer conceptually, but we'll use z-index to bring it forward */}
          {/* Note: I'm keeping the z-50 here to ensure it's above the paper content inside the clipped box */}
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-yellow-200/90 shadow-sm rotate-1 z-50"
            style={{ clipPath: 'polygon(5% 0%, 100% 2%, 95% 100%, 0% 98%)' }}
          ></div>

          {/* Paper Content - Now inside its own styled container */}
          <div
            className="bg-white p-3 shadow-xl border border-slate-200 transform -rotate-2 w-40 relative group transition-transform hover:-translate-y-1 hover:rotate-0"
            style={{ clipPath: 'polygon(2% 0%, 98% 1%, 100% 98%, 1% 100%)' }}
          >
            <div className="text-center mt-1 relative">
              <p className="font-title text-slate-500 text-xs mb-2 leading-tight">Want one too?</p>
              <Link
                href="/"
                className="block w-full bg-green-600 text-white font-bold font-title text-xs py-1.5 rounded-sm shadow-sm hover:bg-green-700 transition-colors"
              >
                Create Free ➜
              </Link>
            </div>
          </div>
        </div>
      </div>

    </main>
  )
}