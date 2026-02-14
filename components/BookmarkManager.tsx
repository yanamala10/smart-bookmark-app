'use client';
import { useEffect, useState } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Trash2, ExternalLink, Plus } from 'lucide-react';

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

  useEffect(() => {
    const fetchBookmarks = async () => {
      const { data } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false });
      setBookmarks(data || []);
    };

    fetchBookmarks();

    const channel = supabase
      .channel('realtime-bookmarks')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookmarks', filter: `user_id=eq.${userId}` }, 
        () => fetchBookmarks()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, supabase]);

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    await supabase.from('bookmarks').insert([{ title, url: cleanUrl, user_id: userId }]);
    setTitle(''); setUrl('');
  };

  const deleteBookmark = async (id: string) => {
    await supabase.from('bookmarks').delete().eq('id', id);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={addBookmark} className="bg-white p-4 rounded-xl shadow-sm border flex gap-3">
        <input placeholder="Title" className="flex-1 border p-2 rounded text-black" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="URL" className="flex-1 border p-2 rounded text-black" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} /> Add
        </button>
      </form>

      <div className="grid gap-3">
        {bookmarks.map((bm) => (
          <div key={bm.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center group">
            <div className="overflow-hidden">
              <h3 className="font-bold text-gray-800 truncate">{bm.title}</h3>
              <a href={bm.url} target="_blank" className="text-blue-500 text-sm flex items-center gap-1 hover:underline truncate">
                {bm.url} <ExternalLink size={12} />
              </a>
            </div>
            <button onClick={() => deleteBookmark(bm.id)} className="text-gray-400 hover:text-red-500 p-2">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}