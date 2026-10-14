-- Query: struktur organisasi SETWAN (Sekretariat DPRD -> Bagian -> Sub Bagian -> staf)
-- DIFILTER PER PERIODE, lewat kolom org_units.period_id (sama kolom yang sudah
-- dipakai org_units domain DEWAN -- Pimpinan/Komisi/AKD/Fraksi).
--
-- STATUS DATA (cek 14 Okt 2026, lalu di-update lagi setelah
-- docs/insert-data-periode-2019-2024.sql dijalankan):
--   SELECT ut.domain, count(*), count(ou.period_id) FROM org_units ou
--   JOIN unit_types ut ON ut.id = ou.unit_type_id GROUP BY ut.domain;
--     DEWAN  -> total 14, with_period 14 (semua terikat periode, cuma periode AKTIF
--               skrg -- belum ada struktur DEWAN utk periode nonaktif)
--     SETWAN -> total 12, with_period 12 (6 utk periode 2024-2029/aktif, 6 utk
--               periode 2019-2024/nonaktif dari insert di atas) -- SUDAH di-tag
--               per periode, bukan NULL lagi.
--
-- BUG YANG SUDAH DIPERBAIKI (14 Okt 2026): saat $1 diisi periode NONAKTIF yang
-- org_units-nya SUDAH ADA (mis. 2019-2024), Varian A sebelumnya tetap
-- mengembalikan 0 baris. Sebabnya BUKAN di unit_tree/org_units -- CTE
-- "ranked" lama filter `a.end_date IS NULL` ("siapa yang AKTIF SEKARANG"),
-- dan assignment milik periode nonaktif SELALU punya end_date terisi
-- (ditutup/historis), jadi otomatis ter-exclude meski org_unit & assignment-
-- nya ada. Diperbaiki dgn CTE "target_period": kalau $1 menunjuk periode yg
-- ADA di tabel periods, filter ranked diganti jadi overlap tanggal
-- assignment thd rentang periode itu (bukan cuma end_date IS NULL); kalau $1
-- NULL (org_unit tidak terikat periode apa pun), filter fallback ke
-- end_date IS NULL seperti semula (tidak ada regresi utk kondisi lama).
--
-- Parameter:
--   $1 = UUID periode yang mau dilihat (periods.id), ATAU NULL untuk mengambil
--        unit yang belum/tidak di-tag periode (period_id IS NULL).
--
-- Aturan level & parent_id -- sama seperti docs/query-struktur-setwan.sql:
--   - Tiap org_unit punya satu "pemimpin" = assignment dgn positions.hierarchy_level
--     TERKECIL di unit itu (Sekretaris DPRD/Kepala Bagian/Kepala Sub Bagian).
--   - Baris pemimpin suatu unit menempel ke pemimpin unit INDUKnya (root: level 0).
--   - Baris lain (staf unit itu) menempel ke pemimpin unit itu sendiri, satu level
--     lebih dalam.
--   - Posisi lowong (assignments.person_id IS NULL) ditampilkan sebagai "(kosong)".
--   - Urutan baris direkonstruksi lewat materialized path (org_units.sort_order +
--     assignments.sort_order) supaya pre-order seperti struktur asli.

-- ============================================================================
-- VARIAN A -- filter per periode via parameter $1 (UUID periods.id, atau NULL),
-- PERIOD-AWARE (lihat "BUG YANG SUDAH DIPERBAIKI" di atas)
-- ============================================================================
WITH RECURSIVE
target_period AS (
  SELECT start_date, end_date FROM periods WHERE id = $1::uuid
),
unit_tree AS (
  SELECT o.id, o.parent_id, o.period_id, 0 AS depth, ARRAY[o.sort_order]::int[] AS path
  FROM org_units o
  JOIN unit_types ut ON ut.id = o.unit_type_id
  WHERE o.parent_id IS NULL
    AND ut.domain = 'SETWAN'
    AND o.period_id IS NOT DISTINCT FROM $1::uuid
  UNION ALL
  SELECT o.id, o.parent_id, o.period_id, t.depth + 1, t.path || o.sort_order::int
  FROM org_units o
  JOIN unit_tree t ON o.parent_id = t.id
),
ranked AS (
  SELECT a.*, p.name AS position_name, p.hierarchy_level,
         ROW_NUMBER() OVER (PARTITION BY a.org_unit_id ORDER BY p.hierarchy_level, a.sort_order) AS rn
  FROM assignments a
  JOIN positions p ON p.id = a.position_id
  LEFT JOIN target_period tp ON true
  WHERE
    CASE
      WHEN tp.start_date IS NOT NULL THEN
        -- $1 menunjuk periode yang ADA -- assignment ikut kalau overlap dgn
        -- rentang tanggal periode itu (historis maupun masih berjalan).
        COALESCE(a.start_date, '-infinity'::date) <= tp.end_date
        AND (a.end_date IS NULL OR a.end_date >= tp.start_date)
      ELSE
        -- $1 NULL / periode tidak ditemukan -- fallback perilaku lama:
        -- "siapa yang aktif sekarang" (org_unit tidak terikat periode apa pun).
        a.end_date IS NULL
    END
),
leaders AS (
  SELECT org_unit_id, id AS leader_id FROM ranked WHERE rn = 1
)
SELECT
  per.id AS periode_id,
  per.name AS periode_nama,
  per.start_date AS periode_mulai,
  per.end_date AS periode_selesai,
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
LEFT JOIN periods per ON per.id = ou.period_id
LEFT JOIN users usr ON usr.id = r.person_id
LEFT JOIN leaders own_leader ON own_leader.org_unit_id = ou.id
LEFT JOIN leaders parent_leader ON parent_leader.org_unit_id = ou.parent_id
ORDER BY
  CASE WHEN r.rn = 1 THEN t.path ELSE t.path || ARRAY[-1, r.sort_order::int] END;

