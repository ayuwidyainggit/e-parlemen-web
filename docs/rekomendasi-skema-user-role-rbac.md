# Rekomendasi Skema Tabel: User, Role & RBAC

*Per 9 Oktober 2026*

## Konteks

Database `eparlemen` (PostgreSQL, `localhost:5432`) saat ini sudah berisi 8 tabel untuk kebutuhan hirarki organisasi (`periods`, `parties`, `unit_types`, `org_units`, `positions`, `unit_type_positions`, `persons`, `assignments`) — sudah terisi 251 baris data riil (lihat `data/README.md`). Dokumen ini merekomendasikan skema tabel **lanjutan** untuk User (akun login), Role, dan RBAC (hak akses menu), supaya siap dipakai oleh fitur Akun Pengguna, RBAC, dan Create New Account yang sudah ada di prototipe frontend (`rbac-data.js`, `pengguna.html`, `pengguna-buat.html`, `master-rbac.html`).

**Temuan penting sebelum mendesain**: tabel `persons` yang sudah ada **sudah punya kolom `user_id` (uuid, belum ada FK)**, dan semua 8 tabel yang ada sudah konsisten punya kolom `created_by`/`updated_by` (uuid, belum ada FK) serta `created_at`/`updated_at`. Ini artinya skema yang ada **sudah dirancang mengantisipasi tabel `users`** — rekomendasi di bawah mengikuti arah itu, bukan membuat pola baru yang bersaing dengannya.

## Konvensi yang Sudah Dipakai di 8 Tabel Existing (wajib diikuti utk tabel baru)

Diambil langsung dari hasil `\d` tiap tabel di database `eparlemen`:

1. **PK selalu `uuid`**, bukan serial/bigint.
2. **Audit kolom di semua tabel**: `created_at`, `updated_at` (`timestamptz default now()`), `created_by`, `updated_by` (`uuid`, nullable, dimaksudkan FK ke `users(id)`).
3. **Enum via `varchar` + `CHECK`**, bukan tipe `ENUM` Postgres asli (lebih mudah di-ALTER tanpa migrasi tipe).
4. **Partial unique index untuk aturan "hanya satu yang aktif"** — contoh: `ux_periods_one_active` (`UNIQUE (is_active) WHERE is_active`), `ux_assignments_active_person_unit` (`UNIQUE (org_unit_id, person_id) WHERE end_date IS NULL`).
5. **Partial index untuk query yang hanya butuh baris aktif** — contoh: `ix_assignments_person ... WHERE end_date IS NULL`. Index jadi lebih kecil & query hot-path lebih cepat karena baris historis/nonaktif tidak ikut ter-index.
6. **Soft-delete/soft-deactivate** via `is_active` atau `end_date`, bukan `DELETE` fisik.
7. **Tidak ada self-referencing hierarchy kecuali memang perlu** — `org_units.parent_id` dipakai karena memang butuh pohon, tapi tabel lain flat.

## Rekomendasi: 5 Tabel Baru

**Catatan urutan eksekusi — ada ketergantungan melingkar antara `roles` dan `users`**: `users.role_id` wajib menunjuk ke `roles.id`, tapi `roles.created_by`/`updated_by` wajib menunjuk ke `users.id` juga — jadi `roles` tidak bisa dibuat penuh sebelum `users` ada, dan `users` tidak bisa dibuat sebelum `roles` ada. Cara memutusnya: buat `roles` dulu **tanpa** FK di `created_by`/`updated_by` (kolom `uuid` polos dulu), baru buat `users` (yang di sini aman karena `roles` sudah ada, dan `created_by`/`updated_by` di `users` cuma self-reference ke dirinya sendiri — itu valid dalam satu `CREATE TABLE`), lalu lengkapi FK `roles.created_by`/`updated_by` lewat `ALTER TABLE` setelah `users` ada. Karena itu urutan section di bawah mengikuti urutan eksekusi literal — **`roles` → `users` (+ `ALTER TABLE roles`) → `menus` → `role_menu_permissions` → `user_auth_tokens`** — bukan urutan di draf sebelumnya.

