// ===== SHAH REHAN JEWELLERS – MAIN JS =====

const WEIGHT = {
  tola: 11.664,
  masha: 0.972,
  ratti: 0.1215,
  gram: 1
};

const KARAT_PURITY = {
  '24K': 1.0, '22K': 0.9167, '21K': 0.875, '18K': 0.75,
  '16K': 0.6667, '14K': 0.5833, '12K': 0.5, '10K': 0.4167, '8K': 0.3333
};

const LIVE_RATES = {
  usdToPkr: 276.95,
  gold: {
    '24K': 430000, '22K': 394167, '21K': 376250, '18K': 322500,
    '16K': 286667, '14K': 250833, '12K': 215000, '10K': 179167, '8K': 143333,
    'Pathoor': 424500
  },
  silver: {
    perGram: 570.10,
    per10Gram: 5701,
    perTola: 6651
  }
};

let currentRatesPerGram = {};

// ===== HELPERS =====
function getRateForKarat(karat) {
  if (currentRatesPerGram[karat]) return currentRatesPerGram[karat];
  const ratePerTola = LIVE_RATES.gold[karat] || 0;
  return Math.round(ratePerTola / WEIGHT.tola);
}

function toGrams(value, unit) { return value * WEIGHT[unit]; }
function formatPKR(amount) { return 'Rs ' + Math.round(amount).toLocaleString('en-PK'); }

