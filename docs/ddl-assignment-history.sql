-- DDL: tabel `assignment_changes` -- riwayat PERGANTIAN pemegang jabatan
-- (bukan sekadar riwayat assignment biasa yang sudah ada di `assignments`),
-- per periode. Dibuat utk 2 kasus yang disebut user:
--   1) Anggota kena pidana (korupsi dsb) -> akun/orangnya dinonaktifkan ->
--      jabatan otomatis kosong -> nanti diisi orang lain (PAW -- Pergantian
--      Antar Waktu, proses resmi DPRD kalau yang diganti itu anggota DEWAN).
--   2) Anggota/pegawai dianggap tidak kompeten di 1 jabatan tertentu (tapi
--      orangnya sendiri masih aktif, bisa jadi masih pegang jabatan lain) ->
--      diganti orang lain di jabatan itu saja.
--
-- KONTEKS skema yang SUDAH ADA (dicek langsung ke DB per 14 Okt 2026):
--   - `assignments` sudah punya `end_date` (riwayat tutup/buka baris biasa),
--     tapi TIDAK merekam KENAPA suatu assignment ditutup atau SIAPA yang
--     menggantikan siapa -- cuma "baris A tutup, baris B buka", tanpa link
--     eksplisit antara keduanya maupun alasannya. Itu gap yang diisi tabel
--     ini.
--   - `users.status` sudah ada (varchar, semua baris saat ini 'AKTIF', TANPA
--     CHECK constraint) -- dipakai sbg status keanggotaan/kepegawaian orang
--     itu secara keseluruhan (BUKAN status login web -- itu beda konsep,
--     belum ada tabelnya di live schema, lihat docs/trd-database-eparlemen.md
--     Bagian 9 soal gap serupa). Kolom ini pas dipakai utk kasus (1) --
--     "orangnya dinonaktifkan" berarti `users.status` berubah dari 'AKTIF'.
--   - Tidak ada tabel "alasan" terpisah -- supaya tidak menambah tabel kecil
--     yang isinya cuma daftar kode, alasan di-encode langsung sbg nilai
--     `users.status` yang lebih spesifik (lihat VOKABULER di bawah) + kolom
--     `change_type`/`reason_note` di tabel baru ini.
--
-- KEPUTUSAN DESAIN:
-- 1) 1 baris = 1 EVENT pergantian, bukan 1 snapshot assignment. Isinya link
--    ke assignment LAMA (yang ditutup) dan assignment BARU (yang dibuka),
--    salah satu boleh NULL (lihat CHECK chk_assignment_changes_has_change):
--      - old_assignment_id ADA, new_assignment_id NULL = jabatan baru
--        dikosongkan (penggantinya belum ditentukan).
--      - old_assignment_id NULL, new_assignment_id ADA = jabatan yang
--        SEBELUMNYA memang kosong (allows_vacancy), sekarang baru diisi.
--      - keduanya ADA = pergantian langsung (jabatan tidak sempat kosong
--        tercatat sbg baris terpisah -- end_date lama & start_date baru
--        bersebelahan).
-- 2) `recorded_at` BUKAN kolom audit generik ("created_at semua tabel") yang
--    sengaja TIDAK dipasang di tabel lain (lihat alasan di
--    docs/ddl-dapil-dan-dapil-assignments.sql) -- tabel ini FUNGSINYA event
--    log, jadi "kapan event ini dicatat" adalah data inti, bukan metadata
--    dekoratif. `recorded_by` tetap nullable krn trigger otomatis (lihat
--    poin 3) tidak punya aktor manusia.
-- 3) VOKABULER `users.status` yang dipakai trigger di bawah (tidak dipasang
--    sbg CHECK di `users` -- kolom itu sudah ada & dipakai tabel lain, tidak
--    mau menambah constraint yang bisa menolak data lama kalau ternyata ada
--    nilai lain yang belum ketemu saat eksplorasi ini). Status SELAIN
--    'AKTIF' yang dikenali trigger:
--      NONAKTIF_PIDANA, NONAKTIF_MENINGGAL, NONAKTIF_MENGUNDURKAN_DIRI,
--      NONAKTIF_TIDAK_KOMPETEN, NONAKTIF_LAINNYA, PENSIUN, MUTASI_KELUAR.
--    Nilai lain (termasuk status custom di masa depan) tetap ditangani --
--    trigger memetakannya ke change_type 'LAINNYA' kalau tidak dikenali,
--    bukan menolak update.
-- 4) Trigger A (`trg_users_status_vacate_assignments`) menutup SEMUA
--    assignment aktif orang itu saat `users.status` berubah dari 'AKTIF' --
--    cocok utk kasus (1), karena org tsb memang berhenti total. KASUS (2)
--    ("tidak kompeten di 1 jabatan tertentu", orangnya masih aktif di
--    jabatan lain) TIDAK lewat trigger ini -- itu harus 1 UPDATE manual yang
--    menutup assignment spesifik + INSERT manual ke assignment_changes
--    (lihat contoh paling bawah), karena tidak ada sinyal otomatis apa pun
--    di DB yang bisa membedakan "jabatan mana" tanpa input manusia.
-- 5) Trigger B (`trg_assignments_link_replacement`) otomatis MENYAMBUNGKAN
--    assignment baru ke baris assignment_changes yang masih "kosong nunggu
--    pengganti" (new_assignment_id IS NULL) utk org_unit+position yang sama
--    -- jadi admin tidak perlu manual update baris history saat pengganti
--    akhirnya ditentukan, cukup INSERT assignment baru seperti biasa.

