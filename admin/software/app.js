// ===== SHAH REHAN JEWELLERS – SHARED APP LOGIC =====

// ---------- Formatters ----------
function formatPKR(amount) {
  return 'Rs ' + Math.round(amount || 0).toLocaleString('en-PK');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

function generateInvoiceNumber(prefix = 'SRJ') {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `${prefix}-${dateStr}-${random}`;
}

function navigate(page) { window.location.href = page; }

// ---------- Date Helpers for Reports ----------
function getDayKey(d) { return new Date(d).toISOString().slice(0, 10); }
function getMonthKey(d) { return new Date(d).toISOString().slice(0, 7); }
function getYearKey(d) { return new Date(d).getFullYear().toString(); }

function getWeekKey(d) {
  const date = new Date(d);
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = temp.getUTCDay() || 7;
  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((temp - yearStart) / 86400000) + 1) / 7);
  return `${temp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// ---------- Cloud Shop Settings (Supabase) ----------
async function getShopSettings() {
  const defaults = {
    name: 'SHAH REHAN JEWELLERS',
    address: 'Main Bazar #2, Ghaziabad, Lahore Cantt',
    phone: '0092 326 6501314',
    email: 'shahrehanjewellers@google.com',
    making_pct: 15,
    polish_pct: 10,
    gst_pct: 3,
    admin_photo: ''
  };

  try {
    const rows = await sbFetch('settings?select=*', { method: 'GET' });
    if (!rows || rows.length === 0) return defaults;
    
    const settings = { ...defaults };
    rows.forEach(r => {
      const isNum = ['gst_pct', 'making_pct', 'polish_pct'].includes(r.key);
      settings[r.key] = isNum ? parseFloat(r.value) : r.value;
    });
    return settings;
  } catch (e) {
    console.warn('Settings fetch error:', e);
    return defaults;
  }
}

async function saveShopSettings(settings) {
  // Batch Upsert (Insert or Update) format for Supabase
  const upsertData = Object.keys(settings).map(key => ({
    key: key,
    value: String(settings[key])
  }));

  await sbFetch('settings', {
    method: 'POST',
    headers: { 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify(upsertData)
  });
}

// ---------- WhatsApp Helpers ----------
function normalizePhone(phone) {
  if (!phone) return '';
  let p = phone.toString().replace(/[^0-9]/g, '');
  if (p.startsWith('0')) p = '92' + p.slice(1);
  if (!p.startsWith('92') && p.length === 10) p = '92' + p;
  return p;
}

function openWhatsApp(phone, message) {
  const num = normalizePhone(phone);
  if (!num) {
    alert('❌ Phone number missing or invalid');
    return;
  }
  const url = `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// ---------- WhatsApp Invoice Builders ----------
function buildSaleInvoiceMessage(sale, shop) {
  const shopName = shop?.name || 'SHAH REHAN JEWELLERS';
  const shopAddr = shop?.address || 'Main Bazar #2, Ghaziabad';
  const shopPhone = shop?.phone || '0092 326 6501314';
  const lines = [
    `*${shopName}*`, shopAddr, `📞 ${shopPhone}`, '',
    `*INVOICE: ${sale.invoice_number || '—'}*`,
    `Date: ${formatDate(sale.created_at || sale.date || Date.now())}`, '',
    `*Customer:* ${sale.customer_name || 'Walk-in'}`,
    sale.customer_phone ? `📞 ${sale.customer_phone}` : '', '',
    `*Item:* ${sale.items_summary || '—'}`,
    sale.karat ? `Karat: ${sale.karat}` : '',
    `Weight: ${sale.weight || 0}g`,
    `Rate: ${formatPKR(sale.rate)}/g`, '',
    `Metal Value: ${formatPKR((sale.weight || 0) * (sale.rate || 0))}`,
    `Making + Polish: ${formatPKR((sale.making || 0) + (sale.polish || 0))}`,
    `GST (${sale.gst_pct || 0}%): ${formatPKR(Math.round(((sale.weight || 0) * (sale.rate || 0) + (sale.making || 0) + (sale.polish || 0)) * (sale.gst_pct || 0) / 100))}`,
    sale.discount > 0 ? `Discount: -${formatPKR(sale.discount)}` : '', '',
    `*TOTAL: ${formatPKR(sale.total)}*`,
    `Received: ${formatPKR(sale.received)}`,
    `Balance: ${formatPKR(sale.balance)}`, '',
    'شکریہ! آپ کا اعتماد، ہماری ضمانت'
  ].filter(Boolean);
  return lines.join('\n');
}

