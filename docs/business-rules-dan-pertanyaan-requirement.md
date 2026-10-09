# Business Rules & Daftar Pertanyaan Requirement — e-Parlemen DPRD

*Per 8 Oktober 2026*

Dokumen ini juga tersedia sebagai Claude Doc (bisa diedit/dikomentari bersama tim): https://claude.ai/code/artifact/daadd1e3-fa4f-485a-b857-7514f1d89ddb

## Ringkasan & Tujuan Dokumen

Dokumen ini merangkum **business rules** yang sudah terbangun di prototipe e-Parlemen (modul Master Data: Periode, Jabatan, Config Fraksi, Role, RBAC, Pegawai, Akun Pengguna, Dapil, Jenis Kegiatan, Periode Reses), serta **daftar pertanyaan** yang perlu dikonfirmasi langsung ke klien DPRD sebelum modul fungsional (Reses & Dapil, Persuratan, Rapat) dibangun.

Tujuan sesi requirement gathering:

1. Memastikan asumsi yang dipakai di prototipe (lihat bagian Asumsi di akhir dokumen) sesuai proses kerja Sekretariat DPRD yang sebenarnya.
2. Menentukan aturan bisnis definitif untuk area yang masih berupa asumsi/placeholder.
3. Menyepakati prioritas pengembangan modul berikutnya (Reses & Dapil, Persuratan, Rapat).

## Business Rules — Master Periode, Jabatan, Dapil, Jenis Kegiatan, Periode Reses

**Master Periode**
- Merepresentasikan satu periode/masa jabatan DPRD (contoh: Periode 2024–2029).
- Field: kode_periode, nama_periode, tanggal_mulai, tanggal_selesai, status (Aktif/Nonaktif).
- Hanya satu Periode boleh Aktif pada satu waktu — mengaktifkan satu Periode otomatis menonaktifkan Periode lain.

**Master Jabatan**
- Hierarkis dengan Level & Parent: Ketua DPRD (L1) → Wakil Ketua DPRD (L2) → Anggota DPRD (L3); Sekretaris DPRD/Sekwan (L2) → Operator Sekretariat (L3).
- Level dihitung otomatis dari Parent yang dipilih, tidak diedit manual.
- Setiap Jabatan memetakan ke Role POC (Ketua/Administrator/Anggota), Platform (Web untuk Ketua & Administrator, Mobile untuk Anggota), dan kebutuhan Fraksi (Ya untuk Ketua & Anggota — politisi; Tidak untuk Administrator/Sekretariat — ASN/non-politisi).

**Master Dapil**
- 1 Dapil memiliki banyak Anggota; 1 Anggota hanya terdaftar di 1 Dapil (memilih Anggota di Dapil lain memindahkannya).
- Dapil memiliki struktur wilayah (Kecamatan → Kelurahan/Desa).

**Jenis Kegiatan**
- "Berlaku Untuk" bersifat pilih satu: Reses *atau* Kunjungan Dapil, tidak bisa keduanya sekaligus.
- Tidak ada relasi ke Dapil spesifik pada level Jenis Kegiatan (sempat dibangun lalu dilepas — lihat bagian Asumsi).

**Periode Reses**
- Setiap Periode Reses (mis. "Reses I Tahun 2026") terikat ke satu Master Periode (periode_id, relasi wajib).
- Hanya satu Periode Reses yang boleh Aktif secara global pada satu waktu, mengikuti pola yang sama dengan Master Periode — ini masih asumsi, belum dikonfirmasi klien.

## Business Rules — Config Fraksi, Role & RBAC, Pegawai, Akun Pengguna

**Config Fraksi**
- Fraksi punya Kode unik, Nama, dan terikat ke satu Periode DPRD.
- Tidak ada relasi ke Partai politik pembentuk — field ini dihapus dari rancangan awal atas permintaan eksplisit (lihat Asumsi).
- Tidak ada field status Aktif/Nonaktif pada Fraksi (dihapus atas permintaan eksplisit).
- Saat membuat Fraksi, admin bisa memilih dari daftar Fraksi yang sudah ada *atau* membuat baru langsung dari form yang sama ("Lainnya").
- Daftar Fraksi bisa difilter per Periode DPRD, default ke Periode yang sedang Aktif.

