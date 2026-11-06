/* HiFive Inventory — frontend demo
   UI is built to follow the supplied HiFive Figma screens and custom SVG navigation icons.
   Authentication and records use browser storage for prototype/testing only. */

const $ = (id) => document.getElementById(id);
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const slug = (label) => label.toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const ICON_PATHS = {
  home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .6 3.5 2.4 3.5 5.5"/>',
  truck:'<path d="M2 6h11v10H2zM13 9h4l4 4v3h-8z"/><circle cx="6.5" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
  box:'<path d="m12 3 8.5 4.5v9L12 21l-8.5-4.5v-9zM3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
  ruler:'<rect x="2" y="8" width="20" height="8" rx="1.5"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/>',
  wh:'<path d="M3 10 12 4l9 6v10H3z"/><path d="M8 20v-6h8v6M8 17h8"/>',
  inbox:'<path d="M4 14 6.5 5h11L20 14v5H4z"/><path d="M4 14h5l1 2h4l1-2h5"/>',
  sl:'<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  hist:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2"/>',
  cash:'<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
  clip:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 11h6M9 15h6"/>',
  file:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  bell:'<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4zM10 21h4"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  logout:'<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  chev:'<path d="m6 9 6 6 6-6"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  dots:'<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  package:'<path d="m3 7 9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>'
};
function icon(name, style = '') {
  return `<svg class="i" viewBox="0 0 24 24" aria-hidden="true" ${style ? `style="${style}"` : ''}>${ICON_PATHS[name] || ICON_PATHS.box}</svg>`;
}
function fillIcons(root = document) {
  root.querySelectorAll('[data-i]').forEach((node) => { node.innerHTML = icon(node.dataset.i); });
}

const MENU = [
  {group:'OVERVIEW',items:[['Dashboard','Dashboard']]},
  {group:'KONTAK',items:[['Pelanggan','Pelanggan'],['Supplier','Supplier']]},
  {group:'INVENTORY',items:[['Barang','Barang'],['Grup Barang','Grup Barang'],['Barang Komposit','Barang Komposit'],['Kategori','Kategori'],['Satuan','Satuan'],['Daftar Harga','Daftar Harga'],['Gudang','Gudang'],['Barang Masuk','Barang Masuk'],['Penyesuaian Stok','Penyesuaian Stok'],['Riwayat Stok','Riwayat Stok']]},
  {group:'PENJUALAN',items:[['Kasir','Kasir'],['Pesanan Penjualan','Pesanan Penjualan'],['Picking List','Picking List'],['Paket & Pengiriman','Paket & Pengiriman'],['Invoice','Invoice'],['Pembayaran Diterima','Pembayaran Diterima'],['Retur Penjualan','Retur Penjualan'],['Nota Kredit','Nota Kredit']]},
  {group:'PEMBELIAN',items:[['Pengeluaran','Pengeluaran'],['Pesanan Pembelian','Pesanan Pembelian'],['Penerimaan Barang','Penerimaan Barang'],['Tagihan Supplier','Tagihan Supplier'],['Pembayaran Supplier','Pembayaran Supplier'],['Kredit Supplier','Kredit Supplier'],['Retur Pembelian','Retur Pembelian']]},
  {group:'ANALISIS',items:[['Laporan','Laporan']]},
  {group:'INTEGRASI',items:[['Integrasi','Integrasi']]},
  {group:'PREFERENSI',items:[['Pengguna','Pengguna'],['Pengaturan','Pengaturan']]}
];
const MENU_TITLES = new Map(MENU.flatMap(group => group.items.map(([label]) => [slug(label),label])));
const NAV_ASSET = Object.fromEntries(MENU.flatMap(group => group.items.map(([label,iconName]) => [label,iconName])));
const ASSET_PATH = (filename) => `assets/nav-icons/${encodeURIComponent(filename)}.svg`;
const ROLE_LABEL = {admin:'Admin',gudang:'Gudang',kasir:'Kasir'};
const ROLE_DESCRIPTION = {admin:'Administrator',gudang:'Petugas Gudang',kasir:'Kasir'};
const MASCOTS = {
  dashboard:'assets/mascots/06_peeking_menyapa.png',
  gudang:'assets/mascots/07_ceklist_gudang.png',
  kasir:'assets/mascots/08_yeay_paket.png',
  default:'assets/mascots/01_hai_wave.png'
};

const nav = $('nav');
nav.innerHTML = MENU.map((group, index) => `
  <section class="g" data-group="${index}" data-group-name="${escapeHTML(group.group)}">
    <button class="gh" type="button" aria-expanded="false"><span>${escapeHTML(group.group)}</span>${icon('chev')}</button>
    <div class="gb"><div>
      ${group.items.map(([label, iconName]) => `
        <a class="nv" href="#${slug(label)}" data-label="${escapeHTML(label)}" title="${escapeHTML(label)}">
          <span class="nav-icon"><img src="${ASSET_PATH(iconName)}" alt="" width="14" height="14"></span>
          <span class="nav-label">${escapeHTML(label)}</span>
        </a>`).join('')}
    </div></div>
  </section>`).join('');

nav.addEventListener('click', (event) => {
  const groupButton = event.target.closest('.gh');
  if (groupButton) {
    const section = groupButton.closest('.g');
    const open = section.classList.toggle('open');
    groupButton.setAttribute('aria-expanded', String(open));
  }
  const link = event.target.closest('.nv');
  if (link && window.matchMedia('(max-width: 1000px)').matches) $('side').classList.remove('show');
});

const ROLE_EXPANDED_GROUPS = {
  // Admin hanya membuka ringkasan dan preferensi agar sidebar tidak terlalu padat.
  admin: ['OVERVIEW', 'PREFERENSI'],
  // Gudang berfokus pada kontak pemasok, inventory, dan penerimaan/pembelian.
  gudang: ['OVERVIEW', 'KONTAK', 'INVENTORY', 'PEMBELIAN'],
  // Kasir berfokus pada pelanggan dan aktivitas penjualan.
  kasir: ['OVERVIEW', 'KONTAK', 'PENJUALAN']
};
function applyRoleMenuDefaults() {
  const expanded = new Set(ROLE_EXPANDED_GROUPS[currentUser?.role] || ['OVERVIEW']);
  document.querySelectorAll('#nav .g').forEach(section => {
    const isOpen = expanded.has(section.dataset.groupName);
    section.classList.toggle('open', isOpen);
    section.querySelector('.gh')?.setAttribute('aria-expanded', String(isOpen));
  });
}

let currentUser = null;
let currentPageKey = 'dashboard';
let pageRecords = {};
let cart = [];
let toastTimer = null;

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}
function setAuthError(id, message = '') {
  const element = $(id);
  element.textContent = message;
  element.classList.toggle('show', Boolean(message));
}
function initials(username) {
  return (String(username || 'U').trim().charAt(0) || 'U').toUpperCase();
}
function roleName(role) {
  return ROLE_DESCRIPTION[role] || 'Pengguna';
}

