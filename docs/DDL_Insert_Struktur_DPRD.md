# DDL & Seed Data PostgreSQL — Struktur Organisasi DPRD Kota Magelang (v3)

Sumber: `Simulasi_Data_Struktur_DPRD_1.xlsx`
Target: PostgreSQL 15+ (memakai `gen_random_uuid()` dan `NULLS NOT DISTINCT`)
Status: sudah diuji di PostgreSQL 16, semua DDL + INSERT berhasil dan hasil cek sesuai sheet **Validasi**.

## Ringkasan

| # | Tabel | Baris | Keterangan |
|---|-------|------:|------------|
| 1 | periods | 2 | 2019-2024, 2024–2029 (aktif) |
| 2 | parties | 6 | PDIP, Golkar, PKB, PKS, Demokrat, Gerindra |
| 3 | unit_types | 22 | Hierarki jenis wadah (level 0–2) |
| 4 | positions | 26 | KELOMPOK, STRUKTURAL, FUNGSIONAL, PELAKSANA |
| 5 | org_units | 20 | 14 Dewan + 6 Setwan |
| 6 | users | 52 | 25 DEWAN + 27 SETWAN |
| 7 | assignments | 123 | 86 Dewan + 37 Setwan (11 formasi kosong) |
| 8 | roles | 0 | Struktur saja (sheet masih kosong) |
| 9 | user_role | 0 | Struktur saja (sheet masih kosong) |

Urutan eksekusi: **Bagian 1 (DDL) → Bagian 2 (INSERT) → Bagian 3 (Verifikasi)**.

## Catatan penyesuaian data

Beberapa isi Excel tidak bisa langsung di-import, jadi disesuaikan seperti ini:

1. **Nama tabel `users`** mengikuti nama sheet. Di sheet *Petunjuk* & *Mapping Nama* tabel ini masih disebut `persons`.
2. **unit_types: 14 baris tanpa `id` atau dengan `id` tidak valid** diberi UUID v5 baru (`uuid5(NAMESPACE_URL, 'eparlemen/unit_types/<code>')`). Id `BAGIAN-2` di Excel (`...c53456b4fdbee`) kelebihan 1 karakter, jadi ikut diganti.
3. **Formula Excel diselesaikan**: `parent_id` (`=A3`, `=H11`, dst.) dan `domain` (`=F14`) diganti nilai sebenarnya. Teks `NULL` jadi `NULL` asli. Spasi di akhir teks dibuang (`'AKD '`, `'Komisi B '`). `=TRUE()`/`=FALSE()` jadi boolean.
4. **`allows_vacancy` yang kosong** di unit_types anak diisi dari parent-nya (mis. BAGIAN-x ikut SEKRETARIAT = TRUE).
5. **Kolom `helper_*`** (header abu-abu) dan baris catatan *PROMT* di sheet `org_units` **tidak** di-import. Sheet `menus` kosong tanpa header, jadi dilewati.
6. ⚠️ **Perlu dicek**: `org_units` masih menunjuk ke `unit_types` lama yang generik:
   - BANGGAR, BAMUS, BAPEMPERDA, BK → semuanya ke `AKD-1` (*Badan Pembentukan Daerah*)
   - Bagian Umum, Keuangan, Persidangan → semuanya ke `BAGIAN-1` (*Kepala Bagian Umum*)
   - Sub Bagian RT & TU → keduanya ke `SUBBAGIAN 1`

   Data dibiarkan sesuai Excel supaya validasi tetap lolos, tapi sepertinya sheet `unit_types` sedang di tengah perubahan ke model hierarki. Jika baris baru (AKD-2, BAGIAN-2, dst.) akan dipakai, `org_units.unit_type_id` juga harus diarahkan ulang.
7. Nama periode `2024–2029` memakai *en dash* (–), sedangkan `2019-2024` memakai tanda hubung (-). Dibiarkan sesuai Excel.

## Bagian 1 — DDL (CREATE TABLE)

```sql
-- Opsional: reset jika ingin menjalankan ulang
-- DROP TABLE IF EXISTS user_role, roles, assignments, users, org_units,
--     positions, unit_types, parties, periods CASCADE;

-- 1. periods — periode keanggotaan DPRD
CREATE TABLE periods (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(20)  NOT NULL UNIQUE,
    start_date  DATE         NOT NULL,
    end_date    DATE         NOT NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_periods_range CHECK (end_date > start_date)
);
-- hanya boleh ada 1 periode aktif
CREATE UNIQUE INDEX uq_periods_one_active ON periods (is_active) WHERE is_active;

-- 2. parties — partai politik
CREATE TABLE parties (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    code          VARCHAR(20)   NOT NULL UNIQUE,
    name          VARCHAR(150)  NOT NULL,
    abbreviation  VARCHAR(30),
    logo_url      TEXT,
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE
);

-- 3. unit_types — jenis wadah (hierarki lewat parent_id)
CREATE TABLE unit_types (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(30)   NOT NULL UNIQUE,
    name            VARCHAR(150)  NOT NULL,
    image_url       TEXT,
    unit_type       VARCHAR(20)   NOT NULL,             -- AKD / FRAKSI / SEKRE
    domain          VARCHAR(10)   NOT NULL,             -- DEWAN / SETWAN
    level           SMALLINT      NOT NULL DEFAULT 0,
    parent_id       UUID          REFERENCES unit_types (id),
    max_per_member  SMALLINT,                           -- NULL = tidak dibatasi
    allows_vacancy  BOOLEAN       NOT NULL DEFAULT FALSE,
    sort_order      INTEGER       NOT NULL DEFAULT 0,
    CONSTRAINT chk_unit_types_unit_type CHECK (unit_type IN ('AKD', 'FRAKSI', 'SEKRE')),
    CONSTRAINT chk_unit_types_domain    CHECK (domain IN ('DEWAN', 'SETWAN')),
    CONSTRAINT chk_unit_types_parent    CHECK (parent_id IS DISTINCT FROM id)
);
CREATE INDEX idx_unit_types_parent ON unit_types (parent_id);

-- 4. positions — master jabatan
CREATE TABLE positions (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    category          VARCHAR(20)   NOT NULL,
    code              VARCHAR(80)   NOT NULL UNIQUE,
    name              VARCHAR(150)  NOT NULL,
    is_single_holder  BOOLEAN       NOT NULL DEFAULT FALSE,
    hierarchy_level   SMALLINT      NOT NULL,
    CONSTRAINT chk_positions_category CHECK (category IN ('KELOMPOK', 'STRUKTURAL', 'FUNGSIONAL', 'PELAKSANA'))
);

-- 5. org_units — wadah nyata (Pimpinan, Fraksi, Komisi, Badan, unit Setwan)
CREATE TABLE org_units (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_type_id  UUID          NOT NULL REFERENCES unit_types (id),
    parent_id     UUID          REFERENCES org_units (id),
    period_id     UUID          REFERENCES periods (id),   -- NULL untuk unit Setwan
    party_id      UUID          REFERENCES parties (id),   -- diisi untuk Fraksi
    code          VARCHAR(30)   NOT NULL,
    name          VARCHAR(150)  NOT NULL,
    scope         TEXT,
    duties        TEXT,
    sort_order    INTEGER       NOT NULL DEFAULT 0,
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_org_units_parent CHECK (parent_id IS DISTINCT FROM id)
);
-- kode unik per periode (unit Setwan tanpa periode juga tetap unik)
CREATE UNIQUE INDEX uq_org_units_code_period ON org_units (code, period_id) NULLS NOT DISTINCT;
CREATE INDEX idx_org_units_parent ON org_units (parent_id);
CREATE INDEX idx_org_units_period ON org_units (period_id);

-- 6. users — anggota dewan (DEWAN) + pegawai Setwan (SETWAN)
CREATE TABLE users (
    id                     UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    person_type            VARCHAR(10)   NOT NULL,
    employment_type        VARCHAR(10),
    name                   VARCHAR(150)  NOT NULL,
    title_prefix           VARCHAR(30),
    title_suffix           VARCHAR(50),
    employee_number_nip    VARCHAR(18)   UNIQUE,
    member_code            VARCHAR(20)   UNIQUE,
    party_id               UUID          REFERENCES parties (id),
    electoral_district_id  UUID,                         -- tabel dapil belum ada
    photo_url              TEXT,
    email                  VARCHAR(150)  UNIQUE,
    phone_number           VARCHAR(20),
    user_id                UUID,                         -- akun login (belum ada tabelnya)
    status                 VARCHAR(20)   NOT NULL DEFAULT 'AKTIF',
    CONSTRAINT chk_users_person_type     CHECK (person_type IN ('DEWAN', 'SETWAN')),
    CONSTRAINT chk_users_employment_type CHECK (employment_type IN ('PNS', 'PPPK', 'NON_ASN')),
    -- DEWAN: wajib partai & tanpa employment_type; SETWAN: wajib employment_type & tanpa partai
    CONSTRAINT chk_users_type_rules CHECK (
        (person_type = 'DEWAN'  AND employment_type IS NULL     AND party_id IS NOT NULL) OR
        (person_type = 'SETWAN' AND employment_type IS NOT NULL AND party_id IS NULL)
    )
);

-- 7. assignments — penempatan orang ke wadah + jabatan
CREATE TABLE assignments (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    org_unit_id    UUID          NOT NULL REFERENCES org_units (id),
    position_id    UUID          NOT NULL REFERENCES positions (id),
    person_id      UUID          REFERENCES users (id),   -- NULL = formasi kosong
    start_date     DATE,
    end_date       DATE,
    decree_number  VARCHAR(100),
    notes          TEXT,
    sort_order     INTEGER       NOT NULL DEFAULT 0,
    CONSTRAINT chk_assignments_range CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);
-- aturan 2: 1 orang hanya sekali aktif di wadah yang sama
CREATE UNIQUE INDEX uq_assignments_active_person
    ON assignments (org_unit_id, person_id)
    WHERE end_date IS NULL AND person_id IS NOT NULL;
CREATE INDEX idx_assignments_person   ON assignments (person_id);
CREATE INDEX idx_assignments_position ON assignments (position_id);

-- 8. roles — hak akses aplikasi (sheet masih kosong, struktur saja)
CREATE TABLE roles (
    id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    code               VARCHAR(30)   NOT NULL UNIQUE,
    name               VARCHAR(100)  NOT NULL,
    can_access_web     BOOLEAN       NOT NULL DEFAULT FALSE,
    can_access_mobile  BOOLEAN       NOT NULL DEFAULT FALSE,
    is_active          BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
    created_by         UUID          REFERENCES users (id),
    updated_by         UUID          REFERENCES users (id)
);

-- 9. user_role — relasi many-to-many users ↔ roles (sheet masih kosong)
CREATE TABLE user_role (
    user_id     UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role_id     UUID         NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_by  UUID         REFERENCES users (id),
    updated_by  UUID         REFERENCES users (id),
    PRIMARY KEY (user_id, role_id)
);
```

## Bagian 2 — INSERT data

Urutan INSERT mengikuti dependensi foreign key (parent dulu).

