// ===== SHAH REHAN JEWELLERS – MAIN JS =====

// Weight conversion
const WEIGHT = {
  tola: 11.664,
  masha: 0.972,
  ratti: 0.1215,
  gram: 1
};

// Karat purity
const KARAT_PURITY = {
  '24K': 1.0, '22K': 0.9167, '21K': 0.875, '18K': 0.75,
  '16K': 0.6667, '14K': 0.5833, '12K': 0.5, '10K': 0.4167, '8K': 0.3333
};

// Live rates (14 Oct 2026)
const LIVE_RATES = {
  usdToPkr: 276.95,
  gold: {
    '24K': 37793, '22K': 34643, '21K': 33069, '18K': 28345,
    '16K': 25195, '14K': 22039, '12K': 18900, '10K': 15748, '8K': 12598
  },
  silver: {
    perGram: 570.10,
    per10Gram: 5701,
    perTola: 6651
  }
};

const BASE_RATE_24K = 37793;

// ===== HELPERS =====
function getRateForKarat(karat) {
  return Math.round(BASE_RATE_24K * KARAT_PURITY[karat]);
}

function toGrams(value, unit) {
  return value * WEIGHT[unit];
}

function formatPKR(amount) {
  return 'Rs ' + Math.round(amount).toLocaleString('en-PK');
}

// ===== RENDER GOLD RATES =====
function renderGoldRates() {
  const container = document.getElementById('goldRatesContainer');
  if (!container) return;
  
  const karats = ['24K', '22K', '21K', '18K', '16K', '14K', '12K', '10K', '8K'];
  
  container.innerHTML = karats.map(karat => {
    const pkrPerGram = LIVE_RATES.gold[karat];
    const pkrPerTola = Math.round(pkrPerGram * WEIGHT.tola);
    const pkrPerMasha = Math.round(pkrPerGram * WEIGHT.masha);
    const pkrPerRatti = Math.round(pkrPerGram * WEIGHT.ratti);
    const usdPerGram = (pkrPerGram / LIVE_RATES.usdToPkr).toFixed(2);
    const usdPerTola = (pkrPerTola / LIVE_RATES.usdToPkr).toFixed(2);
    
    return `
      <div class="rate-card">
        <div class="rate-karat">${karat} GOLD</div>
        <div class="rate-row">
          <span class="rate-label">Per Gram</span>
          <span class="rate-value rate-value-pkr">Rs ${pkrPerGram.toLocaleString()}</span>
        </div>
        <div class="rate-row">
          <span class="rate-label">Per Tola</span>
          <span class="rate-value rate-value-pkr">Rs ${pkrPerTola.toLocaleString()}</span>
        </div>
        <div class="rate-row">
          <span class="rate-label">Per Masha</span>
          <span class="rate-value rate-value-pkr">Rs ${pkrPerMasha.toLocaleString()}</span>
        </div>
        <div class="rate-row">
          <span class="rate-label">Per Ratti</span>
          <span class="rate-value rate-value-pkr">Rs ${pkrPerRatti}</span>
        </div>
        <div class="rate-row" style="border-top: 1px solid rgba(255,215,0,0.2); margin-top: 8px; padding-top: 8px;">
          <span class="rate-label">USD/Gram</span>
          <span class="rate-value rate-value-usd">$${usdPerGram}</span>
        </div>
        <div class="rate-row">
          <span class="rate-label">USD/Tola</span>
          <span class="rate-value rate-value-usd">$${usdPerTola}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ===== RENDER SILVER RATES =====
function renderSilverRates() {
  const container = document.getElementById('silverRatesContainer');
  if (!container) return;
  
  const silver = LIVE_RATES.silver;
  const usdPerGram = (silver.perGram / LIVE_RATES.usdToPkr).toFixed(2);
  const usdPer10Gram = (silver.per10Gram / LIVE_RATES.usdToPkr).toFixed(2);
  const usdPerTola = (silver.perTola / LIVE_RATES.usdToPkr).toFixed(2);
  
  container.innerHTML = `
    <div class="silver-card">
      <div class="rate-karat">SILVER</div>
      <div class="rate-row"><span class="rate-label">Per Gram</span><span class="rate-value rate-value-pkr">Rs ${silver.perGram}</span></div>
      <div class="rate-row"><span class="rate-label">Per 10 Gram</span><span class="rate-value rate-value-pkr">Rs ${silver.per10Gram.toLocaleString()}</span></div>
      <div class="rate-row"><span class="rate-label">Per Tola</span><span class="rate-value rate-value-pkr">Rs ${silver.perTola.toLocaleString()}</span></div>
      <div class="rate-row" style="border-top: 1px solid rgba(192,192,192,0.3); margin-top: 8px; padding-top: 8px;">
        <span class="rate-label">USD/Gram</span>
        <span class="rate-value rate-value-usd">$${usdPerGram}</span>
      </div>
      <div class="rate-row"><span class="rate-label">USD/10 Gram</span><span class="rate-value rate-value-usd">$${usdPer10Gram}</span></div>
      <div class="rate-row"><span class="rate-label">USD/Tola</span><span class="rate-value rate-value-usd">$${usdPerTola}</span></div>
    </div>
  `;
}

// ===== TAB SWITCHING =====
function switchRateTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
  
  if (tab === 'gold') {
    document.getElementById('goldRatesTab').classList.remove('hidden');
    document.getElementById('silverRatesTab').classList.add('hidden');
  } else {
    document.getElementById('silverRatesTab').classList.remove('hidden');
    document.getElementById('goldRatesTab').classList.add('hidden');
  }
}

// ===== UPDATE USD RATE =====
function updateUsdRate() {
  const usdEl = document.getElementById('usdRate');
  if (usdEl) usdEl.textContent = LIVE_RATES.usdToPkr;
  
  const timeEl = document.getElementById('lastUpdated');
  if (timeEl) {
    const now = new Date();
    timeEl.textContent = now.toLocaleString('en-PK', { dateStyle: 'short', timeStyle: 'short' });
  }
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
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    const products = await res.json();
    
    if (!products || products.length === 0) {
      grid.innerHTML = '<div class="loading-spinner">No products found</div>';
      return;
    }
    
    grid.innerHTML = products.map(p => `
      <div class="product-card" onclick='openProductModal(${JSON.stringify(p).replace(/'/g, "&#39;")})'>
        <img src="${p.image_url || 'images/placeholder.jpg'}" alt="${p.name}" loading="lazy">
        <div class="product-info">
          <span class="category-tag">${p.category}</span>
          <h3>${p.name}</h3>
          <p class="price">${formatPKR(p.price)}</p>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Error loading products:', error);
    grid.innerHTML = '<div class="loading-spinner">Error loading products</div>';
  }
}

