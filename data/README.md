# Simulasi Data Struktur Organisasi DPRD Kota Magelang (JSON)

Sumber: `Simulasi_Data_Struktur_DPRD.xlsx` versi 3 (model 8 tabel).

| File | Isi | Baris |
|---|---|---|
| periods.json | Periode DPRD | 1 |
| parties.json | Partai politik | 6 |
| unit_types.json | Jenis unit Dewan & Setwan | 8 |
| org_units.json | Unit (Pimpinan, Fraksi, Komisi, Badan, Setwan) | 20 |
| positions.json | Jabatan | 26 |
| unit_type_positions.json | Jabatan yang boleh per jenis unit | 40 |
| persons.json | Anggota dewan & pegawai Setwan | 52 |
| assignments.json | Penempatan orang di unit | 123 |
| all_tables.json | Semua tabel dalam satu file | - |

Urutan import (mengikuti foreign key): periods → parties → unit_types → org_units → positions → unit_type_positions → persons → assignments.

Catatan:
- Kolom bantu `helper_*` dari Excel tidak disertakan.
- `id` berupa UUID v5 (deterministik). Nilai `null` = kosong.
- Nilai simulasi (bukan data asli): tanggal mulai, `member_code`, `email`, `employment_type` PRAWERTI PRAJNAJATI.
- `org_units` memuat 6 unit Setwan sebagai bagian dari hirarki.
