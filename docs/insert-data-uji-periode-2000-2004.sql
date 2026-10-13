-- Data uji: periode 2000-2004 (nonaktif) + pegawai SETWAN dari
-- "Daftar Pegawai Sekretariat DPRD Kota Magelang.pdf" (DUK per September 2026).
-- Tujuan: data uji untuk cek perilaku query terhadap periode non-aktif
-- (lihat docs/trd-database-eparlemen.md Bagian 7 & docs/api-kontrak-roster-pegawai.md).
--
-- Hasil pengecekan 52 pegawai di PDF terhadap data yang sudah ada (per 12 Okt 2026):
--   - 17 orang NIP-nya sudah sama persis dgn yg ada di DB -> TIDAK ikut di-insert ulang
--     (RUMIYATI, KABUL LAKSONO, SUROTO, TITIK SETIYANINGRUM, AGUS SANTOSO,
--      SWASTI KUSUMA DEWI, PANCA ARIANA, MOH TOYIBAN, MUH FAUZI, CRISTIAN NISA YANSEN,
--      UUS SOLIKHUDIN, HASMAN KURNIYAWAN, RACHMITA BUNGA PURI D, PRIHATINI,
--      LUCKIE ADITYA RACHMA, FAUZZIAH ANIS NUR S, ARIFIN RAJ SANDA).
--   - 2 orang namanya SUDAH ADA di DB tapi NIP beda/kosong -> di-UPDATE, bukan insert
--     baru (Bagian 1): CATUR ADI SUBAGIO (NIP existing 196805301990011001 vs PDF
--     197009181990031005 -- kemungkinan NIP seed lama salah/placeholder), PRAWERTI
--     PRAJNAJATI (NIP existing NULL, diisi dari PDF).
--   - 33 orang benar-benar baru -> di-insert sbg users baru (Bagian 2).
--   - Dari 33 itu, HANYA 3 yg jabatannya struktural & jelas unit kerjanya dari teks PDF
--     ("Ka. Bagian Umum", "Ka. Sub Bagian Rumah Tangga dan Perlengkapan", "Ka. Sub
--     Bagian Tata Usaha dan Kepegawaian") -> dibuatkan assignment periode 2000-2004
--     (Bagian 3). 30 sisanya jabatannya generik (Operator/Penata/Pengelola Layanan
--     Operasional, Penelaah Teknis Kebijakan) dan PDF TIDAK menyebutkan unit kerjanya
--     -> cuma di-insert sbg users, TANPA assignment (menghindari menebak unit kerja
--     yang tidak ada datanya).
--
-- Assignment sengaja diberi start_date/end_date yang SUDAH LEWAT (dalam rentang
-- periode 2000-2004) -- bukan end_date NULL -- supaya statusnya "historis/closed",
-- persis untuk menguji apakah query roster/struktur sudah benar mengecualikan data
-- non-aktif ini dari hasil "aktif" (baik lewat ck end_date IS NULL biasa, maupun lewat
-- filter periode aktif yang baru ditambahkan di docs/api-kontrak-roster-pegawai.md).
--
-- org_units SETWAN (Bagian/Sub Bagian) TIDAK diberi period_id baru -- tetap NULL
-- sesuai desain yang sudah ada (SETWAN tidak terikat periode DPRD, lihat TRD Bagian 7).
-- Keterkaitan ke periode 2000-2004 di sini murni lewat assignments.start_date/end_date.

-- ============ 1. Periode 2000-2004 (nonaktif) ============
INSERT INTO periods (id, name, start_date, end_date, is_active)
VALUES (gen_random_uuid(), '2000-2004', '2000-08-01', '2004-07-31', false);

-- ============ 2. Perbaiki NIP 2 pegawai yang sudah ada tapi NIP beda/kosong ============
UPDATE users SET employee_number_nip = '197009181990031005', updated_at = now()
WHERE name = 'CATUR ADI SUBAGIO' AND employee_number_nip = '196805301990011001';

UPDATE users SET employee_number_nip = '197308281997032006', updated_at = now()
WHERE name = 'PRAWERTI PRAJNAJATI' AND employee_number_nip IS NULL;

-- ============ 3. 33 pegawai baru (users) ============
INSERT INTO users (id, person_type, employment_type, name, title_suffix, employee_number_nip, employment_status)
VALUES
  ('96fc17b7-1fc2-4f10-9c91-a0d576cabcf8', 'SETWAN', 'PNS', 'TRIYAMTO SUTRISNO', 'SSTP., MM.', '197110251992031010', 'AKTIF'),
  ('bd295288-6d15-420e-ae24-510863b88fe3', 'SETWAN', 'PNS', 'MUWAHIDIN', 'S.Sos.', '197505122006041017', 'AKTIF'),
  ('c7f51635-af90-47bb-b82b-badae557e30f', 'SETWAN', 'PNS', 'ADI SURYA LARAS', 'S.Ak.', '198004162009031001', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'AGUS NUR HAYANTO', 'S.M.', '198111072015021001', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'KIKI RIZKI ALTALATA', 'S.IP.', '198201202025211047', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'ROCHMAT FAJAR ARUMBA', 'S.T.', '198312092025211036', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'DWI KESUMA FAJAR NURSENA', 'S.Kom', '198708202025211093', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'BAGAS WIDO PERMANA', 'S.Kom.', '199209302025211053', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'RICKY ARIESTA PAMUNGKAS', 'SE', '199304102025211084', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'RAFIKA KUSUMA WARDANI', 'S.E.', '199001172025212069', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'AYU NUR ANISA', 'S.Pd.', '199504182025212062', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'TYAS ENGGARIN SURYO', 'S.Ak.', '199609292025211051', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'HADI SUNARJO', NULL, '197006172025211021', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'SLAMET SUPRATIKNO', NULL, '197703292025211031', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'SUPRIYANTO', NULL, '198011152025211048', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'LILIK BINTARTO', NULL, '198105042025211059', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'ARIF GUNAWAN', NULL, '198304152025211069', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'JATU WIRATMOKO', NULL, '198501102025211066', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'SETYO WIBOWO', NULL, '198809302025211078', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'PUPUT SETYOWATI', NULL, '199103272025212080', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'SATRIYO MUHAMAD NURIKSAN', NULL, '198804012025211094', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'DESA YUDA WIJAYA', NULL, '199401132025211074', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'JUNIOR SENJA', NULL, '199806092025211037', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'TRI PURWANTO', NULL, '198303232025211118', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'SYARIF HIDAYATULLAH', NULL, '200312132025211002', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'WISNOE MOERTI', NULL, '197002262025211017', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'AGUS SUHARJI BAMBANG PAMUNGKAS', NULL, '197408082025211046', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'KAMARUDIN', NULL, '197804012025211041', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'DANARI', NULL, '197506022025211030', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'PRAYITNO', NULL, '198105102025211088', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'TEGUH SANTOSO', NULL, '198311022025211060', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'SUMARNA', NULL, '198606062025211118', 'AKTIF'),
  (gen_random_uuid(), 'SETWAN', 'PNS', 'DIDIK SETIAWAN', NULL, '200005022025211021', 'AKTIF');

-- ============ 4. Assignment periode 2000-2004 utk 3 orang yg unit kerjanya jelas ============
-- org_unit & position id diambil dari katalog yg sudah ada (Bagian Umum, Sub Bagian
-- Rumah Tangga dan Perlengkapan, Sub Bagian Tata Usaha dan Kepegawaian / Kepala
-- Bagian, Kepala Sub Bagian) -- kombinasi ini sudah tervalidasi di unit_type_positions
-- krn sudah dipakai assignment aktif yang ada sekarang.
INSERT INTO assignments (id, org_unit_id, position_id, person_id, start_date, end_date, sort_order, notes)
VALUES
  (gen_random_uuid(), 'a2e58db5-2405-574d-af14-5100a54082ac', '370fc088-3bec-5d9a-8da4-94f944e5c8de',
   '96fc17b7-1fc2-4f10-9c91-a0d576cabcf8', '2000-08-01', '2004-07-31', 1,
   'Data uji periode 2000-2004 (TRIYAMTO SUTRISNO, Ka. Bagian Umum -- ref DUK Sekretariat DPRD)'),
  (gen_random_uuid(), 'ecbf5643-7152-5d3b-bab3-279846565b9e', '24865043-380a-5929-aa29-b2ae9e09cbd3',
   'bd295288-6d15-420e-ae24-510863b88fe3', '2000-08-01', '2004-07-31', 1,
   'Data uji periode 2000-2004 (MUWAHIDIN, Ka. Sub Bagian Rumah Tangga dan Perlengkapan -- ref DUK Sekretariat DPRD)'),
  (gen_random_uuid(), 'f7ac00dc-47be-5e3e-9b02-b2428aeaa7e0', '24865043-380a-5929-aa29-b2ae9e09cbd3',
   'c7f51635-af90-47bb-b82b-badae557e30f', '2000-08-01', '2004-07-31', 1,
   'Data uji periode 2000-2004 (ADI SURYA LARAS, Ka. Sub Bagian Tata Usaha dan Kepegawaian -- ref DUK Sekretariat DPRD)');

-- ============ Verifikasi setelah dijalankan ============
-- SELECT * FROM periods WHERE name = '2000-2004';
-- SELECT name, employee_number_nip FROM users WHERE name IN ('CATUR ADI SUBAGIO','PRAWERTI PRAJNAJATI');
-- SELECT count(*) FROM users WHERE employee_number_nip IN (
--   '197110251992031010','197505122006041017','198004162009031001' -- dst, 33 NIP baru
-- );
