-- Insert role "Superadmin" ke tabel `roles` yang SUDAH ADA di live DB
-- (dicek lewat information_schema per 21 Okt 2026 -- isi saat ini cuma
-- ANGGOTA, KETUA, SEKRETARIAT, belum ada role admin/superadmin). Ini
-- BUKAN DDL (CREATE TABLE) krn skema `roles` / `role_menu_permissions`
-- sudah terpasang -- yang dibutuhkan cuma data barunya (DML).
--
-- Role ini dibuat TERPISAH dari role "Super Admin" bawaan di mock
-- rbac-data.js (yang di sana locked/tidak bisa dihapus) -- role
-- "Superadmin" di sini BISA diedit/dihapus lewat UI master-rbac, sesuai
-- keputusan sebelumnya. akses penuh Web & Mobile, CRUD penuh ke semua
-- menu aktif (termasuk menu yang baru ditambahkan belakangan, krn
-- role_menu_permissions di-generate dari SELECT * FROM menus, bukan
-- daftar menu_id yang di-hardcode).
--
-- CATATAN: tabel `menus` saat ini KOSONG (0 baris) di live DB -- jadi
-- INSERT kedua di bawah akan menyisipkan 0 baris permission utk sekarang.
-- Itu BUKAN bug: begitu data menu diisi (lewat seed/CRUD Menu), jalankan
-- ulang blok INSERT role_menu_permissions-nya saja (bagian 2) utk
-- melengkapi akses role ini ke menu-menu yang baru ada.

-- ============================================================================
-- 1. roles -- baris baru role "Superadmin"
-- ============================================================================
WITH new_role AS (
    INSERT INTO roles (code, name, can_access_web, can_access_mobile, is_active)
    VALUES ('SUPERADMIN', 'Superadmin', true, true, true)
    RETURNING id
)

-- ============================================================================
-- 2. role_menu_permissions -- CRUD penuh ke SEMUA menu aktif (Web & Mobile)
-- ============================================================================
INSERT INTO role_menu_permissions (role_id, menu_id, can_create, can_read, can_update, can_delete)
SELECT new_role.id, m.id, true, true, true, true
FROM menus m
CROSS JOIN new_role
WHERE m.is_active = true;

-- ============================================================================
-- 3. (OPSIONAL) jalankan ulang kapan pun ada menu baru, supaya role ini
--    tetap full-access -- aman dipanggil berkali-kali krn PK composite
--    (role_id, menu_id) mencegah duplikat (akan error kalau baris sudah
--    ada -- pakai ON CONFLICT DO NOTHING kalau mau idempotent):
-- ============================================================================
-- INSERT INTO role_menu_permissions (role_id, menu_id, can_create, can_read, can_update, can_delete)
-- SELECT r.id, m.id, true, true, true, true
-- FROM roles r
-- CROSS JOIN menus m
-- WHERE r.code = 'SUPERADMIN' AND m.is_active = true
-- ON CONFLICT (role_id, menu_id) DO UPDATE SET
--   can_create = true, can_read = true, can_update = true, can_delete = true,
--   updated_at = now();
