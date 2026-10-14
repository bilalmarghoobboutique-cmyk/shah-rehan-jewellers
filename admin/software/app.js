// ===== SHAH REHAN JEWELLERS – SOFTWARE APP LOGIC =====

function formatPKR(amount) {
  return 'Rs ' + Math.round(amount || 0).toLocaleString('en-PK');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function loadDashboardStats() {
  try {
    const sales = await getAllRecords('sales') || [];
    const customers = await getAllRecords('customers') || [];
    const stock = await getAllRecords('stock') || [];
    
    const today = new Date().toISOString().slice(0, 10);
    const todaySales = sales.filter(s => s.date && s.date.startsWith(today))
      .reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
    
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthSales = sales.filter(s => s.date && s.date.startsWith(thisMonth))
      .reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
    
    const el = (id) => document.getElementById(id);
    if (el('todaySales')) el('todaySales').textContent = formatPKR(todaySales);
    if (el('monthSales')) el('monthSales').textContent = formatPKR(monthSales);
    if (el('totalCustomers')) el('totalCustomers').textContent = customers.length;
    if (el('stockItems')) el('stockItems').textContent = stock.length;
    
    const recent = sales.slice(-5).reverse();
    const container = el('recentSales');
    if (container) {
      if (recent.length === 0) {
        container.innerHTML = '<div class="empty-state">No sales yet. Start by adding a sale!</div>';
      } else {
        container.innerHTML = recent.map(s => `
          <div class="recent-item">
            <div>
              <strong style="color: #FFD700;">${s.customer_name || 'Walk-in'}</strong>
              <div style="font-size: 0.8rem; color: #B8B8B8;">${s.items_summary || 'Sale'} • ${formatDate(s.date)}</div>
            </div>
            <div style="color: #FFD700; font-weight: 700;">${formatPKR(s.total)}</div>
          </div>
        `).join('');
      }
    }
  } catch (error) {
    console.error('Dashboard error:', error);
  }
}

// ===== SYNC TO CLOUD (optional) =====
async function syncToCloud() {
  if (!navigator.onLine) return;
  try {
    const sales = await getAllRecords('sales') || [];
    const unsynced = sales.filter(s => !s.synced);
    for (const sale of unsynced) {
      sale.synced = true;
      await updateRecord('sales', sale);
    }
    if (unsynced.length > 0) {
      console.log(`✅ Synced ${unsynced.length} items`);
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await initDB();
  await loadDashboardStats();
  setInterval(() => {
    if (navigator.onLine) syncToCloud();
  }, 30000);
  console.log('✅ Software loaded');
});