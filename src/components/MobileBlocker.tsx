'use client'

import { useState, useEffect } from 'react'

export default function MobileBlocker() {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const checkSize = () => {
      const width = window.innerWidth
      setShowModal(width < 1000)
    }

    checkSize()
    window.addEventListener('resize', checkSize)
    return () => window.removeEventListener('resize', checkSize)
  }, [])

  if (!showModal) return null

  return (
    <div className="fixed inset-0 z-10000 flex items-center justify-center overflow-hidden">

      {/* BLUR OVERLAY */}
      <div className="absolute inset-0 bg-paper/60 backdrop-blur-md z-10" />

      {/* WRAPPER */}
      <div className="relative z-50 w-[90%] max-w-sm transform rotate-1">

        {/* TAPE */}
        <div
          className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-yellow-200/90 shadow-sm rotate-2 z-20 pointer-events-none"
          style={{ clipPath: 'polygon(5% 0%, 100% 2%, 95% 100%, 0% 98%)' }}
        ></div>

        {/* THE MODAL */}
        <div
          className="relative bg-white p-6 md:p-8 shadow-2xl z-10"
          style={{
            clipPath: 'polygon(2% 0%, 5% 2%, 8% 0%, 12% 2%, 18% 0%, 25% 3%, 35% 0%, 45% 2%, 55% 0%, 65% 3%, 75% 0%, 85% 2%, 92% 0%, 100% 3%, 100% 97%, 95% 100%, 90% 98%, 85% 100%, 75% 97%, 65% 100%, 55% 98%, 45% 100%, 35% 97%, 25% 100%, 15% 97%, 5% 100%, 0% 97%)'
          }}
        >
          <div className="text-center space-y-4 pt-4">
            <h2 className="text-3xl font-title font-bold text-slate-800">
              <span className="text-crayon-red">Desktop</span> Required
            </h2>

            <p className="font-body text-lg text-slate-600 leading-relaxed">
              The scissors are too big for your phone! ✂️
              <br /><br />
              To create a WishList, please open this page on your computer.
            </p>

            <div className="text-slate-400 text-sm font-title mt-4 opacity-70">
              (If you have a shared link, you can still view it on mobile!)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}