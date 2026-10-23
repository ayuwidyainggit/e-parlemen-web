# SRS — Penugasan Dapil & Reses (EP-RD-01)

- **Modul**: Penugasan Dapil & Reses
- **Kode Modul**: EP-RD-01 *(domain "Reses & Dapil" belum punya penomoran resmi sebelumnya — EP-MD-01/02/03 dipakai untuk Master Data; EP-RD-01 diusulkan di sini dan perlu dikonfirmasi/diselaraskan oleh tim)*
- **Role**: Ketua (assign Dapil/Reses) — lihat §9 Gap G-19 soal ambiguitas aktor
- **Sumber**: Disusun dari halaman prototipe `penugasan-dapil-reses.html` + `penugasan-dapil-reses-data.js`, dan dependensi `dapil-data.js`, `periode-reses-data.js`, `pegawai-data.js`, `pokir-data.js`, `jenis-kegiatan-data.js`
- **Dipakai/terhubung ke**: `master-dapil.html`, `master-periode-reses.html`, `master-jenis-kegiatan.html`, `laporan-pokir.html` (secara data model — lihat catatan di §9 soal `laporan-dapil-reses.html` yang **belum** terhubung)
- **Tanggal Disusun**: 2026-10-21
- **Catatan**: Dokumen ini ditulis berdasarkan perilaku prototipe (client-side, `localStorage`, tanpa backend sungguhan). Fokus dokumen sesuai permintaan: **Business Rules (CRUD)**, **Gap Analysis**, dan **Pertanyaan Konfirmasi ke User/Klien** — bukan SRS naratif lengkap dengan negative test case per field (lihat `master-unit-type-srs.md` untuk contoh format itu bila dibutuhkan untuk modul ini juga).

---

## 1. Konteks: Perbedaan "Reses" vs "Kunjungan Dapil"

Modul ini menggabungkan dua jenis kegiatan yang **secara konsep berbeda** di tata kerja DPRD, meski sama-sama berujung pada Anggota turun ke Daerah Pemilihannya (Dapil). Bagian ini ditulis dulu sebagai dasar sebelum membaca Business Rule & Gap Analysis, supaya jelas *mengapa* field yang wajib/opsional berbeda antar dua Jenis ini (lihat BR-5, BR-6).

| Aspek | **Reses** | **Kunjungan Dapil** |
|---|---|---|
| Sifat | Kegiatan **formal & terjadwal**, bagian dari masa kerja DPRD (umumnya diatur Tatib/Peraturan DPRD, berbarengan dengan Masa Sidang) | Kegiatan **fleksibel/insidental**, tidak terikat kalender resmi DPRD |
| Keterikatan periode | Wajib terikat ke satu **Periode Reses** tertentu (mis. "Reses I Tahun 2026") — lihat BR-5 | Tidak punya Periode; boleh terjadi kapan saja sepanjang tahun |
| Tujuan utama | Menyerap, menghimpun, dan menampung aspirasi masyarakat secara resmi di Dapil | Tujuan beragam & lebih spesifik: tinjau lokasi usulan, sosialisasi, menghadiri undangan masyarakat, memantau realisasi usulan yang sudah berjalan, dll. |
| Hasil/Output formal | Menghasilkan **Pokok-Pokok Pikiran (Pokir)** baru sebagai bahan pertimbangan RKPD/APBD berikutnya | Tidak mewajibkan Pokir baru; justru sering jadi **tindak lanjut** dari Pokir yang sudah ada — karena itu field **Pokir bersifat opsional** untuk ditautkan (lihat BR-6), bukan untuk membuat Pokir baru |
| Field pembeda di form | **Periode Reses** (wajib dipilih) | **Pokir** (opsional, hanya usulan `progres < 100%` yang ditawarkan — lihat BR-6/BR-6a) |
| Jenis Kegiatan yang relevan | Mis. Pertemuan Masyarakat, Dialog Masyarakat, Penyerapan Aspirasi (lihat Master Jenis Kegiatan, `berlakuUntuk='Reses'`) | Mis. Kunjungan Lapangan, Sosialisasi, Kunjungan Fasilitas Publik (`berlakuUntuk='Kunjungan Dapil'`) |

**Implikasi ke desain modul**: karena perbedaan ini, toggle **Jenis** (RESES/KUNJUNGAN) di form Tambah/Edit menukar field yang tampil — Periode Reses untuk Reses, Pokir untuk Kunjungan Dapil — dan ikut memfilter opsi Jenis Kegiatan (BR-7). Keduanya tetap memakai struktur data & siklus status (Draft → Submit → … ) yang sama persis (lihat §7), karena dari sisi "penugasan siapa ke mana kapan", keduanya identik — perbedaannya murni pada konteks/tujuan kegiatan, bukan pada mekanisme penugasannya.

**Belum dikonfirmasi ke klien** (ditambahkan ke §10 Q-1): apakah pemahaman di atas (Reses = formal & terjadwal dengan output Pokir baru; Kunjungan Dapil = fleksibel & sering tindak lanjut Pokir lama) sudah sesuai dengan definisi resmi yang dipakai Sekretariat/Tatib DPRD setempat, mengingat prototipe ini belum divalidasi langsung ke klien.