-- ============================================================================
-- 1. assignment_changes -- event log pergantian pemegang jabatan
-- ============================================================================
CREATE TABLE assignment_changes (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id         UUID         NOT NULL REFERENCES periods (id),
    org_unit_id       UUID         NOT NULL REFERENCES org_units (id),
    position_id       UUID         NOT NULL REFERENCES positions (id),
    old_assignment_id UUID         REFERENCES assignments (id),   -- assignment yg ditutup (NULL = jabatan sebelumnya kosong)
    new_assignment_id UUID         REFERENCES assignments (id),   -- assignment yg dibuka (NULL = belum ada pengganti/masih kosong)
    old_person_id     UUID         REFERENCES users (id),          -- redundant tapi memudahkan query tanpa join assignments lama
    new_person_id     UUID         REFERENCES users (id),
    change_type       VARCHAR(30)  NOT NULL,
    reason_note       TEXT,                                        -- detail bebas, mis. nomor perkara/putusan pengadilan
    decree_number     VARCHAR(100),                                -- No SK PAW / SK pemberhentian / SK pengangkatan pengganti
    effective_date    DATE         NOT NULL,                        -- tanggal efektif pemberhentian/pengangkatan
    recorded_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    recorded_by       UUID         REFERENCES users (id),          -- admin yg menginput (NULL kalau dari trigger otomatis)
    CONSTRAINT chk_assignment_changes_type CHECK (change_type IN (
        'PAW_PIDANA', 'PAW_MENINGGAL', 'PAW_MENGUNDURKAN_DIRI', 'PAW_TIDAK_KOMPETEN',
        'PAW_LAINNYA', 'MUTASI', 'PROMOSI', 'ROTASI', 'PENGISIAN_KEKOSONGAN', 'LAINNYA'
    )),
    CONSTRAINT chk_assignment_changes_has_change
        CHECK (old_assignment_id IS NOT NULL OR new_assignment_id IS NOT NULL)
);

CREATE INDEX idx_assignment_changes_period      ON assignment_changes (period_id);
CREATE INDEX idx_assignment_changes_org_unit    ON assignment_changes (org_unit_id, position_id);
CREATE INDEX idx_assignment_changes_old_person  ON assignment_changes (old_person_id);
CREATE INDEX idx_assignment_changes_new_person  ON assignment_changes (new_person_id);
-- Cari cepat "baris mana yang masih nunggu pengganti" (dipakai Trigger B).
CREATE INDEX idx_assignment_changes_pending ON assignment_changes (org_unit_id, position_id)
    WHERE new_assignment_id IS NULL;

