// // // import { NextRequest, NextResponse } from 'next/server';

// // // export async function POST(req: NextRequest) {
// // //   try {
// // //     const body = await req.json();
// // //     const { name, phone, email, rank, exam, course, category, states, colleges, messageText } = body;

// // //     if (!phone) {
// // //       return NextResponse.json({ error: 'WhatsApp phone number is required.' }, { status: 400 });
// // //     }

// // //     // Clean phone number (strip non-digits)
// // //     let cleanPhone = (phone || '').replace(/\D/g, '');
// // //     if (cleanPhone.length === 10) {
// // //       cleanPhone = `91${cleanPhone}`;
// // //     }

// // //     const studentName = name || 'Student';
// // //     const studentRank = rank || 'AIR 106';
// // //     const studentExam = exam || 'NEET UG';
// // //     const studentCourse = course || 'MBBS';
// // //     const studentCategory = category || 'General / All Categories';
// // //     const studentStates = typeof states === 'string' ? states : 'KA ( KA means Karnataka )';

// // //     let collegesSummary = '';
// // //     if (Array.isArray(colleges) && colleges.length > 0) {
// // //       collegesSummary = colleges.map((c: any, i: number) => {
// // //         if (typeof c === 'string') return `${i + 1}. ${c}`;
// // //         const cName = c.college_name || c.name || `College ${i + 1}`;
// // //         const cutoff = c.closest_cutoff ? ` (Cutoff: AIR ~${c.closest_cutoff})` : '';
// // //         return `${i + 1}. ${cName}${cutoff}`;
// // //       }).join('; ');
// // //     } else {
// // //       collegesSummary = 'Karnataka Medical & Dental Colleges';
// // //     }

// // //     const watiEndpoint = (process.env.WATI_API_ENDPOINT || 'https://live-mt-server.wati.io/10208179').replace(/\/$/, '');
// // //     const rawToken = (process.env.WATI_BEARER_TOKEN || '').trim();
// // //     const authToken = rawToken.startsWith('Bearer ') ? rawToken : `Bearer ${rawToken}`;
// // //     const templateName = (process.env.WATI_TEMPLATE_NAME || 'counselling_kit_message_to_student').trim();

// // //     let watiSent = false;
// // //     let watiResponseData = null;

// // //     if (rawToken) {
// // //       try {
// // //         const url = `${watiEndpoint}/api/v1/sendTemplateMessage?whatsappNumber=${cleanPhone}`;
// // //         const watiRes = await fetch(url, {
// // //           method: 'POST',
// // //           headers: {
// // //             'Authorization': authToken,
// // //             'Content-Type': 'application/json',
// // //           },
// // //           body: JSON.stringify({
// // //             template_name: templateName,
// // //             broadcast_name: 'counselling_kit_alert',
// // //             parameters: [
// // //               { name: 'name', value: studentName },
// // //               { name: 'rank', value: studentRank },
// // //               { name: 'exam', value: studentExam },
// // //               { name: 'course', value: studentCourse },
// // //               { name: 'category', value: studentCategory },
// // //               { name: 'states', value: studentStates },
// // //               { name: 'colleges', value: collegesSummary }
// // //             ]
// // //           })
// // //         });

// // //         if (watiRes.ok) {
// // //           watiSent = true;
// // //           watiResponseData = await watiRes.json();
// // //           console.log(`[WATI API Success] Template message sent to ${cleanPhone}`);
// // //         } else {
// // //           const errText = await watiRes.text();
// // //           console.warn(`[WATI API Warning] Call returned status ${watiRes.status}:`, errText);
// // //         }
// // //       } catch (watiErr) {
// // //         console.error('[WATI API Error]:', watiErr);
// // //       }
// // //     } else {
// // //       console.warn('[WATI API] WATI_BEARER_TOKEN is not configured.');
// // //     }

// // //     const waLink = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText || '')}`;

// // //     return NextResponse.json({
// // //       success: true,
// // //       phone: cleanPhone,
// // //       watiSent,
// // //       watiResponse: watiResponseData,
// // //       whatsappUrl: waLink,
// // //       message: 'WhatsApp counselling kit process completed.'
// // //     });
// // //   } catch (error: any) {
// // //     console.error('WhatsApp API Route Error:', error);
// // //     return NextResponse.json({ error: 'Failed to process WhatsApp message request.' }, { status: 500 });
// // //   }
// // // }




// // import { NextRequest, NextResponse } from 'next/server';

