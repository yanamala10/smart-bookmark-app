'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Trash2, ExternalLink, Plus, Loader2 } from 'lucide-react';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  user_id: string;
  created_at: string;
}

export default function BookmarkManager({ userId }: { userId: string }) {
  const supabase = createClient();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchBookmarks = useCallback(async () => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (!error) setBookmarks(data || []);
  }, [userId, supabase]);

  useEffect(() => {
    fetchBookmarks();

    // Real-time subscription for instant updates across devices
    const channel = supabase
      .channel('realtime-bookmarks')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookmarks', filter: `user_id=eq.${userId}` }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newBm = payload.new as Bookmark;
            setBookmarks((prev) => [newBm, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((prev) => prev.filter(bm => bm.id !== payload.old.id));
          } else {
            fetchBookmarks(); // Fallback for updates
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, supabase, fetchBookmarks]);

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;
    
    setIsSubmitting(true);
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;

    const { data, error } = await supabase
      .from('bookmarks')
      .insert([{ title, url: cleanUrl, user_id: userId }])
      .select()
      .single();

    if (!error && data) {
      // Update state locally so it shows immediately
      setBookmarks((prev) => [data, ...prev]);
      setTitle(''); 
      setUrl('');
    }
    setIsSubmitting(false);
  };

  const deleteBookmark = async (id: string) => {
    // Optimistic Delete: Remove from UI first for speed
    const previousBookmarks = [...bookmarks];
    setBookmarks((prev) => prev.filter((bm) => bm.id !== id));

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id);

    if (error) {
      // Rollback if database delete fails
      setBookmarks(previousBookmarks);
      console.error('Delete failed:', error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Bookmark Form */}
      <form onSubmit={addBookmark} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input 
            placeholder="Website Name (e.g. Google)" 
            className="w-full border border-gray-200 p-3 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none transition" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </div>
        <div className="flex-1">
          <input 
            placeholder="URL (e.g. google.com)" 
            className="w-full border border-gray-200 p-3 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none transition" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
          />
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition flex items-center justify-center gap-2 font-bold"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
          Add
        </button>
      </form>

      {/* Bookmark List */}
      <div className="grid gap-4">
        {bookmarks.length === 0 ? (
          <p className="text-center text-gray-500 py-10 bg-white rounded-xl border border-dashed">No bookmarks yet. Add your first one above!</p>
        ) : (
          bookmarks.map((bm) => (
            <div key={bm.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition group">
              <div className="overflow-hidden">
                <h3 className="font-bold text-gray-900 text-lg truncate">{bm.title}</h3>
                <a 
                  href={bm.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm flex items-center gap-1 hover:underline truncate"
                >
                  {bm.url} <ExternalLink size={14} />
                </a>
              </div>
              <button 
                onClick={() => deleteBookmark(bm.id)} 
                className="text-gray-300 hover:text-red-600 p-3 hover:bg-red-50 rounded-full transition"
                title="Delete Bookmark"
              >
                <Trash2 size={22} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}