---

## 2. Deskripsi

Penugasan Dapil & Reses mengatur **siapa (Anggota DPRD) bertugas di mana (Dapil & Lokasi), kapan (Tanggal/Jam), dan dalam rangka apa** (Reses dengan Periode Reses tertentu, atau Kunjungan Dapil yang bisa ditautkan ke usulan Pokir — lihat §1 untuk konteks perbedaannya). Anggota mencatat realisasi kegiatan lewat aplikasi mobile (di luar scope prototipe ini); realisasinya **seharusnya** muncul di menu Laporan Reses/Dapil (lihat Gap G-1 — saat ini belum benar‑benar terhubung).

Entitas intinya adalah **satu baris Penugasan = satu Anggota**, bukan "satu kegiatan dengan banyak peserta" — implikasinya dibahas di §4 dan §7.

---

## 3. Precondition

- Master Dapil (`dapil-data.js`), Periode Reses (`periode-reses-data.js`), Pegawai/Anggota (`pegawai-data.js`), dan Jenis Kegiatan (`jenis-kegiatan-data.js`) sudah terisi — form Tambah/Edit bergantung penuh pada keempat master data ini (dropdown kosong/tidak berfungsi jika salah satu kosong).
- Pengguna (Ketua/Admin yang mewakilinya) sudah berada di halaman `penugasan-dapil-reses.html`; tidak ada pemeriksaan permission di level kode saat ini (lihat Gap G-13).

---

## 4. Main Flow — CRUD

### 4.1 Create (Tambah Penugasan)

1. Klik **Tambah Penugasan** → modal terbuka, default Jenis = **Reses**, seluruh field lain kosong.
2. Pilih **Jenis** (Reses / Kunjungan Dapil) → menentukan field mana yang tampil (Periode Reses vs Pokir) dan opsi **Jenis Kegiatan** yang relevan.
3. Pilih **Dapil** → checklist **Anggota DPRD** otomatis terisi (hanya Anggota dengan `dapilId` = Dapil terpilih), dan dropdown **Pokir** (jika Jenis = Kunjungan Dapil) ikut terfilter ke Dapil yang sama.
4. Centang satu atau lebih **Anggota DPRD** (bisa dicari lewat kotak pencarian nama).
5. Isi **Periode Reses** (wajib bila Reses) atau pilih **Pokir** (opsional bila Kunjungan Dapil, langsung menampilkan ringkasan progres terakhirnya).
6. Isi **Tanggal Kegiatan** (wajib), **Jam Mulai/Selesai** (opsional), **Jenis Kegiatan** (dari Master Jenis Kegiatan, terfilter), **Lokasi Rencana** (wajib), **Catatan** (opsional).
7. Klik **Simpan Penugasan** (→ status `Submit`) atau **Draft** (→ status `Draft`).
8. Sistem validasi (lihat §5), lalu membuat **satu record per Anggota yang dicentang** (fan-out — lihat BR-16/BR-17), menyimpan ke `localStorage`, memperbarui tabel & kartu statistik, menutup modal, menampilkan toast.

### 4.2 Read (Daftar, Filter, Statistik)

- Tabel menampilkan semua Penugasan, diurutkan **tanggalRencana menurun** (lihat BR-21).
- Filter tersedia: Periode Reses, Jenis, Dapil, Status (status **efektif**, bukan status mentah — lihat BR-11, BR-20).
- 6 kartu statistik (Total, Draft, Submit, Dalam Proses Penugasan, Lewat Masa Penugasan, Selesai) dihitung dari status efektif seluruh data, independen dari filter yang aktif di tabel.
- Tidak ada halaman/tombol "Lihat Detail" terpisah dari Edit (lihat Gap G-20).

### 4.3 Update (Edit Penugasan)

1. Tombol **Edit** hanya muncul jika status efektif baris tersebut masih `Draft` atau `Submit` (lihat BR-13).
2. Modal terbuka terisi data existing; checklist Anggota otomatis mencentang `personId` milik record yang diedit.
3. Admin dapat **menambah centang Anggota lain** → saat disimpan, ini membuat record **baru** (clone), bukan mengubah record yang diedit menjadi multi-anggota (lihat BR-17, Gap G-3).
4. Validasi sama seperti Create. Simpan memperbarui record asli (field non-personId) + membuat record baru untuk centang tambahan.

### 4.4 Delete (Hapus Penugasan)

1. Tombol **Hapus** hanya muncul dengan kondisi yang sama seperti Edit (status efektif `Draft`/`Submit`).
2. Modal konfirmasi menampilkan jenis & nama Anggota, satu tombol **Hapus** (danger) tanpa opsi lain.
3. Konfirmasi menghapus **satu record** (satu Anggota) saja — jika Penugasan berasal dari fan-out multi-Anggota, record Anggota lain **tidak ikut terhapus** (tidak ada opsi "hapus semua yang terkait").