/* Passwords are hashed locally for this UI prototype. Production authentication belongs on the server. */
function fallbackDigest(value) {
  let h1 = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h1 ^= value.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  return `local-${(h1 >>> 0).toString(16).padStart(8,'0')}`;
}
async function hashPassword(password, salt) {
  const input = `${salt}:${password}`;
  if (window.crypto && window.crypto.subtle) {
    const bytes = new TextEncoder().encode(input);
    const digest = await window.crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2,'0')).join('');
  }
  return fallbackDigest(input);
}
function makeSalt() {
  if (window.crypto && window.crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return [...bytes].map(byte => byte.toString(16).padStart(2,'0')).join('');
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
function readUsers() {
  try { return JSON.parse(localStorage.getItem('hifive_users') || '[]'); }
  catch { return []; }
}
function writeUsers(users) { localStorage.setItem('hifive_users', JSON.stringify(users)); }
async function ensureDemoUsers() {
  const users = readUsers();
  const demos = [
    {username:'admin', role:'admin', password:'admin123'},
    {username:'gudang', role:'gudang', password:'gudang123'},
    {username:'kasir', role:'kasir', password:'kasir123'}
  ];
  let changed = false;
  for (const demo of demos) {
    if (!users.some(user => user.username.toLowerCase() === demo.username)) {
      const salt = makeSalt();
      users.push({username:demo.username, role:demo.role, salt, passwordHash:await hashPassword(demo.password,salt), createdAt:new Date().toISOString()});
      changed = true;
    }
  }
  if (changed) writeUsers(users);
}
function readSession() {
  const raw = sessionStorage.getItem('hifive_session') || localStorage.getItem('hifive_session');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
function saveSession(user, remember) {
  const session = JSON.stringify({username:user.username,role:user.role});
  sessionStorage.removeItem('hifive_session');
  localStorage.removeItem('hifive_session');
  (remember ? localStorage : sessionStorage).setItem('hifive_session', session);
}
function clearSession() {
  sessionStorage.removeItem('hifive_session');
  localStorage.removeItem('hifive_session');
}
function restoreUser() {
  const session = readSession();
  if (!session) return null;
  const user = readUsers().find(item => item.username.toLowerCase() === String(session.username).toLowerCase());
  return user ? {username:user.username,role:user.role} : null;
}
function updateProfileUI() {
  if (!currentUser) return;
  const username = currentUser.username;
  const role = ROLE_LABEL[currentUser.role] || 'Pengguna';
  const letter = initials(username);
  ['sideAvatar','topAvatar'].forEach(id => { $(id).textContent = letter; });
  ['sideUsername','topUsername','menuUsername'].forEach(id => { $(id).textContent = username; });
  $('sideRole').textContent = role;
  $('menuRole').textContent = roleName(currentUser.role);
}
function showLoginPanel(which) {
  $('loginPanel').classList.toggle('hide', which !== 'login');
  $('registerPanel').classList.toggle('hide', which !== 'register');
  setAuthError('loginError');
  setAuthError('registerError');
}
function loginIntoApp(user, remember = false) {
  currentUser = {username:user.username,role:user.role};
  saveSession(user, remember);
  updateProfileUI();
  applyRoleMenuDefaults();
  loadNotificationReadState();
  $('side').classList.remove('collapsed', 'show');
  $('sideProfileDock').classList.remove('open');
  $('profileTop').classList.remove('open');
  $('login').classList.add('hide');
  $('app').classList.remove('hide');
  location.hash = 'dashboard';
  renderRoute();
  showToast(`Selamat datang, ${user.username}!`);
}

$('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  setAuthError('loginError');
  const username = $('loginUsername').value.trim();
  const password = $('loginPassword').value;
  if (!username || !password) return setAuthError('loginError','Username dan password wajib diisi.');
  const user = readUsers().find(item => item.username.toLowerCase() === username.toLowerCase());
  if (!user) return setAuthError('loginError','Akun tidak ditemukan. Periksa username atau buat akun baru.');
  const passwordHash = await hashPassword(password,user.salt);
  if (passwordHash !== user.passwordHash) return setAuthError('loginError','Password belum sesuai. Silakan coba lagi.');
  loginIntoApp(user, $('rememberMe').checked);
});
$('registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  setAuthError('registerError');
  const username = $('registerUsername').value.trim();
  const role = $('registerRole').value;
  const password = $('registerPassword').value;
  const confirm = $('registerConfirm').value;
  if (username.length < 3) return setAuthError('registerError','Username minimal terdiri dari 3 karakter.');
  if (!/^[a-zA-Z0-9._-]+$/.test(username)) return setAuthError('registerError','Gunakan huruf, angka, titik, garis bawah, atau tanda hubung pada username.');
  if (password.length < 6) return setAuthError('registerError','Password minimal terdiri dari 6 karakter.');
  if (password !== confirm) return setAuthError('registerError','Konfirmasi password belum sama.');
  const users = readUsers();
  if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) return setAuthError('registerError','Username sudah digunakan. Coba username lain.');
  const salt = makeSalt();
  const user = {username,role,salt,passwordHash:await hashPassword(password,salt),createdAt:new Date().toISOString()};
  users.push(user);
  writeUsers(users);
  $('registerForm').reset();
  loginIntoApp(user,true);
});
$('showRegister').addEventListener('click', () => showLoginPanel('register'));
$('showLogin').addEventListener('click', () => showLoginPanel('login'));
$('loginEye').addEventListener('click', () => {
  const input = $('loginPassword');
  input.type = input.type === 'password' ? 'text' : 'password';
});

function navIcon(label) {
  const filename = NAV_ASSET[label] || label;
  return `<span class="nav-icon"><img src="${ASSET_PATH(filename)}" alt="" width="14" height="14"></span>`;
}
function pageMascot(key) {
  if (key === 'gudang' || key === 'barang-masuk' || key === 'penerimaan-barang') return MASCOTS.gudang;
  if (key === 'kasir' || key.includes('penjualan')) return MASCOTS.kasir;
  if (key === 'dashboard') return MASCOTS.dashboard;
  return MASCOTS.default;
}
function badge(status) {
  const lower = String(status).toLowerCase();
  const cls = lower.includes('menipis') || lower.includes('pending') ? 'm' : lower.includes('habis') || lower.includes('batal') ? 'h' : 'w';
  return `<span class="bd ${cls}">${escapeHTML(status)}</span>`;
}
function spark(color) {
  return `<svg width="64" height="24" viewBox="0 0 64 24" fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M1 18 14 20 26 11 38 16 52 5 63 18"/></svg>`;
}
function statCard(label,value,note,bg,color,iconName,lineColor) {
  return `<div class="card st"><div class="r"><div class="ic" style="background:${bg};color:${color}">${icon(iconName)}</div><div><small>${escapeHTML(label)}</small><strong>${escapeHTML(value)}</strong></div></div><div class="f"><span>${escapeHTML(note)}</span>${spark(lineColor)}</div></div>`;
}
function renderTable(data, options = {}) {
  const statusWords = ['aman','menipis','habis','aktif','nonaktif','pending','diproses','selesai','terkirim','lunas','belum lunas'];
  return `<div class="ovf"><table class="data-table"><thead><tr>${data.c.map(header => `<th>${escapeHTML(header)}</th>`).join('')}</tr></thead><tbody>${data.r.map((row,index) => `<tr data-row="${index}">${row.map((cell,i) => {
    const isStatus = i === row.length - 1 && statusWords.includes(String(cell).toLowerCase());
    return `<td>${isStatus ? badge(cell) : escapeHTML(cell)}</td>`;
  }).join('')}</tr>`).join('')}</tbody></table></div>`;
}

