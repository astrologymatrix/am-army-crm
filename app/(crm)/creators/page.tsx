'use client';

import { useEffect, useState, useCallback } from 'react';
import { Influencer } from '@/types';
import AddInfluencerModal from '@/components/AddInfluencerModal';
import InfluencerDetailModal from '@/components/InfluencerDetailModal';
import { Plus, Search, Download, ChevronDown } from 'lucide-react';

const AGREEMENT_FILTERS = ['All agreement statuses', 'Pending', 'Sent', 'Accepted'];
const PRODUCT_FILTERS = ['All products', 'Rose Quartz Bracelet', 'Pyrite Anklet'];

function Badge({ value, type }: { value: string; type: 'agreement' | 'video' | 'payment' | 'dispatch' }) {
  const map: Record<string, string> = {
    Accepted: 'bg-green-900/40 text-green-400 border-green-800/40',
    Sent: 'bg-blue-900/40 text-blue-400 border-blue-800/40',
    Pending: 'bg-orange-900/40 text-orange-400 border-orange-800/40',
    Approved: 'bg-green-900/40 text-green-400 border-green-800/40',
    Done: 'bg-emerald-900/40 text-emerald-400 border-emerald-800/40',
    Paid: 'bg-emerald-900/40 text-emerald-400 border-emerald-800/40',
    'Not yet Paid': 'bg-gray-800/40 text-gray-500 border-gray-700/40',
    Dispatched: 'bg-purple-900/40 text-purple-400 border-purple-800/40',
    Delivered: 'bg-teal-900/40 text-teal-400 border-teal-800/40',
  };
  const cls = map[value] ?? 'bg-gray-800/40 text-gray-400 border-gray-700/40';
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>
      {value}
    </span>
  );
}

export default function CreatorsPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [agreementFilter, setAgreementFilter] = useState('All agreement statuses');
  const [productFilter, setProductFilter] = useState('All products');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Influencer | null>(null);
  const [selectedTab, setSelectedTab] = useState<'edit' | 'view'>('edit');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/influencers');
    const data = await res.json();
    setInfluencers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = influencers.filter(i => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      i.full_name.toLowerCase().includes(q) ||
      i.email.toLowerCase().includes(q) ||
      i.instagram_handle.toLowerCase().includes(q) ||
      i.phone.includes(q);
    const matchAgreement = agreementFilter === 'All agreement statuses' || i.agreement_status === agreementFilter;
    const matchProduct = productFilter === 'All products' || i.product_assigned === productFilter;
    return matchSearch && matchAgreement && matchProduct;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide uppercase">Creators</h1>
          <p className="text-gray-500 text-sm italic mt-0.5">Your influencer roster — matches your Excel sheet</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/api/export" className="flex items-center gap-2 border border-[#c9a84c]/40 text-[#c9a84c] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#c9a84c]/10 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </a>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#b8963e] text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
            <Plus className="w-4 h-4" /> Add Creator
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, Instagram..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c9a84c]/50"
          />
        </div>
        <div className="relative">
          <select value={agreementFilter} onChange={e => setAgreementFilter(e.target.value)}
            className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 pr-8 text-sm text-gray-300 focus:outline-none focus:border-[#c9a84c]/50 cursor-pointer">
            {AGREEMENT_FILTERS.map(f => <option key={f}>{f}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={productFilter} onChange={e => setProductFilter(e.target.value)}
            className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 pr-8 text-sm text-gray-300 focus:outline-none focus:border-[#c9a84c]/50 cursor-pointer">
            {PRODUCT_FILTERS.map(f => <option key={f}>{f}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['#', 'Name', 'Phone', 'Instagram', 'Flwrs', 'Agreement', '₹', 'Product', 'Video', 'Pay', 'Remarks', ''].map(h => (
                    <th key={h} className="px-2 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length === 0 ? (
                  <tr><td colSpan={12} className="text-center py-16 text-gray-600">No creators found</td></tr>
                ) : filtered.map((inf, idx) => (
                  <tr key={inf.id} className="hover:bg-white/3 transition-colors group">
                    <td className="px-2 py-2 text-gray-600 text-xs">{idx + 1}</td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <button onClick={() => { setSelectedTab('view'); setSelected(inf); }} className="text-white font-semibold hover:text-[#c9a84c] transition-colors text-left text-xs">
                        {inf.full_name}
                      </button>
                    </td>
                    <td className="px-2 py-2 text-gray-400 text-xs whitespace-nowrap">{inf.phone}</td>
                    <td className="px-2 py-2 text-[#c9a84c] text-xs whitespace-nowrap">
                      <a href={`https://instagram.com/${inf.instagram_handle.replace('@','')}`} target="_blank" rel="noreferrer" className="hover:underline">
                        @{inf.instagram_handle}
                      </a>
                    </td>
                    <td className="px-2 py-2 text-gray-400 text-xs whitespace-nowrap">{inf.followers?.toLocaleString('en-IN')}</td>
                    <td className="px-2 py-2"><Badge value={inf.agreement_status} type="agreement" /></td>
                    <td className="px-2 py-2 text-gray-300 text-xs whitespace-nowrap">₹{inf.payment_amount?.toLocaleString('en-IN')}</td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${inf.product_assigned === 'Rose Quartz Bracelet' ? 'bg-pink-900/30 text-pink-400 border-pink-800/30' : 'bg-amber-900/30 text-amber-400 border-amber-800/30'}`}>
                        {inf.product_assigned === 'Rose Quartz Bracelet' ? 'Rose Quartz' : 'Pyrite'}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      {inf.video_status !== 'Pending' ? <Badge value={inf.video_status} type="video" /> : <span className="text-gray-700 text-xs">—</span>}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      {inf.payment_status === 'Not yet Paid'
                        ? <span className="text-gray-600 text-xs">—</span>
                        : <Badge value={inf.payment_status} type="payment" />}
                    </td>
                    <td className="px-2 py-2 text-xs w-[140px]">
                      {inf.remarks
                        ? <span className={`break-words leading-relaxed ${inf.remarks.toLowerCase().includes('delivered') ? 'text-green-400' : 'text-gray-400'}`}>{inf.remarks}</span>
                        : <span className="text-gray-700">—</span>}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex gap-1">
                        <button onClick={() => { setSelectedTab('view'); setSelected(inf); }}
                          className="text-[10px] border border-white/10 text-gray-500 hover:text-blue-400 hover:border-blue-400/30 px-2 py-0.5 rounded transition-colors whitespace-nowrap">
                          View
                        </button>
                        <button onClick={() => { setSelectedTab('edit'); setSelected(inf); }}
                          className="text-[10px] border border-white/10 text-gray-500 hover:text-[#c9a84c] hover:border-[#c9a84c]/30 px-2 py-0.5 rounded transition-colors whitespace-nowrap">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && <AddInfluencerModal onClose={() => setShowAdd(false)} onAdded={load} />}
      {selected && <InfluencerDetailModal influencer={selected} onClose={() => setSelected(null)} onUpdated={() => { load(); setSelected(null); }} defaultTab={selectedTab} />}
    </div>
  );
}
