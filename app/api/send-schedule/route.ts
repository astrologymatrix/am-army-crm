import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendScheduleEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const db = getSupabaseAdmin();
  const { influencerId, scheduledDate, note } = await req.json();

  if (!influencerId || !scheduledDate) {
    return NextResponse.json({ error: 'influencerId and scheduledDate are required' }, { status: 400 });
  }

  const { data: influencer, error: fetchError } = await db
    .from('influencers')
    .select('*')
    .eq('id', influencerId)
    .single();

  if (fetchError || !influencer) {
    return NextResponse.json({ error: 'Influencer not found' }, { status: 404 });
  }

  const { error: updateError } = await db
    .from('influencers')
    .update({
      video_scheduled_date: scheduledDate,
      schedule_notified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', influencerId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  try {
    await sendScheduleEmail({
      to: influencer.email,
      creatorName: influencer.full_name,
      scheduledDate,
      product: influencer.product_assigned,
      note: note || '',
    });
  } catch {
    return NextResponse.json({ error: 'Date saved but email failed. Check Gmail credentials.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