### 1. `roles`

```sql
CREATE TABLE roles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code            varchar(30)  NOT NULL,
  name            varchar(100) NOT NULL,
  can_access_web    boolean NOT NULL DEFAULT false,
  can_access_mobile boolean NOT NULL DEFAULT false,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid,  -- FK ke users(id) ditambahkan via ALTER TABLE di Bagian 2, setelah users dibuat
  updated_by      uuid,
  CONSTRAINT roles_code_key UNIQUE (code),
  CONSTRAINT ck_roles_has_platform CHECK (can_access_web OR can_access_mobile)
);
```

**Kenapa `can_access_web`/`can_access_mobile` (2 boolean), bukan kolom array `platform text[]`** seperti `akses: ['Web']` di `rbac-data.js` saat ini: boolean bisa langsung dipakai di `WHERE`/index btree biasa tanpa butuh GIN index, dan tetap mendukung kasus "akses keduanya" (kedua boolean `true`) persis seperti kebutuhan sekarang (Role Ketua & Administrator = Web, Anggota = Mobile).

### 2. `users`

```sql
CREATE TABLE users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id        uuid NOT NULL REFERENCES roles(id),
  password_hash  text,
  status         varchar(20) NOT NULL DEFAULT 'PENDING_ACTIVATION'
                   CHECK (status IN ('PENDING_ACTIVATION','ACTIVE','SUSPENDED','DEACTIVATED')),
  last_login_at  timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  created_by     uuid REFERENCES users(id),
  updated_by     uuid REFERENCES users(id)
);
CREATE INDEX ix_users_role ON users (role_id);

-- Sekarang users sudah ada, lengkapi FK roles.created_by/updated_by yang ditunda di Bagian 1
ALTER TABLE roles
  ADD CONSTRAINT roles_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id),
  ADD CONSTRAINT roles_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users(id);
```

**Keputusan desain paling penting di tabel ini — tidak ada kolom `person_id`.** `persons.user_id` yang sudah ada di database itulah satu-satunya penghubung Person ↔ Account (lihat bagian "Perubahan pada Tabel yang Sudah Ada" di bawah). Alasannya:

- Kalau ditambah `users.person_id` juga, jadinya dua kolom saling menunjuk (`persons.user_id` ↔ `users.person_id`) yang harus selalu disinkronkan — kalau salah satu update tapi yang lain lupa, data jadi tidak konsisten tanpa ada cara DB mendeteksinya otomatis.
- Alur "Create New Account" di FE (`pengguna-buat.html`) memang searah: pilih Pegawai dulu → baru buat akun. Jadi arah `persons → users` via `persons.user_id` sudah pas secara alur bisnis, dan sudah lebih dulu ada di skema — ikuti itu, jangan bikin jalur kedua.
- Di skala data ini (52 orang, akan ratusan paling banyak), reverse-lookup "akun ini punya siapa" lewat `SELECT * FROM persons WHERE user_id = ?` dengan unique index tetap O(log n) — tidak ada alasan performa untuk kolom kedua.

**Tidak ada kolom `email` di `users`.** `persons.email` sudah `UNIQUE` di database sekarang — dipakai juga sebagai email login, bukan didobel. Query login jadi: `users JOIN persons ON persons.user_id = users.id WHERE persons.email = $1`, keduanya sudah ter-index (`persons_email_key` unique index yang sudah ada, dan index baru di `persons.user_id` — lihat bawah).

**Token aktivasi/reset password TIDAK disimpan di `users`** — lihat tabel ke-5. Alasannya murni performa: `users` adalah tabel yang paling sering dibaca (tiap request yang butuh autentikasi/otorisasi), jadi barisnya sengaja dibuat sekecil mungkin. Kolom seperti token (text panjang, umur pendek, jarang dibaca bareng data login) lebih baik dipisah supaya tidak memperbesar row width tabel hot-path ini.