---

## 5. Ketentuan Validasi per Field (Ringkas)

| Field | Wajib? | Ketentuan |
|---|---|---|
| Jenis | Ya | `RESES` atau `KUNJUNGAN`, default `RESES` |
| Dapil | Ya | Harus dipilih eksplisit sebelum checklist Anggota & dropdown Pokir terisi |
| Anggota DPRD | Ya (≥1) | Checklist, difilter ke Anggota `tipePegawai='Politisi'` dengan `dapilId` = Dapil terpilih; tidak ada batas maksimum |
| Periode Reses | Ya, bila Jenis=Reses | Disembunyikan & diabaikan bila Jenis=Kunjungan Dapil |
| Pokir | Tidak (selalu opsional) | Hanya tampil bila Jenis=Kunjungan Dapil; difilter ke Pokir dengan `dapilKode` = Dapil terpilih |
| Tanggal Kegiatan | Ya | Tipe `date`, tidak ada validasi "tidak boleh di masa lalu" |
| Jam Mulai / Jam Selesai | Tidak | Jika **keduanya** diisi, Jam Selesai wajib > Jam Mulai; jika hanya salah satu diisi, tidak divalidasi |
| Jenis Kegiatan | Ya | Wajib dipilih (placeholder "Pilih jenis kegiatan…" default kosong, divalidasi juga di `saveJadwal`); opsi datang dari Master Jenis Kegiatan, terfilter `berlakuUntuk` sesuai Jenis & `status='Aktif'` |
| Lokasi Rencana | Ya | Teks bebas, tidak ada batas panjang/sanitasi |
| Catatan | Tidak | Teks bebas |
| Status (Draft/Submit) | Ya (implisit) | Ditentukan oleh tombol yang diklik, bukan field terpisah |

---

## 6. Siklus Status (State Machine)

```
Draft ──(klik "Simpan Penugasan")──► Submit
Submit ──(otomatis, H-14 dari Tanggal Kegiatan)──► Dalam Proses Penugasan
Dalam Proses Penugasan ──(otomatis, lewat Tanggal Kegiatan tanpa laporan)──► Lewat Masa Penugasan  [TERMINAL]
(Submit | Dalam Proses Penugasan) ──(otomatis, submittedByMember=true)──► Selesai  [TERMINAL]
```

- **Draft** dan **Submit** adalah satu-satunya dua nilai yang ditulis manual oleh pengguna (lewat tombol, bukan dropdown).
- **Dalam Proses Penugasan**, **Lewat Masa Penugasan**, **Selesai** adalah status *efektif* yang **dihitung**, bukan disimpan langsung — kecuali begitu mencapai salah satu dari 2 status terminal, nilainya **dikunci** ke `j.status` (lihat BR-12) agar tidak bisa "mundur".
- **Penting (lihat Gap G-12)**: jika `j.status === 'Draft'`, sistem **tidak pernah** mengevaluasi `submittedByMember` — artinya secara teknis Penugasan yang masih Draft tidak bisa berstatus Selesai meski field simulasi `submittedByMember` diset `true`. Perlu dikonfirmasi apakah ini memang perilaku yang diinginkan.

---

## 7. Business Rule (Ketentuan Konsolidasi)

