# SRS — Master Unit Type (EP-MD-03)

- **Modul**: Master Unit Type
- **Kode Modul**: EP-MD-03
- **Sumber**: Disusun dari halaman prototipe `master-unit-type.html` + `unit-type-data.js` (tabel `unit_types`, lihat `docs/DDL_Insert_Struktur_DPRD.md`)
- **Dipakai oleh**: `pengguna.html`, `pengguna-buat.html`, `pengguna-edit.html`, `pengguna-import-periode.html`, `pegawai-data.js` (semua merujuk `unit_types` untuk menentukan unit organisasi penempatan pegawai/anggota)
- **Tanggal Disusun**: 2026-10-16
- **Catatan**: Dokumen ini ditulis berdasarkan perilaku prototipe (client-side, `localStorage`, tanpa backend sungguhan) sebagai baseline SRS awal. Tombol "Simpan" di halaman ini bersifat contoh/prototipe dan belum tersambung ke API nyata.

---

## 1. Deskripsi

Master Unit Type mengelola data referensi **jenis wadah organisasi** (`unit_types`) yang dipakai untuk membentuk struktur organisasi (`org_units`) di DPRD. Setiap Unit Type termasuk salah satu dari 3 **Jenis Unit** (tab):

| Jenis Unit | Label Tab | Domain (otomatis) | Contoh |
|---|---|---|---|
| `AKD` | AKD | `DEWAN` | Pimpinan, Komisi, Komisi A/B/C, Badan, Pansus |
| `FRAKSI` | Fraksi | `DEWAN` | Fraksi, dan Fraksi per Partai (PDIP, Golkar, dst.) |
| `SEKRE` | Sekretariat | `SETWAN` | Sekretariat, Bagian, Sub Bagian |

Unit Type dapat membentuk **hierarki** melalui field **Parent** (self-reference ke Unit Type lain **dalam Jenis Unit yang sama**), dengan **Level** yang diturunkan otomatis dari kedalaman Parent (root = Level 0).

---

## 2. Precondition

- Pengguna sudah login dan memiliki permission `unit_type.lihat` untuk mengakses halaman.
- Untuk aksi perubahan data, pengguna memerlukan permission granular: `unit_type.tambah`, `unit_type.ubah`, `unit_type.hapus`.
- Minimal 1 Unit Type root per Jenis Unit sudah ada (data seed `PIMPINAN`, `FRAKSI`, `SEKRETARIAT`) agar tab tidak kosong total.

---

## 3. Main Flow (Normal Flow)

1. Admin membuka menu **Master Data → Master Unit Type**.
2. Sistem menampilkan 3 tab Jenis Unit (**AKD**, **Fraksi**, **Sekretariat**); tab aktif default adalah **AKD** kecuali ada hash URL (`#akd`, `#fraksi`, `#sekre`) yang valid.
3. Setiap tab menampilkan jumlah data (badge angka) dan kartu statistik: **Total Unit Type**, **Root (Level 0)**, **Izinkan Formasi Kosong**, **Domain** — seluruhnya dihitung ulang terhadap data pada tab yang aktif.
4. Tabel menampilkan daftar Unit Type pada tab aktif, diurutkan **Level menaik lalu Urutan Tampil menaik**, dengan indentasi visual (`—`) sebanyak Level untuk menunjukkan hierarki, kolom: Kode, Nama Unit, Parent, Level, Maks Rangkap, Formasi Kosong, Urutan, dan aksi (Edit/Hapus).
5. Admin klik **Tambah Unit Type** → modal terbuka dengan Jenis Unit & Domain terisi otomatis (mengikuti tab aktif, tidak dapat diubah), field Parent berisi daftar Unit Type pada Jenis Unit yang sama.
6. Admin mengisi Kode, Nama, (opsional) URL Gambar, (opsional) Parent, (opsional) Maks Rangkap per Anggota, Urutan Tampil, dan centang Izinkan Formasi Kosong bila perlu, lalu klik **Simpan**.
7. Sistem memvalidasi Kode & Nama wajib diisi dan Kode tidak boleh duplikat (case-insensitive, global lintas seluruh Jenis Unit) → jika valid, data baru ditambahkan, tabel & statistik diperbarui, toast sukses ditampilkan, modal tertutup.
8. Admin klik **Edit** pada salah satu baris → modal terbuka terisi data existing, Parent tidak menampilkan dirinya sendiri maupun seluruh descendant-nya (mencegah circular reference) → ubah field yang diperlukan → **Simpan** → data diperbarui.
9. Admin klik **Hapus** pada salah satu baris:
   - Jika Unit Type **tidak punya anak**: modal konfirmasi menampilkan nama & kode, tombol **Hapus** aktif → klik **Hapus** → data terhapus, tabel & statistik diperbarui, toast sukses.
   - Jika Unit Type **punya anak** (dirujuk sebagai Parent oleh Unit Type lain): modal konfirmasi menampilkan pesan bahwa unit masih memiliki anak, tombol **Hapus** di-nonaktifkan.
