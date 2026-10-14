// ===== SHAH REHAN JEWELLERS – OFFLINE DATABASE (IndexedDB) =====

const DB_NAME = 'srj_jeweller_db';
const DB_VERSION = 1;

const STORES = {
  sales: 'sales',
  stock: 'stock',
  customers: 'customers',
  expenses: 'expenses',
  invoices: 'invoices',
  settings: 'settings'
};

let db = null;

// Initialize DB
async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      ['sales', 'stock', 'customers', 'expenses', 'invoices'].forEach(store => {
        if (!database.objectStoreNames.contains(store)) {
          database.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
        }
      });
      
      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings', { keyPath: 'key' });
      }
      
      console.log('✅ Database created');
    };
    
    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('✅ Database opened');
      resolve(db);
    };
    
    request.onerror = (event) => {
      console.error('❌ Database error:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Add record
function addRecord(storeName, data) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.add(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get all records
function getAllRecords(storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get one record
function getRecord(storeName, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Update record
function updateRecord(storeName, data) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Delete record
function deleteRecord(storeName, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Clear store
function clearStore(storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}