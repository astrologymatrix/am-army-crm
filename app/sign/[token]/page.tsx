'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { getAgreementHTML } from '@/lib/agreement';
import { Influencer } from '@/types';

function SignPageContent() {
  const { token } = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const printMode = searchParams.get('print') === '1';

  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signedName, setSignedName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/sign?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setInfluencer(data);
          if (data.agreement_status === 'Accepted') setDone(true);
        }
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    if (printMode && !loading && influencer) {
      setTimeout(() => window.print(), 800);
    }
  }, [printMode, loading, influencer]);

  const handleSign = async () => {
    if (!signedName.trim() || !agreed) return;
    setSigning(true);
    const res = await fetch('/api/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, signedName }),
    });
    const data = await res.json();
    if (data.success) setDone(true);
    else setError(data.error || 'Something went wrong');
    setSigning(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f6f0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#c9a84c] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your agreement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f9f6f0] flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Link Invalid</h2>
          <p className="text-gray-500">{error}</p>
          <p className="text-sm text-gray-400 mt-4">Please contact Astrology Matrix at onboarding@astrologymatrix.in</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#f9f6f0] flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-lg border border-[#c9a84c]/20">
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Agreement Signed!</h2>
          <p className="text-gray-600 mb-4">
            Thank you <strong>{influencer?.full_name}</strong>! Your agreement has been signed successfully.
          </p>
          <div className="bg-[#fdf8ee] rounded-xl p-4 text-sm text-gray-700 text-left space-y-2">
            <p>✦ We'll dispatch your <strong>{influencer?.product_assigned}</strong> shortly</p>
            <p>✦ Create your Reel within 7 days of receiving the product</p>
            <p>✦ Tag @AstrologyMatrix and @AstrologyMatrixStore</p>
            <p>✦ Use #astrologymatrix or #AMArmy</p>
          </div>
          <p className="text-[#c9a84c] font-semibold mt-6">✦ Welcome to the AM Army! ✦</p>
        </div>
      </div>
    );
  }

  if (!influencer) return null;

  const agreementDate = new Date(influencer.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const agreementHTML = getAgreementHTML({
    creatorName: influencer.full_name,
    instagramHandle: influencer.instagram_handle,
    phone: influencer.phone,
    email: influencer.email,
    product: influencer.product_assigned || '',
    paymentAmount: influencer.payment_amount,
    agreementDate,
  });

  return (
    <div className="min-h-screen bg-[#e8e4dc]">
      <div className="bg-[#1a1a1a] text-[#c9a84c] text-center py-3 text-sm font-medium tracking-widest print:hidden flex items-center justify-center gap-4">
        <span>ASTROLOGY MATRIX — CREATOR COLLABORATION AGREEMENT</span>
        <button onClick={() => window.print()}
          className="bg-[#c9a84c]/20 hover:bg-[#c9a84c]/30 text-[#c9a84c] text-xs px-4 py-1 rounded-full transition-colors border border-[#c9a84c]/30">
          🖨 Print / Save as PDF
        </button>
      </div>

      <div className="py-8 px-4 print:p-0">
        <div className="print:p-0" dangerouslySetInnerHTML={{ __html: agreementHTML }} />

        {influencer.agreement_status !== 'Accepted' && (
          <div className="max-w-[210mm] mx-auto mt-6 bg-white rounded-2xl shadow-lg p-8 print:hidden">
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-6">✍️ Sign this Agreement</h3>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type your full name as your digital signature
                </label>
                <input type="text" value={signedName} onChange={(e) => setSignedName(e.target.value)}
                  placeholder={influencer.full_name}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#c9a84c] font-serif italic" />
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#c9a84c]" />
                <span className="text-sm text-gray-600">
                  I have read and understood the entire agreement above. By typing my name and clicking Sign, I agree to be bound by its terms. I confirm this digital signature is legally equivalent to a handwritten signature.
                </span>
              </label>
              <button onClick={handleSign} disabled={!signedName.trim() || !agreed || signing}
                className="w-full bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-lg transition-colors">
                {signing ? 'Signing...' : '✦ Sign Agreement'}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6 mb-8 print:hidden">
          Confidential — Astrology Matrix Creator Agreement · This link is unique to {influencer.full_name}
        </p>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .ag-page { box-shadow: none !important; margin: 0 !important; width: 100% !important; }
        }
      `}</style>
    </div>
  );
}

export default function SignPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f9f6f0] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignPageContent />
    </Suspense>
  );
}
