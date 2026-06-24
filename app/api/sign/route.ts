import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const db = getSupabaseAdmin();
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const { data, error } = await db
    .from('influencers')
    .select('*')
    .eq('agreement_token', token)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const db = getSupabaseAdmin();
  const { token, signedName } = await req.json();

  if (!token || !signedName) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { data: influencer, error: fetchError } = await db
    .from('influencers')
    .select('id, agreement_status')
    .eq('agreement_token', token)
    .single();

  if (fetchError || !influencer) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
  }

  if (influencer.agreement_status === 'Accepted') {
    return NextResponse.json({ error: 'Already signed' }, { status: 409 });
  }

  const { error: updateError } = await db
    .from('influencers')
    .update({
      agreement_status: 'Accepted',
      agreement_signed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', influencer.id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
