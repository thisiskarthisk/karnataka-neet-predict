// // lib/wati.ts
// //
// // Helper for sending WhatsApp messages via WATI.
// // Requires these env vars (server-side only, no NEXT_PUBLIC_ prefix):
// //
// //   WATI_API_ENDPOINT=https://live-mt-server.wati.io/10208179
// //   WATI_BEARER_TOKEN=your-bearer-token
// //   WATI_TEMPLATE_NAME=counselling_kit_message_to_student

// const WATI_API_ENDPOINT = process.env.WATI_API_ENDPOINT;
// const WATI_BEARER_TOKEN = process.env.WATI_BEARER_TOKEN;
// const WATI_TEMPLATE_NAME = process.env.WATI_TEMPLATE_NAME;

// function assertEnv() {
//   if (!WATI_API_ENDPOINT) throw new Error("Missing env var: WATI_API_ENDPOINT");
//   if (!WATI_BEARER_TOKEN) throw new Error("Missing env var: WATI_BEARER_TOKEN");
// }

// export interface WatiTemplateParameter {
//   name: string;
//   value: string;
// }

// export interface SendTemplateMessageOptions {
//   /** Recipient phone number, with country code, no + or spaces. e.g. "919876543210" */
//   whatsappNumber: string;
//   /** Defaults to WATI_TEMPLATE_NAME from env if omitted */
//   templateName?: string;
//   /** Values for {{1}}, {{2}}, ... placeholders in the template */
//   parameters?: WatiTemplateParameter[];
//   /** Optional, shows up in WATI dashboard/broadcast logs */
//   broadcastName?: string;
// }

// export interface WatiApiResponse {
//   result: boolean;
//   info?: string;
//   [key: string]: unknown;
// }

// /**
//  * Sends a pre-approved WhatsApp template message via WATI.
//  */
// export async function sendTemplateMessage({
//   whatsappNumber,
//   templateName,
//   parameters = [],
//   broadcastName,
// }: SendTemplateMessageOptions): Promise<WatiApiResponse> {
//   assertEnv();

//   const resolvedTemplateName = templateName ?? WATI_TEMPLATE_NAME;
//   if (!resolvedTemplateName) {
//     throw new Error(
//       "No template name provided and WATI_TEMPLATE_NAME is not set in env"
//     );
//   }

//   const url = new URL(
//     `${WATI_API_ENDPOINT}/api/v1/sendTemplateMessage`
//   );
//   url.searchParams.set("whatsappNumber", whatsappNumber);

//   const res = await fetch(url.toString(), {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json-patch+json",
//       Authorization: `Bearer ${WATI_BEARER_TOKEN}`,
//     },
//     body: JSON.stringify({
//       template_name: resolvedTemplateName,
//       broadcast_name: broadcastName ?? `${resolvedTemplateName}_${Date.now()}`,
//       parameters,
//     }),
//   });

//   const data = (await res.json().catch(() => ({}))) as WatiApiResponse;

//   if (!res.ok || data.result === false) {
//     throw new Error(
//       `WATI sendTemplateMessage failed: ${res.status} ${data.info ?? res.statusText}`
//     );
//   }

//   return data;
// }

// /**
//  * Sends a plain session (free-text) message.
//  * Only works within WhatsApp's 24-hour customer service window —
//  * for first contact / outside that window, use sendTemplateMessage instead.
//  */
// export async function sendSessionMessage(
//   whatsappNumber: string,
//   messageText: string
// ): Promise<WatiApiResponse> {
//   assertEnv();

//   const url = new URL(
//     `${WATI_API_ENDPOINT}/api/v1/sendSessionMessage/${whatsappNumber}`
//   );
//   url.searchParams.set("messageText", messageText);

//   const res = await fetch(url.toString(), {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${WATI_BEARER_TOKEN}`,
//     },
//   });

//   const data = (await res.json().catch(() => ({}))) as WatiApiResponse;