```sql
BEGIN;

-- 1. periods
INSERT INTO periods (id, name, start_date, end_date, is_active) VALUES
    ('d0eefc99-e99f-5ba3-a818-6d5555d829f8', '2019-2024', '2019-08-01', '2024-07-31', FALSE),
    ('d0eefc99-e99f-5ba3-a818-6d5555d829f9', '2024–2029', '2024-08-01', '2029-07-31', TRUE);

-- 2. parties
INSERT INTO parties (id, code, name, abbreviation, logo_url, is_active) VALUES
    ('256a77ab-4e74-59ec-bd71-a779f956b9e7', 'PDIP', 'Partai Demokrasi Indonesia Perjuangan', 'PDI-P', NULL, TRUE),
    ('1f4dfb9d-ad84-51fd-b3ff-115b1e1ad778', 'GOLKAR', 'Partai Golongan Karya', 'Golkar', NULL, TRUE),
    ('e4cb34f8-0ca2-535f-a848-b4dad9013327', 'PKB', 'Partai Kebangkitan Bangsa', 'PKB', NULL, TRUE),
    ('7f14241f-1ee0-57bf-b547-3abc4e0f0c76', 'PKS', 'Partai Keadilan Sejahtera', 'PKS', NULL, TRUE),
    ('d7e1f80b-0df6-5db5-aa4b-3d28abb0676f', 'DEMOKRAT', 'Partai Demokrat', 'Demokrat', NULL, TRUE),
    ('52f05101-4af3-52aa-9eeb-eeb4ca1d8adc', 'GERINDRA', 'Partai Gerakan Indonesia Raya', 'Gerindra', NULL, TRUE);

-- 3. unit_types (diurutkan per level agar parent masuk lebih dulu)
INSERT INTO unit_types (id, code, name, image_url, unit_type, domain, level, parent_id, max_per_member, allows_vacancy, sort_order) VALUES
    ('80fd0bac-7dc1-5a7b-9e86-cbac3ca1d75a', 'PIMPINAN', 'Pimpinan DPRD', NULL, 'AKD', 'DEWAN', 0, NULL, 1, FALSE, 1),
    ('a11b278e-e93f-584d-914c-04d207e1b1ca', 'FRAKSI', 'Fraksi', NULL, 'FRAKSI', 'DEWAN', 0, NULL, 1, FALSE, 2),
    ('b0259834-de2f-5648-be44-bd576db6d9a4', 'SEKRETARIAT', 'Sekretariat', NULL, 'SEKRE', 'SETWAN', 0, NULL, 1, TRUE, 1),
    ('f14157bb-d374-579c-a364-344b20f95539', 'PDIP', 'Partai Demokrasi Indonesia Perjuangan', NULL, 'FRAKSI', 'DEWAN', 1, 'a11b278e-e93f-584d-914c-04d207e1b1ca', NULL, FALSE, 1),
    ('1368b977-8715-5170-9651-43baeec237a1', 'GOLKAR', 'Partai Golongan Karya', NULL, 'FRAKSI', 'DEWAN', 1, 'a11b278e-e93f-584d-914c-04d207e1b1ca', NULL, FALSE, 2),
    ('6e3df131-63b1-5105-bda3-c7ab4455f8f4', 'PKB', 'Partai Kebangkitan Bangsa', NULL, 'FRAKSI', 'DEWAN', 1, 'a11b278e-e93f-584d-914c-04d207e1b1ca', NULL, FALSE, 3),
    ('72c17db7-173d-5ab3-8021-b807d9b803e6', 'PKS', 'Partai Keadilan Sejahtera', NULL, 'FRAKSI', 'DEWAN', 1, 'a11b278e-e93f-584d-914c-04d207e1b1ca', NULL, FALSE, 4),
    ('b87b09bc-86de-5f57-839d-f706baf88334', 'DEMOKRAT', 'Partai Demokrat', NULL, 'FRAKSI', 'DEWAN', 1, 'a11b278e-e93f-584d-914c-04d207e1b1ca', NULL, FALSE, 5),
    ('482d497c-c94e-52ad-91f7-b7a381d00aab', 'GERINDRA', 'Partai Gerakan Indonesia Raya', NULL, 'FRAKSI', 'DEWAN', 1, 'a11b278e-e93f-584d-914c-04d207e1b1ca', NULL, FALSE, 6),
    ('617dff00-2101-51d9-8c78-6b39ebc42f7d', 'KOMISI', 'Komisi', NULL, 'AKD', 'DEWAN', 1, '80fd0bac-7dc1-5a7b-9e86-cbac3ca1d75a', 1, FALSE, 3),
    ('ab89d114-ecf4-5207-b49d-239e83acccf9', 'AKD-1', 'Badan Pembentukan Daerah', NULL, 'AKD', 'DEWAN', 1, '80fd0bac-7dc1-5a7b-9e86-cbac3ca1d75a', NULL, FALSE, 1),
    ('e22dc7ee-130c-5e24-a7fa-defa2e721a76', 'AKD-2', 'Badan Musyawarah', NULL, 'AKD', 'DEWAN', 1, '80fd0bac-7dc1-5a7b-9e86-cbac3ca1d75a', NULL, FALSE, 2),
    ('579bdf3b-51d6-56bc-bd2e-63e890435b27', 'AKD-3', 'Badan Kehormatan', NULL, 'AKD', 'DEWAN', 1, '80fd0bac-7dc1-5a7b-9e86-cbac3ca1d75a', NULL, FALSE, 3),
    ('3e426352-23a8-5f11-b313-9802998aaf38', 'PANSUS', 'Panitia Khusus', NULL, 'AKD', 'DEWAN', 1, '80fd0bac-7dc1-5a7b-9e86-cbac3ca1d75a', NULL, FALSE, 5),
    ('2af29419-1d46-589a-84db-c53456b4fdbc', 'BAGIAN-1', 'Kepala Bagian Umum', NULL, 'SEKRE', 'SETWAN', 1, 'b0259834-de2f-5648-be44-bd576db6d9a4', NULL, TRUE, 1),
    ('e2254893-b777-54c5-a45f-5e6425622715', 'BAGIAN-2', 'Kepala Bagian Keuangan', NULL, 'SEKRE', 'SETWAN', 1, 'b0259834-de2f-5648-be44-bd576db6d9a4', NULL, TRUE, 2),
    ('9fa393c0-e5a5-5f2c-a25e-bbf1c68e1e15', 'BAGIAN-3', 'Kepala Bagian Persidangan dan Perundang-Undangan', NULL, 'SEKRE', 'SETWAN', 1, 'b0259834-de2f-5648-be44-bd576db6d9a4', NULL, TRUE, 3),
    ('39fd7d6d-0893-5005-b4c6-79538393dc12', 'KOMISI-A', 'Komisi A', NULL, 'AKD', 'DEWAN', 2, '617dff00-2101-51d9-8c78-6b39ebc42f7d', NULL, FALSE, 1),
    ('7ecb6564-6006-5530-a0a0-0d7f5fbc036b', 'KOMISI-B', 'Komisi B', NULL, 'AKD', 'DEWAN', 2, '617dff00-2101-51d9-8c78-6b39ebc42f7d', NULL, FALSE, 2),
    ('c49414ec-eeb6-5659-af8e-e4f94f623d0d', 'KOMISI-C', 'Komisi C', NULL, 'AKD', 'DEWAN', 2, '617dff00-2101-51d9-8c78-6b39ebc42f7d', NULL, FALSE, 3),
    ('5cd44512-1caa-55b3-a101-f1ec4484add0', 'SUBBAGIAN 1', 'Sub Bagian Rumah Tangga & Perlengkapan', NULL, 'SEKRE', 'SETWAN', 2, '2af29419-1d46-589a-84db-c53456b4fdbc', 1, TRUE, 1),
    ('a8a24c2c-a823-5bc6-987a-7eab47936a5c', 'SUBBAGIAN 2', 'Sub Bagian Rumah Tata Usaha dan Kepegawaian', NULL, 'SEKRE', 'SETWAN', 2, '2af29419-1d46-589a-84db-c53456b4fdbc', NULL, TRUE, 2);

-- 4. positions
INSERT INTO positions (id, category, code, name, is_single_holder, hierarchy_level) VALUES
    ('0d21b5b9-30a7-5345-9ffe-7987d0e7a947', 'KELOMPOK', 'KETUA', 'Ketua', TRUE, 1),
    ('8941fe45-9288-50da-874c-c149b0a7c350', 'KELOMPOK', 'WAKIL_KETUA', 'Wakil Ketua', FALSE, 2),
    ('306dc94b-c8a3-5274-b638-09ecfc192e86', 'KELOMPOK', 'SEKRETARIS', 'Sekretaris', TRUE, 3),
    ('085e0dc6-ce1a-5682-b4af-81144a629550', 'KELOMPOK', 'SEKRETARIS_BUKAN_ANGGOTA', 'Sekretaris Bukan Anggota', TRUE, 4),
    ('b80c6030-b60f-511a-b69a-e1fcaf15ef9a', 'KELOMPOK', 'ANGGOTA', 'Anggota', FALSE, 9),
    ('78588557-c2e9-5b41-883f-ee7c98d24bef', 'STRUKTURAL', 'SEKRETARIS_DPRD', 'Sekretaris DPRD', TRUE, 1),
    ('370fc088-3bec-5d9a-8da4-94f944e5c8de', 'STRUKTURAL', 'KEPALA_BAGIAN', 'Kepala Bagian', TRUE, 2),
    ('24865043-380a-5929-aa29-b2ae9e09cbd3', 'STRUKTURAL', 'KEPALA_SUB_BAGIAN', 'Kepala Sub Bagian', TRUE, 3),
    ('d00a235a-a693-5786-9c70-928c732447af', 'FUNGSIONAL', 'PRANATA_HUMAS_AHLI_PERTAMA', 'Pranata Humas Ahli Pertama', FALSE, 5),
    ('04dce491-6172-5e2b-af9f-b217b7d43395', 'FUNGSIONAL', 'PRANATA_KOMPUTER_AHLI_PERTAMA', 'Pranata Komputer Ahli Pertama', FALSE, 5),
    ('7cf2507b-35e2-5b06-a20a-e7e98e73a45f', 'FUNGSIONAL', 'PRANATA_SDM_APARATUR_TERAMPIL', 'Pranata SDM Aparatur Terampil', FALSE, 5),
    ('87240066-c49b-52d6-980a-3cbba2815561', 'FUNGSIONAL', 'ANALIS_KEBIJAKAN_AHLI_MUDA', 'Analis Kebijakan Ahli Muda', FALSE, 5),
    ('d6024ddc-ac71-54bd-a38e-1e1bca223cc7', 'FUNGSIONAL', 'PERISALAH_LEGISLATIF_AHLI_MADYA', 'Perisalah Legislatif Ahli Madya', FALSE, 5),
    ('99954d21-8d76-5bc9-9c64-60f921d99d50', 'FUNGSIONAL', 'PERISALAH_LEGISLATIF_AHLI_MUDA', 'Perisalah Legislatif Ahli Muda', FALSE, 5),
    ('d6c03e4b-c67a-5280-b8b6-6683c8aa6040', 'FUNGSIONAL', 'PERANCANG_PERATURAN_PERUNDANG_UNDANGAN_AHLI_PERTAMA', 'Perancang Peraturan Perundang-undangan Ahli Pertama', FALSE, 5),
    ('f803c918-51d5-5919-ad4e-7a3d7a83e313', 'FUNGSIONAL', 'PERISALAH_LEGISLATIF_AHLI_PERTAMA', 'Perisalah Legislatif Ahli Pertama', FALSE, 5),
    ('ebdd7ce9-cfe7-5df8-9f29-77f6bb9c8298', 'FUNGSIONAL', 'ASISTEN_PERISALAH_LEGISLATIF_PENYELIA', 'Asisten Perisalah Legislatif Penyelia', FALSE, 5),
    ('fb11da3c-df6e-58e2-916a-5964140afef4', 'FUNGSIONAL', 'ASISTEN_PERISALAH_LEGISLATIF_MAHIR', 'Asisten Perisalah Legislatif Mahir', FALSE, 5),
    ('951459cd-1124-55d9-bb77-857218e88ffd', 'FUNGSIONAL', 'ASISTEN_PERISALAH_LEGISLATIF_TERAMPIL', 'Asisten Perisalah Legislatif Terampil', FALSE, 5),
    ('ce85c387-8129-5dce-9c91-7e9fe3fa6498', 'PELAKSANA', 'PENELAAH_TEKNIS_KEBIJAKAN', 'Penelaah Teknis Kebijakan', FALSE, 6),
    ('11e3ada7-c900-55c4-819b-b51e5928dd1d', 'PELAKSANA', 'PENGELOLA_LAYANAN_OPERASIONAL', 'Pengelola Layanan Operasional', FALSE, 6),
    ('bb22c8a1-9e75-5277-b9ab-fee2d7966619', 'PELAKSANA', 'PENGADMINISTRASI_PERKANTORAN', 'Pengadministrasi Perkantoran', FALSE, 6),
    ('dc2e3c13-583c-50e6-aa05-5be865014014', 'PELAKSANA', 'OPERATOR_LAYANAN_OPERASIONAL', 'Operator Layanan Operasional', FALSE, 6),
    ('dcdbf0ae-835d-5a90-825e-3c655e01ecdf', 'PELAKSANA', 'PENGADMINISTRASI_KEUANGAN', 'Pengadministrasi Keuangan', FALSE, 6),
    ('3dac938a-da2e-5aaa-9efc-221242cc8a37', 'PELAKSANA', 'PENYUSUN_MATERI_HUKUM_DAN_PERUNDANG_UNDANGAN', 'Penyusun Materi Hukum dan Perundang-undangan', FALSE, 6),
    ('1d274582-2817-59be-90a2-6beb99836985', 'PELAKSANA', 'DOKUMENTALIS_HUKUM', 'Dokumentalis Hukum', FALSE, 6);

-- 5. org_units (parent selalu berada di baris sebelumnya)
INSERT INTO org_units (id, unit_type_id, parent_id, period_id, party_id, code, name, scope, duties, sort_order, is_active) VALUES
    ('e3f89fd3-41b8-5897-9225-b90723918b4d', '80fd0bac-7dc1-5a7b-9e86-cbac3ca1d75a', NULL, 'd0eefc99-e99f-5ba3-a818-6d5555d829f9', NULL, 'PIMPINAN', 'Pimpinan DPRD', NULL, 'memimpin sidang DPRD dan menyimpulkan hasil sidang; menyusun rencana kerja pimpinan dan mengadakan pembagian kerja; melakukan koordinasi dalam upaya mensinergikan pelaksanaan agenda dan materi kegiatan dari alat kelengkapan DPRD; menjadi juru bicara DPRD; melaksanakan dan memasyarakatkan keputusan DPRD; mewakili DPRD dalam berhubungan dengan lembaga atau instansi lainnya; mengadakan konsultasi dengan Walikota dan pimpinan lembaga lainnya; mewakili DPRD dan atau alat kelengkapan DPRD di pengadilan; melaksanakan putusan DPRD berkenaan dengan penetapan sanksi atau rehabilitasi anggota; menyusun rencana anggaran DPRD bersama sekretariat DPRD; menyampaikan laporan kinerja pimpinan DPRD dalam rapat paripurna; menyampaikan surat-surat masuk kepada DPRD yang memerlukan persetujuan DPRD, melalui Badan Musyawarah', 1, TRUE),
    ('aa8887cb-9e01-54be-993a-898e3a9d1722', 'a11b278e-e93f-584d-914c-04d207e1b1ca', NULL, 'd0eefc99-e99f-5ba3-a818-6d5555d829f9', '256a77ab-4e74-59ec-bd71-a779f956b9e7', 'FRAKSI-PDIP', 'Fraksi PDI Perjuangan', NULL, NULL, 2, TRUE),
    ('2cd99428-4093-5321-b8b5-927ff6e6b01f', 'a11b278e-e93f-584d-914c-04d207e1b1ca', NULL, 'd0eefc99-e99f-5ba3-a818-6d5555d829f9', '1f4dfb9d-ad84-51fd-b3ff-115b1e1ad778', 'FRAKSI-GOLKAR', 'Fraksi Golkar', NULL, NULL, 3, TRUE),
    ('d6af06fc-df5d-53c4-95d4-e72d0ca22899', 'a11b278e-e93f-584d-914c-04d207e1b1ca', NULL, 'd0eefc99-e99f-5ba3-a818-6d5555d829f9', 'e4cb34f8-0ca2-535f-a848-b4dad9013327', 'FRAKSI-PKB', 'Fraksi Kebangkitan Bangsa', NULL, NULL, 4, TRUE),
    ('10f416f5-79c0-5d38-818c-108b88827cdd', 'a11b278e-e93f-584d-914c-04d207e1b1ca', NULL, 'd0eefc99-e99f-5ba3-a818-6d5555d829f9', '7f14241f-1ee0-57bf-b547-3abc4e0f0c76', 'FRAKSI-PKS', 'Fraksi PKS', NULL, NULL, 5, TRUE),
    ('a3292c34-455d-530f-a82d-69ff15392116', 'a11b278e-e93f-584d-914c-04d207e1b1ca', NULL, 'd0eefc99-e99f-5ba3-a818-6d5555d829f9', 'd7e1f80b-0df6-5db5-aa4b-3d28abb0676f', 'FRAKSI-DEMOKRAT', 'Fraksi Demokrat', NULL, NULL, 6, TRUE),
    ('a14991f6-0f9d-5321-b89e-161b3b2ad384', 'a11b278e-e93f-584d-914c-04d207e1b1ca', NULL, 'd0eefc99-e99f-5ba3-a818-6d5555d829f9', '52f05101-4af3-52aa-9eeb-eeb4ca1d8adc', 'FRAKSI-GERINDRA', 'Fraksi Gerindra', NULL, NULL, 7, TRUE),
    ('83db6289-0119-52a3-9901-018ee4a2829d', '617dff00-2101-51d9-8c78-6b39ebc42f7d', 'e3f89fd3-41b8-5897-9225-b90723918b4d', 'd0eefc99-e99f-5ba3-a818-6d5555d829f9', NULL, 'KOMISI-A', 'Komisi A', 'Bidang Hukum, Pemerintah, Pertahanan dan Perencanaan meliputi hukum / per Undang – Undangan, Pemerintahan, Perencanaan, Ketertiban dan Keamanan, Kependudukan dan catatan sipil, ilmu pengetahuan, teknologi, penelitian dan statistik, imspektorat, perizinan, pertanahan, kepegawaian/aparatur, sosial politik, organisasi masyarakat', NULL, 8, TRUE),
    ('631fa93d-9f50-56c0-bd55-f21f970a0467', '617dff00-2101-51d9-8c78-6b39ebc42f7d', 'e3f89fd3-41b8-5897-9225-b90723918b4d', 'd0eefc99-e99f-5ba3-a818-6d5555d829f9', NULL, 'KOMISI-B', 'Komisi B', 'Bidang Perekonomian, Keuangan dan Kesehatan meliputi perindustrian, perdagangan, pertanian, perikanan, peternakan, perkebunan, kehutanan, pertambangan dan energi, ketahanan pangan logistik, keuangan daerah, perpajakan, retribusi, perbankan, perusahaan daerah, perusahaan patungan, dunia usaha, penanaman modal, dan kesehatan.', NULL, 9, TRUE),
    ('5c41b0a8-5b94-53ce-855a-72b794e47073', '617dff00-2101-51d9-8c78-6b39ebc42f7d', 'e3f89fd3-41b8-5897-9225-b90723918b4d', 'd0eefc99-e99f-5ba3-a818-6d5555d829f9', NULL, 'KOMISI-C', 'Komisi C', 'Bidang pendidikan, pembangunan dan kesejahteraan rakyat meliputi pendidikan, perpustakaan, arsip dan dokumentasi, pekerjaan umum, kebersihan, pertamanan dan tata kota, perumahan rakyat, kepemudaan dan olahraga, kebudayaan dan pariwisata, informasi, komunikasi, perhubungan, lingkungan hidup, ketenagakerjaan, transmigrasi dan sosial, agama, pemberdayaan masyarakat, peran wanita dan keluarga berencana.', NULL, 10, TRUE),
    ('0660bf08-8654-5d57-8b5b-292f920bb65d', 'ab89d114-ecf4-5207-b49d-239e83acccf9', 'e3f89fd3-41b8-5897-9225-b90723918b4d', 'd0eefc99-e99f-5ba3-a818-6d5555d829f9', NULL, 'BANGGAR', 'Badan Anggaran', NULL, 'Memberikan saran dan pendapat berupa pokok-pokok pikiran DPRD kepada Walikota dalam mempersiapkan Rancangan APBD paling lambat 5 (lima) bulan sebelum ditetapkannya APBD; Melakukan konsultasi kepada komisi terkait dalam rangka pembahasan rancangan KUA serta PPAS; Memberikan saran dan pendapat kepada Walikota dalam mempersiapkan raperda perubahan APBD dan raperda pertanggungjawaban pelaksanaan APBD; Melakukan penyempurnaan raperda APBD dan raperda pertanggungjawaban APBD berdasarkan hasil evaluasi Gubernur; Melakukan pembahasan bersama TAPD terhadap rancangan KUA serta PPAS; Memberikan saran kepada Pimpinan DPRD dalam menyusun anggaran belanja DPRD', 11, TRUE),
    ('487a646e-3202-5c4b-b2de-077f44dfb4b6', 'ab89d114-ecf4-5207-b49d-239e83acccf9', 'e3f89fd3-41b8-5897-9225-b90723918b4d', 'd0eefc99-e99f-5ba3-a818-6d5555d829f9', NULL, 'BAMUS', 'Badan Musyawarah', NULL, 'menetapkan agenda DPRD untuk 1 tahun sidang, 1 masa persidangan, atau sebagian dari suatu masa sidang, perkiraan waktu penyelesaian suatu masalah, dan jangka waktu penyelesaian raperda; memberikan pendapat kepada pimpinan DPRD dalam menentukan garis kebijakan yang menyangkut pelaksanaan tugas dan wewenang DPRD; meminta dan/atau memberikan kesempatan kepada alat kelengkapan DPRD yang lain untuk memberikan keterangan mengenai pelaksanaan tugas masing-masing', 12, TRUE),
    ('afb6c0f8-0c36-5702-a76c-e23b4c36554a', 'ab89d114-ecf4-5207-b49d-239e83acccf9', 'e3f89fd3-41b8-5897-9225-b90723918b4d', 'd0eefc99-e99f-5ba3-a818-6d5555d829f9', NULL, 'BAPEMPERDA', 'Badan Pembentukan Peraturan Daerah', NULL, 'Menyusun rancangan Program Pembentukan Peraturan Daerah (Propemperda) beserta urutan prioritas; koordinasi penyusunan Propemperda antara DPRD dan Pemerintah Daerah; menyiapkan raperda usul DPRD berdasarkan program prioritas; melakukan pengharmonisan, pembulatan, dan pemantapan konsepsi raperda yang diajukan anggota/komisi; memberikan pertimbangan terhadap raperda di luar prioritas/Propemperda; mengikuti perkembangan dan mengevaluasi pembahasan materi muatan raperda; memberikan masukan kepada Pimpinan DPRD atas raperda yang ditugaskan Badan Musyawarah; membuat laporan kinerja pada masa akhir keanggotaan DPRD', 13, TRUE),
    ('af8f415e-5379-51d4-b444-2207ce15f197', 'ab89d114-ecf4-5207-b49d-239e83acccf9', 'e3f89fd3-41b8-5897-9225-b90723918b4d', 'd0eefc99-e99f-5ba3-a818-6d5555d829f9', NULL, 'BK', 'Badan Kehormatan', NULL, 'Memantau dan mengevaluasi disiplin dan/atau kepatuhan terhadap moral, kode etik, dan/atau peraturan tata tertib DPRD; Meneliti dugaan pelanggaran anggota DPRD terhadap Tata Tertib dan/atau Kode Etik DPRD; Melakukan penyelidikan, verifikasi, dan klarifikasi atas pengaduan Pimpinan DPRD, Anggota DPRD, dan/atau masyarakat; Menyampaikan keputusan Badan Kehormatan atas hasil penyelidikan kepada rapat paripurna DPRD', 14, TRUE),
    ('90df424c-5b03-559a-99ba-03542b0d2a2d', 'b0259834-de2f-5648-be44-bd576db6d9a4', NULL, NULL, NULL, 'SETWAN', 'Sekretariat DPRD', NULL, NULL, 15, TRUE),
    ('a2e58db5-2405-574d-af14-5100a54082ac', '2af29419-1d46-589a-84db-c53456b4fdbc', '90df424c-5b03-559a-99ba-03542b0d2a2d', NULL, NULL, 'BAG-UMUM', 'Bagian Umum', NULL, NULL, 16, TRUE),
    ('83fa958e-80b1-52fb-b5c8-ae8b47c8fa29', '2af29419-1d46-589a-84db-c53456b4fdbc', '90df424c-5b03-559a-99ba-03542b0d2a2d', NULL, NULL, 'BAG-KEU', 'Bagian Keuangan', NULL, NULL, 17, TRUE),
    ('a797a171-aa88-5548-8904-af33f4833e7b', '2af29419-1d46-589a-84db-c53456b4fdbc', '90df424c-5b03-559a-99ba-03542b0d2a2d', NULL, NULL, 'BAG-PERSID', 'Bagian Persidangan dan Perundang-undangan', NULL, NULL, 18, TRUE),
    ('ecbf5643-7152-5d3b-bab3-279846565b9e', '5cd44512-1caa-55b3-a101-f1ec4484add0', 'a2e58db5-2405-574d-af14-5100a54082ac', NULL, NULL, 'SUBBAG-RT', 'Sub Bagian Rumah Tangga dan Perlengkapan', NULL, NULL, 19, TRUE),
    ('f7ac00dc-47be-5e3e-9b02-b2428aeaa7e0', '5cd44512-1caa-55b3-a101-f1ec4484add0', 'a2e58db5-2405-574d-af14-5100a54082ac', NULL, NULL, 'SUBBAG-TU', 'Sub Bagian Tata Usaha dan Kepegawaian', NULL, NULL, 20, TRUE);

-- 6. users (25 DEWAN + 27 SETWAN)
INSERT INTO users (id, person_type, employment_type, name, title_prefix, title_suffix, employee_number_nip, member_code, party_id, electoral_district_id, photo_url, email, phone_number, user_id, status) VALUES
    ('e97ae7b1-a1cb-5683-bcfe-ef2c9a4443a4', 'DEWAN', NULL, 'NARISQA', NULL, NULL, NULL, 'DPRD-AGT-0001', '256a77ab-4e74-59ec-bd71-a779f956b9e7', NULL, NULL, 'narisqa@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('60d173e0-bcfc-5d6f-b386-4c5410d54739', 'DEWAN', NULL, 'ATANG KUSTIONO', NULL, 'S.T.', NULL, 'DPRD-AGT-0002', '256a77ab-4e74-59ec-bd71-a779f956b9e7', NULL, NULL, 'atang.kustiono@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('e4bbb491-13e4-51a3-afb2-0a2f67757c99', 'DEWAN', NULL, 'SLAMET BAMBANG SULISTYO', NULL, 'S.Sos., M.M.', NULL, 'DPRD-AGT-0003', '256a77ab-4e74-59ec-bd71-a779f956b9e7', NULL, NULL, 'slamet.bambang.sulistyo@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('fb765645-9679-591a-8708-3ca92def50a8', 'DEWAN', NULL, 'EVIN SEPTA HARYANTO KAMIL', NULL, 'S.H.', NULL, 'DPRD-AGT-0004', '256a77ab-4e74-59ec-bd71-a779f956b9e7', NULL, NULL, 'evin.septa.haryanto.kamil@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('8b971b93-3988-5eb6-8e9d-613ae20ecfac', 'DEWAN', NULL, 'DELLA SETYA MAHARANI', NULL, NULL, NULL, 'DPRD-AGT-0005', '256a77ab-4e74-59ec-bd71-a779f956b9e7', NULL, NULL, 'della.setya.maharani@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('62c3e4ce-24ba-56e4-b78b-99d0fcc8f435', 'DEWAN', NULL, 'KEVIN MAHESA AMUWARDHANI', NULL, 'S.H.', NULL, 'DPRD-AGT-0006', '256a77ab-4e74-59ec-bd71-a779f956b9e7', NULL, NULL, 'kevin.mahesa.amuwardhani@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('4f96561d-b9d5-5322-9a58-0157608041fc', 'DEWAN', NULL, 'LEXIANO GAMMA PRADITYA', NULL, NULL, NULL, 'DPRD-AGT-0007', '256a77ab-4e74-59ec-bd71-a779f956b9e7', NULL, NULL, 'lexiano.gamma.praditya@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('12ded03a-9b67-5d84-b591-a3fdd125d363', 'DEWAN', NULL, 'TITIEK UTAMI', NULL, 'S.Sos., M.M.', NULL, 'DPRD-AGT-0008', '1f4dfb9d-ad84-51fd-b3ff-115b1e1ad778', NULL, NULL, 'titiek.utami@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('6518ff16-75a2-5dfc-a0e5-410ccadd49d3', 'DEWAN', NULL, 'VENTJE JEHEZKIEL ROGI', NULL, 'S.Pd.', NULL, 'DPRD-AGT-0009', '1f4dfb9d-ad84-51fd-b3ff-115b1e1ad778', NULL, NULL, 'ventje.jehezkiel.rogi@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('da00c3cc-89ee-540d-8691-7f3237f69ff7', 'DEWAN', NULL, 'TYAS ANGGRAENI BP', NULL, 'S.E., M.Sc.', NULL, 'DPRD-AGT-0010', '1f4dfb9d-ad84-51fd-b3ff-115b1e1ad778', NULL, NULL, 'tyas.anggraeni.bp@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('bb8c3910-3407-5633-aa53-37afd5eb1c24', 'DEWAN', NULL, 'MUH HARJADI', NULL, 'S.H.', NULL, 'DPRD-AGT-0011', '1f4dfb9d-ad84-51fd-b3ff-115b1e1ad778', NULL, NULL, 'muh.harjadi@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('3f15ea23-fc23-5337-8138-cae8d438b093', 'DEWAN', NULL, 'H.I.R JATMIKO', NULL, 'S.H., M.M.', NULL, 'DPRD-AGT-0012', '1f4dfb9d-ad84-51fd-b3ff-115b1e1ad778', NULL, NULL, 'h.i.r.jatmiko@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('2b77e080-208b-586a-80f7-8bb942db827d', 'DEWAN', NULL, 'YUNITA BUDI CHRISSANNI', 'Hj.', 'S.H., M.Kn.', NULL, 'DPRD-AGT-0013', 'e4cb34f8-0ca2-535f-a848-b4dad9013327', NULL, NULL, 'yunita.budi.chrissanni@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('84794322-ea08-5b3b-83cc-2594af19aeab', 'DEWAN', NULL, 'SALLAFUDIN', 'H.', 'S.E.', NULL, 'DPRD-AGT-0014', 'e4cb34f8-0ca2-535f-a848-b4dad9013327', NULL, NULL, 'sallafudin@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('8fbd82ea-f128-5377-a62c-1edf85adeb8c', 'DEWAN', NULL, 'FEBRIAN PRABOWO', NULL, NULL, NULL, 'DPRD-AGT-0015', 'e4cb34f8-0ca2-535f-a848-b4dad9013327', NULL, NULL, 'febrian.prabowo@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('088cc566-961f-5fa6-b59e-f9bb8108e151', 'DEWAN', NULL, 'IMAM INDRA SETYAWAN', NULL, 'S.E., M.M.', NULL, 'DPRD-AGT-0016', 'e4cb34f8-0ca2-535f-a848-b4dad9013327', NULL, NULL, 'imam.indra.setyawan@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('9b1a3dfc-dad0-5fd5-9b5d-6c0c5824534e', 'DEWAN', NULL, 'ACHMAD WIDODO', NULL, NULL, NULL, 'DPRD-AGT-0017', '7f14241f-1ee0-57bf-b547-3abc4e0f0c76', NULL, NULL, 'achmad.widodo@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('79bb0a08-593e-5897-acfc-fefb684440a5', 'DEWAN', NULL, 'IMAM MUSAECHONI', NULL, NULL, NULL, 'DPRD-AGT-0018', '7f14241f-1ee0-57bf-b547-3abc4e0f0c76', NULL, NULL, 'imam.musaechoni@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('e37cfc4b-b2c6-5430-aaac-28a76e803311', 'DEWAN', NULL, 'BUSTANUL ARIFIN', NULL, 'S.T.', NULL, 'DPRD-AGT-0019', '7f14241f-1ee0-57bf-b547-3abc4e0f0c76', NULL, NULL, 'bustanul.arifin@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('761d4271-0340-5ec5-b1b2-b4bb8013b0c1', 'DEWAN', NULL, 'Y. IG. MARJI NUGROHO', NULL, 'S.E.', NULL, 'DPRD-AGT-0020', 'd7e1f80b-0df6-5db5-aa4b-3d28abb0676f', NULL, NULL, 'y.ig.marji.nugroho@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('b2cc128b-469b-5f8b-b1e3-12e20268ab43', 'DEWAN', NULL, 'WALUYO', NULL, NULL, NULL, 'DPRD-AGT-0021', 'd7e1f80b-0df6-5db5-aa4b-3d28abb0676f', NULL, NULL, 'waluyo@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('98fe5597-2722-5871-9741-45b1a776adf3', 'DEWAN', NULL, 'DIAN MEGA ARYANI', NULL, 'S.E., M.M.', NULL, 'DPRD-AGT-0022', 'd7e1f80b-0df6-5db5-aa4b-3d28abb0676f', NULL, NULL, 'dian.mega.aryani@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('f10e9068-6482-543c-9e3d-6a3fa953b9af', 'DEWAN', NULL, 'NELLA KARNELA YUNISSARI', NULL, 'S.H., M.H.', NULL, 'DPRD-AGT-0023', '52f05101-4af3-52aa-9eeb-eeb4ca1d8adc', NULL, NULL, 'nella.karnela.yunissari@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('472622cf-96e7-50cf-8493-651530a4d762', 'DEWAN', NULL, 'YUSUF SUSILO', NULL, 'S.H.', NULL, 'DPRD-AGT-0024', '52f05101-4af3-52aa-9eeb-eeb4ca1d8adc', NULL, NULL, 'yusuf.susilo@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('ea8abbe3-8e8c-5e94-9dc2-a38842399899', 'DEWAN', NULL, 'ADI CHANDRA PAMUNGKAS', NULL, 'A.Md.', NULL, 'DPRD-AGT-0025', '52f05101-4af3-52aa-9eeb-eeb4ca1d8adc', NULL, NULL, 'adi.chandra.pamungkas@eparlemen.test', NULL, NULL, 'AKTIF'),
    ('d1c76f0f-6b72-5894-87d9-3ba58f5ced8e', 'SETWAN', 'PNS', 'INDAH DWIANTARI', NULL, 'S.Sos.', '197204291997032002', NULL, NULL, NULL, NULL, 'indah.dwiantari@setwan.test', NULL, NULL, 'AKTIF'),
    ('602f6ad6-ff07-5a7f-9910-0f2f4a57fd76', 'SETWAN', 'PNS', 'TRI WINARNO', NULL, 'S.E.', '197307221997031003', NULL, NULL, NULL, NULL, 'tri.winarno@setwan.test', NULL, NULL, 'AKTIF'),
    ('4449b193-2794-5b77-876b-50c4422a100b', 'SETWAN', 'PNS', 'RUMIYATI', NULL, 'S.Sos., M.M.', '196910291990032003', NULL, NULL, NULL, NULL, 'rumiyati@setwan.test', NULL, NULL, 'AKTIF'),
    ('99e115a1-69ad-5de7-bdac-ad48d2557ea7', 'SETWAN', 'PNS', 'CATUR ADI SUBAGIO', NULL, 'S.H.', '196805301990011001', NULL, NULL, NULL, NULL, 'catur.adi.subagio@setwan.test', NULL, NULL, 'AKTIF'),
    ('93581449-118d-545d-ac85-d4f6aa7f222a', 'SETWAN', 'PNS', 'HERY PURWOKO', NULL, 'S.E.', '197411302006041015', NULL, NULL, NULL, NULL, 'hery.purwoko@setwan.test', NULL, NULL, 'AKTIF'),
    ('a32c0406-a38b-5f28-8659-a76992bb24e9', 'SETWAN', 'PNS', 'AMIRUDDIN CHAIRUL HADI', NULL, 'S.H.', '198612102015021002', NULL, NULL, NULL, NULL, 'amiruddin.chairul.hadi@setwan.test', NULL, NULL, 'AKTIF'),
    ('a409dc19-33dc-5a8a-a803-c081faed19e9', 'SETWAN', 'PNS', 'DWI LESTARI', NULL, NULL, '196706051986032002', NULL, NULL, NULL, NULL, 'dwi.lestari@setwan.test', NULL, NULL, 'AKTIF'),
    ('2f5f5492-ad6f-5700-9e99-cfa95c501dfa', 'SETWAN', 'PNS', 'AGUS SANTOSO', NULL, NULL, '197508052006041015', NULL, NULL, NULL, NULL, 'agus.santoso@setwan.test', NULL, NULL, 'AKTIF'),
    ('0b2587b8-d3af-5bce-add8-8de24b5e3be3', 'SETWAN', 'PNS', 'KABUL LAKSONO', NULL, NULL, '197008222008011006', NULL, NULL, NULL, NULL, 'kabul.laksono@setwan.test', NULL, NULL, 'AKTIF'),
    ('baea31b2-4dcc-590d-bba1-9aab8c459207', 'SETWAN', 'PPPK', 'LUCKIE ADITYA RACHMA', NULL, 'S.E.', '199206072024211004', NULL, NULL, NULL, NULL, 'luckie.aditya.rachma@setwan.test', NULL, NULL, 'AKTIF'),
    ('8f08f8b0-c622-58ca-9c9e-a930e77e39e2', 'SETWAN', 'PPPK', 'CRISTIAN NISA YANSEN', NULL, 'S.Kom.', '198710092024211003', NULL, NULL, NULL, NULL, 'cristian.nisa.yansen@setwan.test', NULL, NULL, 'AKTIF'),
    ('d9603158-e3a9-5d7c-9ecf-d1142b3fe518', 'SETWAN', 'PNS', 'SUROTO', NULL, NULL, '197102092010011001', NULL, NULL, NULL, NULL, 'suroto@setwan.test', NULL, NULL, 'AKTIF'),
    ('53c60bc7-b2d2-52be-92b4-57398e7113cb', 'SETWAN', 'PPPK', 'ARIFIN RAJ SANDA', NULL, NULL, '199811122025211003', NULL, NULL, NULL, NULL, 'arifin.raj.sanda@setwan.test', NULL, NULL, 'AKTIF'),
    ('2ad2c280-8c6b-5212-bbec-30c7d0cd5097', 'SETWAN', 'PNS', 'SUPARJAN', NULL, NULL, '196707242007011013', NULL, NULL, NULL, NULL, 'suparjan@setwan.test', NULL, NULL, 'AKTIF'),
    ('5c2d0a30-3d33-5207-97b9-a174c3fa1167', 'SETWAN', 'PNS', 'MUH FAUZI', NULL, NULL, '198103202010011003', NULL, NULL, NULL, NULL, 'muh.fauzi@setwan.test', NULL, NULL, 'AKTIF'),
    ('68787b82-8fd4-5e60-909f-da4abf912aa7', 'SETWAN', 'PNS', 'TITIK SETIYANINGRUM', NULL, 'S.E.', '197204121994032005', NULL, NULL, NULL, NULL, 'titik.setiyaningrum@setwan.test', NULL, NULL, 'AKTIF'),
    ('b8900c49-a182-5ecc-bd77-853f7d145a14', 'SETWAN', 'PNS', 'SWASTI KUSUMA DEWI', NULL, 'S.E.', '197709012010012004', NULL, NULL, NULL, NULL, 'swasti.kusuma.dewi@setwan.test', NULL, NULL, 'AKTIF'),
    ('21e8e338-bcf0-5f2c-8f9a-cbc1cdc8ec67', 'SETWAN', 'PNS', 'TITIK SUSDARWATI', NULL, 'A.Md.', '197001082003122005', NULL, NULL, NULL, NULL, 'titik.susdarwati@setwan.test', NULL, NULL, 'AKTIF'),
    ('45dcd215-2dcc-51a4-a247-1637edcd9060', 'SETWAN', 'PPPK', 'MOH TOYIBAN', NULL, NULL, '198001202025211004', NULL, NULL, NULL, NULL, 'moh.toyiban@setwan.test', NULL, NULL, 'AKTIF'),
    ('80737795-b2b9-5a47-aa78-b09e11a1e982', 'SETWAN', 'PNS', 'PUTRO BAGUS PRASETIYO', NULL, 'S.H.', '198308102010011023', NULL, NULL, NULL, NULL, 'putro.bagus.prasetiyo@setwan.test', NULL, NULL, 'AKTIF'),
    ('4559d7ec-b0e1-58b7-b80e-5028486238fd', 'SETWAN', 'PPPK', 'RACHMITA BUNGA PURI D', NULL, 'S.E.', '198902142024212006', NULL, NULL, NULL, NULL, 'rachmita.bunga.puri.d@setwan.test', NULL, NULL, 'AKTIF'),
    ('b7b4a9c9-91f3-5d94-b015-c83fd962eb20', 'SETWAN', 'PPPK', 'FAUZZIAH ANIS NUR S', NULL, 'S.E.', '199310162024212003', NULL, NULL, NULL, NULL, 'fauzziah.anis.nur.s@setwan.test', NULL, NULL, 'AKTIF'),
    ('5ff5363e-3e49-531d-8df8-ee747399b8f6', 'SETWAN', 'PPPK', 'UUS SOLIKHUDIN', NULL, 'S.H.', '198805182025211011', NULL, NULL, NULL, NULL, 'uus.solikhudin@setwan.test', NULL, NULL, 'AKTIF'),
    ('462f3142-3375-5741-9401-5714471b4151', 'SETWAN', 'PPPK', 'HASMAN KURNIYAWAN', NULL, 'S.Pd.', '198812102025211012', NULL, NULL, NULL, NULL, 'hasman.kurniyawan@setwan.test', NULL, NULL, 'AKTIF'),
    ('1bd19754-99a2-5f1e-aa65-df3fab5b07e7', 'SETWAN', 'PNS', 'PANCA ARIANA', NULL, 'S.H.', '197902222010012001', NULL, NULL, NULL, NULL, 'panca.ariana@setwan.test', NULL, NULL, 'AKTIF'),
    ('c76d413e-08af-5ce5-b79b-bf2f214f0bf5', 'SETWAN', 'PPPK', 'PRIHATINI', NULL, 'A.Md.A.Pkt.', '198911022024212004', NULL, NULL, NULL, NULL, 'prihatini@setwan.test', NULL, NULL, 'AKTIF'),
    ('c85438b2-ece7-5104-8bff-1cf1f428551f', 'SETWAN', 'PNS', 'PRAWERTI PRAJNAJATI', NULL, 'S.H., M.H.', NULL, NULL, NULL, NULL, NULL, 'prawerti.prajnajati@setwan.test', NULL, NULL, 'AKTIF');

-- 7. assignments (86 Dewan + 37 Setwan, 11 formasi kosong)
INSERT INTO assignments (id, org_unit_id, position_id, person_id, start_date, end_date, decree_number, notes, sort_order) VALUES
    ('8d45b766-c734-5fd7-a405-a1e7b64947c3', 'e3f89fd3-41b8-5897-9225-b90723918b4d', '0d21b5b9-30a7-5345-9ffe-7987d0e7a947', 'fb765645-9679-591a-8708-3ca92def50a8', '2024-08-01', NULL, NULL, NULL, 1),
    ('1560d441-1823-54ed-88ff-44d706203c86', 'e3f89fd3-41b8-5897-9225-b90723918b4d', '8941fe45-9288-50da-874c-c149b0a7c350', 'e37cfc4b-b2c6-5430-aaac-28a76e803311', '2024-08-01', NULL, NULL, NULL, 2),
    ('a02b0161-f7c9-550a-a070-c4549d8f2b25', 'e3f89fd3-41b8-5897-9225-b90723918b4d', '8941fe45-9288-50da-874c-c149b0a7c350', '088cc566-961f-5fa6-b59e-f9bb8108e151', '2024-08-01', NULL, NULL, NULL, 3),
    ('812a00d4-9a1f-522f-b9c3-963bc8e21314', 'aa8887cb-9e01-54be-993a-898e3a9d1722', '0d21b5b9-30a7-5345-9ffe-7987d0e7a947', 'e97ae7b1-a1cb-5683-bcfe-ef2c9a4443a4', '2024-08-01', NULL, NULL, NULL, 4),
    ('bf75ebbc-70db-5e86-a2b2-40e85183f939', 'aa8887cb-9e01-54be-993a-898e3a9d1722', '8941fe45-9288-50da-874c-c149b0a7c350', '60d173e0-bcfc-5d6f-b386-4c5410d54739', '2024-08-01', NULL, NULL, NULL, 5),
    ('b3c3e018-21aa-53c2-b293-2384d91eb1d9', 'aa8887cb-9e01-54be-993a-898e3a9d1722', '306dc94b-c8a3-5274-b638-09ecfc192e86', 'e4bbb491-13e4-51a3-afb2-0a2f67757c99', '2024-08-01', NULL, NULL, NULL, 6),
    ('4966e4c1-7168-50a3-8297-12bad1c00b10', 'aa8887cb-9e01-54be-993a-898e3a9d1722', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '8b971b93-3988-5eb6-8e9d-613ae20ecfac', '2024-08-01', NULL, NULL, NULL, 7),
    ('d8c119df-0d10-586c-b1db-6092f28f3024', 'aa8887cb-9e01-54be-993a-898e3a9d1722', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', 'fb765645-9679-591a-8708-3ca92def50a8', '2024-08-01', NULL, NULL, NULL, 8),
    ('0b17b9d5-4b5c-5c2c-b5dc-6b020640f68a', 'aa8887cb-9e01-54be-993a-898e3a9d1722', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '62c3e4ce-24ba-56e4-b78b-99d0fcc8f435', '2024-08-01', NULL, NULL, NULL, 9),
    ('689725f8-e3e3-5efd-946a-a2798e4c4cf1', 'aa8887cb-9e01-54be-993a-898e3a9d1722', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '4f96561d-b9d5-5322-9a58-0157608041fc', '2024-08-01', NULL, NULL, NULL, 10),
    ('bd533f2c-333f-5533-9897-300724a39fb7', '2cd99428-4093-5321-b8b5-927ff6e6b01f', '0d21b5b9-30a7-5345-9ffe-7987d0e7a947', '12ded03a-9b67-5d84-b591-a3fdd125d363', '2024-08-01', NULL, NULL, NULL, 11),
    ('e3a8939d-ac22-5cd9-a5ad-16b9df9bb685', '2cd99428-4093-5321-b8b5-927ff6e6b01f', '8941fe45-9288-50da-874c-c149b0a7c350', '6518ff16-75a2-5dfc-a0e5-410ccadd49d3', '2024-08-01', NULL, NULL, NULL, 12),
    ('bb4e1f9c-ed97-5df3-a3da-3ceda21e99ce', '2cd99428-4093-5321-b8b5-927ff6e6b01f', '306dc94b-c8a3-5274-b638-09ecfc192e86', 'da00c3cc-89ee-540d-8691-7f3237f69ff7', '2024-08-01', NULL, NULL, NULL, 13),
    ('9a294f92-5bac-5f42-9c45-3db05e3bc529', '2cd99428-4093-5321-b8b5-927ff6e6b01f', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '3f15ea23-fc23-5337-8138-cae8d438b093', '2024-08-01', NULL, NULL, NULL, 14),
    ('d9bdcc02-b10b-594e-a5f3-694c9aff3bdd', '2cd99428-4093-5321-b8b5-927ff6e6b01f', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', 'bb8c3910-3407-5633-aa53-37afd5eb1c24', '2024-08-01', NULL, NULL, NULL, 15),
    ('155f2ae7-8930-5746-8608-094c26ea823b', 'd6af06fc-df5d-53c4-95d4-e72d0ca22899', '0d21b5b9-30a7-5345-9ffe-7987d0e7a947', '2b77e080-208b-586a-80f7-8bb942db827d', '2024-08-01', NULL, NULL, NULL, 16),
    ('02427bc2-0632-55e1-808e-9adcb5123985', 'd6af06fc-df5d-53c4-95d4-e72d0ca22899', '8941fe45-9288-50da-874c-c149b0a7c350', '84794322-ea08-5b3b-83cc-2594af19aeab', '2024-08-01', NULL, NULL, NULL, 17),
    ('a5cb27a6-e21a-5ff4-ada7-c50dcd3e39f3', 'd6af06fc-df5d-53c4-95d4-e72d0ca22899', '306dc94b-c8a3-5274-b638-09ecfc192e86', '8fbd82ea-f128-5377-a62c-1edf85adeb8c', '2024-08-01', NULL, NULL, NULL, 18),
    ('94ca829c-9419-588e-98a8-14f20d0c7622', 'd6af06fc-df5d-53c4-95d4-e72d0ca22899', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '088cc566-961f-5fa6-b59e-f9bb8108e151', '2024-08-01', NULL, NULL, NULL, 19),
    ('7ea72022-5f49-5e3c-9112-cbda1a269258', '10f416f5-79c0-5d38-818c-108b88827cdd', '0d21b5b9-30a7-5345-9ffe-7987d0e7a947', '9b1a3dfc-dad0-5fd5-9b5d-6c0c5824534e', '2024-08-01', NULL, NULL, NULL, 20),
    ('bd7593ce-ea2a-5288-8902-2205baed6a24', '10f416f5-79c0-5d38-818c-108b88827cdd', '306dc94b-c8a3-5274-b638-09ecfc192e86', '79bb0a08-593e-5897-acfc-fefb684440a5', '2024-08-01', NULL, NULL, NULL, 21),
    ('f0670b87-f173-5a63-9020-61833853ab64', '10f416f5-79c0-5d38-818c-108b88827cdd', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', 'e37cfc4b-b2c6-5430-aaac-28a76e803311', '2024-08-01', NULL, NULL, NULL, 22),
    ('d6bc0270-34fb-5faf-88ff-fa782682ca05', 'a3292c34-455d-530f-a82d-69ff15392116', '0d21b5b9-30a7-5345-9ffe-7987d0e7a947', '761d4271-0340-5ec5-b1b2-b4bb8013b0c1', '2024-08-01', NULL, NULL, NULL, 23),
    ('0554a783-c968-586d-865d-0c58ab6eb499', 'a3292c34-455d-530f-a82d-69ff15392116', '306dc94b-c8a3-5274-b638-09ecfc192e86', 'b2cc128b-469b-5f8b-b1e3-12e20268ab43', '2024-08-01', NULL, NULL, NULL, 24),
    ('617c91fa-9bf7-5987-995c-7b07da531b4d', 'a3292c34-455d-530f-a82d-69ff15392116', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '98fe5597-2722-5871-9741-45b1a776adf3', '2024-08-01', NULL, NULL, NULL, 25),
    ('2388f3ad-8afb-5bf9-9509-06f395bcd2c9', 'a14991f6-0f9d-5321-b89e-161b3b2ad384', '0d21b5b9-30a7-5345-9ffe-7987d0e7a947', 'f10e9068-6482-543c-9e3d-6a3fa953b9af', '2024-08-01', NULL, NULL, NULL, 26),
    ('16228fe0-d74c-51e2-99c4-624e7c93ddd2', 'a14991f6-0f9d-5321-b89e-161b3b2ad384', '306dc94b-c8a3-5274-b638-09ecfc192e86', '472622cf-96e7-50cf-8493-651530a4d762', '2024-08-01', NULL, NULL, NULL, 27),
    ('2f37452d-eb3f-5d84-9be3-fbd50e459234', 'a14991f6-0f9d-5321-b89e-161b3b2ad384', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', 'ea8abbe3-8e8c-5e94-9dc2-a38842399899', '2024-08-01', NULL, NULL, NULL, 28),
    ('05851614-b735-5bca-abfc-96614e05982f', '83db6289-0119-52a3-9901-018ee4a2829d', '0d21b5b9-30a7-5345-9ffe-7987d0e7a947', '12ded03a-9b67-5d84-b591-a3fdd125d363', '2024-10-01', NULL, NULL, NULL, 29),
    ('7747bc9a-33bd-54ee-9a99-0d174477495f', '83db6289-0119-52a3-9901-018ee4a2829d', '8941fe45-9288-50da-874c-c149b0a7c350', 'ea8abbe3-8e8c-5e94-9dc2-a38842399899', '2024-10-01', NULL, NULL, NULL, 30),
    ('707e6de8-003c-5baf-8748-b08e735a0131', '83db6289-0119-52a3-9901-018ee4a2829d', '306dc94b-c8a3-5274-b638-09ecfc192e86', '60d173e0-bcfc-5d6f-b386-4c5410d54739', '2024-10-01', NULL, NULL, NULL, 31),
    ('fd94923b-8df0-57d3-ba16-f8097aaa5f31', '83db6289-0119-52a3-9901-018ee4a2829d', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '98fe5597-2722-5871-9741-45b1a776adf3', '2024-10-01', NULL, NULL, NULL, 32),
    ('89bfb84f-9325-52c0-b65d-af0b646ce2f8', '83db6289-0119-52a3-9901-018ee4a2829d', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '8fbd82ea-f128-5377-a62c-1edf85adeb8c', '2024-10-01', NULL, NULL, NULL, 33),
    ('26eb7675-f46b-5de0-9698-fc136f6584f5', '83db6289-0119-52a3-9901-018ee4a2829d', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '3f15ea23-fc23-5337-8138-cae8d438b093', '2024-10-01', NULL, NULL, NULL, 34),
    ('38fb2b71-75b7-58df-9819-a9358c195ce7', '83db6289-0119-52a3-9901-018ee4a2829d', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', 'e4bbb491-13e4-51a3-afb2-0a2f67757c99', '2024-10-01', NULL, NULL, NULL, 35),
    ('e261d8fb-dd6f-50b3-a262-1c9288a94b61', '631fa93d-9f50-56c0-bd55-f21f970a0467', '0d21b5b9-30a7-5345-9ffe-7987d0e7a947', '62c3e4ce-24ba-56e4-b78b-99d0fcc8f435', '2024-10-01', NULL, NULL, NULL, 36),
    ('8e15e237-7197-54ac-86e7-b48e33d709bd', '631fa93d-9f50-56c0-bd55-f21f970a0467', '8941fe45-9288-50da-874c-c149b0a7c350', 'bb8c3910-3407-5633-aa53-37afd5eb1c24', '2024-10-01', NULL, NULL, NULL, 37),
    ('18d35dd2-d9e0-5d9b-8d33-405676e60071', '631fa93d-9f50-56c0-bd55-f21f970a0467', '306dc94b-c8a3-5274-b638-09ecfc192e86', 'b2cc128b-469b-5f8b-b1e3-12e20268ab43', '2024-10-01', NULL, NULL, NULL, 38),
    ('9fc0071c-bc85-5084-83b9-7f1119765574', '631fa93d-9f50-56c0-bd55-f21f970a0467', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '9b1a3dfc-dad0-5fd5-9b5d-6c0c5824534e', '2024-10-01', NULL, NULL, NULL, 39),
    ('ac7951d9-7a75-50f6-a972-6fd3a8b98f8c', '631fa93d-9f50-56c0-bd55-f21f970a0467', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '8b971b93-3988-5eb6-8e9d-613ae20ecfac', '2024-10-01', NULL, NULL, NULL, 40),
    ('a0d7c3c8-717d-521b-b0b9-e65dd8e3b406', '631fa93d-9f50-56c0-bd55-f21f970a0467', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '2b77e080-208b-586a-80f7-8bb942db827d', '2024-10-01', NULL, NULL, NULL, 41),
    ('fa89a8c2-7f1d-56b9-bc9a-a2cfe6b2e5bc', '631fa93d-9f50-56c0-bd55-f21f970a0467', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '472622cf-96e7-50cf-8493-651530a4d762', '2024-10-01', NULL, NULL, NULL, 42),
    ('f9e3372e-86f5-5dfc-a20b-72607feadc58', '5c41b0a8-5b94-53ce-855a-72b794e47073', '0d21b5b9-30a7-5345-9ffe-7987d0e7a947', 'e97ae7b1-a1cb-5683-bcfe-ef2c9a4443a4', '2024-10-01', NULL, NULL, NULL, 43),
    ('6e80f869-73b1-5348-96d6-f449b7885ee7', '5c41b0a8-5b94-53ce-855a-72b794e47073', '8941fe45-9288-50da-874c-c149b0a7c350', 'f10e9068-6482-543c-9e3d-6a3fa953b9af', '2024-10-01', NULL, NULL, NULL, 44),
    ('6e2c2d26-d135-5ac4-adc9-f8c8acb27562', '5c41b0a8-5b94-53ce-855a-72b794e47073', '306dc94b-c8a3-5274-b638-09ecfc192e86', 'da00c3cc-89ee-540d-8691-7f3237f69ff7', '2024-10-01', NULL, NULL, NULL, 45),
    ('53a0bd51-ab5c-5bc9-b075-230117bc86b7', '5c41b0a8-5b94-53ce-855a-72b794e47073', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '79bb0a08-593e-5897-acfc-fefb684440a5', '2024-10-01', NULL, NULL, NULL, 46),
    ('a05da327-fcca-523c-b861-ee4f675dae3a', '5c41b0a8-5b94-53ce-855a-72b794e47073', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '4f96561d-b9d5-5322-9a58-0157608041fc', '2024-10-01', NULL, NULL, NULL, 47),
    ('8aad5e4f-62c4-526a-9fd4-9235ad0ac7f4', '5c41b0a8-5b94-53ce-855a-72b794e47073', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '84794322-ea08-5b3b-83cc-2594af19aeab', '2024-10-01', NULL, NULL, NULL, 48),
    ('e9e800bd-5acb-5239-92bc-6648fc764ee4', '5c41b0a8-5b94-53ce-855a-72b794e47073', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '6518ff16-75a2-5dfc-a0e5-410ccadd49d3', '2024-10-01', NULL, NULL, NULL, 49),
    ('2775fcb5-c1b1-51b8-8b47-33d77ad00234', '5c41b0a8-5b94-53ce-855a-72b794e47073', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '761d4271-0340-5ec5-b1b2-b4bb8013b0c1', '2024-10-01', NULL, NULL, NULL, 50),
    ('e8f46f18-be95-5126-a0e7-5c368289b6f3', '0660bf08-8654-5d57-8b5b-292f920bb65d', '0d21b5b9-30a7-5345-9ffe-7987d0e7a947', 'fb765645-9679-591a-8708-3ca92def50a8', '2024-10-01', NULL, NULL, NULL, 51),
    ('96a15af1-432a-5f4f-97d5-26460494c816', '0660bf08-8654-5d57-8b5b-292f920bb65d', '8941fe45-9288-50da-874c-c149b0a7c350', 'e37cfc4b-b2c6-5430-aaac-28a76e803311', '2024-10-01', NULL, NULL, NULL, 52),
    ('54e4036c-e946-5ca2-b073-d584c2a1e8ab', '0660bf08-8654-5d57-8b5b-292f920bb65d', '8941fe45-9288-50da-874c-c149b0a7c350', '088cc566-961f-5fa6-b59e-f9bb8108e151', '2024-10-01', NULL, NULL, NULL, 53),
    ('6b63f99c-06a5-5999-81f0-dcea46160937', '0660bf08-8654-5d57-8b5b-292f920bb65d', '085e0dc6-ce1a-5682-b4af-81144a629550', 'c85438b2-ece7-5104-8bff-1cf1f428551f', '2024-10-01', NULL, NULL, NULL, 54),
    ('3dfc898c-805e-5354-b06e-a7158b7fb72e', '0660bf08-8654-5d57-8b5b-292f920bb65d', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '98fe5597-2722-5871-9741-45b1a776adf3', '2024-10-01', NULL, NULL, NULL, 55),
    ('b4d9b76d-1756-5b94-8e03-924203132f7b', '0660bf08-8654-5d57-8b5b-292f920bb65d', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '3f15ea23-fc23-5337-8138-cae8d438b093', '2024-10-01', NULL, NULL, NULL, 56),
    ('dbd43bf5-5d71-54dd-a140-045f61aef767', '0660bf08-8654-5d57-8b5b-292f920bb65d', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '79bb0a08-593e-5897-acfc-fefb684440a5', '2024-10-01', NULL, NULL, NULL, 57),
    ('5c5eab33-2feb-5c1e-8c83-0c3e2725d167', '0660bf08-8654-5d57-8b5b-292f920bb65d', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '62c3e4ce-24ba-56e4-b78b-99d0fcc8f435', '2024-10-01', NULL, NULL, NULL, 58),
    ('869da151-39b7-5618-ae5c-b0e042645e72', '0660bf08-8654-5d57-8b5b-292f920bb65d', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', 'e97ae7b1-a1cb-5683-bcfe-ef2c9a4443a4', '2024-10-01', NULL, NULL, NULL, 59),
    ('f44895d9-0120-5303-99b7-75ab52a1995e', '0660bf08-8654-5d57-8b5b-292f920bb65d', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', 'f10e9068-6482-543c-9e3d-6a3fa953b9af', '2024-10-01', NULL, NULL, NULL, 60),
    ('1301a397-aff6-5b5b-b3d8-43999da1b682', '0660bf08-8654-5d57-8b5b-292f920bb65d', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '12ded03a-9b67-5d84-b591-a3fdd125d363', '2024-10-01', NULL, NULL, NULL, 61),
    ('263a869c-d000-5e8e-8a75-4fef145c7082', '0660bf08-8654-5d57-8b5b-292f920bb65d', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '2b77e080-208b-586a-80f7-8bb942db827d', '2024-10-01', NULL, NULL, NULL, 62),
    ('13fe3e59-8991-57b4-bb90-2f8342d25009', '487a646e-3202-5c4b-b2de-077f44dfb4b6', '0d21b5b9-30a7-5345-9ffe-7987d0e7a947', 'fb765645-9679-591a-8708-3ca92def50a8', '2024-10-01', NULL, NULL, NULL, 63),
    ('df7d02dc-a20b-578e-a7b5-de5336845c25', '487a646e-3202-5c4b-b2de-077f44dfb4b6', '8941fe45-9288-50da-874c-c149b0a7c350', 'e37cfc4b-b2c6-5430-aaac-28a76e803311', '2024-10-01', NULL, NULL, NULL, 64),
    ('24218bda-5dec-50a9-872d-9051cda2da78', '487a646e-3202-5c4b-b2de-077f44dfb4b6', '8941fe45-9288-50da-874c-c149b0a7c350', '088cc566-961f-5fa6-b59e-f9bb8108e151', '2024-10-01', NULL, NULL, NULL, 65),
    ('ab21aa08-83fd-5200-a74f-64d1a8a7fcec', '487a646e-3202-5c4b-b2de-077f44dfb4b6', '085e0dc6-ce1a-5682-b4af-81144a629550', 'c85438b2-ece7-5104-8bff-1cf1f428551f', '2024-10-01', NULL, NULL, NULL, 66),
    ('227873a0-ddf8-5e36-b538-6c7537e37550', '487a646e-3202-5c4b-b2de-077f44dfb4b6', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '9b1a3dfc-dad0-5fd5-9b5d-6c0c5824534e', '2024-10-01', NULL, NULL, NULL, 67),
    ('9d2db72d-2c80-5d04-af30-7dc5b0f9ec57', '487a646e-3202-5c4b-b2de-077f44dfb4b6', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', 'ea8abbe3-8e8c-5e94-9dc2-a38842399899', '2024-10-01', NULL, NULL, NULL, 68),
    ('67babc92-5836-5ff9-aefc-721bf28a8820', '487a646e-3202-5c4b-b2de-077f44dfb4b6', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '60d173e0-bcfc-5d6f-b386-4c5410d54739', '2024-10-01', NULL, NULL, NULL, 69),
    ('75dda78f-1761-5558-854f-e61b033b8a50', '487a646e-3202-5c4b-b2de-077f44dfb4b6', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '4f96561d-b9d5-5322-9a58-0157608041fc', '2024-10-01', NULL, NULL, NULL, 70),
    ('2f9de8ee-08a5-52e4-8fd8-5e1ebc6d8ac6', '487a646e-3202-5c4b-b2de-077f44dfb4b6', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '12ded03a-9b67-5d84-b591-a3fdd125d363', '2024-10-01', NULL, NULL, NULL, 71),
    ('6c0ac045-32f5-5a57-afb6-e3ea67fa7b96', '487a646e-3202-5c4b-b2de-077f44dfb4b6', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '6518ff16-75a2-5dfc-a0e5-410ccadd49d3', '2024-10-01', NULL, NULL, NULL, 72),
    ('d09bd03b-62c1-52aa-bad6-cb542e6a9ee7', '487a646e-3202-5c4b-b2de-077f44dfb4b6', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', 'b2cc128b-469b-5f8b-b1e3-12e20268ab43', '2024-10-01', NULL, NULL, NULL, 73),
    ('47fde330-6a99-50cd-85cf-af261b4a5748', '487a646e-3202-5c4b-b2de-077f44dfb4b6', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '2b77e080-208b-586a-80f7-8bb942db827d', '2024-10-01', NULL, NULL, NULL, 74),
    ('a2bf9e9f-31fe-55fe-8c85-b2e5ac7b4c0f', 'afb6c0f8-0c36-5702-a76c-e23b4c36554a', '0d21b5b9-30a7-5345-9ffe-7987d0e7a947', 'e4bbb491-13e4-51a3-afb2-0a2f67757c99', '2024-10-01', NULL, NULL, NULL, 75),
    ('a73af90f-b7ac-5a95-84df-3ff3a69bc6fe', 'afb6c0f8-0c36-5702-a76c-e23b4c36554a', '8941fe45-9288-50da-874c-c149b0a7c350', '472622cf-96e7-50cf-8493-651530a4d762', '2024-10-01', NULL, NULL, NULL, 76),
    ('eb6f59b2-c242-5f0a-b661-84bd13e28839', 'afb6c0f8-0c36-5702-a76c-e23b4c36554a', '085e0dc6-ce1a-5682-b4af-81144a629550', 'c85438b2-ece7-5104-8bff-1cf1f428551f', '2024-10-01', NULL, NULL, NULL, 77),
    ('7d69d8c4-3a7d-571b-b85b-02f253ebc17d', 'afb6c0f8-0c36-5702-a76c-e23b4c36554a', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '9b1a3dfc-dad0-5fd5-9b5d-6c0c5824534e', '2024-10-01', NULL, NULL, NULL, 78),
    ('38574d24-eaab-5fb1-838c-3104af0037eb', 'afb6c0f8-0c36-5702-a76c-e23b4c36554a', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '8b971b93-3988-5eb6-8e9d-613ae20ecfac', '2024-10-01', NULL, NULL, NULL, 79),
    ('7753b030-e7e3-51e4-b8c7-5f32b7f2b791', 'afb6c0f8-0c36-5702-a76c-e23b4c36554a', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', 'bb8c3910-3407-5633-aa53-37afd5eb1c24', '2024-10-01', NULL, NULL, NULL, 80),
    ('1a45d73e-d37e-5c86-b91d-a21a2ae0a9be', 'afb6c0f8-0c36-5702-a76c-e23b4c36554a', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '84794322-ea08-5b3b-83cc-2594af19aeab', '2024-10-01', NULL, NULL, NULL, 81),
    ('c7ac51fa-d735-5eaa-9d78-339c9535388a', 'afb6c0f8-0c36-5702-a76c-e23b4c36554a', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', 'da00c3cc-89ee-540d-8691-7f3237f69ff7', '2024-10-01', NULL, NULL, NULL, 82),
    ('bf98d215-4878-549d-b83c-ccfcc491fe9c', 'afb6c0f8-0c36-5702-a76c-e23b4c36554a', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '761d4271-0340-5ec5-b1b2-b4bb8013b0c1', '2024-10-01', NULL, NULL, NULL, 83),
    ('f842af50-4148-57c7-9bfb-8c94c57ff24c', 'af8f415e-5379-51d4-b444-2207ce15f197', '0d21b5b9-30a7-5345-9ffe-7987d0e7a947', '6518ff16-75a2-5dfc-a0e5-410ccadd49d3', '2024-10-01', NULL, NULL, NULL, 84),
    ('64230565-6fbb-5761-bf1e-6af1f2f54c8b', 'af8f415e-5379-51d4-b444-2207ce15f197', '8941fe45-9288-50da-874c-c149b0a7c350', '4f96561d-b9d5-5322-9a58-0157608041fc', '2024-10-01', NULL, NULL, NULL, 85),
    ('edefe1ab-c331-5cf3-9e8f-ab38c89bca0c', 'af8f415e-5379-51d4-b444-2207ce15f197', 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', '8fbd82ea-f128-5377-a62c-1edf85adeb8c', '2024-10-01', NULL, NULL, NULL, 86),
    ('b32890fd-fdc8-536e-b3d5-d9e1f504feec', '90df424c-5b03-559a-99ba-03542b0d2a2d', '78588557-c2e9-5b41-883f-ee7c98d24bef', 'd1c76f0f-6b72-5894-87d9-3ba58f5ced8e', '2025-01-02', NULL, NULL, NULL, 87),
    ('7b825753-ea1e-508c-8324-0790dcd738ae', 'a2e58db5-2405-574d-af14-5100a54082ac', '370fc088-3bec-5d9a-8da4-94f944e5c8de', '602f6ad6-ff07-5a7f-9910-0f2f4a57fd76', '2025-01-02', NULL, NULL, NULL, 88),
    ('397fec87-a750-5a76-a9d9-ff6bd0402242', '83fa958e-80b1-52fb-b5c8-ae8b47c8fa29', '370fc088-3bec-5d9a-8da4-94f944e5c8de', '4449b193-2794-5b77-876b-50c4422a100b', '2025-01-02', NULL, NULL, NULL, 89),
    ('f0f323d4-7224-573a-b1a4-50d5b900b062', 'a797a171-aa88-5548-8904-af33f4833e7b', '370fc088-3bec-5d9a-8da4-94f944e5c8de', '99e115a1-69ad-5de7-bdac-ad48d2557ea7', '2025-01-02', NULL, NULL, NULL, 90),
    ('7dc0a107-3461-5e29-b339-a72bb778ee4d', 'ecbf5643-7152-5d3b-bab3-279846565b9e', '24865043-380a-5929-aa29-b2ae9e09cbd3', '93581449-118d-545d-ac85-d4f6aa7f222a', '2025-01-02', NULL, NULL, NULL, 91),
    ('b240485a-186c-523f-a47a-07e772075f22', 'f7ac00dc-47be-5e3e-9b02-b2428aeaa7e0', '24865043-380a-5929-aa29-b2ae9e09cbd3', 'a32c0406-a38b-5f28-8659-a76992bb24e9', '2025-01-02', NULL, NULL, NULL, 92),
    ('0b07b6d2-c7c8-5c1a-8198-1437c3147528', 'ecbf5643-7152-5d3b-bab3-279846565b9e', 'ce85c387-8129-5dce-9c91-7e9fe3fa6498', NULL, NULL, NULL, NULL, NULL, 93),
    ('134bac97-a2a8-5a61-95f1-49f38bdc4afe', 'ecbf5643-7152-5d3b-bab3-279846565b9e', '11e3ada7-c900-55c4-819b-b51e5928dd1d', NULL, NULL, NULL, NULL, NULL, 94),
    ('97c5e361-05f5-52a2-9cfe-46852f7e8439', 'ecbf5643-7152-5d3b-bab3-279846565b9e', 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', 'a409dc19-33dc-5a8a-a803-c081faed19e9', '2025-01-02', NULL, NULL, NULL, 95),
    ('183bc47a-aac3-577f-b4d6-d797fc40b165', 'ecbf5643-7152-5d3b-bab3-279846565b9e', 'dc2e3c13-583c-50e6-aa05-5be865014014', '2f5f5492-ad6f-5700-9e99-cfa95c501dfa', '2025-01-02', NULL, NULL, NULL, 96),
    ('65e6ea67-f350-542c-ac8b-731d5a6d10a7', 'ecbf5643-7152-5d3b-bab3-279846565b9e', 'dc2e3c13-583c-50e6-aa05-5be865014014', '0b2587b8-d3af-5bce-add8-8de24b5e3be3', '2025-01-02', NULL, NULL, NULL, 97),
    ('5a7964bd-4c07-55e7-831e-b6df72944cbd', 'f7ac00dc-47be-5e3e-9b02-b2428aeaa7e0', 'd00a235a-a693-5786-9c70-928c732447af', 'baea31b2-4dcc-590d-bba1-9aab8c459207', '2025-01-02', NULL, NULL, NULL, 98),
    ('925dfae8-52b4-5673-819d-9961fa988044', 'f7ac00dc-47be-5e3e-9b02-b2428aeaa7e0', '04dce491-6172-5e2b-af9f-b217b7d43395', '8f08f8b0-c622-58ca-9c9e-a930e77e39e2', '2025-01-02', NULL, NULL, NULL, 99),
    ('a459a5e0-63cc-58cf-bfb5-6af21322e27b', 'f7ac00dc-47be-5e3e-9b02-b2428aeaa7e0', 'ce85c387-8129-5dce-9c91-7e9fe3fa6498', NULL, NULL, NULL, NULL, NULL, 100),
    ('c2ccd475-065b-5194-b53c-1f5fd7053d01', 'f7ac00dc-47be-5e3e-9b02-b2428aeaa7e0', '7cf2507b-35e2-5b06-a20a-e7e98e73a45f', NULL, NULL, NULL, NULL, NULL, 101),
    ('d7cd6620-f0a8-517b-98dc-913a29228add', 'f7ac00dc-47be-5e3e-9b02-b2428aeaa7e0', 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', 'd9603158-e3a9-5d7c-9ecf-d1142b3fe518', '2025-01-02', NULL, NULL, NULL, 102),
    ('7b8dc1b6-16aa-5a71-bafa-75054887f84b', 'f7ac00dc-47be-5e3e-9b02-b2428aeaa7e0', 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', '53c60bc7-b2d2-52be-92b4-57398e7113cb', '2025-01-02', NULL, NULL, NULL, 103),
    ('b520cbb6-e22c-53f6-bfbd-db42d82138f7', 'f7ac00dc-47be-5e3e-9b02-b2428aeaa7e0', 'dc2e3c13-583c-50e6-aa05-5be865014014', '2ad2c280-8c6b-5212-bbec-30c7d0cd5097', '2025-01-02', NULL, NULL, NULL, 104),
    ('ada67557-cba2-5bce-8632-e6027c41c2dc', 'f7ac00dc-47be-5e3e-9b02-b2428aeaa7e0', 'dc2e3c13-583c-50e6-aa05-5be865014014', '5c2d0a30-3d33-5207-97b9-a174c3fa1167', '2025-01-02', NULL, NULL, NULL, 105),
    ('e6b90635-1fd2-583c-ba3b-6b4e329d8859', '83fa958e-80b1-52fb-b5c8-ae8b47c8fa29', '87240066-c49b-52d6-980a-3cbba2815561', '68787b82-8fd4-5e60-909f-da4abf912aa7', '2025-01-02', NULL, NULL, NULL, 106),
    ('f5c757a5-35f8-5763-bd96-4ec7c846dc49', '83fa958e-80b1-52fb-b5c8-ae8b47c8fa29', '87240066-c49b-52d6-980a-3cbba2815561', 'b8900c49-a182-5ecc-bd77-853f7d145a14', '2025-01-02', NULL, NULL, NULL, 107),
    ('e668d565-dfc9-5f1b-9a88-87ba89b46f77', '83fa958e-80b1-52fb-b5c8-ae8b47c8fa29', 'ce85c387-8129-5dce-9c91-7e9fe3fa6498', '21e8e338-bcf0-5f2c-8f9a-cbc1cdc8ec67', '2025-01-02', NULL, NULL, NULL, 108),
    ('cd51d271-1c79-55a4-959e-d65bb538ddf7', '83fa958e-80b1-52fb-b5c8-ae8b47c8fa29', 'ce85c387-8129-5dce-9c91-7e9fe3fa6498', NULL, NULL, NULL, NULL, NULL, 109),
    ('2be1b842-2443-5a2e-a438-77a6c92b9d10', '83fa958e-80b1-52fb-b5c8-ae8b47c8fa29', 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', '45dcd215-2dcc-51a4-a247-1637edcd9060', '2025-01-02', NULL, NULL, NULL, 110),
    ('d37184ff-a48b-5ddd-9ace-5e142ffd4c14', '83fa958e-80b1-52fb-b5c8-ae8b47c8fa29', 'dcdbf0ae-835d-5a90-825e-3c655e01ecdf', NULL, NULL, NULL, NULL, NULL, 111),
    ('f19b5db3-a9d7-5e44-8cca-38ce7553d64d', 'a797a171-aa88-5548-8904-af33f4833e7b', 'd6024ddc-ac71-54bd-a38e-1e1bca223cc7', NULL, NULL, NULL, NULL, NULL, 112),
    ('5d00ccee-8708-578e-961c-945b3578d6a6', 'a797a171-aa88-5548-8904-af33f4833e7b', '99954d21-8d76-5bc9-9c64-60f921d99d50', '80737795-b2b9-5a47-aa78-b09e11a1e982', '2025-01-02', NULL, NULL, NULL, 113),
    ('3dba3c01-9121-5edd-86a8-d3cff7675838', 'a797a171-aa88-5548-8904-af33f4833e7b', 'd6c03e4b-c67a-5280-b8b6-6683c8aa6040', NULL, NULL, NULL, NULL, NULL, 114),
    ('bfa20e84-772d-5cf5-b12d-63fe86bb632e', 'a797a171-aa88-5548-8904-af33f4833e7b', 'f803c918-51d5-5919-ad4e-7a3d7a83e313', '4559d7ec-b0e1-58b7-b80e-5028486238fd', '2025-01-02', NULL, NULL, NULL, 115),
    ('3f0edc48-b49f-565e-b910-fe06d320a3aa', 'a797a171-aa88-5548-8904-af33f4833e7b', 'f803c918-51d5-5919-ad4e-7a3d7a83e313', 'b7b4a9c9-91f3-5d94-b015-c83fd962eb20', '2025-01-02', NULL, NULL, NULL, 116),
    ('6a8f713c-18aa-5365-8410-22d3deaedff7', 'a797a171-aa88-5548-8904-af33f4833e7b', 'f803c918-51d5-5919-ad4e-7a3d7a83e313', '5ff5363e-3e49-531d-8df8-ee747399b8f6', '2025-01-02', NULL, NULL, NULL, 117),
    ('8b2e9091-6d91-5cc1-8db8-67e61299fe21', 'a797a171-aa88-5548-8904-af33f4833e7b', 'f803c918-51d5-5919-ad4e-7a3d7a83e313', '462f3142-3375-5741-9401-5714471b4151', '2025-01-02', NULL, NULL, NULL, 118),
    ('34de1091-2c25-555f-8edb-85c63dc99973', 'a797a171-aa88-5548-8904-af33f4833e7b', 'ebdd7ce9-cfe7-5df8-9f29-77f6bb9c8298', NULL, NULL, NULL, NULL, NULL, 119),
    ('214ea159-33ee-517b-b251-ff1428e7c9e4', 'a797a171-aa88-5548-8904-af33f4833e7b', 'fb11da3c-df6e-58e2-916a-5964140afef4', NULL, NULL, NULL, NULL, NULL, 120),
    ('a6dfb208-3369-530a-a6ae-ab2097de1711', 'a797a171-aa88-5548-8904-af33f4833e7b', '3dac938a-da2e-5aaa-9efc-221242cc8a37', '1bd19754-99a2-5f1e-aa65-df3fab5b07e7', '2025-01-02', NULL, NULL, NULL, 121),
    ('63729a36-9d0b-578f-aa77-50b075fad210', 'a797a171-aa88-5548-8904-af33f4833e7b', '1d274582-2817-59be-90a2-6beb99836985', NULL, NULL, NULL, NULL, NULL, 122),
    ('cdd8f909-068b-5886-9662-c585974027ed', 'a797a171-aa88-5548-8904-af33f4833e7b', '951459cd-1124-55d9-bb77-857218e88ffd', 'c76d413e-08af-5ce5-b79b-bf2f214f0bf5', '2025-01-02', NULL, NULL, NULL, 123);

COMMIT;
```

