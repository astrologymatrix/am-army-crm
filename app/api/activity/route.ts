import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data ?? []);
}
