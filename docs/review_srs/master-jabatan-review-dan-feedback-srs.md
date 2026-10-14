# Review SRS & Negative Test Case — Master Jabatan (EP-MD-02)

- **Modul**: Master Jabatan (Unit Tipe)
- **Kode Modul**: EP-MD-02
- **Sumber SRS**: Ticket Redmine (isi dilampirkan pada permintaan review)
- **Sumber Prototipe**: `master-jabatan.html` + `jabatan-data.js` (direferensikan juga oleh `pengguna.html`, `laporan-duk.html` via `jabatanNama(id)`)
- **Metode Review**: (1) Menganalisis kelengkapan & konsistensi internal dokumen SRS itu sendiri; (2) membandingkan Business Rule/Acceptance Criteria/Alternate & Exception Flow terhadap perilaku aktual di prototipe (client-side, localStorage, tanpa backend sungguhan).
- **Tanggal Review**: 2026-10-14

---

## 1. Temuan pada Dokumen SRS (Kelengkapan & Konsistensi)

Bagian ini menjawab permintaan review utama: SRS EP-MD-02 saat ini **kurang lengkap dan punya beberapa inkonsistensi internal** dibanding pola yang sudah dipakai di EP-MD-01 (Master Periode). Berikut saran perbaikan, urut dari yang paling krusial.

### 1.1 Kontradiksi: "Hapus" vs "Nonaktifkan" untuk jabatan yang sedang dipakai ⚠️ **Kritis**

AC menyebut: *"Jabatan yang dipakai penempatan dapat dihapus didalam sistem, jika ada pegawai yang sedang memegang jabatan tersebut maka tampilan jabatan akan (-)."*

Sementara Alternate Flow menyebut: *"Nonaktifkan: jabatan Non Aktif tidak muncul di pilihan baru tetapi tetap tampil pada riwayat penempatan."*

Dua aturan ini saling bertentangan secara desain:
- Jika jabatan yang **sedang aktif dipakai** pegawai boleh **dihapus permanen** (hard delete) sehingga riwayat penempatan pegawai lama menampilkan `(-)` yang tidak informatif, maka fitur **Nonaktifkan** (yang justru dirancang untuk mempertahankan riwayat tetap terbaca) jadi tidak ada gunanya — kenapa admin memilih Nonaktifkan kalau Hapus saja sudah diizinkan dan lebih "final"?
- Pola ini juga **berbeda arah** dari Master Periode (EP-MD-01) yang justru **menolak** penghapusan data yang masih dirujuk data lain (lihat `master-periode-review-dan-negative-test-case.md` NEG-13/14). Perlu dikonfirmasi ke bisnis apakah perbedaan ini memang disengaja (Jabatan ≠ Periode) atau salah tulis AC.

**Saran**: pilih salah satu pola dan tuliskan konsisten:
- **Opsi A (disarankan, konsisten dengan EP-MD-01 & praktik referential integrity)**: Hapus **ditolak** selama jabatan masih dirujuk oleh penempatan pegawai (aktif maupun riwayat) ATAU masih punya jabatan anak (Parent). Admin wajib **Nonaktifkan** dulu agar jabatan hilang dari pilihan baru, riwayat lama tetap menampilkan nama jabatan yang benar (bukan `(-)`). Hapus permanen hanya untuk jabatan yang **belum pernah dipakai sama sekali**.
- **Opsi B**: Jika memang hard-delete-meski-dipakai adalah keputusan bisnis (misal untuk skenario input salah yang perlu dibersihkan cepat), maka AC harus menegaskan ini hanya berlaku untuk kondisi tertentu (misal: hanya pegawai yang sudah tidak aktif/riwayat lama), dan sistem wajib menampilkan **konfirmasi tegas** berisi jumlah pegawai yang terdampak sebelum admin menekan Hapus — bukan silent delete seperti saat ini di prototipe.

### 1.2 "Level dibuat otomatis dan bersifat dinamis" — aturan hitung tidak didefinisikan