// ===== FETCH LIVE RATES =====
async function loadLiveRates() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/gold_rates?select=*&order=karat.asc`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );
    const rates = await res.json();
    if (!rates || rates.length === 0) { console.log('⚠️ No rates in DB'); return; }

    rates.forEach(r => {
      if (r.rate_per_tola) LIVE_RATES.gold[r.karat] = parseFloat(r.rate_per_tola);
      if (r.rate_per_gram) {
        currentRatesPerGram[r.karat] = parseFloat(r.rate_per_gram);
      } else if (r.rate_per_tola) {
        currentRatesPerGram[r.karat] = Math.round(parseFloat(r.rate_per_tola) / WEIGHT.tola);
      }
    });

    const lastUpdated = rates[0]?.updated_at;
    const timeEl = document.getElementById('lastUpdated');
    if (timeEl && lastUpdated) timeEl.textContent = new Date(lastUpdated).toLocaleString('en-PK');

    const rate24K = LIVE_RATES.gold['24K'] || 0;
    const pathoorRate = LIVE_RATES.gold['Pathoor'] || Math.round(rate24K - 5500);

    const top24KEl = document.getElementById('top24K');
    const topPathoorEl = document.getElementById('topPathoor');
    if (top24KEl) top24KEl.textContent = `Rs ${rate24K.toLocaleString()}`;
    if (topPathoorEl) topPathoorEl.textContent = `Rs ${pathoorRate.toLocaleString()}`;

    console.log('✅ Live rates loaded:', rates.length);

    // Re-render biscuits with fresh rates
    renderBiscuitUnits();

  } catch (error) { console.error('⚠️ Rate fetch failed:', error); }
}

// ===== CAROUSEL =====
let carouselInterval = null;
let currentSlide = 0;
let carouselCount = 0;

function startKaratCarousel(total) {
  carouselCount = total;
  currentSlide = 0;
  if (carouselInterval) clearInterval(carouselInterval);
  carouselInterval = setInterval(() => {
    currentSlide = (currentSlide + 1) % total;
    showSlide(currentSlide);
  }, 10000);
}

function showSlide(index) {
  const slides = document.querySelectorAll('.karat-slide');
  const dots = document.querySelectorAll('.carousel-dots .dot');
  slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
  dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  currentSlide = index;
}

function goToSlide(index) {
  if (carouselInterval) clearInterval(carouselInterval);
  showSlide(index);
  carouselInterval = setInterval(() => {
    currentSlide = (currentSlide + 1) % carouselCount;
    showSlide(currentSlide);
  }, 10000);
}

// ===== RENDER GOLD RATES =====
function renderGoldRates() {
  const container = document.getElementById('goldRatesContainer');
  if (!container) return;
  
  const karats = ['24K', '22K', '21K', '18K', '16K', '14K', '12K', '10K', '8K', 'Pathoor'];
  
  const slides = karats.map((karat, index) => {
    const pkrPerTola = LIVE_RATES.gold[karat] || 0;
    const pkrPerGram = currentRatesPerGram[karat] || Math.round(pkrPerTola / WEIGHT.tola);
    const pkrPerMasha = Math.round(pkrPerTola / 12);
    const pkrPerRatti = Math.round(pkrPerTola / 96);
    const isPathoor = karat === 'Pathoor';
    const logoImg = isPathoor ? 'images/pathoor-logo.jpg' : 'images/gold-logo.jpg';
    
    return `
      <div class="karat-slide ${index === 0 ? 'active' : ''} ${isPathoor ? 'pathoor-slide' : ''}">
        <div class="karat-box">
          <div class="sparkle sparkle-1"></div>
          <div class="sparkle sparkle-2"></div>
          <div class="sparkle sparkle-3"></div>
          <div class="karat-header">
            <img src="${logoImg}" alt="${isPathoor ? 'Pathoor' : 'Gold'}" class="karat-logo" onerror="this.style.display='none'">
            <span class="karat-title">${isPathoor ? 'PATHOOR GOLD' : karat + ' GOLD'}</span>
          </div>
          <div class="karat-main-rate">
            <div class="rate-label">Per Tola</div>
            <div class="rate-tola">Rs ${Math.round(pkrPerTola).toLocaleString()}</div>
          </div>
          <div class="karat-details">
            <div class="detail-item">
              <div class="detail-label">Per Gram</div>
              <div class="detail-value">Rs ${pkrPerGram.toLocaleString()}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Per Masha</div>
              <div class="detail-value">Rs ${pkrPerMasha.toLocaleString()}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Per Ratti</div>
              <div class="detail-value">Rs ${pkrPerRatti}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = `
    <div class="karat-carousel">${slides}</div>
    <div class="carousel-dots" id="carouselDots">
      ${karats.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></span>`).join('')}
    </div>
  `;
  startKaratCarousel(karats.length);
}

// ===== RENDER SILVER RATES =====
function renderSilverRates() {
  const container = document.getElementById('silverRatesContainer');
  if (!container) return;
  const silver = LIVE_RATES.silver;
  const usdPerGram = (silver.perGram / LIVE_RATES.usdToPkr).toFixed(2);
  
  container.innerHTML = `
    <div class="karat-carousel">
      <div class="karat-slide active silver-slide">
        <div class="karat-box silver-box">
          <div class="sparkle sparkle-1"></div>
          <div class="sparkle sparkle-2"></div>
          <div class="sparkle sparkle-3"></div>
          <div class="karat-header">
            <img src="images/silver-logo.jpg" alt="Silver" class="karat-logo" onerror="this.style.display='none'">
            <span class="karat-title">SILVER RATE</span>
          </div>
          <div class="karat-main-rate">
            <div class="rate-label">Per Tola</div>
            <div class="rate-tola">Rs ${silver.perTola.toLocaleString()}</div>
          </div>
          <div class="karat-details">
            <div class="detail-item">
              <div class="detail-label">Per Gram</div>
              <div class="detail-value">Rs ${silver.perGram.toFixed(2)}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Per 10 Gram</div>
              <div class="detail-value">Rs ${silver.per10Gram.toLocaleString()}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">USD/Gram</div>
              <div class="detail-value">$${usdPerGram}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ===== TAB SWITCHING =====
function switchRateTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
  
  const goldTab = document.getElementById('goldRatesTab');
  const silverTab = document.getElementById('silverRatesTab');
  const biscuitsTab = document.getElementById('biscuitsTab');
  
  if (goldTab) goldTab.classList.add('hidden');
  if (silverTab) silverTab.classList.add('hidden');
  if (biscuitsTab) biscuitsTab.classList.add('hidden');
  
  if (tab === 'gold' && goldTab) {
    goldTab.classList.remove('hidden');
    if (carouselInterval) clearInterval(carouselInterval);
    startKaratCarousel(carouselCount);
  } else if (tab === 'silver' && silverTab) {
    silverTab.classList.remove('hidden');
  } else if (tab === 'biscuits' && biscuitsTab) {
    biscuitsTab.classList.remove('hidden');
    renderBiscuitUnits();
  }
}

// ===== UPDATE USD / CART =====
function updateUsdRate() {
  const usdEl = document.getElementById('usdRate');
  if (usdEl) usdEl.textContent = LIVE_RATES.usdToPkr;
}

function updateCartCount() {
  const cartData = JSON.parse(localStorage.getItem('srj_cart') || '[]');
  const el = document.getElementById('cartCount');
  if (el) el.textContent = cartData.length;
}

// =====================================================
// PRODUCT SYSTEM
// =====================================================

let currentProduct = null;
let cart = JSON.parse(localStorage.getItem('srj_cart') || '[]');

