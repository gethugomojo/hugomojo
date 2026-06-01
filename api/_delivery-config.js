const SITE_URL = process.env.HUGOMOJO_SITE_URL || "https://www.hugomojo.com";

const PRODUCTS = {
  prod_3dQ4cdQv9QIsFHMkSZY9ri: {
    plan: "single_hunter",
    role: "H",
    label: "Hunter Single Pass",
    emailTitle: "Hunter Action System",
    emailSubject: "Your Hunter Action System is ready",
    emailButton: "Access My Hunter Action System",
    accessUrl: `${SITE_URL}/access.html?plan=single&role=H`
  },
  prod_2VyxgT1eeHu9Nokbmofllr: {
    plan: "single_artisan",
    role: "A",
    label: "Artisan Single Pass",
    emailTitle: "Artisan Action System",
    emailSubject: "Your Artisan Action System is ready",
    emailButton: "Access My Artisan Action System",
    accessUrl: `${SITE_URL}/access.html?plan=single&role=A`
  },
  prod_1Aw6eVLwOgt079NyQvp0YC: {
    plan: "single_architect",
    role: "C",
    label: "Architect Single Pass",
    emailTitle: "Architect Action System",
    emailSubject: "Your Architect Action System is ready",
    emailButton: "Access My Architect Action System",
    accessUrl: `${SITE_URL}/access.html?plan=single&role=C`
  },
  prod_1NVYOf74S8hagBCrBLgSoi: {
    plan: "master_key",
    role: "ALL",
    label: "Master Key",
    emailTitle: "HugoMojo Master Key",
    emailSubject: "Your HugoMojo Master Key is ready",
    emailButton: "Access My Master Key",
    accessUrl: `${SITE_URL}/access.html?plan=master`
  },
  prod_3BtB5cRkL48ynkqCFPfssW: {
    plan: "annual_access",
    role: "ALL",
    label: "Signal Review Membership",
    emailTitle: "HugoMojo Signal Review Delivery",
    emailSubject: "Your HugoMojo Signal Review delivery is ready",
    emailButton: "Access My Signal Review Delivery",
    accessUrl: `${SITE_URL}/access.html?plan=annual`
  }
};

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function listItems(items) {
  return items.map(item => `- ${item}`).join("\n");
}

function htmlList(items) {
  return items.map(item => `<li>${escapeHtml(item)}</li>`).join("");
}

function getDeliveryContent(product) {
  if (product.plan === "master_key") {
    return {
      intro: "Open your delivery page to compare Hunter, Artisan, and Architect, then choose your primary path and backup path.",
      includes: [
        "Hunter Action System",
        "Artisan Action System",
        "Architect Action System",
        "HugoMojo Market Fit Model",
        "Master Key Prompt Library",
        "90-Day Roadmap"
      ],
      steps: [
        "Review your strongest path first.",
        "Compare the other two paths.",
        "Use the 90-Day Roadmap to choose what to do next."
      ]
    };
  }

  if (product.plan === "annual_access") {
    return {
      intro: "Open your delivery page to start with your Action Systems, path review resources, prompt library, and signal review templates.",
      includes: [
        "Hunter Action System",
        "Artisan Action System",
        "Architect Action System",
        "HugoMojo Market Fit Model",
        "Master Key Prompt Library",
        "90-Day Roadmap",
        "Signal Review Welcome",
        "Quarterly Calibration Form",
        "Prompt Vault Index",
        "Monthly Signal Report Template",
        "Weekly Signal Digest Template"
      ],
      steps: [
        "Choose your current primary path.",
        "Run the sprint.",
        "Submit your signals for review when ready."
      ]
    };
  }

  return {
    intro: `You matched the ${product.label.replace(" Single Pass", "")} path. Open your delivery page to get your niche direction, first offer, today's 30-minute move, 7-day signal sprint, and copy-paste AI prompt.`,
    includes: [
      "Niche direction",
      "First offer",
      "Today's 30-minute move",
      "7-day signal sprint",
      "Copy-paste AI prompt",
      "What to avoid",
      "What to adjust if no signal"
    ],
    steps: [
      "Read the Beginner Starting Point.",
      "Complete Today's 30-Minute Move.",
      "Run the 7-Day Sprint before changing paths."
    ]
  };
}

