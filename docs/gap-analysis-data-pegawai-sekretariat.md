# Analisis Gap — Data Pegawai Sekretariat (DUK) vs Modul Master Pegawai & Jabatan

*Per 8 Oktober 2026*

Sumber: `docs/Daftar Pegawai Sekretariat DPRD  Kota Magelang.pdf` — **Daftar Urut Kepangkatan (DUK) Sekretariat DPRD Kota Magelang, Periode September 2026**, 52 pegawai.

## Catatan Penting: Jenis Data Sumber

Dokumen ini **bukan** daftar Anggota DPRD (politisi). Judul & isinya adalah DUK ASN/PPPK **Sekretariat** DPRD — seluruh 52 orang punya NIP (format kepegawaian ASN), Pangkat/Golongan, dan Jabatan struktural/fungsional kesekretariatan. Tidak ada satu pun kolom Fraksi, Dapil, atau Periode Jabatan politik di dokumen ini. Jadi dataset ini hanya relevan untuk sisi "staf administratif" dari Master Pegawai, **bukan** untuk memvalidasi modul Fraksi/Dapil/Assignment Dapil yang mengasumsikan Anggota DPRD (politisi).

## 1. Gap Field-Level per Pegawai

| Field di Dokumen Asli | Ada di App? | Keterangan Gap |
|---|---|---|
| NIP (18 digit, format resmi: lahir+TMT+gender+urut) | Ada (`nip`, free text) | Tidak ada validasi format/panjang NIP; tidak ada parsing otomatis tanggal lahir/jenis kelamin dari NIP |
| Nama (dengan gelar akademik) | Ada (`nama`) | Sesuai |
| Foto | **Tidak ada** | Tidak ada field/upload foto profil di `pegawai-data.js` maupun form Master Pegawai |
| Pangkat (Pembina Tk. I, Penata, Pengatur, dst) | **Tidak ada** | Tidak ada field Pangkat sama sekali |
| Golongan/Ruang (IV/b, III/d, II/c — atau format baru: golongan tunggal IX/VII/V utk Jabatan Fungsional pasca-reformasi) | **Tidak ada** | Dua format berbeda perlu diakomodasi (golongan/ruang klasik vs golongan tunggal baru) |
| TMT Golongan | **Tidak ada** | — |
| Jabatan detail (Ka. Bagian, Ka. Sub Bagian, Analis Kebijakan Ahli Muda, Perisalah Legislatif, dst — puluhan nama unik) | Sebagian (`jabatanId`) | `JABATAN_LIST` hanya 5 entri generik, tidak mencakup struktur riil (lihat §2) |
| TMT Awal/Akhir Eselon | **Tidak ada** | — |
| Masa Kerja Keseluruhan & Masa Kerja Golongan | **Tidak ada** | Bisa dihitung otomatis dari TMT, tapi field TMT sendiri tidak ada |
| Diklat Kepemimpinan + Tahun | **Tidak ada** | — |
| Pendidikan + Tahun Lulus | **Tidak ada** | — |
| Tempat, Tanggal Lahir | **Tidak ada** | Tidak ada field tanggal lahir sama sekali (dibutuhkan mis. untuk hitung usia pensiun/BUP) |
| Jenis Kelamin | **Tidak ada** | — |
| Agama | **Tidak ada** | — |
| NIK | Tidak dicantumkan di dokumen | App mewajibkan NIK 16 digit unik; dokumen DUK tidak memuat NIK (identitas ASN memakai NIP) |
| Alamat | Tidak dicantumkan di dokumen | App punya field ini; tidak ada di dokumen DUK (mungkin tersimpan di sistem kepegawaian lain) |
| No. HP | Tidak dicantumkan di dokumen | sama seperti di atas |

## 2. Gap Struktural — Organisasi & Jenjang Jabatan

