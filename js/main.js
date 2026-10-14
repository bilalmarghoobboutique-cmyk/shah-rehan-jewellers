// ===== SHAH REHAN JEWELLERS – LIVE RATES SYSTEM =====

// Current rates (14 Oct 2026 – update from API later)
const LIVE_RATES = {
  usdToPkr: 276.95, // 1 USD = 276.95 PKR [citation:8]
  gold: {
    // PKR per gram
    '24K': 37793,
    '22K': 34643,
    '21K': 33069,
    '18K': 28345,
    '16K': 25195,
    '14K': 22039,
    '12K': 18900,
    '10K': 15748,
    '8K': 12598
  },
  silver: {
    perGram: 570.10,
    per10Gram: 5701,
    perTola: 6651
  },
  // International gold price USD per ounce [citation:2][citation:7]
  internationalGoldUSD: 4153
};

// Weight conversions
const WEIGHT = {
  tola: 11.664,
  masha: 0.972,
  ratti: 0.1215,
  gram: 1
};

// Karat purity
const PURITY = {
  '24K': 1.0,
  '22K': 0.9167,
  '21K': 0.875,
  '18K': 0.75,
  '16K': 0.6667,
  '14K': 0.5833,
  '12K': 0.5,
  '10K': 0.4167,
  '8K': 0.3333
};

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
      <div class="rate-row">
        <span class="rate-label">Per Gram</span>
        <span class="rate-value rate-value-pkr">Rs ${silver.perGram}</span>
      </div>
      <div class="rate-row">
        <span class="rate-label">Per 10 Gram</span>
        <span class="rate-value rate-value-pkr">Rs ${silver.per10Gram.toLocaleString()}</span>
      </div>
      <div class="rate-row">
        <span class="rate-label">Per Tola</span>
        <span class="rate-value rate-value-pkr">Rs ${silver.perTola.toLocaleString()}</span>
      </div>
      <div class="rate-row" style="border-top: 1px solid rgba(192,192,192,0.3); margin-top: 8px; padding-top: 8px;">
        <span class="rate-label">USD/Gram</span>
        <span class="rate-value rate-value-usd">$${usdPerGram}</span>
      </div>
      <div class="rate-row">
        <span class="rate-label">USD/10 Gram</span>
        <span class="rate-value rate-value-usd">$${usdPer10Gram}</span>
      </div>
      <div class="rate-row">
        <span class="rate-label">USD/Tola</span>
        <span class="rate-value rate-value-usd">$${usdPerTola}</span>
      </div>
    </div>
  `;
}

// ===== TAB SWITCHING =====
function switchRateTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  if (tab === 'gold') {
    document.getElementById('goldRatesTab').classList.remove('hidden');
    document.getElementById('silverRatesTab').classList.add('hidden');
  } else {
    document.getElementById('silverRatesTab').classList.remove('hidden');
    document.getElementById('goldRatesTab').classList.add('hidden');
  }
}

// ===== UPDATE USD RATE DISPLAY =====
function updateUsdRate() {
  const usdEl = document.getElementById('usdRate');
  if (usdEl) usdEl.textContent = LIVE_RATES.usdToPkr;
  
  const timeEl = document.getElementById('lastUpdated');
  if (timeEl) {
    const now = new Date();
    timeEl.textContent = now.toLocaleString('en-PK', { 
      dateStyle: 'short', 
      timeStyle: 'short' 
    });
  }
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderGoldRates();
  renderSilverRates();
  updateUsdRate();
  initScrollAnimations();
  console.log('SHAH REHAN JEWELLERS – Royal Theme Loaded ✅');
});