export function getContactConfig(env) {
  const url = (env.VITE_SUPABASE_URL || "").trim().replace(/\/$/, "");
  const custom = (env.VITE_CONTACT_ENDPOINT || "").trim();
  return {
    endpoint: custom || (url ? `${url}/functions/v1/contact-enquiry` : ""),
    supabase: Boolean(url && !custom),
  };
}

export async function sendEnquiry(
  config,
  values,
  submissionId,
  signal,
  fetchImpl = fetch,
) {
  const response = await fetchImpl(config.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      ...values,
      submissionId,
      subject: `Epsilon Labs enquiry: ${values.service || "Let’s discuss"}`,
    }),
    signal,
  });
  if (!response.ok) {
    const error = new Error("submission");
    error.status = response.status;
    throw error;
  }
  // An HTTP success alone is not proof that our Supabase handler saved the row.
  if (config.supabase && (await response.json()).ok !== true)
    throw new Error("storage");
}