- **Struktur Bagian/Sub Bagian tidak dimodelkan.** Dokumen menunjukkan minimal 3 Bagian (Umum, Keuangan, Persidangan & Perundang-undangan) dengan Sub Bagian di bawahnya (mis. Sub Bagian Rumah Tangga & Perlengkapan). Master Jabatan tidak punya konsep "unit kerja" sama sekali.
- **Eselon (I/II/III/IV + A/B) tidak dimodelkan.** Jabatan struktural di dokumen eksplisit menyebut eselon, mis. "(III.A)", "(II.B)", "(IV.A)". Master Jabatan hanya punya Level 1–3 generik yang dirancang untuk hierarki Ketua→Wakil Ketua→Anggota DPRD, bukan konvensi eselon ASN.
- **Jabatan Fungsional (Ahli Pertama/Muda/Madya, Terampil/Penyelia) tidak dimodelkan.** Mayoritas pegawai yang baru diangkat (2021–2025) berstatus Jabatan Fungsional seperti "Analis Kebijakan Ahli Muda", "Perisalah Legislatif Ahli Pertama", "Pranata Komputer Ahli Pertama", "Asisten Perisalah Legislatif Terampil". Ini jalur karier ASN yang berbeda dari jalur struktural (eselon), dan sama sekali tidak terwakili di `JABATAN_LIST` yang hanya 5 item.
- **Status Kepegawaian (PNS vs PPPK) tidak dimodelkan.** Pola data menunjukkan 3 kelompok berbeda: PNS lama (Golongan/Ruang format IV/b dst., TMT lama), kelompok besar yang baru diangkat Oktober 2025 dengan Pangkat "-" (indikasi PPPK/CPNS baru, masa kerja ~11 bulan), dan kelompok Jabatan Fungsional baru dengan golongan tunggal (IX/VII/V, TMT Maret 2024–2025). Tidak ada field status kepegawaian di `pegawai-data.js`.
- **Tidak ada laporan/fitur DUK.** Dokumen sumber ini sendiri adalah keluaran laporan Daftar Urut Kepangkatan — ranking pegawai berdasar kepangkatan/senioritas untuk keperluan promosi/mutasi. Aplikasi tidak punya fitur laporan setara ini.

## 3. Gap Skala Data

Seed data `pegawai-data.js` saat ini hanya **4 pegawai** (2 "Anggota DPRD" demo + 2 Sekretariat demo). Dokumen DUK asli mencatat **52 pegawai Sekretariat saja** — belum termasuk Anggota DPRD sungguhan, yang adalah populasi terpisah dan belum ada datanya sama sekali di repo ini. Skala riil jauh lebih besar dari asumsi prototipe.

## 4. Implikasi ke Modul Dapil / Assignment Dapil

Karena ke-52 pegawai di dokumen ini seluruhnya ASN Sekretariat (bukan politisi Anggota DPRD), mereka **secara bisnis tidak relevan untuk Assignment Dapil** — Dapil hanya berlaku untuk Anggota DPRD terpilih. Dokumen ini tidak bisa dipakai untuk memvalidasi fitur Assignment Dapil yang baru dibangun. Yang masih dibutuhkan: daftar resmi Anggota DPRD (nama, fraksi, dapil asal, periode jabatan) — dokumen itu belum tersedia di repo ini.

## 5. Rekomendasi Prioritas

1. Pisahkan secara jelas dua populasi "Pegawai": **ASN Sekretariat** (Pangkat/Golongan/Eselon/Jabatan Fungsional) vs **Anggota DPRD** (Fraksi/Dapil/Periode) — strukturnya terlalu berbeda untuk dipaksakan ke satu model Jabatan generik yang sama.
2. Tambahkan field inti ASN ke Master Pegawai: Pangkat, Golongan/Ruang, TMT Golongan, Status Kepegawaian (PNS/PPPK), Tanggal Lahir, Jenis Kelamin, Pendidikan + Tahun Lulus, Foto.
3. Perluas Master Jabatan agar mendukung dua jalur karier ASN: struktural (Eselon + Unit Kerja/Bagian-Sub Bagian) dan fungsional (jenjang Ahli Pertama→Utama / Terampil→Penyelia) — bukan cuma Level 1–3 generik yang ada sekarang.
4. Pertimbangkan laporan DUK (auto-ranking berdasar TMT/Pangkat/Golongan) sebagai fitur turunan setelah field di atas tersedia.
5. Minta dokumen resmi daftar Anggota DPRD (nama, fraksi, dapil) ke klien untuk memvalidasi modul Fraksi/Dapil/Assignment Dapil yang sudah dibangun — dokumen DUK ini tidak mencakupnya sama sekali.
