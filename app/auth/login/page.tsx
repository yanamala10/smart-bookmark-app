'use client'

import { createClient } from "@/lib/supabase/client"

// This line is the "magic fix" for Vercel builds. 
// It tells Next.js not to run this code during the build process.
export const dynamic = 'force-dynamic'

export default function LoginPage() {
  // Initialize the client
  const supabase = createClient()

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // This uses the current domain (localhost or vercel.app)
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Error logging in:', error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-xl shadow-lg border text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Smart Bookmark App
        </h1>
        <p className="text-gray-600 mb-8">Please sign in to manage your bookmarks</p>
        
        <button 
          onClick={signInWithGoogle}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Continue with Google
        </button>
      </div>
    </div>
  )
}