async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&is_active=eq.true&order=created_at.desc&limit=12`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const products = await res.json();
    if (!products || products.length === 0) {
      grid.innerHTML = '<div class="loading-spinner">No products found</div>';
      return;
    }
    grid.innerHTML = products.map(p => `
      <div class="product-card" onclick='openProductModal(${JSON.stringify(p).replace(/'/g, "&#39;")})'>
        <img src="${p.image_url || 'images/placeholder.svg'}" alt="${p.name}" loading="lazy" onerror="this.src='images/placeholder.svg'">
        <div class="product-info">
          <span class="category-tag">${p.category}</span>
          <h3>${p.name}</h3>
          <p class="price">${formatPKR(p.price)}</p>
        </div>
      </div>
    `).join('');
  } catch (error) { grid.innerHTML = '<div class="loading-spinner">Error loading products</div>'; }
}

function openProductModal(product) {
  currentProduct = product;
  document.getElementById('modalImage').src = product.image_url || 'images/placeholder.svg';
  document.getElementById('modalProductName').textContent = product.name;
  document.getElementById('modalProductCode').textContent = `Code: SRJ-${product.id.slice(0, 6).toUpperCase()}`;
  document.getElementById('modalDescription').textContent = product.description || '';
  const sizeSelect = document.getElementById('modalSize');
  sizeSelect.innerHTML = '<option value="">Select Size</option>' + getSizeOptions(product.category, product.subcategory);
  const karatSection = document.getElementById('karatSection');
  karatSection.style.display = product.category === 'artificial' ? 'none' : 'block';
  if (product.weight) document.getElementById('modalWeight').value = product.weight;
  document.getElementById('priceBreakdown').classList.add('hidden');
  document.getElementById('productModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('active');
  document.body.style.overflow = '';
  currentProduct = null;
}

document.addEventListener('click', (e) => {
  const modal = document.getElementById('productModal');
  if (e.target === modal) closeProductModal();
});

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeProductModal(); });

function getSizeOptions(category, subcategory) {
  const sizes = {
    'Rings': ['10','11','12','13','14','15','16','17','18','19','20'],
    'Baby Rings': ['1','2','3','4','5','6','7','8','9'],
    'Bangles': ['2.2','2.4','2.6','2.8','2.10','2.12'],
    'Bracelets': ['6"','6.5"','7"','7.5"','8"'],
    'Chains': ['14"','16"','18"','20"','22"','24"','26"','30"'],
    'Anklets': ['9"','10"','11"'],
    'Coins': ['1g','2g','2.5g','5g','10g','20g','50g','100g']
  };
  const options = sizes[subcategory] || sizes[category] || ['Standard'];
  return options.map(s => `<option value="${s}">${s}</option>`).join('');
}

function calculatePrice() {
  if (!currentProduct) return;
  const weight = parseFloat(document.getElementById('modalWeight').value);
  const unit = document.getElementById('modalUnit').value;
  if (!weight || weight <= 0) { alert('Please enter a valid weight'); return; }
  const weightInGrams = toGrams(weight, unit);
  let karat = '24K';
  const karatInput = document.querySelector('input[name="karat"]:checked');
  if (karatInput && currentProduct.category !== 'artificial') karat = karatInput.value;
  
  if (currentProduct.category === 'artificial') {
    document.getElementById('pRate').textContent = 'Fixed Price';
    document.getElementById('pWeight').textContent = '—';
    document.getElementById('pGold').textContent = formatPKR(currentProduct.price);
    document.getElementById('pMaking').textContent = '—';
    document.getElementById('pPolish').textContent = '—';
    document.getElementById('pGST').textContent = formatPKR(currentProduct.price * 0.03);
    document.getElementById('pTotal').textContent = formatPKR(currentProduct.price * 1.03);
    document.getElementById('priceBreakdown').classList.remove('hidden');
    return;
  }
  
  const ratePerGram = getRateForKarat(karat);
  const goldValue = ratePerGram * weightInGrams;
  const making = goldValue * 0.15;
  const polish = goldValue * 0.10;
  const subtotal = goldValue + making + polish;
  const gst = subtotal * 0.03;
  const total = subtotal + gst;
  
  document.getElementById('pRate').textContent = formatPKR(ratePerGram) + '/g';
  document.getElementById('pWeight').textContent = weightInGrams.toFixed(3) + ' g';
  document.getElementById('pGold').textContent = formatPKR(goldValue);
  document.getElementById('pMaking').textContent = formatPKR(making);
  document.getElementById('pPolish').textContent = formatPKR(polish);
  document.getElementById('pGST').textContent = formatPKR(gst);
  document.getElementById('pTotal').textContent = formatPKR(total);
  document.getElementById('priceBreakdown').classList.remove('hidden');
}

function addToCart() {
  if (!currentProduct) return;
  if (document.getElementById('priceBreakdown').classList.contains('hidden')) {
    alert('Please calculate price first'); return;
  }
  const cartItem = {
    id: currentProduct.id,
    name: currentProduct.name,
    karat: document.querySelector('input[name="karat"]:checked')?.value || 'N/A',
    weight: parseFloat(document.getElementById('modalWeight').value),
    unit: document.getElementById('modalUnit').value,
    size: document.getElementById('modalSize').value,
    total: document.getElementById('pTotal').textContent,
    image: currentProduct.image_url,
    category: currentProduct.category
  };
  cart.push(cartItem);
  localStorage.setItem('srj_cart', JSON.stringify(cart));
  updateCartCount();
  alert('✅ Added to cart!\n\nItems in cart: ' + cart.length);
  closeProductModal();
}

function whatsappOrder() {
  if (!currentProduct) return;
  const weight = document.getElementById('modalWeight').value;
  const unit = document.getElementById('modalUnit').value;
  const size = document.getElementById('modalSize').value;
  const karat = document.querySelector('input[name="karat"]:checked')?.value || 'N/A';
  const total = document.getElementById('pTotal').textContent;
  const message = `Assalam o Alaikum,%0A%0AMujhe yeh product order karni hai:%0A%0A📿 Product: ${currentProduct.name}%0A🔸 Karat: ${karat}%0A⚖️ Weight: ${weight} ${unit}%0A📏 Size: ${size || 'Standard'}%0A💰 Total: ${total}%0A%0APlease confirm karein.%0A%0ASHAH REHAN JEWELLERS`;
  window.open(`https://wa.me/923266501314?text=${message}`, '_blank');
}

