# Review SRS & Negative Test Case — Master Periode (EP-MD-01)

- **Modul**: Master Periode
- **Kode Modul**: EP-MD-01
- **Sumber SRS**: Ticket Redmine (isi dilampirkan pada permintaan review)
- **Sumber Prototipe**: `master-periode.html` + `periode-data.js` (direferensikan juga oleh `master-periode-reses.html`, `master-fraksi.html`, `kelompok-data.js`)
- **Metode Review**: Membandingkan Business Rule / Acceptance Criteria / Alternate & Exception Flow pada SRS terhadap perilaku aktual yang terimplementasi di file prototipe (client-side, localStorage, tanpa backend sungguhan).
- **Revisi**: Dokumen ini adalah **re-review per 2026-10-15** — prototipe sudah banyak diperbarui sejak review pertama (search/filter/sort/paginasi, lock Kode saat dirujuk, blok Hapus saat dirujuk, validasi tanggal & panjang Nama, tombol Aktifkan cepat, dll sudah diimplementasikan). Struktur dokumen juga dirapikan: Business Rule sekarang dipisah per fungsi halaman (**List / Create / Update / Delete**), masing-masing dengan rule **Positif** & **Negatif** per input/tombol.

---

## 1. Business Rules per Fungsi Halaman

Setiap fungsi (input atau tombol) didokumentasikan dengan **Business Rule Positif** (perilaku saat kondisi terpenuhi) dan **Business Rule Negatif** (perilaku saat kondisi gagal/ditolak), lengkap bukti baris kode.

### A. List (Tampilan, Pencarian, Filter, Urutan, Paginasi)

| Fungsi | Business Rule Positif | Business Rule Negatif | Bukti |
|---|---|---|---|
| Pencarian Kode/Nama (`#fltKeyword`) | Keyword cocok sebagian (substring, case-insensitive) pada Kode **atau** Nama → baris yang cocok ditampilkan; `currentPage` otomatis reset ke 1 | Keyword tidak cocok apa pun → tabel menampilkan baris kosong "Tidak ada data yang cocok dengan pencarian/filter." (bukan error); keyword hanya spasi → di-trim jadi string kosong, filter keyword dianggap tidak aktif (tabel menampilkan semua data, bukan kosong) | `master-periode.html:293,297,306-309,325` |
| Filter Status (`#fltStatus`: Semua/Aktif/Nonaktif) | Filter dikombinasikan **AND** dengan keyword pencarian; pilih Aktif/Nonaktif → hanya baris berstatus tersebut yang tampil | Kombinasi filter Status + keyword tidak match data manapun → tabel kosong dengan pesan yang sama, paginasi menampilkan "Tidak ada data" | `master-periode.html:294,296,352-354` |
| Urutan tabel (otomatis, tanpa kontrol user) | Selalu terurut Tanggal Mulai **menurun** (periode terbaru di atas) | Dua periode dengan Tanggal Mulai **persis sama** → comparator mengembalikan `0`, urutan relatif keduanya tidak dijamin konsisten antar-render (bukan bug fatal, tapi tie-break sekunder seperti Kode/Nama belum didefinisikan) | `master-periode.html:299-303` |
| Paginasi (10 baris/halaman, `#pgBtns`) | >10 hasil filter → terbagi per 10 baris, tombol halaman & info "Menampilkan X-Y dari Z data"; tombol «/» disabled otomatis di halaman pertama/terakhir | `currentPage` melebihi `totalPages` (mis. data terhapus saat di halaman akhir) → otomatis **clamp** ke halaman valid, tidak pernah menampilkan halaman kosong di luar rentang; hasil filter 0 data → `totalPages` tetap minimal 1, tombol navigasi disabled, tidak error | `master-periode.html:317-321,349-361` |

### B. Create (Tambah Periode)

