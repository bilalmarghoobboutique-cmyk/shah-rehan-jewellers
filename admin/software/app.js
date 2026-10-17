// ===== SHAH REHAN JEWELLERS – SHARED APP LOGIC =====

function formatPKR(amount) {
  return 'Rs ' + Math.round(amount || 0).toLocaleString('en-PK');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

function generateInvoiceNumber() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `SRJ-${dateStr}-${random}`;
}

function navigate(page) { window.location.href = page; }

// ---------- Date helpers for reports ----------
function getDayKey(d) { return new Date(d).toISOString().slice(0, 10); }
function getMonthKey(d) { return new Date(d).toISOString().slice(0, 7); }

function getWeekKey(d) {
  const date = new Date(d);
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = temp.getUTCDay() || 7;
  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((temp - yearStart) / 86400000) + 1) / 7);
  return `${temp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getYearKey(d) { return new Date(d).getFullYear().toString(); }

// ---------- DASHBOARD ----------
async function loadDashboard() {
  try {
    const sales = await getAllRecords('sales') || [];
    const purchases = await getAllRecords('purchases') || [];
    const customers = await getAllRecords('customers') || [];
    const stock = await getAllRecords('stock') || [];
    const services = await getAllRecords('services') || [];

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

document.addEventListener('DOMContentLoaded', async () => {
  await initDB();
  if (document.getElementById('todaySales')) {
    await loadDashboard();
  }
  console.log('✅ Software loaded');
});