// // // ── Env vars required (set these in .env.local / hosting dashboard) ──
// // // WATI_API_ENDPOINT   e.g. https://live-mt-server.wati.io/123456   (your WATI instance URL)
// // // WATI_BEARER_TOKEN   your WATI API access token (with or without "Bearer " prefix)
// // // WATI_TEMPLATE_NAME  the exact, APPROVED template name in WATI (default below)

// // export async function POST(req: NextRequest) {
// //   try {
// //     const body = await req.json();
// //     const { name, phone, email, rank, exam, course, category, states, colleges, messageText } = body;

// //     if (!phone) {
// //       return NextResponse.json({ error: 'WhatsApp phone number is required.' }, { status: 400 });
// //     }

// //     // ── Clean & normalize phone number ──
// //     let cleanPhone = String(phone).replace(/\D/g, '');
// //     if (cleanPhone.length === 10) {
// //       cleanPhone = `91${cleanPhone}`; // default to India country code
// //     }
// //     if (cleanPhone.length < 11) {
// //       return NextResponse.json({ error: 'Invalid WhatsApp phone number.' }, { status: 400 });
// //     }

// //     const studentName = name || 'Student';
// //     const studentRank = rank || 'AIR 106';
// //     const studentExam = exam || 'NEET UG';
// //     const studentCourse = course || 'MBBS';
// //     const studentCategory = category || 'General / All Categories';
// //     const studentStates = typeof states === 'string' ? states : 'KA ( KA means Karnataka )';

// //     let collegesSummary = 'Karnataka Medical & Dental Colleges';
// //     if (Array.isArray(colleges) && colleges.length > 0) {
// //       collegesSummary = colleges
// //         .map((c: any, i: number) => {
// //           if (typeof c === 'string') return `${i + 1}. ${c}`;
// //           const cName = c.college_name || c.name || `College ${i + 1}`;
// //           const cutoff = c.closest_cutoff ? ` (Cutoff: AIR ~${c.closest_cutoff})` : '';
// //           return `${i + 1}. ${cName}${cutoff}`;
// //         })
// //         .join('; ');
// //     }

// //     // ── Env / config validation ──
// //     const rawEndpoint = (process.env.WATI_API_ENDPOINT || '').trim();
// //     const rawToken = (process.env.WATI_BEARER_TOKEN || '').trim();
// //     const templateName = (process.env.WATI_TEMPLATE_NAME || 'counselling_kit_message_to_student').trim();

// //     if (!rawEndpoint || !rawToken) {
// //       console.warn('[WATI] Missing WATI_API_ENDPOINT or WATI_BEARER_TOKEN env var.');
// //       return NextResponse.json({
// //         success: false,
// //         watiSent: false,
// //         error: 'WATI is not configured on the server (missing endpoint or token).',
// //         whatsappUrl: `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText || '')}`,
// //       });
// //     }

// //     const watiEndpoint = rawEndpoint.replace(/\/$/, '');
// //     const authToken = rawToken.startsWith('Bearer ') ? rawToken : `Bearer ${rawToken}`;

// //     // IMPORTANT: WATI matches "parameters" to your approved template's {{1}}, {{2}}, ...
// //     // placeholders BY ORDER, not by the "name" string. Keep this order in sync with
// //     // however your template was written and approved in the WATI dashboard.
// //     const parameters = [
// //       { name: '1', value: studentName },
// //       { name: '2', value: studentRank },
// //       { name: '3', value: studentExam },
// //       { name: '4', value: studentCourse },
// //       { name: '5', value: studentCategory },
// //       { name: '6', value: studentStates },
// //       { name: '7', value: collegesSummary },
// //     ];

// //     let watiSent = false;
// //     let watiResponseData: any = null;