function openProductModal(product) {
  currentProduct = product;
  
  document.getElementById('modalImage').src = product.image_url || 'images/placeholder.jpg';
  document.getElementById('modalProductName').textContent = product.name;
  document.getElementById('modalProductCode').textContent = `Code: SRJ-${product.id.slice(0, 6).toUpperCase()}`;
  document.getElementById('modalDescription').textContent = product.description || '';
  
  const sizeSelect = document.getElementById('modalSize');
  sizeSelect.innerHTML = '<option value="">Select Size</option>' + getSizeOptions(product.category, product.subcategory);
  
  const karatSection = document.getElementById('karatSection');
  if (product.category === 'artificial') {
    karatSection.style.display = 'none';
  } else {
    karatSection.style.display = 'block';
  }
  
  if (product.weight) {
    document.getElementById('modalWeight').value = product.weight;
  }
  
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

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeProductModal();
});

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
  
  if (!weight || weight <= 0) {
    alert('Please enter a valid weight');
    return;
  }
  
  const weightInGrams = toGrams(weight, unit);
  
  let karat = '24K';
  const karatInput = document.querySelector('input[name="karat"]:checked');
  if (karatInput && currentProduct.category !== 'artificial') {
    karat = karatInput.value;
  }
  
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
  
  const breakdown = document.getElementById('priceBreakdown');
  if (breakdown.classList.contains('hidden')) {
    alert('Please calculate price first');
    return;
  }
  
  const weight = parseFloat(document.getElementById('modalWeight').value);
  const unit = document.getElementById('modalUnit').value;
  const size = document.getElementById('modalSize').value;
  const karatInput = document.querySelector('input[name="karat"]:checked');
  const karat = karatInput ? karatInput.value : 'N/A';
  const total = document.getElementById('pTotal').textContent;
  
  const cartItem = {
    id: currentProduct.id,
    name: currentProduct.name,
    karat: karat,
    weight: weight,
    unit: unit,
    size: size,
    total: total,
    image: currentProduct.image_url,
    category: currentProduct.category
  };
  
  cart.push(cartItem);
  localStorage.setItem('srj_cart', JSON.stringify(cart));
  
  alert('✅ Added to cart!\n\nItems in cart: ' + cart.length);
  closeProductModal();
}

function whatsappOrder() {
  if (!currentProduct) return;
  
  const weight = document.getElementById('modalWeight').value;
  const unit = document.getElementById('modalUnit').value;
  const size = document.getElementById('modalSize').value;
  const karatInput = document.querySelector('input[name="karat"]:checked');
  const karat = karatInput ? karatInput.value : 'N/A';
  const total = document.getElementById('pTotal').textContent;
  
  const message = `Assalam o Alaikum,%0A%0A` +
    `Mujhe yeh product order karni hai:%0A%0A` +
    `📿 Product: ${currentProduct.name}%0A` +
    `🔸 Karat: ${karat}%0A` +
    `⚖️ Weight: ${weight} ${unit}%0A` +
    `📏 Size: ${size || 'Standard'}%0A` +
    `💰 Total: ${total}%0A%0A` +
    `Please confirm karein.%0A%0A` +
    `SHAH REHAN JEWELLERS`;
  
  window.open(`https://wa.me/923266501314?text=${message}`, '_blank');
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderGoldRates();
  renderSilverRates();
  updateUsdRate();
  loadProducts();
  console.log('SHAH REHAN JEWELLERS Loaded ✅');
});