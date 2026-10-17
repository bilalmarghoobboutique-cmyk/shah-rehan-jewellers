// ===== SHAH REHAN JEWELLERS – SUPABASE + CLOUDINARY =====

const SUPABASE_URL = 'https://jwelbgexizmxdwozcxut.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3ZWxiZ2V4aXpteGR3b3pjeHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5OTMwOTMsImV4cCI6MjEwNzU2OTA5M30.D_yqxv2sDzijObjHjMXDL-HsXAX6wPsM6s2-GVoQtuE';

const CLOUD_NAME = 'mo7txjdn';
const CLOUDINARY_PRESET = 'shah-rehan-jewellers';

// ---------- Supabase Helpers ----------
async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Supabase ${res.status}: ${txt}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function addRecord(storeName, data) {
  const clean = { ...data };
  delete clean.id;
  delete clean.date;
  delete clean.created_at;
  const result = await sbFetch(storeName, { method: 'POST', body: JSON.stringify(clean) });
  return Array.isArray(result) ? result[0] : result;
}

async function getAllRecords(storeName) {
  const rows = await sbFetch(`${storeName}?select=*&order=created_at.desc`, { method: 'GET' });
  return (rows || []).map(r => ({ ...r, date: r.created_at }));
}

async function updateRecord(storeName, data) {
  const { id, ...rest } = data;
  return sbFetch(`${storeName}?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(rest) });
}

async function deleteRecord(storeName, id) {
  return sbFetch(`${storeName}?id=eq.${id}`, { method: 'DELETE' });
}

async function clearStore(storeName) {
  return sbFetch(`${storeName}?id=gt.0`, { method: 'DELETE' });
}

// ---------- Cloudinary Upload Helpers ----------
async function uploadToCloudinary(file, resourceType = 'image') {
  if (!file) return null;
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', CLOUDINARY_PRESET);
  
  const res = await fetch(url, { method: 'POST', body: form });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Cloudinary ${res.status}: ${txt}`);
  }
  const data = await res.json();
  return data.secure_url;
}

async function uploadImage(file) {
  return uploadToCloudinary(file, 'image');
}

async function uploadVideo(file) {
  return uploadToCloudinary(file, 'video');
}

async function uploadMultipleImages(files) {
  const arr = Array.from(files || []);
  const urls = [];
  for (const f of arr) {
    try {
      const url = await uploadImage(f);
      if (url) urls.push(url);
    } catch (e) {
      console.warn('Image upload failed:', e.message);
    }
  }
  return urls;
}

// ---------- Legacy Helpers ----------
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function initDB() {
  console.log('✅ Supabase ready:', SUPABASE_URL);
  console.log('✅ Cloudinary ready:', CLOUD_NAME);
  return true;
}



