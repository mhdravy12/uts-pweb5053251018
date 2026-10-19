/* =====================================================
   DATA
   Satu transaksi: { id, tanggal, jenis, kategori, nominal, catatan }
   ===================================================== */
let transaksi = [];   // semua transaksi


const formTransaksi = document.getElementById("form-transaksi");
const isiTabel = document.getElementById("isi-tabel");

/* =====================================================
   FUNGSI BANTU (dipakai beberapa fitur)
   ===================================================== */
function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

// Tanggal hari ini dalam format "2026-10-19"
function tanggalHariIni() {
  const sekarang = new Date();
  const bulan = String(sekarang.getMonth() + 1).padStart(2, "0");
  const hari = String(sekarang.getDate()).padStart(2, "0");
  return sekarang.getFullYear() + "-" + bulan + "-" + hari;
}

/* tambah transaksi */
formTransaksi.addEventListener("submit", function (e) {
  e.preventDefault(); // cegah halaman reload

  const tanggal = document.getElementById("tanggal").value;
  const nominal = Number(document.getElementById("nominal").value);

  transaksi.push({
    id: Date.now(),
    tanggal: tanggal,
    jenis: document.getElementById("jenis").value,
    kategori: document.getElementById("kategori").value,
    nominal: nominal, // angka, bukan teks
    catatan: document.getElementById("catatan").value.trim(),
  });

  render();     // W2
  formTransaksi.reset();
  document.getElementById("tanggal").value = tanggalHariIni();
});

/* daftar transaksi*/
function renderDaftar() {
  isiTabel.replaceChildren(); // kosongkan dulu supaya tidak dobel

  if (transaksi.length === 0) {
    isiTabel.innerHTML = '<tr><td colspan="5" class="kosong">Belum ada transaksi.</td></tr>';
    return;
  }

  // Urut: tanggal terbaru dulu; kalau tanggal sama, yang dibuat belakangan dulu
  const urut = [...transaksi].sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.id - a.id);

  urut.forEach((t) => {
    const baris = document.createElement("tr");
    const tanda = t.jenis === "pemasukan" ? "+ " : "- ";
    const kelas = t.jenis === "pemasukan" ? "nominal-masuk" : "nominal-keluar";

    // textContent (bukan innerHTML) supaya input pengguna aman
    const isi = [t.tanggal, t.kategori, t.catatan || "-", tanda + formatRupiah(t.nominal)];
    isi.forEach((teks, i) => {
      const sel = document.createElement("td");
      sel.textContent = teks;
      if (i === 3) sel.className = "kanan " + kelas;
      baris.append(sel);
    });

    const selAksi = document.createElement("td");
    const tombol = document.createElement("button");
    tombol.type = "button";
    tombol.className = "tombol-hapus";
    tombol.textContent = "Hapus";
    tombol.dataset.id = t.id; // simpan id di tombolnya
    selAksi.append(tombol);
    baris.append(selAksi);

    isiTabel.append(baris);
  });
}

// Dipanggil setiap data berubah, supaya semua tampilan ikut diperbarui
function render() {
  renderDaftar();
}

/* mulai*/
document.getElementById("tanggal").value = tanggalHariIni();
render();