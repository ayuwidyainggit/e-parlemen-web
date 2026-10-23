-- Insert data ke tabel `menus` (skema sudah ADA di live DB, jadi ini DML/INSERT,
-- bukan DDL/CREATE TABLE - sama seperti catatan di insert-data-role-superadmin.sql).
--
-- PENTING - koreksi nama database: tabel `menus` TIDAK ADA di database "ayuwidyainggit"
-- (dicek via information_schema per 22 Okt 2026 - database itu kosong, tanpa tabel aplikasi
-- sama sekali). Tabel `menus` yang sesuai docs/trd-database-eparlemen.md Bagian 4.11 ada di
-- database "eparlemenv2" (dicek live: kolom & constraint cocok 100% dgn dokumen tsb, 0 baris
-- saat ini). Jalankan script ini setelah connect ke "eparlemenv2", BUKAN "ayuwidyainggit":
--   psql -d eparlemenv2 -f docs/insert-data-menus.sql
--
-- Sumber data: daftar module/feature yang diberikan user, mengikuti struktur sidebar Web Admin
-- (bukan Mobile) - platform diisi 'WEB' utk semua baris. Pola yang dipakai utk membedah
-- flat list module/feature menjadi grup (level 1, parent_id NULL) & child (level 2,
-- parent_id = grup) persis mengikuti skema `menus` (ck_menus_level_matches_parent):
--   - Baris dengan `feature` TERISI -> membuka GRUP BARU: label grup = `module`, lalu child
--     pertamanya dibuat dari `feature` (utk Login/Logout, module==feature apa adanya -> grup
--     "Login" berisi 1 child "Login", grup "Logout" berisi 1 child "Logout").
--   - Baris dengan `feature` KOSONG -> child tambahan di grup yang BARU saja dibuka di atasnya,
--     labelnya diambil dari `module` baris itu sendiri.
-- Hasilnya 9 grup, total 28 child (cocok dgn jumlah baris input: 28).
--
-- `code` di-generate dgn slug (kebab-case) dari label child - BELUM diverifikasi cocok dgn
-- slug/route asli di aplikasi (mis. halaman HTML prototipe pakai nama file spt
-- "master-jabatan.html"), sesuaikan kalau tim Frontend/Backend sudah punya konvensi resmi.
-- Dua child berlabel sama "Laporan Rapat" (satu di grup Rapat, satu di grup Report) diberi
-- code berbeda ('laporan-rapat' vs 'laporan-rapat-report') krn `ux_menus_platform_code`
-- adalah UNIQUE (platform, code) global, bukan per-grup.
--
-- Idempotent: child pakai ON CONFLICT (platform, code) DO NOTHING; grup (code selalu NULL,
-- tidak kena constraint UNIQUE itu) dijaga manual lewat WHERE NOT EXISTS per label supaya
-- re-run script ini tidak menduplikasi baris grup.

BEGIN;

-- ============================================================================
-- Grup 1: Login
-- ============================================================================
WITH g AS (
  INSERT INTO menus (platform, parent_id, level, code, label, sort_order, is_active)
  SELECT 'WEB', NULL, 1, NULL, 'Login', 1, true
  WHERE NOT EXISTS (SELECT 1 FROM menus WHERE platform = 'WEB' AND parent_id IS NULL AND label = 'Login')
  RETURNING id
)
INSERT INTO menus (platform, parent_id, level, code, label, sort_order, is_active)
SELECT 'WEB', g.id, 2, v.code, v.label, v.sort_order, true
FROM g, (VALUES
  ('login', 'Login', 1)
) AS v(code, label, sort_order)
ON CONFLICT (platform, code) DO NOTHING;

