const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { items } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Kurven er tom' });
  }

  const lineItems = items.map(item => {
    const description = [];
    if (item.color) description.push(`Farve: ${item.color}`);
    if (item.options) {
      Object.entries(item.options).forEach(([k, v]) => description.push(`${k}: ${v}`));
    }
    return {
      price_data: {
        currency: 'dkk',
        product_data: {
          name: item.title,
          ...(description.length > 0 && { description: description.join(' | ') }),
        },
        unit_amount: item.price * 100,
      },
      quantity: item.qty,
    };
  });

  const host = req.headers.host;
  const proto = host.includes('localhost') ? 'http' : 'https';
  const origin = `${proto}://${host}`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    shipping_address_collection: { allowed_countries: ['DK'] },
    phone_number_collection: { enabled: true },
    success_url: `${origin}/tak.html`,
    cancel_url: `${origin}/produkter.html`,
    locale: 'da',
  });

  res.json({ url: session.url });
};
