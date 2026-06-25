'use client';

import { useState, useEffect, useRef } from 'react';
import { Influencer } from '@/types';
import { X, Send, Trash2, Copy, ExternalLink, FileText, Save, Upload, Eye, Edit3, CheckCircle } from 'lucide-react';

interface Props {
  influencer: Influencer;
  onClose: () => void;
  onUpdated: () => void;
  defaultTab?: 'edit' | 'view';
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
    'Not yet Paid': 'bg-gray-100 text-gray-500 border-gray-200',
    Paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
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

function ImageUpload({
  label, currentUrl, folder, onUploaded, onRemoved
}: { label: string; currentUrl: string | null; folder: string; onUploaded: (url: string) => void; onRemoved?: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`/api/upload?folder=${folder}`, { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) { setPreview(data.url); onUploaded(data.url); }
    setUploading(false);
  };

  const handleRemove = () => {
    setPreview(null);
    onRemoved?.();
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      {preview ? (
        <div className="flex items-start gap-3">
          <div className="relative inline-block">
            <img src={preview} alt={label} className="h-24 w-auto rounded-lg border border-gray-200 object-contain bg-gray-50" />
            <button onClick={() => inputRef.current?.click()}
              className="absolute -top-2 -right-2 bg-[#c9a84c] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-[#b8963e]">
              ✎
            </button>
          </div>
          {onRemoved && (
            <button onClick={handleRemove}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-2 py-1 rounded-lg transition-colors mt-1">
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          )}
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-[#c9a84c]/50 hover:bg-[#fdf8ee]/50 transition-colors">
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
              <div className="w-4 h-4 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
              Uploading...
            </div>
          ) : (
            <>
              <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Click to upload</p>
            </>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
    </div>
  );
}

// ─── VIEW PROFILE TAB ───────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value}</span>
    </div>
  );
}

function EmptyVal() {
  return <span className="text-sm text-gray-300 italic">Not added</span>;
}

function ViewProfile({ influencer }: { influencer: Influencer }) {
  const initials = influencer.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const dispatchStatus = (influencer as any).dispatch_status;

  const payStatus = influencer.payment_status;
  const payColor = payStatus === 'Paid' ? 'text-emerald-600' : payStatus === 'Pending' ? 'text-orange-500' : 'text-gray-400';

  return (
    <div className="p-5 space-y-4 text-gray-900">

      {/* Avatar + identity */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c9a84c] to-[#8b6914] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900">{influencer.full_name}</h3>
          <a
            href={`https://instagram.com/${influencer.instagram_handle.replace('@','')}`}
            target="_blank" rel="noreferrer"
            className="text-sm text-[#c9a84c] font-medium hover:underline">
            @{influencer.instagram_handle}
          </a>
          <p className="text-xs text-gray-500">{Number(influencer.followers || 0).toLocaleString('en-IN')} followers</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge value={influencer.agreement_status} />
          {influencer.agreement_signed_at && (
            <span className="text-[10px] text-green-600">
              Signed {new Date(influencer.agreement_signed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">📞 Contact Info</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-0.5">Phone</span>
            {influencer.phone ? <span className="text-sm text-gray-800 font-medium">{influencer.phone}</span> : <EmptyVal />}
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-0.5">Email</span>
            {influencer.email ? <span className="text-sm text-gray-800 font-medium">{influencer.email}</span> : <EmptyVal />}
          </div>
          <div className="col-span-2">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-0.5">Address</span>
            {influencer.address ? <span className="text-sm text-gray-800 font-medium">{influencer.address}</span> : <EmptyVal />}
          </div>
        </div>
      </div>

      {/* Collaboration */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">💎 Collaboration</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-0.5">Product Assigned</span>
            {influencer.product_assigned ? <span className="text-sm text-gray-800 font-medium">{influencer.product_assigned}</span> : <EmptyVal />}
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-0.5">Cash Compensation</span>
            {influencer.payment_amount ? <span className="text-sm text-gray-800 font-medium">₹{Number(influencer.payment_amount).toLocaleString('en-IN')}</span> : <EmptyVal />}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">📋 Status</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">Agreement</span>
            <Badge value={influencer.agreement_status} />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">Dispatch</span>
            {dispatchStatus ? <Badge value={dispatchStatus} /> : <span className="text-sm text-gray-300 italic">Not dispatched</span>}
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">Video</span>
            <Badge value={influencer.video_status} />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">Payment</span>
            <span className={`text-sm font-bold ${payColor}`}>{influencer.payment_status || '—'}</span>
          </div>
        </div>
        {influencer.remarks && (
          <div className="mt-3 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <p className="text-[10px] text-gray-400 mb-0.5">Remarks</p>
            <p className="text-sm text-gray-700">{influencer.remarks}</p>
          </div>
        )}
      </div>

      {/* Payment Details — always shown */}
      <div className="bg-[#fdf8ee]/60 border border-[#c9a84c]/20 rounded-xl p-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">💳 Payment Details</p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-0.5">UPI ID</span>
              {influencer.upi_id ? <span className="text-sm text-gray-800 font-medium">{influencer.upi_id}</span> : <EmptyVal />}
            </div>
            <div className="col-span-2">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-0.5">Bank Details</span>
              {influencer.bank_details ? <span className="text-sm text-gray-800 font-medium whitespace-pre-line">{influencer.bank_details}</span> : <EmptyVal />}
            </div>
          </div>

          {/* QR + Screenshot side by side */}
          <div className="flex gap-4 mt-1">
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-widest font-semibold">QR / Scanner</p>
              {influencer.payment_scanner_url ? (
                <a href={influencer.payment_scanner_url} target="_blank" rel="noreferrer">
                  <img src={influencer.payment_scanner_url} alt="Payment QR" className="h-32 w-auto rounded-xl border border-gray-200 object-contain bg-white hover:shadow-md transition-shadow" />
                </a>
              ) : (
                <div className="h-32 w-32 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                  <span className="text-[10px] text-gray-300 text-center px-2">Not uploaded</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-widest font-semibold">Payment Screenshot</p>
              {influencer.payment_screenshot_url ? (
                <a href={influencer.payment_screenshot_url} target="_blank" rel="noreferrer">
                  <img src={influencer.payment_screenshot_url} alt="Payment Screenshot" className="h-32 w-auto rounded-xl border border-gray-200 object-contain bg-white hover:shadow-md transition-shadow" />
                </a>
              ) : (
                <div className="h-32 w-32 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                  <span className="text-[10px] text-gray-300 text-center px-2">Not uploaded</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Video */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">🎬 Live Video</p>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-0.5">Video URL</span>
            {influencer.video_url ? (
              <a href={influencer.video_url} target="_blank" rel="noreferrer"
                className="text-sm text-[#c9a84c] font-medium hover:underline break-all">
                {influencer.video_url}
              </a>
            ) : <EmptyVal />}
          </div>
          {influencer.video_posted_at && (
            <div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-0.5">Posted On</span>
              <span className="text-sm text-gray-800 font-medium">
                {new Date(influencer.video_posted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          )}
          {(influencer.video_views || influencer.video_likes || influencer.video_comments || influencer.video_shares) ? (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[
                { label: 'Views', value: influencer.video_views },
                { label: 'Likes', value: influencer.video_likes },
                { label: 'Comments', value: influencer.video_comments },
                { label: 'Shares', value: influencer.video_shares },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white border border-gray-200 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">{label}</p>
                  <p className="text-base font-bold text-gray-800 mt-0.5">
                    {value != null ? Number(value).toLocaleString('en-IN') : '—'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-300 italic">No stats added yet</p>
          )}
        </div>
      </div>

    </div>
  );
}

// ─── MAIN MODAL ─────────────────────────────────────────────────────────────

export default function InfluencerDetailModal({ influencer, onClose, onUpdated, defaultTab = 'edit' }: Props) {
  const [tab, setTab] = useState<'edit' | 'view'>(defaultTab);
  const [dbProducts, setDbProducts] = useState<DBProduct[]>([]);

  const [form, setForm] = useState({
    full_name: influencer.full_name ?? '',
    email: influencer.email ?? '',
    phone: influencer.phone ?? '',
    instagram_handle: influencer.instagram_handle ?? '',
    followers: influencer.followers ?? 0,
    address: influencer.address ?? '',
    product_assigned: influencer.product_assigned ?? 'Pyrite Anklet',
    payment_amount: influencer.payment_amount ?? 900,
    agreement_status: influencer.agreement_status ?? 'Pending',
    dispatch_status: (influencer as any).dispatch_status ?? '',
    video_status: influencer.video_status ?? 'Pending',
    payment_status: influencer.payment_status ?? 'Not yet Paid',
    upi_id: influencer.upi_id ?? '',
    bank_details: influencer.bank_details ?? '',
    payment_scanner_url: influencer.payment_scanner_url ?? '',
    payment_screenshot_url: influencer.payment_screenshot_url ?? '',
    video_url: influencer.video_url ?? '',
    video_posted_at: influencer.video_posted_at ? influencer.video_posted_at.slice(0, 10) : '',
    video_views: influencer.video_views ?? '',
    video_likes: influencer.video_likes ?? '',
    video_comments: influencer.video_comments ?? '',
    video_shares: influencer.video_shares ?? '',
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
        upi_id: form.upi_id || null,
        bank_details: form.bank_details || null,
        payment_scanner_url: form.payment_scanner_url || null,
        payment_screenshot_url: form.payment_screenshot_url || null,
        video_url: form.video_url || null,
        video_posted_at: form.video_posted_at || null,
        video_views: form.video_views !== '' ? Number(form.video_views) : null,
        video_likes: form.video_likes !== '' ? Number(form.video_likes) : null,
        video_comments: form.video_comments !== '' ? Number(form.video_comments) : null,
        video_shares: form.video_shares !== '' ? Number(form.video_shares) : null,
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

  // Live influencer object merged with form state for ViewProfile
  const mergedInfluencer: Influencer = {
    ...influencer,
    ...form,
    dispatch_status: form.dispatch_status,
  } as any;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-gray-900">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{form.full_name || influencer.full_name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              @{influencer.instagram_handle} · {Number(influencer.followers || 0).toLocaleString('en-IN')} followers
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Tab Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-0.5 text-sm">
              <button onClick={() => setTab('view')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${tab === 'view' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <Eye className="w-3.5 h-3.5" /> View
              </button>
              <button onClick={() => setTab('edit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${tab === 'edit' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
            {tab === 'edit' && isDirty && (
              <button onClick={saveAll} disabled={saving}
                className="flex items-center gap-1.5 bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* ── VIEW TAB ── */}
        {tab === 'view' && <ViewProfile influencer={mergedInfluencer} />}

        {/* ── EDIT TAB ── */}
        {tab === 'edit' && (
          <div className="p-5 space-y-5 text-gray-900">

            {/* Creator info */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">👤 Creator Info</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                  <input value={form.full_name} onChange={e => setField('full_name', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setField('phone', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                  <input type="text" value={form.email} onChange={e => setField('email', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Instagram Handle</label>
                  <div className="flex">
                    <span className="bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg px-2 py-2 text-xs text-gray-500">@</span>
                    <input value={form.instagram_handle.replace('@', '')} onChange={e => setField('instagram_handle', e.target.value)}
                      className="flex-1 border border-gray-200 rounded-r-lg px-3 py-2 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a84c]" placeholder="handle" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Followers</label>
                  <input type="number" value={form.followers} onChange={e => setField('followers', parseInt(e.target.value) || 0)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Address</label>
                  <input value={form.address} onChange={e => setField('address', e.target.value)} className={inputCls} placeholder="Full address" />
                </div>
              </div>
              {influencer.agreement_signed_at && (
                <p className="text-xs text-green-600 font-medium">
                  ✓ Signed on {new Date(influencer.agreement_signed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>

            {/* Agreement */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">📄 Agreement</p>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                <select value={form.agreement_status} onChange={e => setField('agreement_status', e.target.value)} className={selCls}>
                  <option value="Pending">Pending — not sent yet</option>
                  <option value="Sent">Sent — awaiting signature</option>
                  <option value="Accepted">Accepted — signed ✓</option>
                </select>
              </div>
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
                    <a href={signingLink} target="_blank" rel="noreferrer"
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

            {/* Product & Payment amount */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">💎 Product & Compensation</p>
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

            {/* Payment Details (UPI / Bank / Scanner) */}
            <div className="border border-[#c9a84c]/30 rounded-xl p-4 space-y-4 bg-[#fdf8ee]/30">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">💳 Payment Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">UPI ID</label>
                  <input value={form.upi_id} onChange={e => setField('upi_id', e.target.value)}
                    className={inputCls} placeholder="e.g. name@upi" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Bank Details</label>
                  <textarea value={form.bank_details} onChange={e => setField('bank_details', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a84c] resize-none"
                    rows={2} placeholder="Bank Name · Account No · IFSC Code" />
                </div>
              </div>
              <div>
                <ImageUpload
                  label="Upload QR / Payment Scanner"
                  currentUrl={form.payment_scanner_url || null}
                  folder="scanners"
                  onUploaded={url => setField('payment_scanner_url', url)}
                />
              </div>
            </div>

            {/* Fulfillment & Video */}
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
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Remarks / Notes</label>
                  <input value={form.remarks} onChange={e => setField('remarks', e.target.value)}
                    className={inputCls} placeholder="e.g. Successfully Delivered" />
                </div>
              </div>
            </div>

            {/* Payment Status + Screenshot */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">💰 Payment Status</p>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Payment Status</label>
                <select value={form.payment_status} onChange={e => setField('payment_status', e.target.value)} className={selCls}>
                  <option value="Not yet Paid">Not yet Paid — no action taken</option>
                  <option value="Pending">Pending — payment due, will show on dashboard</option>
                  <option value="Paid">Paid — payment complete ✓</option>
                </select>
                {form.payment_status === 'Not yet Paid' && (
                  <p className="text-xs text-gray-400 mt-1">Payment status will not be updated when saving.</p>
                )}
                {form.payment_status === 'Pending' && (
                  <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                    ⚠ This creator will appear in Pending Payment on the dashboard
                  </p>
                )}
                {form.payment_status === 'Paid' && (
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Payment complete
                  </p>
                )}
              </div>
              <div>
                <ImageUpload
                  label="Upload Payment Screenshot / Proof"
                  currentUrl={form.payment_screenshot_url || null}
                  folder="payment-proofs"
                  onUploaded={url => setField('payment_screenshot_url', url)}
                  onRemoved={() => setField('payment_screenshot_url', '')}
                />
              </div>
            </div>

            {/* Live Video */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">🎬 Live Video</p>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Instagram / Reel Video URL</label>
                <input value={form.video_url} onChange={e => setField('video_url', e.target.value)}
                  className={inputCls} placeholder="https://www.instagram.com/reel/..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Date Posted</label>
                <input type="date" value={form.video_posted_at} onChange={e => setField('video_posted_at', e.target.value)}
                  className={inputCls} />
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold pt-1">Video Stats</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: 'video_views', label: 'Views' },
                  { key: 'video_likes', label: 'Likes' },
                  { key: 'video_comments', label: 'Comments' },
                  { key: 'video_shares', label: 'Shares' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
                    <input type="number" min="0"
                      value={(form as any)[key]}
                      onChange={e => setField(key, e.target.value)}
                      className={inputCls} placeholder="0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback */}
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">⚠ {error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">✓ {success}</div>}

            {/* Save */}
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
        )}
      </div>
    </div>
  );
}
