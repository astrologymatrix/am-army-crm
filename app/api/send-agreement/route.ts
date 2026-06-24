import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendAgreementEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const db = getSupabaseAdmin();
  const { influencerId } = await req.json();

  const { data: influencer, error: fetchError } = await db
    .from('influencers')
    .select('*')
    .eq('id', influencerId)
    .single();

  if (fetchError || !influencer) {
    return NextResponse.json({ error: 'Influencer not found' }, { status: 404 });
  }

  const token = uuidv4();
  // Always use the production URL for signing links — never localhost
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace('http://localhost:3000', 'https://am-army-crm.vercel.app');
  const signingLink = `${appUrl}/sign/${token}`;

  const { error: updateError } = await db
    .from('influencers')
    .update({
      agreement_token: token,
      agreement_status: 'Sent',
      agreement_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', influencerId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  try {
    await sendAgreementEmail({
      to: influencer.email,
      creatorName: influencer.full_name,
      product: influencer.product_assigned,
      paymentAmount: influencer.payment_amount,
      signingLink,
    });
  } catch {
    await db
      .from('influencers')
      .update({ agreement_token: null, agreement_status: 'Pending' })
      .eq('id', influencerId);
    return NextResponse.json({ error: 'Failed to send email. Check Gmail credentials in .env.local' }, { status: 500 });
  }

  return NextResponse.json({ success: true, signingLink });
}
