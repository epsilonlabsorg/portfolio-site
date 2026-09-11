const MAX_BODY_BYTES = 24000;
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseEnquiry(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const limits = {
    name: 100,
    email: 254,
    company: 150,
    service: 100,
    message: 4000,
  };
  const values = {};
  for (const [field, max] of Object.entries(limits)) {
    const value = body[field] ?? "";
    if (typeof value !== "string" || value.length > max) return null;
    values[field] = value.trim();
  }
  if (
    !values.name ||
    values.message.length < 10 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ||
    typeof body.submissionId !== "string" ||
    !uuid.test(body.submissionId)
  )
    return null;
  values.email = values.email.toLowerCase();
  return { ...values, id: body.submissionId };
}

async function readBody(request) {
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES)
    throw new Error("size");
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new Error("size");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(bytes);
}

async function hashEmail(email, salt) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(salt),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(email),
  );
  return Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

// Dependency injection keeps the real HTTP handler testable without credentials.
export function createContactHandler({ env, fetchImpl = fetch }) {
  return async function handle(request) {
    const allowed = (env("CONTACT_ALLOWED_ORIGINS") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const origin = request.headers.get("origin");
    const headers = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      Vary: "Origin",
    };
    const reply = (status, body, extra = {}) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { ...headers, ...extra },
      });
    // CORS is browser protection, not authentication. Database limits still apply.
    if (!origin || !allowed.includes(origin))
      return reply(403, { error: "Origin not allowed." });
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "content-type";
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    if (request.method !== "POST")
      return reply(405, { error: "Use POST." }, { Allow: "POST, OPTIONS" });
    if (
      request.headers.get("content-type")?.split(";")[0].trim() !==
      "application/json"
    ) {
      return reply(415, { error: "Send JSON." });
    }
    let body;
    try {
      body = JSON.parse(await readBody(request));
    } catch (error) {
      return reply(error.message === "size" ? 413 : 400, {
        error: "Invalid request body.",
      });
    }
    if (body?.website)
      return reply(400, { error: "Unable to accept this enquiry." });
    const values = parseEnquiry(body);
    if (!values)
      return reply(400, { error: "Please check your enquiry details." });

    const url = env("SUPABASE_URL");
    const key = env("SUPABASE_SERVICE_ROLE_KEY");
    const salt = env("CONTACT_RATE_LIMIT_SALT");
    if (!url || !key || !salt || salt.length < 32) {
      return reply(503, {
        error: "Enquiries are not configured yet. Please use email.",
      });
    }
    try {
      const emailHash = await hashEmail(values.email, salt);
      const response = await fetchImpl(
        `${url.replace(/\/$/, "")}/rest/v1/rpc/submit_contact_enquiry`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            p_id: values.id,
            p_name: values.name,
            p_email: values.email,
            p_company: values.company,
            p_service: values.service,
            p_message: values.message,
            p_email_hash: emailHash,
          }),
          signal: AbortSignal.timeout(10000),
        },
      );
      if (!response.ok) throw new Error("storage");
      const result = await response.json();
      if (result === "rate_limited")
        return reply(
          429,
          { error: "Too many enquiries. Please try again later." },
          { "Retry-After": "3600" },
        );
      if (result !== "stored") throw new Error("storage");
      return reply(201, { ok: true });
    } catch {
      // Do not return or log personal data, database errors, or credentials.
      return reply(503, {
        error: "Unable to save your enquiry. Please try again or use email.",
      });
    }
  };
}