| Fungsi | Business Rule Positif | Business Rule Negatif | Bukti |
|---|---|---|---|
| Tombol "Tambah Periode" (topbar) | Membuka modal kosong (`resetForm()`), judul "Tambah Periode", field Kode selalu **enabled** (periode baru tidak mungkin punya referensi) | — (tidak ada kondisi gagal; selalu berhasil membuka modal) | `master-periode.html:183,387-392` |
| Field Kode Periode (`#fKode`, required) | Kode unik (case-insensitive) → tersimpan apa adanya, tidak di-uppercase otomatis | Kosong/whitespace-only → setelah `trim()` jadi `""`, ditolak toast **"Kode Periode wajib diisi."**; Kode sudah dipakai periode lain (case-insensitive, mis. `prd-2024` vs `PRD-2024`) → ditolak toast **"Kode periode sudah digunakan di sistem."** — keduanya data **tidak tersimpan**, modal tetap terbuka | `master-periode.html:224,420,426,432-433` |
| Field Nama Periode (`#fNama`, required, `minlength=3` `maxlength=150`) | Nama 3-150 karakter → tersimpan apa adanya | Kosong/whitespace-only → toast **"Nama Periode wajib diisi."**; <3 atau >150 karakter → dicegah ganda: HTML5 `minlength`/`maxlength` mencegah submit native, **dan** guard JS `nama.length<3 \|\| >150` dengan toast **"Nama Periode harus 3-150 karakter."** sebagai *defense-in-depth* bila validasi HTML di-bypass (DevTools) | `master-periode.html:227,421,427-428` |
| Field Tanggal Mulai & Selesai (`#fMulai`/`#fSelesai`, `type=date`, required) | Tanggal Selesai > Tanggal Mulai (durasi berapa pun diterima, **tidak ada peringatan** bila bukan 5 tahun — sesuai SRS) | Salah satu/kedua kosong → dicegah HTML5 `required` pada `input type="date"`; Selesai ≤ Mulai (termasuk sama persis) → ditolak JS toast **"Tanggal Selesai harus setelah Tanggal Mulai."**, data tidak tersimpan | `master-periode.html:229-230,422-423,429-430` |
| Field Status (`select#fStatus`: Aktif/Nonaktif, default Aktif) | Pilih **Aktif** (dengan Tanggal Selesai ≥ hari ini) → periode baru jadi Aktif, **semua** periode lain yang sebelumnya Aktif otomatis di-set Nonaktif (constraint "hanya 1 Aktif") beserta `updatedAt`-nya; pilih **Nonaktif** → tersimpan Nonaktif tanpa mengubah periode lain, tanpa syarat tanggal apa pun | Pilih **Aktif** padahal Tanggal Selesai **sudah lewat** dari hari ini (periode sudah berakhir) → ditolak toast **"Periode tidak dapat diaktifkan karena tanggal selesainya sudah lewat dari hari ini."**, data tidak tersimpan, modal tetap terbuka; Opsi dropdown tertutup (hanya 2 nilai tetap) sehingga tidak bisa dipilih nilai lain dari UI; **gap**: bila value dipaksa ke string asing lewat DevTools, `savePeriode()` tidak memvalidasi ulang domain `Aktif`/`Nonaktif`, nilai asing berpotensi tersimpan apa adanya (risiko rendah, butuh akses DevTools) | `master-periode.html:232-237,385,438,457-461` |
| Tombol Simpan (submit form) | Semua validasi lolos → `periodeNextId()` generate id baru (`prd-custom-N`), data masuk `PERIODE_LIST` & `localStorage`, tabel refresh, modal tertutup, toast sukses `Periode "nama" ditambahkan (prototipe)` | Validasi apa pun gagal (lihat baris di atas) → `return false` sebelum simpan, **modal tetap terbuka**, isian form tidak hilang, toast pesan error spesifik ditampilkan, tabel & localStorage tidak berubah | `master-periode.html:418-466,453-456` |
| Tombol Batal (`closeModal()`) | Klik Batal → modal tertutup, tidak ada perubahan data; form akan di-`resetForm()` ulang saat "Tambah Periode" dibuka lagi (tidak ada draft tersimpan) | — (selalu berhasil, tidak ada kondisi gagal) | `master-periode.html:239,415-417` |

### C. Update (Edit Periode & Aktivasi Cepat)

