-- Query: hierarki struktur organisasi lengkap (Pimpinan DPRD + Komisi + AKD,
-- tiap Fraksi, dan Sekretariat DPRD) direkonstruksi dari org_units/positions/assignments
-- yang sudah ada -- tidak ada kolom baru yang ditambahkan ke skema.
--
-- Root = semua org_units dengan parent_id IS NULL (Pimpinan DPRD, tiap Fraksi,
-- Sekretariat DPRD -- masing-masing jadi pohon/root sendiri, level 0).
--
-- Aturan level & parent_id:
--   - Tiap org_unit punya satu "pemimpin" = assignment dgn positions.hierarchy_level
--     TERKECIL di unit itu (Ketua utk DEWAN; Sekretaris DPRD/Kepala Bagian/Kepala Sub
--     Bagian utk SETWAN -- otomatis, tidak hardcode nama posisi).
--   - Baris pemimpin suatu unit menempel ke pemimpin unit INDUKnya (root: level 0,
--     parent_id NULL).
--   - Baris lain (anggota/staf unit itu) menempel ke pemimpin unit itu sendiri,
--     satu level lebih dalam.
--   - Posisi lowong (assignments.person_id IS NULL) ditampilkan sebagai "(kosong)".
--   - Kolom `id` yang ditampilkan adalah assignments.id.
--   - Urutan baris direkonstruksi lewat materialized path (gabungan org_units.sort_order
--     + assignments.sort_order) supaya persis pre-order seperti struktur aslinya:
--     pemimpin unit -> anggota/staf unit itu -> tiap unit anak (berurutan).

WITH RECURSIVE unit_tree AS (
  SELECT id, parent_id, 0 AS depth, ARRAY[sort_order]::int[] AS path
  FROM org_units WHERE parent_id IS NULL
  UNION ALL
  SELECT o.id, o.parent_id, t.depth + 1, t.path || o.sort_order::int
  FROM org_units o JOIN unit_tree t ON o.parent_id = t.id
),
ranked AS (
  SELECT a.*, p.name AS position_name, p.hierarchy_level,
         ROW_NUMBER() OVER (PARTITION BY a.org_unit_id ORDER BY p.hierarchy_level, a.sort_order) AS rn
  FROM assignments a
  JOIN positions p ON p.id = a.position_id
  WHERE a.end_date IS NULL
),
leaders AS (
  SELECT org_unit_id, id AS leader_id FROM ranked WHERE rn = 1
)
SELECT
  r.position_name AS jabatan,
  COALESCE(
    TRIM(COALESCE(usr.title_prefix || ' ', '') || usr.name) || COALESCE(', ' || usr.title_suffix, ''),
    '(kosong)'
  ) AS nama,
  ou.name AS unit,
  CASE WHEN r.rn = 1 THEN t.depth ELSE t.depth + 1 END AS level,
  r.id,
  CASE WHEN r.rn = 1 THEN parent_leader.leader_id ELSE own_leader.leader_id END AS parent_id
FROM ranked r
JOIN org_units ou ON ou.id = r.org_unit_id
JOIN unit_tree t ON t.id = ou.id
LEFT JOIN users usr ON usr.id = r.person_id
LEFT JOIN leaders own_leader ON own_leader.org_unit_id = ou.id
LEFT JOIN leaders parent_leader ON parent_leader.org_unit_id = ou.parent_id
ORDER BY
  CASE WHEN r.rn = 1 THEN t.path ELSE t.path || ARRAY[-1, r.sort_order::int] END;
