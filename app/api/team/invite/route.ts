import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const db = getSupabaseAdmin();
  const { name, email, role, permissions } = await req.json();

  if (!name || !email || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // 1. Add to team_members table first
  const { data, error: dbError } = await db
    .from('team_members')
    .upsert({ name, email, role, permissions, status: 'pending' }, { onConflict: 'email' })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: `DB error: ${dbError.message}` }, { status: 500 });
  }

  // 2. Create user in Supabase Auth with a temp password
  const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
  const { error: createError } = await db.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { name, role },
  });

  // 3. Send invite email via Gmail with login details
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://am-army-crm.vercel.app';

    await transporter.sendMail({
      from: `"Astrology Matrix" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `✦ You've been invited to AM Army CRM`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <div style="background:#1a1a1a;padding:28px;text-align:center;">
            <div style="color:#c9a84c;font-size:20px;font-weight:bold;letter-spacing:2px;">ASTROLOGY MATRIX</div>
            <div style="color:#888;font-size:11px;letter-spacing:3px;margin-top:4px;">AM ARMY CRM</div>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#1a1a1a;margin:0 0 8px;">Hello ${name}! 👋</h2>
            <p style="color:#555;line-height:1.6;">You've been invited to the <strong>Astrology Matrix AM Army CRM</strong> as an <strong>${role}</strong>.</p>

            <div style="background:#fdf8ee;border-left:4px solid #c9a84c;padding:16px 20px;border-radius:4px;margin:24px 0;">
              <p style="margin:0 0 8px;font-weight:bold;color:#1a1a1a;">Your login details:</p>
              <p style="margin:4px 0;color:#555;font-size:14px;"><strong>URL:</strong> <a href="${appUrl}" style="color:#c9a84c;">${appUrl}</a></p>
              <p style="margin:4px 0;color:#555;font-size:14px;"><strong>Email:</strong> ${email}</p>
              <p style="margin:4px 0;color:#555;font-size:14px;"><strong>Temporary Password:</strong> <code style="background:#eee;padding:2px 6px;border-radius:4px;">${tempPassword}</code></p>
            </div>

            <p style="color:#888;font-size:13px;">⚠️ Please change your password after first login from your account settings.</p>

            <a href="${appUrl}" style="display:inline-block;background:#c9a84c;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;margin-top:16px;">
              Access CRM →
            </a>
          </div>
          <div style="background:#f4f0e8;padding:16px;text-align:center;font-size:12px;color:#888;">
            ✦ Astrology Matrix AM Army ✦
          </div>
        </div>
      `,
    });
  } catch (emailErr) {
    // Still succeed even if email fails — user is created
    console.error('Email send error:', emailErr);
    return NextResponse.json({
      success: true,
      member: data,
      warning: 'Member added but invite email failed. Share login details manually.'
    });
  }

  return NextResponse.json({ success: true, member: data });
}
