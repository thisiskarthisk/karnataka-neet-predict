import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, mobileNo, studentProfile, selectedColleges, type } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    if (!mobileNo) {
      return NextResponse.json({ error: 'Mobile number is required.' }, { status: 400 });
    }

    const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const port = parseInt((process.env.SMTP_PORT || '587').trim());
    const user = (process.env.SMTP_USER || '').trim();
    const pass = (process.env.SMTP_PASS || '').trim();
    const adminEmail = (process.env.ADMIN_EMAIL || user || 'admin@campuscontinents.com').trim();

    const requestedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Handle normal outside expert help (simple name + email booking)
    if (type === 'simple' || (!selectedColleges && !studentProfile)) {
      if (user && pass) {
        try {
          const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });

          // Admin Mail
          await transporter.sendMail({
            from: `"Campus Continents" <${user}>`,
            to: adminEmail,
            subject: `thank for book ${name || 'User'}`,
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:28px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;">
                <p style="color:#475569;font-size:14px;">A new expert consultation request has been submitted.</p>
                <div style="background:#fff;padding:16px;border-radius:12px;border:1px solid #e2e8f0;margin-top:16px;">
                  <p style="margin:0 0 8px;font-size:13px;color:#334155;"><strong>Name:</strong> ${name || 'Not provided'}</p>
                  <p style="margin:0 0 8px;font-size:13px;color:#334155;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                  <p style="margin:0 0 8px;font-size:13px;color:#334155;"><strong>Mobile Number:</strong> <a href="tel:${mobileNo}">${mobileNo}</a></p>
                  <p style="margin:0;font-size:13px;color:#334155;"><strong>Session Booking Date & Time:</strong> ${requestedAt}</p>
                </div>
              </div>
            `,
          });

          // Student Mail
          await transporter.sendMail({
            from: `"Campus Continents" <${user}>`,
            to: email,
            subject: 'Thanks you for the Confirm',
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:28px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;">
                <div style="background:linear-gradient(135deg,#10b981,#059669);border-radius:12px;padding:20px;color:#fff;margin-bottom:20px;text-align:center;">
                  <h2 style="margin:0;font-size:20px;">Thanks you for the Confirm</h2>
                  <p style="margin:6px 0 0;opacity:0.9;font-size:12px;">Campus Continents Medical Admissions</p>
                </div>
                <p style="color:#0f172a;font-size:14px;font-weight:bold;">Dear ${name || 'Student'},</p>
                <p style="color:#475569;font-size:13px;line-height:1.7;">Your booking is confirmed! Our admission experts will reach out to you within 24 hours.</p>
                <p style="color:#475569;font-size:13px;line-height:1.7;margin-top:20px;">Best regards,<br/><strong style="color:#0f172a;">Campus Continents Team</strong></p>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error('[send-email simple] Error:', emailErr);
        }
      }

      return NextResponse.json({ message: 'your booking confirm' }, { status: 200 });
    }

    // Handle full counselling details email (from Counselling Page)
    const collegeListHTML = (selectedColleges || []).map((c: any, i: number) => {
      const eventsList = (c.counsellingDetail?.events || []).map((ev: any) =>
        `<li style="margin-bottom:4px;"><strong>${ev.event}</strong> ${ev.date ? `(${ev.date})` : ''}${ev.additionalDetails ? ` — ${ev.additionalDetails}` : ''}</li>`
      ).join('');

      return `
        <div style="margin-bottom:16px; padding:14px; border:1px solid #e2e8f0; border-radius:12px; background:#fff;">
          <h4 style="margin:0 0 6px; color:#0f172a; font-size:14px;">${i + 1}. ${c.college_name} (${c.state_name || ''})</h4>
          <p style="margin:0 0 8px; font-size:11px; color:#64748b; font-weight:600;">${c.college_type || 'Government'} · ${c.best_chance || 'Reach'} Chance</p>
          <p style="margin:0 0 6px; font-size:12px; font-weight:700; color:#4f46e5;">Actual Counselling Schedule:</p>
          ${eventsList ? `<ul style="margin:0; padding-left:18px; font-size:11px; color:#475569; line-height:1.6;">${eventsList}</ul>` : '<p style="margin:0; font-size:11px; color:#94a3b8; font-style:italic;">Counselling Schedule Not Available</p>'}
        </div>
      `;
    }).join('');

    const profileHTML = studentProfile ? `
      <div style="background:#fff; padding:14px; border-radius:12px; border:1px solid #e2e8f0; margin-bottom:16px;">
        <h4 style="margin:0 0 8px; color:#0f172a; font-size:13px;">Student Admission Profile</h4>
        <p style="margin:0 0 4px; font-size:12px; color:#334155;"><strong>NEET Rank:</strong> AIR ${studentProfile.rank || '—'}</p>
        <p style="margin:0 0 4px; font-size:12px; color:#334155;"><strong>Course:</strong> ${studentProfile.course || '—'}</p>
        <p style="margin:0 0 4px; font-size:12px; color:#334155;"><strong>Exam:</strong> ${studentProfile.exam || '—'}</p>
        <p style="margin:0 0 4px; font-size:12px; color:#334155;"><strong>Category:</strong> ${studentProfile.category || '—'}</p>
        <p style="margin:0; font-size:12px; color:#334155;"><strong>States:</strong> ${Array.isArray(studentProfile.states) ? studentProfile.states.join(', ') : studentProfile.states || 'All India'}</p>
      </div>
    ` : '';

    if (user && pass) {
      try {
        const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });

        // Admin Mail
        await transporter.sendMail({
          from: `"Campus Continents" <${user}>`,
          to: adminEmail,
          subject: `Counselling Kit Delivered to ${name || 'a User'}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:28px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;">
              <p style="color:#475569;font-size:13px;">A student has received their counselling kit for the requested colleges. Below is the copy of information shared to them.</p>
              
              <div style="background:#fff;padding:14px;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:16px;">
                <p style="margin:0 0 6px;font-size:12px;color:#334155;"><strong>Name:</strong> ${name || 'Not provided'}</p>
                <p style="margin:0 0 6px;font-size:12px;color:#334155;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p style="margin:0 0 8px;font-size:13px;color:#334155;"><strong>Mobile Number:</strong> <a href="tel:${mobileNo}">${mobileNo}</a></p>
                <p style="margin:0;font-size:12px;color:#334155;"><strong>Date & Time:</strong> ${requestedAt}</p>
              </div>

              ${profileHTML}

              <h3 style="color:#4f46e5;margin-top:20px;margin-bottom:12px;font-size:15px;">Counselling Data</h3>
              ${collegeListHTML || '<p style="color:#64748b;font-size:12px;">No colleges selected.</p>'}
            </div>
          `,
        });

        // Student Mail
        await transporter.sendMail({
          from: `"Campus Continents" <${user}>`,
          to: email,
          subject: 'Your Counselling Kit',
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:28px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;">
              <div style="background:linear-gradient(135deg,#10b981,#059669);border-radius:12px;padding:24px;color:#fff;margin-bottom:20px;text-align:center;">
                <h1 style="margin:0;font-size:22px;">Counselling Kit</h1>
                <p style="margin:6px 0 0;opacity:0.9;font-size:13px;">Campus Continents Medical Admissions</p>
              </div>

              <p style="color:#0f172a;font-size:14px;font-weight:bold;">Dear ${name || 'Student'},</p>
              <p style="color:#475569;font-size:13px;line-height:1.7;">Please find the counselling kit for your requested colleges. Some dates are predicted based on previous academic data. Please confirm with the colleges for accuracy.</p>

              <h3 style="color:#059669;margin-top:20px;margin-bottom:12px;font-size:15px;">Counselling Data</h3>
              ${collegeListHTML || '<p style="color:#64748b;font-size:12px;">No colleges selected.</p>'}

              <p style="color:#475569;font-size:13px;line-height:1.7;margin-top:24px;">Best regards,<br/><strong style="color:#0f172a;">Campus Continents Team</strong></p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('[send-email full] Error:', emailErr);
      }
    }

    return NextResponse.json({ message: 'Request submitted successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('[send-email] API Error:', error);
    return NextResponse.json({ error: 'Failed to send email request.' }, { status: 500 });
  }
}
