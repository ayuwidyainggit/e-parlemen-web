-- DDL: tambah kolom `is_active` (boolean) ke `dapil_assignments`.
--
-- KONTEKS: "aktif/tidak aktif" utk 1 baris dapil_assignments SELAMA INI
-- ditentukan dari `end_date IS NULL` (lihat partial unique index
-- `uq_dapil_assignments_active_person ... WHERE end_date IS NULL` di
-- docs/ddl-dapil-dan-dapil-assignments.sql). `is_active` di sini BUKAN
-- sumber kebenaran baru, hanya DENORMALISASI dari aturan yang sama supaya
-- query/filter "siapa yg penugasan dapilnya aktif" tidak perlu menulis
-- `WHERE end_date IS NULL` berulang di tiap tempat.
--
-- KEPUTUSAN DESAIN:
-- 1) `is_active` NOT NULL DEFAULT TRUE.
-- 2) Supaya tidak jadi 2 sumber kebenaran yang bisa divergen dari
--    `end_date` (pelajaran yg sama dgn kasus `period_id`, lihat
--    docs/ddl-dapil-assignments-add-period-id.sql), nilainya DIISI OTOMATIS
--    oleh trigger dari `end_date IS NULL` -- tidak diisi manual oleh
--    aplikasi. Nilai yang dikirim aplikasi (kalau ada) akan DITIMPA oleh
--    trigger ini setiap kali baris di-insert/di-update.
-- 3) Index partial yang sudah ada (`uq_dapil_assignments_active_person`)
--    TETAP memakai `end_date IS NULL` sbg sumber aturan, bukan `is_active`
--    -- `is_active` murni kolom baca (read-friendly), bukan constraint.

-- ============================================================================
-- 1. Tambah kolom (nullable dulu supaya aman utk tabel yang sudah berisi data)
-- ============================================================================
ALTER TABLE dapil_assignments
    ADD COLUMN is_active BOOLEAN;

-- ============================================================================
-- 2. Backfill baris lama dari end_date
-- ============================================================================
UPDATE dapil_assignments
SET is_active = (end_date IS NULL)
WHERE is_active IS NULL;

-- ============================================================================
-- 3. Kunci jadi NOT NULL DEFAULT TRUE setelah backfill selesai
-- ============================================================================
ALTER TABLE dapil_assignments
    ALTER COLUMN is_active SET NOT NULL,
    ALTER COLUMN is_active SET DEFAULT TRUE;

-- ============================================================================
-- 4. Trigger: auto-isi/sinkronkan is_active dari (end_date IS NULL), supaya
--    kolom ini tidak bisa divergen dari sumber aslinya (end_date).
-- ============================================================================
CREATE OR REPLACE FUNCTION dapil_assignments_sync_is_active() RETURNS TRIGGER AS $$
BEGIN
    NEW.is_active := (NEW.end_date IS NULL);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_dapil_assignments_sync_is_active
    BEFORE INSERT OR UPDATE OF end_date ON dapil_assignments
    FOR EACH ROW EXECUTE FUNCTION dapil_assignments_sync_is_active();
