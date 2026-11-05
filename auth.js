const AUTH_KEY = "inventory_pos_session";
const USERS_KEY = "inventory_pos_users";

const ROLE_PERMISSIONS = {
  admin: { label: "Administrator", redirectTo: "dashboard.html", modules: ["barang", "satuan", "kategori", "supplier", "pengguna"], canManage: true },
  gudang: { label: "Petugas Gudang", redirectTo: "master-data.html", modules: ["barang", "satuan", "kategori", "supplier"], canManage: true },
  kasir: { label: "Kasir", redirectTo: "dashboard.html", modules: ["barang"], canManage: false }
};

const DEFAULT_USERS = [
  { id: "user-admin", nama: "Administrator", username: "admin", password: "admin123", role: "admin", status: "Aktif" },
  { id: "user-gudang", nama: "Petugas Gudang", username: "gudang", password: "gudang123", role: "gudang", status: "Aktif" },
  { id: "user-kasir", nama: "Kasir Demo", username: "kasir", password: "kasir123", role: "kasir", status: "Aktif" }
];

function initializeUsers() {
  if (!localStorage.getItem(USERS_KEY)) localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
}
function getUsers() {
  initializeUsers();
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return [...DEFAULT_USERS]; }
}
function setUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
function doLogin(username, password) {
  initializeUsers();
  const user = getUsers().find(item => item.username.toLowerCase() === username.toLowerCase() && item.password === password && item.status === "Aktif");
  if (!user) {
    const existingUsername = getUsers().some(item => item.username.toLowerCase() === username.toLowerCase());
    return { success: false, message: existingUsername ? "Akun tidak aktif atau password yang kamu masukkan salah." : "Username atau password salah." };
  }
  const safeUser = { id: user.id, nama: user.nama, username: user.username, role: user.role };
  localStorage.setItem(AUTH_KEY, JSON.stringify(safeUser));
  return { success: true, user: safeUser };
}
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)); }
  catch { return null; }
}
function requireLogin() {
  const user = getCurrentUser();
  if (!user || !ROLE_PERMISSIONS[user.role]) { window.location.href = "index.html"; return null; }
  return user;
}
function redirectIfLoggedIn() {
  const user = getCurrentUser();
  if (user && ROLE_PERMISSIONS[user.role]) window.location.href = ROLE_PERMISSIONS[user.role].redirectTo;
}
function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "index.html";
}
