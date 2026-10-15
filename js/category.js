// ===== SHAH REHAN JEWELLERS – CATEGORY PAGE JS =====

let currentProduct = null;
let allProducts = [];
let currentCategory = '';
let cart = JSON.parse(localStorage.getItem('srj_cart') || '[]');
let currentSlide = 0;
let carouselInterval = null;

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

const BASE_RATE_24K = 430000;
const SILVER_RATE_PER_TOLA = 6651;

let currentRatesPerGram = {};

function getRateForKarat(karat) {
  if (currentRatesPerGram[karat]) return currentRatesPerGram[karat];
  return Math.round((BASE_RATE_24K * KARAT_PURITY[karat]) / WEIGHT.tola);
}

function toGrams(value, unit) { return value * WEIGHT[unit]; }
function formatPKR(amount) { return 'Rs ' + Math.round(amount).toLocaleString('en-PK'); }

function updateCartCount() {
  const el = document.getElementById('cartCount');
  if (el) el.textContent = cart.length;
}

// ===== FETCH LIVE RATES =====
async function fetchLiveRates() {
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
    rates.forEach(r => {
      if (r.rate_per_tola) {
        currentRatesPerGram[r.karat] = r.rate_per_gram ? parseFloat(r.rate_per_gram) : Math.round(parseFloat(r.rate_per_tola) / WEIGHT.tola);
      }
    });
    console.log('✅ Live rates fetched');
  } catch (error) {
    console.warn('⚠️ Using fallback rates');
  }
}

// ===== LOAD PRODUCTS =====
async function loadCategoryProducts(category) {
  currentCategory = category;
  const grid = document.getElementById('categoryProductsGrid');
  if (!grid) return;
  
  grid.innerHTML = '<div class="loading-spinner">Loading products...</div>';
  
  try {
    await fetchLiveRates();
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&category=eq.${category}&is_active=eq.true&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    allProducts = await res.json();
    
    if (!allProducts || allProducts.length === 0) {
      grid.innerHTML = `<div class="loading-spinner">No ${category} products found</div>`;
      return;
    }
    
    renderProducts(allProducts);
  } catch (error) {
    console.error('Error:', error);
    grid.innerHTML = '<div class="loading-spinner">Error loading products</div>';
  }
}