AC hanya menyatakan levelnya otomatis & dinamis, tapi tidak menjelaskan **rumus/algoritmanya**. Pertanyaan yang harus dijawab SRS:
- Apakah `Level = Parent.Level + 1` (root = Level 1)?
- Apakah Level unik per Category, atau boleh sama untuk jabatan yang setara (contoh: beberapa jabatan Fungsional level 5 yang sama, seperti terlihat di data seed `jabatan-data.js`)?
- Jika Parent sebuah jabatan diubah (re-parenting), apakah Level jabatan tersebut **dan seluruh anak-cucunya** otomatis dihitung ulang (cascade)? Ini harus jadi Business Rule eksplisit, bukan hanya "otomatis & dinamis".

Prototipe saat ini malah **berkebalikan total**: Level adalah input angka manual wajib diisi admin (`master-jabatan.html:239`, `jabatan-data.js:6` bahkan mencatat "`Level` diisi manual sesuai `hierarchy_level`"). Ini bukan sekadar gap implementasi — SRS perlu diperjelas dulu sebelum tim dev bisa membangun logika "otomatis"-nya dengan benar.

### 1.3 Field `Status` (Aktif/Nonaktif) tidak ada di Data Requirement

Alternate Flow mewajibkan aksi **Nonaktifkan**, tapi dokumen tidak punya bagian "Data Requirement" yang mendefinisikan field `status`. Tanpa field ini, tidak ada cara sistem membedakan jabatan aktif vs nonaktif. **Saran**: tambahkan field `status` (enum `Aktif` / `Nonaktif`, default `Aktif`) ke Data Requirement, plus definisikan tombol aksi "Nonaktifkan"/"Aktifkan" di Main Flow (mirror pola `periode.aktif`/`periode.nonaktif` di EP-MD-01).

### 1.4 Inkonsistensi penamaan permission dalam Precondition

Precondition menulis dua daftar permission yang tidak sinkron:
> "...memiliki permission **jabatan.lihat, jabatan.create, jabatan.ubah, jabatan.delete**" ... "Untuk perubahan diperlukan permission **jabatan.tambah, jabatan.ubah, jabatan.hapus**."

`create` vs `tambah`, `delete` vs `hapus` — dua konvensi penamaan berbeda untuk aksi yang sama dalam satu dokumen. **Saran**: samakan ke satu konvensi (disarankan Bahasa Indonesia agar konsisten dengan EP-MD-01: `jabatan.lihat`, `jabatan.tambah`, `jabatan.ubah`, `jabatan.hapus`), dan tambahkan `jabatan.aktifkan`/`jabatan.nonaktifkan` bila usulan 1.3 diadopsi.

### 1.5 "Kode periode yang sama ditolak..." — sisa salin-tempel dari SRS Master Periode

Baris pertama Acceptance Criteria masih berbunyi: *"Kode **periode** yang sama ditolak dengan oleh sistem dengan pesan kode **periode** sudah digunakan di sistem."* Ini jelas sisa copy-paste dari EP-MD-01 yang belum diubah menjadi "Kode **jabatan**". Tolong perbaiki redaksinya (termasuk tata bahasa "ditolak dengan oleh sistem" yang rancu — cukup "ditolak oleh sistem").

### 1.6 Nama Menu "Master Jabatan (Unit Tipe)" membingungkan

Judul modul menulis "Master Jabatan **(Unit Tipe)**", padahal di aplikasi sudah ada menu terpisah **Master Unit Type** (`master-unit-type.html`) yang levelnya berbeda konsep (tipe unit organisasi, bukan jabatan). Perlu dipastikan apakah "(Unit Tipe)" ini:
- salah tempel dari modul lain, atau
- sengaja menunjukkan relasi Jabatan↔Unit Type yang perlu dijelaskan lebih lanjut di Deskripsi/Data Requirement (kalau iya, field relasinya harus disebut eksplisit).

