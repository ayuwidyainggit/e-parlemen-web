// Data referensi Pegawai (prototipe), dipakai oleh master-pegawai.html, pengguna-buat.html,
// master-dapil.html & laporan-duk.html.
// Disimpan di localStorage supaya data pegawai tetap ada setelah reload.
// tipePegawai membedakan dua populasi dengan struktur data berbeda:
//  - 'Politisi' (Anggota DPRD): butuh fraksiId/dapilId, field ASN selalu null.
//  - 'ASN' (Sekretariat): butuh pangkat/golongan/status kepegawaian, fraksiId/dapilId selalu null.
//
// Seed di bawah diisi dari data/persons.json (85 orang: 25 Dewan + 60 Setwan, sesuai
// data/README.md) - lihat data/ untuk sumber & tabel relasi lengkap (periods, parties,
// unit_types, org_units, positions, assignments).
// Field yang TIDAK ada di data/persons.json (nik, alamat, hp, pangkat/golongan/TMT, biodata)
// diisi null/placeholder - lihat catatan per field:
//  - nik: placeholder 16-digit (bukan NIK asli - sumber data tidak menyediakan NIK).
//  - nip: employee_number_nip (Setwan) / member_code (Dewan) dari sumber - sudah asli.
//  - jabatanId: default 'b80c6030...' (Anggota DPRD) utk semua Dewan, 'bb22c8a1...'
//    (Pengadministrasi Perkantoran) utk semua Setwan - jabatan GENERIK, bukan posisi riil
//    per orang (itu ada di field `assignments` di bawah, bukan di jabatanId).
//  - assignments: diisi dari JOIN data/assignments.json x data/positions.json x
//    data/org_units.json per person_id (sort_order asc) - mencakup KEDUA periode
//    (2019-2024 & 2024-2029) kalau orangnya punya assignment riil di keduanya. Kosong []
//    kalau belum ada assignment riil tercatat di DB (umumnya staf baru/PELAKSANA).
//  - fraksiId/partaiId (khusus Dewan): data/persons.json & data/parties.json memakai skema
//    UUID database (eparlemenv2), SEDANGKAN partai-data.js & fraksi-data.js (dipakai
//    pengguna-buat.html/pengguna-edit.html utk resolve Fraksi dari Partai) memakai skema
//    UUID lokal-prototipe yang BERBEDA & TIDAK match ke skema DB. Di-cross-walk via kode
//    partai (PDIP/GOLKAR/PKB/PKS/DEMOKRAT/GERINDRA), bukan lewat UUID langsung.
//  - dapilId (khusus Dewan): TIDAK ada sumber otoritatifnya (electoral_district_id di
//    persons.json null utk semua & tabel `dapils` di DB masih kosong) - nilai dipertahankan
//    dari seed sebelumnya (prototipe manual, bukan hasil join data/*.json).
//  - pangkat/golongan/TMT/biodata (tanggal lahir, pendidikan, dst): null - tidak tersedia di
//    data/persons.json.
//
// Field akun (dipakai oleh pengguna.html, pengguna-buat.html & pengguna-edit.html untuk fitur
// User Management - Create/Edit Account, Aktivasi/Reset Password, Nonaktifkan Account):
//  - email: diisi dari data/persons.json kolom `email` apa adanya (bisa null kalau orangnya
//    belum punya email tercatat - masih bisa diisi lewat Edit, lihat pengguna-edit.html).
//  - loginStatus: SELALU terisi ('PENDING_VERIFICATION' | 'ACTIVE' | 'DEACTIVATED') - TIDAK
//    PERNAH null. Setiap baris di tabel `users` (sumber data/persons.json) sudah berupa akun
//    sejak lahir (kolom login_status di DB defaultnya 'PENDING_ACTIVATION', bukan "tanpa akun"
//    - lihat docs/trd-database-eparlemen.md Bagian 4.7), jadi status "Belum Ada Akun" TIDAK
//    ADA di model data ini - pengguna.html tidak lagi punya state/tombol "Buat Akun" per-baris.
//    Hanya 4 pegawai contoh (NARISQA, ATANG KUSTIONO, INDAH DWIANTARI, PRAWERTI PRAJNAJATI)
//    yang diisi demo akun ACTIVE/DEACTIVATED/PENDING_VERIFICATION dgn email kustom
//    (@dprd-magelangkota.go.id); 81 sisanya default 'PENDING_VERIFICATION' dgn email
//    langsung dari persons.json (bisa null). Permintaan reset kata sandi TIDAK mengubah
//    loginStatus - lihat forgot-password.html & forgot-password-data.js: login diblokir
//    selama ada permintaan PENDING sampai admin menyetujui/menolak lewat pengguna.html.
//  - password: kata sandi akun (prototipe, plain text - tidak ada backend nyata di proyek ini).
//    null = akun belum pernah punya kata sandi (mis. belum diaktivasi). Diisi/diganti lewat
//    fitur "Lupa Kata Sandi" setelah disetujui admin.
//  - roleId: role utama (FK ke rbac-data.js) - dipakai semua akun selain contoh di bawah.
//  - roleIds: OPSIONAL, array of roleId - dipakai kalau satu akun butuh LEBIH DARI SATU role
//    (mis. id 1 - NARISQA punya role Ketua & Anggota sekaligus, lihat assignments-nya).
//    Kalau roleIds ada, pengguna.html menampilkan & memfilter berdasarkan roleIds (roleId tetap
//    diisi sbg fallback role utama utk kode yang belum sadar multi-role, mis. pengguna-edit.html).
//  - unitTypeId: FK ke UNIT_TYPE_LIST (unit-type-data.js) - unit organisasi tempat pegawai ini
//    ditugaskan saat ini (hasil "Assign Unit Type" pada Create/Edit Account).
var PEGAWAI_STORAGE_KEY = 'ep_master_pegawai_list';
// Naikkan versi ini setiap kali PEGAWAI_DEFAULT_LIST diganti (mis. sumber seed baru) supaya
// browser yang masih menyimpan data lama di localStorage otomatis di-reseed, tanpa perlu
// localStorage.clear() manual. Edit yang sudah dibuat lewat form tetap tersimpan selama versi
// seed tidak berubah.
var PEGAWAI_SEED_VERSION = 10;
var PEGAWAI_VERSION_KEY = 'ep_master_pegawai_seed_version';
var PEGAWAI_DEFAULT_LIST = [
  { id: 1, tipePegawai: 'Politisi', nama: 'NARISQA', nik: '0000000000000001', nip: 'DPRD-AGT-0001', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, roleIds: [1, 3], fraksiId: 2, partaiId: '987362f7-493a-4508-977f-45637f3a175c', dapilId: 'DAPIL-1', email: 'narisqa@dprd-magelangkota.go.id', loginStatus: 'ACTIVE', password: 'rahasia123', unitTypeId: 'f14157bb-d374-579c-a364-344b20f95539',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Fraksi PDI Perjuangan', mulai: '2024-08-01', sk: null }, { jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Komisi C', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }] },
  { id: 2, tipePegawai: 'Politisi', nama: 'ATANG KUSTIONO, S.T.', nik: '0000000000000002', nip: 'DPRD-AGT-0002', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 2, partaiId: '987362f7-493a-4508-977f-45637f3a175c', dapilId: 'DAPIL-2', email: 'atang.kustiono@dprd-magelangkota.go.id', loginStatus: 'PENDING_VERIFICATION', unitTypeId: 'f14157bb-d374-579c-a364-344b20f95539',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Fraksi PDI Perjuangan', mulai: '2024-08-01', sk: null }, { jabatan: 'Sekretaris', kategori: 'KELOMPOK', unitKerja: 'Komisi A', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }] },
  { id: 3, tipePegawai: 'Politisi', nama: 'SLAMET BAMBANG SULISTYO, S.Sos., M.M.', nik: '0000000000000003', nip: 'DPRD-AGT-0003', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 2, partaiId: '987362f7-493a-4508-977f-45637f3a175c', dapilId: 'DAPIL-3', email: 'slamet.bambang.sulistyo@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Sekretaris', kategori: 'KELOMPOK', unitKerja: 'Fraksi PDI Perjuangan', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi A', mulai: '2024-10-01', sk: null }, { jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Badan Pembentukan Peraturan Daerah', mulai: '2024-10-01', sk: null }] },
  { id: 4, tipePegawai: 'Politisi', nama: 'EVIN SEPTA HARYANTO KAMIL, S.H.', nik: '0000000000000004', nip: 'DPRD-AGT-0004', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 2, partaiId: '987362f7-493a-4508-977f-45637f3a175c', dapilId: 'DAPIL-1', email: 'evin.septa.haryanto.kamil@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Pimpinan DPRD', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Fraksi PDI Perjuangan', mulai: '2024-08-01', sk: null }, { jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }, { jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }] },
  { id: 5, tipePegawai: 'Politisi', nama: 'DELLA SETYA MAHARANI', nik: '0000000000000005', nip: 'DPRD-AGT-0005', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 2, partaiId: '987362f7-493a-4508-977f-45637f3a175c', dapilId: 'DAPIL-2', email: 'della.setya.maharani@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Fraksi PDI Perjuangan', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi B', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Pembentukan Peraturan Daerah', mulai: '2024-10-01', sk: null }] },
  { id: 6, tipePegawai: 'Politisi', nama: 'KEVIN MAHESA AMUWARDHANI, S.H.', nik: '0000000000000006', nip: 'DPRD-AGT-0006', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 2, partaiId: '987362f7-493a-4508-977f-45637f3a175c', dapilId: 'DAPIL-3', email: 'kevin.mahesa.amuwardhani@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Fraksi PDI Perjuangan', mulai: '2024-08-01', sk: null }, { jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Komisi B', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }] },
  { id: 7, tipePegawai: 'Politisi', nama: 'LEXIANO GAMMA PRADITYA', nik: '0000000000000007', nip: 'DPRD-AGT-0007', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 2, partaiId: '987362f7-493a-4508-977f-45637f3a175c', dapilId: 'DAPIL-1', email: 'lexiano.gamma.praditya@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Fraksi PDI Perjuangan', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi C', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }, { jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Badan Kehormatan', mulai: '2024-10-01', sk: null }] },
  { id: 8, tipePegawai: 'Politisi', nama: 'TITIEK UTAMI, S.Sos., M.M.', nik: '0000000000000008', nip: 'DPRD-AGT-0008', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 1, partaiId: '31fdb48d-dd2b-40ba-ad2e-5f193eca14e4', dapilId: 'DAPIL-2', email: 'titiek.utami@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Fraksi Golkar', mulai: '2024-08-01', sk: null }, { jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Komisi A', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }] },
  { id: 9, tipePegawai: 'Politisi', nama: 'VENTJE JEHEZKIEL ROGI, S.Pd.', nik: '0000000000000009', nip: 'DPRD-AGT-0009', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 1, partaiId: '31fdb48d-dd2b-40ba-ad2e-5f193eca14e4', dapilId: 'DAPIL-3', email: 'ventje.jehezkiel.rogi@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Fraksi Golkar', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi C', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }, { jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Badan Kehormatan', mulai: '2024-10-01', sk: null }] },
  { id: 10, tipePegawai: 'Politisi', nama: 'TYAS ANGGRAENI BP, S.E., M.Sc.', nik: '0000000000000010', nip: 'DPRD-AGT-0010', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 1, partaiId: '31fdb48d-dd2b-40ba-ad2e-5f193eca14e4', dapilId: 'DAPIL-1', email: 'tyas.anggraeni.bp@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Sekretaris', kategori: 'KELOMPOK', unitKerja: 'Fraksi Golkar', mulai: '2024-08-01', sk: null }, { jabatan: 'Sekretaris', kategori: 'KELOMPOK', unitKerja: 'Komisi C', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Pembentukan Peraturan Daerah', mulai: '2024-10-01', sk: null }] },
  { id: 11, tipePegawai: 'Politisi', nama: 'MUH HARJADI, S.H.', nik: '0000000000000011', nip: 'DPRD-AGT-0011', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 1, partaiId: '31fdb48d-dd2b-40ba-ad2e-5f193eca14e4', dapilId: 'DAPIL-2', email: 'muh.harjadi@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Fraksi Golkar', mulai: '2024-08-01', sk: null }, { jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Komisi B', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Pembentukan Peraturan Daerah', mulai: '2024-10-01', sk: null }] },
  { id: 12, tipePegawai: 'Politisi', nama: 'H.I.R JATMIKO, S.H., M.M.', nik: '0000000000000012', nip: 'DPRD-AGT-0012', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 1, partaiId: '31fdb48d-dd2b-40ba-ad2e-5f193eca14e4', dapilId: 'DAPIL-3', email: 'h.i.r.jatmiko@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Fraksi Golkar', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi A', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }] },
  { id: 13, tipePegawai: 'Politisi', nama: 'Hj. YUNITA BUDI CHRISSANNI, S.H., M.Kn.', nik: '0000000000000013', nip: 'DPRD-AGT-0013', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 4, partaiId: 'fd36e66b-71f3-4296-93f5-031c404aed4d', dapilId: 'DAPIL-1', email: 'yunita.budi.chrissanni@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Fraksi Kebangkitan Bangsa', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi B', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }] },
  { id: 14, tipePegawai: 'Politisi', nama: 'H. SALLAFUDIN, S.E.', nik: '0000000000000014', nip: 'DPRD-AGT-0014', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 4, partaiId: 'fd36e66b-71f3-4296-93f5-031c404aed4d', dapilId: 'DAPIL-2', email: 'sallafudin@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Fraksi Kebangkitan Bangsa', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi C', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Pembentukan Peraturan Daerah', mulai: '2024-10-01', sk: null }] },
  { id: 15, tipePegawai: 'Politisi', nama: 'FEBRIAN PRABOWO', nik: '0000000000000015', nip: 'DPRD-AGT-0015', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 4, partaiId: 'fd36e66b-71f3-4296-93f5-031c404aed4d', dapilId: 'DAPIL-3', email: 'febrian.prabowo@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Sekretaris', kategori: 'KELOMPOK', unitKerja: 'Fraksi Kebangkitan Bangsa', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi A', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Kehormatan', mulai: '2024-10-01', sk: null }] },
  { id: 16, tipePegawai: 'Politisi', nama: 'IMAM INDRA SETYAWAN, S.E., M.M.', nik: '0000000000000016', nip: 'DPRD-AGT-0016', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 4, partaiId: 'fd36e66b-71f3-4296-93f5-031c404aed4d', dapilId: 'DAPIL-1', email: 'imam.indra.setyawan@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Pimpinan DPRD', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Fraksi Kebangkitan Bangsa', mulai: '2024-08-01', sk: null }, { jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }, { jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }] },
  { id: 17, tipePegawai: 'Politisi', nama: 'ACHMAD WIDODO', nik: '0000000000000017', nip: 'DPRD-AGT-0017', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 5, partaiId: '13f397f7-0c35-4b9d-aa61-29a77a999809', dapilId: 'DAPIL-2', email: 'achmad.widodo@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Fraksi PKS', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi B', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Pembentukan Peraturan Daerah', mulai: '2024-10-01', sk: null }] },
  { id: 18, tipePegawai: 'Politisi', nama: 'IMAM MUSAECHONI', nik: '0000000000000018', nip: 'DPRD-AGT-0018', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 5, partaiId: '13f397f7-0c35-4b9d-aa61-29a77a999809', dapilId: 'DAPIL-3', email: 'imam.musaechoni@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Sekretaris', kategori: 'KELOMPOK', unitKerja: 'Fraksi PKS', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi C', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }] },
  { id: 19, tipePegawai: 'Politisi', nama: 'BUSTANUL ARIFIN, S.T.', nik: '0000000000000019', nip: 'DPRD-AGT-0019', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 5, partaiId: '13f397f7-0c35-4b9d-aa61-29a77a999809', dapilId: 'DAPIL-1', email: 'bustanul.arifin@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Pimpinan DPRD', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Fraksi PKS', mulai: '2024-08-01', sk: null }, { jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }, { jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }] },
  { id: 20, tipePegawai: 'Politisi', nama: 'Y. IG. MARJI NUGROHO, S.E.', nik: '0000000000000020', nip: 'DPRD-AGT-0020', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 6, partaiId: 'cad6afb3-180b-4bdc-b958-60be86ac482f', dapilId: 'DAPIL-2', email: 'y.ig.marji.nugroho@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Fraksi Demokrat', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi C', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Pembentukan Peraturan Daerah', mulai: '2024-10-01', sk: null }] },
  { id: 21, tipePegawai: 'Politisi', nama: 'WALUYO', nik: '0000000000000021', nip: 'DPRD-AGT-0021', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 6, partaiId: 'cad6afb3-180b-4bdc-b958-60be86ac482f', dapilId: 'DAPIL-3', email: 'waluyo@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Sekretaris', kategori: 'KELOMPOK', unitKerja: 'Fraksi Demokrat', mulai: '2024-08-01', sk: null }, { jabatan: 'Sekretaris', kategori: 'KELOMPOK', unitKerja: 'Komisi B', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }] },
  { id: 22, tipePegawai: 'Politisi', nama: 'DIAN MEGA ARYANI, S.E., M.M.', nik: '0000000000000022', nip: 'DPRD-AGT-0022', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 6, partaiId: 'cad6afb3-180b-4bdc-b958-60be86ac482f', dapilId: 'DAPIL-1', email: 'dian.mega.aryani@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Fraksi Demokrat', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi A', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }] },
  { id: 23, tipePegawai: 'Politisi', nama: 'NELLA KARNELA YUNISSARI, S.H., M.H.', nik: '0000000000000023', nip: 'DPRD-AGT-0023', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 3, partaiId: '88f578b5-75aa-4f58-9f89-e39ad2b45870', dapilId: 'DAPIL-2', email: 'nella.karnela.yunissari@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Fraksi Gerindra', mulai: '2024-08-01', sk: null }, { jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Komisi C', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }] },
  { id: 24, tipePegawai: 'Politisi', nama: 'YUSUF SUSILO, S.H.', nik: '0000000000000024', nip: 'DPRD-AGT-0024', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 3, partaiId: '88f578b5-75aa-4f58-9f89-e39ad2b45870', dapilId: 'DAPIL-3', email: 'yusuf.susilo@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Sekretaris', kategori: 'KELOMPOK', unitKerja: 'Fraksi Gerindra', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi B', mulai: '2024-10-01', sk: null }, { jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Badan Pembentukan Peraturan Daerah', mulai: '2024-10-01', sk: null }] },
  { id: 25, tipePegawai: 'Politisi', nama: 'ADI CHANDRA PAMUNGKAS, A.Md.', nik: '0000000000000025', nip: 'DPRD-AGT-0025', alamat: '', hp: '', jabatanId: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', roleId: 3, fraksiId: 3, partaiId: '88f578b5-75aa-4f58-9f89-e39ad2b45870', dapilId: 'DAPIL-1', email: 'adi.chandra.pamungkas@eparlemen.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Fraksi Gerindra', mulai: '2024-08-01', sk: null }, { jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Komisi A', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }] },
  { id: 26, tipePegawai: 'ASN', nama: 'DWI LESTARI', nik: '0000000000000026', nip: '196706051986032002', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'dwi.lestari@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Pengadministrasi Perkantoran', kategori: 'PELAKSANA', unitKerja: 'Sub Bagian Rumah Tangga dan Perlengkapan', mulai: '2025-01-02', sk: null }] },
  { id: 27, tipePegawai: 'ASN', nama: 'SUPARJAN', nik: '0000000000000027', nip: '196707242007011013', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'suparjan@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Operator Layanan Operasional', kategori: 'PELAKSANA', unitKerja: 'Sub Bagian Tata Usaha dan Kepegawaian', mulai: '2025-01-02', sk: null }] },
  { id: 28, tipePegawai: 'ASN', nama: 'CATUR ADI SUBAGIO, S.H.', nik: '0000000000000028', nip: '196805301990011001', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'catur.adi.subagio@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Kepala Bagian', kategori: 'STRUKTURAL', unitKerja: 'Bagian Persidangan dan Perundang-undangan', mulai: '2021-11-01', sk: null }, { jabatan: 'Kepala Bagian', kategori: 'STRUKTURAL', unitKerja: 'Bagian Persidangan dan Perundang-undangan', mulai: '2025-01-02', sk: null }] },
  { id: 29, tipePegawai: 'ASN', nama: 'RUMIYATI, S.Sos., M.M.', nik: '0000000000000029', nip: '196910291990032003', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'rumiyati@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Kepala Bagian', kategori: 'STRUKTURAL', unitKerja: 'Bagian Keuangan', mulai: '2021-09-03', sk: null }, { jabatan: 'Kepala Bagian', kategori: 'STRUKTURAL', unitKerja: 'Bagian Keuangan', mulai: '2025-01-02', sk: null }] },
  { id: 30, tipePegawai: 'ASN', nama: 'TITIK SUSDARWATI, A.Md.', nik: '0000000000000030', nip: '197001082003122005', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'titik.susdarwati@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Penelaah Teknis Kebijakan', kategori: 'PELAKSANA', unitKerja: 'Bagian Keuangan', mulai: '2025-01-02', sk: null }] },
  { id: 31, tipePegawai: 'ASN', nama: 'WISNOE MOERTI', nik: '0000000000000031', nip: '197002262025211017', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 32, tipePegawai: 'ASN', nama: 'HADI SUNARJO', nik: '0000000000000032', nip: '197006172025211021', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 33, tipePegawai: 'ASN', nama: 'KABUL LAKSONO', nik: '0000000000000033', nip: '197008222008011006', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'kabul.laksono@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Operator Layanan Operasional', kategori: 'PELAKSANA', unitKerja: 'Sub Bagian Rumah Tangga dan Perlengkapan', mulai: '2019-08-01', sk: null }, { jabatan: 'Operator Layanan Operasional', kategori: 'PELAKSANA', unitKerja: 'Sub Bagian Rumah Tangga dan Perlengkapan', mulai: '2025-01-02', sk: null }] },
  { id: 34, tipePegawai: 'ASN', nama: 'SUROTO', nik: '0000000000000034', nip: '197102092010011001', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'suroto@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Pengadministrasi Perkantoran', kategori: 'PELAKSANA', unitKerja: 'Sub Bagian Tata Usaha dan Kepegawaian', mulai: '2025-01-02', sk: null }] },
  { id: 35, tipePegawai: 'ASN', nama: 'TRIYAMTO SUTRISNO, SSTP., MM.', nik: '0000000000000035', nip: '197110251992031010', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Kepala Bagian', kategori: 'STRUKTURAL', unitKerja: 'Bagian Umum', mulai: '2013-06-24', sk: null }] },
  { id: 36, tipePegawai: 'ASN', nama: 'TITIK SETIYANINGRUM, S.E.', nik: '0000000000000036', nip: '197204121994032005', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'titik.setiyaningrum@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Analis Kebijakan Ahli Muda', kategori: 'FUNGSIONAL', unitKerja: 'Bagian Keuangan', mulai: '2019-08-01', sk: null }, { jabatan: 'Analis Kebijakan Ahli Muda', kategori: 'FUNGSIONAL', unitKerja: 'Bagian Keuangan', mulai: '2025-01-02', sk: null }] },
  { id: 37, tipePegawai: 'ASN', nama: 'INDAH DWIANTARI, S.Sos.', nik: '0000000000000037', nip: '197204291997032002', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'indah.dwiantari@dprd-magelangkota.go.id', loginStatus: 'ACTIVE', password: 'rahasia123', unitTypeId: 'b0259834-de2f-5648-be44-bd576db6d9a4',
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Sekretaris DPRD', kategori: 'STRUKTURAL', unitKerja: 'Sekretariat DPRD', mulai: '2025-01-02', sk: null }] },
  { id: 38, tipePegawai: 'ASN', nama: 'TRI WINARNO, S.E.', nik: '0000000000000038', nip: '197307221997031003', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'tri.winarno@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Kepala Bagian', kategori: 'STRUKTURAL', unitKerja: 'Bagian Umum', mulai: '2025-01-02', sk: null }] },
  { id: 39, tipePegawai: 'ASN', nama: 'AGUS SUHARJI BAMBANG PAMUNGKAS', nik: '0000000000000039', nip: '197408082025211046', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 40, tipePegawai: 'ASN', nama: 'HERY PURWOKO, S.E.', nik: '0000000000000040', nip: '197411302006041015', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'hery.purwoko@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Kepala Sub Bagian', kategori: 'STRUKTURAL', unitKerja: 'Sub Bagian Rumah Tangga dan Perlengkapan', mulai: '2025-01-02', sk: null }] },
  { id: 41, tipePegawai: 'ASN', nama: 'MUWAHIDIN, S.Sos.', nik: '0000000000000041', nip: '197505122006041017', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 42, tipePegawai: 'ASN', nama: 'DANARI', nik: '0000000000000042', nip: '197506022025211030', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 43, tipePegawai: 'ASN', nama: 'AGUS SANTOSO', nik: '0000000000000043', nip: '197508052006041015', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'agus.santoso@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Operator Layanan Operasional', kategori: 'PELAKSANA', unitKerja: 'Sub Bagian Rumah Tangga dan Perlengkapan', mulai: '2019-08-01', sk: null }, { jabatan: 'Operator Layanan Operasional', kategori: 'PELAKSANA', unitKerja: 'Sub Bagian Rumah Tangga dan Perlengkapan', mulai: '2025-01-02', sk: null }] },
  { id: 44, tipePegawai: 'ASN', nama: 'SLAMET SUPRATIKNO', nik: '0000000000000044', nip: '197703292025211031', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 45, tipePegawai: 'ASN', nama: 'SWASTI KUSUMA DEWI, S.E.', nik: '0000000000000045', nip: '197709012010012004', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'swasti.kusuma.dewi@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Analis Kebijakan Ahli Muda', kategori: 'FUNGSIONAL', unitKerja: 'Bagian Keuangan', mulai: '2019-08-01', sk: null }, { jabatan: 'Analis Kebijakan Ahli Muda', kategori: 'FUNGSIONAL', unitKerja: 'Bagian Keuangan', mulai: '2025-01-02', sk: null }] },
  { id: 46, tipePegawai: 'ASN', nama: 'KAMARUDIN', nik: '0000000000000046', nip: '197804012025211041', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 47, tipePegawai: 'ASN', nama: 'PANCA ARIANA, S.H.', nik: '0000000000000047', nip: '197902222010012001', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'panca.ariana@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Penyusun Materi Hukum dan Perundang-undangan', kategori: 'PELAKSANA', unitKerja: 'Bagian Persidangan dan Perundang-undangan', mulai: '2019-08-01', sk: null }, { jabatan: 'Penyusun Materi Hukum dan Perundang-undangan', kategori: 'PELAKSANA', unitKerja: 'Bagian Persidangan dan Perundang-undangan', mulai: '2025-01-02', sk: null }] },
  { id: 48, tipePegawai: 'ASN', nama: 'MOH TOYIBAN', nik: '0000000000000048', nip: '198001202025211004', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'moh.toyiban@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Pengadministrasi Perkantoran', kategori: 'PELAKSANA', unitKerja: 'Bagian Keuangan', mulai: '2025-01-02', sk: null }] },
  { id: 49, tipePegawai: 'ASN', nama: 'ADI SURYA LARAS, S.Ak.', nik: '0000000000000049', nip: '198004162009031001', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Kepala Sub Bagian', kategori: 'STRUKTURAL', unitKerja: 'Sub Bagian Tata Usaha dan Kepegawaian', mulai: '2022-09-15', sk: null }] },
  { id: 50, tipePegawai: 'ASN', nama: 'SUPRIYANTO', nik: '0000000000000050', nip: '198011152025211048', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 51, tipePegawai: 'ASN', nama: 'MUH FAUZI', nik: '0000000000000051', nip: '198103202010011003', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'muh.fauzi@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Operator Layanan Operasional', kategori: 'PELAKSANA', unitKerja: 'Sub Bagian Tata Usaha dan Kepegawaian', mulai: '2019-08-01', sk: null }, { jabatan: 'Operator Layanan Operasional', kategori: 'PELAKSANA', unitKerja: 'Sub Bagian Tata Usaha dan Kepegawaian', mulai: '2025-01-02', sk: null }] },
  { id: 52, tipePegawai: 'ASN', nama: 'LILIK BINTARTO', nik: '0000000000000052', nip: '198105042025211059', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 53, tipePegawai: 'ASN', nama: 'PRAYITNO', nik: '0000000000000053', nip: '198105102025211088', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 54, tipePegawai: 'ASN', nama: 'AGUS NUR HAYANTO, S.M.', nik: '0000000000000054', nip: '198111072015021001', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 55, tipePegawai: 'ASN', nama: 'KIKI RIZKI ALTALATA, S.IP.', nik: '0000000000000055', nip: '198201202025211047', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 56, tipePegawai: 'ASN', nama: 'TRI PURWANTO', nik: '0000000000000056', nip: '198303232025211118', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 57, tipePegawai: 'ASN', nama: 'ARIF GUNAWAN', nik: '0000000000000057', nip: '198304152025211069', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 58, tipePegawai: 'ASN', nama: 'PUTRO BAGUS PRASETIYO, S.H.', nik: '0000000000000058', nip: '198308102010011023', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'putro.bagus.prasetiyo@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Perisalah Legislatif Ahli Muda', kategori: 'FUNGSIONAL', unitKerja: 'Bagian Persidangan dan Perundang-undangan', mulai: '2025-01-02', sk: null }] },
  { id: 59, tipePegawai: 'ASN', nama: 'TEGUH SANTOSO', nik: '0000000000000059', nip: '198311022025211060', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 60, tipePegawai: 'ASN', nama: 'ROCHMAT FAJAR ARUMBA, S.T.', nik: '0000000000000060', nip: '198312092025211036', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 61, tipePegawai: 'ASN', nama: 'JATU WIRATMOKO', nik: '0000000000000061', nip: '198501102025211066', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 62, tipePegawai: 'ASN', nama: 'SUMARNA', nik: '0000000000000062', nip: '198606062025211118', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 63, tipePegawai: 'ASN', nama: 'AMIRUDDIN CHAIRUL HADI, S.H.', nik: '0000000000000063', nip: '198612102015021002', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'amiruddin.chairul.hadi@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Kepala Sub Bagian', kategori: 'STRUKTURAL', unitKerja: 'Sub Bagian Tata Usaha dan Kepegawaian', mulai: '2025-01-02', sk: null }] },
  { id: 64, tipePegawai: 'ASN', nama: 'DWI KESUMA FAJAR NURSENA, S.Kom', nik: '0000000000000064', nip: '198708202025211093', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 65, tipePegawai: 'ASN', nama: 'CRISTIAN NISA YANSEN, S.Kom.', nik: '0000000000000065', nip: '198710092024211003', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'cristian.nisa.yansen@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Pranata Komputer Ahli Pertama', kategori: 'FUNGSIONAL', unitKerja: 'Sub Bagian Tata Usaha dan Kepegawaian', mulai: '2024-03-01', sk: null }, { jabatan: 'Pranata Komputer Ahli Pertama', kategori: 'FUNGSIONAL', unitKerja: 'Sub Bagian Tata Usaha dan Kepegawaian', mulai: '2025-01-02', sk: null }] },
  { id: 66, tipePegawai: 'ASN', nama: 'SATRIYO MUHAMAD NURIKSAN', nik: '0000000000000066', nip: '198804012025211094', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 67, tipePegawai: 'ASN', nama: 'UUS SOLIKHUDIN, S.H.', nik: '0000000000000067', nip: '198805182025211011', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'uus.solikhudin@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Perisalah Legislatif Ahli Pertama', kategori: 'FUNGSIONAL', unitKerja: 'Bagian Persidangan dan Perundang-undangan', mulai: '2025-01-02', sk: null }] },
  { id: 68, tipePegawai: 'ASN', nama: 'SETYO WIBOWO', nik: '0000000000000068', nip: '198809302025211078', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 69, tipePegawai: 'ASN', nama: 'HASMAN KURNIYAWAN, S.Pd.', nik: '0000000000000069', nip: '198812102025211012', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'hasman.kurniyawan@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Perisalah Legislatif Ahli Pertama', kategori: 'FUNGSIONAL', unitKerja: 'Bagian Persidangan dan Perundang-undangan', mulai: '2025-01-02', sk: null }] },
  { id: 70, tipePegawai: 'ASN', nama: 'RACHMITA BUNGA PURI D, S.E.', nik: '0000000000000070', nip: '198902142024212006', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'rachmita.bunga.puri.d@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Perisalah Legislatif Ahli Pertama', kategori: 'FUNGSIONAL', unitKerja: 'Bagian Persidangan dan Perundang-undangan', mulai: '2024-03-01', sk: null }, { jabatan: 'Perisalah Legislatif Ahli Pertama', kategori: 'FUNGSIONAL', unitKerja: 'Bagian Persidangan dan Perundang-undangan', mulai: '2025-01-02', sk: null }] },
  { id: 71, tipePegawai: 'ASN', nama: 'PRIHATINI, A.Md.A.Pkt.', nik: '0000000000000071', nip: '198911022024212004', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'prihatini@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Asisten Perisalah Legislatif Terampil', kategori: 'FUNGSIONAL', unitKerja: 'Bagian Persidangan dan Perundang-undangan', mulai: '2024-03-01', sk: null }, { jabatan: 'Asisten Perisalah Legislatif Terampil', kategori: 'FUNGSIONAL', unitKerja: 'Bagian Persidangan dan Perundang-undangan', mulai: '2025-01-02', sk: null }] },
  { id: 72, tipePegawai: 'ASN', nama: 'RAFIKA KUSUMA WARDANI, S.E.', nik: '0000000000000072', nip: '199001172025212069', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 73, tipePegawai: 'ASN', nama: 'PUPUT SETYOWATI', nik: '0000000000000073', nip: '199103272025212080', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 74, tipePegawai: 'ASN', nama: 'LUCKIE ADITYA RACHMA, S.E.', nik: '0000000000000074', nip: '199206072024211004', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'luckie.aditya.rachma@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Pranata Humas Ahli Pertama', kategori: 'FUNGSIONAL', unitKerja: 'Sub Bagian Tata Usaha dan Kepegawaian', mulai: '2024-03-01', sk: null }, { jabatan: 'Pranata Humas Ahli Pertama', kategori: 'FUNGSIONAL', unitKerja: 'Sub Bagian Tata Usaha dan Kepegawaian', mulai: '2025-01-02', sk: null }] },
  { id: 75, tipePegawai: 'ASN', nama: 'BAGAS WIDO PERMANA, S.Kom.', nik: '0000000000000075', nip: '199209302025211053', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 76, tipePegawai: 'ASN', nama: 'RICKY ARIESTA PAMUNGKAS, SE', nik: '0000000000000076', nip: '199304102025211084', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 77, tipePegawai: 'ASN', nama: 'FAUZZIAH ANIS NUR S, S.E.', nik: '0000000000000077', nip: '199310162024212003', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'fauzziah.anis.nur.s@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Perisalah Legislatif Ahli Pertama', kategori: 'FUNGSIONAL', unitKerja: 'Bagian Persidangan dan Perundang-undangan', mulai: '2024-03-01', sk: null }, { jabatan: 'Perisalah Legislatif Ahli Pertama', kategori: 'FUNGSIONAL', unitKerja: 'Bagian Persidangan dan Perundang-undangan', mulai: '2025-01-02', sk: null }] },
  { id: 78, tipePegawai: 'ASN', nama: 'DESA YUDA WIJAYA', nik: '0000000000000078', nip: '199401132025211074', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 79, tipePegawai: 'ASN', nama: 'AYU NUR ANISA, S.Pd.', nik: '0000000000000079', nip: '199504182025212062', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 80, tipePegawai: 'ASN', nama: 'TYAS ENGGARIN SURYO, S.Ak.', nik: '0000000000000080', nip: '199609292025211051', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 81, tipePegawai: 'ASN', nama: 'JUNIOR SENJA', nik: '0000000000000081', nip: '199806092025211037', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 82, tipePegawai: 'ASN', nama: 'ARIFIN RAJ SANDA', nik: '0000000000000082', nip: '199811122025211003', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'arifin.raj.sanda@setwan.test', loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Pengadministrasi Perkantoran', kategori: 'PELAKSANA', unitKerja: 'Sub Bagian Tata Usaha dan Kepegawaian', mulai: '2025-01-02', sk: null }] },
  { id: 83, tipePegawai: 'ASN', nama: 'DIDIK SETIAWAN', nik: '0000000000000083', nip: '200005022025211021', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 84, tipePegawai: 'ASN', nama: 'SYARIF HIDAYATULLAH', nik: '0000000000000084', nip: '200312132025211002', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: null, loginStatus: 'PENDING_VERIFICATION', unitTypeId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [] },
  { id: 85, tipePegawai: 'ASN', nama: 'PRAWERTI PRAJNAJATI, S.H., M.H.', nik: '0000000000000085', nip: '', alamat: '', hp: '', jabatanId: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', roleId: 2, fraksiId: null, partaiId: null, dapilId: null, email: 'prawerti.prajnajati@dprd-magelangkota.go.id', loginStatus: 'DEACTIVATED', unitTypeId: 'e22dc7ee-130c-5e24-a7fa-defa2e721a76',
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Sekretaris DPRD', kategori: 'STRUKTURAL', unitKerja: 'Sekretariat DPRD', mulai: '2019-08-01', sk: null }, { jabatan: 'Sekretaris Bukan Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }, { jabatan: 'Sekretaris Bukan Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }, { jabatan: 'Sekretaris Bukan Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Pembentukan Peraturan Daerah', mulai: '2024-10-01', sk: null }] }
];

function pegawaiLoadList(){
  try{
    var storedVersion = localStorage.getItem(PEGAWAI_VERSION_KEY);
    if(storedVersion === String(PEGAWAI_SEED_VERSION)){
      var raw = localStorage.getItem(PEGAWAI_STORAGE_KEY);
      if(raw){
        var parsed = JSON.parse(raw);
        if(Array.isArray(parsed) && parsed.length) return parsed;
      }
    }
  } catch(e){}
  var seed = JSON.parse(JSON.stringify(PEGAWAI_DEFAULT_LIST));
  pegawaiSaveList(seed);
  try{ localStorage.setItem(PEGAWAI_VERSION_KEY, String(PEGAWAI_SEED_VERSION)); } catch(e){}
  return seed;
}
function pegawaiSaveList(list){
  try{ localStorage.setItem(PEGAWAI_STORAGE_KEY, JSON.stringify(list)); } catch(e){}
}
function pegawaiNextId(list){
  var max = 0;
  list.forEach(function(p){ if(p.id > max) max = p.id; });
  return max + 1;
}
function pegawaiFindById(list, id){
  return list.find(function(p){ return p.id === id; });
}
