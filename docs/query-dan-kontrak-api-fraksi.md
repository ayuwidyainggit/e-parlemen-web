# Query & Kontrak API — Data Fraksi

*Per 12 Oktober 2026*

## 1. Ringkasan

Dokumen ini berisi **query SQL** dan **kontrak API** untuk menyajikan data **Fraksi** DPRD: kode, nama, partai pengusung, periode DPRD yang berlaku, daftar anggota (NIP + nama — satu Fraksi bisa punya banyak anggota), dan kapan datanya terakhir diperbaharui.

Sumber data: `org_units` (baris dengan `unit_types.code = 'FRAKSI'`) di-join ke `parties` (partai), `periods` (periode DPRD), dan `assignments` + `users` (anggota aktif di Fraksi tersebut). "Anggota" di sini berarti **semua orang** yang punya penugasan aktif di Fraksi itu — termasuk Ketua/Wakil Ketua/Sekretaris Fraksi, bukan cuma yang `positions.name = 'Anggota'` secara literal (konsisten dgn cara FE menyebut daftar orang di satu unit sbg "Anggota" di halaman-halaman lain, mis. `master-alat-kelengkapan.html`).

## 2. Query SQL

```sql
SELECT
  ou.code AS kode_fraksi,
  ou.name AS nama_fraksi,
  pt.name AS partai,
  pr.name AS periode_dprd,
  COALESCE(
    json_agg(
      json_build_object(
        'nip', COALESCE(u.employee_number_nip, u.member_code),
        'nama', TRIM(COALESCE(u.title_prefix || ' ', '') || u.name) || COALESCE(', ' || u.title_suffix, '')
      ) ORDER BY pos.hierarchy_level, a.sort_order
    ) FILTER (WHERE a.id IS NOT NULL),
    '[]'::json
  ) AS anggota,
  ou.updated_at AS diperbaharui
FROM org_units ou
JOIN unit_types ut ON ut.id = ou.unit_type_id
LEFT JOIN parties pt ON pt.id = ou.party_id
LEFT JOIN periods pr ON pr.id = ou.period_id
LEFT JOIN assignments a ON a.org_unit_id = ou.id AND a.end_date IS NULL
LEFT JOIN positions pos ON pos.id = a.position_id
LEFT JOIN users u ON u.id = a.person_id
WHERE ut.code = 'FRAKSI'
GROUP BY ou.id, ou.code, ou.name, pt.name, pr.name, ou.updated_at
ORDER BY ou.sort_order;
```

Sudah diuji langsung ke database `eparlemen` — menghasilkan 6 baris Fraksi (PDI Perjuangan, Golkar, Kebangkitan Bangsa, PKS, Demokrat, Gerindra), masing-masing dengan anggota lengkap.

### Catatan Teknis Query

- **`LEFT JOIN assignments/positions/users`** (bukan `JOIN` biasa) + **`FILTER (WHERE a.id IS NOT NULL)`** + **`COALESCE(..., '[]'::json)`** — pola yang sama dengan `docs/api-kontrak-roster-pegawai.md`: kalau suatu Fraksi kebetulan tidak punya satu pun anggota aktif, Fraksi itu tetap muncul 1 baris dengan `anggota: []`, bukan hilang dari hasil atau menghasilkan array berisi elemen kosong.
- **Urutan anggota** ikut `positions.hierarchy_level` lalu `assignments.sort_order` sebagai tie-breaker (Ketua → Wakil Ketua → Sekretaris → Anggota, dan di antara sesama "Anggota" ikut urutan `sort_order` supaya deterministik, bukan urutan JOIN yang tidak terjamin stabil).
- **`nip`** memakai `COALESCE(employee_number_nip, member_code)` — anggota Fraksi selalu `person_type = 'DEWAN'`, jadi yang selalu terisi adalah `member_code` (format `DPRD-AGT-00xx`); `employee_number_nip` disertakan murni untuk konsistensi kalau suatu saat skema berubah.
- **`nama`** sudah termasuk gelar depan/belakang (`title_prefix`/`title_suffix`), format `"<gelar_depan> NAMA, <gelar_belakang>"` — konsisten dgn `docs/query-struktur-pimpinan-dprd.sql`.
- `partai`/`periode_dprd` pakai `LEFT JOIN` (bukan `JOIN`) supaya Fraksi yang (secara data invalid) belum punya `party_id`/`period_id` terisi tetap tampil, bukan hilang — walau secara aturan bisnis (`ck_users_type_rules` di tabel `users` + konvensi data saat ini) kedua kolom itu praktiknya selalu terisi untuk Fraksi.

## 3. Kontrak API

### Endpoint