//   if (!res.ok || data.result === false) {
//     throw new Error(
//       `WATI sendSessionMessage failed: ${res.status} ${data.info ?? res.statusText}`
//     );
//   }

//   return data;
// }



// lib/wati.ts
//
// Helper for sending WhatsApp messages via WATI.
// Requires these env vars (server-side only, no NEXT_PUBLIC_ prefix):
//
//   WATI_API_ENDPOINT=https://live-mt-server.wati.io/10208179
//   WATI_BEARER_TOKEN=your-bearer-token
//   WATI_TEMPLATE_NAME=counselling_kit_message_to_student

const WATI_API_ENDPOINT = process.env.WATI_API_ENDPOINT;
const WATI_BEARER_TOKEN = process.env.WATI_BEARER_TOKEN;
const WATI_TEMPLATE_NAME = process.env.WATI_TEMPLATE_NAME;

function assertEnv() {
  if (!WATI_API_ENDPOINT) throw new Error("Missing env var: WATI_API_ENDPOINT");
  if (!WATI_BEARER_TOKEN) throw new Error("Missing env var: WATI_BEARER_TOKEN");
}

export interface WatiTemplateParameter {
  name: string;
  value: string;
}

export interface SendTemplateMessageOptions {
  /** Recipient phone number, with country code, no + or spaces. e.g. "919876543210" */
  whatsappNumber: string;
  /** Defaults to WATI_TEMPLATE_NAME from env if omitted */
  templateName?: string;
  /** Values for {{1}}, {{2}}, ... placeholders in the template */
  parameters?: WatiTemplateParameter[];
  /** Optional, shows up in WATI dashboard/broadcast logs */
  broadcastName?: string;
}

export interface WatiApiResponse {
  result: boolean;
  info?: string;
  [key: string]: unknown;
}

/**
 * Sends a pre-approved WhatsApp template message via WATI.
 */
export async function sendTemplateMessage({
  whatsappNumber,
  templateName,
  parameters = [],
  broadcastName,
}: SendTemplateMessageOptions): Promise<WatiApiResponse> {
  assertEnv();

  const resolvedTemplateName = templateName ?? WATI_TEMPLATE_NAME;
  if (!resolvedTemplateName) {
    throw new Error(
      "No template name provided and WATI_TEMPLATE_NAME is not set in env"
    );
  }

  const url = new URL(
    `${WATI_API_ENDPOINT}/api/v1/sendTemplateMessage`
  );
  url.searchParams.set("whatsappNumber", whatsappNumber);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json-patch+json",
      Authorization: `Bearer ${WATI_BEARER_TOKEN}`,
    },
    body: JSON.stringify({
      template_name: resolvedTemplateName,
      broadcast_name: broadcastName ?? `${resolvedTemplateName}_${Date.now()}`,
      parameters,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as WatiApiResponse;

  if (!res.ok || data.result === false) {
    throw new Error(
      `WATI sendTemplateMessage failed: ${res.status} ${data.info ?? res.statusText}`
    );
  }

  return data;
}

/**
 * Sends a plain session (free-text) message.
 * Only works within WhatsApp's 24-hour customer service window —
 * for first contact / outside that window, use sendTemplateMessage instead.
 */
export async function sendSessionMessage(
  whatsappNumber: string,
  messageText: string
): Promise<WatiApiResponse> {
  assertEnv();

  const url = new URL(
    `${WATI_API_ENDPOINT}/api/v1/sendSessionMessage/${whatsappNumber}`
  );
  url.searchParams.set("messageText", messageText);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WATI_BEARER_TOKEN}`,
    },
  });

  const data = (await res.json().catch(() => ({}))) as WatiApiResponse;

  if (!res.ok || data.result === false) {
    throw new Error(
      `WATI sendSessionMessage failed: ${res.status} ${data.info ?? res.statusText}`
    );
  }

  return data;
}