10. Admin dapat beralih antar tab Jenis Unit kapan pun; hash URL ikut berubah sehingga tab dapat di-bookmark/refresh dan tetap pada tab yang sama.

---

## 4. Penjelasan & Ketentuan per Fungsi/Tombol/Field

### 4.1 Tab Bar (AKD / Fraksi / Sekretariat)

**Fungsi**: Memfilter seluruh tampilan (tabel, statistik, opsi Parent) hanya untuk Unit Type dengan `unitType` sesuai tab yang dipilih.

**Ketentuan**:
- Tab aktif ditentukan dari hash URL (`#akd`, `#fraksi`, `#sekre`); bila hash tidak valid/kosong, default ke AKD.
- Berpindah tab akan mereset form Tambah (tidak ada state yang terbawa antar Jenis Unit).
- Badge jumlah pada tab menghitung total Unit Type pada Jenis Unit tersebut, termasuk seluruh level hierarki.

**Normal Flow**: Klik tab lain → tabel, statistik, dan badge langsung memperbarui sesuai Jenis Unit yang dipilih; tab yang dipilih mendapat highlight (border bawah warna gold).

**Negative/Edge Case**:
| ID | Skenario | Expected Result |
|---|---|---|
| NEG-01 | Akses URL dengan hash tidak dikenal, misal `master-unit-type.html#random` | Sistem fallback ke tab **AKD** (default), tidak error |
| NEG-02 | Jenis Unit tidak memiliki data sama sekali (tabel kosong) | Tabel menampilkan baris kosong "Belum ada data Unit Type untuk jenis [Nama Tab]", bukan error/crash |

---

### 4.2 Tombol "Tambah Unit Type"

**Fungsi**: Membuka modal form tambah data baru untuk Jenis Unit yang sedang aktif di tab.

**Ketentuan**:
- Jenis Unit & Domain pada modal **tidak dapat diubah** oleh admin — otomatis mengikuti tab aktif saat tombol ditekan.
- Urutan Tampil default terisi otomatis = jumlah data pada tab aktif + 1 (dapat diubah manual).
- Parent default kosong (Root/Level 0); daftar opsi Parent hanya berisi Unit Type pada Jenis Unit yang sama dengan tab aktif.

**Normal Flow**: Klik tombol → modal terbuka dengan judul "Tambah Unit Type ([Jenis Unit])", form kosong (kecuali default), fokus siap diisi.

**Negative/Edge Case**:
| ID | Skenario | Expected Result |
|---|---|---|
| NEG-03 | Klik "Tambah Unit Type" lalu berpindah tab tanpa menutup modal (seharusnya tidak mungkin karena modal blocking) | Modal harus ditutup otomatis atau tab-switch dicegah selama modal terbuka — perlu dipastikan tidak ada state Jenis Unit yang tertukar |
| NEG-04 | Tidak ada permission `unit_type.tambah` | Tombol "Tambah Unit Type" tidak ditampilkan / klik ditolak sistem (403) |

---

### 4.3 Field: Kode Unit

**Ketentuan**:
- **Wajib diisi** (`required`), tidak boleh kosong setelah di-*trim*.
- **Unik secara global**, dibandingkan *case-insensitive*, lintas seluruh Jenis Unit (AKD, Fraksi, Sekretariat sama-sama dicek dalam satu pool, bukan hanya dalam tab aktif).
- Saat Edit, perbandingan duplikat mengecualikan data yang sedang diedit sendiri.
- Tidak ada batas panjang karakter maupun format karakter yang didefinisikan — perlu ditentukan (lihat §6).

