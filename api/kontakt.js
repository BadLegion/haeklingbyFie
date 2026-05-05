const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { navn, email, emne, besked } = req.body || {};

  if (!navn || !email || !besked) {
    return res.status(400).json({ error: 'Navn, e-mail og besked er påkrævet.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Ugyldig e-mail adresse.' });
  }

  if (navn.length > 100 || email.length > 200 || (emne || '').length > 200 || besked.length > 5000) {
    return res.status(400).json({ error: 'Et eller flere felter er for lange.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const escapeHtml = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const subject = emne ? `Ny kontaktbesked: ${emne}` : `Ny kontaktbesked fra ${navn}`;

  const textBody = [
    `Ny besked fra kontaktformularen:`,
    ``,
    `Navn: ${navn}`,
    `E-mail: ${email}`,
    emne ? `Emne: ${emne}` : null,
    ``,
    `Besked:`,
    besked,
  ].filter(Boolean).join('\n');

  const htmlBody = `<!DOCTYPE html>
<html lang="da">
<body style="font-family:Georgia,serif;color:#3a3330;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
  <h2 style="margin:0 0 24px;color:#5A5541;">Ny kontaktbesked</h2>
  <p style="margin:0 0 8px;"><strong>Navn:</strong> ${escapeHtml(navn)}</p>
  <p style="margin:0 0 8px;"><strong>E-mail:</strong> <a href="mailto:${escapeHtml(email)}" style="color:#5A5541;">${escapeHtml(email)}</a></p>
  ${emne ? `<p style="margin:0 0 8px;"><strong>Emne:</strong> ${escapeHtml(emne)}</p>` : ''}
  <hr style="border:none;border-top:1px solid #E0DCC8;margin:24px 0;">
  <p style="margin:0 0 8px;"><strong>Besked:</strong></p>
  <p style="margin:0;line-height:1.7;white-space:pre-wrap;">${escapeHtml(besked)}</p>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: '"Hækling By Fie kontakt" <haeklingbyfie@gmail.com>',
      to: 'haeklingbyfie@gmail.com',
      replyTo: `"${navn}" <${email}>`,
      subject,
      text: textBody,
      html: htmlBody,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Kontakt mail fejl:', err);
    return res.status(500).json({ error: 'Kunne ikke sende beskeden. Prøv venligst igen senere.' });
  }
};
