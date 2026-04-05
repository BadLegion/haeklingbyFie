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

  const host = req.headers.host;
  const proto = host.includes('localhost') ? 'http' : 'https';
  const origin = `${proto}://${host}`;

  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('success_url', `${origin}/tak.html`);
  params.append('cancel_url', `${origin}/produkter.html`);
  params.append('locale', 'da');
  params.append('payment_method_types[0]', 'card');
  params.append('payment_method_types[1]', 'mobilepay');
  params.append('shipping_address_collection[allowed_countries][0]', 'DK');
  params.append('shipping_options[0][shipping_rate]', 'shr_1TIphmQ3y8BhXrBHXb8ciHM4');
  params.append('phone_number_collection[enabled]', 'true');

  items.forEach((item, i) => {
    const desc = [];
    if (item.color) desc.push(`Farve: ${item.color}`);
    if (item.options) Object.entries(item.options).forEach(([k, v]) => desc.push(`${k}: ${v}`));
    params.append(`line_items[${i}][price_data][currency]`, 'dkk');
    params.append(`line_items[${i}][price_data][unit_amount]`, String(item.price * 100));
    params.append(`line_items[${i}][price_data][product_data][name]`, item.title);
    if (desc.length > 0) params.append(`line_items[${i}][price_data][product_data][description]`, desc.join(' | '));
    params.append(`line_items[${i}][quantity]`, String(item.qty));
  });

  const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const session = await stripeRes.json();

  if (!stripeRes.ok) {
    return res.status(500).json({ error: session.error?.message || 'Stripe fejl' });
  }

  res.json({ url: session.url });
};
