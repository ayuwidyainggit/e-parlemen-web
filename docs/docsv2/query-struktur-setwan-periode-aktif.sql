-- Query: struktur organisasi SETWAN (Sekretariat DPRD -> Bagian -> Sub Bagian -> staf)
-- untuk SATU PERIODE TERTENTU, hanya menyertakan pegawai dengan
-- users.status aktif. Varian eksplorasi dari docs/query-struktur-setwan.sql
-- (yang menyajikan struktur SETWAN "saat ini", tanpa filter periode/status, dan
-- membekingi API live) -- jangan timpa file itu, ini query terpisah.
--
-- CATATAN SKEMA PENTING -- org_units.period_id SELALU NULL untuk domain SETWAN
-- (dicek langsung di DB: 0 dari 6 org_units SETWAN punya period_id terisi; hanya
-- org_units domain DEWAN yang terikat periode). Ini sesuai desain: staf
-- kesekretariatan tidak berganti seiring pergantian periode DPRD -- lihat
-- docs/trd-database-eparlemen.md bagian "Keterikatan ke periode".
--
-- Konsekuensinya, filter "periode tertentu" di sini TIDAK bisa pakai
-- org_units.period_id = :period_id (hasilnya akan selalu kosong untuk SETWAN).
-- Sebagai gantinya, filter dilakukan di assignments: ambil assignment yang
-- rentang start_date..end_date-nya OVERLAP dengan rentang periods.start_date..
-- end_date dari periode yang dipilih -- artinya "siapa yang menjabat di SETWAN
-- selama periode ini berjalan" (termasuk assignment yang masih berjalan terus
-- sampai sekarang, dan assignment yang sudah berakhir tapi pernah overlap).
--
-- Filter kedua: hanya baris dengan users.status = params.emp_status
-- (default 'AKTIF') yang ditampilkan; posisi lowong (person_id IS NULL) tetap
-- ikut tanpa terkena filter ini, ditampilkan sebagai "(kosong)".
--
-- CATATAN VERSI SKEMA -- di database eparlemen (v1) kolom ini bernama
-- `employment_status`; di eparlemenv2 kolomnya di-rename jadi `status` (query
-- ini sudah disesuaikan ke eparlemenv2).
--
-- Ganti nilai di CTE `params` saja untuk mengubah periode/status yang difilter.
--
-- Kolom output: jabatan | nama | unit | level | parent
--   - level: kedalaman di tree, mulai 0 (root = Sekretaris DPRD).
--   - parent: label "<jabatan> - <unit>" dari atasan langsung di tree (pemimpin
--     unit induk utk baris pemimpin, atau pemimpin unit sendiri utk baris staf);
--     NULL untuk root. Dipakai biar "parent" langsung terbaca manusia, bukan UUID.

WITH RECURSIVE params AS (
  SELECT
    '<GANTI-UUID-PERIODE>'::uuid AS period_id,  -- ganti dgn id periode yg diinginkan
    'AKTIF'                      AS emp_status  -- ganti kalau mau filter status lain
),
period AS (
  SELECT pr.start_date, pr.end_date
  FROM periods pr
  JOIN params ON pr.id = params.period_id
),
unit_tree AS (
  SELECT o.id, o.parent_id, 0 AS depth, ARRAY[o.sort_order]::int[] AS path
  FROM org_units o
  JOIN unit_types ut ON ut.id = o.unit_type_id
  WHERE o.parent_id IS NULL AND ut.domain = 'SETWAN'
  UNION ALL
  SELECT o.id, o.parent_id, t.depth + 1, t.path || o.sort_order::int
  FROM org_units o JOIN unit_tree t ON o.parent_id = t.id
),
ranked AS (
  SELECT
    a.id, a.org_unit_id, a.sort_order,
    p.name AS position_name, p.hierarchy_level,
    usr.name AS person_name, usr.title_prefix, usr.title_suffix,
    ROW_NUMBER() OVER (PARTITION BY a.org_unit_id ORDER BY p.hierarchy_level, a.sort_order) AS rn
  FROM assignments a
  JOIN positions p ON p.id = a.position_id
  LEFT JOIN users usr ON usr.id = a.person_id
  CROSS JOIN period pe
  CROSS JOIN params
  WHERE (pe.end_date IS NULL OR a.start_date <= pe.end_date)   -- overlap kiri: mulai sebelum periode berakhir
    AND (a.end_date IS NULL OR a.end_date >= pe.start_date)    -- overlap kanan: belum berakhir sebelum periode mulai
    AND (usr.id IS NULL OR usr.status = params.emp_status)  -- filter status, lolos kalau lowong
),
leaders AS (
  SELECT
    l.org_unit_id,
    l.position_name,
    ou2.name AS unit_name
  FROM ranked l
  JOIN org_units ou2 ON ou2.id = l.org_unit_id
  WHERE l.rn = 1
)
SELECT
  r.position_name AS jabatan,
  COALESCE(
    TRIM(COALESCE(r.title_prefix || ' ', '') || r.person_name) || COALESCE(', ' || r.title_suffix, ''),
    '(kosong)'
  ) AS nama,
  ou.name AS unit,
  CASE WHEN r.rn = 1 THEN t.depth ELSE t.depth + 1 END AS level,
  CASE
    WHEN r.rn = 1 THEN parent_leader.position_name || ' - ' || parent_leader.unit_name
    ELSE own_leader.position_name || ' - ' || own_leader.unit_name
  END AS parent
FROM ranked r
JOIN org_units ou ON ou.id = r.org_unit_id
JOIN unit_tree t ON t.id = ou.id
LEFT JOIN leaders own_leader ON own_leader.org_unit_id = ou.id
LEFT JOIN leaders parent_leader ON parent_leader.org_unit_id = ou.parent_id
ORDER BY
  CASE WHEN r.rn = 1 THEN t.path ELSE t.path || ARRAY[-1, r.sort_order::int] END;
