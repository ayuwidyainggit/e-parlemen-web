-- DDL: tambah kolom `period_id` (denormalisasi) ke `dapil_assignments`.
--
-- KONTEKS: `dapil_assignments` awalnya SENGAJA tidak punya `period_id`
-- langsung (lihat docs/ddl-dapil-dan-dapil-assignments.sql, KEPUTUSAN
-- DESAIN no. 1) -- periode didapat lewat join `dapil_id -> dapils.period_id`,
-- pola yang sama dengan `assignments` yang juga tidak menduplikasi
-- `period_id` dan hanya mengandalkan `org_unit_id -> org_units.period_id`.
--
-- Permintaan sekarang: tambahkan `period_id` langsung di `dapil_assignments`
-- supaya laporan/filter per periode (mis. "semua penugasan dapil periode
-- 2024-2029") tidak perlu join ke `dapils` lagi. Ini murni DENORMALISASI
-- utk kemudahan query, BUKAN sumber kebenaran baru -- nilainya harus selalu
-- sama dengan `dapils.period_id` milik `dapil_id` baris tsb.
--
-- KEPUTUSAN DESAIN:
-- 1) `period_id` dibuat NOT NULL + FK ke `periods(id)`, konsisten dgn
--    `dapils.period_id`.
-- 2) Supaya tidak jadi 2 sumber kebenaran yang bisa divergen (penyebab
--    `dapil_assignments` awalnya tidak diberi kolom ini), nilai `period_id`
--    DIISI OTOMATIS oleh trigger dari `dapils.period_id` milik `dapil_id`
--    yang dipilih -- tidak diisi manual oleh aplikasi. Nilai yang dikirim
--    aplikasi (kalau ada) akan DITIMPA oleh trigger ini.
-- 3) Index baru `idx_dapil_assignments_period` ditambahkan karena itulah
--    tujuan utama denormalisasi ini (filter/laporan per periode).
--
-- Dijalankan sbg migrasi terpisah (bukan edit ke
-- ddl-dapil-dan-dapil-assignments.sql) karena tabel itu sudah live di DB.

-- ============================================================================
-- 1. Tambah kolom (nullable dulu supaya aman utk tabel yang sudah berisi data)
-- ============================================================================
ALTER TABLE dapil_assignments
    ADD COLUMN period_id UUID REFERENCES periods (id);

-- ============================================================================
-- 2. Backfill baris lama dari dapils.period_id
-- ============================================================================
UPDATE dapil_assignments da
SET period_id = d.period_id
FROM dapils d
WHERE d.id = da.dapil_id
  AND da.period_id IS NULL;

-- ============================================================================
-- 3. Kunci jadi NOT NULL setelah backfill selesai
-- ============================================================================
ALTER TABLE dapil_assignments
    ALTER COLUMN period_id SET NOT NULL;

CREATE INDEX idx_dapil_assignments_period ON dapil_assignments (period_id);

-- ============================================================================
-- 4. Trigger: auto-isi/sinkronkan period_id dari dapils.period_id, supaya
--    kolom ini tidak bisa divergen dari sumber aslinya (dapils.period_id).
-- ============================================================================
CREATE OR REPLACE FUNCTION dapil_assignments_sync_period() RETURNS TRIGGER AS $$
BEGIN
    SELECT period_id INTO NEW.period_id FROM dapils WHERE id = NEW.dapil_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_dapil_assignments_sync_period
    BEFORE INSERT OR UPDATE OF dapil_id ON dapil_assignments
    FOR EACH ROW EXECUTE FUNCTION dapil_assignments_sync_period();
