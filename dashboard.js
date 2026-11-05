(function () {
  const user = requireLogin();
  if (!user) return;
  initializeData();
  const role = ROLE_PERMISSIONS[user.role];
  const firstName = user.nama || user.username;
  document.getElementById("greetingName").textContent = firstName;
  document.getElementById("sideUserName").textContent = firstName;
  document.getElementById("sideUserRole").textContent = role.label;
  document.getElementById("topRole").textContent = role.label;
  document.getElementById("userAvatar").textContent = firstName.charAt(0).toUpperCase();
  document.getElementById("topAvatar").textContent = firstName.charAt(0).toUpperCase();
  document.getElementById("usersShortcut").classList.toggle("d-none", user.role !== "admin");
  document.getElementById("quickUsers").classList.toggle("d-none", user.role !== "admin");
  const barang = getData("barang");
  const low = barang.filter(item => Number(item.stok) <= Number(item.minimum));
  document.getElementById("statBarang").textContent = barang.length;
  document.getElementById("statKategori").textContent = getData("kategori").length;
  document.getElementById("statSupplier").textContent = getData("supplier").length;
  document.getElementById("statStokRendah").textContent = low.length;
  const lowTable = document.getElementById("lowStockTable");
  if (!low.length) {
    document.getElementById("lowStockEmpty").classList.remove("d-none");
    lowTable.closest(".table-wrap").classList.add("d-none");
  } else {
    lowTable.innerHTML = low.slice(0, 5).map(item => `<tr><td><div class="fw-semibold">${escapeHtml(item.nama)}</div><div class="small text-secondary">${escapeHtml(item.kode)}</div></td><td><span class="status-badge status-low">${Number(item.stok)}</span></td><td>${Number(item.minimum)}</td></tr>`).join("");
  }
})();

// FITUR HANS: Export Rekap Laporan ke CSV
window.exportToCSV = function() {
  const barangData = getData("barang");
  const kategoriData = getData("kategori");
  
  if (!barangData || barangData.length === 0) {
    alert("Tidak ada data barang untuk diekspor!");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Kode Barang,Nama Barang,Kategori,Harga Beli,Harga Jual,Stok Saat Ini,Batas Minimum,Status\n";

  barangData.forEach(item => {
    const kat = kategoriData.find(k => k.id === item.kategoriId);
    const namaKategori = kat ? kat.nama : "-";
    const status = Number(item.stok) <= Number(item.minimum) ? "Stok Menipis" : "Aman";
    
    const row = [
      item.kode,
      `"${item.nama}"`,
      `"${namaKategori}"`,
      item.hargaBeli,
      item.hargaJual,
      item.stok,
      item.minimum,
      status
    ].join(",");
    
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Rekap_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
