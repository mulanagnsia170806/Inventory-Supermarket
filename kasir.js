
(function () {
  const user = requireLogin();
  if (!user) return;

  initializeData();

  const daftarProdukEl = document.getElementById("daftarProduk");
  const cariProdukEl = document.getElementById("cariProduk");
  const jumlahProdukEl = document.getElementById("jumlahProduk");
  const daftarKeranjangEl = document.getElementById("daftarKeranjang");
  const totalBelanjaEl = document.getElementById("totalBelanja");
  const uangBayarEl = document.getElementById("uangBayar");
  const uangKembalianEl = document.getElementById("uangKembalian");
  const pesanKasirEl = document.getElementById("pesanKasir");
  const btnKosongkan = document.getElementById("btnKosongkan");

  // Keranjang disimpan sementara selama halaman terbuka.
  let keranjang = [];

  function ambilBarang() {
    return getData("barang");
  }

  function tampilkanPesan(pesan, tipe = "danger") {
    pesanKasirEl.textContent = pesan;
    pesanKasirEl.className = `alert alert-${tipe} mt-3 mb-0`;
  }

  function sembunyikanPesan() {
    pesanKasirEl.classList.add("d-none");
  }

  function rupiah(nilai) {
    return formatRupiah(nilai);
  }

  // Menampilkan daftar produk.
  function tampilkanProduk(kataKunci = "") {
    const semuaBarang = ambilBarang();

    const hasil = semuaBarang.filter(function (barang) {
      const kata = kataKunci.toLowerCase();

      return (
        String(barang.nama || "").toLowerCase().includes(kata) ||
        String(barang.kode || "").toLowerCase().includes(kata)
      );
    });

    jumlahProdukEl.textContent = `${hasil.length} produk`;

    if (hasil.length === 0) {
      daftarProdukEl.innerHTML = `
        <div class="col-12 text-center text-secondary py-5">
          Produk tidak ditemukan.
        </div>`;
      return;
    }

    daftarProdukEl.innerHTML = hasil.map(function (barang) {
      return `
        <div class="col-sm-6 col-xl-4">
          <div class="produk-card">
            <div class="small text-secondary mb-1">
              ${escapeHtml(barang.kode)}
            </div>

            <h6 class="fw-bold">
              ${escapeHtml(barang.nama)}
            </h6>

            <div class="fw-semibold mb-2">
              ${rupiah(barang.hargaJual)}
            </div>

            <div class="small text-secondary mb-3">
              Stok tersedia: ${Number(barang.stok)}
            </div>

            <button
              type="button"
              class="btn btn-kasir btn-sm w-100"
              data-tambah="${escapeHtml(barang.id)}"
              ${Number(barang.stok) <= 0 ? "disabled" : ""}
            >
              <i class="bi bi-plus-lg me-1"></i>
              Tambah ke Keranjang
            </button>
          </div>
        </div>`;
    }).join("");
  }

  // Menambahkan produk ke keranjang.
  function tambahKeKeranjang(idBarang) {
    sembunyikanPesan();

    const barang = ambilBarang().find(item => item.id === idBarang);

    if (!barang) {
      tampilkanPesan("Barang tidak ditemukan.");
      return;
    }

    const itemKeranjang = keranjang.find(item => item.id === idBarang);
    const jumlahSaatIni = itemKeranjang ? itemKeranjang.qty : 0;

    if (jumlahSaatIni + 1 > Number(barang.stok)) {
      tampilkanPesan(`Stok ${barang.nama} tidak mencukupi.`);
      return;
    }

    if (itemKeranjang) {
      itemKeranjang.qty += 1;
    } else {
      keranjang.push({
        id: barang.id,
        kode: barang.kode,
        nama: barang.nama,
        harga: Number(barang.hargaJual),
        stokAwal: Number(barang.stok),
        qty: 1
      });
    }

    tampilkanKeranjang();
  }

  // Mengubah jumlah barang di keranjang.
  function ubahJumlah(idBarang, perubahan) {
    const item = keranjang.find(item => item.id === idBarang);
    if (!item) return;

    const jumlahBaru = item.qty + perubahan;

    if (jumlahBaru <= 0) {
      hapusDariKeranjang(idBarang);
      return;
    }

    const barangTerbaru = ambilBarang().find(
      barang => barang.id === idBarang
    );

    if (!barangTerbaru || jumlahBaru > Number(barangTerbaru.stok)) {
      tampilkanPesan("Jumlah melebihi stok yang tersedia.");
      return;
    }

    item.qty = jumlahBaru;
    tampilkanKeranjang();
  }

  // Menghapus produk dari keranjang.
  function hapusDariKeranjang(idBarang) {
    keranjang = keranjang.filter(item => item.id !== idBarang);
    tampilkanKeranjang();
  }

  // Menghitung total dan menampilkan isi keranjang.
  function tampilkanKeranjang() {
    if (keranjang.length === 0) {
      daftarKeranjangEl.innerHTML = `
        <div class="text-center text-secondary py-5">
          <i class="bi bi-cart fs-1 d-block mb-2"></i>
          Keranjang masih kosong.
        </div>`;
    } else {
      daftarKeranjangEl.innerHTML = keranjang.map(function (item) {
        const subtotal = item.harga * item.qty;

        return `
          <div class="border rounded-3 p-3 mb-3">
            <div class="d-flex justify-content-between gap-2">
              <div>
                <div class="fw-bold">${escapeHtml(item.nama)}</div>
                <div class="small text-secondary">
                  ${rupiah(item.harga)} per item
                </div>
              </div>

              <button
                type="button"
                class="btn btn-sm btn-outline-danger align-self-start"
                data-hapus="${escapeHtml(item.id)}"
                aria-label="Hapus ${escapeHtml(item.nama)}"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-3">
              <div class="btn-group btn-group-sm">
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  data-kurang="${escapeHtml(item.id)}"
                >−</button>

                <button type="button" class="btn btn-light" disabled>
                  ${item.qty}
                </button>

                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  data-tambah-jumlah="${escapeHtml(item.id)}"
                >+</button>
              </div>

              <strong>${rupiah(subtotal)}</strong>
            </div>
          </div>`;
      }).join("");
    }

    const total = keranjang.reduce(
      (jumlah, item) => jumlah + item.harga * item.qty,
      0
    );

    totalBelanjaEl.textContent = rupiah(total);
    hitungKembalian();
    tampilkanProduk(cariProdukEl.value);
  }

  // Menghitung kembalian sementara.
  function hitungKembalian() {
    const total = keranjang.reduce(
      (jumlah, item) => jumlah + item.harga * item.qty,
      0
    );

    const bayar = Number(uangBayarEl.value) || 0;
    const kembalian = Math.max(0, bayar - total);

    uangKembalianEl.textContent = rupiah(kembalian);
  }

  // Event tombol tambah pada daftar produk.
  daftarProdukEl.addEventListener("click", function (event) {
    const tombol = event.target.closest("[data-tambah]");
    if (tombol) tambahKeKeranjang(tombol.dataset.tambah);
  });

  // Event tombol dalam keranjang.
  daftarKeranjangEl.addEventListener("click", function (event) {
    const hapus = event.target.closest("[data-hapus]");
    const kurang = event.target.closest("[data-kurang]");
    const tambah = event.target.closest("[data-tambah-jumlah]");

    if (hapus) hapusDariKeranjang(hapus.dataset.hapus);
    if (kurang) ubahJumlah(kurang.dataset.kurang, -1);
    if (tambah) ubahJumlah(tambah.dataset.tambahJumlah, 1);
  });

  cariProdukEl.addEventListener("input", function () {
    tampilkanProduk(this.value);
  });

  uangBayarEl.addEventListener("input", hitungKembalian);

  btnKosongkan.addEventListener("click", function () {
    keranjang = [];
    tampilkanKeranjang();
    sembunyikanPesan();
  });

  
  // Menyimpan transaksi dan memperbarui stok barang.
  function prosesCheckout() {
    sembunyikanPesan();

    if (keranjang.length === 0) {
      tampilkanPesan("Keranjang masih kosong.");
      return;
    }

    const total = keranjang.reduce(
      (jumlah, item) => jumlah + item.harga * item.qty,
      0
    );

    const bayar = Number(uangBayarEl.value);

    if (!Number.isFinite(bayar) || bayar < total) {
      tampilkanPesan("Uang pembayaran belum mencukupi.");
      return;
    }

    // Ambil data terbaru, lalu periksa semua stok sebelum mengubahnya.
    const barangTerbaru = getData("barang");

    for (const item of keranjang) {
      const barang = barangTerbaru.find(
        produk => produk.id === item.id
      );

      if (!barang) {
        tampilkanPesan(`Barang ${item.nama} tidak ditemukan lagi.`);
        return;
      }

      if (Number(barang.stok) < item.qty) {
        tampilkanPesan(
          `Stok ${barang.nama} tidak cukup. Stok saat ini: ${barang.stok}.`
        );
        tampilkanProduk(cariProdukEl.value);
        return;
      }
    }

    // Buat salinan data dan kurangi stok pada salinan tersebut.
    const stokBaru = barangTerbaru.map(function (barang) {
      const item = keranjang.find(
        produk => produk.id === barang.id
      );

      if (!item) return barang;

      return {
        ...barang,
        stok: Number(barang.stok) - item.qty
      };
    });

    const waktu = new Date();
    const nomorNota =
      "POS-" +
      waktu.getFullYear() +
      String(waktu.getMonth() + 1).padStart(2, "0") +
      String(waktu.getDate()).padStart(2, "0") +
      "-" +
      waktu.getTime();

    const transaksi = {
      noNota: nomorNota,
      tanggal: waktu.toISOString(),
      kasir: user.nama || user.username,
      items: keranjang.map(item => ({
        id: item.id,
        kode: item.kode,
        nama: item.nama,
        harga: item.harga,
        qty: item.qty,
        subtotal: item.harga * item.qty
      })),
      total: total,
      bayar: bayar,
      kembalian: bayar - total
    };

    // Simpan riwayat lebih dahulu. Jika gagal, stok belum berubah.
    let riwayat;
    try {
      riwayat = JSON.parse(
        localStorage.getItem("inventory_pos_transaksi") || "[]"
      );

      if (!Array.isArray(riwayat)) {
        throw new Error("Format riwayat transaksi tidak valid.");
      }

      localStorage.setItem(
        "inventory_pos_transaksi",
        JSON.stringify([...riwayat, transaksi])
      );
    } catch (error) {
      tampilkanPesan(
        "Transaksi gagal disimpan. Periksa kapasitas penyimpanan browser."
      );
      return;
    }

    // Perbarui stok melalui sumber data utama proyek.
    try {
      setData("barang", stokBaru);
    } catch (error) {
      // Batalkan penambahan riwayat jika penulisan stok gagal.
      localStorage.setItem(
        "inventory_pos_transaksi",
        JSON.stringify(riwayat)
      );

      tampilkanPesan("Stok gagal diperbarui. Transaksi dibatalkan.");
      return;
    }

    // Simpan data struk untuk tahap cetak berikutnya.
    window.transaksiTerakhir = transaksi;
    document.getElementById("btnCetakStruk").disabled = false;

    keranjang = [];
    uangBayarEl.value = "";

    tampilkanKeranjang();
    tampilkanProduk(cariProdukEl.value);

    tampilkanPesan(
      `Transaksi ${nomorNota} berhasil. Kembalian: ${rupiah(transaksi.kembalian)}.`,
      "success"
    );
  }

  // Hubungkan fungsi checkout dengan tombol pembayaran.
  document
    .getElementById("btnCheckout")
    .addEventListener("click", prosesCheckout);
  
  // Membuat dan mencetak struk transaksi terakhir.
  function cetakStruk() {
    const transaksi = window.transaksiTerakhir;

    if (!transaksi) {
      tampilkanPesan(
        "Belum ada transaksi yang berhasil untuk dicetak."
      );
      return;
    }

    const areaStruk = document.getElementById("areaStruk");
    const tanggal = new Date(transaksi.tanggal);

    const tanggalFormat = tanggal.toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const daftarItem = transaksi.items.map(function (item) {
      return `
        <tr>
          <td colspan="2">
            ${escapeHtml(item.nama)}
            <br>
            <small>
              ${item.qty} x ${rupiah(item.harga)}
            </small>
          </td>
          <td class="angka">
            ${rupiah(item.subtotal)}
          </td>
        </tr>
      `;
    }).join("");

    areaStruk.innerHTML = `
      <div class="struk">
        <div class="tengah">
          <h3 style="margin-bottom: 4px;">StockPilot</h3>
          <div>Sistem Inventory & POS</div>
          <div class="garis"></div>
          <strong>STRUK PEMBELIAN</strong>
        </div>

        <div class="garis"></div>

        <div>No. Nota: ${escapeHtml(transaksi.noNota)}</div>
        <div>Tanggal: ${escapeHtml(tanggalFormat)}</div>
        <div>Kasir: ${escapeHtml(transaksi.kasir)}</div>

        <div class="garis"></div>

        <table>
          <tbody>
            ${daftarItem}
          </tbody>
        </table>

        <div class="garis"></div>

        <table>
          <tbody>
            <tr>
              <td>Total Belanja</td>
              <td class="angka">
                <strong>${rupiah(transaksi.total)}</strong>
              </td>
            </tr>
            <tr>
              <td>Pembayaran</td>
              <td class="angka">${rupiah(transaksi.bayar)}</td>
            </tr>
            <tr>
              <td>Kembalian</td>
              <td class="angka">
                <strong>${rupiah(transaksi.kembalian)}</strong>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="garis"></div>

        <div class="tengah">
          Terima kasih telah berbelanja!
          <br>
          Simpan struk ini sebagai bukti transaksi.
        </div>
      </div>
    `;

    window.print();
  }

  // Hubungkan tombol cetak ke fungsi.
  document
    .getElementById("btnCetakStruk")
    .addEventListener("click", cetakStruk);
  
  tampilkanProduk();
  tampilkanKeranjang();
})();