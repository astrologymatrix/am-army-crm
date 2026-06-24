import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { CreateInfluencerInput } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from('influencers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const db = getSupabaseAdmin();
  const body: CreateInfluencerInput = await req.json();

  const { data, error } = await db
    .from('influencers')
    .insert({
      ...body,
      agreement_status: 'Pending',
      video_status: 'Pending',
      payment_status: 'Pending',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
