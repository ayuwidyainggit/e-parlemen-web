-- Query: struktur organisasi GABUNGAN -- domain SETWAN (Sekretariat DPRD) dan
-- domain DEWAN (Pimpinan DPRD + Fraksi), ditampilkan dalam satu pohon, dengan
-- SETWAN tampil lebih dulu baru disusul DEWAN.
--
-- VERSI INI: filter periode dilakukan BERDASARKAN ORG_UNIT (org_units.period_id),
-- bukan berdasarkan tanggal assignment. Tree dibangun dari org_units yang SUDAH
-- disaring lebih dulu (filtered_units), baru assignment di-join ke tree itu --
-- beda dengan versi sebelumnya yang membangun tree dari SEMUA org_units lalu
-- menyaring tiap baris assignment lewat EXISTS. Efeknya sama persis, tapi logika
-- ini lebih jelas: "unit mana saja yang berlaku di periode ini", bukan "baris
-- assignment mana yang kebetulan lolos".
--
-- LATAR BELAKANG -- dicek langsung ke DB (eparlemenv2):
--   domain SETWAN -> 6 org_units, period_id SELALU NULL (tidak terikat periode)
--   domain DEWAN  -> 14 org_units, period_id terisi (terikat ke satu periode)
-- Tidak ada org_units DEWAN yang menunjuk ke periode 2019-2024 sama sekali --
-- jadi utk periode itu, filtered_units otomatis kosong utk domain DEWAN, dan
-- karena anchor unit_tree juga diambil dari filtered_units, seluruh subtree
-- DEWAN tidak pernah terbentuk (bukan baris assignment-nya yang disaring belakangan,
-- unit-nya sendiri sudah tidak ada di tree). SETWAN tetap selalu muncul penuh
-- di periode manapun karena period_id-nya NULL -- ini BY DESIGN, bukan bug:
-- staf kesekretariatan tidak berganti per periode DPRD (lihat
-- docs/trd-database-eparlemen.md bagian "Keterikatan ke periode").
--
-- CATATAN -- `a.end_date IS NULL` di CTE `ranked` TIDAK dipakai utk filter
-- periode (periode sudah selesai difilter di `filtered_units`/`unit_tree`).
-- Itu cuma filter "assignment yang masih berjalan sekarang" (vs assignment yg
-- sudah diakhiri tapi belum dihapus). Jadi angka SETWAN yang keluar adalah
-- roster SETWAN aktif SAAT INI, ditampilkan di bawah label periode manapun yang
-- dipilih -- bukan rekonstruksi historis siapa yang menjabat SETWAN pada periode
-- itu. Kalau perlu rekonstruksi historis, pakai pendekatan overlap tanggal
-- seperti di docs/docsv2/query-struktur-setwan-periode-aktif.sql.
--
-- Target periode dipusatkan di CTE `target_period` -- ganti nilai `name` di
-- situ saja utk ganti periode yang difilter.
--
-- Kolom output: jabatan | nama | unit | domain | level | id | parent_id
--   - domain: 'SETWAN' atau 'DEWAN', dibawa dari root masing-masing.
--   - level: kedalaman di tree, mulai 0 (root).
--   - parent_id: id baris pemimpin dari unit induk (utk baris pemimpin) atau
--     id baris pemimpin dari unit sendiri (utk baris staf); NULL utk root.
--
-- Urutan hasil: SETWAN dulu (seluruh pohonnya), baru DEWAN (Pimpinan DPRD lalu
-- tiap Fraksi sesuai sort_order), masing-masing diurutkan sesuai path tree.

WITH RECURSIVE target_period AS (
  SELECT id FROM periods WHERE name = '2024–2029'  -- ganti di sini saja utk ganti periode
),
filtered_units AS (
  SELECT o.id, o.parent_id, o.sort_order, ut.domain
  FROM org_units o JOIN unit_types ut ON ut.id = o.unit_type_id
  WHERE o.period_id IS NULL OR o.period_id = (SELECT id FROM target_period)
),
unit_tree AS (
  SELECT fu.id, fu.parent_id, fu.domain, 0 AS depth, ARRAY[fu.sort_order]::int[] AS path
  FROM filtered_units fu
  WHERE fu.parent_id IS NULL
  UNION ALL
  SELECT fu.id, fu.parent_id, t.domain, t.depth + 1, t.path || fu.sort_order::int
  FROM filtered_units fu JOIN unit_tree t ON fu.parent_id = t.id
),
ranked AS (
  SELECT a.*, p.name AS position_name, p.hierarchy_level,
         usr.name AS person_name, usr.title_prefix, usr.title_suffix,
         ROW_NUMBER() OVER (PARTITION BY a.org_unit_id ORDER BY p.hierarchy_level, a.sort_order) AS rn
  FROM assignments a
  JOIN unit_tree t ON t.id = a.org_unit_id   -- hanya assignment pada org_unit yg lolos filter periode
  JOIN positions p ON p.id = a.position_id
  LEFT JOIN users usr ON usr.id = a.person_id
  WHERE a.end_date IS NULL
    AND (usr.id IS NULL OR usr.status = 'AKTIF')
),
leaders AS (
  SELECT org_unit_id, id AS leader_id FROM ranked WHERE rn = 1
)
SELECT
  r.position_name AS jabatan,
  COALESCE(
    TRIM(COALESCE(r.title_prefix || ' ', '') || r.person_name) || COALESCE(', ' || r.title_suffix, ''),
    '(kosong)'
  ) AS nama,
  ou.name AS unit,
  t.domain,
  CASE WHEN r.rn = 1 THEN t.depth ELSE t.depth + 1 END AS level,
  r.id,
  CASE WHEN r.rn = 1 THEN parent_leader.leader_id ELSE own_leader.leader_id END AS parent_id
FROM ranked r
JOIN org_units ou ON ou.id = r.org_unit_id
JOIN unit_tree t ON t.id = ou.id
LEFT JOIN leaders own_leader ON own_leader.org_unit_id = ou.id
LEFT JOIN leaders parent_leader ON parent_leader.org_unit_id = ou.parent_id
ORDER BY
  CASE WHEN t.domain = 'SETWAN' THEN 0 ELSE 1 END,
  CASE WHEN r.rn = 1 THEN t.path ELSE t.path || ARRAY[-1, r.sort_order::int] END;
