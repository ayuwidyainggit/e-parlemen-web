# Review SRS & Negative Test Case — Master Periode (EP-MD-01)

- **Modul**: Master Periode
- **Kode Modul**: EP-MD-01
- **Sumber SRS**: Ticket Redmine (isi dilampirkan pada permintaan review)
- **Sumber Prototipe**: `master-periode.html` + `periode-data.js` (direferensikan juga oleh `master-periode-reses.html`, `master-fraksi.html`)
- **Metode Review**: Membandingkan Business Rule / Acceptance Criteria / Alternate & Exception Flow pada SRS terhadap perilaku aktual yang terimplementasi di file prototipe (client-side, localStorage, tanpa backend sungguhan).

---

## 1. Ringkasan Temuan

| # | Business Rule / AC pada SRS | Status di Prototipe | Bukti (file:line) |
|---|---|---|---|
| 1 | Kode Periode duplikat ditolak | ✅ Sesuai (case-insensitive) | `master-periode.html:318-319` |
| 2 | Hanya 1 periode Aktif dalam satu waktu (mengaktifkan 1 menonaktifkan yang lain) | ⚠️ Sebagian — hanya berjalan lewat form Simpan (Tambah/Edit), **tidak ada** aksi cepat "Aktifkan" terpisah seperti disebut di Alternate Flow | `master-periode.html:334-338` (logic ada), tidak ada tombol `Aktifkan` di `actions-cell` (`master-periode.html:266-269`) |
| 3 | Periode yang sudah dirujuk data lain tidak dapat dihapus | ❌ Tidak diimplementasi — `confirmDelete()` langsung menghapus tanpa cek referensi | `master-periode.html:358-369`; referensi terbukti ada via `periodeNama(id)` di `master-periode-reses.html:301` dan dipakai juga oleh `master-fraksi.html` |
| 4 | Kode tidak dapat diubah bila periode sudah dirujuk | ❌ Tidak diimplementasi — input `fKode` selalu *editable*, tidak pernah di-*disable* | `master-periode.html:207,300` |
| 5 | Nama 3–150 karakter | ❌ Tidak divalidasi — hanya atribut `required`, tanpa `minlength`/`maxlength`/cek JS | `master-periode.html:208,312-313` |
| 6 | Tanggal selesai harus setelah tanggal mulai | ❌ Tidak divalidasi sama sekali di `savePeriode()` | `master-periode.html:310-320` |
| 7 | Durasi standar 5 tahun, tidak ada peringatan bila bukan 5 tahun | ✅ Sesuai (secara tidak langsung — karena validasi durasi memang tidak ada) | — |
| 8 | Tabel urut Tanggal Mulai menurun, 10 baris per halaman | ❌ Tidak diimplementasi — render mengikuti urutan array asli (urutan input), **tanpa sorting dan tanpa pagination** sama sekali | `master-periode.html:256-272` |
| 9 | Pesan validasi gagal per field, data tidak tersimpan | ❌ Tidak diimplementasi — hanya 1 toast generik untuk kasus kode duplikat; field lain tidak punya pesan error per-field | `master-periode.html:318-319` |
| 10 | Cari & filter (keyword kode/nama, filter status) | ❌ Tidak diimplementasi — tidak ada input pencarian atau dropdown filter status di halaman | Tidak ditemukan elemen terkait di `master-periode.html` |
| 11 | Periode Nonaktif jadi arsip — data turunan (periode reses) tidak bisa ditambah di periode tersebut | ❌ Tidak diimplementasi — dropdown "Periode DPRD" di form Tambah/Edit Periode Reses menampilkan **semua** periode termasuk yang Nonaktif, tanpa filter | `master-periode-reses.html:291-292` |
| 12 | Hak akses: Administrator CRUD, Ketua hanya lihat; permission granular (`periode.tambah`, `periode.ubah`, `periode.hapus`, `periode.aktif`, `periode.nonaktif`) | ❌ Tidak diimplementasi — halaman statis, tombol Tambah/Edit/Hapus selalu tampil tanpa pengecekan role/permission apa pun | Seluruh `master-periode.html` (tidak ada logic role) |
| 13 | Gagal simpan karena koneksi/DB → rollback, data tidak berubah | ⚪ Tidak dapat diuji di prototipe — tidak ada backend/API nyata (localStorage only) | — |

