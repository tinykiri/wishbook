'use client'

import { createClient } from '@/src/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async () => {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else if (data.session) {
      router.push('/')
      router.refresh()
    } else {
      alert('Check your email for the confirmation link!')
    }
    setLoading(false)
  }

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      alert(error.message)
    } else {
      router.push('/') // Go to home page
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm border-2 border-dashed border-gray-300 bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">WishList Login</h1>

        <input
          className="mb-4 w-full border-b-2 border-gray-300 bg-gray-50 p-3 outline-none focus:border-blue-400"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="mb-6 w-full border-b-2 border-gray-300 bg-gray-50 p-3 outline-none focus:border-blue-400"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex gap-4">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="flex-1 bg-blue-600 p-3 font-bold text-white hover:bg-blue-700"
          >
            {loading ? '...' : 'Log In'}
          </button>

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="flex-1 bg-gray-100 p-3 font-bold text-gray-800 hover:bg-gray-200"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )
}