**Normal Flow**: Isi Kode unik, misal `KOMISI-D` → tersimpan sesuai input.

**Negative Case**:
| ID | Skenario | Data Uji | Expected Result |
|---|---|---|---|
| NEG-05 | Kode kosong | `""` atau hanya spasi | Submit ditolak browser (`required`); setelah trim kosong tetap harus ditolak dengan pesan "Kode & Nama Unit wajib diisi" |
| NEG-06 | Kode duplikat, case-insensitive, **lintas Jenis Unit berbeda** | Kode `fraksi` (huruf kecil) padahal sudah ada `FRAKSI` di tab Fraksi, diinput saat tab aktif AKD | Sistem menolak dengan pesan `Kode Unit "fraksi" sudah digunakan`, data tidak tersimpan — walau Jenis Unit berbeda, karena pengecekan memang global |
| NEG-07 | Kode duplikat exact match pada Jenis Unit yang sama | Tambah Kode `PIMPINAN` lagi di tab AKD | Ditolak dengan pesan serupa |
| NEG-08 | Ubah Kode suatu Unit Type menjadi Kode milik Unit Type lain | Edit `KOMISI-A`, ubah Kode jadi `KOMISI-B` (sudah ada) | Ditolak, Kode tidak berubah |
| NEG-09 | Kode sangat panjang (misal 200 karakter) atau berisi karakter spesial (`<script>`, emoji, dsb.) | Input 200 karakter / karakter HTML | Saat ini **tidak ditolak** — tersimpan apa adanya dan dirender langsung ke tabel tanpa escaping (risiko XSS karena `innerHTML` dipakai di `renderTable()`); SRS final wajib menetapkan batas panjang & sanitasi |

---

### 4.4 Field: Domain (otomatis, disabled)

**Ketentuan**: Bukan input bebas — nilainya **diturunkan otomatis** dari Jenis Unit yang aktif: `AKD`/`FRAKSI` → `DEWAN`, `SEKRE` → `SETWAN`. Field selalu *disabled* di form, tidak pernah dikirim sebagai input admin.

**Normal Flow**: Admin membuka tab Sekretariat → field Domain otomatis menampilkan `SETWAN` dan tidak dapat diketik.

**Negative Case**:
| ID | Skenario | Expected Result |
|---|---|---|
| NEG-10 | Admin mencoba mengubah Domain lewat manipulasi client (DevTools, bukan via UI normal) | Karena ini keputusan desain (Domain murni derivatif), SRS final harus menegaskan validasi juga dilakukan di **server/backend**, bukan hanya mengandalkan `disabled` di HTML (yang dapat dilewati di sisi klien) |

---

### 4.5 Field: Nama Unit

**Ketentuan**:
- **Wajib diisi** (`required`), tidak boleh kosong.
- Tidak ada pengecekan duplikat Nama (berbeda dari Kode).
- Tidak ada batas panjang minimum/maksimum yang didefinisikan — perlu ditentukan (lihat §6).

**Normal Flow**: Isi Nama, misal `Komisi D` → tersimpan.

**Negative Case**:
| ID | Skenario | Expected Result |
|---|---|---|
| NEG-11 | Nama kosong/hanya spasi | Ditolak dengan pesan "Kode & Nama Unit wajib diisi" |
| NEG-12 | Nama duplikat pada Jenis Unit yang sama, misal dua Unit Type bernama `Komisi A` di tab AKD | **Saat ini diterima** — tidak ada validasi; perlu diputuskan apakah Nama harus unik per Jenis Unit (mirip pola Kode) |
| NEG-13 | Nama 1 karakter atau sangat panjang (300+ karakter) | Saat ini **diterima** tanpa validasi panjang |

---

### 4.6 Field: URL Gambar/Logo (opsional)

**Ketentuan**: Opsional, tidak divalidasi format URL/ekstensi gambar sama sekali.

**Normal Flow**: Dikosongkan atau diisi URL valid → tersimpan sebagai `imageUrl` (null jika kosong).

