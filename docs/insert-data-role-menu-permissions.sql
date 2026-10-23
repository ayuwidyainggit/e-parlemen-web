-- Seeder utk tabel `role_menu_permissions` (database eparlemenv2) - 3 Role yang diminta:
--   KETUA         7ad624d4-4ad7-4ff2-9098-8e29d46e8ac9
--   SEKRETARIAT   f9f4f3d9-0027-4873-bf03-320feeadedca
--   SUPERADMIN    dbbfa205-634b-4fd8-81ac-e5e0c8266897
-- Ketiga id di atas sudah dicek LIVE di eparlemenv2 (tabel `roles`, per 22 Okt 2026) - ada &
-- aktif (is_active=true, can_access_web=true utk ketiganya). `menus` sudah berisi 37 baris
-- (9 grup level=1 + 28 child level=2, hasil docs/insert-data-menus.sql yang sudah dijalankan).
-- `role_menu_permissions` saat ini 0 baris, dan trigger "leaf only" (role_menu_permissions_validate)
-- yang direkomendasikan di docs/rekomendasi-skema-user-role-rbac.md §4 BELUM terpasang di live DB -
-- jadi WHERE m.parent_id IS NOT NULL di bawah ini WAJIB dijaga manual di sisi script (bukan DB)
-- supaya permission hanya menunjuk ke menu child (halaman sungguhan), bukan baris grup sidebar.
--
-- Pembagian CRUD per Role (BELUM ada spek granular per-menu dari user - ini default yang masuk
-- akal berdasarkan 2 sumber yang sudah ada di repo, SILAKAN KOREKSI kalau mau beda per menu):
--   - SUPERADMIN: CRUD penuh (create/read/update/delete=true) ke SEMUA menu WEB aktif - persis
--     pola di docs/insert-data-role-superadmin.sql (file itu menyiapkan role-nya dgn ID beda krn
--     dibuat sebelum role Superadmin live ini ada; seeder ini memakai id Superadmin yg SUDAH ADA
--     di live DB, jadi melanjutkan niat blok "OPSIONAL" di bagian bawah file itu).
--   - KETUA & SEKRETARIAT: read-only (can_read=true, lainnya false) ke SEMUA menu WEB aktif -
--     mengikuti default migrasi yang didokumentasikan di docs/rekomendasi-skema-user-role-rbac.md
--     poin 218 ("can_read=true; can_create/update/delete default false sampai ada kebutuhan
--     konkret per menu"). Baik rbac-data.js (mock prototipe) maupun roles.can_access_web di live
--     DB sama-sama menyatakan kedua Role ini berhak melihat seluruh menu Web, jadi scope-nya
--     "semua menu", hanya action CRUD-nya yang masih default read-only sampai ditentukan lain.
--
-- Idempotent: ON CONFLICT (role_id, menu_id) - Superadmin DO UPDATE (supaya tetap ter-sync kalau
-- CRUD-nya diubah lalu script ini dijalankan ulang), Ketua/Sekretariat DO NOTHING (supaya
-- permission yang sudah diberi beda-beda scope per menu lewat UI admin tidak tertimpa balik ke
-- default read-only setiap kali seeder re-run).

BEGIN;

-- ============================================================================
-- Superadmin - CRUD penuh ke semua menu WEB aktif
-- ============================================================================
INSERT INTO role_menu_permissions (role_id, menu_id, can_create, can_read, can_update, can_delete)
SELECT 'dbbfa205-634b-4fd8-81ac-e5e0c8266897'::uuid, m.id, true, true, true, true
FROM menus m
WHERE m.platform = 'WEB' AND m.parent_id IS NOT NULL AND m.is_active = true
ON CONFLICT (role_id, menu_id) DO UPDATE SET
  can_create = true, can_read = true, can_update = true, can_delete = true, updated_at = now();

-- ============================================================================
-- Ketua - read-only ke semua menu WEB aktif
-- ============================================================================
INSERT INTO role_menu_permissions (role_id, menu_id, can_create, can_read, can_update, can_delete)
SELECT '7ad624d4-4ad7-4ff2-9098-8e29d46e8ac9'::uuid, m.id, false, true, false, false
FROM menus m
WHERE m.platform = 'WEB' AND m.parent_id IS NOT NULL AND m.is_active = true
ON CONFLICT (role_id, menu_id) DO NOTHING;

-- ============================================================================
-- Sekretariat - read-only ke semua menu WEB aktif
-- ============================================================================
INSERT INTO role_menu_permissions (role_id, menu_id, can_create, can_read, can_update, can_delete)
SELECT 'f9f4f3d9-0027-4873-bf03-320feeadedca'::uuid, m.id, false, true, false, false
FROM menus m
WHERE m.platform = 'WEB' AND m.parent_id IS NOT NULL AND m.is_active = true
ON CONFLICT (role_id, menu_id) DO NOTHING;

COMMIT;

-- Verifikasi cepat setelah dijalankan (harus 28 baris per Role, total 84):
-- SELECT r.code, count(*), bool_and(p.can_read) AS semua_read,
--        bool_or(p.can_create) AS ada_create, bool_or(p.can_update) AS ada_update, bool_or(p.can_delete) AS ada_delete
-- FROM role_menu_permissions p JOIN roles r ON r.id = p.role_id
-- WHERE p.role_id IN (
--   '7ad624d4-4ad7-4ff2-9098-8e29d46e8ac9',
--   'f9f4f3d9-0027-4873-bf03-320feeadedca',
--   'dbbfa205-634b-4fd8-81ac-e5e0c8266897'
-- )
-- GROUP BY r.code;
