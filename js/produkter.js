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
    price: 120,
    image: "images/products/clutch-pung.jpg",
    stripeLink: "#"
  },
  {
    id: 5,
    title: "Sprutte Bamse",
    desc: "Søde, håndlavede sprutte bamser hæklet i bomuld med håndbroderede øjne, der både giver et sødt udtryk og ekstra sikkerhed for selv de allermindste.",
    category: "bamser",
    price: 100,
    image: "images/products/sprutte-bamse.jpg", // BILLEDE: tilføj foto i images/products/
    stripeLink: "#",
    colors: [
      { name: "Lyserød", hex: "#F5C6C2" },
      { name: "Blå",     hex: "#A8CCDC" },
      { name: "Grøn",    hex: "#A8C5A0" },
      { name: "Lilla",   hex: "#C9B0D8" },
      { name: "Gul",     hex: "#F0E098" }
    ]
  },
  {
    id: 4,
    title: "Rangler",
    desc: "En sød og sanselig rangle til de mindste.<br><br>Håndlavet i blød bomuld med træperler, træring og en fin træfigur. Den blide raslelyd og de naturlige materialer stimulerer små, nysgerrige hænder og sanser.<br><br>Perfekt som gave — eller som en kærlig lille forkælelse.",
    category: "baby",
    price: 175,
    image: "images/products/rangler.jpg",
    stripeLink: "#",
    colors: [
      { name: "Lyserød / Pink",      hex1: "#F5C6C2", hex2: "#D63F7A" },
      { name: "Lyseblå / Mørkeblå",  hex1: "#A8CCDC", hex2: "#2F6FA6" },
      { name: "Brun / Beige",        hex1: "#8B6347", hex2: "#D9C4A8" }
    ],
    options: [
      { label: "Træring", choices: ["Elefant", "Kanin", "Bjørn"] }
    ]
  },
];


/* ---------- Garnfarver til farve-vælgeren ---------- */
const YARN_COLORS = [
  { name: "Råhvid",    hex: "#F5F0E8" },
  { name: "Lyserød",   hex: "#F5C6C2" },
  { name: "Beige",     hex: "#D9C4A8" },
  { name: "Brun",      hex: "#8B6347" },
  { name: "Lyseblå",   hex: "#A8CCDC" },
  { name: "Lyselilla", hex: "#D4C0E8" },
  { name: "Lysegul",   hex: "#F0E098" }
];

const CATEGORY_LABELS = {
  bamser:        "Bamser",
  toej:          "Tøj",
  tilbehoer:     "Accessories",
  baby:          "Baby",

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
  desc.innerHTML    = product.desc;
  badge.textContent = CATEGORY_LABELS[product.category] || product.category;
  colorLabel.textContent = 'Ingen farve valgt endnu';

  // Brug produkt-specifikke farver hvis de er defineret, ellers fælles garnfarver
  const colorList = product.colors || YARN_COLORS;

  // Byg farve-swatches — to-farvet split hvis hex2 er defineret
  swatchWrap.innerHTML = colorList.map(c => {
    const bg = c.hex2
      ? `background: linear-gradient(135deg, ${c.hex1} 50%, ${c.hex2} 50%);`
      : `background-color: ${c.hex1 || c.hex};`;
    return `<button
      class="color-swatch"
      data-name="${c.name}"
      style="${bg}"
      title="${c.name}"
      aria-label="${c.name}"
      type="button"
    ></button>`;
  }).join('');

  let selectedColor = '';
  let selectedOptions = {};

  swatchWrap.querySelectorAll('.color-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      swatchWrap.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedColor = btn.dataset.name;
      colorLabel.textContent = 'Valgt farve: ' + selectedColor;
    });
  });

  // Byg ekstra valgmuligheder (fx Træring)
  const optionsWrap = document.getElementById('modal-options');
  if (optionsWrap) {
    if (product.options && product.options.length > 0) {
      optionsWrap.innerHTML = product.options.map(opt => {
        const buttons = opt.choices.map(choice =>
          `<button class="option-btn" data-option="${opt.label}" data-choice="${choice}" type="button">${choice}</button>`
        ).join('');

        return `<div class="modal-option-group">
          <p class="modal-option-heading">${opt.label}</p>
          <div class="modal-option-buttons" data-option="${opt.label}">${buttons}</div>
          <p class="modal-option-label" id="option-label-${opt.label}">Ingen valgt endnu</p>
        </div>`;
      }).join('');

      optionsWrap.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const optName = btn.dataset.option;
          optionsWrap.querySelectorAll(`.option-btn[data-option="${optName}"]`).forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          selectedOptions[optName] = btn.dataset.choice;
          const lbl = document.getElementById('option-label-' + optName);
          if (lbl) lbl.textContent = 'Valgt: ' + btn.dataset.choice;
        });
      });
    } else {
      optionsWrap.innerHTML = '';
    }
  }

  // "Læg i kurv"-knap i modal
  const modalAddBtn = document.getElementById('modal-add-btn');
  if (modalAddBtn) {
    modalAddBtn.onclick = () => {
      const hasColors = product.colors && product.colors.length > 0;
      const hasOptions = product.options && product.options.length > 0;

      if (hasColors && !selectedColor) {
        colorLabel.textContent = '⚠ Vælg venligst en farve';
        colorLabel.style.color = 'var(--color-primary)';
        swatchWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }

      if (hasOptions) {
        for (const opt of product.options) {
          if (!selectedOptions[opt.label]) {
            const lbl = document.getElementById('option-label-' + opt.label);
            if (lbl) {
              lbl.textContent = '⚠ Vælg venligst ' + opt.label.toLowerCase();
              lbl.style.color = 'var(--color-primary)';
            }
            return;
          }
        }
      }

      addToCart(product, selectedColor, selectedOptions);
      closeProductModal();
    };
  }

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
    <article class="card" data-product-id="${p.id}">
      <div class="card__img-wrap card--clickable" tabindex="0" role="button" aria-label="Åbn ${p.title}">
        <img src="${p.image}" alt="${p.title}" loading="lazy">
        <span class="card__badge">${formatCategory(p.category)}</span>
      </div>
      <div class="card__body">
        <h3 class="card__title">${p.title}</h3>
        <p class="card__desc">${p.desc.split('.')[0]}.</p>
        <p class="card__price">${p.price} kr.</p>
        <div class="card__actions">
          <button class="btn btn--outline card__cta card--open-btn">Se produkt</button>
          <button class="btn btn--primary card__add-btn">+ Kurv</button>
        </div>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.card').forEach(card => {
    const id = parseInt(card.dataset.productId, 10);
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;

    const openModal = () => openProductModal(product);

    card.querySelector('.card--open-btn')?.addEventListener('click', openModal);
    card.querySelector('.card__img-wrap')?.addEventListener('click', openModal);
    card.querySelector('.card__img-wrap')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); }
    });

    card.querySelector('.card__add-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      addToCart(product, '');
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
