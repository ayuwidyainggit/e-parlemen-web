# Modul Persuratan — Surat Masuk: Gap Analysis Prototipe vs Spesifikasi

**Pembanding** · Prototipe WEB (`eparlemen-web`) & MOBILE (`eparlemen-mobile`) vs `Surat_Masuk_Spesifikasi_TRD_API_Contract_v0.3.md` (saat audit ini dibuat: v0.3)
**Tanggal** · 4 November 2026
**Status** · Semua gap fungsional (G-01 s/d G-09) sudah diperbaiki. Tersisa 2 catatan minor (M-01, M-02) yang bersifat opsional.

> Catatan: spec sudah berkembang ke **v0.6** sejak audit ini ditulis (penambahan `period_id`/filter Periode di v0.5, lalu update rekonsiliasi filter Status & Periode di v0.6 — lihat bagian "Riwayat Revisi" & "Lampiran: Status Rekonsiliasi Prototipe" di spec). Dokumen ini tetap jadi arsip temuan G-01–G-09 vs v0.3; perubahan sesudahnya dicatat langsung di spec, bukan di sini.

---

## Ringkasan

| Sisi | Status keselarasan |
|---|---|
| **MOBILE** (`persuratan.html`, `surat-masuk-detail.html`) | Sudah cukup selaras dengan spec v0.3 — Unit Type → anggota cascading di form disposisi, `can_act`/`action_deadline` dari `end_time`/23:59:59, dan wording status sudah konsisten setelah perbaikan di bawah. |
| **WEB** (`surat-masuk.html`, `surat-masuk-buat.html`, `surat-masuk-detail.html`) | Dibuat sebelum dokumen spec v0.3 ada. Beberapa field dan validasi di form create belum mengikuti kontrak final (Unit Type, split waktu mulai/selesai, batas lampiran). |

---

## 1. Sudah Diperbaiki

| # | Temuan | File | Perbaikan |
|---|---|---|---|
| F-01 | Badge status & label "Diteruskan oleh" di detail mobile masih pakai wording lama ("Menunggu Aksi" / "Diteruskan"), tidak sinkron dengan rename yang sudah diterapkan di `persuratan.html` ("Pending" / "Disposisi"). | `eparlemen-mobile/surat-masuk-detail.html` (`statusMeta`, `kvDisposedRow` label, placeholder badge) | Disamakan jadi "Pending" / "Disposisi" di ketiga lokasi. |
| G-01 | Form create belum punya dropdown **Unit Type** sebagai penyaring sebelum memilih anggota tujuan. | `eparlemen-web/surat-masuk-buat.html` | Ditambahkan `<select id="unitTypeSelect">` (5 Unit Type: Pimpinan DPRD, Komisi I–IV) yang men-cascade ke `<select id="tujuanAnggota">` — meniru pola `populateDispOrgUnitSelect`/`handleDispOrgUnitChange` yang sudah ada di mobile (`surat-masuk-detail.html`). Validasi & toast konfirmasi submit disesuaikan untuk membaca `orgUnitId` + `recipientId`. |
| G-09 | Format tampilan nama anggota di web pakai "Nama · Jabatan", beda dari spec/mobile "Nama, Jabatan – Org Unit". | `eparlemen-web/surat-masuk-buat.html` | Ikut terselesaikan oleh perbaikan G-01 — opsi `<select>` anggota sekarang dirender `nama + ', ' + jabatan + ' – ' + orgUnit`, sama seperti mobile. |
| G-02 | Field waktu masih 1 input "Waktu Surat" (wajib), bukan dua field terpisah & opsional. | `eparlemen-web/surat-masuk-buat.html` | Diganti jadi **Waktu Mulai** & **Waktu Selesai** (keduanya opsional, `<input type="time">` terpisah), plus hint `#batasAksiPreview` yang menghitung ulang label batas aksi (`tanggal surat + waktu selesai`, atau 23.59 WIB bila waktu selesai kosong) sesuai §9.5. |
| G-03 | Tidak ada validasi `end_time > start_time`. | `eparlemen-web/surat-masuk-buat.html` | Ditambahkan `isWaktuRangeValid()` — menandai field "Waktu Selesai" invalid & memblokir submit (dengan toast) bila waktu selesai &le; waktu mulai, sesuai TC-SM-05. Validasi dijalankan baik saat `onchange` maupun saat submit. |
| G-04 | Tidak ada `maxlength`/validasi panjang untuk No Surat (maks 20), Judul (maks 255), Tempat (maks 255). | `eparlemen-web/surat-masuk-buat.html` | Ditambahkan `maxlength` native pada ketiga input + backstop JS (`nomorOk`/`judulOk`/`tempatOk`) saat submit, dengan pesan error spesifik per field. |
| G-05 | `accept` lampiran belum termasuk docx/xlsx; tidak ada validasi ukuran (10 MB) & jumlah file (10 file). | `eparlemen-web/surat-masuk-buat.html` | `accept` diganti jadi `.pdf,.jpg,.jpeg,.png,.docx,.xlsx`. Ditambahkan `onFileChosen()` yang menolak file di luar tipe/ukuran/kuota tersebut dan melaporkan nama file yang dilewati lewat toast. |
| G-06 | List surat masuk tidak punya tombol **Hapus** untuk baris Draft — hanya ada "Lanjutkan". | `eparlemen-web/surat-masuk.html` | Ditambahkan tombol "Hapus" di baris Draft + modal konfirmasi (`openDeleteDraft`/`confirmDeleteDraft`, mengikuti pola modal hapus di `master-unit-type.html`). Konfirmasi menghapus baris dari tabel, lalu memperbarui empty-state & jumlah di tab Draft. |
| G-07 | Tombol "Lanjutkan" pada draft tidak memuat ulang (prefill) data draft yang sudah pernah diisi. | `eparlemen-web/surat-masuk.html`, `eparlemen-web/surat-masuk-buat.html` | Draft disimpan ke `localStorage` (`ep_surat_masuk_drafts`) saat klik **Simpan sebagai Draft** (meniru `PUT /web/incoming-letters/{id}` §18.4). Link "Lanjutkan" sekarang membawa `?draftId=...`; `surat-masuk-buat.html` membaca param itu dan mengisi ulang semua field (termasuk Unit Type → anggota & daftar lampiran) lewat `initDraftPrefill()`/`prefillFromDraft()`, plus banner "Melanjutkan draft...". Draft yang berhasil di-Submit otomatis dihapus dari storage; draft yang dihapus dari list juga ikut dihapus dari storage. |
| G-08 | Riwayat disposisi di `surat-masuk-detail.html` tidak menampilkan **notes** dari pendisposisi. | `eparlemen-web/surat-masuk-detail.html` | Mock data `dispositions[]` ditambahkan field `note` (meniru `DispositionItem.note`, §7.3). Baris disposisi yang punya `note` sekarang menampilkan kutipan "Catatan dari {assigner}: ..." di bawah deskripsi timeline. Contoh didemokan di `SM-002` (Budi Santoso → M. Yusuf Ridwan). |