-- ============================================================================
-- 2. Trigger A -- users.status berubah dari AKTIF -> tutup semua assignment
--    aktif orang itu + catat ke assignment_changes (kasus PAW total/korupsi/
--    meninggal/dll, BUKAN kasus "1 jabatan tertentu" -- lihat poin 4 di atas).
-- ============================================================================
CREATE OR REPLACE FUNCTION users_status_vacate_assignments() RETURNS TRIGGER AS $$
DECLARE
    v_change_type VARCHAR(30);
    v_assignment  RECORD;
BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status AND OLD.status = 'AKTIF' AND NEW.status IS DISTINCT FROM 'AKTIF' THEN
        v_change_type := CASE NEW.status
            WHEN 'NONAKTIF_PIDANA'            THEN 'PAW_PIDANA'
            WHEN 'NONAKTIF_MENINGGAL'         THEN 'PAW_MENINGGAL'
            WHEN 'NONAKTIF_MENGUNDURKAN_DIRI'  THEN 'PAW_MENGUNDURKAN_DIRI'
            WHEN 'NONAKTIF_TIDAK_KOMPETEN'     THEN 'PAW_TIDAK_KOMPETEN'
            WHEN 'NONAKTIF_LAINNYA'           THEN 'PAW_LAINNYA'
            WHEN 'PENSIUN'                     THEN 'MUTASI'
            WHEN 'MUTASI_KELUAR'              THEN 'MUTASI'
            ELSE 'LAINNYA'
        END;

        FOR v_assignment IN
            SELECT a.id, a.org_unit_id, a.position_id, ou.period_id
            FROM assignments a
            JOIN org_units ou ON ou.id = a.org_unit_id
            WHERE a.person_id = NEW.id AND a.end_date IS NULL
        LOOP
            UPDATE assignments SET end_date = CURRENT_DATE WHERE id = v_assignment.id;

            INSERT INTO assignment_changes (
                period_id, org_unit_id, position_id, old_assignment_id, new_assignment_id,
                old_person_id, new_person_id, change_type, reason_note, effective_date
            ) VALUES (
                v_assignment.period_id, v_assignment.org_unit_id, v_assignment.position_id,
                v_assignment.id, NULL, NEW.id, NULL, v_change_type,
                'Otomatis dari perubahan users.status: ' || OLD.status || ' -> ' || NEW.status,
                CURRENT_DATE
            );
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_status_vacate_assignments
    AFTER UPDATE OF status ON users
    FOR EACH ROW EXECUTE FUNCTION users_status_vacate_assignments();

-- ============================================================================
-- 3. Trigger B -- assignment baru dibuka utk org_unit+position yang masih
--    "nunggu pengganti" -> otomatis sambungkan ke baris assignment_changes
--    yang pending (new_assignment_id IS NULL), yang paling baru.
-- ============================================================================
CREATE OR REPLACE FUNCTION assignments_link_replacement() RETURNS TRIGGER AS $$
DECLARE
    v_pending_id UUID;
BEGIN
    SELECT id INTO v_pending_id
    FROM assignment_changes
    WHERE org_unit_id = NEW.org_unit_id
      AND position_id = NEW.position_id
      AND new_assignment_id IS NULL
    ORDER BY recorded_at DESC
    LIMIT 1;

    IF v_pending_id IS NOT NULL THEN
        UPDATE assignment_changes
        SET new_assignment_id = NEW.id, new_person_id = NEW.person_id
        WHERE id = v_pending_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assignments_link_replacement
    AFTER INSERT ON assignments
    FOR EACH ROW EXECUTE FUNCTION assignments_link_replacement();