-- ============================================================================
-- Grup 2: Logout
-- ============================================================================
WITH g AS (
  INSERT INTO menus (platform, parent_id, level, code, label, sort_order, is_active)
  SELECT 'WEB', NULL, 1, NULL, 'Logout', 2, true
  WHERE NOT EXISTS (SELECT 1 FROM menus WHERE platform = 'WEB' AND parent_id IS NULL AND label = 'Logout')
  RETURNING id
)
INSERT INTO menus (platform, parent_id, level, code, label, sort_order, is_active)
SELECT 'WEB', g.id, 2, v.code, v.label, v.sort_order, true
FROM g, (VALUES
  ('logout', 'Logout', 1)
) AS v(code, label, sort_order)
ON CONFLICT (platform, code) DO NOTHING;

-- ============================================================================
-- Grup 3: Master Data
-- ============================================================================
WITH g AS (
  INSERT INTO menus (platform, parent_id, level, code, label, sort_order, is_active)
  SELECT 'WEB', NULL, 1, NULL, 'Master Data', 3, true
  WHERE NOT EXISTS (SELECT 1 FROM menus WHERE platform = 'WEB' AND parent_id IS NULL AND label = 'Master Data')
  RETURNING id
)
INSERT INTO menus (platform, parent_id, level, code, label, sort_order, is_active)
SELECT 'WEB', g.id, 2, v.code, v.label, v.sort_order, true
FROM g, (VALUES
  ('master-periode', 'Master Periode', 1),
  ('master-jabatan', 'Master Jabatan', 2),
  ('master-unit-type', 'Master Unit Type', 3),
  ('role-rbac-management', 'Role & RBAC Management', 4),
  ('user-management', 'User Management', 5),
  ('master-dapil-seeder', 'Master Dapil - Seeder', 6),
  ('master-reses', 'Master Reses', 7),
  ('jenis-penugasan', 'Jenis Penugasan', 8)
) AS v(code, label, sort_order)
ON CONFLICT (platform, code) DO NOTHING;

-- ============================================================================
-- Grup 4: Struktur Organisasi
-- ============================================================================
WITH g AS (
  INSERT INTO menus (platform, parent_id, level, code, label, sort_order, is_active)
  SELECT 'WEB', NULL, 1, NULL, 'Struktur Organisasi', 4, true
  WHERE NOT EXISTS (SELECT 1 FROM menus WHERE platform = 'WEB' AND parent_id IS NULL AND label = 'Struktur Organisasi')
  RETURNING id
)
INSERT INTO menus (platform, parent_id, level, code, label, sort_order, is_active)
SELECT 'WEB', g.id, 2, v.code, v.label, v.sort_order, true
FROM g, (VALUES
  ('struktur-organisasi', 'Struktur Organisasi', 1),
  ('alat-kelengkapan-dprd', 'Alat Kelengkapan DPRD', 2)
) AS v(code, label, sort_order)
ON CONFLICT (platform, code) DO NOTHING;

-- ============================================================================
-- Grup 5: Reses & Dapil
-- ============================================================================
WITH g AS (
  INSERT INTO menus (platform, parent_id, level, code, label, sort_order, is_active)
  SELECT 'WEB', NULL, 1, NULL, 'Reses & Dapil', 5, true
  WHERE NOT EXISTS (SELECT 1 FROM menus WHERE platform = 'WEB' AND parent_id IS NULL AND label = 'Reses & Dapil')
  RETURNING id
)
INSERT INTO menus (platform, parent_id, level, code, label, sort_order, is_active)
SELECT 'WEB', g.id, 2, v.code, v.label, v.sort_order, true
FROM g, (VALUES
  ('penugasan-dapil-reses', 'Penugasan Dapil & Reses', 1),
  ('laporan-reses', 'Laporan Reses', 2),
  ('laporan-dapil', 'Laporan Dapil', 3)
) AS v(code, label, sort_order)
ON CONFLICT (platform, code) DO NOTHING;

