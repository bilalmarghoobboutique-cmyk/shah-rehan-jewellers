// ===== SHAH REHAN JEWELLERS – SOFTWARE APP LOGIC =====

let currentUser = null;

// Format currency
function formatPKR(amount) {
  return 'Rs ' + Math.round(amount || 0).toLocaleString('en-PK');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ===== DASHBOARD STATS =====
async function loadDashboardStats() {
  try {
    const sales = await getAllRecords('sales') || [];
    const customers = await getAllRecords('customers') || [];
    const stock = await getAllRecords('stock') || [];
    
    // Today's sales
    const today = new Date().toISOString().slice(0, 10);
    const todaySales = sales
      .filter(s => s.date && s.date.startsWith(today))
      .reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
    
    // This month
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthSales = sales
      .filter(s => s.date && s.date.startsWith(thisMonth))
      .reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
    
    document.getElementById('todaySales').textContent = formatPKR(todaySales);
    document.getElementById('monthSales').textContent = formatPKR(monthSales);
    document.getElementById('totalCustomers').textContent = customers.length;
    document.getElementById('stockItems').textContent = stock.length;
    
    // Recent sales (last 5)
    const recent = sales.slice(-5).reverse();
    const container = document.getElementById('recentSales');
    
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
  } catch (error) {
    console.error('Dashboard error:', error);
  }
}

// ===== SYNC TO SUPABASE =====
async function syncToCloud() {
  if (!navigator.onLine) {
    console.log('Offline – skipping sync');
    return;
  }
  
  try {
    const sales = await getAllRecords('sales') || [];
    const unsynced = sales.filter(s => !s.synced);
    
    for (const sale of unsynced) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/software_sync`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            device_id: 'srj-main',
            data: { type: 'sale', ...sale },
            last_sync: new Date().toISOString()
          })
        });
        
        if (res.ok) {
          sale.synced = true;
          await updateRecord('sales', sale);
        }
      } catch (err) {
        console.error('Sync error for sale:', err);
      }
    }
    
    console.log(`✅ Synced ${unsynced.length} items`);
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  await initDB();
  await loadDashboardStats();
  
  // Auto sync every 30 seconds if online
  setInterval(() => {
    if (navigator.onLine) syncToCloud();
  }, 30000);
  
  console.log('✅ Software loaded');
});