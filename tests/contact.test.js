import { test } from "node:test";
import assert from "node:assert/strict";
import { createContactHandler } from "../supabase/functions/contact-enquiry/handler.js";
import { getContactConfig, sendEnquiry } from "../src/contact-api.js";

const origin = "https://portfolio.example";
const values = {
  name: " Test visitor ",
  email: "TEST@example.com",
  company: " Test company ",
  service: "AI assistants",
  message: "A synthetic enquiry for testing only.",
  submissionId: crypto.randomUUID(),
};
const config = {
  CONTACT_ALLOWED_ORIGINS: origin,
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "test-server-secret",
  CONTACT_RATE_LIMIT_SALT: "a-test-salt-that-is-at-least-32-characters",
};
function handler(fetchImpl, overrides = {}) {
  return createContactHandler({
    env: (name) => ({ ...config, ...overrides })[name],
    fetchImpl,
  });
}
function request(body = values, options = {}) {
  return new Request(
    "https://project.supabase.co/functions/v1/contact-enquiry",
    {
      method: "POST",
      headers: { Origin: origin, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      ...options,
    },
  );
}
const noFetch = () => {
  throw new Error("Database must not be called.");
};

test("placeholder config stays offline; Supabase URL resolves; custom endpoint takes precedence", () => {
  assert.deepEqual(getContactConfig({}), { endpoint: "", supabase: false });
  assert.deepEqual(
    getContactConfig({ VITE_SUPABASE_URL: "https://project.supabase.co/" }),
    {
      endpoint: "https://project.supabase.co/functions/v1/contact-enquiry",
      supabase: true,
    },
  );
  assert.deepEqual(
    getContactConfig({
      VITE_SUPABASE_URL: "https://project.supabase.co",
      VITE_CONTACT_ENDPOINT: "/contact",
    }),
    { endpoint: "/contact", supabase: false },
  );
});
test("preflight permits exactly the configured origin", async () => {
  const response = await handler(noFetch)(
    request(null, { method: "OPTIONS", body: undefined }),
  );
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), origin);
  assert.equal(response.headers.get("Vary"), "Origin");
});
test("missing or disallowed origins, wrong methods and media types are rejected", async () => {
  for (const headers of [{}, { Origin: "https://evil.example" }]) {
    const response = await handler(noFetch)(request(values, { headers }));
    assert.equal(response.status, 403);
    assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
  }
  assert.equal(
    (await handler(noFetch)(request(null, { method: "GET", body: undefined })))
      .status,
    405,
  );
  assert.equal(
    (
      await handler(noFetch)(
        request(values, {
          headers: { Origin: origin, "Content-Type": "text/plain" },
        }),
      )
    ).status,
    415,
  );
});
test("invalid types, lengths, email, UUID, JSON and honeypot never reach storage", async () => {
  for (const invalid of [
    null,
    [],
    { ...values, name: 42 },
    { ...values, name: " " },
    { ...values, email: "not-an-email" },
    { ...values, message: "short" },
    { ...values, company: "x".repeat(151) },
    { ...values, service: "x".repeat(101) },
    { ...values, message: "x".repeat(4001) },
    { ...values, submissionId: "invalid" },
    { ...values, website: "spam" },
  ]) {
    assert.equal((await handler(noFetch)(request(invalid))).status, 400);
  }
  assert.equal(
    (await handler(noFetch)(request(values, { body: "{" }))).status,
    400,
  );
  assert.equal(
    (await handler(noFetch)(request(values, { body: "x".repeat(24001) })))
      .status,
    413,
  );
});
test("missing project secrets fail closed", async () => {
  assert.equal(
    (await handler(noFetch, { CONTACT_RATE_LIMIT_SALT: "" })(request())).status,
    503,
  );
  assert.equal(
    (await handler(noFetch, { SUPABASE_SERVICE_ROLE_KEY: "" })(request()))
      .status,
    503,
  );
});
test("valid input is normalized, HMAC-hashed and stored with a server-only key", async () => {
  let sent;
  const response = await handler(async (url, options) => {
    assert.equal(
      url,
      "https://project.supabase.co/rest/v1/rpc/submit_contact_enquiry",
    );
    assert.equal(options.headers.Authorization, "Bearer test-server-secret");
    sent = JSON.parse(options.body);
    return Response.json("stored");
  })(request());
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(sent.p_name, "Test visitor");
  assert.equal(sent.p_email, "test@example.com");
  assert.match(sent.p_email_hash, /^[a-f0-9]{64}$/);
  assert.equal(sent.p_id, values.submissionId);
});
test("rate limits and failed or unexpected database results never claim success", async () => {
  const limited = await handler(async () => Response.json("rate_limited"))(
    request(),
  );
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("Retry-After"), "3600");
  for (const fetcher of [
    async () =>
      Response.json({ error: "private database details" }, { status: 500 }),
    async () => Response.json("unknown"),
    async () => {
      throw new Error("secret timeout");
    },
  ]) {
    const response = await handler(fetcher)(request());
    assert.equal(response.status, 503);
    assert.doesNotMatch(await response.text(), /secret|private database/);
  }
});
test("React submission checks Supabase acknowledgement and forwards stable retry ID", async () => {
  const frontend = getContactConfig({
    VITE_SUPABASE_URL: "https://project.supabase.co",
  });
  const fetchImpl = async (_url, options) => {
    assert.equal(JSON.parse(options.body).submissionId, values.submissionId);
    assert.equal(options.headers.Authorization, undefined);
    return Response.json({ ok: true });
  };
  await sendEnquiry(
    frontend,
    values,
    values.submissionId,
    undefined,
    fetchImpl,
  );
  await assert.rejects(
    sendEnquiry(frontend, values, values.submissionId, undefined, async () =>
      Response.json({ ok: false }),
    ),
  );
  await assert.rejects(
    sendEnquiry(frontend, values, values.submissionId, undefined, async () =>
      Response.json({}, { status: 429 }),
    ),
    (error) => error.status === 429,
  );
});