## Bagian 3 — Query verifikasi

Hasil saat diuji: semua kolom `hasil` = `harapan`.

```sql
-- Jumlah baris per tabel
SELECT 'periods' AS tabel, COUNT(*) FROM periods
UNION ALL SELECT 'parties', COUNT(*) FROM parties
UNION ALL SELECT 'unit_types', COUNT(*) FROM unit_types
UNION ALL SELECT 'positions', COUNT(*) FROM positions
UNION ALL SELECT 'org_units', COUNT(*) FROM org_units
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'assignments', COUNT(*) FROM assignments;

-- Cek sesuai sheet "Validasi" (kolom hasil harus = harapan)
SELECT 'Anggota DEWAN' AS cek, COUNT(*)::text AS hasil, '25' AS harapan FROM users WHERE person_type = 'DEWAN'
UNION ALL
SELECT 'Pegawai SETWAN', COUNT(*)::text, '27' FROM users WHERE person_type = 'SETWAN'
UNION ALL
SELECT 'PNS / PPPK',
       COUNT(*) FILTER (WHERE employment_type = 'PNS') || ' / ' || COUNT(*) FILTER (WHERE employment_type = 'PPPK'), '18 / 9'
FROM users WHERE person_type = 'SETWAN'
UNION ALL
SELECT 'Dewan tidak tepat 1 fraksi', COUNT(*)::text, '0' FROM (
    SELECT u.id
    FROM users u
    LEFT JOIN assignments a ON a.person_id = u.id
    LEFT JOIN org_units o  ON o.id = a.org_unit_id
    LEFT JOIN unit_types t ON t.id = o.unit_type_id AND t.code = 'FRAKSI'
    WHERE u.person_type = 'DEWAN'
    GROUP BY u.id
    HAVING COUNT(t.id) <> 1
) x
UNION ALL
SELECT 'Wadah Dewan dengan Ketua <> 1', COUNT(*)::text, '0' FROM (
    SELECT o.id
    FROM org_units o
    JOIN unit_types t ON t.id = o.unit_type_id AND t.domain = 'DEWAN'
    LEFT JOIN assignments a ON a.org_unit_id = o.id AND a.end_date IS NULL
         AND a.position_id = (SELECT id FROM positions WHERE code = 'KETUA')
    GROUP BY o.id
    HAVING COUNT(a.id) <> 1
) x
UNION ALL
SELECT 'Formasi Setwan kosong', COUNT(*)::text, '11'
FROM assignments a
JOIN org_units o  ON o.id = a.org_unit_id
JOIN unit_types t ON t.id = o.unit_type_id AND t.domain = 'SETWAN'
WHERE a.person_id IS NULL;
```
