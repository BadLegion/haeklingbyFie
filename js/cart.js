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

function addToCart(product, selectedColor, selectedOptions = {}) {
  const cart = getCart();
  const optKey = JSON.stringify(selectedOptions);
  const existing = cart.find(i => i.id === product.id && i.color === (selectedColor || '') && JSON.stringify(i.options || {}) === optKey);
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
      options: selectedOptions,
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

/* ── Trin 1: Vis kurv-indhold ───────────────────────────────── */
function renderCartItems() {
  const wrap   = document.getElementById('cart-items');
  const footer = document.getElementById('cart-footer');
  if (!wrap) return;

  const cart = getCart();

  if (cart.length === 0) {
    wrap.innerHTML  = '<p class="cart-empty">Din kurv er tom 🧶</p>';
    footer.innerHTML = '';
    return;
  }

  wrap.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item__img" src="${item.image}" alt="${item.title}">
      <div class="cart-item__info">
        <p class="cart-item__title">${item.title}</p>
        ${item.color ? `<p class="cart-item__color">Farve: ${item.color}</p>` : ''}
        ${item.options && Object.keys(item.options).length > 0
          ? Object.entries(item.options).map(([k, v]) => `<p class="cart-item__color">${k}: ${v}</p>`).join('')
          : ''}
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

  footer.innerHTML = `
    <div class="cart-total">
      <span>Total</span>
      <span>${total} kr.</span>
    </div>
    <button class="btn btn--primary btn--lg cart-checkout__btn" id="checkout-btn" onclick="proceedToCheckout()">
      Gå til betaling →
    </button>
    <p class="cart-checkout__hint">🔒 Sikker betaling via Stripe</p>
    <p class="cart-checkout__hint" style="margin-top:var(--space-1);">📦 Levering med DAO i hele Danmark</p>
  `;
}

/* ── Trin 2: Kald API og redirect til Stripe Checkout ───────── */
async function proceedToCheckout() {
  const btn = document.getElementById('checkout-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Vent...'; }

  const cart = getCart();
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart }),
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = {}; }
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('Fejl ' + res.status + ': ' + (data.error || text.slice(0, 120)));
      if (btn) { btn.disabled = false; btn.textContent = 'Gå til betaling →'; }
    }
  } catch (e) {
    alert('Netværksfejl: ' + e.message);
    if (btn) { btn.disabled = false; btn.textContent = 'Gå til betaling →'; }
  }
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
