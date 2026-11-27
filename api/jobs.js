// SkyGarage Storage scheduled jobs for approved installers.
// Requires the signed sg_installer cookie set by /api/verify. The cookie
// value is an HMAC keyed by the installer access code; a hand-set or
// guessed value does not pass (the old literal "ok" check was forgeable,
// fixed 2026-11-27). Fails closed when the access code is not configured.

var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

function hasInstallerCookie(req) {
  var expected = process.env.INSTALLER_ACCESS_CODE;
  if (!expected) return false;
  var want = crypto.createHmac('sha256', expected).update('sg-installer-v1').digest('hex');
  var cookieHeader = (req.headers && req.headers.cookie) || '';
  var parts = cookieHeader.split(';');
  for (var i = 0; i < parts.length; i++) {
    var pair = parts[i].trim().split('=');
    if (pair[0] === 'sg_installer' && pair[1]) {
      var got = Buffer.from(pair[1]);
      var wantBuf = Buffer.from(want);
      if (got.length === wantBuf.length && crypto.timingSafeEqual(got, wantBuf)) return true;
    }
  }
  return false;
}

module.exports = async function handler(req, res) {
  if (!hasInstallerCookie(req)) {
    res.status(401).json({ ok: false, error: 'Not logged in' });
    return;
  }

  try {
    var filePath = path.join(process.cwd(), 'jobs.json');
    var raw = fs.readFileSync(filePath, 'utf8');
    var data = JSON.parse(raw);
    res.status(200).json(data);
  } catch (err) {
    console.log('[SkyGarage jobs] Could not read jobs.json: ' + (err && err.message ? err.message : err));
    res.status(200).json({ jobs: [] });
  }
};
