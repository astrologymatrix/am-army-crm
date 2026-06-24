import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const db = getSupabaseAdmin();
  const { name, email, role, permissions } = await req.json();

  if (!name || !email || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // 1. Send Supabase Auth invite email
  const { error: authError } = await db.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
    data: { name, role },
  });

  if (authError) {
    const msg = authError.message || JSON.stringify(authError);
    // If user already exists, that's fine — just add to team_members
    if (!msg.toLowerCase().includes('already') && !msg.toLowerCase().includes('registered')) {
      return NextResponse.json({ error: `Email invite failed: ${msg}` }, { status: 500 });
    }
  }

  // 2. Add to team_members table
  const { data, error } = await db
    .from('team_members')
    .upsert({ name, email, role, permissions, status: 'pending' }, { onConflict: 'email' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: `DB error: ${error.message}` }, { status: 500 });
  return NextResponse.json({ success: true, member: data });
}
