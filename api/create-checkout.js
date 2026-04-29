const DODO_API_BASE = "https://live.dodopayments.com";
const PRODUCT_ID = "pdt_0NdSBu2hGqTa514vmmjUa";
const RETURN_URL = "https://www.hugomojo.com/delivery/hidden-talent-full-report/";
const CANCEL_URL = "https://www.hugomojo.com/";

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanText(value, maxLength = 120) {
  return typeof value === "string" ? value.slice(0, maxLength) : "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Dodo API key is not configured" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const email = cleanText(body.email, 180).trim();
    const talent = cleanText(body.talent, 40);
    const talentName = cleanText(body.talentName, 80);

    const payload = {
      product_cart: [{ product_id: PRODUCT_ID, quantity: 1 }],
      return_url: RETURN_URL,
      cancel_url: CANCEL_URL,
      feature_flags: {
        redirect_immediately: true
      },
      metadata: {
        source: "hugomojo_hidden_talent_en",
        talent,
        talent_name: talentName
      }
    };

    if (isValidEmail(email)) {
      payload.customer = { email };
    }

    const response = await fetch(`${DODO_API_BASE}/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.message || data?.error || "Unable to create checkout session"
      });
    }

    const checkoutUrl = data.checkout_url || data.checkoutUrl || data.url;
    if (!checkoutUrl) {
      return res.status(502).json({ error: "Dodo did not return a checkout URL" });
    }

    return res.status(200).json({ checkout_url: checkoutUrl });
  } catch (error) {
    return res.status(500).json({ error: "Checkout session failed" });
  }
}
