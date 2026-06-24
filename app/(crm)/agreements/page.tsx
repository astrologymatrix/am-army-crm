'use client';

import { useEffect, useState, useCallback } from 'react';
import { Influencer } from '@/types';
import AgreementEditModal from '@/components/AgreementEditModal';
import { Plus } from 'lucide-react';
import Link from 'next/link';

function Badge({ value }: { value: string }) {
  const map: Record<string, string> = {
    Accepted: 'bg-green-900/40 text-green-400 border-green-800/40',
    Sent: 'bg-blue-900/40 text-blue-400 border-blue-800/40',
    Pending: 'bg-orange-900/40 text-orange-400 border-orange-800/40',
  };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${map[value] ?? 'bg-gray-800/40 text-gray-400 border-gray-700'}`}>{value}</span>;
}

export default function AgreementsPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Influencer | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/influencers');
    const data = await res.json();
    setInfluencers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const sent = influencers.filter(i => i.agreement_status !== 'Pending');

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide uppercase">Agreements</h1>
          <p className="text-gray-500 text-sm italic mt-0.5">Edit, save & send per-creator collaboration agreements</p>
        </div>
        <Link href="/creators" className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#b8963e] text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus className="w-4 h-4" /> Add Creator
        </Link>
      </div>

      {/* Creator agreements */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl mb-6">
        <div className="p-6 border-b border-white/5">
          <p className="text-xs font-semibold text-[#c9a84c] tracking-widest uppercase">Creator Agreements</p>
          <p className="text-sm text-gray-500 mt-1">Each creator has a pre-filled, editable agreement ready to send for signature.</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Creator', 'Email', 'Product', 'Payment', 'Agreement', 'Last Saved', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {influencers.map(inf => (
                <tr key={inf.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-white font-semibold">{inf.full_name}</p>
                    <p className="text-gray-600 text-xs">@{inf.instagram_handle}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-400">{inf.email}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${inf.product_assigned === 'Rose Quartz Bracelet' ? 'bg-pink-900/30 text-pink-400 border-pink-800/30' : 'bg-amber-900/30 text-amber-400 border-amber-800/30'}`}>
                      {inf.product_assigned}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-300">₹{inf.payment_amount?.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-4"><Badge value={inf.agreement_status} /></td>
                  <td className="px-5 py-4 text-gray-600 text-xs">Auto-generated</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditTarget(inf)} className="text-xs border border-[#c9a84c]/40 text-[#c9a84c] px-3 py-1.5 rounded-lg hover:bg-[#c9a84c]/10 transition-colors font-medium">
                        Edit
                      </button>
                      <button onClick={() => setEditTarget(inf)} className="text-xs border border-white/10 text-gray-400 px-3 py-1.5 rounded-lg hover:border-white/20 hover:text-white transition-colors">
                        Preview
                      </button>
                      <button onClick={() => setEditTarget(inf)} className="text-xs border border-white/10 text-gray-400 px-3 py-1.5 rounded-lg hover:border-white/20 hover:text-white transition-colors">
                        Send
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Sent agreements */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl">
        <div className="p-6 border-b border-white/5">
          <p className="text-xs font-semibold text-[#c9a84c] tracking-widest uppercase">Sent Agreements</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Date', 'Creator', 'Product', 'Payment', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sent.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-600 text-sm">No agreements sent yet</td></tr>
            ) : sent.map(inf => (
              <tr key={inf.id} className="hover:bg-white/2 transition-colors">
                <td className="px-5 py-4 text-gray-500 text-xs">
                  {inf.agreement_sent_at ? new Date(inf.agreement_sent_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td className="px-5 py-4">
                  <p className="text-white font-semibold">{inf.full_name}</p>
                  <p className="text-gray-600 text-xs">@{inf.instagram_handle}</p>
                </td>
                <td className="px-5 py-4 text-gray-400">{inf.product_assigned}</td>
                <td className="px-5 py-4 text-gray-300">₹{inf.payment_amount?.toLocaleString('en-IN')}</td>
                <td className="px-5 py-4"><Badge value={inf.agreement_status} /></td>
                <td className="px-5 py-4">
                  <button onClick={() => setEditTarget(inf)} className="text-xs border border-white/10 text-gray-400 px-3 py-1.5 rounded-lg hover:text-[#c9a84c] hover:border-[#c9a84c]/30 transition-colors">
                    Resend
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editTarget && (
        <AgreementEditModal
          influencer={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={() => { load(); setEditTarget(null); }}
        />
      )}
    </div>
  );
}