**Negative Case**:
| ID | Skenario | Expected Result |
|---|---|---|
| NEG-14 | Isi dengan teks bukan URL, misal `abc123` | Saat ini **diterima** tanpa validasi — perlu ditentukan apakah wajib format URL (`http(s)://...`) atau validasi ekstensi gambar |
| NEG-15 | URL mengandung payload XSS (`javascript:alert(1)`) sebagai `src` gambar di tempat lain yang menampilkan logo ini | Berisiko tereksekusi bila field ini dirender sebagai `<img src="...">` tanpa sanitasi di halaman lain — wajib divalidasi/di-whitelist skema URL (`http`/`https` saja) |

---

### 4.7 Field: Parent (opsional, dropdown)

**Ketentuan**:
- Opsional; default "Tidak Ada (Root / Level 0)".
- Opsi dropdown **hanya berisi Unit Type pada Jenis Unit yang sama** dengan tab aktif (tidak lintas Jenis Unit — Komisi di AKD tidak bisa jadi Parent dari Fraksi).
- **Mencegah circular reference**: saat Edit, dropdown mengecualikan dirinya sendiri dan **seluruh descendant-nya** (anak, cucu, dst.) dari daftar opsi Parent — mencegah Unit Type menjadi Parent dari leluhurnya sendiri.
- Mengubah Parent otomatis memicu perhitungan ulang **Level** (lihat §4.8), tetapi **tidak** melakukan cascade ke Level anak-anak dari Unit Type yang di-reparenting (lihat NEG-18).

**Normal Flow**: Pilih Parent `Komisi` saat menambah `Komisi D` → Level otomatis terisi `Parent.Level + 1`.

**Negative Case**:
| ID | Skenario | Expected Result |
|---|---|---|
| NEG-16 | Memilih diri sendiri sebagai Parent (saat Edit) | Tidak dapat terjadi melalui UI normal karena opsi tersebut memang disembunyikan dari dropdown — namun wajib tetap divalidasi di backend sebagai *defense in depth* |
| NEG-17 | Parent yang dipilih ternyata sudah dihapus oleh proses lain (`parentId` menunjuk ke ID yang tidak ada) | Tabel menampilkan badge "Tidak ditemukan" pada kolom Parent (`parentLabel()`), tetapi tidak ada mekanisme perbaikan/peringatan ke admin — berpotensi *data anomaly* yang perlu penanganan (block hapus Parent bila masih punya anak, lihat §4.10) |
| NEG-18 | Re-parenting Unit Type yang sudah punya anak (pindah Parent sehingga Level berubah) | Level Unit Type yang diedit diperbarui, **namun Level seluruh anak/cucunya TIDAK ikut diperbarui** (tidak ada cascade) — menyebabkan Level anak tidak konsisten dengan kedalaman hierarki yang sebenarnya; wajib menjadi Business Rule eksplisit di SRS final (cascade recalculation) |
| NEG-19 | Memilih Parent dari Jenis Unit lain (seharusnya tidak mungkin via UI karena dropdown sudah terfilter) | Tidak dapat diuji dari UI normal; backend tetap wajib memvalidasi `parent.unitType == unitType` yang diinput |

---

### 4.8 Field: Level (otomatis, disabled)

**Ketentuan**: Dihitung otomatis = `0` jika tidak ada Parent, atau `Parent.Level + 1` jika ada Parent. Field selalu *disabled*, tidak pernah diinput manual oleh admin.

**Normal Flow**: Pilih Parent Level 1 → field Level otomatis menampilkan `2`.

**Negative Case**:
| ID | Skenario | Expected Result |
|---|---|---|
| NEG-20 | Lihat NEG-18 — Level tidak konsisten setelah re-parenting berantai | Wajib diperbaiki pada level backend dengan recalculation cascade |
| NEG-21 | Manipulasi client untuk mengaktifkan field Level lalu mengisi nilai sembarang | Backend wajib **mengabaikan** nilai Level yang dikirim dari klien dan selalu menghitung ulang sendiri dari `parentId`, tidak boleh mempercayai input Level dari form |

---

### 4.9 Field: Maks Rangkap per Anggota (opsional, angka)