```
GET /api/v1/fraksi
```

### Autentikasi & Otorisasi

Butuh sesi login. Tidak ada pembatasan Role khusus di luar akses baca modul Fraksi (lihat `role_menu_permissions`) — data referensi organisasi, bukan data sensitif per-Role.

### Request

| Parameter | Tipe | Wajib | Default | Keterangan |
|---|---|---|---|---|
| `periodeId` | `string` (UUID) | tidak | — (semua periode) | Filter Fraksi berdasarkan periode DPRD (`periods.id`). Exact match. |

### Response — 200 OK

```json
{
  "data": [
    {
      "kodeFraksi": "FRAKSI-PDIP",
      "namaFraksi": "Fraksi PDI Perjuangan",
      "partai": "Partai Demokrasi Indonesia Perjuangan",
      "periodeDprd": "2024–2029",
      "anggota": [
        { "nip": "DPRD-AGT-0001", "nama": "NARISQA" },
        { "nip": "DPRD-AGT-0002", "nama": "ATANG KUSTIONO, S.T." },
        { "nip": "DPRD-AGT-0003", "nama": "SLAMET BAMBANG SULISTYO, S.Sos., M.M." }
      ],
      "diperbaharui": "2026-10-08T16:19:51.662Z"
    }
  ]
}
```

### Skema Field

| Field | Tipe | Nullable | Keterangan |
|---|---|---|---|
| `kodeFraksi` | `string` | tidak | `org_units.code`, mis. `"FRAKSI-PDIP"`. |
| `namaFraksi` | `string` | tidak | `org_units.name`, mis. `"Fraksi PDI Perjuangan"`. |
| `partai` | `string` | **ya** | `parties.name`. `null` kalau Fraksi belum punya `party_id` (seharusnya tidak terjadi di data valid — lihat Catatan Teknis Query). |
| `periodeDprd` | `string` | **ya** | `periods.name`, mis. `"2024–2029"`. `null` dgn alasan yang sama dgn `partai`. |
| `anggota` | `array<{ nip, nama }>` | tidak (bisa array kosong) | Semua orang dengan penugasan aktif di Fraksi ini, apa pun jabatannya (Ketua/Wakil Ketua/Sekretaris/Anggota) — diurutkan dari jabatan paling senior. `nip` = kode anggota DEWAN (`DPRD-AGT-00xx`), `nama` sudah termasuk gelar. |
| `diperbaharui` | `string` (ISO 8601 timestamp) | tidak | `org_units.updated_at` — kapan **data Fraksi itu sendiri** terakhir diubah (nama/kode/partai/periode). **Bukan** kapan daftar anggotanya berubah — menambah/menghapus anggota adalah perubahan di `assignments`, tidak menyentuh baris `org_units`, jadi `diperbaharui` tidak ikut update saat keanggotaan berubah. Lihat Catatan Implementasi kalau FE butuh timestamp yang juga mencakup perubahan anggota. |

### Response Error

| Status | Kapan | Body |
|---|---|---|
| `400 Bad Request` | `periodeId` bukan UUID valid | `{ "error": "INVALID_PERIODE_ID" }` |
| `401 Unauthorized` | Tidak ada sesi login / token kedaluwarsa | `{ "error": "UNAUTHENTICATED" }` |
| `500 Internal Server Error` | Kegagalan query di BE | `{ "error": "INTERNAL_ERROR" }` |

Tidak ada kasus `404` — selalu `200` dengan `data: []` kalau tidak ada Fraksi yang cocok filter `periodeId`.

### Catatan Implementasi (untuk BE)

- Filter `periodeId` ditambahkan sebagai `AND ($1::uuid IS NULL OR ou.period_id = $1)` di `WHERE` — pakai parameter terikat, kirim `NULL` (bukan string kosong) kalau FE tidak memfilter.
- **`diperbaharui` saat ini hanya melacak perubahan baris `org_units`.** Kalau kebutuhan sebenarnya adalah "kapan Fraksi ini terakhir berubah dengan cara apa pun termasuk pergantian anggota", itu perlu `GREATEST(ou.updated_at, MAX(a.updated_at))` di level SQL (butuh `MAX()` krn `assignments` sudah di-`GROUP BY` per Fraksi) — ini keputusan yang perlu dikonfirmasi dulu ke yang minta, karena mengubah makna field `diperbaharui`, bukan cuma detail implementasi.
- Urutan baris `data` (antar-Fraksi) ikut `org_units.sort_order` — ini urutan yang disengaja (bukan efek samping NULL-ordering seperti di `docs/api-kontrak-roster-pegawai.md`), jadi aman diandalkan FE untuk tampilan default tanpa sort ulang.