// =====================================================
// BISCUITS SYSTEM
// =====================================================

const BISCUIT_UNITS = {
  gold: [
    { label: '1 Gram', grams: 1 },
    { label: '5 Gram', grams: 5 },
    { label: '10 Gram', grams: 10 },
    { label: '1 Tola', grams: 11.664 },
    { label: '5 Tola', grams: 58.32 },
    { label: '10 Tola', grams: 116.64 }
  ],
  pathoor: [
    { label: '1 Gram', grams: 1 },
    { label: '5 Gram', grams: 5 },
    { label: '10 Gram', grams: 10 },
    { label: '1 Tola', grams: 11.664 },
    { label: '5 Tola', grams: 58.32 },
    { label: '10 Tola', grams: 116.64 }
  ],
  silver: [
    { label: '1 Tola', grams: 11.664 },
    { label: '5 Tola', grams: 58.32 },
    { label: '10 Tola', grams: 116.64 },
    { label: '50 Tola', grams: 583.20 },
    { label: '100 Tola', grams: 1166.40 }
  ]
};

function renderBiscuitUnits() {
  // GOLD
  const goldContainer = document.getElementById('goldBiscuitUnits');
  if (goldContainer) {
    const goldRatePerGram = (LIVE_RATES.gold['24K'] || 0) / WEIGHT.tola;
    goldContainer.innerHTML = BISCUIT_UNITS.gold.map(unit => {
      const metalValue = Math.round(goldRatePerGram * unit.grams);
      return `
        <button class="unit-btn gold-unit" onclick='openBiscuitPopup("gold", "${unit.label}", ${unit.grams}, ${metalValue}, "24K Gold")'>
          <span class="unit-label">${unit.label}</span>
          <span class="unit-price">Rs ${metalValue.toLocaleString()}</span>
        </button>
      `;
    }).join('');
  }

  // PATHOOR
  const pathoorContainer = document.getElementById('pathoorBiscuitUnits');
  if (pathoorContainer) {
    const pathoorRate = LIVE_RATES.gold['Pathoor'] || (LIVE_RATES.gold['24K'] - 5500);
    const pathoorRatePerGram = pathoorRate / WEIGHT.tola;
    pathoorContainer.innerHTML = BISCUIT_UNITS.pathoor.map(unit => {
      const metalValue = Math.round(pathoorRatePerGram * unit.grams);
      return `
        <button class="unit-btn pathoor-unit" onclick='openBiscuitPopup("pathoor", "${unit.label}", ${unit.grams}, ${metalValue}, "Pathoor Gold")'>
          <span class="unit-label">${unit.label}</span>
          <span class="unit-price">Rs ${metalValue.toLocaleString()}</span>
        </button>
      `;
    }).join('');
  }

  // SILVER
  const silverContainer = document.getElementById('silverBiscuitUnits');
  if (silverContainer) {
    const silverPerGram = LIVE_RATES.silver.perGram || 570.10;
    silverContainer.innerHTML = BISCUIT_UNITS.silver.map(unit => {
      const metalValue = Math.round(silverPerGram * unit.grams);
      return `
        <button class="unit-btn silver-unit" onclick='openBiscuitPopup("silver", "${unit.label}", ${unit.grams}, ${metalValue}, "Silver")'>
          <span class="unit-label">${unit.label}</span>
          <span class="unit-price">Rs ${metalValue.toLocaleString()}</span>
        </button>
      `;
    }).join('');
  }
}