**Ketentuan**: Opsional (boleh kosong = tidak dibatasi/`null`). Jika diisi, harus berupa angka ≥ 1 (`min="1"` di HTML, namun tidak ada validasi JS tambahan).

**Normal Flow**: Kosongkan untuk "Tak dibatasi", atau isi `1` untuk jabatan yang hanya boleh dipegang satu orang (contoh seed: `PIMPINAN`, `KOMISI`).

**Negative Case**:
| ID | Skenario | Expected Result |
|---|---|---|
| NEG-22 | Isi dengan `0` atau angka negatif | Browser native `min="1"` seharusnya mencegah, tapi tidak ada pesan custom bila dilewati (misal lewat paste/manipulasi) — perlu validasi JS tambahan + pesan eksplisit |
| NEG-23 | Isi dengan nilai desimal, misal `1.5` | Tidak ada validasi integer; `parseInt` pada field lain dipakai tapi field ini langsung dibaca sebagai string lalu disimpan — berpotensi tersimpan sebagai string/nilai tidak konsisten |

---

### 4.10 Field: Urutan Tampil (angka, default 0 / auto)

**Ketentuan**: Menentukan urutan tampil relatif antar Unit Type pada Level yang sama (tabel diurutkan Level menaik, lalu Urutan Tampil menaik). Default saat Tambah = jumlah data tab aktif + 1.

**Negative Case**:
| ID | Skenario | Expected Result |
|---|---|---|
| NEG-24 | Dua Unit Type memiliki Urutan Tampil yang sama | Diterima tanpa validasi — urutan tampil di antara keduanya bergantung pada urutan asli di array (tidak dijamin stabil/predictable); perlu diputuskan apakah Urutan Tampil wajib unik per level/parent |
| NEG-25 | Isi Urutan Tampil dengan teks non-angka | `parseInt(...) || 0` membuat nilai invalid otomatis fallback ke `0` tanpa pesan ke admin — berpotensi membingungkan karena tidak ada feedback bahwa input diabaikan |

---

### 4.11 Checkbox: "Izinkan Formasi Kosong"

**Ketentuan**: Menandai apakah jabatan pada unit ini boleh lowong (`person_id` NULL pada `assignments`). Default tidak tercentang.

**Normal Flow**: Centang untuk unit seperti Bagian/Sub Bagian Sekretariat yang boleh lowong sementara; tersimpan sebagai `allowsVacancy: true`, muncul di kartu statistik "Izinkan Formasi Kosong".

**Negative Case**:
| ID | Skenario | Expected Result |
|---|---|---|
| NEG-26 | Mengubah `allowsVacancy` dari `true` menjadi `false` pada Unit Type yang **sudah memiliki** assignment dengan `person_id = NULL` (formasi kosong sedang berjalan) | Tidak ada pengecekan ke data assignment — perlu diputuskan: apakah perubahan ini harus diblokir/diperingatkan karena akan membuat data existing jadi tidak konsisten dengan aturan baru |

---

### 4.12 Tombol "Simpan" (Tambah/Edit)

**Ketentuan Ringkas (gabungan validasi)**:
1. Kode wajib diisi, unik global case-insensitive.
2. Nama wajib diisi.
3. Jenis Unit, Domain, Level ditentukan sistem, bukan input bebas admin.
4. Semua field lain opsional dengan default masing-masing seperti di atas.

**Normal Flow**: Semua validasi lolos → data tersimpan ke `UNIT_TYPE_LIST` & `localStorage`, tabel/stat/tab-bar count diperbarui, toast sukses, modal tertutup.

**Negative Case**:
| ID | Skenario | Expected Result |
|---|---|---|
| NEG-27 | Submit form dengan menekan Enter di salah satu field (bukan klik tombol Simpan) | Form tetap submit normal via event `onsubmit`, perilaku sama seperti klik Simpan — perlu dipastikan tidak ada submit ganda (double-submit) jika Enter ditekan berkali-kali cepat |
| NEG-28 | Koneksi/API gagal saat proses simpan (skenario backend nyata) | Tidak dapat diuji di prototipe (tidak ada backend); SRS final wajib menyatakan pesan error umum + rollback, data tidak tersimpan sebagian |
| NEG-29 | Dua admin menyimpan Kode yang sama secara bersamaan (race condition, backend nyata) | Tidak dapat diuji di prototipe; backend wajib punya *unique constraint* di level database pada kolom `code`, bukan hanya validasi di aplikasi |