-- ============================================================================
-- 4. View bantu -- riwayat pergantian siap tampil (nama orang/unit/jabatan),
--    utk laporan "siapa menggantikan siapa, kapan, & kenapa" per periode.
-- ============================================================================
CREATE OR REPLACE VIEW v_assignment_change_history AS
SELECT
    ac.id,
    per.name                                            AS periode,
    ou.name                                              AS unit,
    pos.name                                             AS jabatan,
    old_u.name                                           AS pejabat_lama,
    new_u.name                                           AS pejabat_baru,
    ac.change_type,
    ac.reason_note,
    ac.decree_number,
    ac.effective_date,
    ac.recorded_at
FROM assignment_changes ac
JOIN periods    per   ON per.id = ac.period_id
JOIN org_units  ou    ON ou.id = ac.org_unit_id
JOIN positions  pos   ON pos.id = ac.position_id
LEFT JOIN users old_u ON old_u.id = ac.old_person_id
LEFT JOIN users new_u ON new_u.id = ac.new_person_id
ORDER BY ac.effective_date DESC, ac.recorded_at DESC;

-- ============================================================================
-- 5. Contoh pemakaian -- KEDUA kasus yang disebut di percakapan
-- ============================================================================

-- --- Kasus 1: anggota kena pidana (korupsi), otomatis dinonaktifkan ---------
-- Admin cukup update status orangnya; Trigger A otomatis menutup SEMUA
-- assignment aktifnya & mencatat ke assignment_changes (new_assignment_id
-- masih NULL = jabatan kosong nunggu pengganti).
--
--   UPDATE users SET status = 'NONAKTIF_PIDANA' WHERE id = '<person_id anggota yg korupsi>';
--
-- Begitu DPRD menetapkan penggantinya (proses PAW resmi selesai), admin
-- tinggal INSERT assignment baru seperti biasa -- Trigger B otomatis
-- menyambungkannya ke baris assignment_changes yang masih pending di atas:
--
--   INSERT INTO assignments (org_unit_id, position_id, person_id, start_date, decree_number)
--   VALUES ('<org_unit_id jabatan yg kosong>', '<position_id>', '<person_id pengganti>',
--           '<tanggal pelantikan>', '<No SK PAW DPRD>');
--
-- (opsional) lengkapi decree_number PAW di baris assignment_changes-nya sendiri:
--   UPDATE assignment_changes SET decree_number = '<No SK PAW>'
--   WHERE old_person_id = '<person_id anggota yg korupsi>' AND new_assignment_id IS NOT NULL
--   ORDER BY recorded_at DESC LIMIT 1;

-- --- Kasus 2: tidak kompeten di 1 jabatan tertentu (orangnya tetap aktif) ---
-- Orangnya TIDAK di-nonaktifkan total (mungkin masih pegang jabatan lain),
-- jadi tidak lewat Trigger A -- admin tutup assignment spesifik itu saja &
-- catat manual ke assignment_changes dalam 1 transaksi:
--
--   BEGIN;
--     UPDATE assignments SET end_date = CURRENT_DATE
--     WHERE id = '<assignment_id jabatan yg mau dicopot>'
--     RETURNING org_unit_id, position_id INTO STRICT v_org_unit_id, v_position_id; -- (lewat psql: catat manual hasilnya)
--
--     INSERT INTO assignment_changes (
--       period_id, org_unit_id, position_id, old_assignment_id, old_person_id,
--       change_type, reason_note, effective_date
--     ) VALUES (
--       '<period_id periode berjalan>', '<org_unit_id>', '<position_id>',
--       '<assignment_id yg baru ditutup>', '<person_id yg dicopot>',
--       'PAW_TIDAK_KOMPETEN', 'Dicopot dari jabatan X krn evaluasi kinerja -- lihat SK terlampir',
--       CURRENT_DATE
--     );
--   COMMIT;
--
-- Pengisian penggantinya sama seperti Kasus 1: INSERT assignment baru
-- dgn org_unit_id+position_id yang sama -> Trigger B otomatis menyambungkan.

-- --- Lihat riwayat pergantian per periode -----------------------------------
--   SELECT * FROM v_assignment_change_history WHERE periode = '2024–2029' ORDER BY effective_date DESC;