function buildPurchaseInvoiceMessage(purchase, shop) {
  const shopName = shop?.name || 'SHAH REHAN JEWELLERS';
  const lines = [
    `*${shopName}*`, '',
    `*PURCHASE BILL: ${purchase.invoice_no || '—'}*`,
    `Date: ${formatDate(purchase.created_at || purchase.date || Date.now())}`, '',
    `*Supplier:* ${purchase.supplier_name || '—'}`,
    purchase.supplier_phone ? `📞 ${purchase.supplier_phone}` : '', '',
    `*Item:* ${purchase.item || '—'}`,
    purchase.karat ? `Karat: ${purchase.karat}` : '',
    `Weight: ${purchase.weight || 0}g`,
    `Rate: ${formatPKR(purchase.rate)}/g`, '',
    `*TOTAL COST: ${formatPKR(purchase.total)}*`,
    `Paid: ${formatPKR(purchase.paid)}`,
    `Balance: ${formatPKR(purchase.balance)}`, '',
    'شکریہ!'
  ].filter(Boolean);
  return lines.join('\n');
}

function buildJobInvoiceMessage(service, shop) {
  const shopName = shop?.name || 'SHAH REHAN JEWELLERS';
  const lines = [
    `*${shopName}* – KARIGAR JOB`, '',
    `*Karigar:* ${service.karigar_name || '—'}`,
    service.karigar_phone ? `📞 ${service.karigar_phone}` : '', '',
    `*Job:* ${service.item || '—'}`,
    `Type: ${service.type || '—'}`,
    `Gold Given: ${service.gold_given || 0}g`,
    `Gold Returned: ${service.gold_returned || 0}g`,
    `Status: ${(service.status || '').toUpperCase()}`, '',
    `*Charges: ${formatPKR(service.charges)}*`,
    `Paid: ${formatPKR(service.paid)}`,
    `Balance: ${formatPKR(service.balance)}`, '',
    'شکریہ!'
  ].filter(Boolean);
  return lines.join('\n');
}

// ---------- Dashboard ----------
async function loadDashboard() {
  try {
    const [sales, purchases, customers, stock, services] = await Promise.all([
      getAllRecords('sales'), getAllRecords('purchases'), getAllRecords('customers'),
      getAllRecords('stock'), getAllRecords('services')
    ]);

    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = new Date().toISOString().slice(0, 7);

    const todaySales = sales.filter(s => s.date?.startsWith(today))
      .reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
    const monthSales = sales.filter(s => s.date?.startsWith(thisMonth))
      .reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
    const monthPurchases = purchases.filter(s => s.date?.startsWith(thisMonth))
      .reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);

    const el = (id) => document.getElementById(id);
    if (el('todaySales')) el('todaySales').textContent = formatPKR(todaySales);
    if (el('monthSales')) el('monthSales').textContent = formatPKR(monthSales);
    if (el('monthPurchases')) el('monthPurchases').textContent = formatPKR(monthPurchases);
    if (el('totalCustomers')) el('totalCustomers').textContent = customers.length;
    if (el('stockItems')) el('stockItems').textContent = stock.length;
    if (el('totalServices')) el('totalServices').textContent = services.length;

    const recent = sales.slice(0, 5);
    const container = el('recentSales');
    if (container) {
      if (recent.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="icon">💰</div><p>No sales yet</p></div>';
      } else {
        container.innerHTML = recent.map(s => `
          <div class="data-item">
            <div>
              <div class="data-item-title">${s.customer_name || 'Walk-in'}</div>
              <div class="data-item-sub">${s.items_summary || 'Sale'} • ${formatDate(s.date)}</div>
            </div>
            <div class="data-item-value">${formatPKR(s.total)}</div>
          </div>
        `).join('');
      }
    }
  } catch (error) {
    console.error('Dashboard error:', error);
  }
}

// ---------- Auto Init ----------
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof initDB === 'function') await initDB();
  if (document.getElementById('todaySales')) await loadDashboard();
  console.log('✅ Software loaded');
});