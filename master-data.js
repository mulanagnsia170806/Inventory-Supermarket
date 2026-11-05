(function () {
  const user = requireLogin();
  if (!user) return;
  initializeData();
  const permissions = ROLE_PERMISSIONS[user.role];
  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("recordModal"));
  const toast = bootstrap.Toast.getOrCreateInstance(document.getElementById("appToast"), { delay: 2600 });
  const tabsEl = document.getElementById("moduleTabs");
  const searchInput = document.getElementById("searchInput");
  const tableContainer = document.getElementById("tableContainer");
  const recordForm = document.getElementById("recordForm");
  const fieldsContainer = document.getElementById("formFields");
  const formError = document.getElementById("formError");
  const addButton = document.getElementById("addButton");
  let currentModule = "barang";
  let editingId = null;

  const MODULES = {
    barang: {
      title: "Data Barang", description: "Kelola produk, harga, dan informasi stok.", singular: "barang", prefix: "BRG",
      columns: [
        { label: "Kode", render: row => `<span class="item-code">${escapeHtml(row.kode)}</span>` },
        { label: "Nama Barang", render: row => `<div class="fw-semibold">${escapeHtml(row.nama)}</div><div class="small text-secondary">${escapeHtml(getRecordName("kategori", row.kategoriId))}</div>` },
        { label: "Satuan", render: row => escapeHtml(getRecordName("satuan", row.satuanId)) },
        { label: "Supplier", render: row => escapeHtml(getRecordName("supplier", row.supplierId)) },
        { label: "Harga Jual", render: row => `<span class="fw-semibold">${escapeHtml(formatRupiah(row.hargaJual))}</span>` },
        { label: "Stok", render: row => `<span class="status-badge ${Number(row.stok) <= Number(row.minimum) ? "status-low" : "status-active"}">${Number(row.stok)} ${Number(row.stok) <= Number(row.minimum) ? '<i class="bi bi-exclamation-circle"></i>' : ""}</span><div class="small text-secondary mt-1">Min. ${Number(row.minimum)}</div>` }
      ],
      fields: [
        { name: "kode", label: "Kode Barang", required: true, placeholder: "Contoh: BRG-006", width: 6 },
        { name: "nama", label: "Nama Barang", required: true, placeholder: "Masukkan nama produk", width: 6 },
        { name: "kategoriId", label: "Kategori Produk", type: "select", optionsFrom: "kategori", required: true, width: 6 },
        { name: "satuanId", label: "Satuan", type: "select", optionsFrom: "satuan", required: true, width: 6 },
        { name: "supplierId", label: "Supplier", type: "select", optionsFrom: "supplier", required: true, width: 12 },
        { name: "hargaBeli", label: "Harga Beli (Rp)", type: "number", required: true, min: 0, width: 6 },
        { name: "hargaJual", label: "Harga Jual (Rp)", type: "number", required: true, min: 0, width: 6 },
        { name: "stok", label: "Stok Saat Ini", type: "number", required: true, min: 0, width: 6 },
        { name: "minimum", label: "Batas Minimum Stok", type: "number", required: true, min: 0, width: 6 }
      ]
    },
    satuan: {
      title: "Data Satuan", description: "Atur satuan yang dipakai dalam pencatatan barang.", singular: "satuan", prefix: "SAT",
      columns: [
        { label: "Nama Satuan", render: row => `<div class="fw-semibold">${escapeHtml(row.nama)}</div>` },
        { label: "Singkatan", render: row => `<span class="item-code">${escapeHtml(row.singkatan)}</span>` },
        { label: "Deskripsi", render: row => escapeHtml(row.deskripsi || "—") }
      ],
      fields: [
        { name: "nama", label: "Nama Satuan", required: true, placeholder: "Contoh: Pieces", width: 6 },
        { name: "singkatan", label: "Singkatan", required: true, placeholder: "Contoh: pcs", width: 6 },
        { name: "deskripsi", label: "Deskripsi", type: "textarea", placeholder: "Keterangan satuan (opsional)", width: 12 }
      ]
    },
    kategori: {
      title: "Kategori Produk", description: "Kelompokkan produk agar data lebih mudah dikelola.", singular: "kategori", prefix: "KAT",
      columns: [
        { label: "Nama Kategori", render: row => `<div class="fw-semibold">${escapeHtml(row.nama)}</div>` },
        { label: "Jumlah Barang", render: row => `<span class="item-code">${getData("barang").filter(item => item.kategoriId === row.id).length} barang</span>` },
        { label: "Deskripsi", render: row => escapeHtml(row.deskripsi || "—") }
      ],
      fields: [
        { name: "nama", label: "Nama Kategori", required: true, placeholder: "Contoh: Makanan", width: 12 },
        { name: "deskripsi", label: "Deskripsi", type: "textarea", placeholder: "Keterangan kategori (opsional)", width: 12 }
      ]
    },
    supplier: {
      title: "Data Supplier", description: "Simpan informasi kontak mitra pemasok barang.", singular: "supplier", prefix: "SUP",
      columns: [
        { label: "Kode", render: row => `<span class="item-code">${escapeHtml(row.kode)}</span>` },
        { label: "Nama Supplier", render: row => `<div class="fw-semibold">${escapeHtml(row.nama)}</div><div class="small text-secondary">${escapeHtml(row.email || "Email belum diisi")}</div>` },
        { label: "Telepon", render: row => escapeHtml(row.telepon || "—") },
        { label: "Alamat", render: row => `<span class="d-inline-block" style="min-width:150px;max-width:260px">${escapeHtml(row.alamat || "—")}</span>` },
        { label: "Barang Terkait", render: row => `<span class="item-code">${getData("barang").filter(item => item.supplierId === row.id).length} barang</span>` }
      ],
      fields: [
        { name: "kode", label: "Kode Supplier", required: true, placeholder: "Contoh: SUP-004", width: 6 },
        { name: "nama", label: "Nama Supplier", required: true, placeholder: "Nama perusahaan/pemasok", width: 6 },
        { name: "telepon", label: "Nomor Telepon", type: "tel", placeholder: "08xxxxxxxxxx", width: 6 },
        { name: "email", label: "Email", type: "email", placeholder: "supplier@contoh.com", width: 6 },
        { name: "alamat", label: "Alamat", type: "textarea", placeholder: "Alamat supplier", width: 12 }
      ]
    },
    pengguna: {
      title: "Manajemen Pengguna", description: "Kelola akun, role, dan status akses pengguna sistem.", singular: "pengguna", prefix: "USR",
      columns: [
        { label: "Pengguna", render: row => `<div class="d-flex align-items-center gap-2"><div class="avatar" style="width:34px;height:34px;flex-basis:34px;font-size:.8rem">${escapeHtml((row.nama || "U").charAt(0).toUpperCase())}</div><div><div class="fw-semibold">${escapeHtml(row.nama)}</div><div class="small text-secondary">@${escapeHtml(row.username)}</div></div></div>` },
        { label: "Role", render: row => `<span class="status-badge ${row.role === "admin" ? "status-low" : row.role === "gudang" ? "status-active" : "status-off"}">${escapeHtml(ROLE_PERMISSIONS[row.role]?.label || row.role)}</span>` },
        { label: "Status", render: row => `<span class="status-badge ${row.status === "Aktif" ? "status-active" : "status-off"}"><i class="bi bi-circle-fill" style="font-size:.42rem"></i>${escapeHtml(row.status)}</span>` }
      ],
      fields: [
        { name: "nama", label: "Nama Lengkap", required: true, placeholder: "Nama pengguna", width: 6 },
        { name: "username", label: "Username", required: true, placeholder: "username unik", width: 6 },
        { name: "password", label: "Password", type: "password", requiredOnCreate: true, placeholder: "Minimal 6 karakter", hint: "Saat mengedit, kosongkan jika password tidak ingin diubah.", width: 12 },
        { name: "role", label: "Role / Hak Akses", type: "selectStatic", options: [{ value: "admin", label: "Administrator" }, { value: "gudang", label: "Petugas Gudang" }, { value: "kasir", label: "Kasir" }], required: true, width: 6 },
        { name: "status", label: "Status Akun", type: "selectStatic", options: [{ value: "Aktif", label: "Aktif" }, { value: "Nonaktif", label: "Nonaktif" }], required: true, width: 6 }
      ]
    }
  };

  function getRows(moduleKey = currentModule) {
    return moduleKey === "pengguna" ? getUsers() : getData(moduleKey);
  }
  function saveRows(moduleKey, rows) {
    if (moduleKey === "pengguna") setUsers(rows); else setData(moduleKey, rows);
  }
  function canManage() { return permissions.canManage && permissions.modules.includes(currentModule); }
  function availableModules() { return permissions.modules; }
  function updateUserDetails() {
    const name = user.nama || user.username;
    document.getElementById("sideUserName").textContent = name;
    document.getElementById("sideUserRole").textContent = permissions.label;
    document.getElementById("topRole").textContent = permissions.label;
    document.getElementById("userAvatar").textContent = name.charAt(0).toUpperCase();
    document.getElementById("topAvatar").textContent = name.charAt(0).toUpperCase();
    document.getElementById("logoutBtn").addEventListener("click", logout);
    document.getElementById("tab-pengguna").classList.toggle("d-none", !permissions.modules.includes("pengguna"));
    document.getElementById("sidebarUsers").classList.toggle("d-none", user.role !== "admin");
    if (!permissions.modules.includes("pengguna")) document.getElementById("permissionNote").innerHTML = '<i class="bi bi-shield-lock"></i><span>Menu yang tersedia mengikuti role akun yang sedang masuk.</span>';
  }
  function renderCounts() {
    ["barang", "satuan", "kategori", "supplier"].forEach(key => {
      const el = document.getElementById(`count-${key}`);
      if (el) el.textContent = getData(key).length;
    });
    const userCount = document.getElementById("count-pengguna");
    if (userCount) userCount.textContent = getUsers().length;
  }
  function showToast(message, isError = false) {
    const toastEl = document.getElementById("appToast");
    toastEl.classList.toggle("text-bg-danger", isError);
    toastEl.classList.toggle("text-bg-white", !isError);
    document.getElementById("toastMessage").textContent = message;
    toast.show();
  }
  function selectModule(moduleKey) {
    if (!MODULES[moduleKey] || !availableModules().includes(moduleKey)) moduleKey = availableModules()[0] || "barang";
    currentModule = moduleKey;
    searchInput.value = "";
    tabsEl.querySelectorAll("[data-module]").forEach(tab => tab.classList.toggle("active", tab.dataset.module === moduleKey));
    document.getElementById("moduleTitle").textContent = MODULES[moduleKey].title;
    document.getElementById("moduleDescription").textContent = MODULES[moduleKey].description;
    addButton.classList.toggle("d-none", !canManage());
    searchInput.placeholder = `Cari ${MODULES[moduleKey].singular}...`;
    if (moduleKey === "pengguna") document.getElementById("permissionNote").innerHTML = '<i class="bi bi-shield-lock"></i><span>Hanya Administrator yang dapat mengelola akun dan hak akses pengguna.</span>';
    else if (!permissions.canManage) document.getElementById("permissionNote").innerHTML = '<i class="bi bi-eye"></i><span>Role Kasir memiliki akses lihat saja untuk data barang.</span>';
    else document.getElementById("permissionNote").innerHTML = '<i class="bi bi-info-circle"></i><span>Gunakan tombol aksi pada tabel untuk mengubah atau menghapus data.</span>';
    try { history.replaceState(null, "", `#${moduleKey}`); } catch { /* Navigation tetap berfungsi tanpa hash */ }
    renderTable();
    renderCounts();
  }
  function getSearchText(row) {
    const values = Object.values(row).map(value => String(value ?? ""));
    if (currentModule === "barang") values.push(getRecordName("kategori", row.kategoriId), getRecordName("satuan", row.satuanId), getRecordName("supplier", row.supplierId));
    if (currentModule === "pengguna") values.push(ROLE_PERMISSIONS[row.role]?.label || "");
    return values.join(" ").toLowerCase();
  }
  function renderTable() {
    const config = MODULES[currentModule];
    const query = searchInput.value.trim().toLowerCase();
    const allRows = getRows();
    const rows = allRows.filter(row => getSearchText(row).includes(query));
    const canEdit = canManage();
    const headers = config.columns.map(col => `<th scope="col">${escapeHtml(col.label)}</th>`).join("");
    const actionHeader = canEdit ? '<th scope="col" class="text-end">Aksi</th>' : "";
    let body;
    if (!rows.length) {
      body = `<tr><td colspan="${config.columns.length + (canEdit ? 1 : 0)}"><div class="empty-state"><i class="bi bi-search"></i><strong>${query ? "Data tidak ditemukan" : "Belum ada data"}</strong><span class="small">${query ? "Coba kata kunci lain." : "Klik tombol Tambah Data untuk memulai."}</span></div></td></tr>`;
    } else {
      body = rows.map(row => `<tr>${config.columns.map(col => `<td>${col.render(row)}</td>`).join("")}${canEdit ? `<td><div class="d-flex justify-content-end gap-1"><button type="button" class="action-btn" data-action="edit" data-id="${escapeHtml(row.id)}" title="Edit data" aria-label="Edit data"><i class="bi bi-pencil"></i></button><button type="button" class="action-btn danger" data-action="delete" data-id="${escapeHtml(row.id)}" title="Hapus data" aria-label="Hapus data"><i class="bi bi-trash3"></i></button></div></td>` : ""}</tr>`).join("");
    }
    tableContainer.innerHTML = `<table class="table"><thead><tr>${headers}${actionHeader}</tr></thead><tbody>${body}</tbody></table>`;
    document.getElementById("resultSummary").textContent = `Menampilkan ${rows.length} dari ${allRows.length} data`;
  }
  function fieldControl(field, value) {
    const required = field.required || (field.requiredOnCreate && !editingId);
    const common = `name="${escapeHtml(field.name)}" id="field-${escapeHtml(field.name)}" class="form-control" ${required ? "required" : ""} ${field.min !== undefined ? `min="${field.min}"` : ""} ${field.placeholder ? `placeholder="${escapeHtml(field.placeholder)}"` : ""}`;
    if (field.type === "textarea") return `<textarea ${common} rows="3">${escapeHtml(value)}</textarea>`;
    if (field.type === "select" || field.type === "selectStatic") {
      const options = field.type === "select" ? getData(field.optionsFrom).map(item => ({ value: item.id, label: item.nama || item.singkatan })) : field.options;
      const optionsHtml = options.map(option => `<option value="${escapeHtml(option.value)}" ${String(option.value) === String(value) ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("");
      return `<select ${common}><option value="">Pilih ${escapeHtml(field.label.toLowerCase())}</option>${optionsHtml}</select>`;
    }
    return `<input ${common} type="${escapeHtml(field.type || "text")}" value="${escapeHtml(value)}" ${field.type === "number" ? 'step="1" inputmode="numeric"' : ""} autocomplete="${field.name === "password" ? "new-password" : "off"}" />`;
  }
  function openForm(recordId = null) {
    if (!canManage()) return;
    editingId = recordId;
    const row = recordId ? getRows().find(item => item.id === recordId) : null;
    if (recordId && !row) { showToast("Data tidak ditemukan.", true); return; }
    recordForm.reset(); formError.classList.add("d-none"); formError.textContent = "";
    document.getElementById("modalTitle").textContent = `${row ? "Edit" : "Tambah"} ${MODULES[currentModule].singular.charAt(0).toUpperCase()}${MODULES[currentModule].singular.slice(1)}`;
    document.getElementById("modalDescription").textContent = row ? "Perbarui informasi di bawah ini." : "Isi informasi yang diperlukan untuk menambahkan data.";
    document.getElementById("saveButton").innerHTML = `<i class="bi bi-check2 me-1"></i>${row ? "Simpan Perubahan" : "Simpan Data"}`;
    fieldsContainer.innerHTML = MODULES[currentModule].fields.map(field => {
      const value = row && field.name !== "password" ? row[field.name] ?? "" : "";
      return `<div class="col-md-${field.width || 6}"><label class="form-label fw-semibold small" for="field-${escapeHtml(field.name)}">${escapeHtml(field.label)}${field.required || (field.requiredOnCreate && !row) ? ' <span class="text-danger">*</span>' : ""}</label>${fieldControl(field, value)}${field.hint ? `<div class="field-hint">${escapeHtml(field.hint)}</div>` : ""}</div>`;
    }).join("");
    if (row && currentModule === "pengguna") document.getElementById("field-password").required = false;
    modal.show();
    window.setTimeout(() => fieldsContainer.querySelector("input,select,textarea")?.focus(), 150);
  }
  function showFormError(message) {
    formError.textContent = message;
    formError.classList.remove("d-none");
  }
  function validateValues(values, oldRow) {
    const config = MODULES[currentModule];
    for (const field of config.fields) {
      if ((field.required || (field.requiredOnCreate && !oldRow)) && !String(values[field.name] ?? "").trim()) return `${field.label} wajib diisi.`;
      if (field.type === "number" && values[field.name] !== "" && Number(values[field.name]) < (field.min || 0)) return `${field.label} tidak boleh kurang dari ${field.min || 0}.`;
    }
    if (currentModule === "barang") {
      if (!getData("kategori").some(row => row.id === values.kategoriId)) return "Pilih kategori produk yang valid.";
      if (!getData("satuan").some(row => row.id === values.satuanId)) return "Pilih satuan yang valid.";
      if (!getData("supplier").some(row => row.id === values.supplierId)) return "Pilih supplier yang valid.";
    }
    if (["barang", "supplier"].includes(currentModule)) {
      const duplicate = getRows().some(row => row.id !== (oldRow?.id) && String(row.kode).toLowerCase() === String(values.kode).trim().toLowerCase());
      if (duplicate) return "Kode sudah digunakan. Masukkan kode yang berbeda.";
    }
    if (["satuan", "kategori"].includes(currentModule)) {
      const key = currentModule === "satuan" ? "singkatan" : "nama";
      const duplicate = getRows().some(row => row.id !== oldRow?.id && String(row[key]).toLowerCase() === String(values[key]).trim().toLowerCase());
      if (duplicate) return `${config.fields.find(field => field.name === key).label} sudah digunakan.`;
    }
    if (currentModule === "pengguna") {
      const duplicateUsername = getUsers().some(item => item.id !== oldRow?.id && item.username.toLowerCase() === String(values.username).trim().toLowerCase());
      if (duplicateUsername) return "Username sudah digunakan oleh akun lain.";
      if (!oldRow && String(values.password || "").length < 6) return "Password baru minimal 6 karakter.";
      if (oldRow && values.password && String(values.password).length < 6) return "Password minimal 6 karakter.";
      if (oldRow?.id === user.id && values.status !== "Aktif") return "Akun yang sedang digunakan tidak dapat dinonaktifkan.";
      if (oldRow?.id === user.id && values.role !== user.role) return "Role akun yang sedang digunakan tidak dapat diubah dari sesi ini.";
      if (oldRow?.role === "admin" && oldRow.status === "Aktif" && (values.role !== "admin" || values.status !== "Aktif")) {
        const otherActiveAdmins = getUsers().filter(item => item.id !== oldRow.id && item.role === "admin" && item.status === "Aktif").length;
        if (otherActiveAdmins === 0) return "Sistem harus memiliki minimal satu Administrator aktif.";
      }
    }
    return "";
  }
  function handleSave(event) {
    event.preventDefault();
    if (!canManage()) return;
    formError.classList.add("d-none");
    const formData = new FormData(recordForm);
    const values = {};
    MODULES[currentModule].fields.forEach(field => { values[field.name] = String(formData.get(field.name) ?? "").trim(); });
    const rows = getRows();
    const oldRow = editingId ? rows.find(row => row.id === editingId) : null;
    const validationError = validateValues(values, oldRow);
    if (validationError) { showFormError(validationError); return; }
    const numericFields = MODULES[currentModule].fields.filter(field => field.type === "number").map(field => field.name);
    numericFields.forEach(key => { values[key] = Number(values[key]); });
    if (currentModule === "pengguna") {
      values.username = values.username.trim();
      if (!values.password && oldRow) values.password = oldRow.password;
    }
    const savedRecord = { ...(oldRow || {}), ...values, id: oldRow?.id || makeId(MODULES[currentModule].prefix.toLowerCase()) };
    const nextRows = oldRow ? rows.map(row => row.id === oldRow.id ? savedRecord : row) : [...rows, savedRecord];
    saveRows(currentModule, nextRows);
    if (currentModule === "pengguna" && savedRecord.id === user.id) {
      user.nama = savedRecord.nama;
      user.username = savedRecord.username;
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    }
    modal.hide();
    renderTable(); renderCounts();
    const action = oldRow ? "diperbarui" : "ditambahkan";
    showToast(`${MODULES[currentModule].singular.charAt(0).toUpperCase()}${MODULES[currentModule].singular.slice(1)} berhasil ${action}.`);
  }
  function dependencyError(moduleKey, id) {
    const names = { kategori: "kategori", satuan: "satuan", supplier: "supplier" };
    if (moduleKey === "kategori" && getData("barang").some(row => row.kategoriId === id)) return "Kategori masih digunakan oleh data barang. Ubah kategori barang terkait terlebih dahulu.";
    if (moduleKey === "satuan" && getData("barang").some(row => row.satuanId === id)) return "Satuan masih digunakan oleh data barang. Ubah satuan barang terkait terlebih dahulu.";
    if (moduleKey === "supplier" && getData("barang").some(row => row.supplierId === id)) return "Supplier masih digunakan oleh data barang. Ubah supplier barang terkait terlebih dahulu.";
    if (moduleKey === "pengguna") {
      const row = getUsers().find(item => item.id === id);
      if (id === user.id) return "Akun yang sedang digunakan tidak dapat dihapus.";
      if (row?.role === "admin" && row.status === "Aktif" && getUsers().filter(item => item.id !== id && item.role === "admin" && item.status === "Aktif").length === 0) return "Tidak dapat menghapus Administrator aktif terakhir.";
    }
    return "";
  }
  function deleteRecord(recordId) {
    if (!canManage()) return;
    const row = getRows().find(item => item.id === recordId);
    if (!row) { showToast("Data tidak ditemukan.", true); return; }
    const blocker = dependencyError(currentModule, recordId);
    if (blocker) { showToast(blocker, true); return; }
    const displayName = row.nama || row.kode || row.username || "data ini";
    if (!window.confirm(`Hapus ${displayName}? Data yang dihapus tidak dapat dikembalikan.`)) return;
    saveRows(currentModule, getRows().filter(item => item.id !== recordId));
    renderTable(); renderCounts();
    showToast(`${MODULES[currentModule].singular.charAt(0).toUpperCase()}${MODULES[currentModule].singular.slice(1)} berhasil dihapus.`);
  }

  tabsEl.addEventListener("click", event => {
    const tab = event.target.closest("[data-module]");
    if (tab) selectModule(tab.dataset.module);
  });
  addButton.addEventListener("click", () => openForm());
  searchInput.addEventListener("input", renderTable);
  tableContainer.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    if (button.dataset.action === "edit") openForm(button.dataset.id);
    if (button.dataset.action === "delete") deleteRecord(button.dataset.id);
  });
  recordForm.addEventListener("submit", handleSave);
  window.addEventListener("hashchange", () => {
    const target = window.location.hash.replace("#", "");
    if (target && target !== currentModule) selectModule(target);
  });

  updateUserDetails();
  selectModule(window.location.hash.replace("#", "") || "barang");
})();
