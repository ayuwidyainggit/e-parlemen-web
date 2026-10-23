// Data Penugasan Dapil & Reses (prototipe), dipakai oleh penugasan-dapil-reses.html.
// Muat pegawai-data.js, dapil-data.js, fraksi-data.js & periode-reses-data.js SEBELUM file ini.
//
// Bagian 1: Riwayat Penugasan Dapil (mengikuti pola `dapil_assignments` di
// docs/ddl-dapil-dan-dapil-assignments.sql) - dapilId AKTIF tetap disimpan di field
// pegawai-data.js (satu sumber kebenaran untuk "dapil saat ini"), file ini HANYA
// menambah riwayat (siapa pindah ke dapil apa, kapan, SK berapa) setiap kali admin
// mengubah penugasan lewat Tab "Penugasan Dapil".
var DAPIL_ASSIGN_HISTORY_KEY = 'ep_dapil_assignment_history';
var DAPIL_ASSIGN_HISTORY_SEED = [
  { id: 1, personId: 1, dapilKode: 'DAPIL-1', mulai: '2024-10-01', skNomor: 'SK.188/01/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 2, personId: 2, dapilKode: 'DAPIL-2', mulai: '2024-10-01', skNomor: 'SK.188/02/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 3, personId: 3, dapilKode: 'DAPIL-3', mulai: '2024-10-01', skNomor: 'SK.188/03/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 4, personId: 4, dapilKode: 'DAPIL-1', mulai: '2024-10-01', skNomor: 'SK.188/04/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 5, personId: 5, dapilKode: 'DAPIL-2', mulai: '2024-10-01', skNomor: 'SK.188/05/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 6, personId: 6, dapilKode: 'DAPIL-3', mulai: '2024-10-01', skNomor: 'SK.188/06/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 7, personId: 7, dapilKode: 'DAPIL-1', mulai: '2024-10-01', skNomor: 'SK.188/07/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 8, personId: 8, dapilKode: 'DAPIL-2', mulai: '2024-10-01', skNomor: 'SK.188/08/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 9, personId: 9, dapilKode: 'DAPIL-3', mulai: '2024-10-01', skNomor: 'SK.188/09/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 10, personId: 10, dapilKode: 'DAPIL-1', mulai: '2024-10-01', skNomor: 'SK.188/10/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 11, personId: 11, dapilKode: 'DAPIL-2', mulai: '2024-10-01', skNomor: 'SK.188/11/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 12, personId: 12, dapilKode: 'DAPIL-3', mulai: '2024-10-01', skNomor: 'SK.188/12/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 13, personId: 13, dapilKode: 'DAPIL-1', mulai: '2024-10-01', skNomor: 'SK.188/13/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 14, personId: 14, dapilKode: 'DAPIL-2', mulai: '2024-10-01', skNomor: 'SK.188/14/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 15, personId: 15, dapilKode: 'DAPIL-3', mulai: '2024-10-01', skNomor: 'SK.188/15/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 16, personId: 16, dapilKode: 'DAPIL-1', mulai: '2024-10-01', skNomor: 'SK.188/16/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 17, personId: 17, dapilKode: 'DAPIL-2', mulai: '2024-10-01', skNomor: 'SK.188/17/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 18, personId: 18, dapilKode: 'DAPIL-3', mulai: '2024-10-01', skNomor: 'SK.188/18/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 19, personId: 19, dapilKode: 'DAPIL-1', mulai: '2024-10-01', skNomor: 'SK.188/19/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 20, personId: 20, dapilKode: 'DAPIL-2', mulai: '2024-10-01', skNomor: 'SK.188/20/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 21, personId: 21, dapilKode: 'DAPIL-3', mulai: '2024-10-01', skNomor: 'SK.188/21/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 22, personId: 22, dapilKode: 'DAPIL-1', mulai: '2024-10-01', skNomor: 'SK.188/22/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 23, personId: 23, dapilKode: 'DAPIL-2', mulai: '2024-10-01', skNomor: 'SK.188/23/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 24, personId: 24, dapilKode: 'DAPIL-3', mulai: '2024-10-01', skNomor: 'SK.188/24/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' },
  { id: 25, personId: 25, dapilKode: 'DAPIL-1', mulai: '2024-10-01', skNomor: 'SK.188/25/2024', catatan: 'Penetapan awal Periode 2024-2029', createdAt: '2024-10-01T09:00:00' }
];

function dapilAssignHistoryLoadList(){
  try{
    var raw = localStorage.getItem(DAPIL_ASSIGN_HISTORY_KEY);
    if(raw){
      var parsed = JSON.parse(raw);
      if(Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch(e){}
  var seed = JSON.parse(JSON.stringify(DAPIL_ASSIGN_HISTORY_SEED));
  dapilAssignHistorySaveList(seed);
  return seed;
}
function dapilAssignHistorySaveList(list){
  try{ localStorage.setItem(DAPIL_ASSIGN_HISTORY_KEY, JSON.stringify(list)); } catch(e){}
}
function dapilAssignHistoryNextId(list){
  var max = 0;
  list.forEach(function(h){ if(h.id > max) max = h.id; });
  return max + 1;
}

// Bagian 2: Penugasan - admin (Ketua/Pimpinan, lihat "Login sebagai" di halaman) menugaskan
// SIAPA (Anggota) bertugas DI MANA & KAPAN, atas nama Jabatan Pimpinan yang dia pegang sendiri.
// Jenis RESES/KUNJUNGAN + Periode Reses + Pokir (field lama) DIHAPUS dari form - digantikan
// field "Jenis Penugasan" (lihat jenis-penugasan-data.js) yang bebas didefinisikan admin lewat
// Master Jenis Penugasan. Dapil TIDAK LAGI dipilih manual - otomatis ikut dapilId user yang
// "login" saat record dibuat (lihat dapilKode, hanya dipakai utk histori/laporan, bukan filter
// Anggota lagi - itu sekarang berdasarkan unitKerja Jabatan Pimpinan yang dipilih).
//
// Status (j.status) ditulis manual lewat form/aksi di halaman:
//  'Draft' | 'Submit' | 'Menunggu Approval' (submit baru, menunggu approver) |
//  'Butuh Approval' (sedang mengajukan pembatalan, menunggu approver) |
//  'Dibatalkan' (TERMINAL, pembatalan disetujui/tanpa perlu approval) |
//  'Ditolak' (TERMINAL, pengajuan submit ditolak approver)
// Status yang TAMPIL ke user (jadwalEffectiveStatus()) HANYA menghitung progres tanggal
// (Dalam Proses Penugasan/Lewat Masa Penugasan/Selesai) selama j.status === 'Submit' - status
// lain (Draft, Menunggu Approval, Butuh Approval, Dibatalkan, Ditolak) tampil apa adanya.
// approverIds: 1-3 id Pegawai yang levelnya (KELOMPOK, lihat jabatan-data.js) lebih tinggi dari
// user pembuat - kosong [] kalau user pembuat sudah di level paling atas (tidak perlu approval).
// pendingAction: null | 'CREATE' | 'ACTION' menandai approval yang sedang ditunggu itu untuk
// submit baru atau pembatalan; statusBeforeCancel menyimpan status sebelum "Butuh Approval"
// supaya bisa dikembalikan kalau pembatalan ditolak approver.
var RESES_JADWAL_STORAGE_KEY = 'ep_jadwal_penugasan_reses';
// Naikkan versi ini setiap kali RESES_JADWAL_DEFAULT_LIST diganti (mis. skema status baru)
// supaya browser yang masih menyimpan data lama di localStorage otomatis di-reseed.
var RESES_JADWAL_SEED_VERSION = 7;
var RESES_JADWAL_VERSION_KEY = 'ep_jadwal_penugasan_reses_seed_version';
// Level approval (lihat jadwalPersonMinLevel() di penugasan-dapil-reses.html) dihitung dari
// level KELOMPOK (jabatan-data.js: Ketua=1, Wakil Ketua=2, Sekretaris=3, Anggota=9) TERKECIL di
// antara seluruh `assignments` KELOMPOK milik orang itu (lihat pegawai-data.js) - siapapun yang
// pegang jabatan "Ketua" di UNIT APAPUN otomatis level 1 (paling atas, tidak perlu approval).
// Dihitung dari pegawai-data.js: 1 NARISQA=L1, 2 ATANG=L2, 3 SLAMET=L1, 4 EVIN=L1, 6 KEVIN=L1,
// 7 LEXIANO=L2, 8 TITIEK=L1, 10 TYAS=L3, 11 MUH HARJADI=L2 (dipakai sbg createdByUserId di bawah).
var RESES_JADWAL_DEFAULT_LIST = [
  { id: 1, personId: 10, dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Sekretaris', unitKerja: 'Komisi C' }], kegiatan: 'Pertemuan Masyarakat Dapil 1', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Kedungsari', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-11-03', jamMulai: '09:00', jamSelesai: '11:30', catatan: '', status: 'Submit', pendingAction: null, statusBeforeCancel: null, approverIds: [4], submittedByMember: true, createdByUserId: 10, createdAt: '2026-10-10T09:00:00' },
  { id: 2, personId: 1, dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Ketua', unitKerja: 'Pimpinan DPRD' }], kegiatan: 'Dialog Masyarakat Kelurahan Wates', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Wates', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-11-05', jamMulai: '09:30', jamSelesai: '12:00', catatan: '', status: 'Submit', pendingAction: null, statusBeforeCancel: null, approverIds: [], submittedByMember: true, createdByUserId: 4, createdAt: '2026-10-10T09:00:00' },
  { id: 3, personId: 2, dapilKode: 'DAPIL-2', jenisPenugasanId: 2, jabatanPimpinanList: [{ jabatan: 'Wakil Ketua', unitKerja: 'Komisi B' }], kegiatan: 'Kunjungan Lapangan Aula Kecamatan', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Magelang', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-12-15', jamMulai: '10:00', jamSelesai: '12:30', catatan: '', status: 'Submit', pendingAction: null, statusBeforeCancel: null, approverIds: [1], submittedByMember: false, createdByUserId: 11, createdAt: '2026-10-12T09:00:00' },
  { id: 4, personId: 3, dapilKode: 'DAPIL-3', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Ketua', unitKerja: 'Badan Pembentukan Peraturan Daerah' }], kegiatan: 'Pertemuan Masyarakat Tidar Selatan', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Tidar Selatan', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-10-25', jamMulai: '08:30', jamSelesai: '11:00', catatan: '', status: 'Submit', pendingAction: null, statusBeforeCancel: null, approverIds: [], submittedByMember: false, createdByUserId: 3, createdAt: '2026-10-15T09:00:00' },
  { id: 5, personId: 8, dapilKode: 'DAPIL-2', jenisPenugasanId: 3, jabatanPimpinanList: [{ jabatan: 'Ketua', unitKerja: 'Fraksi Golkar' }], kegiatan: 'Studi Banding Pengelolaan Pasar Rakyat', lokasiJenis: 'LUAR_KOTA', lokasiKelurahan: null, lokasiKabupaten: 'Kota Surakarta', lokasiProvinsi: 'Jawa Tengah', lokasiNegara: null, tanggalRencana: '2026-11-18', jamMulai: '08:00', jamSelesai: '16:00', catatan: 'Tindak lanjut aspirasi penataan lapak PKL', status: 'Draft', pendingAction: null, statusBeforeCancel: null, approverIds: [], submittedByMember: false, createdByUserId: 8, createdAt: '2026-10-18T09:00:00' },
  { id: 6, personId: 13, dapilKode: 'DAPIL-1', jenisPenugasanId: 2, jabatanPimpinanList: [{ jabatan: 'Ketua', unitKerja: 'Badan Anggaran' }], kegiatan: 'Kunjungan Fasilitas Kesehatan', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Kramat Utara', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-11-01', jamMulai: '09:00', jamSelesai: '11:00', catatan: '', status: 'Submit', pendingAction: null, statusBeforeCancel: null, approverIds: [], submittedByMember: true, createdByUserId: 4, createdAt: '2026-10-08T09:00:00' },
  { id: 7, personId: 17, dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Wakil Ketua', unitKerja: 'Badan Kehormatan' }], kegiatan: 'Dialog Masyarakat Jurangombo Utara', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Jurangombo Utara', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2027-01-13', jamMulai: '09:00', jamSelesai: '11:30', catatan: '', status: 'Submit', pendingAction: null, statusBeforeCancel: null, approverIds: [8], submittedByMember: false, createdByUserId: 7, createdAt: '2026-12-22T09:00:00' },
  { id: 8, personId: 23, dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Sekretaris', unitKerja: 'Fraksi Golkar' }], kegiatan: 'Penyerapan Aspirasi Rejowinangun Utara', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Rejowinangun Selatan', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-11-20', jamMulai: '10:00', jamSelesai: '12:00', catatan: 'Ditinjau ulang karena bertepatan dengan agenda Rapat Paripurna', status: 'Draft', pendingAction: null, statusBeforeCancel: null, approverIds: [], submittedByMember: false, createdByUserId: 10, createdAt: '2026-10-19T09:00:00' },
  { id: 9, personId: 7, dapilKode: 'DAPIL-2', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Wakil Ketua', unitKerja: 'Fraksi PDI Perjuangan' }], kegiatan: 'Pertemuan Masyarakat Jurangombo Selatan', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Jurangombo Selatan', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-10-24', jamMulai: '08:00', jamSelesai: '10:30', catatan: '', status: 'Menunggu Approval', pendingAction: 'CREATE', statusBeforeCancel: null, approverIds: [4], submittedByMember: false, createdByUserId: 2, createdAt: '2026-10-20T09:00:00' },
  { id: 10, personId: 19, dapilKode: 'DAPIL-1', jenisPenugasanId: 2, jabatanPimpinanList: [{ jabatan: 'Ketua', unitKerja: 'Komisi C' }], kegiatan: 'Kunjungan Lapangan Proyek Drainase', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Wates', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-09-12', jamMulai: '14:00', jamSelesai: '16:00', catatan: '', status: 'Lewat Masa Penugasan', pendingAction: null, statusBeforeCancel: null, approverIds: [], submittedByMember: false, createdByUserId: 1, createdAt: '2026-08-25T09:00:00' },
  { id: 11, personId: 5, dapilKode: 'DAPIL-1', jenisPenugasanId: 3, jabatanPimpinanList: [{ jabatan: 'Sekretaris', unitKerja: 'Komisi C' }], kegiatan: 'Kunjungan Kerja Posyandu Gelangan', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Gelangan', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-10-29', jamMulai: '09:00', jamSelesai: '11:00', catatan: 'Pengajuan pembatalan sedang menunggu approval - bentrok dengan agenda rapat', status: 'Butuh Approval', pendingAction: 'CANCEL', statusBeforeCancel: 'Submit', approverIds: [4], submittedByMember: false, createdByUserId: 10, createdAt: '2026-10-05T09:00:00' },
  { id: 12, personId: 20, dapilKode: 'DAPIL-2', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Anggota', unitKerja: 'Fraksi Golkar' }], kegiatan: 'Dialog Masyarakat Kramat Selatan', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Kramat Selatan', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-10-05', jamMulai: '09:00', jamSelesai: '11:00', catatan: 'Contoh pengajuan yang ditolak approver', status: 'Ditolak', pendingAction: null, statusBeforeCancel: null, approverIds: [8], submittedByMember: false, createdByUserId: 11, createdAt: '2026-09-28T09:00:00' },
  { id: 13, personId: 11, dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Anggota', unitKerja: 'Komisi C' }], kegiatan: 'Sosialisasi Program Kerja DPRD', lokasiJenis: 'LUAR_NEGERI', lokasiKelurahan: null, lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: 'Singapura', tanggalRencana: '2026-09-02', jamMulai: '08:00', jamSelesai: '17:00', catatan: 'Contoh penugasan yang sudah dibatalkan', status: 'Dibatalkan', pendingAction: null, statusBeforeCancel: null, approverIds: [8], submittedByMember: false, createdByUserId: 7, createdAt: '2026-08-20T09:00:00' }
];

function jadwalResesLoadList(){
  try{
    var storedVersion = localStorage.getItem(RESES_JADWAL_VERSION_KEY);
    if(storedVersion === String(RESES_JADWAL_SEED_VERSION)){
      var raw = localStorage.getItem(RESES_JADWAL_STORAGE_KEY);
      if(raw){
        var parsed = JSON.parse(raw);
        if(Array.isArray(parsed) && parsed.length) return parsed;
      }
    }
  } catch(e){}
  var seed = JSON.parse(JSON.stringify(RESES_JADWAL_DEFAULT_LIST));
  jadwalResesSaveList(seed);
  try{ localStorage.setItem(RESES_JADWAL_VERSION_KEY, String(RESES_JADWAL_SEED_VERSION)); } catch(e){}
  return seed;
}
function jadwalResesSaveList(list){
  try{ localStorage.setItem(RESES_JADWAL_STORAGE_KEY, JSON.stringify(list)); } catch(e){}
}
function jadwalResesNextId(list){
  var max = 0;
  list.forEach(function(j){ if(j.id > max) max = j.id; });
  return max + 1;
}
