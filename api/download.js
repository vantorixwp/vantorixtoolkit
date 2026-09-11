/**
 * Download gate.
 *
 * The Pro zip lives in /private, which Vercel never serves, so the only way to
 * reach it is through this function — and only with a licence key the licence
 * server recognises.
 *
 * Worth being clear about what this does and does not do. It stops the file
 * being passed around by anyone who simply finds the URL. It does not stop a
 * paying customer from sharing or editing the plugin afterwards; the plugin is
 * GPL and they are entitled to. What protects the business is the licence
 * server: activations, updates and support all run through it.
 */

const fs = require('fs');
const path = require('path');

const LICENSE_API =
  process.env.VANTORIX_LICENSE_API ||
  'https://licenses.themevally.com/wp-json/vantorix-license/v1';

const ZIP_PATH = path.join(process.cwd(), 'private', 'vantorix-pro.zip');
const FILE_NAME = 'vantorix-pro.zip';

/** Keys are short and predictable in shape; reject anything else early. */
function looksLikeKey(value) {
  return typeof value === 'string' && /^[A-Za-z0-9-]{8,80}$/.test(value.trim());
}

function readKey(req) {
  if (req.method === 'POST' && req.body) {
    const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
    if (body && body.key) return String(body.key).trim();
  }

  const url = new URL(req.url, 'https://placeholder.local');
  return (url.searchParams.get('key') || '').trim();
}

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function deny(res, status, message) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ ok: false, message }));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return deny(res, 405, 'Method not allowed.');
  }

  const key = readKey(req);

  if (!key) {
    return deny(res, 400, 'Enter your licence key to download Vantorix Pro.');
  }

  if (!looksLikeKey(key)) {
    return deny(res, 400, 'That does not look like a licence key. Check it and try again.');
  }

  // Ask the licence server whether the key is real and still active.
  let verdict;

  try {
    const upstream = await fetch(`${LICENSE_API}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, product: 'vantorix-pro' }),
      signal: AbortSignal.timeout(12000)
    });

    verdict = await upstream.json();
  } catch (err) {
    return deny(
      res,
      503,
      'The licence server could not be reached just now. Please try again in a few minutes, or message us and we will send the file directly.'
    );
  }

  if (!verdict || verdict.valid !== true) {
    const reason =
      verdict && verdict.message
        ? verdict.message
        : 'That licence key was not recognised.';
    return deny(res, 403, reason);
  }

  // Key checks out — hand over the file.
  let file;

  try {
    file = fs.readFileSync(ZIP_PATH);
  } catch (err) {
    return deny(res, 500, 'The download is temporarily unavailable. Please message us.');
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${FILE_NAME}"`);
  res.setHeader('Content-Length', file.length);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(file);
};
