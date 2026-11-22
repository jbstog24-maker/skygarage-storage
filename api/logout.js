// SkyGarage Storage installer logout. Clears the installer cookie.

module.exports = async function handler(req, res) {
  res.setHeader(
    'Set-Cookie',
    'sg_installer=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure'
  );
  res.status(200).json({ ok: true });
};
