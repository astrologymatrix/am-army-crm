'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Influencer } from '@/types';
import InfluencerDetailModal from '@/components/InfluencerDetailModal';

export default function CreatorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [inf, setInf] = useState<Influencer | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/influencers/${id}`);
    const d = await res.json();
    if (d.error) setNotFound(true);
    else setInf(d);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !inf) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-400 text-sm">
        Creator not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="bg-[#1a1a1a] px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/30 flex items-center justify-center">
            <span className="text-[10px] font-bold text-[#c9a84c]">AM</span>
          </div>
          <span className="text-gray-400 text-sm">Astrology Matrix · Creator Profile</span>
        </div>
        <span className="text-gray-600 text-xs">AM Army CRM</span>
      </div>

      <InfluencerDetailModal
        influencer={inf}
        onClose={() => {}}
        onUpdated={load}
        defaultTab="view"
        fullPage
      />
    </div>
  );
}
