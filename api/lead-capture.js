const {
  json,
  getMailerLiteGroupId,
  addSubscriberToMailerLite
} = require("./_delivery-config");

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("access-control-allow-methods", "POST,OPTIONS");
    res.setHeader("access-control-allow-headers", "content-type");
    return json(res, 200, { ok: true });
  }

  if (req.method !== "POST") {
    res.setHeader("allow", "POST, OPTIONS");
    return json(res, 405, { ok: false, error: "Method not allowed." });
  }

  let body = {};
  try {
    body = typeof req.body === "object" && req.body
      ? req.body
      : JSON.parse(await new Promise((resolve, reject) => {
          let raw = "";
          req.on("data", chunk => { raw += chunk; });
          req.on("end", () => resolve(raw || "{}"));
          req.on("error", reject);
        }));
  } catch (error) {
    return json(res, 400, { ok: false, error: "Invalid JSON payload." });
  }

  const email = String(body.email || "").trim().toLowerCase();
  if (!isEmail(email)) {
    return json(res, 400, { ok: false, error: "Valid email is required." });
  }

  const groupId = getMailerLiteGroupId("MAILERLITE_GROUP_ASSESSMENT_LEADS");

  if (!process.env.MAILERLITE_API_KEY || !groupId) {
    return json(res, 200, { ok: true, configured: false });
  }

  try {
    await addSubscriberToMailerLite({
      email,
      groupId,
      fields: {
        hm_plan: "assessment_lead",
        hm_role: body.result_type || "",
        hm_event_type: "email_capture"
      }
    });
  } catch (error) {
    return json(res, 200, { ok: true, configured: true, delivered: false, error: error.message });
  }

  return json(res, 200, { ok: true, configured: true, delivered: true });
};
