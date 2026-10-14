// ===== SHAH REHAN JEWELLERS – SUPABASE CONFIG =====

const SUPABASE_URL = 'https://jwelbgexizmxdwozcxut.supabase.co';
const SUPABASE_KEY = 'sb_publishable_JrytvKpkrCjRNOck96rG4Q_5LLJ8-uW';

// Simple fetch-based client (no library needed)
const supabase = {
  url: SUPABASE_URL,
  key: SUPABASE_KEY,

  async from(table) {
    return {
      select: async (columns = '*') => {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${columns}`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        });
        return res.json();
      },
      
      insert: async (data) => {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(data)
        });
        return res.json();
      }
    };
  }
};

// ===== WEIGHT CONVERSION =====
const WEIGHT_UNITS = {
  gram: 1,
  tola: 11.664,
  masha: 0.972,
  ratti: 0.1215
};

// ===== KARAT PURITY =====
const KARAT_PURITY = {
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

// ===== BASE 24K RATE (per gram PKR) =====
const BASE_RATE_24K = 37793;

// Get rate for specific karat
function getRateForKarat(karat) {
  return Math.round(BASE_RATE_24K * KARAT_PURITY[karat]);
}

// Convert weight to grams
function toGrams(value, unit) {
  return value * WEIGHT_UNITS[unit];
}

// Format currency
function formatPKR(amount) {
  return 'Rs ' + Math.round(amount).toLocaleString('en-PK');
}