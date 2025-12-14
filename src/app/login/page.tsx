'use client'

import { createClient } from '@/src/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CutoutItem from '@/src/components/CutoutItem'
import AboutModal from '@/src/components/AboutModal'

// Images
import ikeaImg from '@/src/public/images/ikea.webp'
import dysonImg from '@/src/public/images/dyson.webp'
import medicubeImg from '@/src/public/images/medicube.webp'
import winrarImg from '@/src/public/images/winrar.webp'
import replicaImg from '@/src/public/images/replica.webp'
import tinyKiriImg from '@/src/public/images/tinykiri.webp'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAbout, setShowAbout] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const previewItems = [
    {
      id: 'preview-bear',
      title: 'DJUNGELSKOG Bear',
      price: '$39.99',
      image_url: ikeaImg.src,
      product_url: 'https://www.ikea.com/ca/en/p/djungelskog-soft-toy-brown-bear-00402832/',
      rotation: -6,
      scale: 0.85,
      seed: 789,
      x: 0, y: 0,
      color: '#afd1de'
    },
    {
      id: 'preview-dyson',
      title: 'Dyson Airwrap i.d.™',
      price: '$799',
      image_url: dysonImg.src,
      product_url: 'https://www.dysoncanada.ca/en/hair-care/hair-stylers/airwrap-id/curly-coily-amber-silk',
      rotation: 3,
      scale: 0.55,
      seed: 456,
      x: 0, y: 0,
      color: '#ccdec8'
    },
    {
      id: 'preview-medicube',
      title: 'Age-R Booster Pro',
      price: '$420',
      image_url: medicubeImg.src,
      product_url: 'https://www.stylevana.com/en_CA/medicube-age-r-booster-pro-pink-edition-154g65071.html',
      rotation: 8,
      scale: 0.65,
      seed: 123,
      x: 0, y: 0,
      color: '#def18a'
    },
    {
      id: 'preview-winrar',
      title: 'WinRAR ARCHIVE MESSENGER BAG',
      price: '$211',
      image_url: winrarImg.src,
      product_url: 'https://in.tern.et/products/winrar-archive-messenger-bag-prod',
      rotation: -16,
      scale: 0.65,
      seed: 109,
      x: 0, y: 0,
      color: '#deb887'
    },
    {
      id: 'preview-replica',
      title: 'REPLICA Bubble Bath Eau de Toilette',
      price: '$215',
      image_url: replicaImg.src,
      product_url: 'https://www.sephora.com/ca/en/product/maison-margiela-replica-bubble-bath-P466135?skuId=2399764&icid2=products%20grid:p466135:product',
      rotation: 20,
      scale: 0.6,
      seed: 123,
      x: 0, y: 0,
      color: '#c0b9dd'
    }
  ]

  const validateEmail = (emailToTest: string) => {
    const strictEmailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/

    if (!emailToTest || !strictEmailRegex.test(emailToTest)) {
      alert("Please enter a valid email address (e.g. name@domain.com).")
      return false
    }

    if (emailToTest.trim().toLowerCase() === 'test@test.com') {
      alert("Nice try! Please use a real email address.")
      return false
    }

    return true
  }

  const handleSignUp = async () => {
    if (!validateEmail(email)) return

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else if (data.session) { router.push('/'); router.refresh(); }
    else { alert("Check your email to confirm sign up!") }
    setLoading(false)
  }

  const handleLogin = async () => {
    if (!validateEmail(email)) return

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else { router.push('/'); router.refresh(); }
    setLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email address first.")
      return
    }
    if (!validateEmail(email)) return

    setLoading(true)

    // Sends a password reset link to the email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
      alert(error.message)
    } else {
      alert(`If an account exists for ${email}, we have sent a reset link! 📧\n\n(If you don't see it, check your Spam folder or check the spelling).`)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-x-hidden bg-transparent pt-32 md:pt-20 pb-40 md:pb-20">

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />

      {/* THE CRAYON FRAME */}
      <div className="crayon-frame fixed inset-0 pointer-events-none z-100" />

      {/* ABOUT BUTTON */}
      <button
        onClick={() => setShowAbout(true)}
        className="fixed top-8 right-8 w-10 h-10 rounded-full bg-white border-2 border-slate-800 text-slate-800 font-title font-bold text-xl shadow-md hover:bg-yellow-100 hover:scale-110 transition-transform flex items-center justify-center z-200 hover:cursor-pointer"
        title="How to use"
      >
        ?
      </button>

      {/* TITLE */}
      <div className="relative z-30 mb-8 md:mb-12 text-center">
        <h1 className="text-6xl md:text-8xl font-bold font-title leading-tight transform -rotate-3">
          <span className="inline-block mr-3 text-crayon-green" style={{ color: '#27ae60', textShadow: '3px 3px 0px rgba(39, 174, 96, 0.2)', mixBlendMode: 'multiply' }}>My</span>
          <span className="inline-block text-crayon-red" style={{ color: '#e65a5a', textShadow: '3px 3px 0px rgba(230, 90, 90, 0.2)', mixBlendMode: 'multiply' }}>WishList</span>
        </h1>
        <p className="absolute right-0 top-20 -rotate-6">by tiny.kiri</p>
      </div>

      {/* SNEAK PEEK */}
      <div className="relative w-full max-w-lg h-10 md:h-50 -mb-10 z-10 pointer-events-none">
        <div className="absolute md:left-28 left-32 -translate-x-1/2 -top-24 md:-top-24 scale-[0.5] md:scale-100 origin-center pointer-events-auto hover:z-50 transition-all hover:scale-105 duration-200 transform -rotate-2">
          <CutoutItem item={previewItems[2]} readOnly={true} />
        </div>
        <div className="absolute -top-14 -left-4 md:-left-24 md:bottom-64 md:top-auto scale-[0.5] md:scale-100 origin-center pointer-events-auto hover:z-50 transition-all hover:scale-105 duration-200 transform -rotate-6">
          <CutoutItem item={previewItems[0]} readOnly={true} />
        </div>
        <div className="absolute top-80 right-40 md:right-32 md:bottom-16 md:top-auto scale-[0.5] md:scale-100 origin-center pointer-events-auto hover:z-50 transition-all hover:scale-105 duration-200 transform rotate-6">
          <CutoutItem item={previewItems[1]} readOnly={true} />
        </div>
        <div className="absolute -top-20 left-64 md:-top-10 md:left-72 scale-[0.5] md:scale-100 origin-center pointer-events-auto hover:z-50 transition-all hover:scale-105 duration-200 transform -rotate-2">
          <CutoutItem item={previewItems[3]} readOnly={true} />
        </div>
        <div className="absolute top-80 right-80 md:bottom-20 md:top-auto md:-left-32 scale-[0.5] md:scale-100 origin-center pointer-events-auto hover:z-50 transition-all hover:scale-105 duration-200 transform rotate-2">
          <CutoutItem item={previewItems[4]} readOnly={true} />
        </div>
      </div>

      {/* LOGIN FORM */}
      <div className="relative w-full max-w-sm mt-8 md:mt-0 z-20 transform rotate-1 transition-transform hover:rotate-0 scale-90 md:scale-100 origin-center">
        <div
          className="absolute -top-5 left-1/2 -translate-x-1/2 w-32 h-10 bg-white/90 shadow-sm -rotate-2deg z-30"
          style={{ clipPath: 'polygon(5% 0%, 100% 2%, 95% 100%, 0% 98%)' }}
        ></div>

        <div
          className="bg-yellow-200 p-6 md:p-10 shadow-2xl relative"
          style={{
            clipPath: 'polygon(2% 0%, 5% 2%, 8% 0%, 12% 2%, 18% 0%, 25% 3%, 35% 0%, 45% 2%, 55% 0%, 65% 3%, 75% 0%, 85% 2%, 92% 0%, 100% 3%, 100% 97%, 95% 100%, 90% 98%, 85% 100%, 75% 97%, 65% 100%, 55% 98%, 45% 100%, 35% 97%, 25% 100%, 15% 97%, 5% 100%, 0% 97%)',
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 1.9rem, #94a3b8 1.9rem, #94a3b8 2rem)',
            backgroundAttachment: 'local'
          }}
        >
          <h2 className="mb-6 text-center text-2xl font-bold font-title text-slate-700 opacity-90">
            Login to start cutting
          </h2>

          <div className="space-y-4">
            <input className="w-full bg-white/50 border-b-2 border-slate-400 p-3 outline-none focus:bg-white/80 transition-colors font-body text-lg placeholder:text-slate-400" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="relative">
              <input className="w-full bg-white/50 border-b-2 border-slate-400 p-3 outline-none focus:bg-white/80 transition-colors font-body text-lg placeholder:text-slate-400" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              {/* FORGOT PASSWORD LINK */}
              <button
                onClick={handleForgotPassword}
                className="absolute right-0 -bottom-6 text-xs text-slate-500 font-title hover:text-blue-600 hover:underline transition-colors"
                type="button"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-10 font-title">
            <button onClick={handleLogin} disabled={loading} className="flex-1 bg-green-600/90 hover:cursor-pointer text-white p-3 font-bold text-xl hover:bg-green-700/90 shadow-sm flex items-center justify-center transform hover:scale-105 transition-all" style={{ clipPath: 'polygon(3% 0%, 100% 2%, 97% 100%, 0% 98%)' }}>{loading ? '...' : 'Log In'}</button>
            <button onClick={handleSignUp} disabled={loading} className="flex-1 bg-white/50 hover:cursor-pointer text-slate-700 border-2 border-slate-400 p-3 font-bold text-xl hover:bg-white hover:text-slate-900 transform hover:rotate-1 transition-transform shadow-sm rounded-sm">Sign Up</button>
          </div>

          {/* DESKTOP WARNING */}
          <div className="mt-4 text-center">
            <span className="font-title text-red-500 text-sm font-bold opacity-80 inline-block transform -rotate-2">
              (You can register here, but you'll need a desktop to create!)
            </span>
          </div>
        </div>
      </div>

      {/* CREATOR BADGE */}
      <div className="mt-24 md:mt-12 z-20">
        <div className="bg-[#f8f9fa] border border-slate-200 shadow-md p-3 pr-5 rounded-sm flex items-center gap-4 transform rotate-2 hover:rotate-0 transition-transform duration-200 relative max-w-75">

          {/* Tape */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-blue-200/80 shadow-sm -rotate-2" style={{ clipPath: 'polygon(5% 0%, 100% 2%, 95% 100%, 0% 98%)' }}></div>

          {/* Avatar */}
          <div className="w-14 h-14 shrink-0 transform -rotate-3">
            <img
              src={tinyKiriImg.src}
              alt="Tiny Kiri"
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <span className="font-title text-xs text-slate-400 uppercase tracking-widest">Built By</span>
            <span className="font-title text-lg font-bold text-slate-800 leading-none">tiny.kiri</span>

            <div className="flex gap-3 mt-1.5">
              <Link href="https://www.instagram.com/tiny.kiri?igsh=MW9seXJqeG4yZzY1" target="_blank" className="text-slate-400 hover:text-pink-500 transition-colors text-xs flex items-center gap-1 hover:underline">
                <span>📸 Insta</span>
              </Link>
              <span className="text-slate-300 text-xs">|</span>
              <Link href="https://www.tiktok.com/@tiny_kiri" target="_blank" className="text-slate-400 hover:text-black transition-colors text-xs flex items-center gap-1 hover:underline">
                <span>🎵 TikTok</span>
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}