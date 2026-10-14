-- Query: struktur organisasi SETWAN (Sekretariat DPRD -> Bagian -> Sub Bagian
-- -> staf) SAJA -- domain DEWAN tidak diikutkan. Turunan dari
-- docs/docsv2/query-struktur-organisasi-gabungan-setwan-dewan.sql, tinggal
-- dipersempit filter domain-nya ke SETWAN.
--
-- Filter periode tetap dilakukan BERDASARKAN ORG_UNIT (org_units.period_id),
-- bukan tanggal assignment -- unit_tree dibangun dari filtered_units yang
-- sudah disaring duluan, baru assignment di-join ke tree itu.
--
-- CATATAN PENTING -- utk domain SETWAN, filter periode ini SELALU TIDAK
-- BEREFEK (no-op): dicek langsung ke DB (eparlemenv2), seluruh 6 org_units
-- SETWAN punya period_id = NULL (staf kesekretariatan tidak terikat periode
-- DPRD -- beda dgn DEWAN yang period_id-nya terisi). Jadi CTE `target_period`
-- di bawah ini tetap ada demi konsistensi struktur dgn versi gabungan, TAPI
-- ganti isinya tidak akan mengubah hasil apapun periode yang dipilih. Lihat
-- docs/trd-database-eparlemen.md bagian "Keterikatan ke periode" utk alasan
-- desainnya.
--
-- `a.end_date IS NULL` di CTE `ranked` BUKAN filter periode -- itu cuma filter
-- "assignment yang masih berjalan sekarang". Jadi hasil query ini adalah
-- roster SETWAN aktif SAAT INI, bukan rekonstruksi historis. Kalau perlu
-- rekonstruksi historis siapa yang menjabat SETWAN pada rentang tanggal
-- tertentu, pakai pendekatan overlap tanggal di
-- docs/docsv2/query-struktur-setwan-periode-aktif.sql.
--
-- Kolom output: jabatan | nama | unit | level | id | parent_id
--   - level: kedalaman di tree, mulai 0 (root = Sekretariat DPRD).
--   - parent_id: id baris pemimpin dari unit induk (utk baris pemimpin) atau
--     id baris pemimpin dari unit sendiri (utk baris staf); NULL utk root.

WITH RECURSIVE target_period AS (
  SELECT id FROM periods WHERE name = '2024–2029'  -- no-op utk SETWAN, lihat catatan di atas
),
filtered_units AS (
  SELECT o.id, o.parent_id, o.sort_order
  FROM org_units o JOIN unit_types ut ON ut.id = o.unit_type_id
  WHERE ut.domain = 'SETWAN'
    AND (o.period_id IS NULL OR o.period_id = (SELECT id FROM target_period))
),
unit_tree AS (
  SELECT fu.id, fu.parent_id, 0 AS depth, ARRAY[fu.sort_order]::int[] AS path
  FROM filtered_units fu
  WHERE fu.parent_id IS NULL
  UNION ALL
  SELECT fu.id, fu.parent_id, t.depth + 1, t.path || fu.sort_order::int
  FROM filtered_units fu JOIN unit_tree t ON fu.parent_id = t.id
),
ranked AS (
  SELECT a.*, p.name AS position_name, p.hierarchy_level,
         usr.name AS person_name, usr.title_prefix, usr.title_suffix,
         ROW_NUMBER() OVER (PARTITION BY a.org_unit_id ORDER BY p.hierarchy_level, a.sort_order) AS rn
  FROM assignments a
  JOIN unit_tree t ON t.id = a.org_unit_id   -- hanya assignment pada org_unit yg lolos filter
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
  CASE WHEN r.rn = 1 THEN t.depth ELSE t.depth + 1 END AS level,
  r.id,
  CASE WHEN r.rn = 1 THEN parent_leader.leader_id ELSE own_leader.leader_id END AS parent_id
FROM ranked r
JOIN org_units ou ON ou.id = r.org_unit_id
JOIN unit_tree t ON t.id = ou.id
LEFT JOIN leaders own_leader ON own_leader.org_unit_id = ou.id
LEFT JOIN leaders parent_leader ON parent_leader.org_unit_id = ou.parent_id
ORDER BY
  CASE WHEN r.rn = 1 THEN t.path ELSE t.path || ARRAY[-1, r.sort_order::int] END;