---

### 4.13 Tombol "Edit"

**Ketentuan**: Membuka modal terisi data existing; Jenis Unit & Domain tetap mengikuti `unitType` data tersebut (bukan tab aktif bila berbeda — namun karena Edit hanya tersedia dari baris di tab yang sedang aktif, kondisi ini tidak akan terjadi dalam penggunaan normal).

**Negative Case**:
| ID | Skenario | Expected Result |
|---|---|---|
| NEG-30 | Tidak ada permission `unit_type.ubah` | Tombol Edit tidak ditampilkan / aksi ditolak sistem |
| NEG-31 | Edit dua baris berbeda secara berurutan tanpa menutup modal sebelumnya dengan benar (`editingId` tertukar) | Harus dipastikan `editingId` selalu di-reset sesuai baris yang baru diklik — klik Edit baris B tepat setelah klik Edit baris A (tanpa Simpan/Batal) harus menampilkan data B, bukan campuran data A |

---

### 4.14 Tombol "Hapus" & Modal Konfirmasi Hapus

**Ketentuan**:
- Unit Type yang **masih memiliki anak** (ada Unit Type lain dengan `parentId` menunjuk ke dirinya) **tidak dapat dihapus** — tombol konfirmasi Hapus di-nonaktifkan, pesan menjelaskan harus menghapus/mengalihkan anak terlebih dahulu.
- Unit Type **tanpa anak** dapat dihapus langsung setelah konfirmasi.
- **Tidak ada pengecekan** apakah Unit Type ini sedang dirujuk oleh `org_units` (struktur organisasi riil) atau oleh assignment/jabatan pegawai — ini adalah gap referential integrity yang signifikan karena Master Unit Type dipakai `pengguna.html`, `pegawai-data.js`, dll.

**Normal Flow**: Klik Hapus pada Unit Type tanpa anak dan tanpa referensi lain → konfirmasi → Hapus → data terhapus, toast sukses.

**Negative Case**:
| ID | Skenario | Expected Result |
|---|---|---|
| NEG-32 | Hapus Unit Type yang punya anak | Tombol Hapus pada modal konfirmasi disabled, data tidak terhapus |
| NEG-33 | Hapus Unit Type yang **tidak punya anak** tapi **sudah dirujuk** oleh `org_units` (struktur organisasi nyata) atau oleh pegawai/anggota yang ditempatkan di unit tersebut | **Saat ini diizinkan tanpa peringatan apa pun** — karena prototipe tidak memeriksa relasi ke `org_units`/`pegawai-data.js`; ini berisiko data organisasi/penempatan pegawai kehilangan rujukan unit yang valid. Wajib ditambahkan pengecekan referential integrity di SRS final sebelum implementasi backend |
| NEG-34 | Klik Batal pada modal konfirmasi | Modal tertutup, data tidak berubah |
| NEG-35 | Tidak ada permission `unit_type.hapus` | Tombol Hapus tidak ditampilkan / aksi ditolak sistem |
| NEG-36 | Hapus salah satu Unit Type **root** (Level 0) bawaan seed (`PIMPINAN`, `FRAKSI`, `SEKRETARIAT`) yang pasti punya anak | Ditolak karena punya anak (sesuai NEG-32); namun bila suatu saat root ini dibuat tanpa anak (tab baru/kosong), sistem akan **mengizinkan Jenis Unit kehilangan root-nya sama sekali** — perlu diputuskan apakah setiap Jenis Unit wajib minimal 1 Unit Type root yang tidak dapat dihapus |

---

### 4.15 Kartu Statistik (Total, Root, Formasi Kosong, Domain)

**Ketentuan**: Seluruh angka dihitung ulang dari data pada **tab aktif saja** (tidak menghitung lintas Jenis Unit), diperbarui setiap kali tabel berubah (tambah/ubah/hapus/ganti tab).

