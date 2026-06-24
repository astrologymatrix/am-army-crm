import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getSupabaseAdmin();
  const { data } = await db.from('influencers').select('*').order('created_at', { ascending: true });

  const rows = data ?? [];
  const headers = ['S.No', 'Full Name', 'Phone', 'Email', 'Instagram Handle', 'Followers', 'Address', 'Product', 'Payment (₹)', 'Agreement Status', 'Video Status', 'Payment Status', 'Remarks', 'Signed On'];

  const csv = [
    headers.join(','),
    ...rows.map((r, i) => [
      i + 1,
      `"${r.full_name ?? ''}"`,
      r.phone ?? '',
      r.email ?? '',
      r.instagram_handle ?? '',
      r.followers ?? '',
      `"${(r.address ?? '').replace(/"/g, '""')}"`,
      r.product_assigned ?? '',
      r.payment_amount ?? '',
      r.agreement_status ?? '',
      r.video_status ?? '',
      r.payment_status ?? '',
      `"${(r.remarks ?? '').replace(/"/g, '""')}"`,
      r.agreement_signed_at ? new Date(r.agreement_signed_at).toLocaleDateString('en-IN') : '',
    ].join(','))
  ].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="am-army-creators-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
