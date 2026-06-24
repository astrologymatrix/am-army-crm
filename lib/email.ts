import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendAgreementEmail({
  to,
  creatorName,
  product,
  paymentAmount,
  signingLink,
}: {
  to: string;
  creatorName: string;
  product: string;
  paymentAmount: number;
  signingLink: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Georgia', serif; background: #f9f6f0; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: #1a1a1a; padding: 32px; text-align: center; }
    .header img { height: 60px; }
    .body { padding: 36px; }
    h2 { color: #1a1a1a; font-size: 22px; margin-bottom: 8px; }
    p { color: #444; line-height: 1.7; font-size: 15px; }
    .highlight { background: #fdf8ee; border-left: 4px solid #c9a84c; padding: 16px 20px; border-radius: 4px; margin: 24px 0; }
    .btn { display: inline-block; background: #c9a84c; color: #fff !important; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 16px; font-weight: bold; margin: 24px 0; letter-spacing: 0.5px; }
    .footer { background: #f4f0e8; padding: 20px; text-align: center; font-size: 13px; color: #888; }
    .product-badge { display: inline-block; background: #1a1a1a; color: #c9a84c; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo-white.png" alt="Astrology Matrix" onerror="this.style.display='none'" />
      <div style="color:#c9a84c; font-size:22px; font-weight:bold; margin-top:8px;">ASTROLOGY MATRIX</div>
      <div style="color:#888; font-size:13px; letter-spacing:2px; margin-top:4px;">AM ARMY</div>
    </div>
    <div class="body">
      <h2>Hello ${creatorName}! ✨</h2>
      <p>We're thrilled to have you join the <strong>Astrology Matrix Creator Army</strong>! Your collaboration agreement is ready for your digital signature.</p>

      <div class="highlight">
        <p style="margin:0 0 8px 0;"><strong>Your assigned product:</strong></p>
        <span class="product-badge">${product}</span>
        <p style="margin:12px 0 0 0;"><strong>Cash Compensation:</strong> ₹${paymentAmount.toLocaleString('en-IN')}</p>
      </div>

      <p>Please review the agreement carefully and sign it digitally by clicking the button below:</p>

      <div style="text-align:center;">
        <a href="${signingLink}" class="btn">Review & Sign Agreement →</a>
      </div>

      <p style="font-size:13px; color:#999; margin-top:8px;">This link is unique to you. Once signed, we'll dispatch your product and you'll receive a confirmation.</p>

      <p>If you have any questions, reach out to us at <a href="mailto:onboarding@astrologymatrix.in" style="color:#c9a84c;">onboarding@astrologymatrix.in</a> or WhatsApp us.</p>

      <p>With love and crystals,<br><strong>Nishi Khandelwal</strong><br>Collaboration Coordinator, Astrology Matrix</p>
    </div>
    <div class="footer">
      ✦ Thank you for being part of the Astrology Matrix Creator Army ✦<br>
      <span style="font-size:11px;">Confidential — Do not share this link</span>
    </div>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"Astrology Matrix" <${process.env.GMAIL_USER}>`,
    to,
    subject: `🔮 Your Creator Agreement — Astrology Matrix × ${creatorName}`,
    html,
  });
}
