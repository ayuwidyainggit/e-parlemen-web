-- Lanjutan utk `dapil_assignments.period_id` & `.is_active` -- kolomnya SUDAH
-- ada (ADD COLUMN + FK sudah dicek jalan), tapi backfill/NOT NULL/trigger
-- sync-nya belum. Jangan jalankan ulang ADD COLUMN, langsung lanjut dari
-- sini. Lihat rasional lengkap di:
--   docs/ddl-dapil-assignments-add-period-id.sql
--   docs/ddl-dapil-assignments-add-is-active.sql

-- ============================================================================
-- period_id: backfill dari dapils.period_id, lalu kunci NOT NULL + index
-- ============================================================================
UPDATE dapil_assignments da
SET period_id = d.period_id
FROM dapils d
WHERE d.id = da.dapil_id
  AND da.period_id IS NULL;

ALTER TABLE dapil_assignments
    ALTER COLUMN period_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dapil_assignments_period ON dapil_assignments (period_id);

CREATE OR REPLACE FUNCTION dapil_assignments_sync_period() RETURNS TRIGGER AS $$
BEGIN
    SELECT period_id INTO NEW.period_id FROM dapils WHERE id = NEW.dapil_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_dapil_assignments_sync_period ON dapil_assignments;
CREATE TRIGGER trg_dapil_assignments_sync_period
    BEFORE INSERT OR UPDATE OF dapil_id ON dapil_assignments
    FOR EACH ROW EXECUTE FUNCTION dapil_assignments_sync_period();

-- ============================================================================
-- is_active: backfill dari (end_date IS NULL) -> semua baris existing jadi
-- TRUE (karena ke-25 baris dummy belum ada yang end_date terisi), lalu kunci
-- NOT NULL DEFAULT TRUE + trigger sync
-- ============================================================================
UPDATE dapil_assignments
SET is_active = (end_date IS NULL)
WHERE is_active IS NULL;

ALTER TABLE dapil_assignments
    ALTER COLUMN is_active SET NOT NULL,
    ALTER COLUMN is_active SET DEFAULT TRUE;

CREATE OR REPLACE FUNCTION dapil_assignments_sync_is_active() RETURNS TRIGGER AS $$
BEGIN
    NEW.is_active := (NEW.end_date IS NULL);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_dapil_assignments_sync_is_active ON dapil_assignments;
CREATE TRIGGER trg_dapil_assignments_sync_is_active
    BEFORE INSERT OR UPDATE OF end_date ON dapil_assignments
    FOR EACH ROW EXECUTE FUNCTION dapil_assignments_sync_is_active();
