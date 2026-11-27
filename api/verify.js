// SkyGarage Storage installer login.
// Accepts POST JSON { code } and compares it to INSTALLER_ACCESS_CODE.
// On success it sets a SIGNED session cookie (HMAC of a fixed label,
// keyed by the access code itself), so the cookie value cannot be
// forged by anyone who does not know the code. The previous literal
// value "ok" was forgeable by hand (fixed 2026-11-27).

var crypto = require('crypto');

function sessionValue(expected) {
  return crypto.createHmac('sha256', expected).update('sg-installer-v1').digest('hex');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  var expected = process.env.INSTALLER_ACCESS_CODE;
  if (!expected) {
    res.status(500).json({ ok: false, error: 'Installer login is not configured' });
    return;
  }

  var body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }
  body = body || {};

  var code = (body.code || '').toString();

  if (code && code === expected) {
    res.setHeader(
      'Set-Cookie',
      'sg_installer=' + sessionValue(expected) + '; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax; Secure'
    );
    res.status(200).json({ ok: true });
    return;
  }

  res.status(401).json({ ok: false });
};