async function loadCoins() {
  const grid = document.getElementById('categoryProductsGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="loading-spinner">Loading coins...</div>';
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&subcategory=eq.Coins&is_active=eq.true`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    allProducts = await res.json();
    if (!allProducts || allProducts.length === 0) {
      grid.innerHTML = '<div class="loading-spinner">No coins found</div>';
      return;
    }
    renderProducts(allProducts);
  } catch (error) {
    grid.innerHTML = '<div class="loading-spinner">Error loading coins</div>';
  }
}

// ===== RENDER PRODUCTS =====
function renderProducts(products) {
  const grid = document.getElementById('categoryProductsGrid');
  
  if (!products || products.length === 0) {
    grid.innerHTML = '<div class="loading-spinner">No products match your filter</div>';
    return;
  }
  
  grid.innerHTML = products.map(p => {
    const isArtificial = p.category === 'artificial';
    const isDiamond = p.category === 'diamond';
    const originalPrice = p.price || 0;
    const discountPct = p.discount_percent || 5;
    const discountedPrice = isDiamond || isArtificial ? Math.round(originalPrice * (1 - discountPct/100)) : originalPrice;
    const soldQty = p.sold_qty || Math.floor(Math.random() * 50) + 10;
    
    return `
      <div class="product-card" onclick='openProductModal(${JSON.stringify(p).replace(/'/g, "&#39;")})'>
        <img src="${p.image_url || 'images/placeholder.svg'}" alt="${p.name}" loading="lazy" onerror="this.src='images/placeholder.svg'">
        <div class="product-info">
          <span class="category-tag">${p.karat || p.category}</span>
          <h3>${p.name}</h3>
          ${(isDiamond || isArtificial) && discountPct > 0 ? `
            <div class="price-row-wrapper">
              <span class="original-price">Rs ${originalPrice.toLocaleString()}</span>
              <span class="discounted-price">Rs ${discountedPrice.toLocaleString()}</span>
              <span class="discount-badge">${discountPct}% OFF</span>
            </div>
          ` : `
            <p class="price">${formatPKR(originalPrice)}</p>
          `}
          <p class="sold-qty">🛒 ${soldQty} sold</p>
        </div>
      </div>
    `;
  }).join('');
}

// ===== FILTERS =====
function filterByKarat(karat) {
  if (!karat) { renderProducts(allProducts); return; }
  renderProducts(allProducts.filter(p => p.karat === karat));
}

function filterBySubcategory(sub) {
  renderProducts(allProducts.filter(p => p.subcategory === sub));
}

function filterByWeight(weight) {
  renderProducts(allProducts.filter(p => p.size === weight));
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
  
  const isArtificial = product.category === 'artificial';
  const isDiamond = product.category === 'diamond';
  
  // Size dropdown
  const sizeSelect = document.getElementById('modalSize');
  sizeSelect.innerHTML = '<option value="">Select Size</option>' + getSizeOptions(product.category, product.subcategory);
  
  // Karat section
  const karatSection = document.getElementById('karatSection');
  if (isArtificial) {
    karatSection.style.display = 'none';
  } else {
    karatSection.style.display = 'block';
  }
  
  // Color section - only for artificial
  const colorSection = document.getElementById('colorSection');
  if (colorSection) {
    colorSection.style.display = isArtificial ? 'block' : 'none';
  }
  
  // Weight section - hide for artificial & diamond
  const weightSection = document.getElementById('weightSection');
  if (weightSection) {
    weightSection.style.display = (isArtificial || isDiamond) ? 'none' : 'block';
  }
  
  // Making/Polish/GST rows - hide for artificial
  const makingRow = document.getElementById('pMakingRow');
  const polishRow = document.getElementById('pPolishRow');
  const gstRow = document.getElementById('pGSTRow');
  if (makingRow && polishRow && gstRow) {
    const hideRows = isArtificial;
    makingRow.style.display = hideRows ? 'none' : 'flex';
    polishRow.style.display = hideRows ? 'none' : 'flex';
    gstRow.style.display = hideRows ? 'none' : 'flex';
  }
  
  if (product.weight && !isArtificial && !isDiamond) {
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
    'Coins': ['1g','2g','2.5g','5g','10g','20g','50g','100g'],
    'Necklace Sets': ['Standard'],
    'Earrings': ['Standard']
  };
  const options = sizes[subcategory] || sizes[category] || ['Standard'];
  return options.map(s => `<option value="${s}">${s}</option>`).join('');
}

// ===== CALCULATE PRICE =====
function calculatePrice() {
  if (!currentProduct) return;
  
  const isArtificial = currentProduct.category === 'artificial';
  const isDiamond = currentProduct.category === 'diamond';
  
  // ARTIFICIAL – Fixed price, no weight needed
  if (isArtificial) {
    const price = currentProduct.price || 0;
    document.getElementById('pRate').textContent = 'Fixed Price';
    document.getElementById('pWeight').textContent = '—';
    document.getElementById('pGold').textContent = formatPKR(price);
    document.getElementById('pTotal').textContent = formatPKR(price);
    document.getElementById('priceBreakdown').classList.remove('hidden');
    return;
  }
  
  // DIAMOND – Fixed price (discounted)
  if (isDiamond) {
    const price = currentProduct.price || 0;
    const discountPct = currentProduct.discount_percent || 5;
    const discounted = Math.round(price * (1 - discountPct/100));
    document.getElementById('pRate').textContent = 'Diamond Price';
    document.getElementById('pWeight').textContent = '—';
    document.getElementById('pGold').textContent = formatPKR(price);
    document.getElementById('pGST').textContent = `- ${formatPKR(price - discounted)} (${discountPct}% off)`;
    document.getElementById('pTotal').textContent = formatPKR(discounted);
    document.getElementById('priceBreakdown').classList.remove('hidden');
    return;
  }
  
  // GOLD/SILVER – Calculate from weight
  const weight = parseFloat(document.getElementById('modalWeight').value);
  const unit = document.getElementById('modalUnit').value;
  
  if (!weight || weight <= 0) {
    alert('Please enter a valid weight');
    return;
  }
  
  const weightInGrams = toGrams(weight, unit);
  
  let karat = '24K';
  const karatInput = document.querySelector('input[name="karat"]:checked');
  if (karatInput) karat = karatInput.value;
  
  let ratePerGram;
  if (currentProduct.category === 'silver') {
    ratePerGram = SILVER_RATE_PER_TOLA / WEIGHT.tola;
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

// ===== ADD TO CART =====
function addToCart() {
  if (!currentProduct) return;
  if (document.getElementById('priceBreakdown').classList.contains('hidden')) {
    alert('Please calculate price first');
    return;
  }
  
  const isArtificial = currentProduct.category === 'artificial';
  const isDiamond = currentProduct.category === 'diamond';
  
  const cartItem = {
    id: currentProduct.id,
    name: currentProduct.name,
    karat: document.querySelector('input[name="karat"]:checked')?.value || 'N/A',
    weight: isArtificial || isDiamond ? 0 : parseFloat(document.getElementById('modalWeight').value),
    unit: isArtificial || isDiamond ? '—' : document.getElementById('modalUnit').value,
    size: document.getElementById('modalSize').value,
    color: isArtificial ? (document.getElementById('modalColor')?.value || '') : '',
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

// ===== WHATSAPP ORDER =====
function whatsappOrder() {
  if (!currentProduct) return;
  
  const isArtificial = currentProduct.category === 'artificial';
  const isDiamond = currentProduct.category === 'diamond';
  const weight = isArtificial || isDiamond ? 'Fixed' : document.getElementById('modalWeight').value + ' ' + document.getElementById('modalUnit').value;
  const size = document.getElementById('modalSize').value;
  const color = isArtificial ? (document.getElementById('modalColor')?.value || '') : '';
  const karat = document.querySelector('input[name="karat"]:checked')?.value || 'N/A';
  const total = document.getElementById('pTotal').textContent;
  
  let message = `Assalam o Alaikum,%0A%0AMujhe yeh product order karni hai:%0A%0A`;
  message += `📿 Product: ${currentProduct.name}%0A`;
  if (!isArtificial) message += `🔸 Karat: ${karat}%0A`;
  if (!isArtificial && !isDiamond) message += `⚖️ Weight: ${weight}%0A`;
  if (size) message += `📏 Size: ${size}%0A`;
  if (color) message += `🎨 Color: ${color}%0A`;
  message += `💰 Total: ${total}%0A%0APlease confirm karein.%0A%0ASHAH REHAN JEWELLERS`;
  
  window.open(`https://wa.me/923266501314?text=${message}`, '_blank');
}

