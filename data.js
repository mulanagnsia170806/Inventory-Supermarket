const DATA_KEYS = {
  barang: "inventory_pos_barang",
  satuan: "inventory_pos_satuan",
  kategori: "inventory_pos_kategori",
  supplier: "inventory_pos_supplier"
};

const SEED_DATA = {
  satuan: [
    { id: "sat-pcs", nama: "Pieces", singkatan: "pcs", deskripsi: "Satuan per buah" },
    { id: "sat-kg", nama: "Kilogram", singkatan: "kg", deskripsi: "Satuan berat" },
    { id: "sat-box", nama: "Kotak", singkatan: "box", deskripsi: "Satuan per kotak" },
    { id: "sat-btl", nama: "Botol", singkatan: "btl", deskripsi: "Satuan per botol" }
  ],
  kategori: [
    { id: "kat-mkn", nama: "Makanan", deskripsi: "Makanan dan camilan" },
    { id: "kat-mnm", nama: "Minuman", deskripsi: "Minuman kemasan" },
    { id: "kat-rt", nama: "Rumah Tangga", deskripsi: "Keperluan rumah tangga" },
    { id: "kat-atk", nama: "ATK", deskripsi: "Alat tulis kantor" }
  ],
  supplier: [
    { id: "sup-001", kode: "SUP-001", nama: "PT Sumber Pangan", telepon: "081234567801", email: "order@sumberpangan.test", alamat: "Jl. Merdeka No. 10, Palembang" },
    { id: "sup-002", kode: "SUP-002", nama: "CV Segar Sentosa", telepon: "081234567802", email: "sales@segarsentosa.test", alamat: "Jl. Sudirman No. 25, Palembang" },
    { id: "sup-003", kode: "SUP-003", nama: "Mitra Niaga Bersama", telepon: "081234567803", email: "mitra@niaga.test", alamat: "Jl. Angkatan 45 No. 5, Palembang" }
  ],
  barang: [
    { id: "brg-001", kode: "BRG-001", nama: "Beras Premium 5 kg", kategoriId: "kat-mkn", satuanId: "sat-kg", supplierId: "sup-001", hargaBeli: 65000, hargaJual: 72000, stok: 18, minimum: 10 },
    { id: "brg-002", kode: "BRG-002", nama: "Air Mineral 600 ml", kategoriId: "kat-mnm", satuanId: "sat-btl", supplierId: "sup-002", hargaBeli: 2500, hargaJual: 3500, stok: 8, minimum: 15 },
    { id: "brg-003", kode: "BRG-003", nama: "Mi Instan Goreng", kategoriId: "kat-mkn", satuanId: "sat-pcs", supplierId: "sup-001", hargaBeli: 2800, hargaJual: 3500, stok: 46, minimum: 20 },
    { id: "brg-004", kode: "BRG-004", nama: "Sabun Cuci Piring", kategoriId: "kat-rt", satuanId: "sat-btl", supplierId: "sup-003", hargaBeli: 9000, hargaJual: 12000, stok: 12, minimum: 12 },
    { id: "brg-005", kode: "BRG-005", nama: "Buku Tulis 38 Lembar", kategoriId: "kat-atk", satuanId: "sat-pcs", supplierId: "sup-003", hargaBeli: 3000, hargaJual: 4500, stok: 75, minimum: 25 }
  ]
};

function initializeData() {
  Object.entries(DATA_KEYS).forEach(([moduleKey, storageKey]) => {
    if (!localStorage.getItem(storageKey)) localStorage.setItem(storageKey, JSON.stringify(SEED_DATA[moduleKey] || []));
  });
  if (typeof initializeUsers === "function") initializeUsers();
}
function getData(moduleKey) {
  initializeData();
  const storageKey = DATA_KEYS[moduleKey];
  if (!storageKey) return [];
  try {
    const value = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}
function setData(moduleKey, rows) {
  const storageKey = DATA_KEYS[moduleKey];
  if (!storageKey) throw new Error("Modul tidak dikenal.");
  localStorage.setItem(storageKey, JSON.stringify(rows));
}
function makeId(prefix) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`; }
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value) || 0);
}
function getRecordName(moduleKey, id) {
  const row = getData(moduleKey).find(item => item.id === id);
  if (!row) return "—";
  return row.nama || row.singkatan || row.username || row.kode || "—";
}
