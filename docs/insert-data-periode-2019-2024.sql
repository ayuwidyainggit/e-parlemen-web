-- Data pegawai SETWAN untuk PERIODE NYATA 2019-2024 (periods.id =
-- 'd0eefc99-e99f-5ba3-a818-6d5555d829f8', nonaktif) -- sumber data:
-- "docs/docsv2/Daftar Pegawai Sekretariat DPRD Kota Magelang.pdf" (DUK per
-- September 2026, 52 pegawai).
--
-- BEDA dengan docs/insert-data-uji-periode-2000-2004.sql: periode di situ
-- adalah periode DUMMY/uji (dibuat khusus utk tes, mendahului semua orang
-- direkrut) sehingga tanggal assignment cuma dipaksa ke rentang periode
-- tanpa makna historis. Periode 2019-2024 di SINI adalah periode NYATA yang
-- SUDAH ADA di tabel periods -- karena itu tanggal assignment di bawah
-- dicek dulu terhadap fakta di PDF (TMT/NIP) supaya tidak mengklaim
-- seseorang sudah menjabat sebelum dia benar-benar direkrut.
--
-- ================= METODOLOGI =================
-- 1) "Sudah bekerja selama periode 2019-2024" (2019-08-01 s.d. 2024-07-31)
--    ditentukan dari TMT pengangkatan pertama (6 digit ke-9..14 pada NIP
--    utk PNS; utk PPPK dipakai TMT golongan pertama di kolom PDF krn kode
--    bulan pada NIP PPPK bukan bulan kalender). Hasil: 19 dari 52 orang
--    eligible (14 orang no. 1-14 di PDF + 5 orang PPPK yang TMT-nya 01 Maret
--    2024, yaitu no. 44,45,46,47,50). Sisanya (29 PPPK TMT Okt 2025 no.
--    15-43, dan 4 PPPK TMT Maret 2025 no. 48,49,51,52) BELUM direkrut saat
--    periode ini berakhir -> TIDAK dibuatkan assignment periode ini, hanya
--    di-insert sbg users (katalog lengkap, no. 15-43 saja yg baru; no.
--    48,49,51,52 sudah ada di DB).
-- 2) Dari 19 yang eligible, 2 orang DIKECUALIKAN lagi krn PDF sendiri
--    menyebutkan TMT jabatan/eselon CURRENT mereka jatuh SETELAH periode
--    ini berakhir (artinya jabatan yg ada di PDF pasti BUKAN jabatan yang
--    mereka pegang selama 2019-2024, dan kita tidak punya data jabatan
--    historisnya):
--      - PRAWERTI PRAJNAJATI: TMT Sekretaris DPRD = 27 Okt 2025 (> periode).
--      - MUWAHIDIN: TMT Ka. Sub Bagian Rumah Tangga & Perlengkapan =
--        22 Jun 2026 (> periode).
--    Kedua orang ini TETAP di-insert/update sbg users, TANPA assignment
--    periode 2019-2024.
-- 3) 1 orang lagi (AGUS NUR HAYANTO, no. 11 -- "Penelaah Teknis Kebijakan")
--    eligible dari sisi tanggal tapi org_unit-nya TIDAK disebut di PDF dan
--    dia user BARU (tidak ada assignment existing utk dipinjam) -> insert
--    user saja, tanpa assignment (menghindari menebak unit kerja).
-- 4) 1 orang lagi (SUROTO, no. 13) jabatan di PDF ("Operator Layanan
--    Operasional") BEDA dgn jabatan pada assignment aktif dia yg sudah ada
--    di DB sekarang ("Pengadministrasi Perkantoran") -> ambigu jabatan mana
--    yg benar utk 2019-2024, assignment TIDAK dibuat (dia sudah ada sbg
--    user, tidak perlu insert ulang).
-- 5) Sisa 15 orang eligible & jelas org_unit/posisinya (baik dari eselon di
--    PDF, atau dari assignment existing dgn posisi generik yg SAMA persis
--    dgn teks PDF) -> dibuatkan assignment periode 2019-2024 (Bagian 4).
--    start_date pakai TMT riil kalau ada di PDF (eselon/TMT golongan
--    pertama utk PPPK baru); kalau cuma posisi generik lama tanpa TMT
--    spesifik, start_date dipakai 2019-08-01 (awal periode, karena NIP
--    menunjukkan sudah bekerja jauh sebelum periode mulai). end_date semua
--    dipaksa ke 2024-07-31 (akhir periode) agar baris ini scoped/closed ke
--    periode 2019-2024, terpisah dari assignment "current" (2025-01-01..)
--    yang sudah ada di DB -- dua baris ini TIDAK konflik krn rentang
--    tanggalnya tidak tumpang tindih.
--
-- Pengecekan silang NIP terhadap 27 user SETWAN yang sudah ada di DB (12
-- Okt 2026) -- 17 NIP sudah sama persis (tidak insert ulang), 2 NIP beda/
-- kosong (CATUR ADI SUBAGIO, PRAWERTI PRAJNAJATI -> UPDATE di Bagian 1),
-- 33 pegawai benar-benar baru (INSERT di Bagian 2) -- identik dgn temuan
-- docs/insert-data-uji-periode-2000-2004.sql krn dari PDF yang sama.
--
-- org_units: KARENA struktur organisasi SETWAN bisa beda tiap periode,
-- org_units yang ADA SEKARANG (90df424c..., a2e58db5..., dst) TIDAK dipakai
-- ulang -- baris itu sudah di-tag ke periode AKTIF 2024-2029 (period_id =
-- ...f9). Bagian 3 di bawah membuat SALINAN baru 6 org_units (Sekretariat
-- DPRD -> 3 Bagian -> 2 Sub Bagian) dengan id baru & period_id = periode
-- 2019-2024 ini, supaya tiap periode punya pohon org_units sendiri yang
-- independen. Assignment di Bagian 4 mengacu ke org_unit_id BARU ini, bukan
-- ke org_unit milik periode 2024-2029.
-- positions (katalog jabatan/jobtitle) TETAP dipakai bersama lintas periode
-- (tabel positions tidak punya kolom period_id) -- cuma org_units yang
-- di-duplikasi per periode.

