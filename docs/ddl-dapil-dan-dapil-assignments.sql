-- DDL: tabel `dapils` (Daerah Pemilihan) + `dapil_assignments` (penugasan
-- anggota DEWAN ke 1 dapil, per periode).
--
-- UPDATE: `dapil_assignments` belakangan DIBERI kolom `period_id` tambahan
-- (denormalisasi utk query/laporan per periode) -- lihat migrasi terpisah
-- docs/ddl-dapil-assignments-add-period-id.sql. Keputusan desain no. 1 di
-- bawah ("periode didapat lewat join ke dapils") sudah tidak berlaku utuh;
-- dibiarkan apa adanya di sini sbg riwayat keputusan awal.
--
-- KONTEKS: TRD (docs/trd-database-eparlemen.md, Bagian 9 poin 1) sudah
-- mencatat gap ini -- kolom `users.electoral_district_id` ADA di DB tapi
-- belum punya tabel referensi & belum punya FK (dicek langsung ke DB:
-- kolom `uuid`, nullable, tanpa constraint FK). DDL di bawah mengisi gap
-- itu dengan tabel baru, BUKAN dengan menambahkan FK ke kolom lama --
-- lihat alasan di bagian "KEPUTUSAN DESAIN" di bawah.
--
-- Ditulis mengikuti konvensi yang BENAR-BENAR terpasang di DB saat ini
-- (dicek lewat pg_constraint/pg_indexes per 14 Okt 2026), bukan konvensi
-- "audit kolom di semua tabel" / trigger yang disebut TRD tapi ternyata
-- belum ada di live schema (periods/org_units/assignments/users tidak
-- punya created_at/updated_at/created_by/updated_by, dan trigger
-- trg_assignments_validate yang disebut TRD juga tidak ketemu di
-- pg_trigger) -- jadi DDL ini sengaja TIDAK ikut menambah audit kolom,
-- supaya konsisten dengan tabel yang sudah ada, bukan dengan dokumennya.
--
-- KEPUTUSAN DESAIN:
-- 1) `dapils` diberi `period_id` (NOT NULL), persis pola `org_units.period_id`
--    -- dapil riil berubah batas wilayah & jumlah kursi tiap periode pemilu
--    (KPU bisa redistricting), jadi "Dapil 1 periode 2019-2024" dan
--    "Dapil 1 periode 2024-2029" diperlakukan sbg baris berbeda, sama
--    seperti org_units SETWAN yang di-duplikasi per periode di
--    docs/insert-data-periode-2019-2024.sql.
-- 2) Penugasan org -> orang dibuat di tabel TERPISAH `dapil_assignments`
--    (bukan dengan mengisi `users.electoral_district_id` langsung), karena
--    kolom flat di `users` tidak bisa merekam riwayat (1 anggota bisa pindah
--    dapil antar periode) -- ini pola yang SAMA dengan `assignments` (yang
--    juga tabel riwayat terpisah, bukan kolom langsung di `users`). Setelah
--    tabel ini dipakai, kolom `users.electoral_district_id` sebaiknya
--    DITINGGALKAN (lihat catatan DROP COLUMN opsional di paling bawah) agar
--    tidak ada 2 sumber kebenaran yang bisa saling tidak sinkron.
-- 3) Aturan "1 user hanya boleh 1 dapil" diterjemahkan sbg "1 user hanya
--    boleh punya 1 dapil_assignment AKTIF (end_date IS NULL) pada satu
--    waktu" -- lewat partial unique index `uq_dapil_assignments_active_person`
--    pada `person_id` saja (tanpa `dapil_id` di komposit, beda dgn
--    `uq_assignments_active_person` yg komposit `org_unit_id, person_id` --
--    di `assignments` 1 orang boleh rangkap jabatan di unit berbeda, tapi
--    di dapil TIDAK boleh rangkap sama sekali). Pindah dapil = tutup baris
--    lama (`end_date`) baru buka baris baru, persis pola assignment biasa.
-- 4) Trigger `dapil_assignments_validate` memastikan hanya `person_type =
--    'DEWAN'` yang bisa diberi dapil (staf SETWAN tidak punya dapil).
--    Ini trigger BARU yang belum ada presedennya aktif di DB saat ini,
--    tapi dipertahankan karena aturan "dapil = konsep DEWAN" tidak bisa
--    ditegakkan oleh CHECK biasa (CHECK tidak bisa query tabel lain).

