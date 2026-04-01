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
    <button class="btn btn--primary btn--lg cart-checkout__btn" onclick="showDeliveryForm()">
      Fortsæt til levering →
    </button>
    <p class="cart-checkout__hint">🔒 Sikker betaling via Stripe</p>
  `;
}

/* ── Trin 2: Vis leveringsadresse-formular ──────────────────── */
function showDeliveryForm() {
  const wrap   = document.getElementById('cart-items');
  const footer = document.getElementById('cart-footer');
  if (!wrap) return;

  const cart  = getCart();
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  wrap.innerHTML = `
    <div class="cart-delivery">
      <button class="cart-delivery__back" onclick="renderCartItems()" aria-label="Tilbage til kurv">
        ← Tilbage
      </button>
      <h3 class="cart-delivery__title">Leveringsadresse</h3>

      <div class="cart-field">
        <label class="cart-field__label" for="del-name">Fulde navn <span class="required">*</span></label>
        <input class="cart-field__input" id="del-name" type="text" placeholder="Fornavn Efternavn" autocomplete="name">
      </div>

      <div class="cart-field">
        <label class="cart-field__label" for="del-addr">Vejnavn og nummer <span class="required">*</span></label>
        <input class="cart-field__input" id="del-addr" type="text" placeholder="Eksempelvej 12, 2. tv." autocomplete="street-address">
      </div>

      <div class="cart-field-row">
        <div class="cart-field">
          <label class="cart-field__label" for="del-zip">Postnummer <span class="required">*</span></label>
          <input class="cart-field__input" id="del-zip" type="text" placeholder="1234" maxlength="4" autocomplete="postal-code">
        </div>
        <div class="cart-field">
          <label class="cart-field__label" for="del-city">By <span class="required">*</span></label>
          <input class="cart-field__input" id="del-city" type="text" placeholder="København" autocomplete="address-level2">
        </div>
      </div>

      <div class="cart-field">
        <label class="cart-field__label" for="del-phone">Telefon <span class="required">*</span></label>
        <input class="cart-field__input" id="del-phone" type="tel" placeholder="12 34 56 78" autocomplete="tel">
      </div>

      <div class="cart-field">
        <label class="cart-field__label" for="del-email">E-mail <span class="required">*</span></label>
        <input class="cart-field__input" id="del-email" type="email" placeholder="din@email.dk" autocomplete="email">
      </div>

      <p id="cart-delivery-error" class="cart-delivery__error" style="display:none;"></p>
    </div>
  `;

  footer.innerHTML = `
    <div class="cart-total">
      <span>Total</span>
      <span>${total} kr.</span>
    </div>
    <button class="btn btn--primary btn--lg cart-checkout__btn" onclick="proceedToStripe()">
      Gå til betaling →
    </button>
    <p class="cart-checkout__hint">🔒 Sikker betaling via Stripe</p>
    <p class="cart-checkout__hint" style="margin-top:var(--space-1);">📦 Levering med DAO i hele Danmark</p>
  `;
}

/* ── Trin 3: Valider adresse og åbn Stripe ──────────────────── */
function proceedToStripe() {
  const name  = document.getElementById('del-name')?.value.trim();
  const addr  = document.getElementById('del-addr')?.value.trim();
  const zip   = document.getElementById('del-zip')?.value.trim();
  const city  = document.getElementById('del-city')?.value.trim();
  const phone = document.getElementById('del-phone')?.value.trim();
  const email = document.getElementById('del-email')?.value.trim();
  const err   = document.getElementById('cart-delivery-error');

  if (!name || !addr || !zip || !city || !phone || !email) {
    err.textContent = 'Udfyld venligst alle felter markeret med *.';
    err.style.display = 'block';
    return;
  }
  if (!/^\d{4}$/.test(zip)) {
    err.textContent = 'Postnummer skal bestå af 4 cifre.';
    err.style.display = 'block';
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    err.textContent = 'Indtast venligst en gyldig e-mailadresse.';
    err.style.display = 'block';
    return;
  }
  err.style.display = 'none';

  const cart = getCart();
  const orderLines = cart.map(i => {
    let detail = i.color ? ' (' + i.color : '';
    if (i.options && Object.keys(i.options).length > 0) {
      const opts = Object.entries(i.options).map(([k, v]) => k + ': ' + v).join(', ');
      detail += (detail ? ', ' : ' (') + opts;
    }
    if (detail) detail += ')';
    return `${i.qty}x ${i.title}${detail}`;
  }).join(', ');

  const ref = [
    'Ordre: ' + orderLines,
    'Navn: '  + name,
    'Adresse: ' + addr + ', ' + zip + ' ' + city,
    'Tlf: '   + phone,
    'Email: ' + email
  ].join(' | ');

  // STRIPE PAYMENT LINK — indsæt dit link her når du har oprettet det i Stripe Dashboard
  const STRIPE_LINK = 'INDSÆT_DIT_STRIPE_PAYMENT_LINK_HER';

  if (STRIPE_LINK === 'INDSÆT_DIT_STRIPE_PAYMENT_LINK_HER') {
    alert('Stripe Payment Link er endnu ikke opsat — se vejledningen i js/cart.js.');
    return;
  }

  const checkoutUrl = STRIPE_LINK + '?client_reference_id=' + encodeURIComponent(ref)
    + '&prefilled_email=' + encodeURIComponent(email);

  window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
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
