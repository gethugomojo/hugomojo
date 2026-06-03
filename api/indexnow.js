const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const HOST = 'hugomojo.com';
const KEY = process.env.INDEXNOW_KEY || 'hugomojo-indexnow-20260601';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

function normalizeUrl(value) {
  if (!value || typeof value !== 'string') return null;

  try {
    const url = new URL(value, `https://${HOST}`);
    if (url.hostname !== HOST) return null;
    url.hash = '';
    return url.toString();
  } catch (_) {
    return null;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const submitSecret = process.env.INDEXNOW_SUBMIT_SECRET;

  if (submitSecret && authHeader !== `Bearer ${submitSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const rawUrls = Array.isArray(req.body?.urls) ? req.body.urls : [req.body?.url];
  const urlList = [...new Set(rawUrls.map(normalizeUrl).filter(Boolean))];

  if (!urlList.length) {
    return res.status(400).json({ error: 'Provide at least one hugomojo.com URL.' });
  }

  try {
    const indexNowResponse = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: KEY_LOCATION,
        urlList,
      }),
    });

    return res.status(indexNowResponse.status).json({
      submitted: urlList,
      status: indexNowResponse.status,
      ok: indexNowResponse.ok,
    });
  } catch (error) {
    return res.status(502).json({ error: 'IndexNow submission failed.' });
  }
};
