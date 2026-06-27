// Generates pixel-perfect agreement HTML matching the official Astrology Matrix PDF

function numberToWords(n: number): string {
  const words: Record<number, string> = {
    1:'one',2:'two',3:'three',4:'four',5:'five',6:'six',7:'seven',
    8:'eight',9:'nine',10:'ten',14:'fourteen',15:'fifteen',20:'twenty',
    21:'twenty-one',24:'twenty-four',25:'twenty-five',30:'thirty',
    45:'forty-five',60:'sixty',90:'ninety',
  };
  return words[n] ?? String(n);
}

export function getAgreementHTML({
  creatorName,
  instagramHandle,
  phone,
  email,
  product,
  paymentAmount,
  agreementDate,
  signedName,
  signedDate,
  postDays = 7,
  reelMinSec = 30,
  reelMaxSec = 60,
  reelLiveDays = 30,
  nonCompeteDays = 30,
}: {
  creatorName: string;
  instagramHandle: string;
  phone: string;
  email: string;
  product: string;
  paymentAmount: number;
  agreementDate: string;
  signedName?: string;
  signedDate?: string;
  postDays?: number;
  reelMinSec?: number;
  reelMaxSec?: number;
  reelLiveDays?: number;
  nonCompeteDays?: number;
}) {
  const handle = instagramHandle.startsWith('@') ? instagramHandle : `@${instagramHandle}`;
  const amountWords = paymentAmount === 900 ? 'Nine Hundred'
    : paymentAmount === 1000 ? 'One Thousand'
    : paymentAmount === 1500 ? 'One Thousand Five Hundred'
    : paymentAmount === 2000 ? 'Two Thousand'
    : `${paymentAmount}`;


  const creatorFirstName = creatorName.split(' ')[0];
  const sigBlock = signedName
    ? `<em style="font-style:italic;color:#555;">${signedName}</em>`
    : `<span style="color:#ccc;">___________________</span>`;
  const sigDateBlock = signedName
    ? `<em style="font-style:italic;color:#555;">${creatorName} — ${signedDate || agreementDate}</em>`
    : `<span style="color:#ccc;">___________________</span>`;

  const pageHeader = `
    <div style="text-align:center;margin-bottom:16px;">
      <img src="/logo.png" alt="Astrology Matrix" style="height:52px;object-fit:contain;display:block;margin:0 auto 8px;" onerror="this.style.display='none'" />
      <p style="font-size:15px;font-weight:bold;font-style:italic;color:#1a1a1a;margin:0;letter-spacing:0.3px;">Creator Collaboration Agreement</p>
    </div>
  `;

  const pageFooter = (pageNum: number) => `
    <div style="position:absolute;bottom:20px;left:40px;right:40px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e5e7eb;padding-top:8px;">
      <span style="font-size:10px;color:#9ca3af;font-style:italic;">Confidential — Astrology Matrix Creator Agreement</span>
      <span style="font-size:10px;color:#9ca3af;">Page ${pageNum}</span>
    </div>
  `;

  const sectionTitle = (num: string, title: string) => `
    <h3 style="font-size:12px;font-weight:700;color:#6d28a7;margin:18px 0 8px;letter-spacing:0.5px;">${num}.  ${title}</h3>
  `;

  const subTitle = (text: string) => `
    <p style="font-size:12px;font-weight:700;color:#1a1a1a;margin:10px 0 6px;">${text}</p>
  `;

  const bullet = (text: string) => `
    <li style="font-size:12px;color:#374151;line-height:1.65;margin-bottom:5px;">${text}</li>
  `;

  const para = (text: string, italic = false) => `
    <p style="font-size:12px;color:#374151;line-height:1.65;margin:8px 0;${italic ? 'font-style:italic;' : ''}">${text}</p>
  `;

  return `
<style>
  .ag-page {
    width: 210mm;
    min-height: 297mm;
    background: white;
    position: relative;
    padding: 36px 44px 60px;
    box-sizing: border-box;
    margin: 0 auto 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    font-family: 'Times New Roman', Times, Georgia, serif;
    page-break-after: always;
  }
  @media print {
    .ag-page {
      margin: 0;
      box-shadow: none;
      width: 100%;
      min-height: 100vh;
    }
  }
  .ag-page ul { padding-left: 18px; margin: 6px 0 10px; }
</style>

<!-- PAGE 1 -->
<div class="ag-page">
  ${pageHeader}

  <!-- Title -->
  <h2 style="font-size:14px;font-weight:700;color:#c9a84c;border-bottom:2px solid #c9a84c;padding-bottom:6px;margin:0 0 14px;">Astrology Matrix × ${creatorName}</h2>

  <!-- Info table -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px;">
    ${[
      ['Agreement Date', agreementDate],
      ['Brand (Company)', 'Astrology Matrix'],
      ['Brand Representative', 'Nishi Khandelwal, Collaboration Coordinator'],
      ['Brand Contact', 'onboarding@astrologymatrix.in'],
      ['Creator (Influencer)', creatorName],
      ['Creator Instagram Handle', handle],
      ['Creator Contact (Mobile)', phone],
      ['Creator Email', email],
      ['Product Assigned', `<strong>${product}</strong>`],
    ].map(([label, value]) => `
      <tr>
        <td style="padding:6px 10px;border:1px solid #d1d5db;background:#f9f6f0;width:38%;font-weight:600;color:#6d28a7;">${label}</td>
        <td style="padding:6px 10px;border:1px solid #d1d5db;color:#1a1a1a;">${value}</td>
      </tr>
    `).join('')}
  </table>

  ${para(`This Creator Collaboration Agreement (<strong>"Agreement"</strong>) is entered into between <strong>Astrology Matrix</strong>, a spiritual lifestyle and crystal products brand based in India ("Brand"), and the Creator/Influencer named above ("Creator"). Both parties agree to the following terms governing this collaboration.`)}

  ${sectionTitle('1', 'SCOPE OF COLLABORATION')}
  ${subTitle('The Creator agrees to create and publish the following content:')}
  <ul>
    ${bullet(`1 (one) Instagram Reel — minimum ${reelMinSec} seconds and maximum ${reelMaxSec} seconds (${Math.round(reelMaxSec/60)} minute) in duration, featuring the assigned Astrology Matrix product`)}
    ${bullet('1 (one) Instagram Story Share — sharing the Reel or product content to the Creator\'s Story, with a visible tag to @AstrologyMatrix and @AstrologyMatrixStore')}
    ${bullet('Content must be original, authentic, and reflect the Creator\'s genuine experience with the product')}
    ${bullet(`The Reel and Story must go live on the Creator's Instagram profile within ${postDays} (${numberToWords(postDays)}) days of receiving the product, unless a different deadline is mutually agreed in writing.`)}
  </ul>

  ${sectionTitle('2', 'COMPENSATION & PRODUCT')}
  ${subTitle('In consideration of the Creator fulfilling their obligations, the Brand agrees to provide:')}
  <ul>
    ${bullet(`<strong>Free Product:</strong> One (1) Astrology Matrix crystal product as specified above — <strong>${product}</strong> — shipped at the Brand's cost to the Creator's address`)}
    ${bullet(`<strong>Cash Compensation:</strong> INR ${paymentAmount} (Rupees ${amountWords} Only) to be paid via UPI/bank transfer within 24 hours of the Creator sharing the live Reel link with the Brand`)}
  </ul>

  ${pageFooter(1)}
</div>

<!-- PAGE 2 -->
<div class="ag-page">
  ${pageHeader}

  <ul>
    ${bullet('<strong>Channel Feature:</strong> The Brand may repost, share, or repurpose the Creator\'s Reel and Story across official Astrology Matrix channels, with full credit to the Creator')}
  </ul>

  ${para('Payment will only be released after the Brand verifies that the Reel and Story are live, meet the content requirements set out in Section 3, and are tagged correctly.', true)}

  ${sectionTitle('3', 'CONTENT REQUIREMENTS')}
  ${subTitle("The Creator's content must meet the following standards:")}
  <ul>
    ${bullet('The product must be clearly visible in both the Reel and the Story Share')}
    ${bullet('The Instagram handle @AstrologyMatrix and @AstrologyMatrixStore must be tagged in both the Reel caption and the Story Share')}
    ${bullet('The hashtag #astrologymatrix or #AMArmy must appear in the Reel caption or Story')}
    ${bullet(`The Reel must be between ${reelMinSec} seconds and ${reelMaxSec} seconds (${Math.round(reelMaxSec/60)} minute) in duration`)}
    ${bullet('The Reel must include at least one clear close-up shot of the product')}
    ${bullet('Content must be filmed in good lighting and be visually presentable')}
    ${bullet('The Story must remain live for a minimum of 24 hours')}
    ${bullet(`The Reel must remain live on the Creator's profile for a minimum of ${reelLiveDays} (${numberToWords(reelLiveDays)}) days from the date of posting`)}
    ${bullet('The Creator must not make false medical, therapeutic, or health claims about the product')}
    ${bullet('The Creator must not tag or mention any competitor crystal or spiritual product brand in the same post')}
    ${bullet('Sponsored/gifted disclosure (e.g.#Gifted or #Collab) must be included as per Instagram guidelines and Indian advertising standards')}
  </ul>

  ${sectionTitle('4', 'INTELLECTUAL PROPERTY & USAGE RIGHTS')}
  <ul>
    ${bullet('<strong>Creator Ownership:</strong> The Creator retains ownership of the content they produce under this Agreement')}
    ${bullet('</strong>Brand Licence:</strong> By entering into this Agreement, the Creator grants Astrology Matrix a non-exclusive, royalty-free, worldwide licence to repost, share, and repurpose the Reel and Story content across all official Astrology Matrix channels — including but not limited to Instagram, WhatsApp, YouTube, website, and any other owned or operated digital platforms — with credit to the Creator wherever applicable')}
    ${bullet('<strong>Paid Advertising Rights:</strong> The Creator additionally grants Astrology Matrix the unrestricted right to use their content as paid advertising creative across any platform (including but not limited to Meta/Instagram Ads, Spark Ads, boosted posts, WhatsApp campaigns) for a period of 12 (twelve) months from the date of posting, at the Brand\'s sole discretion. No additional compensation is payable for this usage')}
    ${bullet('<strong>No Material Alteration:</strong> The Brand will not materially alter the Creator\'s content in a way that misrepresents them, without prior consent')}
  </ul>

  ${pageFooter(2)}
</div>

<!-- PAGE 3 -->
<div class="ag-page">
  ${pageHeader}

  ${sectionTitle('5', 'CONFIDENTIALITY')}
  ${para('Both parties agree to keep the commercial terms of this Agreement (specifically the cash compensation amount) confidential. The Creator may publicly share that they collaborated with Astrology Matrix and may disclose that the product was gifted/sponsored as required by advertising regulations — but must not disclose the specific payment amount.')}

  ${sectionTitle('6', 'CREATOR REPRESENTATIONS & WARRANTIES')}
  ${para('The Creator represents and warrants that:')}
  <ul>
    ${bullet('They are the genuine owner and operator of the Instagram account named above')}
    ${bullet('Their account is in good standing and not subject to any platform ban or restriction')}
    ${bullet('All content created is original and does not infringe any third-party intellectual property rights')}
    ${bullet('They have the full right to enter into this Agreement and fulfil their obligations')}
    ${bullet('They will not engage in any fraudulent activity, including purchasing fake views, likes, or followers to inflate performance metrics')}
    ${bullet('If the Creator is under 18 years of age, they confirm they have parental or guardian consent to enter into this Agreement')}
  </ul>

  ${sectionTitle('7', 'NON-COMPETE & EXCLUSIVITY')}
  ${para(`During the period of this collaboration and for <strong>${nonCompeteDays} (${numberToWords(nonCompeteDays)}) days</strong> after the Reel goes live, the Creator agrees not to create sponsored or gifted content for any direct competitor of Astrology Matrix in the crystal jewellery, spiritual bracelet, or crystal anklet product category, without the Brand's prior written consent.`)}

  ${sectionTitle('8', 'DEFAULT & CONSEQUENCES')}
  ${para('If the Creator fails to post the required content within the agreed timeframe, or posts content that materially violates these terms:')}
  <ul>
    ${bullet(`The Brand reserves the right to withhold or recover the cash compensation of INR ${paymentAmount}`)}
    ${bullet("If the product has already been delivered, the Creator may be required to return it at their own cost, or the Brand may deduct the product's retail value from any future payments")}
    ${bullet('The Brand may terminate this Agreement immediately by written notice (WhatsApp/email)')}
  </ul>
  ${para('Minor content corrections (e.g. missing hashtag) will first be requested with a 48-hour correction window.', true)}

  ${sectionTitle('10', 'GENERAL PROVISIONS')}

  ${pageFooter(3)}
</div>

<!-- PAGE 4 -->
<div class="ag-page">
  ${pageHeader}

  <ul>
    ${bullet('<strong>Entire Agreement:</strong> This document constitutes the entire agreement between the parties for this collaboration and supersedes all prior verbal or written communications')}
    ${bullet('<strong>Amendments:</strong> Any changes to this Agreement must be agreed in writing (WhatsApp or email confirmation is acceptable)')}
    ${bullet('<strong>Governing Law:</strong> This Agreement is governed by the laws of India')}
    ${bullet('<strong>Severability:</strong> If any clause is found to be unenforceable, the remaining clauses remain in full force')}
  </ul>

  <h3 style="font-size:12px;font-weight:700;color:#c9a84c;margin:22px 0 8px;letter-spacing:0.5px;">SIGNATURES</h3>
  ${para('By signing below, both parties agree to be bound by the terms of this Agreement.')}

  <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:12px;">
    <tr>
      <th style="text-align:left;padding:8px 12px;background:#f3f4f6;border:1px solid #d1d5db;font-weight:700;color:#1a1a1a;width:50%;">FOR ASTROLOGY MATRIX</th>
      <th style="text-align:left;padding:8px 12px;background:#f3f4f6;border:1px solid #d1d5db;font-weight:700;color:#1a1a1a;width:50%;">CREATOR / INFLUENCER</th>
    </tr>
    <tr>
      <td style="padding:20px 12px 8px;border:1px solid #d1d5db;height:40px;vertical-align:bottom;">
        <em style="font-style:italic;color:#555;">Yachika</em>
      </td>
      <td style="padding:20px 12px 8px;border:1px solid #d1d5db;height:40px;vertical-align:bottom;">
        ${sigBlock}
      </td>
    </tr>
    <tr>
      <td style="padding:8px 12px 14px;border:1px solid #d1d5db;">
        <em style="font-style:italic;color:#555;">Yachika Verma — ${agreementDate}</em>
      </td>
      <td style="padding:8px 12px 14px;border:1px solid #d1d5db;">
        ${sigDateBlock}
      </td>
    </tr>
  </table>

  <p style="text-align:center;color:#c9a84c;font-weight:700;margin-top:32px;font-size:12px;">✦ &nbsp; Thank you for being part of the Astrology Matrix Creator Army &nbsp; ✦</p>

  ${pageFooter(4)}
</div>
`;
}