function buildDeliveryEmail({ product }) {
  const content = getDeliveryContent(product);
  const title = `${product.emailTitle} is ready.`;
  const disclaimer = "HugoMojo is an educational assessment and action system. It is not financial advice or an income guarantee. Results depend on effort, skills, market conditions, and individual circumstances.";

  const text = `${title}

${content.intro}

Your delivery page includes:

${listItems(content.includes)}

Start here:
${product.accessUrl}

Use this first:
${content.steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}

Support:
hi@hugomojo.com

${disclaimer}`;

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(product.emailSubject)}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0b;color:#f2f2f2;font-family:Inter,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0a0a0b;padding:32px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#111113;border:1px solid rgba(255,255,255,0.10);border-radius:18px;padding:0;">
          <tr>
            <td style="padding:34px 28px 28px;">
              <div style="font-family:monospace;letter-spacing:0.22em;text-transform:uppercase;color:#ffb300;font-size:12px;margin-bottom:24px;">HugoMojo</div>
              <h1 style="font-size:30px;line-height:1.12;margin:0 0 18px;color:#ffffff;">${escapeHtml(title)}</h1>
              <p style="font-size:16px;line-height:1.68;color:rgba(242,242,242,0.82);margin:0 0 22px;">${escapeHtml(content.intro)}</p>
              <div style="border:1px solid rgba(255,179,0,0.24);background:rgba(255,179,0,0.055);border-radius:14px;padding:18px 18px;margin:24px 0;">
                <div style="font-family:monospace;letter-spacing:0.16em;text-transform:uppercase;color:#ffb300;font-size:11px;margin-bottom:12px;">Your delivery includes</div>
                <ul style="margin:0;padding-left:20px;color:rgba(242,242,242,0.86);font-size:15px;line-height:1.7;">${htmlList(content.includes)}</ul>
              </div>
              <a href="${escapeHtml(product.accessUrl)}" style="display:inline-block;background:#ffb300;color:#050505;text-decoration:none;border-radius:12px;padding:15px 20px;font-size:15px;font-weight:800;margin:4px 0 22px;">${escapeHtml(product.emailButton)}</a>
              <div style="margin:10px 0 24px;">
                <div style="font-family:monospace;letter-spacing:0.16em;text-transform:uppercase;color:#ffb300;font-size:11px;margin-bottom:10px;">Use this first</div>
                <ol style="margin:0;padding-left:20px;color:rgba(242,242,242,0.80);font-size:15px;line-height:1.7;">${htmlList(content.steps)}</ol>
              </div>
              <p style="font-size:14px;line-height:1.6;color:rgba(242,242,242,0.70);margin:0 0 8px;">If the button does not work, use this link:</p>
              <p style="font-size:14px;line-height:1.6;margin:0 0 24px;"><a href="${escapeHtml(product.accessUrl)}" style="color:#ffb300;">${escapeHtml(product.accessUrl)}</a></p>
              <p style="font-size:14px;line-height:1.6;color:rgba(242,242,242,0.76);margin:0 0 18px;">Support: <a href="mailto:hi@hugomojo.com" style="color:#ffb300;">hi@hugomojo.com</a></p>
              <p style="border-top:1px solid rgba(255,255,255,0.10);padding-top:18px;font-size:12px;line-height:1.7;color:rgba(242,242,242,0.52);margin:0;">${escapeHtml(disclaimer)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return {
    subject: product.emailSubject,
    text,
    html
  };
}

function resendHeaders(idempotencyKey) {
  const headers = {
    authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    "content-type": "application/json",
    "user-agent": "HugoMojo/1.0"
  };
  if (idempotencyKey) headers["idempotency-key"] = idempotencyKey;
  return headers;
}

async function sendResendEmail({ to, replyTo, subject, html, text, idempotencyKey }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const payload = {
    from: process.env.RESEND_FROM || "HugoMojo <hi@hugomojo.com>",
    to: Array.isArray(to) ? to : [to],
    reply_to: replyTo || process.env.RESEND_REPLY_TO || "hi@hugomojo.com",
    subject,
    html,
    text
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: resendHeaders(idempotencyKey),
    body: JSON.stringify(payload)
  });

  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch (error) {
    data = { raw };
  }

  if (!response.ok) {
    const message = data.message || data.error || raw || "Resend request failed.";
    throw new Error(message);
  }

  return data;
}

async function sendDeliveryEmailWithResend({ email, product, idempotencyKey }) {
  const message = buildDeliveryEmail({ product });
  return sendResendEmail({
    to: [email],
    replyTo: process.env.RESEND_REPLY_TO || "hi@hugomojo.com",
    subject: message.subject,
    html: message.html,
    text: message.text,
    idempotencyKey
  });
}

const ROLE_NAMES = {
  H: "Hunter",
  A: "Artisan",
  C: "Architect"
};

function formatLeadScoreLine(scores) {
  if (!scores || typeof scores !== "object") return "Not provided";
  return [
    `Hunter ${scores.H ?? 0}`,
    `Artisan ${scores.A ?? 0}`,
    `Architect ${scores.C ?? 0}`
  ].join(" · ");
}

