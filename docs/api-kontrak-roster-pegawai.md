# Kontrak API — Roster Pegawai (DEWAN & SETWAN)

*Per 12 Oktober 2026*

## Ringkasan

Dokumen ini adalah kontrak API untuk endpoint yang menyajikan **roster pegawai**: satu baris per orang (DEWAN maupun SETWAN), berisi identitas dasar + **seluruh jabatan aktif yang dipegangnya sekaligus** — satu orang bisa punya lebih dari satu jabatan secara bersamaan (mis. Ketua di Fraksi, sekaligus Ketua di Komisi, sekaligus Anggota di Badan Anggaran).

Query sumber: `docs/query-roster-pegawai.sql`. Berbeda dari dua kontrak struktur organisasi sebelumnya (`docs/api-kontrak-struktur-organisasi-setwan.md`, `docs/api-kontrak-struktur-organisasi-pimpinan-dprd.md`) yang bentuknya flat-list-per-unit-organisasi, endpoint ini **person-centric** — satu baris response = satu orang, dengan jabatan-jabatannya digabung jadi satu array di dalamnya.

## Endpoint

```
GET /api/v1/pegawai/roster
```

## Autentikasi & Otorisasi

Butuh sesi login. Tidak ada pembatasan Role khusus di luar akses baca modul Pegawai (lihat `role_menu_permissions`).

## Request

