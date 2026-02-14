import { Suspense } from 'react';
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BookmarkManager from "@/components/BookmarkManager";
import { LogOut, User } from "lucide-react";

// 1. Create a child component to handle the dynamic data fetching
async function DashboardShell() {
  const supabase = await createClient();
  // Securely get the user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <>
      <header className="flex justify-between items-center mb-10 bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full text-blue-600">
            <User size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium text-black">Logged in as</p>
            <p className="text-sm font-bold text-gray-800">{user.email}</p>
          </div>
        </div>

        <form action="/auth/signout" method="post">
          <button 
            type="submit"
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition font-semibold text-sm"
          >
            <LogOut size={18} />
            Logout
          </button>
        </form>
      </header>

      <main>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Bookmarks</h2>
        <BookmarkManager userId={user.id} />
      </main>
    </>
  );
}

// 2. The main page component handles the Suspense boundary
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<div className="text-black">Loading your secure dashboard...</div>}>
          <DashboardShell />
        </Suspense>
      </div>
    </div>
  );
}