| # | Ketentuan |
|---|---|
| BR-1 | Setiap Penugasan wajib punya tepat satu Jenis: `RESES` atau `KUNJUNGAN` (Kunjungan Dapil) — tidak bisa berlaku untuk keduanya sekaligus. |
| BR-2 | Dapil dipilih eksplisit lewat dropdown dan disimpan sebagai `dapilKode` pada record Penugasan — **independen** dari `dapilId` Anggota saat ini di Master Pegawai. |
| BR-3 | Checklist Anggota DPRD hanya menampilkan Anggota (`tipePegawai='Politisi'`) dengan `dapilId` sama dengan Dapil yang dipilih di langkah sebelumnya; Anggota di Dapil lain tidak muncul sama sekali. |
| BR-4 | Minimal satu Anggota wajib dicentang; tidak ada batas maksimum jumlah Anggota per submit. |
| BR-5 | Periode Reses wajib diisi hanya jika Jenis=Reses; untuk Jenis=Kunjungan Dapil, field ini disembunyikan dan nilainya dipaksa `null`. |
| BR-6 | Pokir (opsional) hanya tersedia untuk Jenis=Kunjungan Dapil, difilter ke Dapil yang sama dengan Penugasan **dan** `progres < 100%` (usulan yang sudah tuntas tidak ditawarkan untuk ditautkan ke Penugasan baru); memilih Pokir menampilkan persentase progres terakhir, status, dan tanggal update terakhirnya secara read-only. Untuk Jenis=Reses, field ini disembunyikan dan `pokirId` dipaksa `null`. |
| BR-6a | Pengecualian terhadap BR-6: bila record yang sedang di-Edit sudah tertaut ke sebuah Pokir yang progresnya **kemudian** mencapai 100% (diperbarui dari Laporan Pokir setelah Penugasan dibuat), Pokir tersebut tetap muncul & tetap terpilih di dropdown selama mengedit record itu — hanya tidak ditawarkan lagi untuk Penugasan lain/baru. |
| BR-7 | Opsi Jenis Kegiatan bersumber dari Master Jenis Kegiatan (`jenis-kegiatan-data.js`), difilter ke `berlakuUntuk` yang sesuai Jenis Penugasan dan `status='Aktif'` — bukan daftar statis di halaman ini. |
| BR-8 | Tanggal Kegiatan dan Lokasi Rencana wajib diisi; Jam Mulai/Selesai opsional, namun jika keduanya diisi, Jam Selesai harus > Jam Mulai. |
| BR-9 | Status hanya dapat diisi lewat salah satu dari dua tombol submit ("Simpan Penugasan" → `Submit`, "Draft" → `Draft`) — tidak ada dropdown status manual yang mengizinkan nilai lain. |
| BR-10 | Status yang ditampilkan ke pengguna (status efektif) dihitung otomatis dari `status` tersimpan + `tanggalRencana` + `submittedByMember`, mengikuti state machine di §6. |
| BR-11 | Begitu status efektif mencapai salah satu dari 2 status terminal (`Lewat Masa Penugasan`, `Selesai`), nilainya dikunci permanen ke `j.status` — tidak bisa kembali ke status manapun meski tanggal/`submittedByMember` berubah lagi. |
| BR-12 | Tombol Edit & Hapus hanya tersedia selama status efektif masih `Draft` atau `Submit`; begitu sudah `Dalam Proses Penugasan`/`Lewat Masa Penugasan`/`Selesai`, kedua aksi disembunyikan dari UI **dan** ditolak oleh fungsi terkait bila dipanggil langsung. |
| BR-13 | Window "Dalam Proses Penugasan" dihitung H-14 (`JADWAL_PROSES_WINDOW_DAYS=14`) dari `tanggalRencana`, konstan untuk semua Jenis/Dapil/Periode. |
| BR-14 | `submittedByMember` adalah field simulasi tanpa kontrol UI admin — merepresentasikan "salah satu Anggota yang ditugaskan sudah submit realisasi lewat aplikasi mobile"; untuk record baru/hasil edit nilainya selalu `false`. |
| BR-15 | Satu submit form Tambah dengan N Anggota tercentang menghasilkan **N record independen** (fan-out) dengan `personId` berbeda tapi field lain identik — tidak ada entitas "grup/batch" yang menautkan record-record hasil fan-out ini. |
| BR-16 | Saat Edit, Anggota pertama yang tercentang pada checklist menggantikan `personId` record yang diedit; setiap Anggota tambahan yang baru dicentang menghasilkan record **baru** (clone), bukan memperbarui assignment Anggota tersebut jika sudah ada sebelumnya. |
| BR-17 | Tabel & filter Dapil memprioritaskan `j.dapilKode` milik record; hanya fallback ke `dapilId` Anggota saat ini bila `j.dapilKode` kosong (data legacy) — dua record dengan Anggota yang sama bisa tampil di Dapil berbeda bila Anggota itu sudah berpindah Dapil setelah Penugasan dibuat. |
| BR-18 | Filter Status pada daftar menggunakan status **efektif** (hasil hitung), bukan `status` mentah yang tersimpan. |
| BR-19 | Daftar Penugasan diurutkan menurun berdasarkan `tanggalRencana`; record yang `personId`-nya tidak ditemukan di Master Pegawai disembunyikan total dari tabel tanpa indikasi error ke admin. |
| BR-20 | Menghapus (Delete) satu baris hanya menghapus satu record/satu Anggota — tidak ada aksi "hapus semua Anggota terkait" untuk hasil fan-out dari satu submit yang sama. |

---

## 8. Data Requirement

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `id` | integer, auto-increment | Otomatis | Primary key per **Anggota**, bukan per kegiatan |
| `personId` | integer (FK Pegawai) | Ya | Satu Anggota per record |
| `jenis` | enum (`RESES`/`KUNJUNGAN`) | Ya | |
| `dapilKode` | string (FK Dapil) | Ya | Disimpan langsung saat Penugasan dibuat, tidak otomatis ikut perubahan `dapilId` Anggota di kemudian hari |
| `periodeResesId` | integer (FK Periode Reses), nullable | Ya bila `jenis=RESES` | `null` bila `jenis=KUNJUNGAN` |
| `pokirId` | integer (FK Pokir), nullable | Tidak | Hanya relevan/terisi bila `jenis=KUNJUNGAN`; `null` bila `jenis=RESES` |
| `tanggalRencana` | date (ISO) | Ya | |
| `jamMulai`, `jamSelesai` | time (`HH:mm`), nullable | Tidak | Jika keduanya ada, `jamSelesai > jamMulai` |
| `jenisKegiatan` | string (FK Master Jenis Kegiatan, disimpan sebagai nama) | Tidak (UI) | Disimpan sebagai nama teks, bukan FK id — lihat Gap G-14 soal risiko drift nama |
| `lokasiRencana` | string | Ya | Tidak ada batas panjang |
| `catatan` | string, nullable | Tidak | |
| `status` | enum (`Draft`/`Submit`/`Dalam Proses Penugasan`/`Lewat Masa Penugasan`/`Selesai`) | Ya | Hanya `Draft`/`Submit` yang ditulis manual; sisanya ditulis otomatis saat status efektif mencapai terminal |
| `submittedByMember` | boolean | Ya (default `false`) | Field simulasi, lihat BR-14 |
| `createdAt` | datetime (ISO) | Otomatis | Tidak ada `updatedAt` — perubahan lewat Edit tidak mengubah timestamp apapun |

