'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Influencer } from '@/types';
import { ArrowRight, Download } from 'lucide-react';

interface ActivityItem {
  id: string;
  influencer_name: string;
  action: string;
  created_at: string;
}

function getPipelineStage(inf: Influencer): string {
  if (inf.payment_status === 'Done') return 'Complete';
  if (inf.video_status === 'Approved') return 'Pay Creator';
  if (inf.video_status === 'Sent') return 'Video Review';
  if ((inf as any).dispatch_status === 'Delivered') return 'Awaiting Video';
  if ((inf as any).dispatch_status === 'Dispatched') return 'In Transit';
  if (inf.agreement_status === 'Accepted') return 'Ready to Ship';
  return 'Agreement';
}

const STAGES = ['Agreement', 'Ready to Ship', 'In Transit', 'Awaiting Video', 'Video Review', 'Pay Creator', 'Complete'];

export default function Dashboard() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [infRes, actRes] = await Promise.all([
      fetch('/api/influencers'),
      fetch('/api/activity'),
    ]);
    const infData = await infRes.json();
    const actData = await actRes.json();
    setInfluencers(Array.isArray(infData) ? infData : []);
    setActivity(Array.isArray(actData) ? actData : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = {
    total: influencers.length,
    signed: influencers.filter(i => i.agreement_status === 'Accepted').length,
    awaitingSig: influencers.filter(i => ['Pending', 'Sent'].includes(i.agreement_status)).length,
    pendingPayment: influencers.filter(i => i.video_status === 'Approved' && i.payment_status === 'Pending').length,
    videosToReview: influencers.filter(i => i.video_status === 'Sent').length,
  };

  const stageCounts = Object.fromEntries(STAGES.map(s => [s, influencers.filter(i => getPipelineStage(i) === s).length]));
  const maxStageCount = Math.max(...Object.values(stageCounts), 1);

  // Needs action items
  const needsAction = influencers
    .filter(i => {
      const stage = getPipelineStage(i);
      return ['Agreement', 'Ready to Ship', 'Video Review', 'Pay Creator'].includes(stage);
    })
    .slice(0, 5)
    .map(i => {
      const stage = getPipelineStage(i);
      const action =
        stage === 'Agreement' ? (i.agreement_status === 'Sent' ? 'Edit or resend agreement' : 'Send agreement') :
        stage === 'Ready to Ship' ? 'Ship product' :
        stage === 'Video Review' ? 'Review video' : 'Pay creator';
      return { ...i, action };
    });

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

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {[
          { label: 'TOTAL CREATORS', value: stats.total, sub: 'AM Army roster' },
          { label: 'AGREEMENTS SIGNED', value: stats.signed, sub: 'Ready for fulfillment', gold: true },
          { label: 'AWAITING SIGNATURE', value: stats.awaitingSig, sub: 'Follow up needed' },
          { label: 'PENDING PAYMENT', value: stats.pendingPayment, sub: 'After video goes live', gold: true },
          { label: 'VIDEOS TO REVIEW', value: stats.videosToReview, sub: 'Approval queue' },
        ].map(({ label, value, sub, gold }) => (
          <div key={label} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5">
            <p className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase mb-3">{label}</p>
            <p className={`text-4xl font-light mb-1 ${gold ? 'text-[#c9a84c]' : 'text-white'}`}>{loading ? '—' : value}</p>
            <p className="text-xs text-gray-600">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Needs Action */}
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6">
          <p className="text-xs font-semibold text-[#c9a84c] tracking-widest uppercase mb-4">Needs Action</p>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />)}</div>
          ) : needsAction.length === 0 ? (
            <p className="text-gray-600 text-sm">All caught up! ✓</p>
          ) : (
            <div className="space-y-3">
              {needsAction.map(inf => (
                <div key={inf.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-white text-sm font-medium">{inf.full_name}</span>
                    <span className="text-gray-500 text-sm"> — {(inf as any).action}</span>
                  </div>
                  <Link href="/creators" className="text-xs border border-white/20 text-gray-400 hover:text-white hover:border-white/40 px-3 py-1 rounded-lg transition-colors">
                    Go
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pipeline Snapshot */}
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6">
          <p className="text-xs font-semibold text-[#c9a84c] tracking-widest uppercase mb-4">Pipeline Snapshot</p>
          <div className="space-y-3">
            {STAGES.map(stage => (
              <div key={stage} className="flex items-center gap-3">
                <p className="text-sm text-gray-400 w-32 flex-shrink-0">{stage}</p>
                <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-[#c9a84c] rounded-full transition-all"
                    style={{ width: `${(stageCounts[stage] / maxStageCount) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 w-4 text-right">{stageCounts[stage]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-[#c9a84c] tracking-widest uppercase">Recent Activity</p>
          <Link href="/creators" className="text-xs text-gray-500 hover:text-[#c9a84c] transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {activity.length === 0 ? (
          <p className="text-gray-600 text-sm">No activity yet. Start by adding creators!</p>
        ) : (
          <div className="divide-y divide-white/5">
            {activity.slice(0, 8).map(item => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <p className="text-sm text-gray-300">
                  <span className="text-white font-medium">{item.influencer_name}</span>
                  {' — '}{item.action}
                </p>
                <p className="text-xs text-gray-600">
                  {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
