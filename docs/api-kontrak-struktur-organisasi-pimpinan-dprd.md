# Kontrak API — Struktur Organisasi Pimpinan DPRD & AKD

*Per 12 Oktober 2026*

## Ringkasan

Dokumen ini adalah kontrak API untuk endpoint yang menyajikan **struktur Pimpinan DPRD & Alat Kelengkapan DPRD (AKD)** — Ketua/Wakil Ketua DPRD, lalu Komisi A/B/C dan tiap Badan (Anggaran, Musyawarah, Pembentukan Peraturan Daerah, Kehormatan) beserta keanggotaannya — ke FE (dipakai oleh `master-alat-kelengkapan.html`).

Query sumber: `docs/query-struktur-pimpinan-dprd.sql`, dipersempit ke subtree `unit_types.code = 'PIMPINAN'` (Pimpinan DPRD + turunannya). Endpoint ini **tidak** menyertakan Fraksi maupun Sekretariat DPRD (SETWAN) — keduanya dilayani endpoint terpisah dengan bentuk response yang sama persis:
- Fraksi: root sendiri-sendiri per Fraksi (lihat varian penuh query, belum ada endpoint khusus).
- SETWAN: lihat `docs/api-kontrak-struktur-organisasi-setwan.md`.

Bentuk response adalah **flat list beranotasi `level` + `parentId`** (gaya adjacency list), bukan nested JSON — FE yang membangun tree untuk ditampilkan (lihat bagian [Cara FE Membangun Tree](#cara-fe-membangun-tree-dari-flat-list)). Alasan: satu bentuk response yang sama dipakai ulang untuk struktur DEWAN maupun SETWAN tanpa BE perlu tahu bagaimana FE merender nesting-nya.

## Endpoint

```
GET /api/v1/struktur-organisasi/pimpinan-dprd
```

## Autentikasi & Otorisasi

Butuh sesi login (mengikuti mekanisme auth yang sama dengan modul lain). Tidak ada pembatasan Role khusus di luar akses baca modul Alat Kelengkapan DPRD (lihat `role_menu_permissions`) — ini data referensi organisasi, bukan data sensitif per-Role.

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
      "id": "8d45b766-c734-5fd7-a405-a1e7b64947c3",
      "parentId": null,
      "level": 0,
      "unit": "Pimpinan DPRD",
      "jabatan": "Ketua",
      "nama": "EVIN SEPTA HARYANTO KAMIL, S.H."
    },
    {
      "id": "1560d441-1823-54ed-88ff-44d706203c86",
      "parentId": "8d45b766-c734-5fd7-a405-a1e7b64947c3",
      "level": 1,
      "unit": "Pimpinan DPRD",
      "jabatan": "Wakil Ketua",
      "nama": "BUSTANUL ARIFIN, S.T."
    },
    {
      "id": "05851614-b735-5bca-abfc-96614e05982f",
      "parentId": "8d45b766-c734-5fd7-a405-a1e7b64947c3",
      "level": 1,
      "unit": "Komisi A",
      "jabatan": "Ketua",
      "nama": "TITIEK UTAMI, S.Sos., M.M."
    },
    {
      "id": "7747bc9a-33bd-54ee-9a99-0d174477495f",
      "parentId": "05851614-b735-5bca-abfc-96614e05982f",
      "level": 2,
      "unit": "Komisi A",
      "jabatan": "Wakil Ketua",
      "nama": "ADI CHANDRA PAMUNGKAS, A.Md."
    }
  ]
}
```

### Skema Field

| Field | Tipe | Nullable | Keterangan |
|---|---|---|---|
| `id` | `string` (UUID) | tidak | `assignments.id` — ID unik baris penugasan ini. Dipakai FE sebagai `key` render dan sebagai target `parentId` baris lain. |
| `parentId` | `string` (UUID) | **ya** | `id` dari baris atasan langsung di tree. `null` hanya untuk baris root (Ketua DPRD, pucuk Pimpinan DPRD). |
| `level` | `integer` | tidak | Kedalaman di tree, mulai dari `0` (root). Murni bantuan render (indentasi) — FE tetap harus membangun tree dari `parentId`, jangan asumsikan `level` cukup buat urutan/nesting. |
| `unit` | `string` | tidak | Nama unit organisasi (`org_units.name`) tempat jabatan ini berada, mis. `"Komisi A"`, `"Badan Anggaran"`. |
| `jabatan` | `string` | tidak | Nama jabatan (`positions.name`), mis. `"Ketua"`, `"Wakil Ketua"`, `"Sekretaris Bukan Anggota"`, `"Anggota"`. |
| `nama` | `string` | **ya** | Nama pejabat pemegang jabatan ini, sudah termasuk gelar depan/belakang (format: `"<gelar_depan> NAMA, <gelar_belakang>"`). **`null` berarti jabatan ini lowong** — FE yang menentukan teks tampilan, API tidak mengirim string placeholder. |

### Unit yang Disertakan

Satu root (`level 0`): **Pimpinan DPRD**. Di `level 1` ke bawah, `unit` akan berisi salah satu dari: `Komisi A`, `Komisi B`, `Komisi C`, `Badan Anggaran`, `Badan Musyawarah`, `Badan Pembentukan Peraturan Daerah`, `Badan Kehormatan` — ketujuhnya menempel langsung ke Ketua DPRD (Ketua tiap unit = `level 1`, anggotanya = `level 2`). Lihat Bagian "Unit yang **Tidak** Disertakan" kalau butuh Fraksi.

### Urutan Baris

Response **sudah terurut pre-order** sesuai struktur asli (Ketua DPRD → Wakil Ketua DPRD → Ketua+anggota tiap Komisi/Badan secara berurutan). FE **tidak perlu** sort ulang — cukup iterasi sesuai urutan array saat membangun tree, atau render langsung sebagai indented list memakai `level` untuk indentasi tanpa membangun tree sama sekali kalau tidak butuh interaksi collapse/expand per-cabang.

## Cara FE Membangun Tree dari Flat List

Kalau FE butuh struktur nested (mis. untuk collapse/expand per Komisi/Badan, seperti di `master-alat-kelengkapan.html`), bangun dengan satu pass `O(n)` memakai map `id → node`:

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

Tidak ada kasus `404` — endpoint selalu mengembalikan `200` dengan `data: []` kalau memang tidak ada baris Pimpinan DPRD aktif (`assignments.end_date IS NULL`) ditemukan.

## Unit yang **Tidak** Disertakan

- **Fraksi** (7 unit, tiap Fraksi adalah root sendiri — `parentId: null` di `level 0`, bukan turunan Pimpinan DPRD) — belum punya endpoint khusus; kalau dibutuhkan FE, minta root query-nya diperluas ke `ut.code IN ('PIMPINAN','FRAKSI')` atau buat endpoint `GET /api/v1/struktur-organisasi/fraksi` terpisah mengikuti pola yang sama.
- **Sekretariat DPRD (SETWAN)** — sudah punya endpoint sendiri, lihat `docs/api-kontrak-struktur-organisasi-setwan.md`.

## Catatan Implementasi (untuk BE)

- Query sumber (`docs/query-struktur-pimpinan-dprd.sql`) memakai `TRIM(...)` tanpa `COALESCE` fallback ke string placeholder untuk kolom nama — pastikan implementasi BE tetap mengirim `nama: null` apa adanya saat `assignments.person_id IS NULL` (jabatan lowong), **jangan** di-hardcode jadi string seperti `"(kosong)"` di response API. Teks placeholder itu keputusan FE.
- Hanya baris `assignments.end_date IS NULL` (penugasan aktif) yang disertakan — penugasan yang sudah berakhir tidak ikut tanpa perlu parameter tambahan.
- "Pemimpin unit" (baris `level` yang menempel ke pemimpin unit induk, bukan ke anggota biasa) ditentukan dari `positions.hierarchy_level` TERKECIL di tiap `org_unit` — untuk domain DEWAN selalu `"Ketua"` (`hierarchy_level = 1`), jadi tidak perlu hardcode nama posisi di query/BE.