**Negative Case**:
| ID | Skenario | Expected Result |
|---|---|---|
| NEG-37 | Data tab aktif kosong total | Seluruh kartu menampilkan `0`, kartu Domain tetap menampilkan domain Jenis Unit yang benar (bukan kosong) |

---

## 5. Alternate Flow

- **AF-1 Berpindah tab sebelum menyimpan**: Jika admin membuka modal Tambah/Edit lalu berpindah tab tanpa menutup modal, modal tetap terbuka menimpa tampilan tab baru (karena modal adalah overlay) — admin harus menutup modal dengan Batal/close dahulu baru beralih tab dengan aman.
- **AF-2 Refresh halaman saat hash tab tertentu**: Hash URL (`#fraksi`, dll.) dipertahankan sehingga refresh tetap menampilkan tab yang sama.
- **AF-3 Data tersimpan di localStorage**: Seluruh perubahan (tambah/ubah/hapus) langsung tersimpan ke `localStorage` milik browser, bukan ke server — refresh/tutup browser tidak menghilangkan data selama localStorage tidak dibersihkan; namun ini juga berarti data **tidak sinkron antar perangkat/pengguna lain**.

## 6. Exception Flow

- **EXC-1**: Kegagalan koneksi/API saat simpan/hapus (skenario backend nyata) → sistem harus menampilkan pesan error umum ("Gagal menyimpan/menghapus data, silakan coba lagi"), tidak ada perubahan data parsial, dan modal tetap terbuka agar admin tidak kehilangan input yang sudah diisi.
- **EXC-2**: `localStorage` penuh/diblokir browser (mode private/incognito tertentu) → `unitTypeSaveList()` membungkus `localStorage.setItem` dalam `try/catch` sehingga **gagal secara senyap** (silent fail) — perubahan tampak tersimpan di memori (`UNIT_TYPE_LIST`) tetapi hilang setelah reload tanpa pemberitahuan ke admin. Ini wajib diperbaiki (tampilkan peringatan) sebelum rilis produksi berbasis localStorage, atau jadi tidak relevan begitu backend nyata dipakai.

---

## 7. Business Rule (Ketentuan Konsolidasi)

| # | Ketentuan |
|---|---|
| BR-1 | Setiap Unit Type wajib memiliki tepat satu Jenis Unit: `AKD`, `FRAKSI`, atau `SEKRE`. |
| BR-2 | Domain diturunkan otomatis dari Jenis Unit (`AKD`/`FRAKSI` → `DEWAN`, `SEKRE` → `SETWAN`) dan **tidak dapat diinput manual**, baik di UI maupun — wajib — di backend/API. |
| BR-3 | Kode Unit **wajib unik secara global** (case-insensitive), lintas seluruh Jenis Unit, bukan hanya dalam satu Jenis Unit. |
| BR-4 | Kode & Nama Unit wajib diisi (tidak boleh kosong setelah di-*trim*). |
| BR-5 | Parent hanya dapat dipilih dari Unit Type dengan Jenis Unit **yang sama**; lintas Jenis Unit tidak diizinkan. |
| BR-6 | Sistem wajib mencegah **circular reference** — sebuah Unit Type tidak boleh menjadi Parent dari leluhurnya sendiri (langsung maupun melalui perantara). |
| BR-7 | Level dihitung otomatis: `0` untuk root (tanpa Parent), atau `Parent.Level + 1`. Level tidak boleh diinput manual oleh admin, baik di UI maupun di backend (backend wajib menghitung ulang, tidak mempercayai nilai dari klien). |
| BR-8 | **(Belum diatur di prototipe, wajib diputuskan)** Saat re-parenting Unit Type yang sudah memiliki anak, Level seluruh keturunannya (anak, cucu, dst.) harus dihitung ulang secara cascade agar tetap konsisten dengan kedalaman hierarki yang baru. |
| BR-9 | Unit Type yang masih memiliki anak (dirujuk sebagai Parent oleh Unit Type lain) **tidak dapat dihapus** — anak harus dihapus atau dialihkan Parent-nya terlebih dahulu. |
| BR-10 | **(Belum diatur di prototipe, wajib diputuskan)** Unit Type yang sudah dirujuk oleh struktur organisasi riil (`org_units`) atau oleh penempatan pegawai/anggota aktif seharusnya **tidak dapat dihapus langsung** — minimal sistem menampilkan peringatan jumlah referensi yang terdampak sebelum admin dapat melanjutkan, konsisten dengan pola BR-9. |
| BR-11 | Maks Rangkap per Anggota, jika diisi, harus berupa bilangan bulat ≥ 1; kosong berarti tidak dibatasi (`null`). |
| BR-12 | Urutan Tampil menentukan pengurutan tabel di antara Unit Type dengan Level yang sama; Level selalu menjadi kunci urut utama (menaik), Urutan Tampil kunci urut kedua. |
| BR-13 | Izinkan Formasi Kosong adalah flag independen per Unit Type yang menentukan apakah jabatan pada unit tersebut boleh memiliki `person_id` NULL pada data assignment. |
| BR-14 | Hak akses: `unit_type.lihat` untuk melihat halaman; `unit_type.tambah`, `unit_type.ubah`, `unit_type.hapus` untuk masing-masing aksi perubahan. |
| BR-15 | **(Belum diatur, perlu diputuskan)** Batas panjang karakter dan format yang diizinkan untuk Kode (disarankan: huruf besar, angka, strip/underscore saja, maksimal N karakter) dan Nama (disarankan: minimal/maksimal karakter) — saat ini tidak ada pembatasan sama sekali di prototipe. |
| BR-16 | **(Belum diatur, perlu diputuskan)** Apakah Nama Unit wajib unik per Jenis Unit (mengikuti pola keunikan Kode) — saat ini tidak divalidasi. |
| BR-17 | Seluruh input teks yang ditampilkan kembali ke tabel/dropdown (Kode, Nama, URL Gambar) wajib disanitasi/di-escape sebelum dirender untuk mencegah XSS, karena rendering saat ini menggunakan `innerHTML` langsung dari nilai input admin. |

