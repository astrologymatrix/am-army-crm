'use client';

import { useState, useEffect } from 'react';
import { Influencer } from '@/types';
import { X, Send, Trash2, Copy, ExternalLink, FileText, Save } from 'lucide-react';

interface Props {
  influencer: Influencer;
  onClose: () => void;
  onUpdated: () => void;
}

interface DBProduct { id: string; name: string; price: number; }

const DEFAULT_PRODUCTS = ['Rose Quartz Bracelet', 'Pyrite Anklet'];

const selCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a84c] cursor-pointer';
const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a84c]';

function Badge({ value }: { value: string }) {
  const map: Record<string, string> = {
    Accepted: 'bg-green-100 text-green-700 border-green-200',
    Sent: 'bg-blue-100 text-blue-700 border-blue-200',
    Pending: 'bg-orange-100 text-orange-600 border-orange-200',
    Approved: 'bg-green-100 text-green-700 border-green-200',
    Done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Dispatched: 'bg-purple-100 text-purple-700 border-purple-200',
    Delivered: 'bg-teal-100 text-teal-700 border-teal-200',
    'Not Sent': 'bg-gray-100 text-gray-500 border-gray-200',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[value] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {value}
    </span>
  );
}

export default function InfluencerDetailModal({ influencer, onClose, onUpdated }: Props) {
  const [dbProducts, setDbProducts] = useState<DBProduct[]>([]);

  // Local form state — nothing saves until "Save Changes" is clicked
  const [form, setForm] = useState({
    // Creator info — editable
    full_name: influencer.full_name ?? '',
    email: influencer.email ?? '',
    phone: influencer.phone ?? '',
    instagram_handle: influencer.instagram_handle ?? '',
    followers: influencer.followers ?? 0,
    address: influencer.address ?? '',
    // Collaboration
    product_assigned: influencer.product_assigned ?? 'Pyrite Anklet',
    payment_amount: influencer.payment_amount ?? 900,
    agreement_status: influencer.agreement_status ?? 'Pending',
    dispatch_status: (influencer as any).dispatch_status ?? '',
    video_status: influencer.video_status ?? 'Pending',
    payment_status: influencer.payment_status ?? 'Pending',
    remarks: influencer.remarks ?? '',
  });

  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => setDbProducts(Array.isArray(d) ? d : []));
  }, []);

  const allProducts = [...DEFAULT_PRODUCTS, ...dbProducts.map(p => p.name).filter(n => !DEFAULT_PRODUCTS.includes(n))];

  const notify = (msg: string, isError = false) => {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setSuccess(''); setError(''); }, 3000);
  };

  const setField = (key: string, value: string | number) => {
    setForm(f => ({ ...f, [key]: value }));
    setIsDirty(true);
  };

  // Save ALL changes at once
  const saveAll = async () => {
    setSaving(true);
    setError('');
    const res = await fetch(`/api/influencers/${influencer.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        instagram_handle: form.instagram_handle,
        followers: form.followers,
        address: form.address,
        product_assigned: form.product_assigned,
        payment_amount: form.payment_amount,
        agreement_status: form.agreement_status,
        dispatch_status: form.dispatch_status || null,
        video_status: form.video_status,
        payment_status: form.payment_status,
        remarks: form.remarks,
      }),
    });
    if (res.ok) {
      setIsDirty(false);
      onUpdated();
      notify('All changes saved!');
    } else {
      const data = await res.json();
      notify(data.error || 'Save failed', true);
    }
    setSaving(false);
  };

  const sendAgreement = async () => {
    setSending(true);
    setError('');
    const res = await fetch('/api/send-agreement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ influencerId: influencer.id }),
    });
    const data = await res.json();
    if (!res.ok) notify(data.error || 'Failed to send email', true);
    else {
      setForm(f => ({ ...f, agreement_status: 'Sent' }));
      onUpdated();
      notify('Agreement email sent!');
    }
    setSending(false);
  };

  const deleteInfluencer = async () => {
    setDeleting(true);
    await fetch(`/api/influencers/${influencer.id}`, { method: 'DELETE' });
    onClose();
    onUpdated();
  };

  const copyLink = () => {
    if (influencer.agreement_token) {
      navigator.clipboard.writeText(`${window.location.origin}/sign/${influencer.agreement_token}`);
      notify('Signing link copied!');
    }
  };

  const signingLink = influencer.agreement_token
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/sign/${influencer.agreement_token}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-gray-900">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{influencer.full_name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              @{influencer.instagram_handle} · {Number(influencer.followers || 0).toLocaleString('en-IN')} followers
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <button onClick={saveAll} disabled={saving}
                className="flex items-center gap-1.5 bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5 text-gray-900">

          {/* Creator info — all editable */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">👤 Creator Info</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                <input value={form.full_name} onChange={e => setField('full_name', e.target.value)}
                  className={inputCls} placeholder="Full Name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                <input value={form.phone} onChange={e => setField('phone', e.target.value)}
                  className={inputCls} placeholder="Phone" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                <input type="text" value={form.email} onChange={e => setField('email', e.target.value)}
                  className={inputCls} placeholder="Email" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Instagram Handle</label>
                <div className="flex">
                  <span className="bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg px-2 py-2 text-xs text-gray-500">@</span>
                  <input value={form.instagram_handle.replace('@','')} onChange={e => setField('instagram_handle', e.target.value)}
                    className="flex-1 border border-gray-200 rounded-r-lg px-3 py-2 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a84c]" placeholder="handle" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Followers</label>
                <input type="number" value={form.followers} onChange={e => setField('followers', parseInt(e.target.value)||0)}
                  className={inputCls} placeholder="Followers" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Address</label>
                <input value={form.address} onChange={e => setField('address', e.target.value)}
                  className={inputCls} placeholder="Full address" />
              </div>
            </div>
            {influencer.agreement_signed_at && (
              <p className="text-xs text-green-600 font-medium">
                ✓ Signed on {new Date(influencer.agreement_signed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>

          {/* ── AGREEMENT STATUS ── */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">📄 Agreement</p>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
              <select value={form.agreement_status} onChange={e => setField('agreement_status', e.target.value)} className={selCls}>
                <option value="Pending">Pending — not sent yet</option>
                <option value="Sent">Sent — awaiting signature</option>
                <option value="Accepted">Accepted — signed ✓</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Update to <strong>Accepted</strong> manually if creator signed outside the system, or use the button below to send for digital signature.
              </p>
            </div>

            {/* Send agreement button */}
            <div className="flex gap-2">
              <button onClick={sendAgreement} disabled={sending || form.agreement_status === 'Accepted'}
                className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : form.agreement_status === 'Accepted' ? '✓ Already Signed' : form.agreement_status === 'Sent' ? 'Resend Agreement Email' : 'Send Agreement Email'}
              </button>

              {signingLink && (
                <>
                  <a href={signingLink} target="_blank" rel="noreferrer" title="View agreement"
                    className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:border-[#c9a84c]/50 hover:text-[#c9a84c] px-3 py-2 rounded-xl text-sm transition-colors">
                    <FileText className="w-4 h-4" /> View
                  </a>
                  <button onClick={copyLink} title="Copy signing link"
                    className="p-2.5 border border-gray-200 text-gray-500 hover:text-[#c9a84c] hover:border-[#c9a84c]/50 rounded-xl transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                  <a href={signingLink} target="_blank" rel="noreferrer" title="Open in new tab"
                    className="p-2.5 border border-gray-200 text-gray-500 hover:text-[#c9a84c] hover:border-[#c9a84c]/50 rounded-xl transition-colors flex items-center">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </>
              )}
            </div>
            {signingLink && (
              <p className="text-[10px] text-gray-400 font-mono truncate bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100">
                {signingLink}
              </p>
            )}
          </div>

          {/* ── PRODUCT & PAYMENT ── */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">💎 Product & Payment</p>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Product Assigned</label>
              <div className="grid grid-cols-2 gap-2">
                {allProducts.map(p => (
                  <label key={p} onClick={() => setField('product_assigned', p)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm ${form.product_assigned === p ? 'border-[#c9a84c] bg-[#fdf8ee]' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${form.product_assigned === p ? 'border-[#c9a84c]' : 'border-gray-300'}`}>
                      {form.product_assigned === p && <div className="w-2 h-2 rounded-full bg-[#c9a84c]" />}
                    </div>
                    <span className="text-gray-800 font-medium">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Cash Compensation (₹)</label>
              <div className="flex gap-2">
                {[900, 1000, 1500, 2000].map(amt => (
                  <button key={amt} type="button" onClick={() => setField('payment_amount', amt)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all ${form.payment_amount === amt ? 'border-[#c9a84c] bg-[#fdf8ee] text-[#c9a84c]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── FULFILLMENT ── */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">📦 Fulfillment & Video</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Dispatch Status</label>
                <select value={form.dispatch_status} onChange={e => setField('dispatch_status', e.target.value)} className={selCls}>
                  <option value="">Not Dispatched</option>
                  <option value="Dispatched">Dispatched 🚚</option>
                  <option value="Delivered">Delivered ✓</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Video Status</label>
                <select value={form.video_status} onChange={e => setField('video_status', e.target.value)} className={selCls}>
                  <option value="Pending">Pending</option>
                  <option value="Sent">Sent by Creator</option>
                  <option value="Approved">Approved ✓</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Payment Status</label>
                <select value={form.payment_status} onChange={e => setField('payment_status', e.target.value)} className={selCls}>
                  <option value="Pending">Pending</option>
                  <option value="Done">Done ✓</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Remarks / Notes</label>
                <input value={form.remarks} onChange={e => setField('remarks', e.target.value)}
                  className={inputCls} placeholder="e.g. Successfully Delivered" />
              </div>
            </div>
          </div>

          {/* Feedback */}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">⚠ {error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">✓ {success}</div>}

          {/* Save button (bottom) */}
          <button onClick={saveAll} disabled={saving || !isDirty}
            className="w-full flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-colors">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isDirty ? 'Save All Changes' : 'No Changes to Save'}
          </button>

          {/* Delete */}
          <div className="border-t border-gray-100 pt-4">
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 text-red-400 hover:text-red-600 text-sm font-medium transition-colors">
                <Trash2 className="w-4 h-4" /> Remove Creator
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <p className="text-sm text-red-600 font-medium">Permanently delete this creator?</p>
                <button onClick={deleteInfluencer} disabled={deleting}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors">
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