| Parameter | Tipe | Wajib | Default | Keterangan |
|---|---|---|---|---|
| `personType` | `string` (`DEWAN` \| `SETWAN`) | tidak | — (semua) | Filter jenis pegawai. Kosongkan untuk mengembalikan keduanya. Exact match. |
| `namaPegawai` | `string` | tidak | — | Cari berdasarkan nama (`users.name`). Partial match, case-insensitive (`ILIKE '%...%'`). |
| `nip` | `string` | tidak | — | Cari berdasarkan NIP/kode anggota (kolom gabungan `nip` di Bagian Skema Field). Partial match, case-insensitive. |
| `partai` | `string` | tidak | — | Cari berdasarkan nama partai (`parties.name`). Partial match, case-insensitive. Pegawai SETWAN (`partai: null`) otomatis tidak pernah cocok dengan filter ini apa pun nilainya. |
| `jabatan` | `string` | tidak | — | Cari pegawai yang punya **minimal satu** penugasan aktif dengan nama jabatan (`positions.name`) cocok. Partial match, case-insensitive. Lihat catatan di [Semantik Filter `jabatan`](#semantik-filter-jabatan) — filter ini menentukan pegawai mana yang ikut, bukan menyaring isi array `jabatan` pegawai tersebut. |

Semua filter di atas bersifat **AND** satu sama lain kalau dikombinasikan (mis. `personType=DEWAN&partai=Golkar` → DEWAN yang partainya mengandung "Golkar").

**Pagination** (berlaku per-**orang**, bukan per-baris jabatan — lihat [Pagination Dihitung Setelah Agregasi](#pagination-dihitung-setelah-agregasi)):

| Parameter | Tipe | Wajib | Default | Keterangan |
|---|---|---|---|---|
| `page` | `integer` | tidak | `1` | Halaman ke berapa, mulai dari `1`. `page < 1` dianggap `1`. |
| `pageSize` | `integer` | tidak | `20` | Jumlah pegawai per halaman. Maks `100` — nilai di atas itu dipotong jadi `100`, bukan error. |

## Response — 200 OK

```json
{
  "data": [
    {
      "id": "...uuid users.id...",
      "namaPegawai": "NARISQA",
      "personType": "DEWAN",
      "nip": "DPRD-AGT-0001",
      "partai": "Partai Demokrasi Indonesia Perjuangan",
      "jabatan": [
        { "posisi": "Ketua", "unit": "Fraksi PDI Perjuangan" },
        { "posisi": "Ketua", "unit": "Komisi C" },
        { "posisi": "Anggota", "unit": "Badan Anggaran" }
      ]
    },
    {
      "id": "...uuid users.id...",
      "namaPegawai": "AGUS SANTOSO",
      "personType": "SETWAN",
      "nip": "197508052006041015",
      "partai": null,
      "jabatan": [
        { "posisi": "Operator Layanan Operasional", "unit": "Sub Bagian Rumah Tangga dan Perlengkapan" }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 52,
    "totalPages": 3
  }
}
```

### Skema Field

| Field | Tipe | Nullable | Keterangan |
|---|---|---|---|
| `id` | `string` (UUID) | tidak | `users.id`. |
| `namaPegawai` | `string` | tidak | `users.name`, **tanpa** gelar depan/belakang (beda dari endpoint struktur organisasi yang sudah menggabungkan gelar — di sini gelar sengaja dipisah, lihat Catatan Implementasi). |
| `personType` | `string` (`DEWAN` \| `SETWAN`) | tidak | |
| `nip` | `string` | tidak | `employee_number_nip` untuk SETWAN, `member_code` (format `DPRD-AGT-00xx`) untuk DEWAN — dua sumber kolom beda yang digabung jadi satu field tampilan, konsisten dengan konvensi yang sudah ada di `pegawai-data.js:14`. Selalu terisi (`ck_users_type_rules` menjamin salah satu kolom sumbernya wajib ada). |
| `partai` | `string` | **ya** | Nama partai (`parties.name`). **Selalu `null` untuk `personType: "SETWAN"`** (pegawai SETWAN tidak berafiliasi partai). |
| `jabatan` | `array<{ posisi, unit }>` | tidak (bisa array kosong) | Setiap elemen = satu penugasan aktif. `posisi` = `positions.name`, `unit` = `org_units.name`. Diurutkan menurut `positions.hierarchy_level` (1=Ketua/Sekretaris DPRD paling senior, makin besar makin junior) — **bukan** `org_units.sort_order`, jadi jabatan "Ketua" di unit apa pun selalu tampil duluan drpd "Anggota", berapa pun urutan unit-nya di struktur organisasi (lihat `docs/query-roster-pegawai.sql`). |

| `meta.page` | `integer` | tidak | Halaman yang sedang ditampilkan (hasil efektif setelah dibatasi min `1`). |
| `meta.pageSize` | `integer` | tidak | Ukuran halaman efektif (hasil setelah dibatasi maks `100`). |
| `meta.totalItems` | `integer` | tidak | Total **orang** yang cocok dgn semua filter (sebelum pagination diterapkan) — bukan total baris jabatan. |
| `meta.totalPages` | `integer` | tidak | `ceil(totalItems / pageSize)`. |

### Pagination Dihitung Setelah Agregasi

Query sumber (`docs/query-roster-pegawai.sql`) punya `JOIN assignments` **sebelum** `GROUP BY u.id` — satu orang bisa menyumbang banyak baris mentah (satu per jabatan) sebelum ter-group jadi satu baris per orang. **`LIMIT`/`OFFSET` tidak boleh ditempel langsung di query itu** — itu akan memotong di tengah hasil JOIN (baris jabatan), bukan di antara orang, sehingga satu orang bisa "terpotong" jabatannya atau `pageSize` malah menghasilkan jumlah orang yang tidak konsisten antar-request.

Terapkan `LIMIT`/`OFFSET` **di luar** hasil yang sudah ter-`GROUP BY`, mis. lewat CTE. Berikut versi lengkap yang sudah diuji jalan (termasuk semua filter opsional dan pagination, pakai parameter terikat `$1..$7` — bukan contoh/pseudocode):

```sql
WITH roster AS (
  SELECT
    u.id,
    u.name AS nama_pegawai,
    u.person_type,
    COALESCE(u.employee_number_nip, u.member_code) AS nip,
    pt.name AS partai,
    COALESCE(
      json_agg(
        json_build_object('posisi', pos.name, 'unit', ou.name)
        ORDER BY pos.hierarchy_level
      ) FILTER (WHERE a.id IS NOT NULL),
      '[]'::json
    ) AS jabatan
  FROM users u
  LEFT JOIN parties pt ON pt.id = u.party_id
  LEFT JOIN assignments a
    ON a.person_id = u.id
    AND a.end_date IS NULL
    AND EXISTS (                                                          -- lihat Filter Periode Aktif
      SELECT 1 FROM org_units ou2
      WHERE ou2.id = a.org_unit_id
        AND (ou2.period_id IS NULL OR ou2.period_id = (SELECT id FROM periods WHERE is_active))
    )
  LEFT JOIN positions pos ON pos.id = a.position_id
  LEFT JOIN org_units ou ON ou.id = a.org_unit_id
  WHERE ($1::varchar IS NULL OR u.person_type = $1)                       -- personType
    AND ($2::text IS NULL OR u.name ILIKE '%' || $2 || '%')               -- namaPegawai
    AND ($3::text IS NULL OR COALESCE(u.employee_number_nip, u.member_code) ILIKE '%' || $3 || '%')  -- nip
    AND ($4::text IS NULL OR pt.name ILIKE '%' || $4 || '%')              -- partai
    AND ($5::text IS NULL OR EXISTS (                                     -- jabatan (lihat Semantik Filter `jabatan`)
      SELECT 1 FROM assignments a2
      JOIN positions p2 ON p2.id = a2.position_id
      WHERE a2.person_id = u.id AND a2.end_date IS NULL
        AND p2.name ILIKE '%' || $5 || '%'
    ))
  GROUP BY u.id, u.name, u.person_type, u.employee_number_nip, u.member_code, pt.name
)
SELECT *, count(*) OVER() AS total_items
FROM roster
ORDER BY nama_pegawai
LIMIT $6 OFFSET $7;
```

Mapping parameter → query param HTTP: `$1`=`personType`, `$2`=`namaPegawai`, `$3`=`nip`, `$4`=`partai`, `$5`=`jabatan` (kirim `NULL` kalau parameter tidak dikirim user, **jangan** `''` — lihat Catatan Implementasi soal filter kosong), `$6`=`pageSize` (hasil clamp 1–100), `$7`=`(page - 1) * pageSize`.

`count(*) OVER()` menghitung total baris **setelah** filter tapi **sebelum** `LIMIT` — itu yang jadi `meta.totalItems`, dalam satu round-trip query (tidak perlu query `COUNT` terpisah).

### Mengapa `jabatan` Array of Objects, Bukan String Gabungan

Query eksplorasi di `docs/query-roster-pegawai.sql` memakai `string_agg(pos.name || ' - ' || ou.name, E'\n' ...)` — itu praktis untuk inspeksi SQL langsung di terminal, **tapi endpoint ini harus mengembalikan array of objects**, bukan string yang di-join dengan newline. Alasan: parsing string berdelimiter di FE itu rapuh (apa jadinya kalau nama unit suatu saat mengandung karakter `-` atau newline?) dan kehilangan struktur data (`posisi` vs `unit` jadi tidak bisa dipisah lagi tanpa parsing ulang). BE cukup `json_agg(json_build_object('posisi', pos.name, 'unit', ou.name) ORDER BY pos.hierarchy_level)` di level SQL (contoh lengkap di atas), atau bangun array-nya di application layer dari hasil JOIN biasa.

### Semantik Filter `jabatan`

**Filter `jabatan` menentukan pegawai mana yang ikut muncul di `data`, bukan menyaring isi array `jabatan` pegawai itu.** Kalau seorang DEWAN punya 3 jabatan aktif (Ketua Fraksi, Ketua Komisi C, Anggota Badan Anggaran) dan di-filter `jabatan=Ketua`, pegawai itu **tetap muncul dengan ketiga jabatannya lengkap** di array `jabatan` — bukan cuma dua yang mengandung kata "Ketua". Implementasinya pakai `EXISTS` sebagai syarat masuk (`$5` di query lengkap di atas), dipisah dari `json_agg` yang membentuk isi array.

Kalau yang dibutuhkan FE justru sebaliknya (hanya menampilkan jabatan yang cocok, menyembunyikan sisanya), itu kontrak yang berbeda — perlu dikonfirmasi dulu ke yang minta sebelum diimplementasikan, karena mengubah makna field `jabatan` di response.

### Orang Tanpa Penugasan Aktif

Query lengkap di atas sudah mendukung ini — pegawai yang belum/tidak lagi ditugaskan **tetap muncul** di `data` dengan `jabatan: []`, bukan hilang dari hasil. Dua bagian yang membuat itu terjadi:

1. **`LEFT JOIN assignments`/`positions`/`org_units`** (bukan `JOIN` biasa) — kalau diganti balik ke inner join, siapa pun yang tidak punya baris `assignments` aktif otomatis tidak ikut ter-`SELECT` sama sekali (hilang total dari `data`, bukan `jabatan: []`).
2. **`json_agg(...) FILTER (WHERE a.id IS NOT NULL)` dibungkus `COALESCE(..., '[]'::json)`** — kalau orangnya tidak punya baris `assignments` sama sekali, `LEFT JOIN` menghasilkan satu baris dengan `a.id IS NULL`; tanpa `FILTER`, `json_agg` akan memasukkan satu elemen `{"posisi": null, "unit": null}` ke array (bukan array kosong). `FILTER` membuang baris kosong itu dari agregasi, lalu `COALESCE` menangani kasus **semua** baris terbuang (jadi `json_agg` sendiri hasilnya SQL `NULL`, perlu dipaksa jadi `'[]'::json`).

Sudah diuji: pegawai yang kondisinya disimulasikan "tanpa penugasan aktif" tetap muncul 1 baris dengan `"jabatan": []`, bukan hilang atau `jabatan: null`. Catatan: `total_items`/`meta.totalItems` ikut berubah makna jadi "semua pegawai yang cocok filter identitas", **bukan lagi** "semua pegawai yang punya minimal 1 penugasan aktif" — kalau filter `jabatan` dikombinasikan, orang tanpa penugasan otomatis tidak lolos `EXISTS` (lihat Semantik Filter `jabatan`), jadi dua perilaku ini tetap konsisten satu sama lain.

### Filter Periode Aktif

**`assignments` tidak punya kolom `period_id` sendiri** — periode DPRD-nya nempel di `org_units.period_id`, dan itu **hanya diisi untuk unit domain DEWAN** (Pimpinan/Fraksi/Komisi/AKD); unit SETWAN (Bagian/Sekretariat/Sub Bagian) `period_id`-nya selalu `NULL` karena staf tidak terikat periode DPRD. Query sebelumnya hanya cek `a.end_date IS NULL`, **tidak pernah cek apakah unit tempat assignment itu masih di periode yang sedang aktif**.

Dengan data saat ini (cuma 1 baris di `periods`, `is_active = true`) ini tidak kelihatan sebagai bug. Tapi begitu periode baru dibuat (mis. `2029–2034`) dan assignment DEWAN periode lama tidak ditutup (`end_date` masih `NULL`), orang yang sama bisa muncul dengan jabatan dari **dua periode sekaligus** — salah.

Perbaikannya ada di kondisi `JOIN assignments` di atas: `EXISTS (... ou2.period_id IS NULL OR ou2.period_id = (SELECT id FROM periods WHERE is_active))`. Dua kondisinya:
- `ou2.period_id IS NULL` → unit SETWAN, selalu dianggap "aktif" (tidak terikat periode apa pun), tetap lolos tanpa dicek lebih jauh.
- `ou2.period_id = (SELECT id FROM periods WHERE is_active)` → unit DEWAN, hanya lolos kalau unit itu terikat ke periode yang **sedang** aktif.

**Sengaja ditaruh di kondisi `JOIN`, bukan `WHERE` di level akhir** — kalau ditaruh di `WHERE` akhir, berisiko ikut membuang baris orang yang memang tidak punya `assignments` sama sekali (merusak perilaku `jabatan: []` di atas). Dengan ditaruh di kondisi `JOIN`, assignment yang tidak lolos cek periode diperlakukan sama seperti "tidak ada assignment yang match" — pola `FILTER`+`COALESCE('[]')` yang sudah ada tetap jalan tanpa perlu diubah.

Sudah diuji: hasil `total_items` (52 orang) dan jumlah total baris jabatan (112) **identik** dengan sebelum perbaikan — jadi ini aman diterapkan sekarang (tidak mengubah hasil yang sudah ada), sekaligus menutup gap untuk periode mendatang.

## Response Error

| Status | Kapan | Body |
|---|---|---|
| `400 Bad Request` | `personType` diisi nilai selain `DEWAN`/`SETWAN` | `{ "error": "INVALID_PERSON_TYPE" }` |
| `400 Bad Request` | `page`/`pageSize` bukan angka positif (mis. `page=abc`, `page=-1`, `pageSize=0`) | `{ "error": "INVALID_PAGINATION" }` |
| `401 Unauthorized` | Tidak ada sesi login / token kedaluwarsa | `{ "error": "UNAUTHENTICATED" }` |
| `500 Internal Server Error` | Kegagalan query di BE | `{ "error": "INTERNAL_ERROR" }` |

Tidak ada kasus `404` — selalu `200` dengan `data: []` kalau memang tidak ada satu pun pegawai yang cocok dengan filter yang diberikan (pegawai tanpa penugasan aktif tetap dihitung "cocok" dan tetap muncul, lihat [Orang Tanpa Penugasan Aktif](#orang-tanpa-penugasan-aktif) — kecuali difilter `jabatan`, yang otomatis mengeluarkan mereka).

## Catatan Implementasi (untuk BE)

- `namaPegawai` di endpoint ini **tidak** digabung dengan `title_prefix`/`title_suffix` seperti di dua kontrak struktur organisasi sebelumnya — kirim ketiganya terpisah (`namaPegawai`, dan tambahkan `titlePrefix`/`titleSuffix` sebagai field opsional) kalau FE roster pegawai butuh menampilkan gelar lengkap, supaya FE bisa memformat sendiri sesuai konteks (tabel sempit vs kartu detail) tanpa parsing ulang string gabungan.
- Urutan baris `data` (antar-orang) ikut `ORDER BY u.member_code` di query sumber — ini cuma kebetulan membuat DEWAN tampil duluan (karena `member_code` NULL utk SETWAN, dan NULL diurutkan terakhir secara default di Postgres), **bukan pengurutan yang disengaja**. BE sebaiknya definisikan urutan eksplisit (mis. `ORDER BY name` atau `ORDER BY person_type, name`) daripada mengandalkan efek samping NULL-ordering ini.
- Filter `personType` (lihat Bagian Request) mengimplementasikan saran di komentar `query-roster-pegawai.sql` baris 14-15 ("Hapus filter WHERE person_type='DEWAN' kalau mau sertakan SETWAN juga") — jadikan parameter, jangan dua endpoint terpisah.
- `namaPegawai`, `nip`, `partai` di-filter **sebelum** `GROUP BY` (klausa `WHERE` biasa di level `users`/`parties`) — murni filter ILIKE, tidak ada subquery seperti filter `jabatan`. Selalu pakai parameter terikat (`$1`, `$2`, dst — bukan string concatenation manual) untuk menghindari SQL injection, khususnya karena ketiganya langsung dari input pengguna.
- Filter kosong (`""`) harus diperlakukan sama seperti parameter tidak dikirim (tidak memfilter apa-apa), bukan dicocokkan literal sebagai string kosong — hindari bug umum "search box dikosongkan tapi hasil jadi 0 baris".
