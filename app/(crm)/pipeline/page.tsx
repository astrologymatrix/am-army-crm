'use client';

import { useEffect, useState, useCallback } from 'react';
import { Influencer } from '@/types';

function getPipelineStage(inf: Influencer): string {
  if (inf.payment_status === 'Paid') return 'Complete';
  if (inf.video_status === 'Approved') return 'Pay Creator';
  if (inf.video_status === 'Sent') return 'Video Review';
  if ((inf as any).dispatch_status === 'Delivered') return 'Awaiting Video';
  if ((inf as any).dispatch_status === 'Dispatched') return 'In Transit';
  if (inf.agreement_status === 'Accepted') return 'Ready to Ship';
  return 'Agreement';
}

const STAGES = [
  { key: 'Agreement', color: 'border-orange-500/30 bg-orange-500/5' },
  { key: 'Ready to Ship', color: 'border-blue-500/30 bg-blue-500/5' },
  { key: 'In Transit', color: 'border-purple-500/30 bg-purple-500/5' },
  { key: 'Awaiting Video', color: 'border-yellow-500/30 bg-yellow-500/5' },
  { key: 'Video Review', color: 'border-pink-500/30 bg-pink-500/5' },
  { key: 'Pay Creator', color: 'border-[#c9a84c]/30 bg-[#c9a84c]/5' },
  { key: 'Complete', color: 'border-green-500/30 bg-green-500/5' },
];

export default function PipelinePage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch('/api/influencers');
    const data = await res.json();
    setInfluencers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const byStage = Object.fromEntries(
    STAGES.map(s => [s.key, influencers.filter(i => getPipelineStage(i) === s.key)])
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-wide uppercase">Pipeline</h1>
        <p className="text-gray-500 text-sm italic mt-0.5">Track each creator through the collaboration journey</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 auto-rows-min">
          {STAGES.map(({ key, color }) => (
            <div key={key} className={`rounded-xl border ${color} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{key}</p>
                <span className="text-xs font-bold text-[#c9a84c] bg-[#c9a84c]/10 rounded-full px-2 py-0.5">
                  {byStage[key]?.length ?? 0}
                </span>
              </div>
              <div className="space-y-2 min-h-16">
                {(byStage[key] ?? []).map(inf => (
                  <div key={inf.id} className="bg-[#1a1a1a] border border-white/5 rounded-lg p-3 hover:border-[#c9a84c]/20 transition-colors">
                    <p className="text-white text-sm font-semibold">{inf.full_name}</p>
                    <p className="text-gray-600 text-xs mt-0.5">@{inf.instagram_handle} · {inf.product_assigned === 'Rose Quartz Bracelet' ? 'Rose Quartz' : 'Pyrite Anklet'}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
