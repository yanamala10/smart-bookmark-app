'use client'

import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const supabase = createClient()

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-xl shadow-lg border">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Smart Bookmark App
        </h1>

        <button 
          onClick={signInWithGoogle}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition"
        >
          Continue with Google
        </button>
      </div>
    </div>
  )
}
