'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import CutoutItem from '@/src/components/CutoutItem'

export default function SharePage() {
  const supabase = createClient()
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

  return (
    // FIX: bg-transparent to let body background show
    <main className="w-full h-screen min-h-screen relative overflow-x-hidden overflow-y-auto pt-12 px-2 md:px-0 flex flex-col bg-transparent">

      {/* 1. THE CRAYON FRAME (Essential for design) */}
      <div className="crayon-frame fixed inset-0 pointer-events-none z-[100]" />

      {/* HEADER */}
      <div className="flex-none z-50 mb-8">
        <h1 className="text-5xl md:text-7xl font-bold text-center font-title transform -rotate-2 tracking-wide leading-tight px-4">
          <span className="inline-block mr-2 md:mr-4 text-crayon-green" style={{ color: '#27ae60', textShadow: '3px 3px 0px rgba(39, 174, 96, 0.2)', mixBlendMode: 'multiply' }}>Anastasia's</span>
          <span className="inline-block text-crayon-red" style={{ color: '#e65a5a', textShadow: '3px 3px 0px rgba(230, 90, 90, 0.2)', mixBlendMode: 'multiply' }}>WishList</span>
        </h1>
        <p className="text-center text-slate-400 font-title opacity-60 mt-2 rotate-1">
          (Click items to view them in the shop!)
        </p>
      </div>

      {/* THE BOARD (Read Only) */}
      <div className="flex-1 relative w-full border-t-4 border-dashed border-black/5">
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
              canvasScale={canvasScale}
              readOnly={true}
            />
          ))}
        </div>
      </div>
    </main>
  )
}