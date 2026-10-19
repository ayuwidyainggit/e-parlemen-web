-- Data dummy `dapil_assignments` -- 1:1 dgn DAPIL_ASSIGN_HISTORY_SEED di
-- penugasan-dapil-reses-data.js (25 Anggota/Politisi, penetapan awal
-- Periode 2024-2029, SK.188/01/2024 s.d. SK.188/25/2024, semua masih aktif
-- / belum pindah dapil -- end_date NULL).
--
-- PRASYARAT: jalankan dulu
--   1) docs/insert-data-dapil-dummy.sql   (isi tabel `dapils`)
--   2) docs/ddl-dapil-assignments-add-period-id.sql (kalau belum, utk kolom
--      period_id + trigger auto-sync -- INSERT di bawah TIDAK mengisi
--      period_id secara manual, dibiarkan terisi otomatis oleh trigger
--      trg_dapil_assignments_sync_period dari dapils.period_id).
--
-- Mapping personId prototipe -> users.member_code memakai pola
-- 'DPRD-AGT-' + personId dipad 4 digit (lihat pegawai-data.js: nip field
-- Politisi persis pola ini, dan sudah dicek sama dgn users.member_code
-- di DB). Mapping dapilKode -> dapils.code dipakai langsung (DAPIL-1/2/3).
--
-- Trigger trg_dapil_assignments_validate (person_type harus 'DEWAN') otomatis
-- lolos krn ke-25 personId ini semuanya tipePegawai 'Politisi' = person_type
-- 'DEWAN' di DB.

INSERT INTO dapil_assignments (dapil_id, person_id, start_date, decree_number, notes)
SELECT d.id, u.id, v.start_date::date, v.decree_number, v.notes
FROM (VALUES
  ('DPRD-AGT-0001', 'DAPIL-1', '2024-10-01', 'SK.188/01/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0002', 'DAPIL-2', '2024-10-01', 'SK.188/02/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0003', 'DAPIL-3', '2024-10-01', 'SK.188/03/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0004', 'DAPIL-1', '2024-10-01', 'SK.188/04/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0005', 'DAPIL-2', '2024-10-01', 'SK.188/05/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0006', 'DAPIL-3', '2024-10-01', 'SK.188/06/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0007', 'DAPIL-1', '2024-10-01', 'SK.188/07/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0008', 'DAPIL-2', '2024-10-01', 'SK.188/08/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0009', 'DAPIL-3', '2024-10-01', 'SK.188/09/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0010', 'DAPIL-1', '2024-10-01', 'SK.188/10/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0011', 'DAPIL-2', '2024-10-01', 'SK.188/11/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0012', 'DAPIL-3', '2024-10-01', 'SK.188/12/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0013', 'DAPIL-1', '2024-10-01', 'SK.188/13/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0014', 'DAPIL-2', '2024-10-01', 'SK.188/14/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0015', 'DAPIL-3', '2024-10-01', 'SK.188/15/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0016', 'DAPIL-1', '2024-10-01', 'SK.188/16/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0017', 'DAPIL-2', '2024-10-01', 'SK.188/17/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0018', 'DAPIL-3', '2024-10-01', 'SK.188/18/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0019', 'DAPIL-1', '2024-10-01', 'SK.188/19/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0020', 'DAPIL-2', '2024-10-01', 'SK.188/20/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0021', 'DAPIL-3', '2024-10-01', 'SK.188/21/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0022', 'DAPIL-1', '2024-10-01', 'SK.188/22/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0023', 'DAPIL-2', '2024-10-01', 'SK.188/23/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0024', 'DAPIL-3', '2024-10-01', 'SK.188/24/2024', 'Penetapan awal Periode 2024-2029'),
  ('DPRD-AGT-0025', 'DAPIL-1', '2024-10-01', 'SK.188/25/2024', 'Penetapan awal Periode 2024-2029')
) AS v(member_code, dapil_code, start_date, decree_number, notes)
JOIN users  u ON u.member_code = v.member_code AND u.person_type = 'DEWAN'
JOIN dapils d ON d.code = v.dapil_code
             AND d.period_id = (SELECT id FROM periods WHERE is_active = TRUE);