-- ============================================================================
-- VARIAN B -- literal, TANPA parameter $1 -- tinggal copy-paste & jalankan.
-- Dua blok di bawah identik dgn Varian A (termasuk fix period-aware di CTE
-- "target_period"/"ranked"), bedanya cuma UUID periode sudah ditulis literal
-- (bukan $1). B1 (versi lama "semua org_units SETWAN period_id = NULL") sudah
-- DIHAPUS -- sejak docs/insert-data-periode-2019-2024.sql dijalankan, SEMUA
-- org_units SETWAN sudah punya period_id (lihat "STATUS DATA" di atas),
-- jadi kondisi lama itu tidak lagi merepresentasikan data yang ada.
-- ============================================================================

-- B1) Periode 2024-2029 / AKTIF (periods.id = 'd0eefc99-e99f-5ba3-a818-6d5555d829f9')
WITH RECURSIVE
target_period AS (
  SELECT start_date, end_date FROM periods WHERE id = 'd0eefc99-e99f-5ba3-a818-6d5555d829f9'::uuid
),
unit_tree AS (
  SELECT o.id, o.parent_id, o.period_id, 0 AS depth, ARRAY[o.sort_order]::int[] AS path
  FROM org_units o
  JOIN unit_types ut ON ut.id = o.unit_type_id
  WHERE o.parent_id IS NULL
    AND ut.domain = 'SETWAN'
    AND o.period_id = 'd0eefc99-e99f-5ba3-a818-6d5555d829f9'::uuid
  UNION ALL
  SELECT o.id, o.parent_id, o.period_id, t.depth + 1, t.path || o.sort_order::int
  FROM org_units o
  JOIN unit_tree t ON o.parent_id = t.id
),
ranked AS (
  SELECT a.*, p.name AS position_name, p.hierarchy_level,
         ROW_NUMBER() OVER (PARTITION BY a.org_unit_id ORDER BY p.hierarchy_level, a.sort_order) AS rn
  FROM assignments a
  JOIN positions p ON p.id = a.position_id
  LEFT JOIN target_period tp ON true
  WHERE
    CASE
      WHEN tp.start_date IS NOT NULL THEN
        COALESCE(a.start_date, '-infinity'::date) <= tp.end_date
        AND (a.end_date IS NULL OR a.end_date >= tp.start_date)
      ELSE
        a.end_date IS NULL
    END
),
leaders AS (
  SELECT org_unit_id, id AS leader_id FROM ranked WHERE rn = 1
)
SELECT
  per.id AS periode_id,
  per.name AS periode_nama,
  per.start_date AS periode_mulai,
  per.end_date AS periode_selesai,
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
LEFT JOIN periods per ON per.id = ou.period_id
LEFT JOIN users usr ON usr.id = r.person_id
LEFT JOIN leaders own_leader ON own_leader.org_unit_id = ou.id
LEFT JOIN leaders parent_leader ON parent_leader.org_unit_id = ou.parent_id
ORDER BY
  CASE WHEN r.rn = 1 THEN t.path ELSE t.path || ARRAY[-1, r.sort_order::int] END;

-- B2) Periode 2019-2024 / NONAKTIF (periods.id = 'd0eefc99-e99f-5ba3-a818-6d5555d829f8')
-- -- sebelum fix period-aware di atas, blok ini SELALU 0 baris walau
-- -- org_units & assignments-nya sudah ada (lihat "BUG YANG SUDAH DIPERBAIKI").
WITH RECURSIVE
target_period AS (
  SELECT start_date, end_date FROM periods WHERE id = 'd0eefc99-e99f-5ba3-a818-6d5555d829f8'::uuid
),
unit_tree AS (
  SELECT o.id, o.parent_id, o.period_id, 0 AS depth, ARRAY[o.sort_order]::int[] AS path
  FROM org_units o
  JOIN unit_types ut ON ut.id = o.unit_type_id
  WHERE o.parent_id IS NULL
    AND ut.domain = 'SETWAN'
    AND o.period_id = 'd0eefc99-e99f-5ba3-a818-6d5555d829f8'::uuid
  UNION ALL
  SELECT o.id, o.parent_id, o.period_id, t.depth + 1, t.path || o.sort_order::int
  FROM org_units o
  JOIN unit_tree t ON o.parent_id = t.id
),
ranked AS (
  SELECT a.*, p.name AS position_name, p.hierarchy_level,
         ROW_NUMBER() OVER (PARTITION BY a.org_unit_id ORDER BY p.hierarchy_level, a.sort_order) AS rn
  FROM assignments a
  JOIN positions p ON p.id = a.position_id
  LEFT JOIN target_period tp ON true
  WHERE
    CASE
      WHEN tp.start_date IS NOT NULL THEN
        COALESCE(a.start_date, '-infinity'::date) <= tp.end_date
        AND (a.end_date IS NULL OR a.end_date >= tp.start_date)
      ELSE
        a.end_date IS NULL
    END
),
leaders AS (
  SELECT org_unit_id, id AS leader_id FROM ranked WHERE rn = 1
)
SELECT
  per.id AS periode_id,
  per.name AS periode_nama,
  per.start_date AS periode_mulai,
  per.end_date AS periode_selesai,
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
LEFT JOIN periods per ON per.id = ou.period_id
LEFT JOIN users usr ON usr.id = r.person_id
LEFT JOIN leaders own_leader ON own_leader.org_unit_id = ou.id
LEFT JOIN leaders parent_leader ON parent_leader.org_unit_id = ou.parent_id
ORDER BY
  CASE WHEN r.rn = 1 THEN t.path ELSE t.path || ARRAY[-1, r.sort_order::int] END;
