-- Data dummy `dapils` (Daerah Pemilihan) utk periode AKTIF 2024-2029
-- (periods.id = 'd0eefc99-e99f-5ba3-a818-6d5555d829f9').
--
-- Cakupan kecamatan/kelurahan diambil dari dapil-data.js (prototipe
-- master-dapil.html) supaya konsisten dgn yang sudah dipakai di frontend.
-- `seat_count` sengaja NULL -- tidak ada sumber data jumlah kursi resmi per
-- dapil di repo ini, jadi tidak ditebak.

INSERT INTO dapils (period_id, code, name, coverage_area, sort_order, is_active)
VALUES
  ('d0eefc99-e99f-5ba3-a818-6d5555d829f9', 'DAPIL-1', 'Dapil 1',
   'Kec. Magelang Selatan: Jurangombo Utara, Jurangombo Selatan, Magersari, Tidar Selatan, Rejowinangun Selatan',
   1, TRUE),
  ('d0eefc99-e99f-5ba3-a818-6d5555d829f9', 'DAPIL-2', 'Dapil 2',
   'Kec. Magelang Tengah: Kemirirejo, Cacaban, Magelang, Panjang, Gelangan',
   2, TRUE),
  ('d0eefc99-e99f-5ba3-a818-6d5555d829f9', 'DAPIL-3', 'Dapil 3',
   'Kec. Magelang Utara: Kedungsari, Potrobangsan, Wates, Kramat Selatan, Kramat Utara',
   3, TRUE);