---

## 9. Gap Analysis

Dikelompokkan per tema. Prioritas (Tinggi/Menengah/Rendah) adalah penilaian relatif terhadap risiko bila dibawa langsung ke backend produksi tanpa diputuskan dulu.

### A. Integrasi & Konsistensi Data

| # | Gap | Prioritas |
|---|---|---|
| G-1 | `laporan-dapil-reses.html` memakai data dummy inline-nya sendiri dan **sama sekali tidak membaca** `JADWAL_RESES_LIST`/`penugasan-dapil-reses-data.js`. Hint di halaman ini mengklaim "hasilnya muncul di menu Laporan Reses/Dapil" — klaim ini belum benar secara teknis di prototipe. | Tinggi |
| G-2 | `submittedByMember` murni flag simulasi tanpa mekanisme nyata (API/webhook) yang menghubungkan "submit realisasi dari mobile" ke flag ini. | Tinggi |
| G-3 | Field Pokir (`pokir-data.js`) adalah salinan statis terpisah dari `laporan-pokir.html` (yang punya array `pokirData` sendiri, tidak persist ke `localStorage`) — progres yang ditampilkan di form Penugasan **tidak sinkron** jika progres Pokir diperbarui di Laporan Pokir. | Tinggi |
| G-4 | `dapilKode` pada record Penugasan terpisah dari `dapilId` Anggota saat ini — tidak ada rule yang mengatasi drift ketika Anggota berpindah Dapil setelah Penugasan lama dibuat (lihat BR-17). Ini berdampak ke akurasi laporan per-Dapil historis. | Menengah |
| G-5 | `jenisKegiatan` disimpan sebagai **nama teks**, bukan FK ke Master Jenis Kegiatan — jika admin mengganti nama Jenis Kegiatan di Master, Penugasan lama tidak ikut berubah dan tidak bisa dihitung ulang/dikelompokkan secara andal berdasarkan ID. | Menengah |

### B. Proses Bisnis & Validasi

| # | Gap | Prioritas |
|---|---|---|
| G-6 | Fan-out multi-Anggota tanpa Group/Batch ID: satu submit bisa menghasilkan N record independen, tapi tidak ada cara mengubah/menghapus "penugasan gabungan" itu sekaligus — admin harus edit/hapus satu per satu per Anggota (lihat BR-15, BR-20). | Tinggi |
| G-7 | Edit yang mengganti centang Anggota (uncheck Anggota asli, check Anggota lain) membuat `personId` record asli "berpindah pemilik" tanpa jejak riwayat (lihat BR-16) — berisiko riwayat penugasan per-Anggota jadi salah/tertukar. | Tinggi |
| G-8 | Tidak ada deteksi bentrok jadwal (double-booking) — seorang Anggota bisa ditugaskan di dua lokasi berbeda pada tanggal/jam yang sama tanpa peringatan. | Menengah |
| G-9 | Tidak ada deteksi duplikasi Penugasan (Anggota + Dapil + Tanggal + Jenis yang identik bisa dibuat berulang kali). | Menengah |
| G-10 | Status efektif `Draft` melakukan *early return* sebelum mengevaluasi `submittedByMember` (lihat §6) — secara teknis Penugasan Draft tidak bisa langsung "Selesai" meski ada laporan realisasi; perlu dikonfirmasi apakah ini sesuai alur bisnis riil (apakah Anggota bisa melihat/melapor realisasi untuk Penugasan yang masih Draft/belum dipublikasikan admin?). | Menengah |
| G-11 | Window H-14 (`JADWAL_PROSES_WINDOW_DAYS`) hardcode, tidak bisa dikonfigurasi per Jenis/Dapil/Periode, dan belum dikonfirmasi apakah 14 hari adalah aturan resmi atau asumsi pengembang. | Rendah |
| G-12 | Field Pokir hanya tersedia untuk Kunjungan Dapil — follow-up Pokir hasil Reses periode sebelumnya mungkin juga relevan ditautkan ke Penugasan Reses berikutnya, bukan hanya Kunjungan Dapil. | Rendah |
| G-21 | Filter `progres < 100%` pada dropdown Pokir (BR-6) tidak **otomatis melepas** `pokirId` pada Penugasan lama bila Pokir tersebut kemudian mencapai 100% — record lama tetap menyimpan tautan itu selamanya (BR-6a) tanpa pemberitahuan ke admin bahwa Pokir rujukannya sudah tuntas. Juga belum ada aturan soal multi-Penugasan yang menautkan Pokir yang sama sebelum progresnya mencapai 100% (apakah dibatasi satu Penugasan aktif per Pokir, atau bebas). | Rendah |

