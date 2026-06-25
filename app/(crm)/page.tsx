'use client';

import { useEffect, useState, useCallback } from 'react';
import { Influencer } from '@/types';
import { Download } from 'lucide-react';

const PIPELINE_STAGES = [
  { key: 'Agreement', color: 'border-orange-500/30 bg-orange-500/5' },
  { key: 'Ready to Ship', color: 'border-blue-500/30 bg-blue-500/5' },
  { key: 'In Transit', color: 'border-purple-500/30 bg-purple-500/5' },
  { key: 'Awaiting Video', color: 'border-yellow-500/30 bg-yellow-500/5' },
  { key: 'Video Review', color: 'border-pink-500/30 bg-pink-500/5' },
  { key: 'Pay Creator', color: 'border-[#c9a84c]/30 bg-[#c9a84c]/5' },
  { key: 'Complete', color: 'border-green-500/30 bg-green-500/5' },
];

function getPipelineStage(inf: Influencer): string {
  if (inf.payment_status === 'Paid') return 'Complete';
  if (inf.video_status === 'Approved') return 'Pay Creator';
  if (inf.video_status === 'Sent') return 'Video Review';
  if ((inf as any).dispatch_status === 'Delivered') return 'Awaiting Video';
  if ((inf as any).dispatch_status === 'Dispatched') return 'In Transit';
  if (inf.agreement_status === 'Accepted') return 'Ready to Ship';
  return 'Agreement';
}

function StatCard({ label, value, sub, gold, loading }: { label: string; value: string | number; sub: string; gold?: boolean; loading: boolean }) {
  return (
    <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5">
      <p className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase mb-3">{label}</p>
      <p className={`text-3xl font-light mb-1 ${gold ? 'text-[#c9a84c]' : 'text-white'}`}>{loading ? '—' : value}</p>
      <p className="text-xs text-gray-600">{sub}</p>
    </div>
  );
}

export default function Dashboard() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch('/api/influencers');
    const data = await res.json();
    setInfluencers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  const stats = {
    total: influencers.length,
    signed: influencers.filter(i => i.agreement_status === 'Accepted').length,
    awaitingSig: influencers.filter(i => ['Pending', 'Sent'].includes(i.agreement_status)).length,
    pendingPayment: influencers.filter(i => i.payment_status === 'Pending').length,
    videosToReview: influencers.filter(i => i.video_status === 'Sent').length,
    liveVideos: influencers.filter(i => i.video_url).length,
    totalPaid: influencers.filter(i => i.payment_status === 'Paid').reduce((s, i) => s + (i.payment_amount || 0), 0),
    totalPending: influencers.filter(i => i.payment_status === 'Pending').reduce((s, i) => s + (i.payment_amount || 0), 0),
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide uppercase">Dashboard</h1>
          <p className="text-gray-500 text-sm italic mt-0.5">AM Army creator collaboration overview</p>
        </div>
        <a href="/api/export" className="flex items-center gap-2 border border-[#c9a84c]/40 text-[#c9a84c] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#c9a84c]/10 transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </a>
      </div>

      {/* Stats row 1 — counts */}
      <div className="grid grid-cols-6 gap-4 mb-4">
        <StatCard label="Total Creators" value={stats.total} sub="AM Army roster" loading={loading} />
        <StatCard label="Agreements Signed" value={stats.signed} sub="Ready for fulfillment" gold loading={loading} />
        <StatCard label="Awaiting Signature" value={stats.awaitingSig} sub="Follow up needed" loading={loading} />
        <StatCard label="Pending Payment" value={stats.pendingPayment} sub="Marked as Pending" gold loading={loading} />
        <StatCard label="Videos to Review" value={stats.videosToReview} sub="Approval queue" loading={loading} />
        <StatCard label="Live Videos" value={stats.liveVideos} sub="Posted by creators" loading={loading} />
      </div>

      {/* Stats row 2 — payment amounts */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#1a1a1a] border border-emerald-500/20 rounded-xl p-5 flex items-center gap-5">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <span className="text-emerald-400 text-lg">✓</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase mb-1">Total Amount Paid</p>
            <p className="text-2xl font-light text-emerald-400">{loading ? '—' : fmt(stats.totalPaid)}</p>
            <p className="text-xs text-gray-600 mt-0.5">{influencers.filter(i => i.payment_status === 'Paid').length} creators paid</p>
          </div>
        </div>
        <div className="bg-[#1a1a1a] border border-orange-500/20 rounded-xl p-5 flex items-center gap-5">
          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
            <span className="text-orange-400 text-lg">⏳</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase mb-1">Total Amount Pending</p>
            <p className="text-2xl font-light text-orange-400">{loading ? '—' : fmt(stats.totalPending)}</p>
            <p className="text-xs text-gray-600 mt-0.5">{stats.pendingPayment} creators pending</p>
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6">
        <p className="text-xs font-semibold text-[#c9a84c] tracking-widest uppercase mb-5">Pipeline Board</p>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {PIPELINE_STAGES.map(({ key, color }) => {
              const cards = influencers.filter(i => getPipelineStage(i) === key);
              return (
                <div key={key} className={`rounded-xl border ${color} p-3 flex flex-col`}>
                  <div className="flex items-center justify-between mb-3 flex-shrink-0">
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{key}</p>
                    <span className="text-xs font-bold text-[#c9a84c] bg-[#c9a84c]/10 rounded-full px-2 py-0.5">
                      {cards.length}
                    </span>
                  </div>
                  <div
                    className="space-y-2 overflow-y-auto pr-0.5"
                    style={{ maxHeight: cards.length > 10 ? '320px' : 'none' }}
                  >
                    {cards.length === 0 ? (
                      <p className="text-gray-700 text-[11px] text-center py-4">—</p>
                    ) : cards.map(inf => (
                      <div key={inf.id} className="bg-[#111111] border border-white/5 rounded-lg p-2.5 hover:border-[#c9a84c]/20 transition-colors">
                        <p className="text-white text-xs font-semibold leading-snug">{inf.full_name}</p>
                        <p className="text-gray-600 text-[10px] mt-0.5">
                          @{inf.instagram_handle} · {inf.product_assigned === 'Rose Quartz Bracelet' ? 'Rose Quartz' : 'Pyrite'}
                        </p>
                      </div>
                    ))}
                  </div>
                  {cards.length > 10 && (
                    <p className="text-[10px] text-gray-700 text-center mt-2 flex-shrink-0">
                      scroll to see all {cards.length}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
