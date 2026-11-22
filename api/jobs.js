// SkyGarage Storage scheduled jobs for approved installers.
// Requires the sg_installer=ok cookie set by /api/verify.

var fs = require('fs');
var path = require('path');

function hasInstallerCookie(req) {
  var cookieHeader = (req.headers && req.headers.cookie) || '';
  var parts = cookieHeader.split(';');
  for (var i = 0; i < parts.length; i++) {
    var pair = parts[i].trim().split('=');
    if (pair[0] === 'sg_installer' && pair[1] === 'ok') return true;
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
