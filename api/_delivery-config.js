const SITE_URL = process.env.HUGOMOJO_SITE_URL || "https://www.hugomojo.com";

const PRODUCTS = {
  prod_3dQ4cdQv9QIsFHMkSZY9ri: {
    plan: "single_hunter",
    role: "H",
    label: "Hunter Single Pass",
    groupEnv: "MAILERLITE_GROUP_SINGLE_HUNTER",
    accessUrl: `${SITE_URL}/access.html?plan=single&role=H`
  },
  prod_2VyxgT1eeHu9Nokbmofllr: {
    plan: "single_artisan",
    role: "A",
    label: "Artisan Single Pass",
    groupEnv: "MAILERLITE_GROUP_SINGLE_ARTISAN",
    accessUrl: `${SITE_URL}/access.html?plan=single&role=A`
  },
  prod_1Aw6eVLwOgt079NyQvp0YC: {
    plan: "single_architect",
    role: "C",
    label: "Architect Single Pass",
    groupEnv: "MAILERLITE_GROUP_SINGLE_ARCHITECT",
    accessUrl: `${SITE_URL}/access.html?plan=single&role=C`
  },
  prod_1NVYOf74S8hagBCrBLgSoi: {
    plan: "master_key",
    role: "ALL",
    label: "Master Key",
    groupEnv: "MAILERLITE_GROUP_MASTER",
    accessUrl: `${SITE_URL}/access.html?plan=master`
  },
  prod_3BtB5cRkL48ynkqCFPfssW: {
    plan: "annual_access",
    role: "ALL",
    label: "Annual Access",
    groupEnv: "MAILERLITE_GROUP_ANNUAL",
    accessUrl: `${SITE_URL}/access.html?plan=annual`
  }
};

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function getMailerLiteGroupId(groupEnv) {
  return process.env[groupEnv] || "";
}

function mailerLiteHeaders() {
  return {
    authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`,
    "content-type": "application/json",
    accept: "application/json"
  };
}

function optionalFields(fields) {
  if (process.env.MAILERLITE_WRITE_CUSTOM_FIELDS !== "true") return undefined;
  return fields;
}

async function addSubscriberToMailerLite({ email, groupId, fields }) {
  if (!process.env.MAILERLITE_API_KEY) {
    throw new Error("MAILERLITE_API_KEY is not configured.");
  }
  if (!groupId) {
    throw new Error("MailerLite group id is not configured.");
  }

  const payload = {
    email,
    groups: [groupId],
    status: "active"
  };

  const safeFields = optionalFields(fields);
  if (safeFields) payload.fields = safeFields;

  const response = await fetch("https://connect.mailerlite.com/api/subscribers", {
    method: "POST",
    headers: mailerLiteHeaders(),
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    data = { raw: text };
  }

  if (!response.ok) {
    const message = data.message || data.error || text || "MailerLite request failed.";
    throw new Error(message);
  }

  return data;
}

module.exports = {
  SITE_URL,
  PRODUCTS,
  json,
  getMailerLiteGroupId,
  addSubscriberToMailerLite
};