### 3. `menus`

Katalog menu per platform — padanan `WEB_MENU_CATALOG`/`MOBILE_MENU_CATALOG` di `rbac-data.js`. **Direvisi**: sidebar FE punya struktur parent/child sungguhan (mis. grup **Master Data** adalah parent dari child **Master Periode**, **Pegawai**, **Struktur Organisasi**, dst — lihat `<div class="snav-label">Master Data</div>` diikuti beberapa `<a class="snav-item">`), jadi dimodelkan sebagai self-referencing `parent_id`, persis pola `org_units.parent_id` yang sudah ada — bukan `group_label` teks biasa seperti draf sebelumnya.

```sql
CREATE TABLE menus (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id    uuid REFERENCES menus(id),  -- NULL = grup/section (mis. 'Master Data'); diisi = child/menu yg bisa diklik
  level        smallint     NOT NULL,      -- 1 = grup/section, 2 = child/menu bisa-klik (lihat catatan di bawah)
  platform     varchar(10)  NOT NULL CHECK (platform IN ('WEB','MOBILE')),
  code         varchar(60),                -- slug halaman, mis. 'master-periode'; NULL utk baris grup (tidak ada halaman)
  label        varchar(100) NOT NULL,      -- teks tampil, mis. 'Master Data' (grup) atau 'Master Periode' (child)
  sort_order   smallint     NOT NULL,
  is_active    boolean      NOT NULL DEFAULT true,
  created_at   timestamptz  NOT NULL DEFAULT now(),
  updated_at   timestamptz  NOT NULL DEFAULT now(),
  created_by   uuid REFERENCES users(id),
  updated_by   uuid REFERENCES users(id),
  CONSTRAINT ux_menus_platform_code UNIQUE (platform, code),
  CONSTRAINT ck_menus_not_self_parent CHECK (parent_id IS NULL OR parent_id <> id),
  CONSTRAINT ck_menus_level_matches_parent CHECK (
    (level = 1 AND parent_id IS NULL) OR (level > 1 AND parent_id IS NOT NULL)
  )
);
CREATE INDEX ix_menus_parent ON menus (parent_id);
CREATE INDEX ix_menus_level ON menus (level);
```

Baris grup (`level = 1`, `parent_id IS NULL`, mis. "Menu Utama", "Master Data", "Reses & Dapil") cuma dipakai untuk mengelompokkan tampilan di sidebar — `code`-nya `NULL` karena tidak ada halaman sungguhan di baliknya (persis `<div class="snav-label">`, bukan `<a>`). Baris child (`level = 2`, `parent_id` terisi, mis. "Master Periode" di bawah grup "Master Data") itulah yang punya `code`/halaman sungguhan dan yang direferensikan oleh `role_menu_permissions`.

**Kenapa `level` ditambah padahal bisa dihitung dari `parent_id`**: sama seperti `positions.hierarchy_level` yang sudah ada di skema asli — kolom turunan ini bikin query "ambil semua baris grup" / "ambil semua baris child" jadi `WHERE level = 1`/`WHERE level = 2` langsung, tanpa perlu `WHERE parent_id IS NULL`/`IS NOT NULL` atau recursive CTE kalau nanti pohon bertambah dalam. `CHECK` constraint `ck_menus_level_matches_parent` menjaga `level` tidak bisa nyasar tidak sinkron dengan `parent_id` (mis. baris dengan `parent_id` terisi tapi `level = 1`) — jadi sinkronisasinya ditegakkan DB, bukan cuma disiplin aplikasi.

### 4. `role_menu_permissions`

Tabel pivot role ↔ menu, dengan **granularitas CRUD per baris** — satu role bisa saja cuma dapat Create + Read di suatu menu, tanpa Update/Delete (contoh kasus: Master Periode, Role tertentu cuma boleh Create & Read).

