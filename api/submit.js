// SkyGarage Storage form submissions.
// Accepts POST JSON with formType "booking" or "installer".
// Sends a plain text summary email through the Resend API.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  var body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      res.status(400).json({ ok: false, error: 'Invalid JSON' });
      return;
    }
  }
  body = body || {};

  var formType = body.formType;
  if (formType !== 'booking' && formType !== 'installer') {
    res.status(400).json({ ok: false, error: 'Missing or invalid formType' });
    return;
  }

  var name = (body.name || '').toString().trim();
  var phone = (body.phone || '').toString().trim();
  var email = (body.email || '').toString().trim();

  if (!name || !phone || !email) {
    res.status(400).json({ ok: false, error: 'Name, phone, and email are required' });
    return;
  }

  var subject =
    formType === 'booking'
      ? 'SkyGarage Booking: ' + name
      : 'SkyGarage Installer Application: ' + name;

  var lines = [];
  lines.push('SkyGarage Storage form submission');
  lines.push('Form type: ' + formType);
  lines.push('');
  Object.keys(body).forEach(function (key) {
    if (key === 'formType') return;
    var value = body[key];
    if (value === undefined || value === null || value === '') return;
    lines.push(key + ': ' + value);
  });
  var text = lines.join('\n');

  // Always log the submission so nothing is lost silently.
  console.log('[SkyGarage submit] ' + subject + '\n' + text);

  var apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(502).json({ ok: false, error: 'Email is not configured: RESEND_API_KEY is missing' });
    return;
  }

  try {
    var response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SkyGarage Storage <leads@ringceptionai.com>',
        to: ['jbstog24@gmail.com'],
        reply_to: email,
        subject: subject,
        text: text
      })
    });

    if (!response.ok) {
      var detail = '';
      try {
        detail = await response.text();
      } catch (e) {
        detail = '';
      }
      console.log('[SkyGarage submit] Resend error ' + response.status + ': ' + detail);
      res.status(502).json({ ok: false, error: 'Email send failed with status ' + response.status });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.log('[SkyGarage submit] Resend request failed: ' + (err && err.message ? err.message : err));
    res.status(502).json({ ok: false, error: 'Email send failed' });
  }
};