---

## 8. Data Requirement

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `id` | UUID | Otomatis | Primary key |
| `code` | string | Ya | Unik global, case-insensitive |
| `name` | string | Ya | Tidak unik (saat ini) |
| `image_url` | string (URL) | Tidak | Nullable |
| `unit_type` | enum (`AKD`/`FRAKSI`/`SEKRE`) | Ya | Ditentukan oleh tab saat tambah; tidak dapat diubah lintas Jenis Unit dari UI ini |
| `domain` | enum (`DEWAN`/`SETWAN`) | Otomatis | Derivatif dari `unit_type`, bukan input |
| `level` | integer ≥ 0 | Otomatis | Derivatif dari `parent_id` |
| `parent_id` | UUID (nullable, self-reference) | Tidak | Harus Unit Type dengan `unit_type` sama; tidak boleh menyebabkan siklus |
| `max_per_member` | integer ≥ 1 (nullable) | Tidak | Null = tidak dibatasi |
| `allows_vacancy` | boolean | Tidak | Default `false` |
| `sort_order` | integer | Tidak | Default berikutnya dari jumlah data tab aktif |

---

## 9. Acceptance Criteria (Ringkas)

1. Tambah/Ubah Unit Type gagal jika Kode kosong atau duplikat (case-insensitive, global).
2. Tambah/Ubah Unit Type gagal jika Nama kosong.
3. Domain & Level tidak pernah dapat diinput manual oleh admin — selalu derivatif dari Jenis Unit dan Parent.
4. Dropdown Parent hanya menampilkan Unit Type dengan Jenis Unit yang sama, dan tidak menampilkan diri sendiri maupun seluruh descendant-nya.
5. Hapus Unit Type yang masih memiliki anak wajib ditolak sistem.
6. Setiap aksi tambah/ubah/hapus memperbarui tabel, kartu statistik, dan badge jumlah pada tab bar secara konsisten.
7. (Wajib diputuskan sebelum backend) Hapus Unit Type yang masih dirujuk `org_units`/penempatan pegawai wajib ditolak atau meminta konfirmasi eksplisit.
8. (Wajib diputuskan sebelum backend) Re-parenting Unit Type yang memiliki anak wajib melakukan cascade recalculation Level ke seluruh keturunannya.
