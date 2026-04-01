/* ============================================
   HæklingByFie — Kurv (localStorage)
   ============================================ */

function getCart() {
  try { return JSON.parse(localStorage.getItem('hbf_cart') || '[]'); }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem('hbf_cart', JSON.stringify(cart));
  updateCartBadge();
  renderCartItems();
}

function addToCart(product, selectedColor) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id && i.color === (selectedColor || ''));
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      stripeLink: product.stripeLink,
      color: selectedColor || '',
      qty: 1
    });
  }
  saveCart(cart);
  openCart();
}

function removeFromCart(id, color) {
  saveCart(getCart().filter(i => !(i.id === id && i.color === color)));
}

function updateQty(id, color, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id && i.color === color);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) return removeFromCart(id, color);
  saveCart(cart);
}

function updateCartBadge() {
  const total = getCart().reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('.cart-badge').forEach(b => {
    b.textContent = total;
    b.style.display = total > 0 ? 'flex' : 'none';
  });
}

function renderCartItems() {
  const wrap = document.getElementById('cart-items');
  const footer = document.getElementById('cart-footer');
  if (!wrap) return;

  const cart = getCart();

  if (cart.length === 0) {
    wrap.innerHTML = '<p class="cart-empty">Din kurv er tom 🧶</p>';
    footer.innerHTML = '';
    return;
  }

  wrap.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item__img" src="${item.image}" alt="${item.title}">
      <div class="cart-item__info">
        <p class="cart-item__title">${item.title}</p>
        ${item.color ? `<p class="cart-item__color">Farve: ${item.color}</p>` : ''}
        <p class="cart-item__price">${item.price} kr.</p>
        <div class="cart-item__qty">
          <button onclick="updateQty(${item.id}, '${item.color}', -1)" aria-label="Færre">−</button>
          <span>${item.qty}</span>
          <button onclick="updateQty(${item.id}, '${item.color}', 1)" aria-label="Flere">+</button>
        </div>
      </div>
      <button class="cart-item__remove" onclick="removeFromCart(${item.id}, '${item.color}')" aria-label="Fjern">✕</button>
    </div>
  `).join('');

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  // Byg oversigt til Stripe (sendes som client_reference_id)
  const orderSummary = cart.map(i =>
    `${i.qty}x ${i.title}${i.color ? ' ('+i.color+')' : ''}`
  ).join(', ');

  // STRIPE PAYMENT LINK — indsæt dit link her når du har oprettet det i Stripe Dashboard
  const STRIPE_LINK = 'INDSÆT_DIT_STRIPE_PAYMENT_LINK_HER';
  const checkoutUrl = STRIPE_LINK !== 'INDSÆT_DIT_STRIPE_PAYMENT_LINK_HER'
    ? STRIPE_LINK + '?client_reference_id=' + encodeURIComponent(orderSummary)
    : '#';

  footer.innerHTML = `
    <div class="cart-total">
      <span>Total</span>
      <span>${total} kr.</span>
    </div>
    <div class="cart-order-summary">
      ${cart.map(i => `
        <div class="cart-order-line">
          <span>${i.title}${i.color ? ' <em>(${i.color})</em>' : ''} × ${i.qty}</span>
          <span>${i.price * i.qty} kr.</span>
        </div>
      `).join('')}
    </div>
    <a href="${checkoutUrl}"
       class="btn btn--primary btn--lg cart-checkout__btn"
       ${checkoutUrl !== '#' ? 'target="_blank" rel="noopener noreferrer"' : 'onclick="alert(\'Stripe Payment Link er endnu ikke opsat — se vejledningen i koden.\'); return false;"'}>
      Gå til betaling →
    </a>
    <p class="cart-checkout__hint">🔒 Sikker betaling via Stripe</p>
  `;
}

function openCart() {
  document.getElementById('cart-drawer')?.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  renderCartItems();
}

function closeCart() {
  document.getElementById('cart-drawer')?.classList.remove('is-open');
  document.body.style.overflow = '';
}

/* Init */
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();

  document.getElementById('cart-close')?.addEventListener('click', closeCart);
  document.getElementById('cart-backdrop')?.addEventListener('click', closeCart);
  document.getElementById('cart-icon-btn')?.addEventListener('click', openCart);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCart();
  });
});