### C. Keamanan, Hak Akses & Audit

| # | Gap | Prioritas |
|---|---|---|
| G-13 | Tidak ada pemeriksaan permission di level kode (berbeda dari dokumentasi Master Data EP-MD-01/02/03 yang setidaknya mendefinisikan permission granular `xxx.lihat`/`xxx.tambah`/dst. meski belum ditegakkan) — siapapun yang membuka halaman ini bisa Tambah/Edit/Hapus. | Tinggi |
| G-14 | Tidak ada audit trail: tidak tercatat siapa yang membuat/mengubah/menghapus Penugasan; `createdAt` tidak diperbarui saat Edit, dan tidak ada `updatedAt` sama sekali. | Menengah |
| G-15 | Topbar & sidebar masih memakai identitas hardcode "Admin Sekretariat", bukan sesi Ketua — ambiguitas siapa sesungguhnya aktor berwenang di modul ini (lihat §10 Q-2). | Menengah |
| G-16 | Tidak ada sanitasi/escaping pada field teks bebas (Lokasi Rencana, Catatan) sebelum dirender ke tabel via `innerHTML` — pola risiko XSS yang sama seperti ditemukan pada review SRS Master Unit Type. | Menengah |

### D. Kualitas Data, Performa & UX

| # | Gap | Prioritas |
|---|---|---|
| G-17 | Tidak ada paginasi pada tabel daftar Penugasan — seluruh data dirender sekaligus; untuk skala produksi (ratusan/ribuan Penugasan per periode) berisiko masalah performa. | Rendah |
| G-18 | Tidak ada tombol "Lihat Detail" terpisah dari Edit — admin dengan hak akses view-only (jika RBAC granular diterapkan nanti) tidak punya cara melihat detail tanpa membuka form Edit. | Rendah |
| G-19 | Dua tombol submit ("Simpan Penugasan" dan "Draft") bersisian di form yang sama tanpa konfirmasi tambahan — risiko salah klik mengubah status yang berdampak ke SLA H-14 secara tidak sengaja. | Rendah |
| G-20 | Modul Notifikasi sudah ada di sidebar (badge "5") tapi tidak terhubung ke event apapun di modul ini (Penugasan baru/Submit tidak memicu notifikasi ke Anggota terkait). | Rendah |

### E. Fokus: Create (Tambah Penugasan) — Field Dapil

Sub-bagian ini membedah khusus langkah **"Pilih Dapil"** pada alur Create (§4 langkah 3) karena field ini men-trigger dua field lain (checklist Anggota & dropdown Pokir) dan jadi titik awal seluruh data Penugasan.

| # | Gap | Prioritas |
|---|---|---|
| G-22 | Dropdown Dapil menampilkan **seluruh** isi Master Dapil (`populateJadwalDapilSelect()` memetakan semua `DAPIL_LIST` tanpa filter) — tidak ada scoping "Ketua X hanya berwenang menugaskan untuk Dapil-nya sendiri", padahal Role modul ini didefinisikan sebagai "Ketua assign Dapil/Reses". Siapapun yang membuka form bisa memilih Dapil manapun. | Tinggi |
| G-23 | Dropdown Dapil tidak memfilter status Aktif/Nonaktif dari Master Dapil (`dapil-data.js` punya field `status`) — Dapil yang sudah dinonaktifkan (misal karena pemekaran/redistribusi) tetap muncul dan bisa dipilih untuk Penugasan baru. | Menengah |
| G-24 | Mengganti pilihan Dapil **setelah** sejumlah Anggota sudah dicentang langsung mengosongkan ulang checklist Anggota tanpa konfirmasi (`onJadwalDapilChange()` memanggil `buildAnggotaChecklist(dapilKode, [])` — array kosong) — admin bisa kehilangan centangan yang sudah dipilih hanya karena salah klik Dapil. | Menengah |
| G-25 | Tidak ada jalur pintas "Tambah Dapil baru" langsung dari form Create Penugasan (beda dengan pola "Lainnya" yang sudah ada di Config Fraksi) — bila Dapil yang dibutuhkan belum terdaftar di Master Dapil, admin harus keluar dari form ini, membuatnya dulu di `master-dapil.html`, baru kembali mengisi Penugasan dari awal. | Rendah |
| G-26 | Opsi Dapil pada dropdown tidak diurutkan secara eksplisit — langsung mengikuti urutan penyimpanan `DAPIL_LIST`, berisiko tampilan tidak konsisten/sulit dicari begitu jumlah Dapil bertambah banyak. | Rendah |
| G-27 | Dapil yang dipilih tapi tidak memiliki Anggota aktif sama sekali (checklist menampilkan "Belum ada Anggota DPRD yang ditugaskan ke dapil ini") tetap dianggap pilihan valid oleh UI — admin baru diblokir di langkah submit ("Pilih minimal satu Anggota DPRD"), bukan diberi tahu di titik pemilihan Dapil bahwa Dapil tersebut "kosong Anggota" sebelum mengisi seluruh field lainnya. | Rendah |