```sql
CREATE TABLE role_menu_permissions (
  role_id     uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  menu_id     uuid NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  can_create  boolean NOT NULL DEFAULT false,
  can_read    boolean NOT NULL DEFAULT true,
  can_update  boolean NOT NULL DEFAULT false,
  can_delete  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid REFERENCES users(id),
  updated_by  uuid REFERENCES users(id),
  PRIMARY KEY (role_id, menu_id),
  CONSTRAINT ck_role_menu_permissions_any CHECK (can_create OR can_read OR can_update OR can_delete)
);
CREATE INDEX ix_role_menu_permissions_menu ON role_menu_permissions (menu_id);
```

`ck_role_menu_permissions_any` memastikan baris cuma ada kalau minimal satu izin aktif — kalau keempatnya `false`, itu artinya "tidak ada akses" dan barisnya seharusnya tidak usah dibuat (bukan disimpan sebagai baris kosong), biar tabel tetap ramping (jumlah baris = jumlah izin yang benar-benar diberikan, bukan jumlah kombinasi role×menu yang mungkin).

**Aturan penting (ditegakkan lewat trigger, bukan `CHECK`, karena perlu lihat tabel lain)**: `menu_id` di tabel ini wajib menunjuk ke baris `menus` yang punya `parent_id` terisi (child), tidak boleh ke baris grup (`parent_id IS NULL`) — persis yang disebut di awal ("permission role itu berdasarkan child"). `CHECK` constraint polos tidak bisa query tabel lain, jadi dibutuhkan trigger, mengikuti pola yang sudah dipakai `assignments_validate` di tabel `assignments`:

```sql
CREATE OR REPLACE FUNCTION trg_role_menu_permissions_leaf_only() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM menus WHERE id = NEW.menu_id AND parent_id IS NOT NULL) THEN
    RAISE EXCEPTION 'role_menu_permissions.menu_id harus menunjuk ke menu child (parent_id terisi), bukan baris grup';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER role_menu_permissions_validate
  BEFORE INSERT OR UPDATE ON role_menu_permissions
  FOR EACH ROW EXECUTE FUNCTION trg_role_menu_permissions_leaf_only();
```

### 5. `user_auth_tokens`

Token aktivasi akun & reset password — terpisah dari `users` supaya `users` tetap ramping.

```sql
CREATE TABLE user_auth_tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_type  varchar(20) NOT NULL CHECK (token_type IN ('ACTIVATION','PASSWORD_RESET')),
  token_hash  text NOT NULL,
  expires_at  timestamptz NOT NULL,
  used_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ux_user_auth_tokens_hash ON user_auth_tokens (token_hash);
CREATE INDEX ix_user_auth_tokens_user ON user_auth_tokens (user_id) WHERE used_at IS NULL;
```

Pola partial index (`WHERE used_at IS NULL`) ini konsisten dengan pola yang sudah dipakai di `assignments` — token yang sudah terpakai jarang di-query lagi, jadi tidak perlu ikut ter-index.

## Perubahan pada Tabel yang Sudah Ada

Setelah `users` dibuat, lengkapi FK yang sudah "dijanjikan" oleh kolom-kolom yang sudah ada:

```sql
-- Hubungkan Person ke Akun (satu Person maksimal satu Akun)
ALTER TABLE persons
  ADD CONSTRAINT persons_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id),
  ADD CONSTRAINT persons_user_id_key UNIQUE (user_id);
CREATE INDEX ix_persons_user_id ON persons (user_id) WHERE user_id IS NOT NULL;

-- Lengkapi FK audit (created_by/updated_by) di SEMUA 8 tabel yang sudah ada + 4 tabel baru
ALTER TABLE periods              ADD CONSTRAINT periods_created_by_fkey  FOREIGN KEY (created_by) REFERENCES users(id),
                                  ADD CONSTRAINT periods_updated_by_fkey  FOREIGN KEY (updated_by) REFERENCES users(id);
ALTER TABLE parties               ADD CONSTRAINT parties_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id),
                                  ADD CONSTRAINT parties_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users(id);
-- ...ulangi pola yang sama utk unit_types, org_units, positions, unit_type_positions, persons, assignments
```