// //     try {
// //       const url = `${watiEndpoint}/api/v1/sendTemplateMessage?whatsappNumber=${cleanPhone}`;
// //       const watiRes = await fetch(url, {
// //         method: 'POST',
// //         headers: {
// //           Authorization: authToken,
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({
// //           template_name: templateName,
// //           broadcast_name: 'counselling_kit_alert',
// //           parameters,
// //         }),
// //       });

// //       const rawText = await watiRes.text();
// //       try {
// //         watiResponseData = JSON.parse(rawText);
// //       } catch {
// //         watiResponseData = rawText;
// //       }

// //       if (watiRes.ok && (watiResponseData?.result === true || watiResponseData?.result === undefined)) {
// //         watiSent = true;
// //         console.log(`[WATI] Template message sent to ${cleanPhone}`);
// //       } else {
// //         console.warn(`[WATI] Non-success response (status ${watiRes.status}):`, watiResponseData);
// //       }
// //     } catch (watiErr) {
// //       console.error('[WATI] Request failed:', watiErr);
// //       watiResponseData = String(watiErr);
// //     }

// //     const waLink = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText || '')}`;

// //     return NextResponse.json({
// //       success: true,
// //       phone: cleanPhone,
// //       watiSent,
// //       watiResponse: watiResponseData,
// //       whatsappUrl: waLink,
// //       message: watiSent
// //         ? 'WATI template message sent successfully.'
// //         : 'WATI send failed or not confirmed — see watiResponse for details.',
// //     });
// //   } catch (error: any) {
// //     console.error('WhatsApp API Route Error:', error);
// //     return NextResponse.json({ error: 'Failed to process WhatsApp message request.' }, { status: 500 });
// //   }
// // }



// // app/api/whatsapp/route.ts
// //
// // Called from CounsellingModal.tsx with:
// //   { name, phone, email, rank, exam, course, category, states, colleges, messageText }
// //
// // Sends the WATI "counselling_kit_message_to_student" template to the student's
// // WhatsApp number. Adjust the `parameters` array below to match the exact
// // variable names configured for your template in the WATI dashboard
// // (Manage Templates > counselling_kit_message_to_student).

// import { NextRequest, NextResponse } from "next/server";
// import { sendTemplateMessage } from "@/lib/wati";

// function normalizeIndianNumber(raw: string): string {
//   const digits = (raw || "").replace(/\D/g, "");
//   if (digits.length === 10) return `91${digits}`;
//   if (digits.length === 12 && digits.startsWith("91")) return digits;
//   return digits; // fall back to whatever was given, digits only
// }

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const {
//       name,
//       phone,
//       email,
//       rank,
//       exam,
//       course,
//       category,
//       states,
//       colleges,
//       messageText,
//     } = body ?? {};

//     if (!phone) {
//       return NextResponse.json({ error: "phone is required" }, { status: 400 });
//     }

//     const whatsappNumber = normalizeIndianNumber(phone);

//     const collegeNames = Array.isArray(colleges)
//       ? colleges
//           .map((c: any) => c.college_name || c.name)
//           .filter(Boolean)
//           .join(", ")
//       : "";

//     // NOTE: parameter `name` values here must match your WATI template's
//     // variable names exactly (check WATI dashboard). Common pattern is
//     // positional names like "1", "2", "3"... — swap below if that's the case.
//     const result = await sendTemplateMessage({
//       whatsappNumber,
//       parameters: [
//         { name: "name", value: name || "Student" },
//         { name: "rank", value: rank || "" },
//         { name: "exam", value: exam || "" },
//         { name: "course", value: course || "" },
//         { name: "category", value: category || "" },
//         { name: "states", value: states || "" },
//         { name: "colleges", value: collegeNames || "Selected colleges" },
//       ],
//     });

//     return NextResponse.json({ success: true, result });
//   } catch (err) {
//     console.error("WATI /api/whatsapp error:", err);
//     // Don't fail the whole submission flow just because WATI had an issue —
//     // the modal already opens a direct wa.me link as a fallback delivery path.
//     return NextResponse.json(
//       { success: false, error: err instanceof Error ? err.message : "Unknown error" },
//       { status: 200 }
//     );
//   }
// }



// app/api/whatsapp/route.ts
//
// Called from CounsellingModal.tsx with:
//   { name, phone, email, rank, exam, course, category, states, colleges, messageText }
//
// Sends the WATI "counselling_kit_message_to_student" template, which has a
// single {{name}} variable in its body — matching the WATI API playground
// pattern: parameters: [{ "name": "name", "value": "John" }]

import { NextRequest, NextResponse } from "next/server";
import { sendTemplateMessage } from "@/lib/wati";

function normalizeIndianNumber(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits; // fall back to whatever was given, digits only
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone } = body ?? {};

    if (!phone) {
      return NextResponse.json({ error: "phone is required" }, { status: 400 });
    }

    const whatsappNumber = normalizeIndianNumber(phone);

    const result = await sendTemplateMessage({
      whatsappNumber,
      parameters: [{ name: "name", value: name || "Student" }],
    });

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("WATI /api/whatsapp error:", err);
    // Don't fail the whole submission flow just because WATI had an issue —
    // the modal already opens a direct wa.me link as a fallback delivery path.
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 200 }
    );
  }
}