// ===== CAROUSEL FOR CELEBRITY REVIEWS =====
function initReviewCarousel() {
  const container = document.getElementById('reviewCarousel');
  if (!container) return;
  
  const reviews = [
    { name: 'Ayesha Omar', img: 'images/celebrity-1.jpg', text: 'Beautiful jewellery and excellent customer service! Highly recommended.', stars: 5 },
    { name: 'Mahira Khan', img: 'images/celebrity-2.jpg', text: 'Amazing quality. I bought a gold set and I love it!', stars: 5 },
    { name: 'Fawad Khan', img: 'images/celebrity-3.jpg', text: 'Very professional service. The designs are modern and unique.', stars: 5 },
    { name: 'Sajal Aly', img: 'images/celebrity-4.jpg', text: 'Perfect for weddings and special occasions. Love their collection!', stars: 5 }
  ];
  
  container.innerHTML = `
    <div class="reviews-track" id="reviewsTrack">
      ${reviews.map(r => `
        <div class="review-card">
          <img src="${r.img}" alt="${r.name}" class="review-photo" onerror="this.src='images/placeholder.svg'">
          <div class="review-stars">${'⭐'.repeat(r.stars)}</div>
          <p class="review-text">"${r.text}"</p>
          <div class="review-name">— ${r.name}</div>
        </div>
      `).join('')}
    </div>
    <div class="reviews-dots" id="reviewsDots">
      ${reviews.map((_, i) => `<span class="rev-dot ${i === 0 ? 'active' : ''}" onclick="goToReview(${i})"></span>`).join('')}
    </div>
  `;
  
  startReviewCarousel(reviews.length);
}

function startReviewCarousel(total) {
  currentSlide = 0;
  if (carouselInterval) clearInterval(carouselInterval);
  carouselInterval = setInterval(() => {
    currentSlide = (currentSlide + 1) % total;
    showReview(currentSlide);
  }, 8000);
}

function showReview(index) {
  const track = document.getElementById('reviewsTrack');
  const dots = document.querySelectorAll('.rev-dot');
  if (track) {
    track.style.transform = `translateX(-${index * 100}%)`;
  }
  dots.forEach((d, i) => d.classList.toggle('active', i === index));
  currentSlide = index;
}

function goToReview(index) {
  if (carouselInterval) clearInterval(carouselInterval);
  showReview(index);
  startReviewCarousel(4);
}

// ===== CUSTOMER REVIEW SUBMIT =====
function submitReview(e) {
  e.preventDefault();
  const name = document.getElementById('reviewName').value.trim();
  const text = document.getElementById('reviewText').value.trim();
  const rating = document.getElementById('reviewRating').value;
  
  if (!name || !text) {
    alert('Please fill name and review');
    return;
  }
  
  const newReview = {
    name: name,
    text: text,
    rating: parseInt(rating),
    date: new Date().toISOString(),
    status: 'pending'
  };
  
  // Save to localStorage
  const reviews = JSON.parse(localStorage.getItem('srj_reviews') || '[]');
  reviews.push(newReview);
  localStorage.setItem('srj_reviews', JSON.stringify(reviews));
  
  // Send to owner via WhatsApp
  const msg = `⭐ NEW REVIEW%0A%0AName: ${name}%0ARating: ${rating}/5%0AReview: ${text}`;
  window.open(`https://wa.me/923266501314?text=${msg}`, '_blank');
  
  alert('✅ Thank you for your review! It will be published after verification.');
  e.target.reset();
}

// ===== INIT =====
function initCategoryPage(category) {
  loadCategoryProducts(category);
  updateCartCount();
  initReviewCarousel();
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
});