**Role & RBAC**
- Role bersifat custom/dinamis (Kode, Nama, Akses), bukan daftar baku — admin bisa menambah Role baru kapan saja.
- Satu Role bisa memiliki Akses Web, Mobile, atau keduanya.
- RBAC mengatur menu yang boleh diakses per Role, dipecah per platform (katalog menu Web vs Mobile berbeda).
- Role bawaan: Ketua (Web), Administrator (Web), Anggota (Mobile) — ketiganya default full-access, bisa diubah.
- Katalog menu Mobile saat ini masih asumsi (lihat Asumsi) karena aplikasi mobile belum ada di repo ini.

**Pegawai**
- Satu record Pegawai menyimpan: Nama, NIK (16 digit, unik), NIP (unik), Alamat, No. HP, Jabatan (relasi), Role (relasi ke RBAC), Fraksi (relasi, opsional).
- Fraksi bersifat opsional khusus untuk Role yang tidak memerlukan afiliasi fraksi (mis. Administrator/ASN).

**Akun Pengguna (Create New Account)**
- Pembuatan akun **mewajibkan** memilih Pegawai yang sudah terdaftar terlebih dahulu.
- Setelah Pegawai dipilih, semua data (Nama, NIP, No. HP, Jabatan, Role, Platform Akses, Fraksi) terisi otomatis dan read-only.
- Satu-satunya input manual adalah Email, yang dipakai untuk mengirim tautan aktivasi akun.
- Implikasi: data Pegawai harus lebih dulu lengkap & benar sebelum akun bisa dibuat — Pegawai adalah single source of truth untuk identitas & hak akses user.

## Daftar Pertanyaan — Periode DPRD & Master Jabatan

1. Siapa yang berwenang mengaktifkan/menonaktifkan Periode DPRD, dan apakah pergantian periode terjadi otomatis berdasarkan tanggal atau manual oleh admin?
2. Saat Periode DPRD baru dimulai, apakah data Fraksi & Pegawai dari periode sebelumnya otomatis terbawa/terduplikasi ke periode baru, atau harus diinput ulang dari nol?
3. Apakah hierarki Jabatan yang ada sekarang (Ketua/Wakil Ketua/Anggota DPRD, Sekretaris/Operator Sekretariat) sudah mencakup semua jabatan yang relevan, atau ada jabatan lain (Ketua Komisi, Ketua Fraksi, Bendahara, dll.) yang perlu ditambahkan?
4. Apakah mapping Jabatan → Role POC → Platform → Kebutuhan Fraksi bersifat tetap/baku, atau bisa berubah sewaktu-waktu sesuai kebijakan internal?

## Daftar Pertanyaan — Config Fraksi, Pegawai, Akun Pengguna

1. Apakah Fraksi benar-benar tidak perlu terhubung ke Partai politik, atau relasi ini akan dibutuhkan di versi production (misal untuk pelaporan ke KPU/pusat)?
2. Apakah Fraksi perlu status Aktif/Nonaktif (misal fraksi dibubarkan/merger di tengah periode), atau cukup terikat ke Periode saja?
3. Apakah satu Pegawai boleh memiliki lebih dari satu Akun (misal akun lama + akun baru), atau wajib satu Pegawai = satu Akun?
4. Jika data Jabatan/Role/Fraksi seorang Pegawai diubah setelah Akunnya dibuat, apakah Akun tersebut otomatis ikut berubah, atau perlu proses sinkronisasi/reaktivasi manual?
5. Apakah NIK/NIP harus unik secara global sepanjang waktu, atau hanya unik dalam Periode yang sedang aktif (misal NIP bisa dipakai ulang setelah pegawai purna tugas)?
6. Siapa saja yang boleh melihat data pribadi Pegawai (NIK, Alamat, No. HP) — perlu pembatasan akses/masking untuk Role tertentu?

## Daftar Pertanyaan — Role, RBAC & Keamanan Akses

