'use client';

import { useState } from 'react';
import { Influencer, Product } from '@/types';
import { X, Send } from 'lucide-react';
import { getAgreementHTML } from '@/lib/agreement';

interface Props {
  influencer: Influencer;
  onClose: () => void;
  onUpdated: () => void;
}

export default function AgreementEditModal({ influencer, onClose, onUpdated }: Props) {
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const [form, setForm] = useState({
    full_name: influencer.full_name,
    instagram_handle: influencer.instagram_handle,
    phone: influencer.phone,
    email: influencer.email,
    product_assigned: influencer.product_assigned ?? 'Pyrite Anklet',
    payment_amount: influencer.payment_amount ?? 900,
    agreementDate: today,
    postDays: 7,
    reelMinSec: 30,
    reelMaxSec: 60,
    reelLiveDays: 30,
    nonCompeteDays: 30,
  });

  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const saveAndSend = async () => {
    setSending(true);
    setError('');
    // First update influencer details if changed
    await fetch(`/api/influencers/${influencer.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_assigned: form.product_assigned,
        payment_amount: form.payment_amount,
      }),
    });
    // Send agreement email
    const res = await fetch('/api/send-agreement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ influencerId: influencer.id }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Failed to send');
    else { setSuccess('Agreement sent!'); setTimeout(() => { onUpdated(); onClose(); }, 1500); }
    setSending(false);
  };

  const previewHTML = getAgreementHTML({
    creatorName: form.full_name,
    instagramHandle: form.instagram_handle,
    phone: form.phone,
    email: form.email,
    product: form.product_assigned,
    paymentAmount: Number(form.payment_amount),
    agreementDate: form.agreementDate,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
          <div>
            <h2 className="text-white font-bold">Agreement — {influencer.full_name}</h2>
            <p className="text-gray-500 text-xs mt-0.5">@{influencer.instagram_handle} · {influencer.product_assigned} · ₹{influencer.payment_amount}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><X className="w-4 h-4 text-gray-400" /></button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Left: form */}
          <div className="w-72 flex-shrink-0 border-r border-white/5 overflow-y-auto p-5 space-y-5">
            <div>
              <p className="text-[10px] font-bold text-[#c9a84c] tracking-widest uppercase mb-3">Creator Details</p>
              {[
                { label: 'Agreement Date', key: 'agreementDate', type: 'text' },
                { label: 'Full Name', key: 'full_name', type: 'text' },
                { label: 'Instagram Handle', key: 'instagram_handle', type: 'text' },
                { label: 'Phone', key: 'phone', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
              ].map(({ label, key, type }) => (
                <div key={key} className="mb-3">
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">{label}</label>
                  <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#c9a84c]/50" />
                </div>
              ))}
              <div className="mb-3">
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Product</label>
                <select value={form.product_assigned} onChange={e => set('product_assigned', e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#c9a84c]/50 cursor-pointer">
                  <option>Rose Quartz Bracelet</option>
                  <option>Pyrite Anklet</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Payment (INR)</label>
                <input type="number" value={form.payment_amount} onChange={e => set('payment_amount', Number(e.target.value))}
                  className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#c9a84c]/50" />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-[#c9a84c] tracking-widest uppercase mb-3">Collaboration Terms</p>
              {[
                { label: 'Post Within (Days of Delivery)', key: 'postDays' },
                { label: 'Reel Min Duration (Seconds)', key: 'reelMinSec' },
                { label: 'Reel Max Duration (Seconds)', key: 'reelMaxSec' },
                { label: 'Reel Stays Live (Days)', key: 'reelLiveDays' },
                { label: 'Non-Compete (Days After Post)', key: 'nonCompeteDays' },
              ].map(({ label, key }) => (
                <div key={key} className="mb-3">
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">{label}</label>
                  <input type="number" value={(form as any)[key]} onChange={e => set(key, Number(e.target.value))}
                    className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#c9a84c]/50" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: live preview */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="p-8" dangerouslySetInnerHTML={{ __html: previewHTML }} />
            <style>{`
              .agreement-render h1.ag-title { font-size:1.4rem;font-weight:bold;text-align:center;margin:12px 0 20px;color:#1a1a1a;font-style:italic }
              .agreement-render .ag-logo { display:block;margin:0 auto 8px;height:56px;object-fit:contain }
              .agreement-render h2.ag-subtitle { font-size:1.1rem;font-weight:bold;color:#c9a84c;border-bottom:2px solid #c9a84c;padding-bottom:6px;margin-bottom:16px }
              .agreement-render .ag-info-table { width:100%;border-collapse:collapse;margin-bottom:20px }
              .agreement-render .ag-info-table td { padding:7px 10px;border:1px solid #e5e7eb;font-size:13px }
              .agreement-render .ag-info-table td:first-child { font-weight:600;background:#f9f6f0;width:40%;color:#555 }
              .agreement-render h3 { font-size:.95rem;font-weight:bold;color:#c9a84c;margin:22px 0 8px;letter-spacing:.5px }
              .agreement-render p,.agreement-render li { font-size:13px;line-height:1.7;color:#444 }
              .agreement-render ul { padding-left:18px;margin:6px 0 14px }
              .agreement-render li { margin-bottom:5px }
              .agreement-render .ag-sig-table { width:100%;border-collapse:collapse;margin-top:14px }
              .agreement-render .ag-sig-table th { text-align:left;padding:8px 10px;background:#f3f4f6;font-size:12px;border:1px solid #e5e7eb }
              .agreement-render .ag-sig-table td { padding:14px 10px;border:1px solid #e5e7eb;font-size:13px;min-height:44px;vertical-align:top }
              .agreement-render .ag-footer-note { text-align:center;color:#c9a84c;font-weight:600;margin-top:24px }
              .agreement-render .ag-confidential { text-align:center;font-size:11px;color:#999;margin-top:6px }
              .agreement-render .ag-intro { margin:14px 0 20px }
              .agreement-render .ag-header { text-align:center;margin-bottom:6px }
            `}</style>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between flex-shrink-0">
          <div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-green-400 text-sm">✓ {success}</p>}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="border border-white/10 text-gray-400 px-5 py-2.5 rounded-xl text-sm hover:bg-white/5 transition-colors">Close</button>
            <button onClick={() => window.print()} className="border border-white/10 text-gray-300 px-5 py-2.5 rounded-xl text-sm hover:bg-white/5 transition-colors">Print / PDF</button>
            <button
              onClick={saveAndSend}
              disabled={sending}
              className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-50 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : influencer.agreement_status === 'Accepted' ? 'Agreement Signed ✓' : 'Save & Send for Signature'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
