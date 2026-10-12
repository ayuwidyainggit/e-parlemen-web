-- Query: hierarki struktur organisasi SETWAN (Sekretariat DPRD -> Bagian -> Sub Bagian -> staf)
-- direkonstruksi dari org_units/positions/assignments yang sudah ada -- tidak ada kolom
-- baru di skema. Sama logikanya dgn docs/query-struktur-pimpinan-dprd.sql, hanya root
-- recursive CTE dibatasi ke org_units dgn unit_types.domain = 'SETWAN' (jadi DEWAN -
-- Pimpinan/Komisi/AKD/Fraksi - tidak ikut sama sekali).
--
-- Root = org_units dengan parent_id IS NULL DAN unit_types.domain = 'SETWAN'
-- (satu-satunya: "Sekretariat DPRD", level 0).
--
-- Aturan level & parent_id:
--   - Tiap org_unit punya satu "pemimpin" = assignment dgn positions.hierarchy_level
--     TERKECIL di unit itu (Sekretaris DPRD/Kepala Bagian/Kepala Sub Bagian -- otomatis,
--     tidak hardcode nama posisi).
--   - Baris pemimpin suatu unit menempel ke pemimpin unit INDUKnya (root: level 0,
--     parent_id NULL).
--   - Baris lain (staf unit itu) menempel ke pemimpin unit itu sendiri, satu level
--     lebih dalam.
--   - Posisi lowong (assignments.person_id IS NULL) ditampilkan sebagai "(kosong)".
--   - Kolom `id` yang ditampilkan adalah assignments.id.
--   - Urutan baris direkonstruksi lewat materialized path (gabungan org_units.sort_order
--     + assignments.sort_order) supaya persis pre-order seperti struktur aslinya.