const DATA = {
  barang:{c:['KODE','NAMA BARANG','KATEGORI','SATUAN','SUPPLIER','STOK','HARGA JUAL','STATUS'],r:[['BRG-001','Indomie Goreng','Makanan','Pcs','Indofood','50','Rp3.000','Aman'],['BRG-002','Aqua 600 ml','Minuman','Botol','Danone','120','Rp3.500','Aman'],['BRG-003','Telur Ayam','Sembako','Kg','CV Sejahtera','8','Rp28.000','Menipis'],['BRG-004','Roti Tawar','Bakery','Pcs','Sari Roti','75','Rp15.000','Aman'],['BRG-005','Susu UHT 1 L','Minuman','Kotak','Ultrajaya','5','Rp18.000','Menipis']],n:'1.250',t:['Total Barang','Stok Aktif','Stok Menipis'],v:['1.250','1.218','32'],f:['Produk terdaftar','Barang tersedia','Butuh perhatian'],sub:'Kelola katalog produk, kode barang, satuan, harga, dan batas minimum stok.',cr:'Master Data',add:'Tambah Barang'},
  supplier:{c:['KODE','NAMA SUPPLIER','KONTAK','KOTA','STATUS'],r:[['SUP-001','Indofood','0711-100200','Palembang','Aktif'],['SUP-002','Danone','0711-300400','Jakarta','Aktif'],['SUP-003','CV Sejahtera','0711-500600','Palembang','Aktif'],['SUP-004','Sari Roti','0711-700800','Bekasi','Aktif'],['SUP-005','Ultrajaya','0711-900100','Bandung','Aktif']],n:'20',cr:'Kontak',add:'Tambah Supplier'},
  pelanggan:{c:['KODE','NAMA PELANGGAN','KONTAK','KOTA','STATUS'],r:[['PLG-001','Budi Santoso','0812-1111-2222','Palembang','Aktif'],['PLG-002','Siti Aminah','0813-3333-4444','Palembang','Aktif'],['PLG-003','Toko Makmur','0821-5555-6666','Prabumulih','Aktif'],['PLG-004','Rina Wijaya','0852-7777-8888','Palembang','Aktif'],['PLG-005','Warung Bu Ani','0877-9999-0000','Indralaya','Aktif']],n:'86',cr:'Kontak',add:'Tambah Pelanggan'},
  kategori:{c:['KODE','NAMA KATEGORI','DESKRIPSI','JUMLAH BARANG','STATUS'],r:[['KTG-001','Makanan','Produk makanan kemasan','320','Aktif'],['KTG-002','Minuman','Minuman dingin dan kemasan','185','Aktif'],['KTG-003','Sembako','Kebutuhan pokok','240','Aktif'],['KTG-004','Perawatan','Kebutuhan perawatan diri','90','Aktif'],['KTG-005','Rumah Tangga','Perlengkapan rumah tangga','65','Aktif']],n:'12',cr:'Master Data',add:'Tambah Kategori'},
  satuan:{c:['KODE','NAMA SATUAN','SIMBOL','KETERANGAN','STATUS'],r:[['ST-001','Pieces','Pcs','Satuan unit','Aktif'],['ST-002','Botol','Btl','Kemasan botol','Aktif'],['ST-003','Kilogram','Kg','Satuan berat','Aktif'],['ST-004','Kotak','Ktk','Kemasan kotak','Aktif'],['ST-005','Liter','L','Satuan volume','Aktif']],n:'8',cr:'Master Data',add:'Tambah Satuan'},
  'grup-barang':{c:['KODE','NAMA GRUP','JUMLAH ITEM','KETERANGAN','STATUS'],r:[['GR-001','Produk Harian','82','Barang kebutuhan harian','Aktif'],['GR-002','Produk Segar','36','Produk segar supermarket','Aktif'],['GR-003','Produk Kemasan','150','Barang kemasan','Aktif']],n:'9',cr:'Inventory',add:'Tambah Grup'},
  'daftar-harga':{c:['KODE','NAMA BARANG','HARGA BELI','HARGA JUAL','MARGIN','STATUS'],r:[['HRG-001','Indomie Goreng','Rp2.400','Rp3.000','25%','Aktif'],['HRG-002','Aqua 600 ml','Rp2.800','Rp3.500','25%','Aktif'],['HRG-003','Roti Tawar','Rp12.000','Rp15.000','25%','Aktif']],n:'1.250',cr:'Inventory',add:'Tambah Harga'},
  'barang-masuk':{c:['NO. PENERIMAAN','TANGGAL','SUPPLIER','JUMLAH ITEM','DICATAT OLEH','STATUS'],r:[['GRN-001','06 Nov 2026','Indofood','100 pcs','Admin','Selesai'],['GRN-002','05 Nov 2026','Danone','80 botol','Gudang','Selesai'],['GRN-003','04 Nov 2026','CV Sejahtera','25 kg','Gudang','Diproses']],n:'48',cr:'Inventory',add:'Catat Barang Masuk'},
  'riwayat-stok':{c:['TANGGAL','KODE BARANG','NAMA BARANG','JENIS AKTIVITAS','PERUBAHAN','PENGGUNA'],r:[['06 Nov 2026','BRG-001','Indomie Goreng','Barang keluar','-10 pcs','Kasir'],['06 Nov 2026','BRG-002','Aqua 600 ml','Barang masuk','+100 botol','Gudang'],['05 Nov 2026','BRG-003','Telur Ayam','Penyesuaian','-2 kg','Admin']],n:'320',cr:'Inventory',add:'Tambah Riwayat'},
  'penyesuaian-stok':{c:['NO. PENYESUAIAN','TANGGAL','NAMA BARANG','STOK SISTEM','STOK FISIK','STATUS'],r:[['ADJ-001','06 Nov 2026','Telur Ayam','10 kg','8 kg','Selesai'],['ADJ-002','05 Nov 2026','Susu UHT 1 L','15 kotak','14 kotak','Diproses']],n:'14',cr:'Inventory',add:'Buat Penyesuaian'},
  'pesanan-penjualan':{c:['NO. PESANAN','TANGGAL','PELANGGAN','TOTAL','STATUS'],r:[['SO-001','06 Nov 2026','Budi Santoso','Rp125.000','Selesai'],['SO-002','06 Nov 2026','Toko Makmur','Rp84.500','Diproses'],['SO-003','05 Nov 2026','Siti Aminah','Rp240.000','Selesai']],n:'250',cr:'Penjualan',add:'Buat Pesanan'},
  invoice:{c:['NO. INVOICE','TANGGAL','PELANGGAN','JATUH TEMPO','TOTAL','STATUS'],r:[['INV-001','06 Nov 2026','Budi Santoso','06 Nov 2026','Rp125.000','Lunas'],['INV-002','05 Nov 2026','Toko Makmur','12 Nov 2026','Rp84.500','Belum Lunas']],n:'124',cr:'Penjualan',add:'Buat Invoice'},
  'pesanan-pembelian':{c:['NO. PO','TANGGAL','SUPPLIER','TOTAL ITEM','TOTAL','STATUS'],r:[['PO-001','06 Nov 2026','Indofood','100 pcs','Rp240.000','Diproses'],['PO-002','05 Nov 2026','Danone','80 botol','Rp224.000','Selesai']],n:'32',cr:'Pembelian',add:'Buat Pesanan Pembelian'},
  'penerimaan-barang':{c:['NO. PENERIMAAN','TANGGAL','NO. PO','SUPPLIER','JUMLAH ITEM','STATUS'],r:[['GRN-001','06 Nov 2026','PO-001','Indofood','100 pcs','Selesai'],['GRN-002','05 Nov 2026','PO-002','Danone','80 botol','Selesai']],n:'28',cr:'Pembelian',add:'Catat Penerimaan'},
  'tagihan-supplier':{c:['NO. TAGIHAN','SUPPLIER','TANGGAL','JATUH TEMPO','TOTAL','STATUS'],r:[['BILL-001','Indofood','06 Nov 2026','13 Nov 2026','Rp240.000','Belum Lunas'],['BILL-002','Danone','05 Nov 2026','12 Nov 2026','Rp224.000','Lunas']],n:'20',cr:'Pembelian',add:'Tambah Tagihan'},
  'pembayaran-diterima':{c:['NO. PEMBAYARAN','TANGGAL','PELANGGAN','METODE','JUMLAH','STATUS'],r:[['PAY-001','06 Nov 2026','Budi Santoso','Tunai','Rp125.000','Selesai'],['PAY-002','06 Nov 2026','Toko Makmur','Transfer','Rp84.500','Selesai']],n:'250',cr:'Penjualan',add:'Catat Pembayaran'},
  'pembayaran-supplier':{c:['NO. PEMBAYARAN','TANGGAL','SUPPLIER','METODE','JUMLAH','STATUS'],r:[['SP-001','06 Nov 2026','Indofood','Transfer','Rp240.000','Selesai'],['SP-002','05 Nov 2026','Danone','Transfer','Rp224.000','Selesai']],n:'18',cr:'Pembelian',add:'Catat Pembayaran'},
  pengguna:{c:['USERNAME','ROLE','TANGGAL DIBUAT','STATUS'],r:[],n:'3',cr:'Preferensi',add:'Tambah Pengguna'}
};

