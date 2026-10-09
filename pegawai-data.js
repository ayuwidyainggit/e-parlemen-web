// Data referensi Pegawai (prototipe), dipakai oleh master-pegawai.html, pengguna-buat.html,
// master-dapil.html & laporan-duk.html.
// Disimpan di localStorage supaya data pegawai tetap ada setelah reload.
// tipePegawai membedakan dua populasi dengan struktur data berbeda:
//  - 'Politisi' (Anggota DPRD): butuh fraksiId/dapilId, field ASN selalu null.
//  - 'ASN' (Sekretariat): butuh pangkat/golongan/status kepegawaian, fraksiId/dapilId selalu null.
//
// Seed di bawah diisi dari data/persons.json (52 orang: 25 Dewan + 27 Setwan, sesuai
// data/README.md) - lihat data/ untuk sumber & tabel relasi lengkap (periods, parties,
// unit_types, org_units, positions, unit_type_positions, assignments).
// Field yang TIDAK ada di data/persons.json (nik, alamat, hp, pangkat/golongan/TMT, biodata,
// jabatanId detail per orang) diisi null/placeholder - lihat catatan per field:
//  - nik: placeholder 16-digit (bukan NIK asli - sumber data tidak menyediakan NIK).
//  - nip: employee_number_nip (Setwan) / member_code (Dewan) dari sumber - sudah asli.
//  - jabatanId: default 'jab-3' (Anggota DPRD) utk semua Dewan, 'jab-12' utk semua Setwan -
//    posisi riil per orang butuh data/positions.json + data/assignments.json (belum diolah,
//    lihat Laporan DUK/Master Jabatan utk model jabatan yang sudah ada).
//  - fraksiId: dipetakan dari party_id sumber via kode partai; null jika partai tidak punya
//    entri Fraksi yang cocok di fraksi-data.js (mis. Fraksi Demokrat belum terdaftar di sana).
//  - pangkat/golongan/TMT/biodata (tanggal lahir, pendidikan, dst): null - tidak tersedia di
//    data/persons.json.
var PEGAWAI_STORAGE_KEY = 'ep_master_pegawai_list';
// Naikkan versi ini setiap kali PEGAWAI_DEFAULT_LIST diganti (mis. sumber seed baru) supaya
// browser yang masih menyimpan data lama di localStorage otomatis di-reseed, tanpa perlu
// localStorage.clear() manual. Edit yang sudah dibuat lewat form tetap tersimpan selama versi
// seed tidak berubah.
var PEGAWAI_SEED_VERSION = 5;
var PEGAWAI_VERSION_KEY = 'ep_master_pegawai_seed_version';
var PEGAWAI_DEFAULT_LIST = [
  { id: 1, tipePegawai: 'Politisi', nama: 'NARISQA', nik: '0000000000000001', nip: 'DPRD-AGT-0001', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 2, partaiId: '987362f7-493a-4508-977f-45637f3a175c', dapilId: 'DAPIL-1',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Fraksi PDI Perjuangan', mulai: '2024-08-01', sk: null }, { jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Komisi C', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }] },
  { id: 2, tipePegawai: 'Politisi', nama: 'ATANG KUSTIONO, S.T.', nik: '0000000000000002', nip: 'DPRD-AGT-0002', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 2, partaiId: '987362f7-493a-4508-977f-45637f3a175c', dapilId: 'DAPIL-2',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Fraksi PDI Perjuangan', mulai: '2024-08-01', sk: null }, { jabatan: 'Sekretaris', kategori: 'KELOMPOK', unitKerja: 'Komisi A', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }] },
  { id: 3, tipePegawai: 'Politisi', nama: 'SLAMET BAMBANG SULISTYO, S.Sos., M.M.', nik: '0000000000000003', nip: 'DPRD-AGT-0003', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 2, partaiId: '987362f7-493a-4508-977f-45637f3a175c', dapilId: 'DAPIL-3',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Sekretaris', kategori: 'KELOMPOK', unitKerja: 'Fraksi PDI Perjuangan', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi A', mulai: '2024-10-01', sk: null }, { jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Badan Pembentukan Peraturan Daerah', mulai: '2024-10-01', sk: null }] },
  { id: 4, tipePegawai: 'Politisi', nama: 'EVIN SEPTA HARYANTO KAMIL, S.H.', nik: '0000000000000004', nip: 'DPRD-AGT-0004', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 2, partaiId: '987362f7-493a-4508-977f-45637f3a175c', dapilId: 'DAPIL-1',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Pimpinan DPRD', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Fraksi PDI Perjuangan', mulai: '2024-08-01', sk: null }, { jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }, { jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }] },
  { id: 5, tipePegawai: 'Politisi', nama: 'DELLA SETYA MAHARANI', nik: '0000000000000005', nip: 'DPRD-AGT-0005', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 2, partaiId: '987362f7-493a-4508-977f-45637f3a175c', dapilId: 'DAPIL-2',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Fraksi PDI Perjuangan', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi B', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Pembentukan Peraturan Daerah', mulai: '2024-10-01', sk: null }] },
  { id: 6, tipePegawai: 'Politisi', nama: 'KEVIN MAHESA AMUWARDHANI, S.H.', nik: '0000000000000006', nip: 'DPRD-AGT-0006', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 2, partaiId: '987362f7-493a-4508-977f-45637f3a175c', dapilId: 'DAPIL-3',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Fraksi PDI Perjuangan', mulai: '2024-08-01', sk: null }, { jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Komisi B', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }] },
  { id: 7, tipePegawai: 'Politisi', nama: 'LEXIANO GAMMA PRADITYA', nik: '0000000000000007', nip: 'DPRD-AGT-0007', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 2, partaiId: '987362f7-493a-4508-977f-45637f3a175c', dapilId: 'DAPIL-1',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Fraksi PDI Perjuangan', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi C', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }, { jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Badan Kehormatan', mulai: '2024-10-01', sk: null }] },
  { id: 8, tipePegawai: 'Politisi', nama: 'TITIEK UTAMI, S.Sos., M.M.', nik: '0000000000000008', nip: 'DPRD-AGT-0008', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 1, partaiId: '31fdb48d-dd2b-40ba-ad2e-5f193eca14e4', dapilId: 'DAPIL-2',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Fraksi Golkar', mulai: '2024-08-01', sk: null }, { jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Komisi A', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }] },
  { id: 9, tipePegawai: 'Politisi', nama: 'VENTJE JEHEZKIEL ROGI, S.Pd.', nik: '0000000000000009', nip: 'DPRD-AGT-0009', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 1, partaiId: '31fdb48d-dd2b-40ba-ad2e-5f193eca14e4', dapilId: 'DAPIL-3',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Fraksi Golkar', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi C', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }, { jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Badan Kehormatan', mulai: '2024-10-01', sk: null }] },
  { id: 10, tipePegawai: 'Politisi', nama: 'TYAS ANGGRAENI BP, S.E., M.Sc.', nik: '0000000000000010', nip: 'DPRD-AGT-0010', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 1, partaiId: '31fdb48d-dd2b-40ba-ad2e-5f193eca14e4', dapilId: 'DAPIL-1',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Sekretaris', kategori: 'KELOMPOK', unitKerja: 'Fraksi Golkar', mulai: '2024-08-01', sk: null }, { jabatan: 'Sekretaris', kategori: 'KELOMPOK', unitKerja: 'Komisi C', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Pembentukan Peraturan Daerah', mulai: '2024-10-01', sk: null }] },
  { id: 11, tipePegawai: 'Politisi', nama: 'MUH HARJADI, S.H.', nik: '0000000000000011', nip: 'DPRD-AGT-0011', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 1, partaiId: '31fdb48d-dd2b-40ba-ad2e-5f193eca14e4', dapilId: 'DAPIL-2',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Fraksi Golkar', mulai: '2024-08-01', sk: null }, { jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Komisi B', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Pembentukan Peraturan Daerah', mulai: '2024-10-01', sk: null }] },
  { id: 12, tipePegawai: 'Politisi', nama: 'H.I.R JATMIKO, S.H., M.M.', nik: '0000000000000012', nip: 'DPRD-AGT-0012', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 1, partaiId: '31fdb48d-dd2b-40ba-ad2e-5f193eca14e4', dapilId: 'DAPIL-3',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Fraksi Golkar', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi A', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }] },
  { id: 13, tipePegawai: 'Politisi', nama: 'Hj. YUNITA BUDI CHRISSANNI, S.H., M.Kn.', nik: '0000000000000013', nip: 'DPRD-AGT-0013', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 4, partaiId: 'fd36e66b-71f3-4296-93f5-031c404aed4d', dapilId: 'DAPIL-1',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Fraksi Kebangkitan Bangsa', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi B', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }] },
  { id: 14, tipePegawai: 'Politisi', nama: 'H. SALLAFUDIN, S.E.', nik: '0000000000000014', nip: 'DPRD-AGT-0014', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 4, partaiId: 'fd36e66b-71f3-4296-93f5-031c404aed4d', dapilId: 'DAPIL-2',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Fraksi Kebangkitan Bangsa', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi C', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Pembentukan Peraturan Daerah', mulai: '2024-10-01', sk: null }] },
  { id: 15, tipePegawai: 'Politisi', nama: 'FEBRIAN PRABOWO', nik: '0000000000000015', nip: 'DPRD-AGT-0015', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 4, partaiId: 'fd36e66b-71f3-4296-93f5-031c404aed4d', dapilId: 'DAPIL-3',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Sekretaris', kategori: 'KELOMPOK', unitKerja: 'Fraksi Kebangkitan Bangsa', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi A', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Kehormatan', mulai: '2024-10-01', sk: null }] },
  { id: 16, tipePegawai: 'Politisi', nama: 'IMAM INDRA SETYAWAN, S.E., M.M.', nik: '0000000000000016', nip: 'DPRD-AGT-0016', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 4, partaiId: 'fd36e66b-71f3-4296-93f5-031c404aed4d', dapilId: 'DAPIL-1',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Pimpinan DPRD', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Fraksi Kebangkitan Bangsa', mulai: '2024-08-01', sk: null }, { jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }, { jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }] },
  { id: 17, tipePegawai: 'Politisi', nama: 'ACHMAD WIDODO', nik: '0000000000000017', nip: 'DPRD-AGT-0017', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 5, partaiId: '13f397f7-0c35-4b9d-aa61-29a77a999809', dapilId: 'DAPIL-2',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Fraksi PKS', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi B', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Pembentukan Peraturan Daerah', mulai: '2024-10-01', sk: null }] },
  { id: 18, tipePegawai: 'Politisi', nama: 'IMAM MUSAECHONI', nik: '0000000000000018', nip: 'DPRD-AGT-0018', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 5, partaiId: '13f397f7-0c35-4b9d-aa61-29a77a999809', dapilId: 'DAPIL-3',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Sekretaris', kategori: 'KELOMPOK', unitKerja: 'Fraksi PKS', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi C', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }] },
  { id: 19, tipePegawai: 'Politisi', nama: 'BUSTANUL ARIFIN, S.T.', nik: '0000000000000019', nip: 'DPRD-AGT-0019', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 5, partaiId: '13f397f7-0c35-4b9d-aa61-29a77a999809', dapilId: 'DAPIL-1',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Pimpinan DPRD', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Fraksi PKS', mulai: '2024-08-01', sk: null }, { jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }, { jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }] },
  { id: 20, tipePegawai: 'Politisi', nama: 'Y. IG. MARJI NUGROHO, S.E.', nik: '0000000000000020', nip: 'DPRD-AGT-0020', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: null, partaiId: 'cad6afb3-180b-4bdc-b958-60be86ac482f', dapilId: 'DAPIL-2',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Fraksi Demokrat', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi C', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Pembentukan Peraturan Daerah', mulai: '2024-10-01', sk: null }] },
  { id: 21, tipePegawai: 'Politisi', nama: 'WALUYO', nik: '0000000000000021', nip: 'DPRD-AGT-0021', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: null, partaiId: 'cad6afb3-180b-4bdc-b958-60be86ac482f', dapilId: 'DAPIL-3',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Sekretaris', kategori: 'KELOMPOK', unitKerja: 'Fraksi Demokrat', mulai: '2024-08-01', sk: null }, { jabatan: 'Sekretaris', kategori: 'KELOMPOK', unitKerja: 'Komisi B', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }] },
  { id: 22, tipePegawai: 'Politisi', nama: 'DIAN MEGA ARYANI, S.E., M.M.', nik: '0000000000000022', nip: 'DPRD-AGT-0022', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: null, partaiId: 'cad6afb3-180b-4bdc-b958-60be86ac482f', dapilId: 'DAPIL-1',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Fraksi Demokrat', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi A', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }] },
  { id: 23, tipePegawai: 'Politisi', nama: 'NELLA KARNELA YUNISSARI, S.H., M.H.', nik: '0000000000000023', nip: 'DPRD-AGT-0023', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 3, partaiId: '88f578b5-75aa-4f58-9f89-e39ad2b45870', dapilId: 'DAPIL-2',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Ketua', kategori: 'KELOMPOK', unitKerja: 'Fraksi Gerindra', mulai: '2024-08-01', sk: null }, { jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Komisi C', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }] },
  { id: 24, tipePegawai: 'Politisi', nama: 'YUSUF SUSILO, S.H.', nik: '0000000000000024', nip: 'DPRD-AGT-0024', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 3, partaiId: '88f578b5-75aa-4f58-9f89-e39ad2b45870', dapilId: 'DAPIL-3',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Sekretaris', kategori: 'KELOMPOK', unitKerja: 'Fraksi Gerindra', mulai: '2024-08-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Komisi B', mulai: '2024-10-01', sk: null }, { jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Badan Pembentukan Peraturan Daerah', mulai: '2024-10-01', sk: null }] },
  { id: 25, tipePegawai: 'Politisi', nama: 'ADI CHANDRA PAMUNGKAS, A.Md.', nik: '0000000000000025', nip: 'DPRD-AGT-0025', alamat: '', hp: '', jabatanId: 'jab-3', roleId: 3, fraksiId: 3, partaiId: '88f578b5-75aa-4f58-9f89-e39ad2b45870', dapilId: 'DAPIL-1',
    statusKepegawaian: null, pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Fraksi Gerindra', mulai: '2024-08-01', sk: null }, { jabatan: 'Wakil Ketua', kategori: 'KELOMPOK', unitKerja: 'Komisi A', mulai: '2024-10-01', sk: null }, { jabatan: 'Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }] },
  { id: 26, tipePegawai: 'ASN', nama: 'INDAH DWIANTARI, S.Sos.', nik: '0000000000000026', nip: '197204291997032002', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Sekretaris DPRD', kategori: 'STRUKTURAL', unitKerja: 'Sekretariat DPRD', mulai: '2025-01-02', sk: null }] },
  { id: 27, tipePegawai: 'ASN', nama: 'TRI WINARNO, S.E.', nik: '0000000000000027', nip: '197307221997031003', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Kepala Bagian', kategori: 'STRUKTURAL', unitKerja: 'Bagian Umum', mulai: '2025-01-02', sk: null }] },
  { id: 28, tipePegawai: 'ASN', nama: 'RUMIYATI, S.Sos., M.M.', nik: '0000000000000028', nip: '196910291990032003', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Kepala Bagian', kategori: 'STRUKTURAL', unitKerja: 'Bagian Keuangan', mulai: '2025-01-02', sk: null }] },
  { id: 29, tipePegawai: 'ASN', nama: 'CATUR ADI SUBAGIO, S.H.', nik: '0000000000000029', nip: '196805301990011001', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Kepala Bagian', kategori: 'STRUKTURAL', unitKerja: 'Bagian Persidangan dan Perundang-undangan', mulai: '2025-01-02', sk: null }] },
  { id: 30, tipePegawai: 'ASN', nama: 'HERY PURWOKO, S.E.', nik: '0000000000000030', nip: '197411302006041015', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Kepala Sub Bagian', kategori: 'STRUKTURAL', unitKerja: 'Sub Bagian Rumah Tangga dan Perlengkapan', mulai: '2025-01-02', sk: null }] },
  { id: 31, tipePegawai: 'ASN', nama: 'AMIRUDDIN CHAIRUL HADI, S.H.', nik: '0000000000000031', nip: '198612102015021002', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Kepala Sub Bagian', kategori: 'STRUKTURAL', unitKerja: 'Sub Bagian Tata Usaha dan Kepegawaian', mulai: '2025-01-02', sk: null }] },
  { id: 32, tipePegawai: 'ASN', nama: 'DWI LESTARI', nik: '0000000000000032', nip: '196706051986032002', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Pengadministrasi Perkantoran', kategori: 'PELAKSANA', unitKerja: 'Sub Bagian Rumah Tangga dan Perlengkapan', mulai: '2025-01-02', sk: null }] },
  { id: 33, tipePegawai: 'ASN', nama: 'AGUS SANTOSO', nik: '0000000000000033', nip: '197508052006041015', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Operator Layanan Operasional', kategori: 'PELAKSANA', unitKerja: 'Sub Bagian Rumah Tangga dan Perlengkapan', mulai: '2025-01-02', sk: null }] },
  { id: 34, tipePegawai: 'ASN', nama: 'KABUL LAKSONO', nik: '0000000000000034', nip: '197008222008011006', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Operator Layanan Operasional', kategori: 'PELAKSANA', unitKerja: 'Sub Bagian Rumah Tangga dan Perlengkapan', mulai: '2025-01-02', sk: null }] },
  { id: 35, tipePegawai: 'ASN', nama: 'LUCKIE ADITYA RACHMA, S.E.', nik: '0000000000000035', nip: '199206072024211004', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Pranata Humas Ahli Pertama', kategori: 'FUNGSIONAL', unitKerja: 'Sub Bagian Tata Usaha dan Kepegawaian', mulai: '2025-01-02', sk: null }] },
  { id: 36, tipePegawai: 'ASN', nama: 'CRISTIAN NISA YANSEN, S.Kom.', nik: '0000000000000036', nip: '198710092024211003', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Pranata Komputer Ahli Pertama', kategori: 'FUNGSIONAL', unitKerja: 'Sub Bagian Tata Usaha dan Kepegawaian', mulai: '2025-01-02', sk: null }] },
  { id: 37, tipePegawai: 'ASN', nama: 'SUROTO', nik: '0000000000000037', nip: '197102092010011001', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Pengadministrasi Perkantoran', kategori: 'PELAKSANA', unitKerja: 'Sub Bagian Tata Usaha dan Kepegawaian', mulai: '2025-01-02', sk: null }] },
  { id: 38, tipePegawai: 'ASN', nama: 'ARIFIN RAJ SANDA', nik: '0000000000000038', nip: '199811122025211003', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Pengadministrasi Perkantoran', kategori: 'PELAKSANA', unitKerja: 'Sub Bagian Tata Usaha dan Kepegawaian', mulai: '2025-01-02', sk: null }] },
  { id: 39, tipePegawai: 'ASN', nama: 'SUPARJAN', nik: '0000000000000039', nip: '196707242007011013', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Operator Layanan Operasional', kategori: 'PELAKSANA', unitKerja: 'Sub Bagian Tata Usaha dan Kepegawaian', mulai: '2025-01-02', sk: null }] },
  { id: 40, tipePegawai: 'ASN', nama: 'MUH FAUZI', nik: '0000000000000040', nip: '198103202010011003', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Operator Layanan Operasional', kategori: 'PELAKSANA', unitKerja: 'Sub Bagian Tata Usaha dan Kepegawaian', mulai: '2025-01-02', sk: null }] },
  { id: 41, tipePegawai: 'ASN', nama: 'TITIK SETIYANINGRUM, S.E.', nik: '0000000000000041', nip: '197204121994032005', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Analis Kebijakan Ahli Muda', kategori: 'FUNGSIONAL', unitKerja: 'Bagian Keuangan', mulai: '2025-01-02', sk: null }] },
  { id: 42, tipePegawai: 'ASN', nama: 'SWASTI KUSUMA DEWI, S.E.', nik: '0000000000000042', nip: '197709012010012004', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Analis Kebijakan Ahli Muda', kategori: 'FUNGSIONAL', unitKerja: 'Bagian Keuangan', mulai: '2025-01-02', sk: null }] },
  { id: 43, tipePegawai: 'ASN', nama: 'TITIK SUSDARWATI, A.Md.', nik: '0000000000000043', nip: '197001082003122005', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Penelaah Teknis Kebijakan', kategori: 'PELAKSANA', unitKerja: 'Bagian Keuangan', mulai: '2025-01-02', sk: null }] },
  { id: 44, tipePegawai: 'ASN', nama: 'MOH TOYIBAN', nik: '0000000000000044', nip: '198001202025211004', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Pengadministrasi Perkantoran', kategori: 'PELAKSANA', unitKerja: 'Bagian Keuangan', mulai: '2025-01-02', sk: null }] },
  { id: 45, tipePegawai: 'ASN', nama: 'PUTRO BAGUS PRASETIYO, S.H.', nik: '0000000000000045', nip: '198308102010011023', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Perisalah Legislatif Ahli Muda', kategori: 'FUNGSIONAL', unitKerja: 'Bagian Persidangan dan Perundang-undangan', mulai: '2025-01-02', sk: null }] },
  { id: 46, tipePegawai: 'ASN', nama: 'RACHMITA BUNGA PURI D, S.E.', nik: '0000000000000046', nip: '198902142024212006', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Perisalah Legislatif Ahli Pertama', kategori: 'FUNGSIONAL', unitKerja: 'Bagian Persidangan dan Perundang-undangan', mulai: '2025-01-02', sk: null }] },
  { id: 47, tipePegawai: 'ASN', nama: 'FAUZZIAH ANIS NUR S, S.E.', nik: '0000000000000047', nip: '199310162024212003', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Perisalah Legislatif Ahli Pertama', kategori: 'FUNGSIONAL', unitKerja: 'Bagian Persidangan dan Perundang-undangan', mulai: '2025-01-02', sk: null }] },
  { id: 48, tipePegawai: 'ASN', nama: 'UUS SOLIKHUDIN, S.H.', nik: '0000000000000048', nip: '198805182025211011', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Perisalah Legislatif Ahli Pertama', kategori: 'FUNGSIONAL', unitKerja: 'Bagian Persidangan dan Perundang-undangan', mulai: '2025-01-02', sk: null }] },
  { id: 49, tipePegawai: 'ASN', nama: 'HASMAN KURNIYAWAN, S.Pd.', nik: '0000000000000049', nip: '198812102025211012', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Perisalah Legislatif Ahli Pertama', kategori: 'FUNGSIONAL', unitKerja: 'Bagian Persidangan dan Perundang-undangan', mulai: '2025-01-02', sk: null }] },
  { id: 50, tipePegawai: 'ASN', nama: 'PANCA ARIANA, S.H.', nik: '0000000000000050', nip: '197902222010012001', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Penyusun Materi Hukum dan Perundang-undangan', kategori: 'PELAKSANA', unitKerja: 'Bagian Persidangan dan Perundang-undangan', mulai: '2025-01-02', sk: null }] },
  { id: 51, tipePegawai: 'ASN', nama: 'PRIHATINI, A.Md.A.Pkt.', nik: '0000000000000051', nip: '198911022024212004', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PPPK', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Asisten Perisalah Legislatif Terampil', kategori: 'FUNGSIONAL', unitKerja: 'Bagian Persidangan dan Perundang-undangan', mulai: '2025-01-02', sk: null }] },
  { id: 52, tipePegawai: 'ASN', nama: 'PRAWERTI PRAJNAJATI, S.H., M.H.', nik: '0000000000000052', nip: '', alamat: '', hp: '', jabatanId: 'jab-12', roleId: 2, fraksiId: null, partaiId: null, dapilId: null,
    statusKepegawaian: 'PNS', pangkat: null, golongan: null, tmtGolongan: null, tmtPertama: null,
    tanggalLahir: null, tempatLahir: null, jenisKelamin: null, agama: null, pendidikan: null, tahunLulus: null, foto: null,
    assignments: [{ jabatan: 'Sekretaris Bukan Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Anggaran', mulai: '2024-10-01', sk: null }, { jabatan: 'Sekretaris Bukan Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Musyawarah', mulai: '2024-10-01', sk: null }, { jabatan: 'Sekretaris Bukan Anggota', kategori: 'KELOMPOK', unitKerja: 'Badan Pembentukan Peraturan Daerah', mulai: '2024-10-01', sk: null }] }
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