**Catatan penting**: prototipe ini adalah *static HTML/JS mock* (lihat hint di halaman: *"Perubahan pada halaman ini bersifat contoh (prototipe) dan berjalan di sisi klien tanpa tersimpan ke server"*). Sebagian gap di atas (#8–#13) wajar belum ada di level prototipe UI, **namun harus menjadi acceptance criteria wajib saat implementasi backend/API sesungguhnya** — karena beberapa di antaranya (terutama #3, #4, #6, #11, #12) adalah Business Rule/AC yang secara eksplisit dituliskan di SRS dan berisiko tinggi jika terlewat.

---

## 2. Negative Test Case untuk QA

Format: **Given–When–Then**. Kolom "Status Prototipe" menandai apakah skenario ini *sudah* bisa gagal/berhasil-ditolak dengan benar pada prototipe saat ini, agar QA tahu mana yang baru bisa diuji penuh setelah backend tersedia.

### A. Validasi Form Tambah/Ubah Periode

| ID | Skenario | Data Uji | Langkah | Expected Result | Status Prototipe |
|---|---|---|---|---|---|
| NEG-01 | Kode Periode duplikat (case-insensitive) | Kode `PRD-2024` (sudah ada), kode baru `prd-2024` | 1. Klik Tambah Periode 2. Isi semua field dengan kode `prd-2024` 3. Klik Simpan | Sistem menolak simpan, menampilkan pesan **"Kode periode sudah digunakan di sistem"**, data tidak tersimpan, baris tabel tidak bertambah | ✅ Lolos (pesan aktual sedikit berbeda teks, tapi perilaku tolak-simpan sesuai) |
| NEG-02 | Kode Periode kosong | Kode = `""` | Submit form tanpa isi Kode | Form gagal submit dengan pesan error pada field Kode ("Kode Periode wajib diisi") | ✅ Lolos (browser native `required`) — pesan masih generik bawaan browser, bukan pesan per-field custom sesuai SRS |
| NEG-03 | Nama Periode kurang dari 3 karakter | Nama = `"P"` | Isi field lain valid, Nama = `"P"`, Simpan | Sistem menolak dengan pesan **"Nama periode minimal 3 karakter"**, data tidak tersimpan | ❌ Gagal — prototipe menyimpan data apa adanya tanpa validasi panjang |
| NEG-04 | Nama Periode lebih dari 150 karakter | Nama = string 151 karakter | Isi Nama dengan 151 karakter, Simpan | Sistem menolak dengan pesan **"Nama periode maksimal 150 karakter"**, data tidak tersimpan | ❌ Gagal — tidak ada `maxlength`/validasi, data tersimpan apa adanya |
| NEG-05 | Tanggal Selesai sebelum Tanggal Mulai | Mulai = `2030-01-01`, Selesai = `2029-01-01` | Isi tanggal terbalik, Simpan | Sistem menolak dengan pesan **"Tanggal selesai harus setelah tanggal mulai"**, data tidak tersimpan | ❌ Gagal — tersimpan tanpa validasi, baris baru muncul dengan rentang tanggal terbalik |
| NEG-06 | Tanggal Selesai sama dengan Tanggal Mulai | Mulai = Selesai = `2030-01-01` | Isi tanggal sama, Simpan | Sistem menolak (durasi 0 hari bukan periode valid), pesan error pada field tanggal | ❌ Gagal — tersimpan tanpa validasi |
| NEG-07 | Tanggal Mulai/Selesai kosong | Mulai = `""` | Submit tanpa isi tanggal mulai | Form gagal submit, pesan error pada field Tanggal Mulai | ✅ Lolos (browser native `required` pada `input type="date"`) |
| NEG-08 | Status tidak dipilih / nilai di luar enum (Aktif/Nonaktif) | Manipulasi langsung value `select#fStatus` via DevTools menjadi string lain | Submit dengan status tidak valid | Sistem menolak nilai status di luar domain `Aktif`/`Nonaktif` | ❌ Gagal — tidak ada validasi enum sisi server (tidak ada server); sisi klien hanya mengandalkan `<option>` yang fixed, tapi tidak ada guard tambahan |
| NEG-09 | Field disubmit dengan whitespace saja (" ") pada Kode/Nama | Kode = `"   "` | Isi Kode hanya spasi, Simpan | Sistem menolak sebagai field kosong (setelah trim), pesan error "Kode Periode wajib diisi" | ❌ Gagal — `trim()` dipanggil (`master-periode.html:312`) tapi hasil kosong tidak dicek lagi sebelum disimpan, sehingga periode dengan kode kosong bisa tersimpan |

### B. Aktivasi Periode

| ID | Skenario | Data Uji | Langkah | Expected Result | Status Prototipe |
|---|---|---|---|---|---|
| NEG-10 | Mengaktifkan periode baru tidak boleh menyisakan >1 periode Aktif | Ada periode `PRD-2024` berstatus Aktif | Tambah/Edit periode lain, set Status = Aktif, Simpan | Periode lama otomatis menjadi Nonaktif; hanya 1 periode Aktif di seluruh sistem (constraint ini idealnya dijamin dalam 1 transaksi DB) | ✅ Lolos secara fungsional di prototipe (logic di `savePeriode()`), namun **tidak ada jaminan atomicity/transaksi** karena tidak ada backend nyata — wajib diuji ulang di level API/DB |
| NEG-11 | Tombol "Aktifkan" cepat (tanpa buka form Edit) sesuai Alternate Flow | Periode Nonaktif dipilih | Klik tombol "Aktifkan" pada baris periode Nonaktif | Periode tersebut menjadi Aktif, periode Aktif sebelumnya menjadi Nonaktif, tanpa perlu membuka modal Edit | ❌ Gagal — tombol "Aktifkan" tidak ada di UI, hanya bisa lewat Edit modal → mengubah dropdown Status |
| NEG-12 | User tanpa permission `periode.aktif` mencoba mengaktifkan periode | Login sebagai user role tanpa permission `periode.aktif` | Coba ubah status periode menjadi Aktif | Sistem menolak aksi (403/akses ditolak), status periode tidak berubah | ❌ Tidak dapat diuji — tidak ada mekanisme permission/role di prototipe sama sekali |

### C. Hapus Periode (Referential Integrity)

| ID | Skenario | Data Uji | Langkah | Expected Result | Status Prototipe |
|---|---|---|---|---|---|
| NEG-13 | Hapus periode yang sudah dirujuk oleh Periode Reses | Periode `PRD-2024` dirujuk oleh data Periode Reses (`master-periode-reses.html`, `periodeId: 'prd-2024'`) | Klik Hapus pada periode `PRD-2024`, konfirmasi Hapus | Sistem **menolak** penghapusan, menampilkan pesan "Periode tidak dapat dihapus karena masih dirujuk oleh data lain", data periode tetap ada | ❌ Gagal — `confirmDelete()` menghapus periode tanpa cek referensi apa pun; data anak (Periode Reses) jadi *orphan* merujuk `periodeId` yang sudah tidak ada |
| NEG-14 | Hapus periode yang sudah dirujuk oleh Fraksi | Periode dirujuk oleh `master-fraksi.html` | Hapus periode yang sedang dipakai konfigurasi Fraksi | Sistem menolak penghapusan dengan pesan serupa NEG-13 | ❌ Gagal — sama seperti NEG-13, tidak ada pengecekan |
| NEG-15 | Hapus periode tanpa permission `periode.hapus` | User tanpa permission terkait | Klik tombol Hapus | Tombol Hapus tidak tampil / aksi ditolak sistem | ❌ Tidak dapat diuji — tidak ada role/permission check |
| NEG-16 | Batal pada modal konfirmasi hapus | Klik Hapus → klik Batal pada modal konfirmasi | Verifikasi data tidak berubah | Data periode tetap ada, tidak terhapus | ✅ Lolos — `closeDeleteModal()` hanya menutup modal tanpa efek samping |

### D. Ubah Periode (Kode Terkunci saat Dirujuk)

| ID | Skenario | Data Uji | Langkah | Expected Result | Status Prototipe |
|---|---|---|---|---|---|
| NEG-17 | Ubah Kode Periode pada periode yang sudah dirujuk | Periode `PRD-2024` dirujuk Periode Reses | Klik Edit pada `PRD-2024`, ubah field Kode menjadi `PRD-2024-X`, Simpan | Field Kode harus *disabled/readonly* atau sistem menolak perubahan Kode dengan pesan "Kode tidak dapat diubah karena periode sudah dirujuk" | ❌ Gagal — field Kode tetap dapat diedit bebas dan tersimpan, berpotensi memutus relasi data anak yang merujuk kode lama (jika relasi berbasis kode, bukan id) |
| NEG-18 | Ubah Kode Periode menjadi kode yang sudah dipakai periode lain | Edit `PRD-2019`, ubah Kode menjadi `PRD-2024` (sudah dipakai) | Simpan | Sistem menolak dengan pesan kode sudah digunakan, data tidak berubah | ✅ Lolos — cek dupe di `savePeriode()` mengecualikan `editingId` sendiri, bukan periode lain, jadi tetap terdeteksi duplikat |
| NEG-19 | Ubah Nama Periode/Status pada periode yang sedang dirujuk — field selain Kode tetap boleh diubah | Edit `PRD-2024` (dirujuk), ubah Nama saja | Simpan | Sistem menerima perubahan Nama/Status/Tanggal, hanya Kode yang terkunci | ⚠️ Secara tidak sengaja "lolos" karena semua field termasuk Kode memang masih bebas diubah — bukan karena implementasi benar, tapi karena belum ada constraint apa pun |

### E. Pencarian, Filter, Urutan & Paginasi

| ID | Skenario | Data Uji | Langkah | Expected Result | Status Prototipe |
|---|---|---|---|---|---|
| NEG-20 | Cari dengan keyword yang tidak ada di kode maupun nama | Keyword = `"ZZZZ"` | Ketik `ZZZZ` di kolom pencarian | Tabel menampilkan state kosong ("Data tidak ditemukan"), tanpa error | ❌ Tidak dapat diuji — tidak ada input pencarian di halaman |
| NEG-21 | Filter status pada kondisi tidak ada periode dengan status tersebut | Filter = status yang tidak match data manapun | Pilih filter status | Tabel kosong, pesan "Tidak ada data" | ❌ Tidak dapat diuji — tidak ada filter status di halaman |
| NEG-22 | Urutan data saat lebih dari 10 periode dibuat | Tambahkan >10 periode dengan tanggal mulai bervariasi | Tambah 11+ periode, buka halaman Master Periode | Data terurut Tanggal Mulai menurun; hanya 10 baris tampil per halaman, ada kontrol paginasi ke halaman berikutnya | ❌ Gagal — seluruh data tampil dalam satu tabel tanpa urutan berdasarkan tanggal (urutan = urutan input/array) dan tanpa kontrol paginasi apa pun |

### F. Periode Nonaktif sebagai Arsip

| ID | Skenario | Data Uji | Langkah | Expected Result | Status Prototipe |
|---|---|---|---|---|---|
| NEG-23 | Menambah Periode Reses pada Periode DPRD yang berstatus Nonaktif | Periode `PRD-2019` berstatus Nonaktif | Buka Tambah Periode Reses, pilih Periode DPRD = `PRD-2019` (Nonaktif), Simpan | Sistem menolak — dropdown Periode DPRD seharusnya tidak menampilkan periode Nonaktif, atau submit ditolak dengan pesan "Tidak dapat menambah data pada periode yang sudah nonaktif/diarsipkan" | ❌ Gagal — dropdown `#fPeriodeId` di `master-periode-reses.html:291-292` menampilkan **semua** periode (termasuk Nonaktif) tanpa filter, dan `savePeriode()` di halaman itu juga tidak menolak pemilihan periode Nonaktif |

### G. Exception Flow — Kegagalan Sistem

| ID | Skenario | Data Uji | Langkah | Expected Result | Status Prototipe |
|---|---|---|---|---|---|
| NEG-24 | Koneksi/DB gagal saat proses simpan | Simulasikan API/DB down (butuh backend nyata) | Submit form Tambah/Edit Periode saat koneksi backend diputus | Sistem menampilkan pesan error umum ("Gagal menyimpan data, silakan coba lagi"), transaksi di-rollback, data sebelumnya tidak berubah, tidak ada baris parsial/korup | ⚪ Tidak dapat diuji di prototipe — wajib diuji ulang di tahap integrasi backend/API |
| NEG-25 | Dua admin mengaktifkan periode berbeda secara bersamaan (race condition) | 2 request aktivasi periode berbeda dikirim nyaris bersamaan | Simulasikan concurrent request aktivasi periode A dan periode B | Sistem tetap menghasilkan hanya 1 periode Aktif (constraint transaksi DB mencegah race condition), tidak boleh ada 2 periode Aktif meskipun request bersamaan | ⚪ Tidak dapat diuji di prototipe (tidak ada backend); jadi acceptance criteria wajib saat desain query/transaksi DB (`UPDATE ... WHERE status='Aktif'` dalam satu transaksi dengan row lock) |

---

## 3. Rekomendasi Prioritas Perbaikan

1. **Kritis — Referential integrity pada Hapus & Ubah Kode** (NEG-13, 14, 17): tanpa ini, data anak (Periode Reses, Fraksi) bisa jadi *orphan* atau rujukan rusak. Harus jadi blocker sebelum go-live.
2. **Tinggi — Validasi tanggal (selesai > mulai)** (NEG-05, 06): mencegah data periode yang secara logis tidak valid masuk ke sistem.
3. **Tinggi — Enforcement arsip pada Periode Nonaktif** (NEG-23): mencegah data turunan (reses, dan kemungkinan modul lain yang terikat periode) tertambah pada periode yang sudah ditutup.
4. **Menengah — Validasi panjang Nama & pesan error per-field** (NEG-03, 04, 08, 09): memperbaiki kualitas data dan UX sesuai Exception Flow SRS.
5. **Menengah — Sorting & paginasi tabel** (NEG-22): penting begitu jumlah periode bertambah seiring waktu (5 tahun per periode, tapi data uji/historis bisa banyak).
6. **Menengah — Role & permission (`periode.*`)** (NEG-12, 15): saat ini siapa pun yang mengakses halaman bisa CRUD tanpa batasan; perlu diverifikasi ulang begitu modul RBAC terhubung ke halaman ini.
7. **Rendah — Search & filter** (NEG-20, 21): fitur pelengkap, prioritas setelah poin 1-6 selesai.

---

## 4. Catatan Metodologi

- Review dilakukan dengan membaca langsung kode sumber prototipe (`master-periode.html`, `periode-data.js`, `master-periode-reses.html`) per 2026-10-14, bukan asumsi dari deskripsi SRS saja.
- Business Rule "durasi standar 5 tahun tidak memunculkan peringatan apa pun" **tidak dianggap gap** karena memang itu perilaku yang diminta SRS (no-op), dan prototipe konsisten dengan itu (tidak ada validasi durasi sama sekali).
- Negative test case di atas ditulis agar dapat langsung dieksekusi QA baik di level prototipe UI (untuk yang berstatus ✅/❌) maupun disiapkan ulang sebagai regression test saat backend/API Master Periode selesai diimplementasikan (terutama yang berstatus ⚪).
