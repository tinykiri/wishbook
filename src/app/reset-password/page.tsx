'use client'

import { useState } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleUpdatePassword = async () => {
    if (!password) return alert("Please enter a new password")
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      alert("Error: " + error.message)
      setLoading(false)
    } else {
      alert("Password updated successfully! 🎉")
      router.push('/')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 pt-20">
      <div className="bg-white p-8 shadow-2xl border-2 border-slate-100 max-w-sm w-full">
        <h1 className="text-3xl font-bold text-center mb-6">New Secret 🤫</h1>
        <input
          className="w-full bg-slate-50 border-b-2 border-slate-300 p-3 mb-4"
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleUpdatePassword}
          disabled={loading}
          className="w-full bg-green-600 text-white p-3 font-bold"
        >
          {loading ? 'Saving...' : 'Save Password'}
        </button>
        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-slate-400 hover:underline">← Back to Login</Link>
        </div>
      </div>
    </div>
  )
}