### 1.7 Istilah "jenis jabatan" vs "Category" tidak konsisten

Main Flow langkah 2 menyebut "tab **jenis** jabatan", sementara langkah 4, Business Rule, dan deskripsi kolom tabel semuanya memakai istilah **Kategori**/**Category** (Kelompok/Struktural/Fungsional/Pelaksana). Pakai satu istilah saja di seluruh dokumen (disarankan "Kategori" agar konsisten berbahasa Indonesia, prototipe sendiri sudah memakai field `category` di kode namun label UI Indonesia "Category" — idealnya label UI juga di-Indonesiakan jadi "Kategori").

### 1.8 Aturan Parent tidak lengkap

Business Rule hanya menyebut "Data parent akan selalu bertambah jika ada penambahan baru" (ini menjelaskan perilaku *dropdown pilihan*, bukan aturan relasi). Yang belum diatur SRS:
- **Lintas kategori**: bolehkah Parent dari sebuah jabatan berasal dari Category yang berbeda (misal jabatan Struktural jadi Parent jabatan Pelaksana)? Prototipe membatasi Parent hanya ke "jabatan sejenis/Category yang sama" — ini keputusan desain yang perlu dikonfirmasi & dituliskan sebagai Business Rule resmi, bukan diam-diam ditentukan di level UI.
- **Pencegahan siklus (circular reference)**: SRS tidak menyebutkan sama sekali bahwa sistem harus mencegah jabatan menjadi Parent dari leluhurnya sendiri. Prototipe sudah menjaga ini (`jabatanDescendantIds`), tapi karena tidak tertulis di SRS, risikonya hilang saat re-implementasi di backend. **Wajib** ditambahkan sebagai Business Rule/AC eksplisit.
- **Re-parenting jabatan yang sudah punya anak**: apakah jabatan yang sudah memiliki anak boleh pindah Category/Parent? Jika boleh, bagaimana nasib Level anak-anaknya (lihat 1.2)?

### 1.9 Tidak ada aturan format/karakter untuk `Kode`

Business Rule hanya membatasi panjang ("maksimal 20 karakter") tapi tidak format. Dari contoh data (`KEPALA_BAGIAN`, `ANGGOTA`) terlihat konvensi `UPPER_SNAKE_CASE`, tapi ini tidak dituliskan sebagai aturan formal. **Saran**: tambahkan Business Rule format kode (huruf besar, angka, underscore saja — tanpa spasi/simbol) agar tidak jadi ambigu saat validasi dibangun.

### 1.10 Urutan & paginasi tabel tidak eksplisit

Main Flow langkah 2 menyebut "10 baris per halaman" (bagus, sudah eksplisit — beda dengan EP-MD-01 yang baru disebut di Alternate Flow), tapi **urutan tampilan** (sort order) tidak disebutkan: berdasarkan Level menaik? Kode alfabetis? Tanggal dibuat? Perlu ditambahkan satu kalimat Business Rule agar perilaku sort konsisten antar implementasi.

---

## 2. Perbandingan SRS vs Prototipe

| # | Business Rule / AC pada SRS | Status di Prototipe | Bukti (file:line) |
|---|---|---|---|
| 1 | Kode jabatan duplikat ditolak | ✅ Sesuai (case-insensitive, unik lintas Category) | `master-jabatan.html:399-400` |
| 2 | Kode maksimal 20 karakter | ❌ Tidak divalidasi — tidak ada `maxlength` di HTML maupun cek panjang di JS | `master-jabatan.html:238` |
| 3 | Nama 3–150 karakter | ❌ Tidak divalidasi sama sekali (hanya `required`) | `master-jabatan.html:241`, `saveJabatan()` di `master-jabatan.html:390-416` |
| 4 | Nama unik pada jenis/Category yang sama | ❌ Tidak diimplementasi — tidak ada pengecekan duplikat Nama sama sekali (hanya Kode yang dicek) | `master-jabatan.html:399-400` |
| 5 | Level dibuat otomatis dan bersifat dinamis | ❌ Berkebalikan — Level adalah input manual wajib (`type="number"`), bukan hasil hitung sistem | `master-jabatan.html:239`; catatan di `jabatan-data.js:6` mengonfirmasi ini keputusan prototipe |
| 6 | Parent opsional saat tambah/ubah | ✅ Sesuai — dropdown Parent opsional ("Tidak Ada" sebagai default) | `master-jabatan.html:242-244,344` |
| 7 | Data Parent selalu bertambah saat ada penambahan baru | ✅ Sesuai — `populateParentOptions()` membangun ulang pilihan dari `JABATAN_LIST` terkini setiap modal dibuka | `master-jabatan.html:342-353` |
| 8 | (Tidak tertulis di SRS, tapi krusial) Pencegahan circular reference Parent | ✅ Sesuai — ID diri sendiri & seluruh descendant dikecualikan dari pilihan Parent | `master-jabatan.html:345`, `jabatan-data.js:81-91` |
| 9 | Jabatan yang dipakai penempatan dapat dihapus; bila dipakai pegawai, tampilan jadi `(-)` | ⚠️ Sebagian — penghapusan memang tidak diblokir oleh status "dipakai pegawai" (karena memang tidak ada pengecekan sama sekali ke `pegawai-data.js`), namun fallback tampilan setelah dihapus adalah em dash `—` (`jabatanNama()`), bukan literal `(-)` seperti disebut AC; dan **tidak ada peringatan/konfirmasi** ke admin bahwa jabatan sedang dipakai sebelum menghapus | `jabatan-data.js:95-99` (fallback `—`); `pengguna.html:420`, `laporan-duk.html:249` (pemanggil) |
| 10 | Jabatan dengan anak (dirujuk sebagai Parent) — aturan hapus | ⚠️ Tidak ada di SRS, tapi prototipe **menolak** hapus jika punya anak — kebalikan dari temuan #9 di atas, memperkuat kontradiksi di §1.1 | `master-jabatan.html:419-432,438-440` |
| 11 | Ubah: Kode tidak dapat diubah bila jabatan sudah dipakai | ❌ Tidak diimplementasi — field Kode selalu *editable* di modal Edit, tidak pernah di-*disable* | `master-jabatan.html:379` (tidak ada `disabled` ditambahkan berdasarkan status pemakaian) |
| 12 | Nonaktifkan: jabatan Non Aktif tidak muncul di pilihan baru tapi tetap tampil di riwayat | ❌ Tidak dapat diimplementasi — field `status`/`Aktif`-`Nonaktif` tidak ada sama sekali di model data maupun UI | Tidak ditemukan field `status` di `jabatan-data.js` |
| 13 | Cari dan filter berdasarkan kode, nama, jenis, dan status | ❌ Tidak diimplementasi — hanya ada tab filter Category, tidak ada input pencarian kode/nama maupun filter status (karena status pun belum ada) | Tidak ditemukan elemen pencarian di `master-jabatan.html` |
| 14 | Tabel 10 baris per halaman | ❌ Tidak diimplementasi — seluruh data per tab Category dirender dalam satu tabel tanpa paginasi | `master-jabatan.html:313-333` |
| 15 | Validasi gagal: pesan per field | ❌ Tidak diimplementasi — satu toast gabungan "Code, Nama, & Level wajib diisi" untuk semua field, tidak per-field | `master-jabatan.html:398` |
| 16 | Hak akses: Administrator CRUD, Ketua lihat saja; permission granular `jabatan.*` | ❌ Tidak diimplementasi — halaman statis tanpa pengecekan role/permission apa pun; tombol Tambah/Edit/Hapus selalu tampil | Seluruh `master-jabatan.html` (tidak ada logic role); tidak ditemukan konstanta `jabatan.*` di `rbac-data.js` |
| 17 | Gagal simpan: rollback dan pesan umum | ⚪ Tidak dapat diuji di prototipe — tidak ada backend/API nyata (localStorage only) | — |

**Catatan**: seperti review EP-MD-01, prototipe ini adalah *static HTML/JS mock* (hint di halaman: *"Perubahan pada halaman ini bersifat contoh (prototipe) dan berjalan di sisi klien tanpa tersimpan ke server"*). Gap #14, #16, #17 wajar belum ada di level prototipe UI murni, **namun #2–#5, #9, #11, #12, #13, #15 adalah Business Rule/AC yang eksplisit tertulis di SRS** dan wajib menjadi acceptance criteria wajib saat implementasi backend/API sesungguhnya.

---

## 3. Negative Test Case untuk QA

Format: **Given–When–Then**. Kolom "Status Prototipe" menandai apakah skenario sudah bisa diuji di prototipe saat ini.

### A. Validasi Form Tambah/Ubah Jabatan

| ID | Skenario | Data Uji | Langkah | Expected Result | Status Prototipe |
|---|---|---|---|---|---|
| NEG-01 | Kode duplikat (case-insensitive), lintas Category | Kode `KETUA` (sudah ada di Kelompok), input Kode baru `ketua` di Category Struktural | Tambah Jabatan baru, Category = Struktural, Kode = `ketua` | Sistem menolak simpan dengan pesan **"Kode jabatan sudah digunakan di sistem"**, data tidak tersimpan | ✅ Lolos (pesan aktual: `Code "ketua" sudah digunakan`, perilaku tolak-simpan sesuai) |
| NEG-02 | Kode lebih dari 20 karakter | Kode = 25 karakter, misal `JABATAN_SANGAT_PANJANG_SEKALI` | Isi Kode 25 karakter, field lain valid, Simpan | Sistem menolak dengan pesan **"Kode maksimal 20 karakter"**, data tidak tersimpan | ❌ Gagal — tidak ada validasi panjang, data tersimpan dengan Kode 25 karakter (lihat seed `PERANCANG_PERATURAN_PERUNDANG_UNDANGAN_AHLI_PERTAMA` yang sudah >20 karakter, membuktikan aturan ini tidak pernah ditegakkan bahkan pada data seed) |
| NEG-03 | Nama kurang dari 3 karakter | Nama = `"A"` | Isi Nama = `"A"`, field lain valid, Simpan | Sistem menolak dengan pesan **"Nama jabatan minimal 3 karakter"**, data tidak tersimpan | ❌ Gagal — tersimpan tanpa validasi panjang |
| NEG-04 | Nama lebih dari 150 karakter | Nama = string 151 karakter | Isi Nama 151 karakter, Simpan | Sistem menolak dengan pesan **"Nama jabatan maksimal 150 karakter"** | ❌ Gagal — tidak ada `maxlength`/validasi |
| NEG-05 | Nama duplikat pada Category yang sama | Category = Kelompok, Nama `"Ketua"` (sudah ada), tambah lagi Nama `"ketua"` di Kelompok | Tambah Jabatan, Category = Kelompok, Nama = `"ketua"` | Sistem menolak dengan pesan **"Nama jabatan sudah digunakan pada Category ini"**, data tidak tersimpan | ❌ Gagal — tidak ada pengecekan duplikat Nama sama sekali, data tersimpan dua kali dengan Nama identik dalam satu Category |
| NEG-06 | Nama sama tapi Category berbeda — harus **diizinkan** sesuai Business Rule "unik pada jenis yang sama" | Nama `"Ketua"` sudah ada di Kelompok, tambah Nama `"Ketua"` di Struktural | Tambah Jabatan Category = Struktural, Nama = `"Ketua"` | Sistem **menerima** (karena Category berbeda), data tersimpan | ✅ Lolos secara tidak sengaja — karena memang tidak ada pengecekan Nama apa pun (lihat NEG-05), kasus ini "lolos" bukan karena implementasi benar |
| NEG-07 | Level kosong / bukan angka positif | Level = `0` atau kosong | Kosongkan Level, Simpan | Form menolak submit (`required`, `min="1"`) dengan pesan validasi field Level | ✅ Lolos sebagian — browser native `required`+`min` mencegah 0/kosong, tapi pesan masih generik bawaan browser, bukan pesan custom per SRS |
| NEG-08 | Level diisi manual walau SRS mengharuskan otomatis | Level = `99` (nilai sembarang, tidak merepresentasikan hierarki nyata) | Tambah Jabatan dengan Parent Level 1, isi Level = `99` | Sistem seharusnya **mengisi Level otomatis** (misal `Parent.Level + 1 = 2`) dan mengabaikan/menyembunyikan input manual | ❌ Gagal — Level `99` tersimpan apa adanya, tidak konsisten dengan Level Parent, karena Level memang field manual, bukan hasil hitung |
| NEG-09 | Kode/Nama disubmit hanya berisi whitespace | Kode = `"   "` | Isi Kode hanya spasi, field lain valid, Simpan | Sistem menolak sebagai field kosong (setelah trim), pesan **"Kode wajib diisi"** | ✅ Lolos — `trim()` dipanggil dan hasil kosong memang dicek balik via kondisi `!code` sebelum simpan (`master-jabatan.html:393,398`) |

### B. Hapus Jabatan (Referential Integrity)

| ID | Skenario | Data Uji | Langkah | Expected Result | Status Prototipe |
|---|---|---|---|---|---|
| NEG-10 | Hapus jabatan yang masih punya anak (dirujuk sebagai Parent) | Jabatan `KETUA` (Kelompok) punya anak `WAKIL_KETUA`, `SEKRETARIS`, dst. | Klik Hapus pada `KETUA` | Sistem **menolak** hapus, tombol konfirmasi disabled, pesan menjelaskan harus hapus/alihkan anak dulu | ✅ Lolos — `openDelete()` mendeteksi `jabatanHasChildren` dan men-disable tombol Hapus | 
| NEG-11 | Hapus jabatan yang sedang dipegang pegawai aktif (tanpa anak) | Jabatan `ANGGOTA` (`b80c6030-...`) dipegang puluhan pegawai Politisi di `pegawai-data.js` | Klik Hapus pada jabatan `Anggota`, konfirmasi Hapus | Sesuai kontradiksi di §1.1 — SRS saat ini **mengizinkan** hapus, namun **seharusnya** minimal menampilkan peringatan jumlah pegawai terdampak sebelum konfirmasi | ❌ Gagal — modal konfirmasi hanya menampilkan teks generik "Tindakan ini tidak dapat dibatalkan", **tidak menyebutkan sama sekali** bahwa jabatan ini dipegang banyak pegawai aktif; setelah dihapus, `pengguna.html`/`laporan-duk.html` akan menampilkan `—` untuk seluruh pegawai tersebut tanpa jejak apa jabatan aslinya |
| NEG-12 | Batal pada modal konfirmasi hapus | Klik Hapus → klik Batal | Verifikasi data tidak berubah | Data jabatan tetap ada, tidak terhapus | ✅ Lolos — `closeDeleteModal()` hanya menutup modal |
| NEG-13 | Hapus jabatan tanpa permission `jabatan.hapus` | User tanpa permission terkait | Klik tombol Hapus | Tombol Hapus tidak tampil / aksi ditolak sistem | ❌ Tidak dapat diuji — tidak ada role/permission check di prototipe |

### C. Ubah Jabatan (Kode Terkunci saat Dirujuk)

| ID | Skenario | Data Uji | Langkah | Expected Result | Status Prototipe |
|---|---|---|---|---|---|
| NEG-14 | Ubah Kode pada jabatan yang sudah dipakai (dirujuk pegawai atau punya anak) | Jabatan `KETUA` (punya anak & dipakai pegawai) | Klik Edit `KETUA`, ubah Kode jadi `KETUA_X`, Simpan | Field Kode harus *disabled* atau sistem menolak dengan pesan "Kode tidak dapat diubah karena jabatan sudah dipakai" | ❌ Gagal — field Kode tetap bebas diedit dan tersimpan, berpotensi memutus relasi bila ada sistem lain yang merujuk berdasarkan Kode (bukan id) |
| NEG-15 | Ubah Kode menjadi Kode milik jabatan lain | Edit `WAKIL_KETUA`, ubah Kode menjadi `KETUA` (sudah dipakai) | Simpan | Sistem menolak dengan pesan kode sudah digunakan | ✅ Lolos — cek dupe mengecualikan `editingId` sendiri saja, bukan jabatan lain |
| NEG-16 | Ubah Category jabatan yang sudah punya anak di Category lama | Edit `SEKRETARIS_DPRD` (Struktural, punya anak `KEPALA_BAGIAN`), ubah Category jadi Pelaksana | Simpan | Sistem seharusnya menolak (anak masih merujuk Parent dengan Category lama) atau meminta konfirmasi dampak ke seluruh anak | ❌ Gagal — Category berubah begitu saja tanpa validasi relasi ke anak, menyebabkan data anak merujuk Parent dengan Category yang sudah tidak konsisten (lihat §1.8) |

### D. Nonaktifkan Jabatan (belum ada field `status`)

| ID | Skenario | Data Uji | Langkah | Expected Result | Status Prototipe |
|---|---|---|---|---|---|
| NEG-17 | Nonaktifkan jabatan agar hilang dari pilihan baru tapi tetap di riwayat | Jabatan `DOKUMENTALIS_HUKUM` (tidak dipakai siapa pun) | Klik aksi "Nonaktifkan" | Jabatan berstatus Nonaktif: hilang dari dropdown Parent & dropdown penempatan pegawai baru, tapi tetap tampil bila sudah tercatat di riwayat penempatan lama | ❌ Tidak dapat diuji — tidak ada field `status` maupun tombol aksi Nonaktifkan di UI sama sekali |
| NEG-18 | Jabatan Nonaktif tidak tampil sebagai opsi Parent baru | Jabatan Nonaktif `X` | Buka Tambah Jabatan, pilih Category yang sama dengan `X` | Dropdown Parent tidak menampilkan `X` | ❌ Tidak dapat diuji — field `status` tidak ada, seluruh jabatan (termasuk yang seharusnya nonaktif) selalu tampil sebagai opsi Parent |

### E. Pencarian, Filter & Permission

| ID | Skenario | Data Uji | Langkah | Expected Result | Status Prototipe |
|---|---|---|---|---|---|
| NEG-19 | Cari dengan keyword Kode/Nama yang tidak ditemukan | Keyword = `"ZZZZ"` | Ketik `ZZZZ` di kolom pencarian | Tabel kosong, pesan "Data tidak ditemukan" | ❌ Tidak dapat diuji — tidak ada input pencarian di halaman |
| NEG-20 | Filter berdasarkan status (Aktif/Nonaktif) | Filter = Nonaktif | Pilih filter status Nonaktif | Tabel hanya menampilkan jabatan Nonaktif | ❌ Tidak dapat diuji — tidak ada filter status (field status pun belum ada) |
| NEG-21 | User role Ketua mencoba mengakses Tambah/Edit/Hapus Jabatan | Login sebagai role Ketua (hanya permission `jabatan.lihat`) | Buka Master Jabatan, coba klik Tambah Jabatan | Tombol Tambah/Edit/Hapus tidak tampil atau aksi ditolak sistem (403) | ❌ Tidak dapat diuji — tidak ada mekanisme role/permission di prototipe, siapa pun yang mengakses halaman bisa CRUD bebas |

### F. Exception Flow — Kegagalan Sistem

| ID | Skenario | Data Uji | Langkah | Expected Result | Status Prototipe |
|---|---|---|---|---|---|
| NEG-22 | Koneksi/DB gagal saat proses simpan | Simulasikan API/DB down (butuh backend nyata) | Submit form Tambah/Edit Jabatan saat koneksi backend diputus | Pesan error umum ("Gagal menyimpan data, silakan coba lagi"), rollback, tidak ada data parsial/korup | ⚪ Tidak dapat diuji di prototipe — wajib diuji ulang di tahap integrasi backend/API |
| NEG-23 | Hapus jabatan bersamaan dengan penambahan pegawai baru yang memilih jabatan tersebut (race condition) | 2 request bersamaan: Hapus jabatan `X` dan Tambah pegawai dengan `jabatanId = X` | Simulasikan concurrent request | Sistem harus konsisten — salah satu request ditolak (tidak boleh ada pegawai baru tersimpan dengan `jabatanId` yang sudah dihapus) | ⚪ Tidak dapat diuji di prototipe (tidak ada backend); jadi acceptance criteria wajib saat desain transaksi DB — makin relevan karena §1.1 mengizinkan hard-delete jabatan yang masih dipakai |

---

## 4. Rekomendasi Prioritas Perbaikan

1. **Kritis — Selesaikan kontradiksi Hapus vs Nonaktifkan** (§1.1, NEG-11): ini harus diputuskan bisnis dulu sebelum development backend dimulai, karena menentukan seluruh desain tabel/transaksi penghapusan.
2. **Kritis — Definisikan algoritma Level otomatis** (§1.2, NEG-08): tanpa rumus yang jelas, tim dev akan membangun interpretasi masing-masing yang berisiko tidak konsisten antar fitur (tambah, ubah Parent, re-parenting).
3. **Tinggi — Tambahkan field & flow `status` Aktif/Nonaktif** (§1.3, NEG-17/18): fitur inti yang disebut di Alternate Flow tapi tidak punya Data Requirement sama sekali.
4. **Tinggi — Validasi panjang & keunikan Kode/Nama** (NEG-02–06): mencegah data sampah, terutama karena data seed sendiri sudah melanggar aturan panjang Kode ≤20 karakter.
5. **Tinggi — Pencegahan circular reference & aturan lintas-Category untuk Parent** (§1.8, NEG-16): tuliskan sebagai AC resmi, bukan diam-diam diputuskan di level UI prototipe.
6. **Menengah — Kode terkunci saat jabatan dipakai** (NEG-14): sejalan dengan pola yang sama di EP-MD-01.
7. **Menengah — Role & permission (`jabatan.*`)** (NEG-13, 21): standarkan dulu penamaan permission (§1.4) sebelum diimplementasikan ke RBAC.
8. **Rendah — Search, filter, paginasi, sort order** (NEG-19, 20, §1.10): fitur pelengkap, prioritas setelah poin 1–7 selesai.

---

## 5. Catatan Metodologi

- Review dilakukan dengan membaca langsung teks SRS yang diberikan secara literal (termasuk mencari inkonsistensi redaksi), lalu membaca kode sumber prototipe (`master-jabatan.html`, `jabatan-data.js`, serta pemanggilnya di `pengguna.html`, `laporan-duk.html`, `pegawai-data.js`) per 2026-10-14.
- Tidak seperti review EP-MD-01 (Master Periode) yang SRS-nya relatif lengkap dan konsisten, SRS EP-MD-02 ini memiliki lebih banyak **gap pada level dokumen** (bukan hanya gap implementasi) — sehingga bagian §1 (Temuan pada Dokumen SRS) sengaja ditulis lebih detail dan ditempatkan di awal agar dapat diklarifikasi ke pemilik produk sebelum tim dev mulai membangun backend.
- Negative test case di atas ditulis agar dapat langsung dieksekusi QA baik di level prototipe UI (untuk yang berstatus ✅/❌) maupun disiapkan ulang sebagai regression test saat backend/API Master Jabatan selesai diimplementasikan (terutama yang berstatus ⚪ dan yang bergantung pada keputusan bisnis di §1.1–1.3).
