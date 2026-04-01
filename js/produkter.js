/* ============================================
   HæklingByFie — Produkter, Filtrering & Produkt-modal med Farve-editor
   ============================================ */

/* ---------- Produktdata ---------- */
const PRODUCTS = [
  {
    id: 3,
    title: "Brille Etui",
    desc: "Håndlavede brille etui lavet i 100 % bomuld og afsluttet med to fine træ perler for et sødt og naturligt finish.",
    category: "tilbehoer",
    price: 179,
    image: "images/products/clutch-pung.jpg",
    stripeLink: "#"
  },
  {
    id: 5,
    title: "Lynlåspung i mohair",
    desc: "Blød og luksuriøs pung hæklet i blødt mohair-garn med lynlås. Utrolig dejlig at holde og se på — perfekt som gaveide.",
    category: "tilbehoer",
    price: 149,
    image: "images/products/lynlaaspung.jpg",
    stripeLink: "#"
  }
];


/* ---------- Garnfarver til farve-vælgeren ---------- */
const YARN_COLORS = [
  { name: "Naturhvid",   hex: "#F8F4EC" },
  { name: "Creme",       hex: "#F0E8D0" },
  { name: "Blød rose",   hex: "#E8ADA6" },
  { name: "Babylyserød", hex: "#F0C4C0" },
  { name: "Koral",       hex: "#E4907C" },
  { name: "Terrakotta",  hex: "#C4705A" },
  { name: "Lavendel",    hex: "#C0A8D8" },
  { name: "Lys lilla",   hex: "#D8C4E8" },
  { name: "Himmelblå",   hex: "#A4CCDC" },
  { name: "Mintgrøn",    hex: "#A4CCC0" },
  { name: "Skovgrøn",    hex: "#7AA88C" },
  { name: "Solskin",     hex: "#EDD080" },
  { name: "Sandbeige",   hex: "#D8C8A8" },
  { name: "Varm grå",    hex: "#C4BAB0" },
  { name: "Chokolade",   hex: "#A07860" }
];

const CATEGORY_LABELS = {
  bamser:    "Bamser",
  toej:      "Tøj",
  tilbehoer: "Tilbehør"
};

function formatCategory(cat) {
  return CATEGORY_LABELS[cat] || cat;
}

/* ---------- Filtrering ---------- */
function updatePriceLabel(value) {
  const label = document.getElementById('price-label');
  if (label) label.textContent = value >= 1000 ? 'Alle priser' : `${value} kr.`;
}

function applyFilters() {
  const activeBtn = document.querySelector('.filter-btn.active');
  const activeCategory = activeBtn ? activeBtn.dataset.category : 'all';
  const slider = document.getElementById('price-range');
  const maxPrice = slider ? parseInt(slider.value, 10) : 9999;

  const filtered = PRODUCTS.filter(p => {
    const catMatch   = activeCategory === 'all' || p.category === activeCategory;
    const priceMatch = maxPrice >= 1000 || p.price <= maxPrice;
    return catMatch && priceMatch;
  });

  renderProducts(filtered, 'product-grid');
  updatePriceLabel(maxPrice);
}

/* ============================================
   PRODUKT-MODAL
   ============================================ */

function openProductModal(product) {
  const modal       = document.getElementById('product-modal');
  const img         = document.getElementById('modal-img');
  const title       = document.getElementById('modal-title');
  const price       = document.getElementById('modal-price');
  const desc        = document.getElementById('modal-desc');
  const badge       = document.getElementById('modal-badge');
  const buyBtn      = document.getElementById('modal-buy-btn');
  const swatchWrap  = document.getElementById('modal-swatches');
  const colorLabel  = document.getElementById('modal-color-label');

  img.src           = product.image;
  img.alt           = product.title;
  title.textContent = product.title;
  price.textContent = product.price + ' kr.';
  desc.textContent  = product.desc;
  badge.textContent = CATEGORY_LABELS[product.category] || product.category;
  buyBtn.href       = product.stripeLink;
  colorLabel.textContent = 'Ingen farve valgt endnu';

  // Byg farve-swatches
  swatchWrap.innerHTML = YARN_COLORS.map(c => `
    <button
      class="color-swatch"
      data-hex="${c.hex}"
      data-name="${c.name}"
      style="background-color:${c.hex};"
      title="${c.name}"
      aria-label="${c.name}"
      type="button"
    ></button>
  `).join('');

  swatchWrap.querySelectorAll('.color-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      swatchWrap.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      colorLabel.textContent = 'Valgt farve: ' + btn.dataset.name;
    });
  });

  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('modal-close')?.focus(), 50);
}

function closeProductModal() {
  document.getElementById('product-modal')?.classList.remove('is-open');
  document.body.style.overflow = '';
}


/* ---------- Render udvalgte produkter på forsiden ---------- */
function renderFeatured() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  renderProducts(PRODUCTS.slice(0, 3), 'featured-grid');
}

/* ---------- Generisk render (understøtter valgfrit target-id) ---------- */
function renderProducts(products, targetId = 'product-grid') {
  const grid = document.getElementById(targetId);
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = '<p class="no-results">Ingen produkter matcher din søgning — prøv at justere filteret.</p>';
    return;
  }

  grid.innerHTML = products.map(p => `
    <article
      class="card card--clickable"
      data-product-id="${p.id}"
      tabindex="0"
      role="button"
      aria-label="Åbn ${p.title}"
    >
      <div class="card__img-wrap">
        <img src="${p.image}" alt="${p.title}" loading="lazy">
        <span class="card__badge">${formatCategory(p.category)}</span>
      </div>
      <div class="card__body">
        <h3 class="card__title">${p.title}</h3>
        <p class="card__desc">${p.desc.split('.')[0]}.</p>
        <p class="card__price">${p.price} kr.</p>
        <span class="btn btn--outline card__cta" style="pointer-events:none;">
          Se produkt &amp; vælg farve
        </span>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.card--clickable').forEach(card => {
    const openModal = () => {
      const id = parseInt(card.dataset.productId, 10);
      const product = PRODUCTS.find(p => p.id === id);
      if (product) openProductModal(product);
    };
    card.addEventListener('click', openModal);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal();
      }
    });
  });
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {

  // Render produkter — webshop bruger #product-grid, forside bruger #featured-grid
  renderProducts(PRODUCTS, 'product-grid');
  renderFeatured();

  // Kategorifilter
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });

  // Prisslider
  const slider = document.getElementById('price-range');
  if (slider) {
    updatePriceLabel(parseInt(slider.value, 10));
    slider.addEventListener('input', applyFilters);
  }

  // Modal: luk via knap, backdrop og Escape
  document.getElementById('modal-close')?.addEventListener('click', closeProductModal);
  document.getElementById('modal-backdrop')?.addEventListener('click', closeProductModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeProductModal();
  });
});