function getPageData(key, title) {
  if (!pageRecords[key]) {
    let source = DATA[key];
    if (key === 'pengguna') {
      source = {...DATA.pengguna, r:readUsers().map(user => [user.username, ROLE_LABEL[user.role] || 'Pengguna', user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-', 'Aktif']), n:String(readUsers().length)};
    }
    if (!source) {
      const prefixes = {supplier:'SUP',pelanggan:'PLG',barang:'BRG'};
      const prefix = prefixes[key] || key.slice(0,3).toUpperCase();
      source = {
        c:['NOMOR','NAMA / REFERENSI','TANGGAL','KETERANGAN','STATUS'],
        r:[1,2,3,4,5].map(index => [`${prefix}-${String(index).padStart(3,'0')}`,`${title} ${index}`,`${String(index).padStart(2,'0')} Nov 2026`,'Data contoh','Selesai']),
        n:'5',cr:'HiFive Inventory',add:`Tambah ${title}`
      };
    }
    pageRecords[key] = JSON.parse(JSON.stringify(source));
  }
  return pageRecords[key];
}

function dashboard() {
  const username = escapeHTML(currentUser?.username || 'User');
  const stats = [
    statCard('Total Barang','1.250','↑ 12% dibanding bulan lalu','#F7C6D6','var(--pinkd)','package','#BD6F8D'),
    statCard('Kategori','12','↑ 0% dari bulan lalu','#CBEBE5','var(--deep)','tag','#459F96'),
    statCard('Supplier','20','↑ 5% dibanding bulan lalu','#FFE2D0','#D9884A','truck','#D9884A'),
    statCard('Stok Menipis','45','↑ 8% perlu diperiksa','#EBD3EA','#8D5E93','box','#8D5E93')
  ].join('');
  const values = [[52,38],[68,48],[75,40],[100,55],[78,38],[60,44],[85,50]];
  const labels = ['16 Apr','17 Apr','18 Apr','19 Apr','20 Apr','21 Apr','22 Apr'];
  const bars = values.map((value,index) => {
    const x = 40 + index * 100;
    return `<rect x="${x}" y="${160-value[0]*1.4}" width="16" height="${value[0]*1.4}" rx="8" fill="#79C9BF"/><rect x="${x+22}" y="${160-value[1]*1.4}" width="16" height="${value[1]*1.4}" rx="8" fill="#D88FA8"/><text x="${x+19}" y="185" font-size="9" text-anchor="middle" fill="#817580">${labels[index]}</text>`;
  }).join('');
  const alerts = [
    ['box','Stok Mi Instan Goreng','tersisa 5 pcs saja','2 jam lalu','#FCE4EA','var(--pinkd)'],
    ['inbox','Barang baru dari supplier','telah masuk sebanyak 100 pcs','3 jam lalu','#DDF3EE','var(--deep)'],
    ['cash','Transaksi penjualan hari ini','mencapai 250 transaksi','5 jam lalu','#FFE8D6','#D9884A']
  ];
  const activity = [
    ['Barang masuk','Aqua 600 ml · +100 pcs','2 jam lalu','#79C9BF'],
    ['Penjualan','Transaksi POS-2026-001','3 jam lalu','#D88FA8'],
    ['Barang keluar','Indomie Goreng · −50 pcs','4 jam lalu','#C98B5B']
  ];
  const lowStock = {c:['KODE','NAMA BARANG','STOK TERSISA','STATUS','AKSI'],r:[['BRG-001','Indomie Goreng','5 pcs','Menipis','•••'],['BRG-045','Aqua 600 ml','8 botol','Menipis','•••'],['BRG-078','Telur Ayam','10 kg','Menipis','•••'],['BRG-102','Roti Tawar','12 pcs','Menipis','•••']]};
  const lowRows = lowStock.r.map(row => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${badge(row[3])}</td><td><button class="action-btn" title="Lihat detail">${icon('dots')}</button></td></tr>`).join('');
  const cartIllustration = `<svg class="banner-cart" viewBox="0 0 190 115" fill="none" aria-hidden="true"><path d="M18 21h17l15 58h93l17-43H45" stroke="#1B6B63" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M57 42h27v31H57z" fill="#79C9BF"/><path d="M88 32h27v41H88z" fill="#D88FA8"/><path d="M119 25h26v48h-26z" fill="#F7C99F"/><path d="M52 85h91" stroke="#1B6B63" stroke-width="4" stroke-linecap="round"/><circle cx="68" cy="98" r="9" fill="#1B6B63"/><circle cx="135" cy="98" r="9" fill="#1B6B63"/><path d="M154 18l5-9 5 9 9 5-9 5-5 9-5-9-9-5z" fill="#D88FA8"/><circle cx="35" cy="8" r="4" fill="#79C9BF"/></svg>`;
  return `
    <div class="banner">
      <img src="${MASCOTS.dashboard}" alt="Maskot HiFive sedang menyapa">
      <div><h3>Halo, ${username}!</h3><p>Selamat datang di HiFive Inventory. Berikut ringkasan aktivitas inventori hari ini.</p></div>
      <span class="tag">MANAGE STOCK. MOVE SMART.</span>${cartIllustration}
    </div>
    <div class="stats">${stats}</div>
    <div class="row">
      <div class="card pn">
        <div class="hd"><h4>${icon('package')}Pergerakan Stok</h4><select class="sel" aria-label="Periode grafik"><option>7 Hari Terakhir</option><option>30 Hari Terakhir</option><option>12 Bulan</option></select></div>
        <p class="s">Barang masuk dan barang keluar selama 7 hari terakhir</p>
        <div class="leg"><span><i style="background:#459F96"></i>Barang Masuk</span><span><i style="background:#D88FA8"></i>Barang Keluar</span></div>
        <svg viewBox="0 0 740 195" style="width:100%" role="img" aria-label="Grafik barang masuk dan keluar"><g stroke="#F0DFE7"><path d="M20 20H720M20 66H720M20 112H720M20 160H720"/></g>${bars}</svg>
      </div>
      <div class="card pn">
        <div class="hd"><h4>${icon('bell')}Notifikasi Penting</h4><a href="#riwayat-stok">Lihat Semua →</a></div>
        ${alerts.map(item => `<div class="li"><div class="ic" style="width:32px;height:32px;background:${item[4]};color:${item[5]}">${icon(item[0])}</div><div><b>${item[1]}</b><span>${item[2]}</span></div><em>${item[3]}</em></div>`).join('')}
      </div>
    </div>
    <div class="row">
      <div class="card pn"><div class="hd"><h4>${icon('package')}Stok Menipis</h4><a href="#barang">Lihat Semua →</a></div><div class="ovf"><table><thead><tr>${lowStock.c.map(header=>`<th>${header}</th>`).join('')}</tr></thead><tbody>${lowRows}</tbody></table></div></div>
      <div class="card pn"><div class="hd"><h4>${icon('hist')}Aktivitas Terbaru</h4><a href="#riwayat-stok">Lihat Semua →</a></div>${activity.map(item=>`<div class="li"><span class="dot" style="background:${item[3]}"></span><div><b>${item[0]}</b><span>${item[1]}</span></div><em>${item[2]}</em></div>`).join('')}</div>
    </div>`;
}

function pageHeader(title,key,crumb,description) {
  return `<div class="ph"><div><div class="crumb">HIFIVE INVENTORY &nbsp;/&nbsp; ${escapeHTML(crumb || 'MENU')}</div><h1>${escapeHTML(title)}</h1><p>${escapeHTML(description || `Kelola dan pantau data ${title.toLowerCase()} secara terpusat.`)}</p></div><img src="${pageMascot(key)}" alt="Maskot HiFive"></div>`;
}
function genericPage(title,key) {
  const data = getPageData(key,title);
  const metrics = data.t || ['Total Data','Aktif','Perlu Perhatian'];
  const values = data.v || [data.n || '5',data.n || '5','0'];
  const captions = data.f || ['Data terdaftar','Data tersedia','Butuh perhatian'];
  const colors = [['#F7C6D6','var(--pinkd)'],['#CBEBE5','var(--deep)'],['#FFE2D0','#D9884A']];
  const metricCards = metrics.slice(0,3).map((label,index) => statCard(label,values[index],captions[index],colors[index][0],colors[index][1],index===1?'check':'package',['#BD6F8D','#459F96','#D9884A'][index])).join('');
  return `${pageHeader(title,key,data.cr,data.sub)}
    <div class="stats three-stats">${metricCards}</div>
    <section class="card pn">
      <div class="hd"><h4>${navIcon(title)}Daftar ${escapeHTML(title)}</h4><span class="s">Data contoh untuk preview antarmuka</span></div>
      <div class="tb"><div class="sr"><span data-i="search"></span><input id="pageSearch" placeholder="Cari ${escapeHTML(title.toLowerCase())}..." aria-label="Cari data"></div><select class="sel" id="statusFilter"><option value="">Semua Status</option><option>Aman</option><option>Menipis</option><option>Aktif</option><option>Selesai</option></select><button class="btn" type="button" data-action="add">+ ${escapeHTML(data.add || `Tambah ${title}`)}</button></div>
      <div id="tableMount">${renderTable(data)}</div>
      <div class="pg"><span>Menampilkan ${data.r.length ? `1–${data.r.length}` : '0'} dari ${escapeHTML(data.n || data.r.length)} data</span><span>‹ &nbsp;<b>1</b>&nbsp; ›</span></div>
    </section>`;
}
function gudangPage() {
  const data = {
    c:['KODE','NAMA BARANG','KATEGORI','SUPPLIER','STOK','LOKASI','STATUS'],
    r:[['BRG-001','Indomie Goreng','Makanan','Indofood','50 pcs','Rak A-01','Aman'],['BRG-002','Aqua 600 ml','Minuman','Danone','120 botol','Rak B-02','Aman'],['BRG-003','Telur Ayam','Sembako','CV Sejahtera','8 kg','Rak C-01','Menipis'],['BRG-004','Roti Tawar','Bakery','Sari Roti','75 pcs','Rak D-04','Aman'],['BRG-005','Susu UHT 1 L','Minuman','Ultrajaya','5 kotak','Rak B-03','Menipis']]
  };
  return `${pageHeader('Gudang','gudang','INVENTORY','Pantau ketersediaan stok, barang menipis, dan nilai persediaan supermarket.')}
    <div class="stats">${statCard('Total Stok','2.840','Unit barang tersedia','#F7C6D6','var(--pinkd)','package','#BD6F8D')}${statCard('Stok Menipis','32','Perlu segera diperiksa','#CBEBE5','var(--deep)','box','#459F96')}${statCard('Barang Masuk','1.250','Bulan ini','#FFE2D0','#D9884A','inbox','#D9884A')}${statCard('Barang Keluar','1.198','Bulan ini','#EBD3EA','#8D5E93','package','#8D5E93')}</div>
    <section class="card pn">
      <div class="hd"><h4>${navIcon('Gudang')}Data Stok Barang</h4><button class="btn" type="button" data-action="export">Unduh Data</button></div>
      <div class="tb"><div class="sr"><span data-i="search"></span><input id="pageSearch" placeholder="Cari nama atau kode barang..."></div><select class="sel"><option>Semua Kategori</option><option>Makanan</option><option>Minuman</option></select><select class="sel"><option>Semua Supplier</option><option>Indofood</option><option>Danone</option></select><select class="sel" id="statusFilter"><option value="">Semua Status</option><option>Aman</option><option>Menipis</option></select></div>
      <div id="tableMount">${renderTable(data)}</div>
    </section>
    <section class="card pn" style="margin-top:16px"><h4>Ringkasan Kondisi Stok</h4><div class="stock-bars">
      <div class="stock-bar"><div class="hd"><b>Tersedia</b><b>68%</b></div><div class="line"><span style="width:68%;background:#79C9BF"></span></div></div>
      <div class="stock-bar"><div class="hd"><b>Menipis</b><b>18%</b></div><div class="line"><span style="width:18%;background:#D88FA8"></span></div></div>
      <div class="stock-bar"><div class="hd"><b>Habis</b><b>14%</b></div><div class="line"><span style="width:14%;background:#D9884A"></span></div></div>
    </div></section>`;
}
const PRODUCTS = [
  {code:'BRG-001',name:'Indomie Goreng',category:'Makanan',price:3000,stock:'50 pcs',symbol:'M',color:'#FBE8EF'},
  {code:'BRG-002',name:'Aqua 600 ml',category:'Minuman',price:3500,stock:'120 botol',symbol:'A',color:'#DDF3EE'},
  {code:'BRG-003',name:'Telur Ayam',category:'Sembako',price:28000,stock:'8 kg',symbol:'T',color:'#FFF0E3'},
  {code:'BRG-004',name:'Roti Tawar',category:'Bakery',price:15000,stock:'75 pcs',symbol:'R',color:'#F7EAF3'},
  {code:'BRG-005',name:'Susu UHT 1 L',category:'Minuman',price:18000,stock:'5 kotak',symbol:'S',color:'#E2F5F1'},
  {code:'BRG-006',name:'Minyak Goreng 1 L',category:'Sembako',price:18500,stock:'36 botol',symbol:'M',color:'#FFF0E3'}
];
function rupiah(value) { return `Rp${Number(value || 0).toLocaleString('id-ID')}`; }
function cartTotal() { return cart.reduce((sum,item)=>sum+item.price*item.qty,0); }
function renderCart() {
  const mount = $('cartItems');
  if (!mount) return;
  $('cartCount').textContent = `${cart.reduce((sum,item)=>sum+item.qty,0)} Item`;
  if (!cart.length) mount.innerHTML = '<div class="empty-cart">Keranjang masih kosong.<br>Pilih produk untuk memulai transaksi.</div>';
  else mount.innerHTML = cart.map(item=>`<div class="cart-item"><span class="ic" style="background:#FBE8EF;color:var(--pinkd);width:34px;height:34px">${escapeHTML(item.symbol)}</span><div class="item-name"><b>${escapeHTML(item.name)}</b><small>${item.qty} × ${rupiah(item.price)}</small></div><div class="qty-control"><button type="button" data-qty="-1" data-code="${item.code}" aria-label="Kurangi">−</button><b>${item.qty}</b><button type="button" data-qty="1" data-code="${item.code}" aria-label="Tambah">+</button></div><strong>${rupiah(item.price*item.qty)}</strong></div>`).join('');
  $('cartSubtotal').textContent = rupiah(cartTotal());
  $('cartTotal').textContent = rupiah(cartTotal());
  updateChange();
}
function cashierPage() {
  cart = [];
  return `${pageHeader('Modul Kasir','kasir','PENJUALAN','Proses transaksi penjualan supermarket dengan cepat dan teratur.')}
    <div class="module-layout">
      <section class="card pn"><div class="hd"><h4>${navIcon('Barang')}Daftar Produk</h4><span class="s">${PRODUCTS.length} produk tersedia</span></div>
        <div class="sr" style="max-width:none;width:100%;margin:14px 0"><span data-i="search"></span><input id="productSearch" placeholder="Cari nama atau kode barang..."></div>
        <div class="chips" style="margin:10px 0 16px"><span class="product-filter active" data-category="Semua">Semua</span><span class="product-filter" data-category="Makanan">Makanan</span><span class="product-filter" data-category="Minuman">Minuman</span><span class="product-filter" data-category="Sembako">Sembako</span></div>
        <div class="product-grid" id="productGrid">${PRODUCTS.map(product=>`<article class="product-card" data-category="${product.category}" data-name="${product.name.toLowerCase()}"><div class="product-art" style="background:${product.color}">${product.symbol}</div><b>${product.name}</b><strong>${rupiah(product.price)}</strong><small>${product.stock}</small><button class="btn" type="button" data-add-product="${product.code}">+ Tambah</button></article>`).join('')}</div>
      </section>
      <section class="card pn cart-panel"><div class="hd"><h4>${icon('cash')}Keranjang</h4><span class="bd" id="cartCount">0 Item</span></div>
        <div class="cart-items" id="cartItems"><div class="empty-cart">Keranjang masih kosong.<br>Pilih produk untuk memulai transaksi.</div></div>
        <div class="summary-line"><span>Subtotal</span><b id="cartSubtotal">Rp0</b></div><div class="summary-line"><span>Diskon</span><b>Rp0</b></div><div class="summary-line total"><span>Total Belanja</span><b id="cartTotal">Rp0</b></div>
        <label for="paymentAmount">Uang Pembayaran</label><input class="in" id="paymentAmount" type="number" min="0" placeholder="Masukkan nominal pembayaran">
        <div class="summary-line" style="background:#FFF7FA;padding:13px;border-radius:10px"><span>Kembalian</span><b id="changeAmount">Rp0</b></div>
        <button class="btn w" id="processPayment" type="button" style="margin-top:12px">Proses Pembayaran</button><button class="btn secondary w" id="clearCart" type="button" style="margin-top:9px">Kosongkan Keranjang</button>
        <small class="field-hint">Stok pada demo ini tidak tersambung ke database.</small>
      </section>
    </div>`;
}
function updateChange() {
  const input = $('paymentAmount');
  const result = $('changeAmount');
  if (!input || !result) return;
  const paid = Number(input.value || 0);
  result.textContent = rupiah(Math.max(0,paid-cartTotal()));
}
function renderPage(title,key) {
  if (key === 'dashboard') return dashboard();
  if (key === 'gudang') return gudangPage();
  if (key === 'kasir') return cashierPage();
  if (key === 'pengaturan') return `${pageHeader(title,key,'PREFERENSI','Atur preferensi tampilan dan informasi akun HiFive Inventory.')}<section class="card pn"><h4>Preferensi Akun</h4><p class="s">Akun yang sedang digunakan</p><div class="li"><div><b>${escapeHTML(currentUser.username)}</b><span>${escapeHTML(roleName(currentUser.role))}</span></div></div><div class="li"><div><b>Tampilan</b><span>Palet HiFive Pink & Tosca</span></div></div><div class="li"><div><b>Mode</b><span>Light mode</span></div></div></section>`;
  if (key === 'laporan') return `${pageHeader(title,key,'ANALISIS','Ringkasan performa persediaan dan transaksi supermarket.')}<div class="stats">${statCard('Total Penjualan','Rp12,8 jt','Periode bulan ini','#F7C6D6','var(--pinkd)','cash','#BD6F8D')}${statCard('Barang Masuk','1.250','Unit diterima','#CBEBE5','var(--deep)','inbox','#459F96')}${statCard('Barang Keluar','1.198','Unit terjual / keluar','#FFE2D0','#D9884A','package','#D9884A')}</div><section class="card pn"><h4>${icon('chart')}Ringkasan Aktivitas</h4><p class="s">Grafik contoh untuk tampilan laporan.</p><svg viewBox="0 0 740 220" style="width:100%"><g stroke="#F0DFE7"><path d="M10 30H730M10 80H730M10 130H730M10 180H730"/></g><path d="M20 160L125 130L230 142L335 90L440 110L545 55L650 74L720 38" fill="none" stroke="#79C9BF" stroke-width="4" stroke-linecap="round"/><path d="M20 185L125 170L230 180L335 145L440 158L545 125L650 137L720 110" fill="none" stroke="#D88FA8" stroke-width="3" stroke-linecap="round"/></svg></section>`;
  return genericPage(title,key);
}

function renderRoute() {
  const sessionUser = currentUser || restoreUser();
  if (!sessionUser) {
    currentUser = null;
    $('login').classList.remove('hide');
    $('app').classList.add('hide');
    return;
  }
  currentUser = sessionUser;
  updateProfileUI();
  const requested = slug(location.hash.replace(/^#/,'') || 'dashboard');
  const key = MENU_TITLES.has(requested) ? requested : 'dashboard';
  currentPageKey = key;
  $('login').classList.add('hide');
  $('app').classList.remove('hide');
  $('nav').querySelectorAll('.nv').forEach(link => link.classList.toggle('on',link.getAttribute('href') === `#${key}`));
  $('nav').querySelectorAll('.g').forEach(section => {
    const containsActive = Boolean(section.querySelector(`.nv[href="#${key}"]`));
    if (containsActive) {
      section.classList.add('open');
      section.querySelector('.gh').setAttribute('aria-expanded','true');
    }
  });
  const title = MENU_TITLES.get(key) || 'Dashboard';
  $('view').innerHTML = renderPage(title,key);
  fillIcons($('view'));
  $('view').scrollTop = 0;
  $('side').classList.remove('show');
  if (key === 'kasir') bindCashier();
  bindPageTools();
}
function bindPageTools() {
  const search = $('pageSearch');
  if (search) search.addEventListener('input', () => filterCurrentTable(search.value));
  const status = $('statusFilter');
  if (status) status.addEventListener('change', () => filterCurrentTable(search?.value || '',status.value));
  const add = $('view').querySelector('[data-action="add"]');
  if (add) add.addEventListener('click',openAddModal);
  const exportButton = $('view').querySelector('[data-action="export"]');
  if (exportButton) exportButton.addEventListener('click',exportCurrentTable);
}
function filterCurrentTable(query = '',status = '') {
  const rows = $('view').querySelectorAll('.data-table tbody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    const visible = text.includes(query.toLowerCase()) && (!status || text.includes(status.toLowerCase()));
    row.style.display = visible ? '' : 'none';
  });
}
function bindCashier() {
  $('productGrid')?.addEventListener('click',(event) => {
    const button = event.target.closest('[data-add-product]');
    if (!button) return;
    const product = PRODUCTS.find(item=>item.code === button.dataset.addProduct);
    if (!product) return;
    const existing = cart.find(item=>item.code === product.code);
    if (existing) existing.qty += 1;
    else cart.push({...product,qty:1});
    renderCart();
  });
  $('cartItems')?.addEventListener('click',(event) => {
    const button = event.target.closest('[data-qty]');
    if (!button) return;
    const item = cart.find(product=>product.code === button.dataset.code);
    if (!item) return;
    item.qty += Number(button.dataset.qty);
    if (item.qty <= 0) cart = cart.filter(product=>product.code !== item.code);
    renderCart();
  });
  $('paymentAmount')?.addEventListener('input',updateChange);
  $('clearCart')?.addEventListener('click',() => {cart=[];renderCart();$('paymentAmount').value='';showToast('Keranjang dikosongkan.');});
  $('processPayment')?.addEventListener('click',() => {
    if (!cart.length) return showToast('Tambahkan produk ke keranjang terlebih dahulu.');
    const paid = Number($('paymentAmount').value || 0);
    const total = cartTotal();
    if (paid < total) return showToast('Nominal pembayaran masih kurang.');
    const transactionNo = `POS-${Date.now().toString().slice(-6)}`;
    cart=[];renderCart();$('paymentAmount').value='';
    showToast(`Transaksi ${transactionNo} berhasil diproses (demo).`);
  });
  $('productSearch')?.addEventListener('input',(event) => {
    const query = event.target.value.toLowerCase();
    $('productGrid').querySelectorAll('.product-card').forEach(card => {card.style.display = card.dataset.name.includes(query) ? '' : 'none';});
  });
  $('view').querySelectorAll('.product-filter').forEach(filter => filter.addEventListener('click',() => {
    $('view').querySelectorAll('.product-filter').forEach(item=>item.classList.remove('active'));
    filter.classList.add('active');
    const category = filter.dataset.category;
    $('productGrid').querySelectorAll('.product-card').forEach(card=>{card.style.display = category === 'Semua' || card.dataset.category === category ? '' : 'none';});
  }));
}

function openAddModal() {
  const title = MENU_TITLES.get(currentPageKey) || 'Data';
  const data = getPageData(currentPageKey,title);
  const fields = data.c.filter(header => !['STATUS','AKSI'].includes(header)).slice(0,4);
  $('modalTitle').textContent = data.add || `Tambah ${title}`;
  $('modalDescription').textContent = `Masukkan informasi ${title.toLowerCase()} yang ingin ditambahkan.`;
  $('modalFields').innerHTML = fields.map((field,index)=>`<label for="recordField${index}">${escapeHTML(field.replaceAll('_',' '))}</label><input class="in" id="recordField${index}" name="field${index}" placeholder="Masukkan ${escapeHTML(field.toLowerCase())}" ${index===0?'required':''}>`).join('');
  $('modalBackdrop').classList.add('open');
  $('recordForm').dataset.fieldCount = String(fields.length);
  $('recordField0')?.focus();
}
function closeModal() { $('modalBackdrop').classList.remove('open'); $('recordForm').reset(); }
$('cancelModal').addEventListener('click',closeModal);
$('modalBackdrop').addEventListener('click',(event)=>{if(event.target === $('modalBackdrop'))closeModal();});
$('recordForm').addEventListener('submit',(event)=>{
  event.preventDefault();
  const title = MENU_TITLES.get(currentPageKey) || 'Data';
  const data = getPageData(currentPageKey,title);
  const count = Number($('recordForm').dataset.fieldCount || 0);
  const values = Array.from({length:count},(_,index)=>$(`recordField${index}`)?.value.trim() || '-');
  if (!values[0] || values[0] === '-') return showToast('Lengkapi data utama terlebih dahulu.');
  while (values.length < data.c.length) values.push(values.length === data.c.length-1 ? 'Aktif' : '-');
  data.r.unshift(values);
  data.n = String(Math.max(Number(data.n) || data.r.length,data.r.length));
  closeModal();
  renderRoute();
  showToast('Data demo berhasil ditambahkan.');
});
function exportCurrentTable() {
  const table = $('view').querySelector('.data-table');
  if (!table) return;
  const rows = [...table.querySelectorAll('tr')].map(row=>[...row.children].map(cell=>`"${cell.textContent.trim().replace(/"/g,'""')}"`).join(','));
  const blob = new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');link.href=url;link.download=`hifive-${currentPageKey}.csv`;link.click();URL.revokeObjectURL(url);
  showToast('Data berhasil diekspor ke CSV.');
}

function toggleSideMenu() {
  const side = $('side');
  if (window.matchMedia('(max-width: 1000px)').matches) side.classList.toggle('show');
  else side.classList.toggle('collapsed');
}
$('sideToggle').addEventListener('click',toggleSideMenu);
$('mobileMenuToggle').addEventListener('click',()=> $('side').classList.toggle('show'));
function toggleSideProfile() {
  const dock = $('sideProfileDock');
  const open = dock.classList.toggle('open');
  $('sideProfileToggle').setAttribute('aria-expanded',String(open));
  $('sideProfileChevron').setAttribute('aria-expanded',String(open));
}
$('sideProfileToggle').addEventListener('click',toggleSideProfile);
$('sideProfileChevron').addEventListener('click',toggleSideProfile);
$('profileTopButton').addEventListener('click',()=>{
  const root = $('profileTop');
  const open = root.classList.toggle('open');
  $('profileTopButton').setAttribute('aria-expanded',String(open));
  if (open) toggleNotifications(false);
});
function showProfileInfo() {
  if (!currentUser) return;
  showToast(`Username: ${currentUser.username} · Role: ${roleName(currentUser.role)}`);
  $('profileTop').classList.remove('open');
  $('sideProfileDock').classList.remove('open');
}
$('sideProfileInfo').addEventListener('click',showProfileInfo);
$('topProfileInfo').addEventListener('click',showProfileInfo);
function logout() {
  clearSession();
  currentUser = null;
  cart = [];
  location.hash = '';
  $('app').classList.add('hide');
  $('login').classList.remove('hide');
  $('loginForm').reset();
  showLoginPanel('login');
  $('profileTop').classList.remove('open');
  $('sideProfileDock').classList.remove('open');
  $('notificationWrap').classList.remove('open');
  $('notificationButton').setAttribute('aria-expanded', 'false');
  $('notificationPanel').hidden = true;
  $('side').classList.remove('collapsed', 'show');
  showToast('Anda telah keluar dari akun.');
}
$('logoutSide').addEventListener('click',logout);
$('logoutTop').addEventListener('click',logout);

// Top-bar notification popover: clickable, keyboard accessible, and with working destinations.
let notificationsRead = false;
function notificationReadKey() { return `hifive_notifications_read_${String(currentUser?.username || 'guest').toLowerCase()}`; }
function loadNotificationReadState() {
  notificationsRead = sessionStorage.getItem(notificationReadKey()) === 'true';
  syncNotificationReadState();
}
function syncNotificationReadState() {
  const count = $('notificationCount');
  count.textContent = notificationsRead ? '0' : '3';
  count.classList.toggle('hide', notificationsRead);
  $('notificationPanel').querySelectorAll('.notification-unread').forEach(dot => dot.classList.toggle('hide', notificationsRead));
  $('notificationPanel').querySelectorAll('.notification-item').forEach(item => item.classList.toggle('read', notificationsRead));
}
function toggleNotifications(force) {
  const open = typeof force === 'boolean' ? force : $('notificationPanel').hidden;
  $('notificationPanel').hidden = !open;
  $('notificationWrap').classList.toggle('open', open);
  $('notificationButton').setAttribute('aria-expanded', String(open));
  if (open) {
    $('profileTop').classList.remove('open');
    $('profileTopButton').setAttribute('aria-expanded', 'false');
  }
}
$('notificationButton').addEventListener('click', () => toggleNotifications());
$('markNotificationsRead').addEventListener('click', () => {
  notificationsRead = true;
  sessionStorage.setItem(notificationReadKey(), 'true');
  syncNotificationReadState();
  showToast('Semua notifikasi ditandai sudah dibaca.');
});
$('notificationPanel').addEventListener('click', (event) => {
  const item = event.target.closest('[data-notification-target]');
  if (!item) return;
  const target = item.dataset.notificationTarget;
  toggleNotifications(false);
  location.hash = target;
  if (location.hash === `#${target}`) renderRoute();
});
$('viewAllNotifications').addEventListener('click', () => {
  notificationsRead = true;
  sessionStorage.setItem(notificationReadKey(), 'true');
  syncNotificationReadState();
  toggleNotifications(false);
  location.hash = 'riwayat-stok';
  if (location.hash === '#riwayat-stok') renderRoute();
});
syncNotificationReadState();

document.addEventListener('click',(event)=>{
  if (!$('profileTop').contains(event.target)) $('profileTop').classList.remove('open');
  if (!$('sideProfileDock').contains(event.target)) $('sideProfileDock').classList.remove('open');
  if (!$('notificationWrap').contains(event.target)) toggleNotifications(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    toggleNotifications(false);
    $('profileTop').classList.remove('open');
    $('sideProfileDock').classList.remove('open');
  }
});
$('globalSearch').addEventListener('keydown',(event)=>{
  if (event.key !== 'Enter') return;
  const query = event.target.value.trim();
  if (!query) return;
  location.hash = 'barang';
  setTimeout(()=>{const input=$('pageSearch');if(input){input.value=query;filterCurrentTable(query);}},80);
});
window.addEventListener('hashchange',renderRoute);
window.addEventListener('resize',()=>{if(!window.matchMedia('(max-width: 1000px)').matches)$('side').classList.remove('show');});

function setTodayDate() {
  const now = new Date();
  $('todayDate').textContent = new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'long',year:'numeric'}).format(now);
}
async function init() {
  await ensureDemoUsers();
  setTodayDate();
  fillIcons(document);
  currentUser = restoreUser();
  if (currentUser) {
    $('login').classList.add('hide');
    $('app').classList.remove('hide');
    if (!location.hash) location.hash = 'dashboard';
    updateProfileUI();
    applyRoleMenuDefaults();
    loadNotificationReadState();
  } else {
    showLoginPanel('login');
    $('login').classList.remove('hide');
    $('app').classList.add('hide');
  }
  renderRoute();
}
init();
