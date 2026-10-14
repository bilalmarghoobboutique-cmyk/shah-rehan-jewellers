// ===== SHAH REHAN JEWELLERS – CATEGORY PAGE JS =====

let currentProduct = null;
let allProducts = [];
let currentCategory = '';
let cart = JSON.parse(localStorage.getItem('srj_cart') || '[]');

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

const BASE_RATE_24K = 37793;
const SILVER_RATE = 570.10;

function getRateForKarat(karat) {
  return Math.round(BASE_RATE_24K * KARAT_PURITY[karat]);
}

function toGrams(value, unit) {
  return value * WEIGHT[unit];
}

function formatPKR(amount) {
  return 'Rs ' + Math.round(amount).toLocaleString('en-PK');
}

function updateCartCount() {
  const el = document.getElementById('cartCount');
  if (el) el.textContent = cart.length;
}

// ===== LOAD PRODUCTS BY CATEGORY =====
async function loadCategoryProducts(category) {
  currentCategory = category;
  const grid = document.getElementById('categoryProductsGrid');
  if (!grid) return;
  
  grid.innerHTML = '<div class="loading-spinner">Loading products...</div>';
  
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&category=eq.${category}&is_active=eq.true&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    allProducts = await res.json();
    
    if (!allProducts || allProducts.length === 0) {
      grid.innerHTML = `<div class="loading-spinner">No ${category} products found. Check back soon!</div>`;
      return;
    }
    
    renderProducts(allProducts);
    
  } catch (error) {
    console.error('Error:', error);
    grid.innerHTML = '<div class="loading-spinner">Error loading products</div>';
  }
}

// ===== LOAD COINS =====
async function loadCoins() {
  const grid = document.getElementById('categoryProductsGrid');
  if (!grid) return;
  
  grid.innerHTML = '<div class="loading-spinner">Loading coins...</div>';
  
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&subcategory=eq.Coins&is_active=eq.true`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    allProducts = await res.json();
    
    if (!allProducts || allProducts.length === 0) {
      grid.innerHTML = '<div class="loading-spinner">No coins found. Check back soon!</div>';
      return;
    }
    
    renderProducts(allProducts);
  } catch (error) {
    grid.innerHTML = '<div class="loading-spinner">Error loading coins</div>';
  }
}

function renderProducts(products) {
  const grid = document.getElementById('categoryProductsGrid');
  
  if (!products || products.length === 0) {
    grid.innerHTML = '<div class="loading-spinner">No products match your filter</div>';
    return;
  }
  
  grid.innerHTML = products.map(p => `
    <div class="product-card" onclick='openProductModal(${JSON.stringify(p).replace(/'/g, "&#39;")})'>
      <img src="${p.image_url || 'images/placeholder.svg'}" alt="${p.name}" loading="lazy" onerror="this.src='images/placeholder.svg'">
      <div class="product-info">
        <span class="category-tag">${p.karat || p.category}</span>
        <h3>${p.name}</h3>
        <p class="price">${formatPKR(p.price)}</p>
      </div>
    </div>
  `).join('');
}

// ===== FILTERS =====
function filterByKarat(karat) {
  if (!karat) {
    renderProducts(allProducts);
    return;
  }
  const filtered = allProducts.filter(p => p.karat === karat);
  renderProducts(filtered);
}

function filterBySubcategory(sub) {
  const filtered = allProducts.filter(p => p.subcategory === sub);
  renderProducts(filtered);
}

function filterByWeight(weight) {
  const filtered = allProducts.filter(p => p.size === weight);
  renderProducts(filtered);
}

function sortProducts(order) {
  let sorted = [...allProducts];
  if (order === 'low') sorted.sort((a, b) => a.price - b.price);
  else if (order === 'high') sorted.sort((a, b) => b.price - a.price);
  else if (order === 'new') sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  renderProducts(sorted);
}

// ===== MODAL =====
function openProductModal(product) {
  currentProduct = product;
  
  document.getElementById('modalImage').src = product.image_url || 'images/placeholder.svg';
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
  if (karatInput && currentProduct.category !== 'artificial') karat = karatInput.value;
  
  // Artificial – fixed price
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
  
  // Silver – use silver rate
  let ratePerGram;
  if (currentProduct.category === 'silver') {
    ratePerGram = SILVER_RATE;
  } else {
    ratePerGram = getRateForKarat(karat);
  }
  
  const metalValue = ratePerGram * weightInGrams;
  const making = metalValue * 0.15;
  const polish = metalValue * 0.10;
  const subtotal = metalValue + making + polish;
  const gst = subtotal * 0.03;
  const total = subtotal + gst;
  
  document.getElementById('pRate').textContent = formatPKR(ratePerGram) + '/g';
  document.getElementById('pWeight').textContent = weightInGrams.toFixed(3) + ' g';
  document.getElementById('pGold').textContent = formatPKR(metalValue);
  document.getElementById('pMaking').textContent = formatPKR(making);
  document.getElementById('pPolish').textContent = formatPKR(polish);
  document.getElementById('pGST').textContent = formatPKR(gst);
  document.getElementById('pTotal').textContent = formatPKR(total);
  
  document.getElementById('priceBreakdown').classList.remove('hidden');
}

function addToCart() {
  if (!currentProduct) return;
  
  if (document.getElementById('priceBreakdown').classList.contains('hidden')) {
    alert('Please calculate price first');
    return;
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
  
  const message = `Assalam o Alaikum,%0A%0AMujhe yeh product order karni hai:%0A%0A` +
    `📿 Product: ${currentProduct.name}%0A🔸 Karat: ${karat}%0A` +
    `⚖️ Weight: ${weight} ${unit}%0A📏 Size: ${size || 'Standard'}%0A` +
    `💰 Total: ${total}%0A%0APlease confirm karein.%0A%0ASHAH REHAN JEWELLERS`;
  
  window.open(`https://wa.me/923266501314?text=${message}`, '_blank');
}

// ===== INIT =====
function initCategoryPage(category) {
  loadCategoryProducts(category);
  updateCartCount();
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
});