/* =====================================================
   DATA
   Satu transaksi: { id, tanggal, jenis, kategori, nominal, catatan }
   ===================================================== */
let transaksi = [];   // semua transaksi
let uangBulanan = 0;  // uang bulanan dari orang tua

/* =====================================================
   ELEMEN HTML YANG DIPAKAI
   ===================================================== */
const formTransaksi = document.getElementById("form-transaksi");
const isiTabel = document.getElementById("isi-tabel");
const pesanForm = document.getElementById("pesan-form");
const formUang = document.getElementById("form-uang-bulanan");
const pesanUang = document.getElementById("pesan-uang-bulanan");

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

/* w1 tambah transaksi*/
formTransaksi.addEventListener("submit", function (e) {
  e.preventDefault(); // cegah halaman reload

  const tanggal = document.getElementById("tanggal").value;
  const nominal = Number(document.getElementById("nominal").value);

  // W6: validasi sebelum masuk data
  if (tanggal === "") {
    tampilkanPesan(pesanForm, "Tanggal wajib diisi.", "galat");
    return;
  }
  if (nominal <= 0) {
    tampilkanPesan(pesanForm, "Nominal harus lebih dari 0.", "galat");
    return;
  }

  transaksi.push({
    id: Date.now(),
    tanggal: tanggal,
    jenis: document.getElementById("jenis").value,
    kategori: document.getElementById("kategori").value,
    nominal: nominal, // angka, bukan teks
    catatan: document.getElementById("catatan").value.trim(),
  });

  simpanData(); // W4
  render();     // W2
  tampilkanPesan(pesanForm, "Transaksi tersimpan.", "sukses");
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
  renderRingkasan();  // W5
  renderJatah();      // fitur khas
}

/* hapus transaksi */
isiTabel.addEventListener("click", function (e) {
  const id = e.target.dataset.id; // hanya tombol Hapus yang punya data-id
  if (!id) return;

  if (confirm("Yakin ingin menghapus transaksi ini?")) {
    transaksi = transaksi.filter((t) => t.id !== Number(id)); // id dari dataset berupa teks
    simpanData(); // W4
    render();
  }
});

/* local storage */
function simpanData() {
  localStorage.setItem("transaksi", JSON.stringify(transaksi)); // array -> teks
  localStorage.setItem("uangBulanan", uangBulanan);
}

function muatData() {
  try {
    const teks = localStorage.getItem("transaksi");
    if (teks) transaksi = JSON.parse(teks);                      // teks -> array
  } catch {
    transaksi = []; // kalau isinya rusak, mulai dari kosong
  }
  uangBulanan = Number(localStorage.getItem("uangBulanan")) || 0;
}

/* w5 ringkasan*/
function hitungRingkasan() {
  const pemasukan = transaksi
    .filter((t) => t.jenis === "pemasukan")
    .reduce((jumlah, t) => jumlah + t.nominal, 0);
  const pengeluaran = transaksi
    .filter((t) => t.jenis === "pengeluaran")
    .reduce((jumlah, t) => jumlah + t.nominal, 0);
  return { pemasukan, pengeluaran, saldo: pemasukan - pengeluaran };
}

function renderRingkasan() {
  const hasil = hitungRingkasan();
  document.getElementById("total-saldo").textContent = formatRupiah(hasil.saldo);
  document.getElementById("total-pemasukan").textContent = formatRupiah(hasil.pemasukan);
  document.getElementById("total-pengeluaran").textContent = formatRupiah(hasil.pengeluaran);
}

/* 
   W6: VALIDASI FORM
   Pengecekannya ada di listener submit (W1).
   Di sini fungsi untuk menampilkan pesan di halaman.*/
function tampilkanPesan(elemen, teks, kelas) {
  elemen.textContent = teks;
  elemen.className = "pesan " + kelas; // kelas: "galat" atau "sukses"
}

/* FITUR KHAS: JATAH HARIAN (mahasiswa kos)
   jatah harian = sisa uang / sisa hari*/
function hitungJatahHarian() {
  const hariIni = tanggalHariIni();
  const bulanIni = hariIni.slice(0, 7); // "2026-10"

  // Jumlahkan pengeluaran bulan ini dan pengeluaran hari ini
  let pengeluaranBulanIni = 0;
  let pengeluaranHariIni = 0;
  transaksi.forEach((t) => {
    if (t.jenis !== "pengeluaran") return;
    if (t.tanggal.startsWith(bulanIni)) pengeluaranBulanIni += t.nominal;
    if (t.tanggal === hariIni) pengeluaranHariIni += t.nominal;
  });

  // Sisa hari di bulan ini (hari ini ikut dihitung)
  const sekarang = new Date();
  const hariTerakhir = new Date(sekarang.getFullYear(), sekarang.getMonth() + 1, 0).getDate();
  const sisaHari = hariTerakhir - sekarang.getDate() + 1;

  const sisaUang = uangBulanan - pengeluaranBulanIni;

  // Jatah dihitung dari sisa uang SEBELUM jajan hari ini,
  // supaya jatahnya tidak ikut mengecil setiap kali kita jajan.
  const jatah = Math.max(0, Math.floor((sisaUang + pengeluaranHariIni) / sisaHari));

  return { sisaUang, sisaHari, jatah, pengeluaranHariIni };
}

function renderJatah() {
  const hasil = hitungJatahHarian();
  document.getElementById("sisa-uang").textContent = formatRupiah(hasil.sisaUang);
  document.getElementById("sisa-hari").textContent = hasil.sisaHari + " hari";
  document.getElementById("jatah-harian").textContent = formatRupiah(hasil.jatah);
  document.getElementById("pengeluaran-hari-ini").textContent = formatRupiah(hasil.pengeluaranHariIni);

  // Peringatan muncul kalau jajan hari ini melebihi jatah
  const peringatan = document.getElementById("peringatan");
  peringatan.hidden = !(uangBulanan > 0 && hasil.pengeluaranHariIni > hasil.jatah);
}

// Simpan uang bulanan
formUang.addEventListener("submit", function (e) {
  e.preventDefault();

  const nilai = Number(document.getElementById("uang-bulanan").value);
  if (nilai <= 0) {
    tampilkanPesan(pesanUang, "Uang bulanan harus lebih dari 0.", "galat");
    return;
  }

  uangBulanan = nilai;
  simpanData();
  render();
  tampilkanPesan(pesanUang, "Uang bulanan tersimpan.", "sukses");
});

/* =====================================================
   MULAI (dijalankan saat halaman dibuka)
   ===================================================== */
document.getElementById("tanggal").value = tanggalHariIni();
muatData(); // baca data tersimpan DULU, baru tampilkan
if (uangBulanan > 0) document.getElementById("uang-bulanan").value = uangBulanan;
render();