(Daftar lengkap sengaja tidak di-expand semua di sini supaya dokumen tetap ringkas — polanya sama persis untuk ke-8 tabel.)

## Keputusan Desain & Tradeoff — Ringkasan

| Keputusan | Alasan |
|---|---|
| `users.role_id` wajib (1 role per user), bukan tabel pivot `user_roles` many-to-many | Sesuai aturan bisnis yang sudah berjalan di FE (`Pegawai.roleId` single-select, bukan array). Pivot table menambah 1 JOIN di tiap pengecekan izin untuk kapabilitas yang belum diminta — baru bangun kalau benar-benar dibutuhkan. |
| Tidak ada `users.person_id`, pakai `persons.user_id` yang sudah ada | Hindari dua kolom saling menunjuk yang harus disinkronkan manual; searah dengan alur bisnis "pilih Pegawai dulu, baru buat akun". |
| Tidak ada `users.email`, pakai `persons.email` | Satu sumber kebenaran; `persons.email` sudah `UNIQUE` di database. |
| Token aktivasi/reset di tabel terpisah (`user_auth_tokens`) | `users` dibaca di hampir tiap request terautentikasi — baris harus tetap ramping. |
| `role_menu_permissions` punya 4 flag CRUD (`can_create/read/update/delete`) per baris | Kebutuhan eksplisit: satu Role bisa saja cuma dapat Create+Read di suatu menu (mis. Master Periode) tanpa Update/Delete — granularitas per-aksi, bukan cuma "boleh akses ya/tidak". |
| `menus.parent_id` self-referencing (seperti `org_units`), bukan `group_label` teks | Sidebar FE memang punya struktur parent/child sungguhan (grup "Master Data" → child "Master Periode"/"Pegawai"/dst). Permission tetap hanya menunjuk ke baris child (ditegakkan via trigger) — baris grup murni untuk pengelompokan tampilan. |
| `menus.level` ditambah (1=grup, 2=child), meski bisa dihitung dari `parent_id` | Sama seperti `positions.hierarchy_level` yang sudah ada di skema asli — mempercepat filter "semua grup"/"semua child" tanpa recursive CTE. Disinkronkan dengan `parent_id` lewat `CHECK` constraint. Tidak ditambah kolom `ordinal` terpisah — `sort_order` sudah cukup utk urutan tampil. |
| Role flat, tanpa inheritance/hierarchy antar Role | Sesuai FE sekarang (tiap Role izin-nya independen, dikonfigurasi manual lewat checklist) — resolusi izin berjenjang di request-time lebih mahal & tidak dibutuhkan. |

## Rekomendasi Performa — Ringkasan

1. **Yang paling berdampak bukan skema tabel, tapi caching di application layer**: hasil resolve "menu apa saja yang boleh diakses user ini" sebaiknya disimpan di session/JWT claim saat login, di-refresh hanya saat role/permission berubah — jangan query `role_menu_permissions` ulang di setiap request/navigasi halaman.
2. `role_menu_permissions` dengan composite PK `(role_id, menu_id)` otomatis jadi index tercepat untuk query paling sering ("ambil semua menu + flag CRUD utk Role X") — tidak perlu index tambahan di kolom itu. Trigger `role_menu_permissions_validate` cuma jalan saat INSERT/UPDATE (jarang), jadi tidak membebani path baca.
3. `menus.parent_id` di-index (`ix_menus_parent`) karena query render sidebar selalu "ambil semua child dari grup X" — pola query yang sama persis dengan `org_units` yang sudah pakai index serupa (`ix_org_units_parent`).
4. Partial index `WHERE used_at IS NULL` di `user_auth_tokens` dan `WHERE user_id IS NOT NULL` di `persons.user_id` — index tetap kecil karena baris lama/tidak relevan tidak ikut ter-index, konsisten dengan pola yang sudah dipakai di `assignments`.
5. Index `ix_users_role` memastikan "semua user dengan Role X" (dipakai mis. di halaman Akun Pengguna yang difilter per Role) tetap cepat walau jumlah user bertambah.
6. Di skala data proyek ini (puluhan Role/menu, ratusan User) nyaris semua query di atas akan tetap cepat bahkan tanpa index tambahan — rekomendasi index di atas lebih untuk kebiasaan baik & antisipasi pertumbuhan, bukan karena ada bottleneck yang sudah terbukti.

