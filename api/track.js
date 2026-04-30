export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const event = String(body.event || "unknown").slice(0, 80);
    const payload = {
      event,
      page: String(body.page || "").slice(0, 160),
      lang: String(body.lang || "").slice(0, 16),
      talent: String(body.talent || "").slice(0, 40),
      product: String(body.product || "").slice(0, 80),
      at: new Date().toISOString()
    };
    console.log("[hm-event]", JSON.stringify(payload));
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[hm-event-error]", error);
    return res.status(200).json({ ok: false });
  }
}
