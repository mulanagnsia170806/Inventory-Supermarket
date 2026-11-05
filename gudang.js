
document.addEventListener("DOMContentLoaded", function () {
  initializeData();

  const form = document.getElementById("formBarangMasuk");
  const tabelStok = document.getElementById("tabelStok");
  const tabelHistori = document.getElementById("tabelHistori");
  const btnFilter = document.getElementById("btnFilter");
  const btnReset = document.getElementById("btnReset");

  const KEY_HISTORI = "inventory_pos_barang_masuk";

  function ambilHistori() {
    try {
      const data = JSON.parse(
        localStorage.getItem(KEY_HISTORI) || "[]"
      );
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function simpanHistori(data) {
    localStorage.setItem(KEY_HISTORI, JSON.stringify(data));
  }

  function tampilkanStok() {
    const barang = getData("barang");

    tabelStok.innerHTML = barang.map(function (item) {
      const stok = Number(item.stok) || 0;
      const minimum = Number(item.minimum) || 0;

      let status;
      let kelas;

      if (stok < minimum) {
        status = "Merah (Stok Menipis)";
        kelas = "bg-danger-subtle text-danger border border-danger-subtle";
      } else if (stok === minimum) {
        status = "Kuning (Batas)";
        kelas = "bg-warning-subtle text-warning-emphasis border border-warning-subtle";
      } else {
        status = "Hijau (Aman)";
        kelas = "bg-success-subtle text-success border border-success-subtle";
      }

      return `
        <tr>
          <td class="ps-3 fw-semibold">${escapeHtml(item.nama)}</td>
          <td class="fw-bold">${stok}</td>
          <td>${minimum}</td>
          <td class="pe-3">
            <span class="badge ${kelas}">${status}</span>
          </td>
        </tr>
      `;
    }).join("");
  }

  function tampilkanHistori() {
    const histori = ambilHistori();

    if (histori.length === 0) {
      tabelHistori.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-secondary py-3">
            Belum ada riwayat barang masuk baru.
          </td>
        </tr>
      `;
      return;
    }

    tabelHistori.innerHTML = histori.slice().reverse().map(function (item) {
      return `
        <tr class="histori-row" data-tanggal="${escapeHtml(item.tanggal)}">
          <td class="ps-3">${escapeHtml(item.tanggal)}</td>
          <td>${escapeHtml(item.supplier)}</td>
          <td class="fw-semibold">${escapeHtml(item.namaBarang)}</td>
          <td class="pe-3 text-primary fw-bold">+${Number(item.qty)}</td>
        </tr>
      `;
    }).join("");
  }

  // Barang masuk menggunakan sumber stok utama.
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const supplier = document.getElementById("supplier").value;
      const namaBarang = document.getElementById("barang").value;
      const tanggal = document.getElementById("tanggalDatang").value;
      const kuantitas = Number(
        document.getElementById("kuantitas").value
      );

      if (!supplier || !namaBarang || !tanggal ||
          !Number.isInteger(kuantitas) || kuantitas < 1) {
        alert("Lengkapi semua data dan masukkan kuantitas minimal 1.");
        return;
      }

      const barang = getData("barang");
      const indeks = barang.findIndex(
        item => item.nama === namaBarang
      );

      if (indeks === -1) {
        alert("Barang tidak ditemukan pada Master Data.");
        return;
      }

      const stokLama = Number(barang[indeks].stok) || 0;

      // Siapkan data stok baru tanpa mengubah data asli dahulu.
      const stokBaru = barang.map(function (item, i) {
        if (i !== indeks) return item;

        return {
          ...item,
          stok: stokLama + kuantitas
        };
      });

      const historiLama = ambilHistori();
      const historiBaru = [
        ...historiLama,
        {
          tanggal,
          supplier,
          namaBarang,
          qty: kuantitas
        }
      ];

      // Simpan kedua data. Jika gagal, kembalikan riwayat semula.
      try {
        simpanHistori(historiBaru);

        try {
          setData("barang", stokBaru);
        } catch (error) {
          simpanHistori(historiLama);
          throw error;
        }
      } catch (error) {
        alert("Gagal menyimpan data. Silakan coba kembali.");
        return;
      }

      tampilkanStok();
      tampilkanHistori();
      form.reset();

      alert(
        `Stok ${namaBarang} berhasil ditambah ${kuantitas} unit.`
      );
    });
  }

  // Filter riwayat berdasarkan rentang tanggal.
  if (btnFilter) {
    btnFilter.addEventListener("click", function () {
      const dari = document.getElementById("filterDari").value;
      const sampai = document.getElementById("filterSampai").value;

      document.querySelectorAll(".histori-row").forEach(function (row) {
        const tanggal = row.dataset.tanggal;

        const diLuarRentang =
          (dari && tanggal < dari) ||
          (sampai && tanggal > sampai);

        row.style.display = diLuarRentang ? "none" : "";
      });
    });
  }

  // Reset filter tanpa menghapus riwayat.
  if (btnReset) {
    btnReset.addEventListener("click", function () {
      document.getElementById("filterDari").value = "";
      document.getElementById("filterSampai").value = "";

      document.querySelectorAll(".histori-row").forEach(function (row) {
        row.style.display = "";
      });
    });
  }

  // Tampilkan data terbaru ketika halaman dibuka.
  tampilkanStok();
  tampilkanHistori();
});