# Data Struktur Organisasi DPRD Kota Magelang (JSON)

Sumber: **database `eparlemenv2` (PostgreSQL, host=localhost:5432)** — diekspor langsung
dari tabel live via `psql` pada 14 Okt 2026. Sebelumnya file-file ini berasal dari
`Simulasi_Data_Struktur_DPRD.xlsx`; sejak update ini isinya sepenuhnya mengikuti data
di database (bukan lagi simulasi Excel), kecuali `unit_type_positions.json` (lihat catatan).

| File | Tabel DB | Isi | Baris |
|---|---|---|---|
| periods.json | `periods` | Periode DPRD (2019-2024 nonaktif, 2024-2029 aktif) | 2 |
| parties.json | `parties` | Partai politik | 6 |
| unit_types.json | `unit_types` | Jenis unit Dewan & Setwan (semua level, termasuk `FRAKSI`/`AKD` per-partai/per-komisi) | 22 |
| org_units.json | `org_units` | Unit per periode (Pimpinan, Fraksi, Komisi, Badan utk 2024-2029; Setwan utk 2019-2024 & 2024-2029) | 26 |
| positions.json | `positions` | Jabatan (termasuk `parent_id` hierarki jabatan) | 26 |
| unit_type_positions.json | *(tidak ada di DB)* | Jabatan yang boleh per jenis unit | 40 *(stale, lihat catatan)* |
| persons.json | `users` | Anggota dewan & pegawai Setwan | 85 |
| assignments.json | `assignments` | Penempatan orang di unit per periode | 139 |
| all_tables.json | — | Semua tabel di atas dalam satu file (`meta` + `tables`) | 346 |

Urutan import (mengikuti foreign key): periods → parties → unit_types → org_units → positions → persons → assignments.

Catatan:
- `id` berupa UUID (sama seperti di DB `eparlemenv2`, bukan di-generate ulang).
- Nilai `null` = kosong, sama seperti NULL di database.
- Tanggal (`start_date`/`end_date`/`mulai`) memakai format `YYYY-MM-DD` apa adanya dari kolom `date` di Postgres.
- `org_units` & `assignments` sekarang mencakup **dua periode**: 2024-2029 (aktif) dan 2019-2024
  (nonaktif, hasil `docs/insert-data-periode-2019-2024.sql`) — SETWAN sudah punya struktur utk
  kedua periode, DEWAN baru punya struktur utk periode aktif saja.
- `assignments.json` baris ke-139 (person_id `c85438b2-...` / PRAWERTI PRAJNAJATI, org_unit
  `172a9a4d-...` / Sekretariat DPRD periode 2019-2024, posisi Sekretaris DPRD) ditambahkan setelah
  user meng-insert langsung ke DB via instruksi eksplisit, MENGGANTIKAN slot kosong yang tadinya
  sengaja dikosongkan di `docs/insert-data-periode-2019-2024.sql` karena TMT riil jabatan ini
  (27 Okt 2025) jatuh SETELAH periode 2019-2024 berakhir — baca `notes` barisnya sebelum dipakai
  sebagai acuan historis.
- **`unit_type_positions.json` TIDAK diperbarui** — tabel ini **tidak ada** di skema `eparlemenv2`
  saat ini (cek `information_schema.tables`: hanya ada `assignments, menus, org_units, parties,
  periods, positions, role_menu_permissions, roles, unit_types, user_role, users`). Isinya masih
  snapshot lama dari Excel dan sudah tidak tersinkron dengan `positions.json`/`unit_types.json`
  versi DB (banyak `id` yang sudah tidak match). Jangan dipakai sebagai acuan tanpa verifikasi ulang
  ke DB — kalau tabel ini memang mau diadakan, perlu dibuatkan tabelnya dulu di `eparlemenv2`.
- `persons.json` bersumber dari tabel `users` (bukan tabel `persons` — penamaan file dipertahankan
  demi kompatibilitas dengan skrip/halaman yang sudah memuat `data/persons.json`).
