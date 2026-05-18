const crypto = require("crypto");
const {
  PRODUCTS,
  json,
  getMailerLiteGroupId,
  addSubscriberToMailerLite
} = require("./_delivery-config");

const GRANT_EVENTS = new Set([
  "checkout.completed",
  "subscription.paid",
  "subscription.active"
]);

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  if (chunks.length) return Buffer.concat(chunks).toString("utf8");
  if (typeof req.body === "string") return req.body;
  if (req.body && typeof req.body === "object") return JSON.stringify(req.body);
  return "";
}

function normalizeSignature(value) {
  return String(value || "")
    .replace(/^sha256=/i, "")
    .replace(/[^a-f0-9]/gi, "")
    .toLowerCase();
}

function verifyCreemSignature(rawBody, signature, secret) {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = normalizeSignature(signature);
  if (!received || received.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(received, "hex"), Buffer.from(expected, "hex"));
}

function findProductId(object) {
  if (!object) return "";
  if (object.product && typeof object.product === "object") return object.product.id || "";
  if (typeof object.product === "string") return object.product;
  if (object.order && object.order.product) return object.order.product;
  if (object.subscription && object.subscription.product) return object.subscription.product;
  return "";
}

function findCustomer(object) {
  if (!object) return {};
  if (object.customer && typeof object.customer === "object") return object.customer;
  return {};
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { ok: false, error: "Method not allowed." });
  }

  if (!process.env.CREEM_WEBHOOK_SECRET) {
    return json(res, 500, { ok: false, error: "CREEM_WEBHOOK_SECRET is not configured." });
  }

  const rawBody = await readRawBody(req);
  const signature = req.headers["creem-signature"];

  if (!verifyCreemSignature(rawBody, signature, process.env.CREEM_WEBHOOK_SECRET)) {
    return json(res, 401, { ok: false, error: "Invalid Creem signature." });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    return json(res, 400, { ok: false, error: "Invalid JSON payload." });
  }

  const eventType = payload.eventType || payload.type || "";
  const object = payload.object || {};

  if (!GRANT_EVENTS.has(eventType)) {
    return json(res, 200, { ok: true, ignored: true, eventType });
  }

  const productId = findProductId(object);
  const product = PRODUCTS[productId];

  if (!product) {
    return json(res, 200, { ok: true, ignored: true, eventType, productId });
  }

  const customer = findCustomer(object);
  const email = (customer.email || "").trim().toLowerCase();

  if (!email) {
    return json(res, 400, { ok: false, error: "Customer email is missing.", eventType, productId });
  }

  const groupId = getMailerLiteGroupId(product.groupEnv);

  try {
    await addSubscriberToMailerLite({
      email,
      groupId,
      fields: {
        name: customer.name || "",
        hm_plan: product.plan,
        hm_role: product.role,
        hm_product_id: productId,
        hm_event_type: eventType,
        hm_order_id: object.order?.id || "",
        hm_checkout_id: object.id || "",
        hm_access_url: product.accessUrl
      }
    });
  } catch (error) {
    return json(res, 500, {
      ok: false,
      error: error.message,
      eventType,
      productId,
      groupEnv: product.groupEnv
    });
  }

  return json(res, 200, {
    ok: true,
    eventType,
    productId,
    plan: product.plan,
    role: product.role,
    email
  });
};