function openBiscuitPopup(metalType, unitLabel, grams, metalValue, metalName) {
  const serviceCharges = Math.round(metalValue * 0.01);
  const subtotal = metalValue + serviceCharges;
  const gst = Math.round(subtotal * 0.03);
  const total = subtotal + gst;

  let popup = document.getElementById('biscuitPopup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'biscuitPopup';
    popup.className = 'modal-overlay';
    document.body.appendChild(popup);
  }

  popup.innerHTML = `
    <div class="modal-content biscuit-modal">
      <button class="modal-close" onclick="closeBiscuitPopup()">×</button>
      <h2 class="modal-title">🪙 Purchase Biscuit</h2>
      <div class="biscuit-popup-body">
        <div class="biscuit-popup-header">
          <div class="biscuit-metal-name">${metalName}</div>
          <div class="biscuit-unit-info">${unitLabel} • ${grams.toFixed(3)} grams</div>
        </div>
        <div class="biscuit-breakdown">
          <div class="breakdown-row">
            <span>Metal Value</span>
            <span>Rs ${metalValue.toLocaleString()}</span>
          </div>
          <div class="breakdown-row">
            <span>Service Charges (1%)</span>
            <span>Rs ${serviceCharges.toLocaleString()}</span>
          </div>
          <div class="breakdown-row subtotal-row">
            <span>Subtotal</span>
            <span>Rs ${subtotal.toLocaleString()}</span>
          </div>
          <div class="breakdown-row">
            <span>GST (3%)</span>
            <span>Rs ${gst.toLocaleString()}</span>
          </div>
          <div class="breakdown-row total-row">
            <span>TOTAL</span>
            <span>Rs ${total.toLocaleString()}</span>
          </div>
        </div>
        <div class="payment-notice">
          <div class="notice-icon">💯</div>
          <div class="notice-text">
            <strong>100% Advance Payment</strong>
            <p>Biscuits require full payment via Easypaisa (no cart)</p>
          </div>
        </div>
        <div class="customer-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input type="text" id="biscuitName" class="form-input" placeholder="Your name">
            </div>
            <div class="form-group">
              <label class="form-label">WhatsApp *</label>
              <input type="tel" id="biscuitPhone" class="form-input" placeholder="03XXXXXXXXX">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Email (Optional)</label>
            <input type="email" id="biscuitEmail" class="form-input" placeholder="your@email.com">
          </div>
          <div class="form-group">
            <label class="form-label">Address *</label>
            <input type="text" id="biscuitAddress" class="form-input" placeholder="Full address">
          </div>
        </div>
        <div class="easypaisa-info">
          <div class="easypaisa-title">💚 Pay via Easypaisa</div>
          <div class="easypaisa-row"><span>Account Number:</span><strong>03266501314</strong></div>
          <div class="easypaisa-row"><span>Account Title:</span><strong>Syed Ahmed Bilal</strong></div>
          <div class="easypaisa-row"><span>Amount to Send:</span><strong>Rs ${total.toLocaleString()}</strong></div>
          <button class="btn-copy-number" onclick="copyBiscuitNumber()">📋 Copy Number</button>
        </div>
        <div class="form-group">
          <label class="form-label">Transaction ID (TID) *</label>
          <input type="text" id="biscuitTID" class="form-input" placeholder="Enter transaction ID">
        </div>
        <div class="form-group">
          <label class="form-label">Payment Screenshot *</label>
          <input type="file" id="biscuitScreenshot" class="form-input" accept="image/*" style="padding: 10px;">
        </div>
        <button onclick='confirmBiscuitOrder("${metalType}", "${metalName}", "${unitLabel}", ${grams}, ${metalValue}, ${serviceCharges}, ${gst}, ${total})' class="btn-gold" style="width: 100%; padding: 15px; font-size: 1.1rem;">
          ✅ Confirm Purchase
        </button>
        <p class="urdu-tagline urdu" dir="rtl">آپ کا آرڈر رازداری کے ساتھ آپ تک پہنچایا جائے گا</p>
      </div>
    </div>
  `;

  popup.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeBiscuitPopup() {
  const popup = document.getElementById('biscuitPopup');
  if (popup) popup.classList.remove('active');
  document.body.style.overflow = '';
}

function copyBiscuitNumber() {
  navigator.clipboard.writeText('03266501314');
  alert('✅ Number copied: 03266501314');
}

async function confirmBiscuitOrder(metalType, metalName, unitLabel, grams, metalValue, serviceCharges, gst, total) {
  const name = document.getElementById('biscuitName').value.trim();
  const phone = document.getElementById('biscuitPhone').value.trim();
  const email = document.getElementById('biscuitEmail').value.trim();
  const address = document.getElementById('biscuitAddress').value.trim();
  const tid = document.getElementById('biscuitTID').value.trim();
  const screenshot = document.getElementById('biscuitScreenshot').files[0];

  if (!name || !phone || !address || !tid || !screenshot) {
    alert('❌ Please fill all required fields');
    return;
  }

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const orderNumber = `SRJ-BIS-${dateStr}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

  const orderData = {
    order_number: orderNumber,
    customer_name: name,
    customer_whatsapp: phone,
    customer_email: email || null,
    customer_address: address,
    items: [{
      name: `${metalName} Biscuit - ${unitLabel}`,
      weight: grams,
      unit: 'gram',
      karat: metalType === 'silver' ? null : '24K',
      total: `Rs ${total.toLocaleString()}`
    }],
    subtotal: metalValue + serviceCharges,
    gst_amount: gst,
    total_amount: total,
    advance_type: 'full',
    advance_amount: total,
    remaining_amount: 0,
    payment_method: 'Easypaisa',
    transaction_id: tid,
    order_status: 'pending',
    notes: `Biscuit Order - ${metalName} (${unitLabel})`,
    expected_delivery: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(orderData)
    });

    if (!res.ok) { const err = await res.text(); throw new Error(err); }

    localStorage.setItem('srj_last_biscuit_order', JSON.stringify(orderData));

    // Owner WhatsApp
    const ownerMsg = `🔔 *NEW BISCUIT ORDER*%0A%0AOrder #: ${orderNumber}%0ACustomer: ${name}%0AWhatsApp: ${phone}%0AEmail: ${email || 'N/A'}%0A%0A🪙 Item: ${metalName} - ${unitLabel}%0A⚖️ Weight: ${grams.toFixed(3)} grams%0A💰 Total: Rs ${total.toLocaleString()}%0A📝 TID: ${tid}%0A%0AFull payment received. Please verify and confirm.`;
    window.open(`https://wa.me/923266501314?text=${ownerMsg}`, '_blank');

    // Customer WhatsApp
    const customerMsg = `Assalam o Alaikum ${name},%0A%0AAap ka biscuit order receive ho gaya!%0A%0A📋 Order #: ${orderNumber}%0A🪙 Item: ${metalName} - ${unitLabel}%0A⚖️ Weight: ${grams.toFixed(3)} grams%0A💰 Total: Rs ${total.toLocaleString()}%0A%0AAap ki payment verify hone ke baad order confirm ho jayega.%0A%0AShukriya!%0ASHAH REHAN JEWELLERS`;
    setTimeout(() => { window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${customerMsg}`, '_blank'); }, 1000);

    alert(`✅ Order Confirmed!\n\nOrder #: ${orderNumber}\nTotal: Rs ${total.toLocaleString()}\n\nWhatsApp confirmation sent.`);
    closeBiscuitPopup();
    window.location.href = 'order-success.html';

  } catch (error) {
    console.error('Order error:', error);
    alert('❌ Error: ' + error.message);
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Loading SHAH REHAN JEWELLERS...');
  await loadLiveRates();
  renderGoldRates();
  renderSilverRates();
  updateUsdRate();
  loadProducts();
  updateCartCount();
  renderBiscuitUnits();
  console.log('✅ SHAH REHAN JEWELLERS Loaded');
});

setInterval(async () => {
  console.log('🔄 Auto-refreshing rates...');
  await loadLiveRates();
  renderGoldRates();
  renderSilverRates();
}, 15 * 60 * 1000);