-- ============================================================================
-- Grup 6: Persuratan
-- ============================================================================
WITH g AS (
  INSERT INTO menus (platform, parent_id, level, code, label, sort_order, is_active)
  SELECT 'WEB', NULL, 1, NULL, 'Persuratan', 6, true
  WHERE NOT EXISTS (SELECT 1 FROM menus WHERE platform = 'WEB' AND parent_id IS NULL AND label = 'Persuratan')
  RETURNING id
)
INSERT INTO menus (platform, parent_id, level, code, label, sort_order, is_active)
SELECT 'WEB', g.id, 2, v.code, v.label, v.sort_order, true
FROM g, (VALUES
  ('buat-surat', 'Buat Surat', 1),
  ('surat-keluar', 'Surat Keluar', 2)
) AS v(code, label, sort_order)
ON CONFLICT (platform, code) DO NOTHING;

-- ============================================================================
-- Grup 7: Rapat
-- ============================================================================
WITH g AS (
  INSERT INTO menus (platform, parent_id, level, code, label, sort_order, is_active)
  SELECT 'WEB', NULL, 1, NULL, 'Rapat', 7, true
  WHERE NOT EXISTS (SELECT 1 FROM menus WHERE platform = 'WEB' AND parent_id IS NULL AND label = 'Rapat')
  RETURNING id
)
INSERT INTO menus (platform, parent_id, level, code, label, sort_order, is_active)
SELECT 'WEB', g.id, 2, v.code, v.label, v.sort_order, true
FROM g, (VALUES
  ('crud-rapat-include-generate-qr', 'CRUD rapat (include generate QR)', 1),
  ('presensi-show-qr', 'Presensi (Show QR)', 2),
  ('laporan-rapat', 'Laporan Rapat', 3)
) AS v(code, label, sort_order)
ON CONFLICT (platform, code) DO NOTHING;

-- ============================================================================
-- Grup 8: Notifikasi
-- ============================================================================
WITH g AS (
  INSERT INTO menus (platform, parent_id, level, code, label, sort_order, is_active)
  SELECT 'WEB', NULL, 1, NULL, 'Notifikasi', 8, true
  WHERE NOT EXISTS (SELECT 1 FROM menus WHERE platform = 'WEB' AND parent_id IS NULL AND label = 'Notifikasi')
  RETURNING id
)
INSERT INTO menus (platform, parent_id, level, code, label, sort_order, is_active)
SELECT 'WEB', g.id, 2, v.code, v.label, v.sort_order, true
FROM g, (VALUES
  ('notifikasi-penugasan-dapil', 'Notifikasi Penugasan Dapil', 1),
  ('notifikasi-persuratan', 'Notifikasi Persuratan', 2),
  ('notifikasi-surat-keluar', 'Notifikasi Surat Keluar', 3),
  ('undangan-rapat', 'Undangan Rapat', 4)
) AS v(code, label, sort_order)
ON CONFLICT (platform, code) DO NOTHING;

-- ============================================================================
-- Grup 9: Report
-- ============================================================================
WITH g AS (
  INSERT INTO menus (platform, parent_id, level, code, label, sort_order, is_active)
  SELECT 'WEB', NULL, 1, NULL, 'Report', 9, true
  WHERE NOT EXISTS (SELECT 1 FROM menus WHERE platform = 'WEB' AND parent_id IS NULL AND label = 'Report')
  RETURNING id
)
INSERT INTO menus (platform, parent_id, level, code, label, sort_order, is_active)
SELECT 'WEB', g.id, 2, v.code, v.label, v.sort_order, true
FROM g, (VALUES
  ('laporan-penugasan', 'Laporan Penugasan', 1),
  ('laporan-persuratan', 'Laporan Persuratan', 2),
  ('laporan-anggota-yang-di-tugaskan', 'Laporan anggota yang di Tugaskan', 3),
  ('laporan-rapat-report', 'Laporan Rapat', 4)
) AS v(code, label, sort_order)
ON CONFLICT (platform, code) DO NOTHING;

COMMIT;

-- Verifikasi cepat setelah dijalankan:
-- SELECT g.label AS grup, c.sort_order, c.code, c.label AS child
-- FROM menus g JOIN menus c ON c.parent_id = g.id
-- WHERE g.platform = 'WEB'
-- ORDER BY g.sort_order, c.sort_order;