-- ============ 1. Perbaiki NIP 2 pegawai yang sudah ada tapi NIP beda/kosong ============
UPDATE users SET employee_number_nip = '197009181990031005', updated_at = now()
WHERE name = 'CATUR ADI SUBAGIO' AND employee_number_nip = '196805301990011001';

UPDATE users SET employee_number_nip = '197308281997032006', updated_at = now()
WHERE name = 'PRAWERTI PRAJNAJATI' AND employee_number_nip IS NULL;

-- ============ 2. 33 pegawai baru (users) ============
-- (Identik dgn Bagian 3 di docs/insert-data-uji-periode-2000-2004.sql --
-- sumber & orang yang sama, cuma dipisah di sini supaya file ini berdiri
-- sendiri utk target periode 2019-2024.)
INSERT INTO users (id, person_type, employment_type, name, title_suffix, employee_number_nip, status)
VALUES
  ('96fc17b7-1fc2-4f10-9c91-a0d576cabcf8', 'SETWAN', 'PNS', 'TRIYAMTO SUTRISNO', 'SSTP., MM.', '197110251992031010', 'AKTIF'),
  ('bd295288-6d15-420e-ae24-510863b88fe3', 'SETWAN', 'PNS', 'MUWAHIDIN', 'S.Sos.', '197505122006041017', 'AKTIF'),
  ('c7f51635-af90-47bb-b82b-badae557e30f', 'SETWAN', 'PNS', 'ADI SURYA LARAS', 'S.Ak.', '198004162009031001', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'AGUS NUR HAYANTO', 'S.M.', '198111072015021001', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'KIKI RIZKI ALTALATA', 'S.IP.', '198201202025211047', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'ROCHMAT FAJAR ARUMBA', 'S.T.', '198312092025211036', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'DWI KESUMA FAJAR NURSENA', 'S.Kom', '198708202025211093', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'BAGAS WIDO PERMANA', 'S.Kom.', '199209302025211053', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'RICKY ARIESTA PAMUNGKAS', 'SE', '199304102025211084', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'RAFIKA KUSUMA WARDANI', 'S.E.', '199001172025212069', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'AYU NUR ANISA', 'S.Pd.', '199504182025212062', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'TYAS ENGGARIN SURYO', 'S.Ak.', '199609292025211051', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'HADI SUNARJO', NULL, '197006172025211021', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'SLAMET SUPRATIKNO', NULL, '197703292025211031', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'SUPRIYANTO', NULL, '198011152025211048', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'LILIK BINTARTO', NULL, '198105042025211059', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'ARIF GUNAWAN', NULL, '198304152025211069', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'JATU WIRATMOKO', NULL, '198501102025211066', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'SETYO WIBOWO', NULL, '198809302025211078', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'PUPUT SETYOWATI', NULL, '199103272025212080', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'SATRIYO MUHAMAD NURIKSAN', NULL, '198804012025211094', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'DESA YUDA WIJAYA', NULL, '199401132025211074', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'JUNIOR SENJA', NULL, '199806092025211037', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'TRI PURWANTO', NULL, '198303232025211118', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'SYARIF HIDAYATULLAH', NULL, '200312132025211002', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'WISNOE MOERTI', NULL, '197002262025211017', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'AGUS SUHARJI BAMBANG PAMUNGKAS', NULL, '197408082025211046', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'KAMARUDIN', NULL, '197804012025211041', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'DANARI', NULL, '197506022025211030', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'PRAYITNO', NULL, '198105102025211088', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'TEGUH SANTOSO', NULL, '198311022025211060', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'SUMARNA', NULL, '198606062025211118', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PPPK', 'DIDIK SETIAWAN', NULL, '200005022025211021', 'AKTIF');

-- ============ 3. org_units utk periode 2019-2024 (struktur sendiri, bukan reuse) ============
-- unit_type_id, code, parent chain disalin apa adanya dari struktur SETWAN
-- yang berlaku di periode 2024-2029 sekarang (termasuk 1 ketidaksesuaian
-- yang sudah ada di sana: Bagian Keuangan & Bagian Persidangan sama-sama
-- memakai unit_type "Kepala Bagian Umum", dan Sub Bagian Tata Usaha dan
-- Kepegawaian memakai unit_type "Sub Bagian Rumah Tangga & Perlengkapan" --
-- padahal unit_type khusus utk masing-masing sudah ada di tabel unit_types
-- tapi tidak dipakai. Ini bug data existing, DI LUAR scope file ini --
-- sengaja direplikasi apa adanya demi konsistensi strukturnya; kalau mau
-- dibenahi sebaiknya dibenahi utk KEDUA periode sekaligus via migrasi lain.
INSERT INTO org_units (id, unit_type_id, parent_id, period_id, code, name, sort_order, is_active)
VALUES
  ('172a9a4d-3ef4-401e-9423-18831b4929cb', 'b0259834-de2f-5648-be44-bd576db6d9a4', NULL,
   'd0eefc99-e99f-5ba3-a818-6d5555d829f8', 'SETWAN', 'Sekretariat DPRD', 21, true),
  ('a25be781-e17d-44d2-8671-58e79bda5995', '2af29419-1d46-589a-84db-c53456b4fdbc', '172a9a4d-3ef4-401e-9423-18831b4929cb',
   'd0eefc99-e99f-5ba3-a818-6d5555d829f8', 'BAG-UMUM', 'Bagian Umum', 22, true),
  ('a8e8a434-f6ff-4499-bb93-7bb6426c4093', '2af29419-1d46-589a-84db-c53456b4fdbc', '172a9a4d-3ef4-401e-9423-18831b4929cb',
   'd0eefc99-e99f-5ba3-a818-6d5555d829f8', 'BAG-KEU', 'Bagian Keuangan', 23, true),
  ('83dddd9b-c394-4d51-a70c-a3703f1def1e', '2af29419-1d46-589a-84db-c53456b4fdbc', '172a9a4d-3ef4-401e-9423-18831b4929cb',
   'd0eefc99-e99f-5ba3-a818-6d5555d829f8', 'BAG-PERSID', 'Bagian Persidangan dan Perundang-undangan', 24, true),
  ('9c142de1-4e88-407d-91ba-db6332950be7', '5cd44512-1caa-55b3-a101-f1ec4484add0', 'a25be781-e17d-44d2-8671-58e79bda5995',
   'd0eefc99-e99f-5ba3-a818-6d5555d829f8', 'SUBBAG-RT', 'Sub Bagian Rumah Tangga dan Perlengkapan', 25, true),
  ('862bd7cf-ba43-4991-9816-55d6bb01bddc', '5cd44512-1caa-55b3-a101-f1ec4484add0', 'a25be781-e17d-44d2-8671-58e79bda5995',
   'd0eefc99-e99f-5ba3-a818-6d5555d829f8', 'SUBBAG-TU', 'Sub Bagian Tata Usaha dan Kepegawaian', 26, true);

-- ============ 4. Assignment periode 2019-2024 (15 orang -- lihat METODOLOGI #5) ============
-- org_unit_id di bawah mengacu ke org_units BARU (Bagian 3), bukan org_unit
-- milik periode 2024-2029 yang sudah ada. position_id tetap dari katalog
-- positions yang sama (dipakai bersama lintas periode).
INSERT INTO assignments (id, org_unit_id, position_id, person_id, start_date, end_date, sort_order, notes)
VALUES
  -- Ka. Bagian Umum (TMT eselon riil 24 Jun 2013, PDF)
  (gen_random_uuid(), 'a25be781-e17d-44d2-8671-58e79bda5995', '370fc088-3bec-5d9a-8da4-94f944e5c8de',
   '96fc17b7-1fc2-4f10-9c91-a0d576cabcf8', '2013-06-24', '2024-07-31', 1,
   'Periode 2019-2024 (TRIYAMTO SUTRISNO, Ka. Bagian Umum -- ref DUK Sekretariat DPRD per Sept 2026, TMT eselon 24 Jun 2013)'),
  -- Ka. Bagian Keuangan (TMT eselon riil 03 Sep 2021, PDF)
  (gen_random_uuid(), 'a8e8a434-f6ff-4499-bb93-7bb6426c4093', '370fc088-3bec-5d9a-8da4-94f944e5c8de',
   '4449b193-2794-5b77-876b-50c4422a100b', '2021-09-03', '2024-07-31', 1,
   'Periode 2019-2024 (RUMIYATI, Ka. Bagian Keuangan -- ref DUK Sekretariat DPRD per Sept 2026, TMT eselon 03 Sep 2021)'),
  -- Ka. Bagian Persidangan dan Perundang-undangan (TMT eselon riil 01 Nov 2021, PDF)
  (gen_random_uuid(), '83dddd9b-c394-4d51-a70c-a3703f1def1e', '370fc088-3bec-5d9a-8da4-94f944e5c8de',
   '99e115a1-69ad-5de7-bdac-ad48d2557ea7', '2021-11-01', '2024-07-31', 1,
   'Periode 2019-2024 (CATUR ADI SUBAGIO, Ka. Bagian Persidangan dan Perundang-undangan -- ref DUK Sekretariat DPRD per Sept 2026, TMT eselon 01 Nov 2021; NIP sudah diperbaiki di Bagian 1)'),
  -- Ka. Sub Bagian Tata Usaha dan Kepegawaian (TMT eselon riil 15 Sep 2022, PDF)
  (gen_random_uuid(), '862bd7cf-ba43-4991-9816-55d6bb01bddc', '24865043-380a-5929-aa29-b2ae9e09cbd3',
   'c7f51635-af90-47bb-b82b-badae557e30f', '2022-09-15', '2024-07-31', 1,
   'Periode 2019-2024 (ADI SURYA LARAS, Ka. Sub Bagian Tata Usaha dan Kepegawaian -- ref DUK Sekretariat DPRD per Sept 2026, TMT eselon 15 Sep 2022)'),
  -- Analis Kebijakan Ahli Muda, posisi generik lama (NIP jauh sebelum periode) -> start = awal periode
  (gen_random_uuid(), 'a8e8a434-f6ff-4499-bb93-7bb6426c4093', '87240066-c49b-52d6-980a-3cbba2815561',
   '68787b82-8fd4-5e60-909f-da4abf912aa7', '2019-08-01', '2024-07-31', 2,
   'Periode 2019-2024 (TITIK SETIYANINGRUM, Analis Kebijakan Ahli Muda -- nama posisi disamakan dgn assignment aktif yang ada (org_unit sendiri baru, lihat Bagian 3); NIP TMT 1994, jauh sebelum periode)'),
  (gen_random_uuid(), 'a8e8a434-f6ff-4499-bb93-7bb6426c4093', '87240066-c49b-52d6-980a-3cbba2815561',
   'b8900c49-a182-5ecc-bd77-853f7d145a14', '2019-08-01', '2024-07-31', 3,
   'Periode 2019-2024 (SWASTI KUSUMA DEWI, Analis Kebijakan Ahli Muda -- nama posisi disamakan dgn assignment aktif yang ada (org_unit sendiri baru, lihat Bagian 3); NIP TMT 2010, sebelum periode)'),
  (gen_random_uuid(), '83dddd9b-c394-4d51-a70c-a3703f1def1e', '3dac938a-da2e-5aaa-9efc-221242cc8a37',
   '1bd19754-99a2-5f1e-aa65-df3fab5b07e7', '2019-08-01', '2024-07-31', 2,
   'Periode 2019-2024 (PANCA ARIANA, Penyusun Materi Hukum dan Perundang-undangan -- nama posisi disamakan dgn assignment aktif yang ada (org_unit sendiri baru, lihat Bagian 3); NIP TMT 2010, sebelum periode)'),
  (gen_random_uuid(), '9c142de1-4e88-407d-91ba-db6332950be7', 'dc2e3c13-583c-50e6-aa05-5be865014014',
   '2f5f5492-ad6f-5700-9e99-cfa95c501dfa', '2019-08-01', '2024-07-31', 2,
   'Periode 2019-2024 (AGUS SANTOSO, Operator Layanan Operasional -- nama posisi disamakan dgn assignment aktif yang ada (org_unit sendiri baru, lihat Bagian 3); NIP TMT 2006, sebelum periode)'),
  (gen_random_uuid(), '9c142de1-4e88-407d-91ba-db6332950be7', 'dc2e3c13-583c-50e6-aa05-5be865014014',
   '0b2587b8-d3af-5bce-add8-8de24b5e3be3', '2019-08-01', '2024-07-31', 3,
   'Periode 2019-2024 (KABUL LAKSONO, Operator Layanan Operasional -- nama posisi disamakan dgn assignment aktif yang ada (org_unit sendiri baru, lihat Bagian 3); NIP TMT 2008, sebelum periode)'),
  (gen_random_uuid(), '862bd7cf-ba43-4991-9816-55d6bb01bddc', 'dc2e3c13-583c-50e6-aa05-5be865014014',
   '5c2d0a30-3d33-5207-97b9-a174c3fa1167', '2019-08-01', '2024-07-31', 2,
   'Periode 2019-2024 (MUH FAUZI, Operator Layanan Operasional -- nama posisi disamakan dgn assignment aktif yang ada (org_unit sendiri baru, lihat Bagian 3); NIP TMT 2010, sebelum periode)'),
  -- PPPK TMT golongan pertama 01 Maret 2024 (masih dalam rentang periode 2019-2024)
  (gen_random_uuid(), '83dddd9b-c394-4d51-a70c-a3703f1def1e', 'f803c918-51d5-5919-ad4e-7a3d7a83e313',
   '4559d7ec-b0e1-58b7-b80e-5028486238fd', '2024-03-01', '2024-07-31', 3,
   'Periode 2019-2024 (RACHMITA BUNGA PURI D, Perisalah Legislatif Ahli Pertama -- TMT golongan pertama PPPK 01 Mar 2024, masih dalam periode)'),
  (gen_random_uuid(), '862bd7cf-ba43-4991-9816-55d6bb01bddc', 'd00a235a-a693-5786-9c70-928c732447af',
   'baea31b2-4dcc-590d-bba1-9aab8c459207', '2024-03-01', '2024-07-31', 3,
   'Periode 2019-2024 (LUCKIE ADITYA RACHMA, Pranata Humas Ahli Pertama -- TMT golongan pertama PPPK 01 Mar 2024, masih dalam periode; PDF menulis "Pranata Hubungan Masyarakat Ahli Pertama")'),
  (gen_random_uuid(), '83dddd9b-c394-4d51-a70c-a3703f1def1e', 'f803c918-51d5-5919-ad4e-7a3d7a83e313',
   'b7b4a9c9-91f3-5d94-b015-c83fd962eb20', '2024-03-01', '2024-07-31', 4,
   'Periode 2019-2024 (FAUZZIAH ANIS NUR S, Perisalah Legislatif Ahli Pertama -- TMT golongan pertama PPPK 01 Mar 2024, masih dalam periode)'),
  (gen_random_uuid(), '862bd7cf-ba43-4991-9816-55d6bb01bddc', '04dce491-6172-5e2b-af9f-b217b7d43395',
   '8f08f8b0-c622-58ca-9c9e-a930e77e39e2', '2024-03-01', '2024-07-31', 4,
   'Periode 2019-2024 (CRISTIAN NISA YANSEN, Pranata Komputer Ahli Pertama -- TMT golongan pertama PPPK 01 Mar 2024, masih dalam periode)'),
  (gen_random_uuid(), '83dddd9b-c394-4d51-a70c-a3703f1def1e', '951459cd-1124-55d9-bb77-857218e88ffd',
   'c76d413e-08af-5ce5-b79b-bf2f214f0bf5', '2024-03-01', '2024-07-31', 5,
   'Periode 2019-2024 (PRIHATINI, Asisten Perisalah Legislatif Terampil -- TMT golongan pertama PPPK 01 Mar 2024, masih dalam periode)');

-- ============ Verifikasi setelah dijalankan ============
-- SELECT name, employee_number_nip FROM users WHERE name IN ('CATUR ADI SUBAGIO','PRAWERTI PRAJNAJATI');
-- SELECT count(*) FROM users WHERE person_type = 'SETWAN'; -- harus 27 + 33 = 60
-- SELECT count(*) FROM org_units WHERE period_id = 'd0eefc99-e99f-5ba3-a818-6d5555d829f8'; -- harus 6
-- SELECT u.name, ou.name AS org_unit, p.name AS position, a.start_date, a.end_date
--   FROM assignments a
--   JOIN users u ON u.id = a.person_id
--   JOIN org_units ou ON ou.id = a.org_unit_id
--   JOIN positions p ON p.id = a.position_id
--   WHERE ou.period_id = 'd0eefc99-e99f-5ba3-a818-6d5555d829f8'
--   ORDER BY a.start_date; -- harus 15 baris