| Fungsi | Business Rule Positif | Business Rule Negatif | Bukti |
|---|---|---|---|
| Tombol "Edit" per baris (`openEdit(id)`) | Data ditemukan → modal terbuka terisi penuh (Kode, Nama, Mulai, Selesai, Status) sesuai data existing | `id` tidak ditemukan di `PERIODE_LIST` (hanya mungkin lewat manipulasi, bukan alur UI normal) → function `return` diam-diam, modal **tidak terbuka**, tanpa pesan error ke user (silent no-op — gap UX minor) | `master-periode.html:393-414` |
| Field Kode Periode saat Edit (lock bersyarat) | Periode **belum** dirujuk Fraksi/Periode Reses/Kelompok DPRD → field tetap *enabled*, bisa diubah bebas ke kode unik baru | Periode **sudah** dirujuk (≥1 referensi) → field otomatis `disabled` + hint kuning "Kode terkunci — periode ini sudah dirujuk oleh ...."; bila lock di-bypass (DevTools re-enable + ubah value) → `savePeriode()` tetap menolak dengan toast **"Kode periode tidak dapat diubah karena masih dirujuk oleh ...."** (re-validasi server-side-style, bukan hanya UI); Kode baru yang bentrok dengan periode lain → ditolak toast duplikat yang sama seperti Create | `master-periode.html:405-412,435-442` |
| Field Nama/Tanggal/Status saat Edit | Field selain Kode tetap bebas diubah **meski** periode sedang dirujuk — hanya Kode yang terkunci. Berlaku untuk Field Status juga: mengubah Status (Aktif↔Nonaktif) pada periode yang **sedang dirujuk** tetap diterima selama Kode tidak diubah, karena lock di `savePeriode()` hanya membandingkan `kode` baru vs lama (`master-periode.html:438`), tidak pernah mengecek field lain | Validasi Nama (3-150 karakter) & urutan tanggal (Selesai > Mulai) berlaku sama seperti Create → ditolak dengan toast yang sama, modal tetap terbuka | `master-periode.html:427-430,438-442` |
| Status Periode yang diedit sendiri bernilai **Nonaktif** (independen dari lock Kode) | Lock field Kode **hanya** ditentukan oleh `periodeReferences()` (ada/tidaknya data anak), **bukan** oleh nilai Status periode itu sendiri — jadi periode Nonaktif yang **belum** dirujuk apa pun tetap punya Kode *fully editable* sama seperti periode Aktif manapun; tidak ada pembatasan tambahan apa pun pada form Edit hanya karena Status-nya Nonaktif | Periode Nonaktif yang **sudah** dirujuk tetap kena lock Kode seperti biasa (sama seperti periode Aktif yang dirujuk) — jadi kombinasi "Nonaktif + dirujuk" **tidak** memberi lock ganda atau pesan berbeda, hanya lock Kode yang sama; **konsep "arsip" pada periode Nonaktif TIDAK mencegah periode itu sendiri diedit** — arsip hanya mencegah modul LAIN menambah data BARU yang merujuk periode ini (lihat AC #11 di Bagian 2), bukan mengunci form Edit periode tersebut | `master-periode.html:405-412,435-442` (lock hanya baca `refs.length`, tidak baca `p.status`) |
| Constraint "1 Periode Aktif" saat Simpan Edit | Mengubah Status periode yang sedang diedit menjadi Aktif → periode lain yang sebelumnya Aktif otomatis Nonaktif (constraint berlaku juga saat Edit, bukan hanya Create) | Tidak ada tombol "non-aktifkan" eksplisit terpisah — periode ini bisa *tiba-tiba* jadi Nonaktif sebagai efek samping mengaktifkan periode LAIN (expected behavior sesuai SRS, bukan bug, namun perlu diketahui user karena tidak ada aksi langsung pada baris yang terpengaruh) | `master-periode.html:457-461` |
| Menonaktifkan periode yang sedang diedit (Status: Aktif → Nonaktif) | Periode yang **bukan** satu-satunya periode Aktif *(mustahil terjadi di model ini karena max 1 Aktif, jadi baris ini selalu berarti: menonaktifkan SATU-SATUNYA periode Aktif yang ada)* → tersimpan Nonaktif tanpa syarat apa pun, **termasuk saat periode ini sedang dirujuk** data anak (Fraksi/Periode Reses/Kelompok DPRD) — data anak yang sudah ada **tidak** berubah/terhapus/orphan, hanya penambahan data BARU ke periode ini di modul lain yang akan ditolak setelahnya (lihat AC #11) | **Gap**: `savePeriode()` tidak punya guard "minimal 1 periode harus Aktif" — menonaktifkan satu-satunya periode Aktif **diterima tanpa peringatan apa pun**, hasil akhirnya **0 periode Aktif** di seluruh sistem. Beberapa modul lain yang auto-select "periode Aktif" (mis. `master-fraksi.html:302-303`, `master-kelompok.html`, `master-dapil.html`, `struktur-organisasi.html`, `pengguna-import-periode.html`) terdegradasi gracefully (dropdown/auto-select jadi kosong, tidak crash — divalidasi lewat pola `aktif ? aktif.id : ''`), tapi admin tidak pernah diberi tahu bahwa aksinya meninggalkan sistem tanpa periode Aktif sama sekali | `master-periode.html:424,448,457-461` (tidak ada guard "harus ada 1 Aktif" di jalur mana pun); `master-fraksi.html:302-303` (contoh dampak ke modul lain) |
| Tombol "Aktifkan" cepat di baris List (`quickActivate(id)`) | Diklik pada periode Nonaktif **dengan Tanggal Selesai ≥ hari ini** → periode itu langsung Aktif **tanpa** membuka modal Edit; periode lain yang sebelumnya Aktif otomatis Nonaktif; `updatedAt` kedua periode diperbarui; toast `Periode "nama" diaktifkan (prototipe)` | Tombol **tidak dirender sama sekali** pada baris yang statusnya sudah Aktif (`activateBtn` kosong) → mencegah aktivasi ganda/no-op dari UI; dipanggil manual dgn id yang sudah Aktif → early-return `if(!p \|\| p.status==='Aktif') return;`, tanpa efek samping; diklik pada periode Nonaktif yang Tanggal Selesai-nya **sudah lewat** dari hari ini (periode sudah berakhir) → ditolak toast **"Periode "nama" tidak dapat diaktifkan karena tanggal selesainya sudah lewat dari hari ini."**, status tidak berubah | `master-periode.html:277-279,329-331,364-378` |
| Tombol Simpan/Batal (modal Edit) | Sama seperti Create: validasi lolos → update `p.kode/nama/mulai/selesai/status` + `updatedAt`, toast `Periode "nama" diperbarui (prototipe)` | Sama seperti Create: validasi gagal → modal tetap terbuka, tidak ada perubahan tersimpan; Batal → modal tertutup tanpa efek samping | `master-periode.html:444-456` |

### D. Delete (Hapus Periode)

| Fungsi | Business Rule Positif | Business Rule Negatif | Bukti |
|---|---|---|---|
| Tombol "Hapus" per baris (`openDelete(id)`) | Periode **tidak** dirujuk Fraksi/Periode Reses/Kelompok DPRD manapun → modal konfirmasi terbuka menampilkan "Hapus periode "nama" (kode)? Tindakan ini tidak dapat dibatalkan." | Periode **sudah** dirujuk (≥1 referensi dari salah satu/lebih sumber) → modal konfirmasi **tidak terbuka sama sekali**; langsung toast `Periode "nama" tidak dapat dihapus karena masih dirujuk oleh <daftar referensi>.` — user tidak sempat melihat tombol Hapus di modal | `master-periode.html:469-480,278-287` |
| Tombol "Hapus" di modal konfirmasi (`confirmDelete()`) | Dieksekusi pada periode yang lolos pre-check `openDelete` (belum dirujuk) → `PERIODE_LIST.splice()` menghapus data, tersimpan ke `localStorage`, tabel refresh, modal tertutup, toast `Periode "nama" dihapus (prototipe)` | *Defense-in-depth*: referensi dicek **ulang** tepat sebelum hapus (bukan hanya saat `openDelete`) — bila di antara waktu modal terbuka & tombol Hapus diklik ternyata periode ini jadi dirujuk (mis. tab lain menambah data), hapus **dibatalkan**, toast generik `Periode tidak dapat dihapus karena masih dirujuk oleh ....` (tanpa nama periode disebut, berbeda dari pesan `openDelete`), modal ditutup, data **tidak** terhapus | `master-periode.html:485-501` |
| Tombol "Batal" pada modal Hapus (`closeDeleteModal()`) | Klik Batal → modal tertutup, `deletingId` di-reset ke `null`, data tidak berubah sama sekali | — (selalu berhasil, tidak ada kondisi gagal) | `master-periode.html:481-484` |

**Catatan lintas-fungsi**: `periodeReferences(periodeId)` adalah **satu sumber kebenaran** yang dipakai baik oleh pengecekan Hapus (`openDelete` + `confirmDelete`) **maupun** lock-Kode saat Edit (`openEdit` + `savePeriode`) — mengecek 3 sumber: `fraksi-data.js` (field `periodeId`), `periode-reses-data.js` (field `periodeId`), dan `kelompok-data.js` via `kelompokByPeriode()`. Tidak ada duplikasi logic yang berisiko *drift* antar fungsi. (`master-periode.html:278-287`)

---

## 2. Pemetaan ke Business Rule / AC pada SRS

| # | Business Rule / AC pada SRS | Status di Prototipe (per 2026-10-15) | Bukti (file:line) |
|---|---|---|---|
| 1 | Kode Periode duplikat ditolak | ✅ Sesuai (case-insensitive) | `master-periode.html:432-433` |
| 2 | Hanya 1 periode Aktif dalam satu waktu | ✅ Sesuai — berlaku di Create, Edit, **dan** tombol Aktifkan cepat | `master-periode.html:364-375,457-461` |
| 3 | Periode yang sudah dirujuk data lain tidak dapat dihapus | ✅ Sesuai — dicek di `openDelete` **dan** di-re-check lagi di `confirmDelete` | `master-periode.html:469-501` |
| 4 | Kode tidak dapat diubah bila periode sudah dirujuk | ✅ Sesuai — field `disabled` di UI + re-validasi JS saat simpan | `master-periode.html:405-412,435-442` |
| 5 | Nama 3–150 karakter | ✅ Sesuai — `minlength`/`maxlength` HTML + guard JS | `master-periode.html:227,428` |
| 6 | Tanggal selesai harus setelah tanggal mulai | ✅ Sesuai | `master-periode.html:430` |
| 7 | Durasi standar 5 tahun, tidak ada peringatan bila bukan 5 tahun | ✅ Sesuai (no-op, sesuai SRS) | — |
| 8 | Tabel urut Tanggal Mulai menurun, 10 baris per halaman | ✅ Sesuai | `master-periode.html:299-303,317-321` |
| 9 | Pesan validasi gagal per field, data tidak tersimpan | ✅ Sesuai — toast spesifik per kasus (lihat Bagian 1.B), modal tetap terbuka saat gagal | `master-periode.html:426-433` |
| 10 | Cari & filter (keyword kode/nama, filter status) | ✅ Sesuai | `master-periode.html:192-201,292-304` |
| 11 | Periode Nonaktif jadi arsip — data turunan tidak bisa ditambah di periode tersebut | ✅ Sesuai — dropdown Periode DPRD di Periode Reses hanya menampilkan periode Aktif + re-check saat simpan | `master-periode-reses.html:264-268,341-348` |
| 12 | Hak akses granular (`periode.tambah`, `periode.ubah`, `periode.hapus`, `periode.aktif`, `periode.nonaktif`) | ❌ Belum diimplementasi — halaman statis, semua tombol CRUD selalu tampil tanpa pengecekan role/permission | Seluruh `master-periode.html` (tidak ada logic role) |
| 13 | Gagal simpan karena koneksi/DB → rollback, data tidak berubah | ⚪ Tidak dapat diuji di prototipe — tidak ada backend/API nyata (localStorage only) | — |

**Catatan**: 11 dari 13 butir SRS kini **sesuai**. Sisa gap murni di #12 (role/permission) & #13 (butuh backend sungguhan) — keduanya memang di luar kapasitas prototipe client-side dan wajib jadi acceptance criteria saat implementasi backend/API.

---

## 3. Negative Test Case untuk QA

Format: **Given–When–Then**, dikelompokkan sesuai fungsi halaman (List/Create/Update/Delete) agar sejalan dengan Bagian 1.

### A. List — Pencarian, Filter, Urutan, Paginasi

| ID | Skenario | Data Uji | Langkah | Expected Result | Status Prototipe |
|---|---|---|---|---|---|
| NEG-01 | Cari dengan keyword yang tidak ada di kode maupun nama | Keyword = `"ZZZZ"` | Ketik `ZZZZ` di kolom pencarian | Tabel menampilkan state kosong ("Tidak ada data yang cocok dengan pencarian/filter."), tanpa error | ✅ Lolos |
| NEG-02 | Filter status pada kondisi tidak ada periode dengan status tersebut (dikombinasikan keyword) | Filter Status = `Aktif` + keyword yang hanya match periode Nonaktif | Pilih filter Status, isi keyword | Tabel kosong, pagination info "Tidak ada data" | ✅ Lolos |
| NEG-03 | Urutan data saat lebih dari 10 periode dibuat | Tambahkan >10 periode dengan tanggal mulai bervariasi | Tambah 11+ periode, buka halaman Master Periode | Data terurut Tanggal Mulai menurun; 10 baris/halaman, kontrol paginasi ke halaman berikutnya muncul | ✅ Lolos |
| NEG-04 | Dua periode dengan Tanggal Mulai persis sama | Periode A & B, `mulai` sama-sama `2024-09-01` | Tambahkan keduanya, lihat urutan tabel | Urutan relatif A vs B tidak dijamin konsisten (tie-break sekunder belum didefinisikan) — bukan error, tapi perlu diketahui QA agar tidak salah anggap bug saat urutan "berubah sendiri" antar reload | ⚠️ Known limitation (bukan bug fatal) — lihat Bagian 1.A |
| NEG-05 | Halaman saat ini jadi out-of-range setelah hapus data | Di halaman 2 (hasil filter), hapus semua data di halaman 2 | Hapus baris terakhir di halaman terakhir | `currentPage` otomatis clamp ke halaman valid terakhir, tidak menampilkan halaman kosong | ✅ Lolos |

### B. Create — Validasi Form Tambah Periode

| ID | Skenario | Data Uji | Langkah | Expected Result | Status Prototipe |
|---|---|---|---|---|---|
| NEG-06 | Kode Periode duplikat (case-insensitive) | Kode `PRD-2024` (sudah ada), kode baru `prd-2024` | Klik Tambah Periode, isi Kode `prd-2024`, Simpan | Ditolak toast "Kode periode sudah digunakan di sistem.", data tidak tersimpan | ✅ Lolos |
| NEG-07 | Kode Periode kosong atau whitespace-only | Kode = `""` atau `"   "` | Submit form tanpa isi Kode / isi hanya spasi | Ditolak toast "Kode Periode wajib diisi." (whitespace di-trim lalu dicek ulang di JS, tidak hanya andalkan `required` native) | ✅ Lolos |
| NEG-08 | Nama Periode kurang dari 3 karakter | Nama = `"P"` | Isi field lain valid, Nama = `"P"`, Simpan | Ditolak — dicegah native `minlength` **dan** guard JS toast "Nama Periode harus 3-150 karakter." bila native di-bypass | ✅ Lolos |
| NEG-09 | Nama Periode lebih dari 150 karakter | Nama = string 151 karakter | Isi Nama 151 karakter, Simpan | Ditolak — dicegah native `maxlength` **dan** guard JS | ✅ Lolos |
| NEG-10 | Tanggal Selesai sebelum Tanggal Mulai | Mulai = `2030-01-01`, Selesai = `2029-01-01` | Isi tanggal terbalik, Simpan | Ditolak toast "Tanggal Selesai harus setelah Tanggal Mulai.", data tidak tersimpan | ✅ Lolos |
| NEG-11 | Tanggal Selesai sama dengan Tanggal Mulai | Mulai = Selesai = `2030-01-01` | Isi tanggal sama, Simpan | Ditolak (durasi 0 hari bukan periode valid) | ✅ Lolos |
| NEG-12 | Tanggal Mulai/Selesai kosong | Mulai = `""` | Submit tanpa isi tanggal mulai | Dicegah native `required` pada `input type="date"` | ✅ Lolos |
| NEG-13 | Status di luar enum (Aktif/Nonaktif) via manipulasi DevTools | Ubah `value` elemen `select#fStatus` jadi string lain lewat console | Submit dengan status tidak valid | Sistem menolak nilai status di luar domain `Aktif`/`Nonaktif` | ❌ Gagal — tidak ada guard JS yang memvalidasi ulang domain status sebelum simpan (risiko rendah, butuh akses DevTools) |
| NEG-14 | User tanpa permission `periode.tambah` mencoba menambah periode | Login sebagai role tanpa permission terkait | Klik "Tambah Periode" | Tombol tidak tampil / aksi ditolak sistem (403) | ❌ Tidak dapat diuji — tidak ada mekanisme role/permission di prototipe |
| NEG-35 | Tambah periode baru dengan Status = Aktif, tapi Tanggal Selesai sudah lewat dari hari ini | Mulai = `2020-01-01`, Selesai = `2023-12-31` (keduanya di masa lalu), Status = Aktif | Isi form dengan tanggal yang sudah lewat, Status Aktif, Simpan | Ditolak toast "Periode tidak dapat diaktifkan karena tanggal selesainya sudah lewat dari hari ini.", data tidak tersimpan | ✅ Lolos |
| NEG-36 | Tambah periode baru dengan Tanggal Selesai sudah lewat, tapi Status = Nonaktif | Mulai = `2020-01-01`, Selesai = `2023-12-31`, Status = Nonaktif | Isi form dengan tanggal lampau, Status Nonaktif, Simpan | Diterima — validasi tanggal-vs-hari-ini **hanya** berlaku saat Status diset Aktif; mencatat periode historis sebagai Nonaktif tetap valid | ✅ Lolos |

### C. Update — Edit Periode & Aktivasi Cepat

| ID | Skenario | Data Uji | Langkah | Expected Result | Status Prototipe |
|---|---|---|---|---|---|
| NEG-15 | Ubah Kode Periode pada periode yang sudah dirujuk | Periode `PRD-2024` dirujuk Periode Reses | Klik Edit `PRD-2024`, coba ubah field Kode | Field Kode `disabled`, hint "Kode terkunci — periode ini sudah dirujuk oleh ...." tampil; bila dipaksa ubah via DevTools lalu Simpan → ditolak toast "Kode periode tidak dapat diubah karena masih dirujuk oleh ...." | ✅ Lolos (dua lapis: UI lock + re-validasi JS) |
| NEG-16 | Ubah Kode Periode menjadi kode yang sudah dipakai periode lain | Edit `PRD-2019`, ubah Kode jadi `PRD-2024` (sudah dipakai) | Simpan | Ditolak toast kode sudah digunakan, data tidak berubah | ✅ Lolos |
| NEG-17 | Ubah Nama/Tanggal/Status pada periode yang sedang dirujuk — field selain Kode tetap boleh diubah | Edit `PRD-2024` (dirujuk), ubah Nama saja | Simpan | Diterima — hanya Kode yang terkunci, field lain bebas diubah | ✅ Lolos (implementasi sengaja, bukan kebetulan) |
| NEG-18 | Tombol "Aktifkan" cepat pada periode yang sudah Aktif | Periode sudah berstatus Aktif | Cek baris periode tersebut di tabel | Tombol "Aktifkan" tidak muncul sama sekali pada baris berstatus Aktif | ✅ Lolos |
| NEG-19 | Mengaktifkan periode baru tidak boleh menyisakan >1 periode Aktif (via Edit maupun Aktifkan cepat) | Ada periode Aktif existing | Edit periode lain → Status = Aktif, Simpan; **atau** klik "Aktifkan" pada periode Nonaktif | Periode lama otomatis Nonaktif; hanya 1 periode Aktif di sistem | ✅ Lolos secara fungsional — **namun tidak ada jaminan atomicity/transaksi** karena tidak ada backend nyata, wajib diuji ulang di level API/DB |
| NEG-20 | `openEdit(id)` dipanggil dengan id yang tidak ada di data | Manipulasi langsung via console: `openEdit('id-tidak-ada')` | Panggil function dengan id invalid | Modal tidak terbuka, tanpa error/pesan ke user | ⚠️ Silent no-op — gap UX minor, risiko rendah karena tidak dapat dipicu dari UI normal |
| NEG-21 | User tanpa permission `periode.ubah`/`periode.aktif` mencoba Edit/Aktifkan | Login sebagai role tanpa permission terkait | Klik Edit atau Aktifkan | Tombol tidak tampil / aksi ditolak sistem | ❌ Tidak dapat diuji — tidak ada role/permission check |
| NEG-31 | Edit periode yang sedang dirujuk, hanya ubah Status (Kode tidak disentuh) | Periode `PRD-2024` dirujuk Periode Reses, saat ini Nonaktif | Klik Edit `PRD-2024`, biarkan Kode apa adanya, ubah Status jadi Aktif, Simpan | Diterima — lock Kode di `savePeriode()` hanya membandingkan value Kode baru vs lama, tidak peduli field lain; Status berubah, periode lain yang Aktif otomatis Nonaktif | ✅ Lolos |
| NEG-32 | Edit periode berstatus Nonaktif yang **belum** dirujuk apa pun | Periode baru dibuat dengan Status Nonaktif, belum dipakai modul lain | Klik Edit, ubah Kode, Nama, Tanggal bebas | Semua field termasuk Kode tetap *fully editable* — tidak ada pembatasan tambahan hanya karena Status-nya Nonaktif; lock Kode murni berdasarkan ada/tidaknya referensi, bukan Status | ✅ Lolos — membuktikan "Nonaktif" dan "dirujuk" adalah dua kondisi independen, bukan satu kondisi gabungan |
| NEG-33 | Menonaktifkan periode yang sedang dirujuk data anak (Fraksi/Periode Reses/Kelompok DPRD) | Periode `PRD-2024` (Aktif) dirujuk data anak di 3 modul | Klik Edit `PRD-2024`, ubah Status jadi Nonaktif, Simpan (Kode tidak diubah) | Diterima tanpa syarat — data anak yang sudah ada tetap utuh (tidak orphan/terhapus); setelah ini, modul lain akan menolak **penambahan data baru** yang merujuk periode ini (lihat NEG-28/AC #11), tapi data lama tidak terpengaruh | ✅ Lolos (sesuai desain — "arsip" hanya membatasi data baru, bukan mengunci periode itu sendiri) |
| NEG-34 | Menonaktifkan satu-satunya periode yang berstatus Aktif (tanpa mengaktifkan periode lain) | Hanya 1 periode Aktif di sistem (`PRD-2024`), tidak ada periode Aktif lain | Klik Edit `PRD-2024`, ubah Status jadi Nonaktif saja, Simpan | Idealnya sistem memperingatkan/menolak karena akan menyisakan **0 periode Aktif** di seluruh sistem (berisiko ke modul lain yang mengandalkan 1 periode Aktif selalu ada) | ❌ Gagal — `savePeriode()` tidak punya guard "minimal 1 Aktif", perubahan diterima begitu saja tanpa peringatan; dampak terlihat di modul lain yang auto-select periode Aktif (mis. `master-fraksi.html:302-303`) — terdegradasi jadi dropdown kosong (tidak crash, tapi tidak diberi tahu ke admin) |
| NEG-37 | Klik "Aktifkan" cepat pada periode Nonaktif yang Tanggal Selesai-nya sudah lewat | Periode `PRD-2019`, Nonaktif, `selesai: '2024-08-31'` (sudah lewat dari hari ini) | Klik tombol "Aktifkan" pada baris `PRD-2019` | Ditolak toast "Periode "nama" tidak dapat diaktifkan karena tanggal selesainya sudah lewat dari hari ini.", status tetap Nonaktif, tidak ada periode lain yang ikut berubah | ✅ Lolos |
| NEG-38 | Edit periode Nonaktif yang Tanggal Selesai sudah lewat, ubah Status jadi Aktif lewat modal Edit | Periode `PRD-2019`, Nonaktif, `selesai` di masa lalu | Klik Edit `PRD-2019`, ubah Status jadi Aktif (tanggal tidak diubah), Simpan | Ditolak toast "Periode tidak dapat diaktifkan karena tanggal selesainya sudah lewat dari hari ini.", modal tetap terbuka, status tidak berubah — konsisten dengan tombol "Aktifkan" cepat (satu rule, dua jalur) | ✅ Lolos |
| NEG-39 | Edit periode Nonaktif yang Tanggal Selesai sudah lewat, ubah Status jadi Aktif **sekaligus** perpanjang Tanggal Selesai ke masa depan | Periode `PRD-2019`, `selesai` lama di masa lalu | Klik Edit `PRD-2019`, ubah Tanggal Selesai ke tanggal masa depan, ubah Status jadi Aktif, Simpan | Diterima — validasi membandingkan Tanggal Selesai yang **baru diisi di form**, bukan nilai lama, sehingga perpanjangan periode yang sudah berakhir lalu mengaktifkannya kembali tetap dimungkinkan | ✅ Lolos |

### D. Delete — Referential Integrity

| ID | Skenario | Data Uji | Langkah | Expected Result | Status Prototipe |
|---|---|---|---|---|---|
| NEG-22 | Hapus periode yang sudah dirujuk oleh Periode Reses | Periode `PRD-2024` dirujuk data Periode Reses | Klik Hapus pada `PRD-2024` | Modal konfirmasi **tidak terbuka**, langsung toast "...tidak dapat dihapus karena masih dirujuk oleh N data Periode Reses." | ✅ Lolos |
| NEG-23 | Hapus periode yang sudah dirujuk oleh Fraksi | Periode dirujuk `fraksi-data.js` | Klik Hapus pada periode tersebut | Modal konfirmasi tidak terbuka, toast serupa NEG-22 menyebut "N data Fraksi" | ✅ Lolos |
| NEG-24 | Hapus periode yang sudah dirujuk oleh Kelompok DPRD | Periode dirujuk `kelompok-data.js` via `kelompokByPeriode()` | Klik Hapus pada periode tersebut | Modal konfirmasi tidak terbuka, toast menyebut "N data Kelompok DPRD" | ✅ Lolos |
| NEG-25 | Referensi baru muncul tepat sebelum klik "Hapus" di modal (race antar-tab/antar-sesi) | Buka modal konfirmasi Hapus (lolos pre-check), lalu — sebelum klik Hapus — tambahkan referensi baru ke periode ini dari sumber lain | Klik "Hapus" di modal setelah referensi baru ada | Hapus **dibatalkan** saat eksekusi (re-check di `confirmDelete`), toast generik "Periode tidak dapat dihapus karena masih dirujuk oleh ....", data tidak terhapus | ✅ Lolos — re-validasi di titik eksekusi, bukan hanya saat modal dibuka |
| NEG-26 | Batal pada modal konfirmasi hapus | Klik Hapus → klik Batal | Verifikasi data tidak berubah | Data periode tetap ada, tidak terhapus | ✅ Lolos |
| NEG-27 | Hapus periode tanpa permission `periode.hapus` | User tanpa permission terkait | Klik tombol Hapus | Tombol Hapus tidak tampil / aksi ditolak sistem | ❌ Tidak dapat diuji — tidak ada role/permission check |

### E. Dampak ke Modul Lain & Exception Flow

| ID | Skenario | Data Uji | Langkah | Expected Result | Status Prototipe |
|---|---|---|---|---|---|
| NEG-28 | Menambah Periode Reses pada Periode DPRD yang berstatus Nonaktif | Periode `PRD-2019` berstatus Nonaktif | Buka Tambah Periode Reses, coba pilih Periode DPRD Nonaktif | Dropdown Periode DPRD hanya menampilkan periode Aktif (periode yang sedang diedit tetap muncul berlabel "Nonaktif - arsip" agar data lama tidak hilang dari tampilan); submit dengan periode Nonaktif ditolak toast "Periode "...." sudah Nonaktif (arsip) — tidak dapat menambah data baru pada periode ini." | ✅ Lolos |
| NEG-29 | Koneksi/DB gagal saat proses simpan | Simulasikan API/DB down (butuh backend nyata) | Submit form Tambah/Edit Periode saat koneksi backend diputus | Pesan error umum, transaksi di-rollback, data sebelumnya tidak berubah, tidak ada baris parsial/korup | ⚪ Tidak dapat diuji di prototipe — wajib diuji ulang di tahap integrasi backend/API |
| NEG-30 | Dua admin mengaktifkan periode berbeda secara bersamaan (race condition lintas-user) | 2 request aktivasi periode berbeda dikirim nyaris bersamaan | Simulasikan concurrent request aktivasi periode A dan periode B | Tetap hanya 1 periode Aktif (constraint transaksi DB + row lock mencegah race condition) | ⚪ Tidak dapat diuji di prototipe (tidak ada backend); wajib jadi acceptance criteria saat desain query/transaksi DB (`UPDATE ... WHERE status='Aktif'` dalam satu transaksi) |

---

## 4. Keterbatasan & Rekomendasi Tersisa

Mayoritas gap pada review sebelumnya sudah diperbaiki di prototipe. Sisa item yang **wajib** jadi perhatian saat implementasi backend/API sesungguhnya:

1. **Kritis — Role & Permission granular** (`periode.tambah`/`ubah`/`hapus`/`aktif`/`nonaktif`) (NEG-14, 21, 27 / AC #12): saat ini siapa pun yang mengakses halaman bisa CRUD tanpa batasan. Blocker sebelum go-live multi-role.
2. **Tinggi — Atomicity constraint "1 Periode Aktif" & race condition hapus/aktivasi** (NEG-19, 25, 30 / AC #13): logic di prototipe sudah benar secara fungsional, tapi harus diterjemahkan ke transaksi DB dengan row lock agar aman dari concurrent request di backend sungguhan.
3. **Tinggi — Guard "minimal 1 periode Aktif" saat Edit mengubah Status jadi Nonaktif** (NEG-34): saat ini admin bisa menonaktifkan satu-satunya periode Aktif tanpa peringatan apa pun, menyisakan 0 periode Aktif di sistem. Perlu validasi tambahan di `savePeriode()` — tolak atau minta konfirmasi eksplisit bila aksi ini akan membuat tidak ada periode Aktif sama sekali — karena beberapa modul lain (Fraksi, Kelompok DPRD, Dapil, Struktur Organisasi, Import Periode Pengguna) mengandalkan adanya 1 periode Aktif untuk auto-select default-nya.
4. **Rendah — Validasi enum Status sisi server** (NEG-13): tambahkan guard eksplisit (atau rely pada constraint DB/enum) supaya nilai status di luar `Aktif`/`Nonaktif` tidak bisa tersimpan meski request dimanipulasi di luar UI normal.
5. **Rendah — Tie-break urutan saat Tanggal Mulai sama** (NEG-04): tambahkan secondary sort (mis. Kode atau `createdAt`) agar urutan tabel deterministik.
6. **Sangat rendah — UX silent no-op pada `openEdit`/`openDelete` dengan id invalid** (NEG-20): tidak berdampak di alur UI normal, hanya relevan bila ada pemanggilan manual/bug di tempat lain yang mengirim id salah.

---

## 5. Catatan Metodologi

- Review pertama dilakukan 2026-10-14; **re-review** (dokumen ini) dilakukan 2026-10-15 setelah prototipe `master-periode.html`, `periode-data.js`, dan `master-periode-reses.html` diperbarui signifikan — ditemukan bahwa mayoritas gap pada review pertama (search/filter/sort/paginasi, lock Kode, blok Hapus, validasi tanggal/panjang Nama, tombol Aktifkan cepat, arsip Periode Nonaktif) **sudah diimplementasikan**. Dokumen ini ditulis ulang berdasarkan pembacaan langsung kode sumber terbaru, bukan asumsi dari dokumen review sebelumnya.
- Business Rule "durasi standar 5 tahun tidak memunculkan peringatan apa pun" **tidak dianggap gap** karena memang itu perilaku yang diminta SRS (no-op), dan prototipe konsisten dengan itu.
- Business Rules pada Bagian 1 disusun per fungsi halaman (List/Create/Update/Delete) sesuai permintaan, agar QA & dev dapat memetakan langsung setiap input/tombol ke rule positif & negatifnya tanpa perlu menyisir ulang kode.
- Negative test case di Bagian 3 ditulis agar dapat langsung dieksekusi QA baik di level prototipe UI (untuk yang berstatus ✅/❌/⚠️) maupun disiapkan ulang sebagai regression test saat backend/API Master Periode selesai diimplementasikan (terutama yang berstatus ⚪).
