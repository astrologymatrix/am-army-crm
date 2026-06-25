'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Influencer } from '@/types';
import { ExternalLink } from 'lucide-react';

function Badge({ value }: { value: string }) {
  const map: Record<string, string> = {
    Accepted: 'bg-green-100 text-green-700 border-green-200',
    Sent: 'bg-blue-100 text-blue-700 border-blue-200',
    Pending: 'bg-orange-100 text-orange-600 border-orange-200',
    Paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Not yet Paid': 'bg-gray-100 text-gray-500 border-gray-200',
    Approved: 'bg-green-100 text-green-700 border-green-200',
    Done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Dispatched: 'bg-purple-100 text-purple-700 border-purple-200',
    Delivered: 'bg-teal-100 text-teal-700 border-teal-200',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[value] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {value}
    </span>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
      {value ? <p className="text-sm text-gray-800 font-medium">{value}</p> : <p className="text-sm text-gray-300 italic">Not added</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      {children}
    </div>
  );
}

export default function CreatorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [inf, setInf] = useState<Influencer | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/influencers/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setNotFound(true);
        else setInf(d);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !inf) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center text-gray-500">
        Creator not found.
      </div>
    );
  }

  const initials = inf.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const dispatchStatus = (inf as any).dispatch_status;
  const payColor = inf.payment_status === 'Paid' ? 'text-emerald-600' : inf.payment_status === 'Pending' ? 'text-orange-500' : 'text-gray-400';

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

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#c9a84c] to-[#8b6914] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{inf.full_name}</h1>
            <a href={`https://instagram.com/${inf.instagram_handle.replace('@','')}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 text-[#c9a84c] font-medium text-sm hover:underline mt-0.5">
              @{inf.instagram_handle}
              <ExternalLink className="w-3 h-3" />
            </a>
            <p className="text-xs text-gray-400 mt-0.5">{Number(inf.followers || 0).toLocaleString('en-IN')} followers</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge value={inf.agreement_status} />
            {inf.agreement_signed_at && (
              <span className="text-[10px] text-green-600">
                Signed {new Date(inf.agreement_signed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Contact */}
        <Section title="📞 Contact Info">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone" value={inf.phone} />
            <Field label="Email" value={inf.email} />
            <div className="col-span-2"><Field label="Address" value={inf.address} /></div>
          </div>
        </Section>

        {/* Collaboration */}
        <Section title="💎 Collaboration">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Product Assigned" value={inf.product_assigned} />
            <Field label="Cash Compensation" value={inf.payment_amount ? `₹${Number(inf.payment_amount).toLocaleString('en-IN')}` : null} />
          </div>
        </Section>

        {/* Status */}
        <Section title="📋 Status">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Agreement</p>
              <Badge value={inf.agreement_status} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Dispatch</p>
              {dispatchStatus ? <Badge value={dispatchStatus} /> : <p className="text-sm text-gray-300 italic">Not dispatched</p>}
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Video</p>
              <Badge value={inf.video_status} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Payment</p>
              <span className={`text-sm font-bold ${payColor}`}>{inf.payment_status}</span>
            </div>
          </div>
          {inf.remarks && (
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 mt-1">
              <p className="text-[10px] text-gray-400 mb-0.5">Remarks</p>
              <p className="text-sm text-gray-700">{inf.remarks}</p>
            </div>
          )}
        </Section>

        {/* Payment Details */}
        <Section title="💳 Payment Details">
          <div className="grid grid-cols-2 gap-4">
            <Field label="UPI ID" value={inf.upi_id} />
            <div className="col-span-2"><Field label="Bank Details" value={inf.bank_details} /></div>
          </div>
          <div className="flex gap-4 mt-1">
            <div className="flex-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">QR / Scanner</p>
              {inf.payment_scanner_url ? (
                <a href={inf.payment_scanner_url} target="_blank" rel="noreferrer">
                  <img src={inf.payment_scanner_url} alt="QR" className="h-32 w-auto rounded-xl border border-gray-200 object-contain bg-white hover:shadow-md transition-shadow" />
                </a>
              ) : <p className="text-sm text-gray-300 italic">Not uploaded</p>}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Payment Screenshot</p>
              {inf.payment_screenshot_url ? (
                <a href={inf.payment_screenshot_url} target="_blank" rel="noreferrer">
                  <img src={inf.payment_screenshot_url} alt="Payment" className="h-32 w-auto rounded-xl border border-gray-200 object-contain bg-white hover:shadow-md transition-shadow" />
                </a>
              ) : <p className="text-sm text-gray-300 italic">Not uploaded</p>}
            </div>
          </div>
        </Section>

        {/* Live Video */}
        {(inf.video_url || inf.video_posted_at) && (
          <Section title="🎬 Live Video">
            {inf.video_url && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Video URL</p>
                <a href={inf.video_url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#c9a84c] text-sm font-medium hover:underline break-all">
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  {inf.video_url}
                </a>
              </div>
            )}
            {inf.video_posted_at && (
              <Field label="Date Posted" value={new Date(inf.video_posted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
            )}
          </Section>
        )}

        <p className="text-center text-xs text-gray-300 pb-6">
          Astrology Matrix · AM Army CRM · Confidential
        </p>
      </div>
    </div>
  );
}