function formatLeadMetaLines(metaData) {
  if (!metaData || typeof metaData !== "object") return ["Not provided"];

  const labels = {
    target: "Starting goal",
    stage: "Current stage",
    confusion: "Main confusion",
    time: "Time available",
    action: "Tomorrow action",
    audience: "People access",
    block: "Comfort block",
    deliverable: "First deliverable",
    tool_use: "AI use",
    buyer: "Buyer comfort",
    style: "Work style",
    pattern: "Repeated pattern",
    niche: "Niche clarity",
    signal: "First signal",
    offer: "First offer",
    vision: "7-day path"
  };

  return Object.entries(labels)
    .filter(([key]) => metaData[key])
    .map(([key, label]) => `${label}: ${String(metaData[key]).replace(/_/g, " ")}`);
}

function htmlRows(lines) {
  return lines.map(line => `<div style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.08);">${escapeHtml(line)}</div>`).join("");
}

function buildLeadCaptureEmail({ email, body }) {
  const resultType = String(body.result_type || "unknown").toUpperCase();
  const resultName = ROLE_NAMES[resultType] || resultType;
  const scoreLine = formatLeadScoreLine(body.scores);
  const metaLines = formatLeadMetaLines(body.meta_data);
  const source = String(body.source || "scanner");
  const subject = `New HugoMojo scanner lead: ${resultName}`;
  const text = `New HugoMojo scanner lead

Email:
${email}

Matched path:
${resultName}

Source:
${source}

Scores:
${scoreLine}

Lead signals:
${metaLines.map(line => `- ${line}`).join("\n")}`;

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0b;color:#f2f2f2;font-family:Inter,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0a0a0b;padding:28px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#111113;border:1px solid rgba(255,255,255,0.10);border-radius:18px;">
          <tr>
            <td style="padding:30px 26px;">
              <div style="font-family:monospace;letter-spacing:0.22em;text-transform:uppercase;color:#ffb300;font-size:12px;margin-bottom:20px;">HugoMojo Lead</div>
              <h1 style="font-size:26px;line-height:1.18;margin:0 0 18px;color:#ffffff;">New scanner lead</h1>
              <p style="font-size:16px;line-height:1.6;margin:0 0 18px;color:rgba(242,242,242,0.82);"><strong>Email:</strong> ${escapeHtml(email)}</p>
              <p style="font-size:16px;line-height:1.6;margin:0 0 18px;color:rgba(242,242,242,0.82);"><strong>Matched path:</strong> ${escapeHtml(resultName)}</p>
              <p style="font-size:16px;line-height:1.6;margin:0 0 18px;color:rgba(242,242,242,0.82);"><strong>Source:</strong> ${escapeHtml(source)}</p>
              <div style="margin:20px 0;padding:16px;border:1px solid rgba(255,179,0,0.24);background:rgba(255,179,0,0.055);border-radius:14px;">
                <div style="font-family:monospace;letter-spacing:0.16em;text-transform:uppercase;color:#ffb300;font-size:11px;margin-bottom:10px;">Scores</div>
                <p style="margin:0;color:rgba(242,242,242,0.84);font-size:15px;line-height:1.6;">${escapeHtml(scoreLine)}</p>
              </div>
              <div style="margin:20px 0;padding:16px;border:1px solid rgba(255,255,255,0.10);background:rgba(255,255,255,0.035);border-radius:14px;">
                <div style="font-family:monospace;letter-spacing:0.16em;text-transform:uppercase;color:#ffb300;font-size:11px;margin-bottom:10px;">Lead signals</div>
                <div style="color:rgba(242,242,242,0.78);font-size:14px;line-height:1.55;">${htmlRows(metaLines)}</div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

function airtableConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_PAT || "";
  const baseId = process.env.AIRTABLE_BASE_ID || "";
  const table = process.env.AIRTABLE_TABLE_ID || process.env.AIRTABLE_TABLE_NAME || "Scanner Leads";

  return {
    apiKey,
    baseId,
    table,
    configured: Boolean(apiKey && baseId && table)
  };
}

const AIRTABLE_LEAD_FIELDS = [
  { name: "Email", type: "singleLineText" },
  { name: "Matched Path", type: "singleLineText" },
  { name: "Result Code", type: "singleLineText" },
  { name: "Source", type: "singleLineText" },
  { name: "Hunter Score", type: "singleLineText" },
  { name: "Artisan Score", type: "singleLineText" },
  { name: "Architect Score", type: "singleLineText" },
  { name: "Lead Signals", type: "multilineText" },
  { name: "Created At", type: "singleLineText" }
];

