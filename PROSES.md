------------------------------html

Mengidentifikasi apa saja yang perlu di tulis disetiap section di file html
section ringkasan
    -saldo
    -pemasukan
    -pengeluaran
    -
section jatah-
    -jatah dari ortu(input)
    -sisa uang bulanan
    -sisa jatah hari ini
    -sisa hari bulan ini
    -pengeluaran hari ini

section tambah transaksi
    -tanggal
    -jenis
    -nominal
    -kategori
    -catatan

section riwayat
    -dartar transaksi(tabel)
            -isi tabel
            <tr>
              <th scope="col">Tanggal</th>
              <th scope="col">Kategori</th>
              <th scope="col">Catatan</th>
              <th scope="col" class="kanan">Nominal</th>
              <th scope="col">Aksi</th>
            </tr>
        
  --------------------css


---------------js
# PROSES
Persona dan masalahnya

Persona yang saya dapat adalah mahasiswa kos. Ia menerima uang bulanan tetap dari orang tua, tetapi uangnya sering habis sebelum akhir bulan karena ia tidak pernah tahu berapa yang boleh dipakai dalam sehari. Aplikasi ini saya buat untuk menjawab masalah itu: ia memasukkan uang bulanannya, lalu aplikasi menghitung jatah harian dari sisa uang dan sisa hari, dan memberi peringatan kalau pengeluaran hari ini sudah melewati jatah.

Rancangan struktur data

Sebelum menulis kode, saya memutuskan dulu apa saja yang harus disimpan. Saya memakai dua key di localStorage. Key transaksi berisi array objek, dan setiap objek mewakili satu transaksi dengan enam isian: id, tanggal, jenis, kategori, nominal, dan catatan. Array itu diubah menjadi teks dengan JSON.stringify() saat disimpan dan dikembalikan dengan JSON.parse() saat halaman dibuka. Key kedua, uangBulanan, hanya berisi satu angka.

Ada tiga alasan di balik bentuk ini. Pertama, nominal saya simpan sebagai angka, bukan teks berformat Rupiah, karena angka bisa dijumlahkan, sedangkan teks hanya akan tersambung ("25000" + "10000" menjadi "2500010000"). Kedua, tanggal saya tulis dengan format 2026-10-19 supaya mudah diurutkan dan mudah dicek bulannya. Ketiga, uang bulanan sengaja tidak saya jadikan transaksi. Ia adalah batas anggaran untuk menghitung jatah, bukan pemasukan yang ikut menambah saldo, jadi lebih tepat disimpan terpisah. Fitur jatah harian memakai data transaksi yang sama, sehingga tidak ada penyimpanan tambahan.

Alur kerja kode

Saya menyusun script.js mengikuti urutan kebutuhan W. Pada W1, form tambah transaksi ditangani oleh satu listener submit yang membaca nilai form lalu memasukkan sebuah objek baru ke array transaksi. Pada W2, fungsi renderDaftar() mengosongkan isi tabel, mengurutkan transaksi dari yang terbaru, lalu membuat baris satu per satu dengan createElement dan textContent, sehingga daftar benar-benar dibuat dari data JavaScript, bukan ditulis di HTML.

Pada W3, tombol Hapus ditangani oleh satu listener yang dipasang di <tbody>. Saya memilih cara ini karena baris tabel dibuat ulang setiap kali render() dipanggil, sehingga listener yang dipasang langsung pada tiap tombol akan hilang. Saat tombol diklik, aplikasi meminta konfirmasi dengan confirm(), lalu membuang transaksi itu memakai filter(). Pada W4, simpanData() menyimpan array ke localStorage setiap kali data berubah, dan muatData() membacanya kembali saat halaman dibuka, dengan try...catch supaya isi yang rusak tidak membuat halaman mati.

Pada W5, hitungRingkasan() memakai filter() dan reduce() untuk menjumlahkan pemasukan dan pengeluaran, lalu saldo dihitung dari selisihnya. Pada W6, sebelum data dimasukkan, aplikasi menolak tanggal yang kosong dan nominal yang tidak lebih dari nol, dan pesan kesalahannya tampil di halaman lewat tampilkanPesan(), bukan lewat alert().

Seluruh bagian ini terhubung lewat satu fungsi, render(). Setiap kali data berubah, saya cukup memanggil fungsi itu, dan daftar, ringkasan, serta jatah harian ikut diperbarui. Jadi alurnya saat tombol Simpan diklik adalah: validasi, push ke array, simpanData(), lalu render(). Saat halaman di-refresh, muatData() membaca data dulu, baru render() menampilkannya.


Keputusan yang paling saya pikirkan adalah cara menghitung jatah harian. Rumus dasarnya adalah sisa uang dibagi sisa hari. Awalnya saya berpikir memakai sisa uang saat ini, tetapi itu bermasalah: setiap kali saya mencatat jajan, sisa uang berkurang dan jatah ikut mengecil, sehingga peringatan bisa menyala padahal pengeluaran hari ini belum melewati jatah semula. Karena itu saya menghitung jatah dari sisa uang sebelum pengeluaran hari ini, yaitu sisa uang ditambah pengeluaran hari ini, lalu dibagi sisa hari dan dibulatkan ke bawah. Dengan begitu jatah tetap stabil sepanjang hari, dan peringatan hanya muncul kalau pengeluaran benar-benar melebihi jatah.

Ada dua keputusan kecil yang menyertainya. Sisa hari saya hitung dengan menyertakan hari ini, yaitu hari terakhir bulan dikurangi tanggal hari ini lalu ditambah satu, sehingga nilainya tidak pernah nol dan tidak terjadi pembagian dengan nol. Lalu tanggal hari ini saya susun dari waktu lokal, bukan dari toISOString(), karena toISOString() memakai UTC dan bisa meleset sehari di zona WIB.

Bug dan kendala

Bug pertama muncul saat saya menguji fitur khas. Setelah mengisi uang bulanan dan menekan "Simpan uang bulanan", empat kartu jatah tetap menampilkan Rp 0 dan 0 hari, sementara ringkasan di atasnya sudah terisi. Petunjuk pertama saya temukan di alamat browser, yang tiba-tiba berubah menjadi mahasiswakos.html?uangBulanan=100000. Alamat seperti itu hanya muncul kalau form dikirim dengan cara bawaan browser, artinya tidak ada kode yang menangkap submit-nya dengan e.preventDefault(). Saya lalu mengetik typeof hitungJatahHarian di Console dan hasilnya "undefined", yang membuktikan bahwa file JavaScript yang berjalan masih versi lama tanpa fitur jatah harian. Nilai Rp 0 dan 0 hari ternyata hanya teks awal dari HTML yang tidak pernah diganti. Saya memperbaikinya dengan menambahkan hitungJatahHarian(), renderJatah(), dan listener untuk form uang bulanan lengkap dengan e.preventDefault(), lalu menyegarkan halaman dengan Ctrl + F5. Dari sini saya belajar bahwa form tanpa preventDefault() akan memuat ulang halaman dan menaruh isinya di URL.

Riwayat commit

Pekerjaan saya bagi menjadi empat commit. Commit pertama mencakup W1 dan W2, yaitu form tambah transaksi dan render daftar. Commit kedua mencakup W3 dan W4, yaitu hapus dengan konfirmasi dan penyimpanan ke localStorage. Commit ketiga mencakup W5 dan W6, yaitu ringkasan otomatis dan validasi form. Commit keempat berisi fitur khas, yaitu jatah harian dan peringatan.