---

## 10. Pertanyaan Konfirmasi ke User/Klien

### A. Definisi & Konteks

1. Apakah definisi Reses (formal, terjadwal lewat Periode Reses, output Pokir baru) vs Kunjungan Dapil (fleksibel, sering tindak lanjut Pokir lama, tanpa Periode) pada §1 sudah sesuai dengan definisi resmi yang dipakai Sekretariat/Tatib DPRD setempat? Bila berbeda, field mana saja pada form (Periode Reses wajib untuk Reses, Pokir opsional untuk Kunjungan Dapil — lihat BR-5, BR-6) yang perlu disesuaikan?

### B. Peran & Kewenangan

2. Siapa sesungguhnya aktor yang berwenang membuat/mengubah/menghapus Penugasan — **Ketua DPRD langsung**, atau **Admin Sekretariat atas nama/arahan Ketua**, atau keduanya dengan hak yang sama? (lihat Gap G-13, G-15)
3. Apakah perlu ada approval terpisah (misal Ketua membuat draft, lalu perlu persetujuan pihak lain sebelum berstatus Submit), atau cukup satu aktor yang langsung bisa Submit?

### C. Model Data: Satu Kegiatan vs Satu Anggota

4. Secara bisnis, apakah "Penugasan" yang dibuat untuk beberapa Anggota sekaligus (misal 1 Dapil dikirim 3 Anggota ke lokasi & tanggal yang sama) harus dianggap **satu kegiatan** (butuh Group/Batch ID agar bisa diedit/dihapus bersamaan), atau memang dimaksudkan sebagai **penugasan independen per-Anggota** seperti perilaku prototipe saat ini (fan-out tanpa relasi)? (lihat Gap G-6)
5. Jika seorang Anggota dipindahkan ke Dapil lain setelah sebuah Penugasan Reses/Kunjungan Dapil lama dibuat, apakah Penugasan lama itu harus tetap mencatat Dapil **saat Penugasan dibuat** (histori), atau ikut berubah mengikuti Dapil Anggota yang terbaru? (lihat Gap G-4, BR-17)

### D. Siklus Status & SLA

6. Apakah window **H-14** ("Dalam Proses Penugasan") adalah aturan baku Sekretariat, dan apakah boleh berbeda untuk Reses vs Kunjungan Dapil, atau per Dapil/Periode? (lihat Gap G-11)
7. Apakah Anggota di aplikasi mobile bisa melihat/melaporkan realisasi untuk Penugasan yang **masih berstatus Draft** (belum di-Submit admin), atau Draft memang harus tersembunyi total dari Anggota sampai di-Submit? Ini menentukan apakah perilaku *early-return* status Draft pada §6 perlu diperbaiki. (lihat Gap G-10)
8. Begitu status mencapai **Lewat Masa Penugasan** atau **Selesai**, apakah benar-benar tidak ada skenario "revisi"/"batalkan status terminal" oleh admin (misal karena salah input tanggal), atau perlu ada mekanisme reopen terbatas dengan audit log?
9. Siapa/sistem apa yang memicu `submittedByMember=true` di dunia nyata — apakah dari API aplikasi mobile Anggota, dan apakah event itu juga harus otomatis menautkan ke laporan realisasi (peserta, aspirasi, dokumentasi) yang disebut di halaman ini? (lihat Gap G-1, G-2)

### E. Pokir & Jenis Kegiatan

10. Apakah tautan ke Pokir memang khusus untuk Kunjungan Dapil saja, atau Reses juga perlu bisa ditautkan ke Pokir (misal follow-up usulan dari Reses sebelumnya)? (lihat Gap G-12)
11. Apakah data Pokir & progresnya harus berasal dari **satu sumber tunggal** yang sama dengan `laporan-pokir.html` (butuh migrasi `laporan-pokir.html` ke `pokir-data.js` yang sudah dibuat), supaya persentase yang tampil di form Penugasan selalu real-time/akurat? (lihat Gap G-3)
12. Apakah Jenis Kegiatan sebaiknya disimpan sebagai **referensi ID** (bukan nama teks) agar tahan terhadap perubahan nama di Master Jenis Kegiatan? (lihat Gap G-5)
13. Pokir yang progresnya sudah 100% kini disembunyikan dari dropdown Pokir untuk Penugasan baru (BR-6) — apakah ini memang berarti "sudah tuntas, tidak perlu kunjungan lanjutan"? Dan untuk Penugasan **lama** yang sudah tertaut ke Pokir yang progresnya kemudian mencapai 100% (BR-6a), apakah tautan itu harus tetap dipertahankan sebagai riwayat, atau justru harus otomatis diputus/diberi penanda "Pokir sudah tuntas" ke admin? (lihat Gap G-21)
14. Apakah satu Pokir boleh ditautkan ke **lebih dari satu** Penugasan Kunjungan Dapil secara bersamaan sebelum progresnya 100%, atau harus dibatasi satu Penugasan aktif per Pokir? (lihat Gap G-21)

