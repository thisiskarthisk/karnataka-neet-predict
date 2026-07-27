import { NextRequest, NextResponse } from 'next/server';

interface StudentProfile {
  course?: string;
  exam?: string;
  category?: string;
  quota?: string;
  states?: string[] | string;
  rank?: string;
}

interface RequestBody {
  studentProfile?: StudentProfile;
  selectedColleges?: any[];
  name?: string;
  email?: string;
}

function buildHTML(body: RequestBody): string {
  const { studentProfile = {}, selectedColleges = [], name } = body;
  const generatedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const statesDisplay = Array.isArray(studentProfile.states)
    ? (studentProfile.states.length === 0 || studentProfile.states.includes('AI')
        ? 'Karnataka (KA)'
        : studentProfile.states.join(', '))
    : (studentProfile.states || 'Karnataka (KA)');

  const collegesHTML = (selectedColleges || []).length === 0
    ? '<div style="padding:24px;text-align:center;color:#64748b;font-weight:600;">No colleges selected. Return to College Predictor to select colleges for counselling.</div>'
    : (selectedColleges || []).map((c: any, i: number) => {
        const cName = c.college_name || c.name || `Medical College ${i + 1}`;
        const cState = c.state_name || c.state || 'Karnataka';
        const cCity = c.city_name || c.city || '';
        const cType = c.college_type || c.type || 'Government';
        const cutoff = c.closest_cutoff ? `AIR ~${c.closest_cutoff.toLocaleString('en-IN')}` : 'TBA';
        const chance = c.best_chance || 'High';
        const chanceColor = chance === 'High' ? '#16a34a' : chance === 'Medium' ? '#d97706' : '#e11d48';
        const chanceBg = chance === 'High' ? '#f0fdf4' : chance === 'Medium' ? '#fffbeb' : '#fff1f2';

        const events = c.counsellingDetail?.events || c.events || [];
        const eventsList = (events || []).map((ev: any) => {
          const startDate = ev.startDate || ev.date || 'TBA';
          const endDate = ev.endDate ? ` to ${ev.endDate}` : '';
          const status = ev.status || 'Active';
          const statusColor = status.toLowerCase().includes('active') ? '#4f46e5' : '#64748b';

          return `<tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:10px 12px;font-weight:700;color:#0f172a;">${ev.event || ev.stage || 'Phase'}</td>
            <td style="padding:10px 12px;color:#4f46e5;font-weight:700;white-space:nowrap;">${startDate}${endDate}</td>
            <td style="padding:10px 12px;color:${statusColor};font-weight:700;text-transform:uppercase;font-size:10px;">${status}</td>
            <td style="padding:10px 12px;color:#475569;font-size:11px;line-height:1.4;">${ev.additionalDetails || ev.description || 'Follow portal instructions for choice entry'}</td>
          </tr>`;
        }).join('');

        return `
          <div style="margin-bottom:24px;padding:20px;border:1px solid #cbd5e1;border-radius:16px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.05);page-break-inside:avoid;">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px;border-bottom:1px solid #f1f5f9;padding-bottom:12px;">
              <div style="display:flex;align-items:center;gap:10px;">
                <span style="width:28px;height:28px;border-radius:8px;background:#4f46e5;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;">${i + 1}</span>
                <div>
                  <h3 style="margin:0;font-size:16px;font-weight:800;color:#0f172a;line-height:1.3;">${cName}</h3>
                  <p style="margin:4px 0 0;font-size:12px;color:#64748b;font-weight:600;">
                    ${cCity ? `${cCity}, ` : ''}${cState} &bull; <span style="text-transform:uppercase;font-weight:700;">${cType}</span>
                  </p>
                </div>
              </div>
              <div style="text-align:right;shrink:0;">
                <span style="display:inline-block;padding:4px 10px;border-radius:20px;background:${chanceBg};color:${chanceColor};font-size:11px;font-weight:800;border:1px solid ${chanceColor}40;">
                  ${chance} Chance
                </span>
                <p style="margin:4px 0 0;font-size:11px;font-weight:800;color:#1e293b;">Cutoff: ${cutoff}</p>
              </div>
            </div>

            <h4 style="margin:12px 0 8px;font-size:12px;font-weight:800;color:#4f46e5;text-transform:uppercase;letter-spacing:0.05em;">
              Official Counselling Stage &amp; Timeline Schedule:
            </h4>

            ${eventsList ? `
              <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:6px;">
                <thead>
                  <tr style="background:#f1f5f9;text-align:left;color:#475569;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;">
                    <th style="padding:8px 12px;border-radius:6px 0 0 6px;">Event / Stage</th>
                    <th style="padding:8px 12px;">Dates</th>
                    <th style="padding:8px 12px;">Status</th>
                    <th style="padding:8px 12px;border-radius:0 6px 6px 0;">Instructions &amp; Details</th>
                  </tr>
                </thead>
                <tbody>${eventsList}</tbody>
              </table>
            ` : '<p style="font-size:12px;color:#64748b;font-style:italic;margin:6px 0;">Counselling Schedule: KEA/MCC Round 1 Choice Filling and Option Entry active on state portal.</p>'}
          </div>
        `;
      }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NEET Counselling Strategy Plan – Karnataka AI Predictor</title>
  <style>
    @media print {
      body { padding: 0 !important; background: #fff !important; }
      .no-print { display: none !important; }
      .card { page-break-inside: avoid; }
    }
  </style>
</head>
<body style="margin:0;padding:28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f8fafc;color:#0f172a;">
  
  <!-- Header Banner -->
  <div style="background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%);border-radius:20px;padding:32px;margin-bottom:24px;color:#ffffff;box-shadow:0 4px 12px rgba(15,23,42,0.15);">
    <div style="display:inline-block;background:rgba(255,255,255,0.1);padding:6px 14px;border-radius:20px;font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#818cf8;margin-bottom:12px;">
      Karnataka AI NEET Predictor &bull; Official Report
    </div>
    <h1 style="margin:0;font-size:24px;font-weight:900;letter-spacing:-0.02em;">NEET Counselling Strategy &amp; Timeline Report</h1>
    <p style="margin:8px 0 0;font-size:13px;color:#cbd5e1;font-weight:500;">
      Prepared for <strong style="color:#ffffff;">${name || 'Medical Student'}</strong> &bull; Rank: <strong style="color:#818cf8;">${studentProfile?.rank || 'AIR 106'}</strong> &bull; Generated ${generatedAt}
    </p>
  </div>

  <!-- Student Admission Profile Card -->
  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:24px;margin-bottom:24px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
    <h2 style="margin:0 0 16px;font-size:15px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:0.05em;">Student Admission Profile</h2>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
      ${[
        ['NEET AIR Rank', studentProfile?.rank || 'AIR 106', '#4f46e5'],
        ['Target Course', studentProfile?.course || 'MBBS', '#0f172a'],
        ['NEET Exam', studentProfile?.exam || 'NEET UG', '#0f172a'],
        ['Category', studentProfile?.category || 'General / All Categories', '#0f172a'],
        ['Quota', studentProfile?.quota || 'State / AIQ Quota', '#0f172a'],
        ['Target State', statesDisplay, '#16a34a'],
      ].map(([label, value, color]) => `
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;">
          <p style="margin:0;font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">${label}</p>
          <p style="margin:4px 0 0;font-size:13px;font-weight:800;color:${color};">${value}</p>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- Selected Colleges & Counselling Timelines Section -->
  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:24px;margin-bottom:24px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
    <div style="display:flex;align-items:center;justify-space-between;margin-bottom:20px;border-bottom:1px solid #f1f5f9;padding-bottom:14px;">
      <h2 style="margin:0;font-size:16px;font-weight:900;color:#0f172a;">
        Selected Colleges &amp; Counselling Timelines (${(selectedColleges || []).length})
      </h2>
      <span style="font-size:11px;font-weight:700;color:#4f46e5;background:#eep2ff;padding:4px 12px;border-radius:12px;">
        Karnataka KEA &amp; MCC Quota
      </span>
    </div>
    ${collegesHTML}
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding:16px;color:#94a3b8;font-size:11px;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-weight:700;color:#64748b;">Karnataka AI NEET Predictor &bull; Official Medical Admissions Portal</p>
    <p style="margin:4px 0 0;">Report based on official KEA/MCC closing ranks and AI admission timelines.</p>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const htmlContent = buildHTML(body);

    let pdfBuffer: Buffer | null = null;
    try {
      // @ts-ignore
      const puppeteer = await import(/* webpackIgnore: true */ 'puppeteer').catch(() => null);
      if (puppeteer) {
        const browser = await puppeteer.default.launch({
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBytes = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
        });
        await browser.close();
        pdfBuffer = Buffer.from(pdfBytes);
      }
    } catch {}

    if (pdfBuffer) {
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="counselling-plan.pdf"',
        },
      });
    }

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': 'attachment; filename="counselling-plan.html"',
      },
    });
  } catch (error: any) {
    console.error('[PDF Route] Error:', error);
    return NextResponse.json({ error: 'Failed to generate counselling plan.' }, { status: 500 });
  }
}