-- ============================================================================
-- 1. dapils -- katalog Daerah Pemilihan, di-scope per periode
-- ============================================================================
CREATE TABLE dapils (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id      UUID         NOT NULL REFERENCES periods (id),
    code           VARCHAR(20)  NOT NULL,              -- mis. 'DAPIL-1'
    name           VARCHAR(100) NOT NULL,               -- mis. 'Dapil 1 Magelang Utara'
    coverage_area  TEXT,                                 -- deskripsi kecamatan/kelurahan yang masuk dapil ini
    seat_count     SMALLINT,                             -- jumlah kursi DPRD yang dialokasikan ke dapil ini
    sort_order     INTEGER      NOT NULL DEFAULT 0,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_dapils_seat_count CHECK (seat_count IS NULL OR seat_count > 0)
);

-- kode dapil unik DALAM 1 periode (boleh sama antar periode berbeda, mis.
-- 'DAPIL-1' tetap ada tiap periode walau cakupan wilayahnya beda)
CREATE UNIQUE INDEX uq_dapils_code_period ON dapils (period_id, code);
CREATE INDEX idx_dapils_period ON dapils (period_id);

-- ============================================================================
-- 2. dapil_assignments -- penugasan 1 anggota DEWAN ke 1 dapil (riwayat)
-- ============================================================================
CREATE TABLE dapil_assignments (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    dapil_id       UUID         NOT NULL REFERENCES dapils (id),
    person_id      UUID         NOT NULL REFERENCES users (id),
    start_date     DATE,
    end_date       DATE,                                 -- NULL = masih aktif
    decree_number  VARCHAR(100),                          -- nomor SK penetapan
    notes          TEXT,
    CONSTRAINT chk_dapil_assignments_range
        CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- ATURAN UTAMA: 1 user hanya boleh punya 1 dapil AKTIF pada satu waktu
-- (lintas periode sekalipun -- pindah dapil wajib tutup baris lama dulu).
CREATE UNIQUE INDEX uq_dapil_assignments_active_person
    ON dapil_assignments (person_id)
    WHERE end_date IS NULL;

CREATE INDEX idx_dapil_assignments_dapil  ON dapil_assignments (dapil_id);
CREATE INDEX idx_dapil_assignments_person ON dapil_assignments (person_id);

-- ============================================================================
-- 3. Trigger: hanya person_type = 'DEWAN' yang boleh diberi dapil
-- ============================================================================
CREATE OR REPLACE FUNCTION dapil_assignments_validate() RETURNS TRIGGER AS $$
DECLARE
    v_person_type VARCHAR(10);
BEGIN
    SELECT person_type INTO v_person_type FROM users WHERE id = NEW.person_id;

    IF v_person_type IS DISTINCT FROM 'DEWAN' THEN
        RAISE EXCEPTION 'dapil_assignments hanya untuk person_type = DEWAN (person_id=% bertipe %)',
            NEW.person_id, v_person_type;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_dapil_assignments_validate
    BEFORE INSERT OR UPDATE ON dapil_assignments
    FOR EACH ROW EXECUTE FUNCTION dapil_assignments_validate();

-- ============================================================================
-- 4. (OPSIONAL, jalankan terpisah setelah data dipindah) -- bersihkan kolom
--    lama yang digantikan tabel ini, supaya tidak ada 2 sumber kebenaran.
-- ============================================================================
-- ALTER TABLE users DROP COLUMN electoral_district_id;