### F. Validasi & Operasional

15. Apakah sistem perlu menolak/memperingatkan **bentrok jadwal** (Anggota yang sama ditugaskan di dua lokasi pada tanggal/jam yang tumpang-tindih)? (lihat Gap G-8)
16. Apakah sistem perlu menolak/memperingatkan **duplikasi Penugasan** (Anggota + Dapil + Tanggal + Jenis yang identik)? (lihat Gap G-9)
17. Apakah Tanggal Kegiatan boleh diisi dengan tanggal yang **sudah lewat** saat Penugasan dibuat (misal untuk mencatat kegiatan yang sudah terjadi tapi belum tercatat), atau harus selalu tanggal mendatang?
18. Apakah Jam Mulai/Jam Selesai perlu diwajibkan (saat ini opsional), mengingat field ini relevan untuk penjadwalan ruang/kendaraan dinas?
19. Apakah diperlukan **audit log** (siapa membuat/mengubah/menghapus, dan kapan) untuk modul ini, mengingat ini menyangkut penugasan resmi Anggota DPRD? (lihat Gap G-14)
20. Apakah "Hapus" Penugasan yang statusnya sudah lama Lewat Masa Penugasan/Selesai memang harus **terkunci permanen** (tidak bisa dihapus sama sekali, termasuk oleh admin), atau perlu hak akses khusus (misal superadmin) yang bisa menghapus data historis untuk keperluan koreksi?

### G. Fokus: Create (Tambah Penugasan) — Field Dapil

21. Apakah seorang Ketua **hanya** berwenang membuat Penugasan untuk Dapil-nya sendiri (scoping 1 Ketua = 1 Dapil, selaras dengan aturan Master Dapil "1 Anggota hanya terdaftar di 1 Dapil"), atau Ketua DPRD sebagai pimpinan memang berwenang menugaskan ke **semua** Dapil? Ini menentukan apakah dropdown Dapil pada Create perlu difilter sesuai sesi login. (lihat Gap G-22)
22. Apakah Dapil yang berstatus **Nonaktif** di Master Dapil (misal karena pemekaran/redistribusi) boleh tetap dipilih untuk Penugasan baru, atau harus otomatis disembunyikan dari dropdown Create/Edit? (lihat Gap G-23)
23. Apakah dibutuhkan peringatan/konfirmasi saat admin mengganti pilihan Dapil setelah sudah mencentang Anggota (karena saat ini langsung mengosongkan checklist tanpa pemberitahuan), atau perilaku reset-senyap ini sudah cukup jelas secara UX? (lihat Gap G-24)
24. Apakah perlu jalur cepat "Tambah Dapil baru" langsung dari form Create Penugasan (serupa pola "Lainnya" pada Config Fraksi), atau pembuatan Dapil baru memang harus selalu lewat `master-dapil.html` terlebih dahulu sebelum bisa dipakai di Penugasan? (lihat Gap G-25)
25. Apakah daftar Dapil pada dropdown perlu diurutkan secara eksplisit (misal alfabetis atau mengikuti nomor urut Dapil resmi KPU), dan siapa/apa yang menjadi sumber urutan "resmi" tersebut? (lihat Gap G-26)
26. Apakah Dapil yang belum punya Anggota aktif sama sekali seharusnya tetap muncul sebagai pilihan di Create (baru diblokir saat submit), atau sebaiknya ditandai/disembunyikan lebih awal di level dropdown Dapil itu sendiri? (lihat Gap G-27)

---

## 11. Asumsi yang Dipakai di Prototipe (Perlu Divalidasi)

- **Satu record = satu Anggota**, bukan satu kegiatan dengan banyak peserta — fan-out tanpa Group ID (lihat Gap G-6).
- **Dapil pada Penugasan dibekukan saat dibuat** (`dapilKode`), tidak otomatis mengikuti perpindahan Dapil Anggota di kemudian hari (lihat Gap G-4).
- **Window H-14** untuk transisi ke "Dalam Proses Penugasan" adalah nilai tebakan pengembang, belum dikonfirmasi klien (lihat Gap G-11).
- **`submittedByMember` adalah simulasi** — belum ada kontrak API nyata dengan aplikasi mobile Anggota untuk mengisi field ini.
- **Pokir & Jenis Kegiatan** masing-masing punya sumber data sendiri (`pokir-data.js`, `jenis-kegiatan-data.js`) yang dibuat khusus untuk mendukung modul ini; `pokir-data.js` **belum** menjadi satu-satunya sumber kebenaran karena `laporan-pokir.html` masih punya array data sendiri yang terpisah.
- Seluruh data pada prototipe ini tersimpan di `localStorage` browser sebagai simulasi — belum terhubung ke database/backend sungguhan, dan tidak sinkron antar perangkat/pengguna lain.