## Rencana Seed Data (dari `rbac-data.js` yang sudah ada)

- `roles`: 3 baris dari `RBAC_DEFAULT_ROLES` — Ketua (`can_access_web=true`), Administrator (`can_access_web=true`), Anggota (`can_access_mobile=true`).
- `menus`: flatten `WEB_MENU_CATALOG` + `MOBILE_MENU_CATALOG` — tiap `{group, items:[{id,label}]}` jadi **1 baris parent** (`label = group`, `parent_id = NULL`, `level = 1`, `code = NULL`) + **N baris child** (`label = item.label`, `code = item.id` minus prefix `web-`/`mob-`, `parent_id` menunjuk ke baris parent-nya, `level = 2`), `platform = 'WEB'|'MOBILE'`, `sort_order` mengikuti urutan array (parent & child punya sort_order masing-masing, diurutkan dalam scope-nya sendiri — sama seperti `org_units.sort_order`).
- `role_menu_permissions`: expand array `permissions: [...]` tiap Role jadi baris `(role_id, menu_id)` dengan `can_read = true` (FE sekarang cuma kenal "boleh akses"); `can_create`/`can_update`/`can_delete` default `false` sampai ada kebutuhan konkret per menu untuk diisi berbeda (mis. Master Periode → Create+Read saja utk Role tertentu).
- `users`: dibuat belakangan per orang saat admin memakai alur "Create New Account" (`pengguna-buat.html`) — tidak di-seed massal di awal, kecuali untuk 1 akun admin bootstrap pertama.

## Pertanyaan Terbuka

1. Apakah "akses create" di suatu menu juga butuh dibedakan per ruang lingkup data (mis. Role X boleh create Pegawai tapi cuma utk Dapil tertentu), atau cukup CRUD global per menu seperti desain di atas (Role X boleh/tidak boleh create di menu Pegawai, tanpa syarat tambahan)? Desain saat ini mengasumsikan yang kedua (lebih sederhana, tanpa row-level security).
2. Apakah satu Pegawai benar-benar wajib maksimal 1 Akun selamanya, atau ada skenario Pegawai perlu akun baru (akun lama di-nonaktifkan dulu via `status='DEACTIVATED'`, lalu dibuatkan Akun baru)? Ini menentukan apakah `persons.user_id` tetap `UNIQUE` permanen atau perlu pola lain (riwayat akun).
3. Siapa yang jadi `created_by` untuk akun admin pertama (bootstrap) kalau kolom itu mengarah ke `users(id)` yang belum ada user sama sekali saat insert pertama? (Umum: biarkan `created_by` NULL khusus untuk baris pertama, atau buat 1 akun system/seed terlebih dahulu dengan `created_by` menunjuk ke dirinya sendiri.)
4. Apakah baris grup (`menus.parent_id IS NULL`, mis. "Master Data") perlu disembunyikan otomatis di sidebar kalau SEMUA child-nya tidak ada izin utk Role yang login, atau itu urusan logika FE saja (BE cuma menyediakan data mentah, FE yang menyaring)? Rekomendasi: urusan FE — BE cukup mengembalikan daftar child yang diizinkan, FE yang menentukan grup mana yang jadi kosong lalu disembunyikan.
