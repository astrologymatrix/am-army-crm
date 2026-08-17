import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAgreementHTML } from '@/lib/agreement';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getSupabaseAdmin();
  const { id } = await params;

  // Allow form overrides via query params for live preview
  const url = new URL(req.url);
  const q = (key: string) => url.searchParams.get(key);

  const { data: inf, error } = await db.from('influencers').select('*').eq('id', id).single();
  if (error || !inf) return new NextResponse('Creator not found', { status: 404 });

  const html = getAgreementHTML({
    creatorName:     q('full_name')       ?? inf.full_name,
    instagramHandle: q('instagram_handle') ?? inf.instagram_handle,
    phone:           q('phone')           ?? inf.phone,
    email:           q('email')           ?? inf.email,
    product:         q('product')         ?? inf.product_assigned,
    paymentAmount:   Number(q('payment_amount') ?? inf.payment_amount),
    agreementDate:   q('agreementDate')   ?? new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    postDays:        Number(q('postDays')        ?? 7),
    reelMinSec:      Number(q('reelMinSec')      ?? 30),
    reelMaxSec:      Number(q('reelMaxSec')      ?? 60),
    reelLiveDays:    Number(q('reelLiveDays')    ?? 30),
    nonCompeteDays:  Number(q('nonCompeteDays')  ?? 30),
    signedName:      inf.agreement_signed_at ? inf.full_name : undefined,
    signedDate:      inf.agreement_signed_at
      ? new Date(inf.agreement_signed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : undefined,
  });

  const page = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Agreement — ${inf.full_name}</title>
  <style>
    @media print {
      html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0 !important; padding: 0 !important; background: white !important; }
      .no-print { display: none !important; }
    }
    .print-bar {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: #1a1a1a; padding: 12px 24px;
      display: flex; gap: 12px; justify-content: center; align-items: center;
      z-index: 999; box-shadow: 0 -2px 12px rgba(0,0,0,0.3);
    }
    .print-bar button {
      padding: 10px 28px; border-radius: 8px; font-size: 14px;
      font-weight: 600; cursor: pointer; border: none;
    }
    .btn-print { background: #c9a84c; color: #000; }
    .btn-close { background: transparent; color: #888; border: 1px solid #444 !important; }
    body { padding-bottom: 70px; background: #111; }
  </style>
</head>
<body>
  ${html}
  <div class="print-bar no-print">
    <button class="btn-close" onclick="window.close()">Close</button>
    <button class="btn-print" onclick="window.print()">⬇ Download / Print PDF</button>
  </div>
</body>
</html>`;

  return new NextResponse(page, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