1. Siapa yang boleh membuat/mengubah Role dan mengatur izin RBAC — apakah ini sendiri dibatasi oleh sebuah permission, dan siapa yang menjaga halaman RBAC itu sendiri?
2. Apakah satu Role benar-benar bisa punya akses Web dan Mobile sekaligus dalam praktiknya, atau selalu satu Role = satu platform?
3. Apa struktur menu/navigasi sebenarnya pada aplikasi mobile Anggota DPRD? Prototipe ini memakai daftar tebakan (Beranda, Catat Kegiatan Reses, Dapil Saya, Pokir, Jadwal Rapat, Presensi Rapat, Notifikasi, Profil Saya) yang perlu divalidasi atau diganti sesuai desain aplikasi mobile sesungguhnya.
4. Apakah RBAC perlu mendukung pengecualian per-user (override individual), atau akses murni ditentukan oleh Role saja tanpa exception?
5. Apakah diperlukan audit log untuk setiap perubahan izin RBAC / pembuatan Role baru?

## Daftar Pertanyaan — Jenis Kegiatan, Periode Reses & Modul Berikutnya

1. Dikonfirmasi: Jenis Kegiatan hanya berlaku untuk salah satu dari Reses atau Kunjungan Dapil, tidak pernah keduanya — apakah benar tidak ada kegiatan yang relevan untuk kedua konteks sekaligus?
2. Mapping Jenis Kegiatan ke Dapil spesifik sempat dibangun lalu dilepas atas instruksi — apakah fitur ini akan dibutuhkan kembali, dan di level apa (per jenis kegiatan, atau per kejadian/record kegiatan aktual)?
3. Apa definisi "Aktif" untuk Periode Reses — periode yang sedang berjalan berdasarkan tanggal hari ini, atau periode berikutnya yang harus diisi laporan oleh Anggota? Apakah status ini seharusnya dihitung otomatis dari tanggal, bukan di-toggle manual oleh admin?
4. Apakah mungkin ada lebih dari satu Periode Reses aktif bersamaan (misal berbeda Dapil, jadwal tumpang tindih), atau aturan "hanya satu Aktif" ini sudah benar?
5. Untuk modul Reses & Dapil, Persuratan, dan Rapat (masih "Segera" di sidebar) — modul mana yang menjadi prioritas tertinggi untuk sesi requirement berikutnya?
6. Apakah ada sistem/database lama (legacy) yang datanya perlu dimigrasikan ke sistem ini, atau pengembangan ini sepenuhnya greenfield?

## Asumsi yang Dipakai di Prototipe (Perlu Divalidasi)

- **Hanya satu Periode DPRD & satu Periode Reses aktif sekaligus** — aturan "exclusive active" diterapkan konsisten di kedua modul, tapi belum dikonfirmasi klien khusus untuk Periode Reses.
- **Fraksi tanpa relasi Partai & tanpa status Aktif/Nonaktif** — kedua field ini sempat ada di rancangan awal, lalu dihapus atas instruksi eksplisit; perlu dikonfirmasi apakah ini keputusan final.
- **Katalog menu Mobile** (Beranda, Catat Kegiatan Reses, Dapil Saya, Pokir, Jadwal Rapat, Presensi Rapat, Notifikasi, Profil Saya) adalah tebakan berdasarkan konteks, karena aplikasi mobile belum tersedia untuk dicek langsung.
- **Format NIK 16 digit numerik** — mengikuti standar NIK Indonesia pada umumnya, divalidasi di form Pegawai.
- **Akun Pengguna wajib berasal dari Pegawai yang sudah ada** — pembuatan akun langsung tanpa Pegawai tidak lagi dimungkinkan di alur saat ini.
- **Jenis Kegiatan: pilih satu antara Reses/Kunjungan Dapil** — sebelumnya multi-select, diubah ke single-select atas instruksi; mapping ke Dapil spesifik yang sempat dibangun juga dilepas.
- **3 Role bawaan** (Ketua, Administrator, Anggota) dan pemetaan platformnya (Web/Web/Mobile) dipakai sebagai data seed, bukan aturan final — Role sekarang sepenuhnya bisa dikustomisasi oleh admin.
- Seluruh data pada prototipe ini tersimpan di localStorage browser (sisi klien) sebagai simulasi — belum terhubung ke database/backend sungguhan.