---

## 2. Gap Terbuka — WEB (Sekretariat)

Semua gap yang tercatat sebelumnya (G-01 s/d G-09) sudah diperbaiki — lihat bagian 1. Tidak ada gap fungsional terbuka di sisi web saat ini.

---

## 3. Gap Minor / Catatan Tambahan

| # | Catatan | Lokasi | Keterangan |
|---|---|---|---|
| M-01 | Wording notifikasi di `notifikasi.html` (mobile & web) untuk surat masuk tidak memakai format baku spec: *"Surat masuk baru: {judul}"* / *"Disposisi surat dari {nama penugas}: {judul}"* / *"Surat masuk {judul} selesai"* — teks yang ada sekarang freeform (mis. "Surat dari Sekretariat Daerah Kota Magelang No. ..."). | `eparlemen-mobile/notifikasi.html`, `eparlemen-web/notifikasi.html` | `notifikasi.html` adalah halaman contoh notifikasi lintas-modul (bukan khusus surat masuk), jadi prioritas rendah — tapi kalau mau dipakai sebagai acuan demo yang akurat, sebaiknya disamakan. |
| M-02 | Validasi `letter_number` saat ini mengizinkan karakter `.`, `/`, `-` (regex `^[A-Za-z0-9./-]+$`), sementara BR-01 menyebut "alfanumerik" secara literal. Namun contoh di spec sendiri (`005/123/DPRD`) memakai `/`, jadi regex yang ada kemungkinan sudah benar — ini murni ambiguitas dokumen, bukan bug implementasi. | `surat-masuk-buat.html` | Tidak perlu diubah kecuali ada klarifikasi lebih lanjut dari penulis spec. |

---

## 4. Rekomendasi Urutan Perbaikan

1. ~~**G-01** (Unit Type) — selesai.~~
2. ~~**G-02 + G-03** (split waktu mulai/selesai + validasi `end_time > start_time`) — selesai.~~
3. ~~**G-04** (maxlength field teks) — selesai.~~
4. ~~**G-05** (tipe & batas lampiran) — selesai.~~
5. ~~**G-06** (tombol Hapus draft) — selesai.~~
6. ~~**G-07** (prefill "Lanjutkan" draft) — selesai.~~
7. ~~**G-08** (tampilkan notes disposisi) — selesai.~~
8. **M-01 / M-02** — opsional, prioritas rendah, belum dikerjakan.