function buildAirtableLeadFields({ email, body }) {
  const resultType = String(body.result_type || "unknown").toUpperCase();
  const resultName = ROLE_NAMES[resultType] || resultType;
  const scores = body.scores && typeof body.scores === "object" ? body.scores : {};
  const metaLines = formatLeadMetaLines(body.meta_data);

  return {
    Email: email,
    "Matched Path": resultName,
    "Result Code": resultType,
    Source: String(body.source || "scanner"),
    "Hunter Score": String(scores.H || 0),
    "Artisan Score": String(scores.A || 0),
    "Architect Score": String(scores.C || 0),
    "Lead Signals": metaLines.join("\n"),
    "Created At": new Date().toISOString()
  };
}

function buildAirtableLeadNote({ email, body }) {
  const resultType = String(body.result_type || "unknown").toUpperCase();
  const resultName = ROLE_NAMES[resultType] || resultType;
  const scoreLine = formatLeadScoreLine(body.scores);
  const metaLines = formatLeadMetaLines(body.meta_data);

  return [
    `Email: ${email}`,
    `Matched Path: ${resultName}`,
    `Source: ${String(body.source || "scanner")}`,
    `Scores: ${scoreLine}`,
    "",
    "Lead signals:",
    ...metaLines.map(line => `- ${line}`)
  ].join("\n");
}

function airtableHeaders(apiKey) {
  return {
    authorization: `Bearer ${apiKey}`,
    "content-type": "application/json",
    accept: "application/json"
  };
}

async function airtableRequest(url, { method = "GET", apiKey, body }) {
  const response = await fetch(url, {
    method,
    headers: airtableHeaders(apiKey),
    body: body ? JSON.stringify(body) : undefined
  });

  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch (error) {
    data = { raw };
  }

  if (!response.ok) {
    const message = data.error?.message || data.message || data.error || raw || "Airtable request failed.";
    throw new Error(message);
  }

  return data;
}

function findAirtableTable(tables, tableRef) {
  return tables.find(table => table.id === tableRef || table.name === tableRef);
}

async function ensureAirtableLeadFields(config) {
  if (process.env.AIRTABLE_AUTO_CREATE_FIELDS === "false") return {};

  const schema = await airtableRequest(`https://api.airtable.com/v0/meta/bases/${config.baseId}/tables`, {
    apiKey: config.apiKey
  });
  const table = findAirtableTable(schema.tables || [], config.table);
  if (!table) {
    throw new Error(`Airtable table not found: ${config.table}`);
  }

  const existing = new Set((table.fields || []).map(field => field.name));
  const missing = AIRTABLE_LEAD_FIELDS.filter(field => !existing.has(field.name));

  for (const field of missing) {
    const payload = {
      name: field.name,
      type: field.type
    };
    if (field.options) payload.options = field.options;

    await airtableRequest(`https://api.airtable.com/v0/meta/bases/${config.baseId}/tables/${table.id}/fields`, {
      method: "POST",
      apiKey: config.apiKey,
      body: payload
    });
  }

  const fieldNames = new Set([...existing, ...missing.map(field => field.name)]);
  return {
    primaryFieldName: table.fields?.[0]?.name || "",
    fieldNames
  };
}

async function addLeadToAirtable({ email, body }) {
  const config = airtableConfig();
  if (!config.configured) {
    return { configured: false };
  }

  const tableMeta = await ensureAirtableLeadFields(config);
  const fields = buildAirtableLeadFields({ email, body });
  const fieldNames = tableMeta.fieldNames || new Set();

  if (tableMeta.primaryFieldName && !fields[tableMeta.primaryFieldName]) {
    fields[tableMeta.primaryFieldName] = email;
  }
  if (fieldNames.has("Notes")) {
    fields.Notes = buildAirtableLeadNote({ email, body });
  }

  const response = await fetch(`https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(config.table)}`, {
    method: "POST",
    headers: airtableHeaders(config.apiKey),
    body: JSON.stringify({
      records: [
        {
          fields
        }
      ],
      typecast: true
    })
  });

  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch (error) {
    data = { raw };
  }

  if (!response.ok) {
    const message = data.error?.message || data.message || data.error || raw || "Airtable request failed.";
    throw new Error(message);
  }

  return {
    configured: true,
    recordId: data.records?.[0]?.id || ""
  };
}

async function sendLeadCaptureWithResend({ email, body, idempotencyKey }) {
  const message = buildLeadCaptureEmail({ email, body });
  return sendResendEmail({
    to: process.env.RESEND_LEAD_TO || "hi@hugomojo.com",
    replyTo: email,
    subject: message.subject,
    html: message.html,
    text: message.text,
    idempotencyKey
  });
}

module.exports = {
  SITE_URL,
  PRODUCTS,
  json,
  buildDeliveryEmail,
  buildLeadCaptureEmail,
  buildAirtableLeadFields,
  addLeadToAirtable,
  sendDeliveryEmailWithResend,
  sendLeadCaptureWithResend
};
