const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const event = req.body;
  if (event?.type !== 'checkout.session.completed') {
    return res.json({ received: true });
  }

  const sessionId = event.data?.object?.id;
  if (!sessionId) return res.status(400).json({ error: 'Manglende session ID' });

  // Hent session direkte fra Stripe for at bekræfte den er ægte
  const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
  });
  if (!stripeRes.ok) return res.status(500).json({ error: 'Stripe session fejl' });

  const session = await stripeRes.json();
  const email = session.customer_details?.email;
  const name  = session.customer_details?.name;
  const firstName = name ? name.split(' ')[0] : null;
  const hilsen = firstName ? `Hej ${firstName},` : 'Hej,';

  if (!email) return res.json({ received: true });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const textBody = [
    hilsen,
    '',
    'Vi har nu modtaget din ordre og vil begynde hurtigst muligt at hækle din bestilling og få den sendt sikkert afsted til dig.',
    '',
    'Har du nogle spørgsmål eller noget andet, er du altid velkommen til at kontakte mig på e-mail - haeklingbyfie@gmail.com',
    '',
    'Kærlig hilsen',
    'Fie / Hækling By Fie',
  ].join('\n');

  const htmlBody = `<!DOCTYPE html>
<html lang="da">
<body style="font-family:Georgia,serif;color:#3a3330;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
  <p style="font-size:1.8rem;margin:0 0 24px;">🤍</p>
  <p style="margin:0 0 16px;">${hilsen}</p>
  <p style="margin:0 0 16px;line-height:1.7;">Vi har nu modtaget din ordre og vil begynde hurtigst muligt at hækle din bestilling og få den sendt sikkert afsted til dig.</p>
  <p style="margin:0 0 24px;line-height:1.7;">Har du nogle spørgsmål eller noget andet, er du altid velkommen til at kontakte mig på e-mail — <a href="mailto:haeklingbyfie@gmail.com" style="color:#b07a5c;">haeklingbyfie@gmail.com</a></p>
  <p style="margin:0;line-height:1.7;">Kærlig hilsen<br><strong>Fie / Hækling By Fie</strong></p>
</body>
</html>`;

  await transporter.sendMail({
    from: '"Hækling By Fie" <haeklingbyfie@gmail.com>',
    to: email,
    subject: 'Ordrebekræftelse — Hækling By Fie',
    text: textBody,
    html: htmlBody,
  });

  res.json({ received: true });
};
