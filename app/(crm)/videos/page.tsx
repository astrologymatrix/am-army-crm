'use client';

import { useEffect, useState, useCallback } from 'react';
import { Influencer } from '@/types';
import { ExternalLink, Search } from 'lucide-react';

export default function VideosPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/influencers');
    const data = await res.json();
    setInfluencers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const videos = influencers
    .filter(i => i.video_url)
    .filter(i => {
      const q = search.toLowerCase();
      if (q && !i.full_name.toLowerCase().includes(q) && !i.instagram_handle.toLowerCase().includes(q)) return false;
      if (from && i.video_posted_at && i.video_posted_at < from) return false;
      if (to && i.video_posted_at && i.video_posted_at > to) return false;
      return true;
    })
    .sort((a, b) => {
      if (!a.video_posted_at && !b.video_posted_at) return 0;
      if (!a.video_posted_at) return 1;
      if (!b.video_posted_at) return -1;
      return new Date(b.video_posted_at).getTime() - new Date(a.video_posted_at).getTime();
    });


  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide uppercase">Live Videos</h1>
          <p className="text-gray-500 text-sm italic mt-0.5">All posted reels and videos from your creators</p>
        </div>
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl px-5 py-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Total Videos</p>
          <p className="text-2xl font-light text-[#c9a84c]">{loading ? '—' : videos.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search creator or handle..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c9a84c]/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">From</span>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#c9a84c]/50" />
          <span className="text-xs text-gray-500">To</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#c9a84c]/50" />
          {(from || to) && (
            <button onClick={() => { setFrom(''); setTo(''); }}
              className="text-xs text-gray-500 hover:text-red-400 px-2 py-1 rounded transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <p className="text-4xl mb-3">🎬</p>
            <p>{search || from || to ? 'No videos match your filters.' : 'No videos posted yet. Add a video URL from a creator\'s Edit form.'}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {videos.map((inf, idx) => (
              <div key={inf.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors">
                {/* Index */}
                <span className="text-gray-700 text-xs w-5 flex-shrink-0">{idx + 1}</span>

                {/* Creator */}
                <div className="w-40 flex-shrink-0">
                  <p className="text-white text-sm font-semibold">{inf.full_name}</p>
                  <a href={`https://instagram.com/${inf.instagram_handle.replace('@', '')}`}
                    target="_blank" rel="noreferrer"
                    className="text-[#c9a84c] text-xs hover:underline">
                    @{inf.instagram_handle}
                  </a>
                </div>

                {/* Product */}
                <div className="w-28 flex-shrink-0">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${inf.product_assigned === 'Rose Quartz Bracelet' ? 'bg-pink-900/30 text-pink-400 border-pink-800/30' : 'bg-amber-900/30 text-amber-400 border-amber-800/30'}`}>
                    {inf.product_assigned === 'Rose Quartz Bracelet' ? 'Rose Quartz' : 'Pyrite Anklet'}
                  </span>
                </div>

                {/* Date */}
                <div className="w-28 flex-shrink-0">
                  {inf.video_posted_at ? (
                    <p className="text-gray-400 text-xs">
                      {new Date(inf.video_posted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  ) : (
                    <p className="text-gray-700 text-xs">No date</p>
                  )}
                </div>

                {/* Video link */}
                <div className="flex-1 min-w-0">
                  <a href={inf.video_url!} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-[#c9a84c] hover:text-[#b8963e] text-sm font-medium group">
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate group-hover:underline">{inf.video_url}</span>
                  </a>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