WITH RECURSIVE unit_tree AS (
  SELECT o.id, o.parent_id, 0 AS depth, ARRAY[o.sort_order]::int[] AS path
  FROM org_units o JOIN unit_types ut ON ut.id = o.unit_type_id
  WHERE o.parent_id IS NULL AND ut.domain = 'SETWAN'
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


# Kontrak API — Struktur Organisasi SETWAN

*Per 11 Oktober 2026*

## Ringkasan

Dokumen ini adalah kontrak API untuk endpoint yang menyajikan **struktur organisasi Sekretariat DPRD (SETWAN)** — Sekretariat DPRD → Bagian → Sub Bagian → staf — ke FE (dipakai oleh `struktur-organisasi.html`, menggantikan data statis `struktur-organisasi-data.js`).

Query sumber: `docs/query-struktur-setwan.sql`. Endpoint ini **hanya** mengembalikan unit dengan `unit_types.domain = 'SETWAN'` — data DEWAN (Pimpinan/Komisi/AKD/Fraksi) tidak ikut; itu dilayani endpoint terpisah dengan bentuk response yang sama persis (lihat `docs/query-struktur-pimpinan-dprd.sql`).

Bentuk response adalah **flat list beranotasi `level` + `parentId`** (gaya adjacency list), bukan nested JSON — FE yang membangun tree untuk ditampilkan (lihat bagian [Cara FE Membangun Tree](#cara-fe-membangun-tree-dari-flat-list)). Alasan: satu bentuk response yang sama bisa dipakai ulang untuk struktur DEWAN maupun SETWAN tanpa BE perlu tahu bagaimana FE merender nesting-nya.

## Endpoint

```
GET /api/v1/struktur-organisasi/setwan
```

## Autentikasi & Otorisasi

Butuh sesi login (mengikuti mekanisme auth yang sama dengan modul lain). Tidak ada pembatasan Role khusus di luar akses baca modul Struktur Organisasi (lihat `role_menu_permissions`) — ini data referensi organisasi, bukan data sensitif per-Role.

## Request

Tidak ada query parameter wajib.

| Parameter | Tipe | Wajib | Default | Keterangan |
|---|---|---|---|---|
| — | — | — | — | Endpoint ini tidak menerima parameter saat ini. |

## Response — 200 OK

```json
{
  "data": [
    {
      "id": "b32890fd-fdc8-536e-b3d5-d9e1f504feec",
      "parentId": null,
      "level": 0,
      "unit": "Sekretariat DPRD",
      "jabatan": "Sekretaris DPRD",
      "nama": "INDAH DWIANTARI, S.Sos."
    },
    {
      "id": "7b825753-ea1e-508c-8324-0790dcd738ae",
      "parentId": "b32890fd-fdc8-536e-b3d5-d9e1f504feec",
      "level": 1,
      "unit": "Bagian Umum",
      "jabatan": "Kepala Bagian",
      "nama": "TRI WINARNO, S.E."
    },
    {
      "id": "7dc0a107-3461-5e29-b339-a72bb778ee4d",
      "parentId": "7b825753-ea1e-508c-8324-0790dcd738ae",
      "level": 2,
      "unit": "Sub Bagian Rumah Tangga dan Perlengkapan",
      "jabatan": "Kepala Sub Bagian",
      "nama": "HERY PURWOKO, S.E."
    },
    {
      "id": "0b07b6d2-c7c8-5c1a-8198-1437c3147528",
      "parentId": "7dc0a107-3461-5e29-b339-a72bb778ee4d",
      "level": 3,
      "unit": "Sub Bagian Rumah Tangga dan Perlengkapan",
      "jabatan": "Penelaah Teknis Kebijakan",
      "nama": null
    }
  ]
}
```

### Skema Field

| Field | Tipe | Nullable | Keterangan |
|---|---|---|---|
| `id` | `string` (UUID) | tidak | `assignments.id` — ID unik baris penugasan ini. Dipakai FE sebagai `key` render dan sebagai target `parentId` baris lain. |
| `parentId` | `string` (UUID) | **ya** | `id` dari baris atasan langsung di tree. `null` hanya untuk baris root (pucuk Sekretariat DPRD). |
| `level` | `integer` | tidak | Kedalaman di tree, mulai dari `0` (root). Murni bantuan render (indentasi) — FE tetap harus membangun tree dari `parentId`, jangan asumsikan `level` cukup buat urutan/nesting. |
| `unit` | `string` | tidak | Nama unit organisasi (`org_units.name`) tempat jabatan ini berada, mis. `"Bagian Umum"`. |
| `jabatan` | `string` | tidak | Nama jabatan (`positions.name`), mis. `"Kepala Bagian"`. |
| `nama` | `string` | **ya** | Nama pejabat pemegang jabatan ini, sudah termasuk gelar depan/belakang (format: `"<gelar_depan> NAMA, <gelar_belakang>"`). **`null` berarti jabatan ini lowong** — FE yang menentukan teks tampilan (mis. render sebagai `"(kosong)"` atau abu-abu/italic), API tidak mengirim string placeholder. |

### Urutan Baris

Response **sudah terurut pre-order** sesuai struktur asli (pemimpin unit → staf/anggota unit itu → tiap unit anak, berurutan). FE **tidak perlu** sort ulang — cukup iterasi sesuai urutan array saat membangun tree, atau render langsung sebagai indented list memakai `level` untuk indentasi tanpa membangun tree sama sekali kalau tidak butuh interaksi collapse/expand per-cabang.

## Cara FE Membangun Tree dari Flat List

Kalau FE butuh struktur nested (mis. untuk collapse/expand), bangun dengan satu pass `O(n)` memakai map `id → node`:

```js
function buildTree(rows) {
  const byId = new Map(rows.map(r => [r.id, { ...r, children: [] }]));
  const roots = [];
  for (const node of byId.values()) {
    if (node.parentId === null) {
      roots.push(node);
    } else {
      byId.get(node.parentId).children.push(node);
    }
  }
  return roots; // array of root nodes, tiap root punya anak di .children (urutan sudah benar)
}
```

Karena response sudah urut pre-order, `children` di setiap node otomatis sudah dalam urutan tampil yang benar — tidak perlu sort tambahan.

## Response Error

| Status | Kapan | Body |
|---|---|---|
| `401 Unauthorized` | Tidak ada sesi login / token kedaluwarsa | `{ "error": "UNAUTHENTICATED" }` |
| `500 Internal Server Error` | Kegagalan query di BE | `{ "error": "INTERNAL_ERROR" }` |

Tidak ada kasus `404` — endpoint selalu mengembalikan `200` dengan `data: []` kalau memang tidak ada baris SETWAN aktif (`assignments.end_date IS NULL`) ditemukan.

## Catatan Implementasi (untuk BE)

- Query sumber (`docs/query-struktur-setwan.sql`) memakai `COALESCE(..., '(kosong)')` untuk kolom `nama` — itu cocok untuk eksplorasi SQL langsung, **tapi untuk endpoint ini BE harus mengirim `nama: null` apa adanya** (hapus `COALESCE` pembungkus, biarkan `NULL` lolos ke JSON), supaya teks placeholder jadi keputusan FE, bukan di-hardcode BE.
- Hanya baris `assignments.end_date IS NULL` (penugasan aktif) yang disertakan — penugasan yang sudah berakhir tidak ikut tanpa perlu parameter tambahan.
