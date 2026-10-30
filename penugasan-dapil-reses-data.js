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
// Status (j.status) ditulis manual lewat form/aksi di halaman - 6 nilai literal, TIDAK ADA
// progres otomatis berbasis tanggal:
//  'Draft' (Edit/Delete) | 'Menunggu Approval' (VIEW ONLY bagi pembuat - tidak bisa
//  diedit/dihapus/dibatalkan lagi, hanya Setujui/Tolak oleh approver) | 'Approve' (TERMINAL -
//  disetujui approver, atau langsung final kalau pembuat sudah level paling atas) | 'Cancel'
//  (TERMINAL, VIEW ONLY - status legacy, tidak lagi bisa dipicu lewat aksi apapun di halaman ini)
//  | 'Reject' (TERMINAL, VIEW ONLY - approver klik Tolak, WAJIB isi rejectReason, lihat
//  openRejectJadwal()/confirmRejectJadwal() di penugasan-dapil-reses.html) | 'Cancel by Anggota'
//  (TERMINAL, VIEW ONLY - otomatis begitu SEMUA record dengan batchId yang sama punya
//  anggotaResponse 'Tolak', lihat syncCancelByAnggota() - dijalankan tiap render, BUKAN tombol
//  aksi admin).
// rejectReason: string alasan penolakan, HANYA terisi saat status 'Reject' (direset ke null
// setiap kali record di-Simpan/diedit) - ditampilkan di bawah badge status pada tabel.
// batchId: id dari record PERTAMA yang dibuat dalam satu aksi Simpan multi-Anggota - dipakai utk
// mengelompokkan record yang berasal dari penugasan yang sama (1 Anggota = 1 record, lihat
// saveJadwal()) supaya aturan "SEMUA Anggota menolak" bisa dihitung per grup, bukan per record.
// anggotaResponse: null | 'Terima' | 'Tolak' - respon Anggota lewat aplikasi mobile (bukan dari
// halaman ini - kolom "Respon Anggota" di tabel VIEW ONLY, cuma menampilkan agregat per batchId:
// Menerima/Sebagian Menolak/Menolak), hanya relevan selama status 'Approve' (direset ke null
// setiap kali record di-Simpan/diedit).
// approverIds: 1-3 id Pegawai yang levelnya (KELOMPOK, lihat jabatan-data.js) lebih tinggi dari
// user pembuat - kosong [] kalau user pembuat sudah di level paling atas (tidak perlu approval).
var RESES_JADWAL_STORAGE_KEY = 'ep_jadwal_penugasan_reses';
// Naikkan versi ini setiap kali RESES_JADWAL_DEFAULT_LIST diganti (mis. skema status baru)
// supaya browser yang masih menyimpan data lama di localStorage otomatis di-reseed.
var RESES_JADWAL_SEED_VERSION = 20;
// noPenugasan: nomor penugasan freetext yang diisi admin lewat form - HARUS unik per batchId
// (lihat validasi di saveJadwal() pada penugasan-dapil-reses.html). Record dengan batchId yang
// sama (1 penugasan utk banyak Anggota) berbagi noPenugasan yang sama.
// approvedByUserId: id Pegawai (salah satu dari approverIds) yang BENAR-BENAR menekan
// Setujui/Tolak (approval tidak berjenjang - approver lain yg dipilih tapi tidak bertindak TIDAK
// tercatat di sini) - null selama belum ada keputusan, direset tiap record di-Simpan/diedit sama
// seperti rejectReason. Dipakai popup "Detail Approval" (lihat openApprovalDetail() di
// penugasan-dapil-reses.html) utk memberi flag badge Menyetujui/Menolak pada approver yg memutuskan.
// Contoh 2 approver: batch 1 (Approve, approverIds [4,37], approvedByUserId 4 = EVIN SEPTA selaku
// Ketua DPRD) & batch 12 (Reject, approverIds [4,37], approvedByUserId 37 = INDAH DWIANTARI selaku
// Ketua Sekretariat) - keduanya memang satu-satunya 2 Pucuk Pimpinan aktif di pegawai-data.js.
var RESES_JADWAL_VERSION_KEY = 'ep_jadwal_penugasan_reses_seed_version';
// Level approval (lihat jadwalPersonMinLevel() di penugasan-dapil-reses.html) dihitung dari
// level KELOMPOK (jabatan-data.js: Ketua=1, Wakil Ketua=2, Sekretaris=3, Anggota=9) TERKECIL di
// antara seluruh `assignments` KELOMPOK milik orang itu (lihat pegawai-data.js) - siapapun yang
// pegang jabatan "Ketua" di UNIT APAPUN otomatis level 1 (paling atas, tidak perlu approval).
// Dihitung dari pegawai-data.js: 1 NARISQA=L1, 2 ATANG=L2, 3 SLAMET=L1, 4 EVIN=L1, 6 KEVIN=L1,
// 7 LEXIANO=L2, 8 TITIEK=L1, 10 TYAS=L3, 11 MUH HARJADI=L2 (dipakai sbg createdByUserId di bawah).
var RESES_JADWAL_DEFAULT_LIST = [
  { id: 1, personId: 10, batchId: 1, noPenugasan: 'PGS-2026-001', dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Sekretaris', unitKerja: 'Komisi C' }], kegiatan: 'Pertemuan Masyarakat Dapil 1', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Kedungsari', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-11-03', jamMulai: '09:00', jamSelesai: '11:30', catatan: '', status: 'Approve', anggotaResponse: null, rejectReason: null, approverIds: [4, 37], approvedByUserId: 4, approvedAt: '2026-10-10T10:15:00', createdByUserId: 10, createdAt: '2026-10-10T09:00:00' },
  { id: 2, personId: 1, batchId: 2, noPenugasan: 'PGS-2026-002', dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Ketua', unitKerja: 'Pimpinan DPRD' }], kegiatan: 'Dialog Masyarakat Kelurahan Wates', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Wates', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-11-05', jamMulai: '09:30', jamSelesai: '12:00', catatan: '', status: 'Approve', anggotaResponse: 'Terima', rejectReason: null, approverIds: [], approvedByUserId: null, approvedAt: null, createdByUserId: 4, createdAt: '2026-10-10T09:00:00' },
  { id: 3, personId: 2, batchId: 3, noPenugasan: 'PGS-2026-003', dapilKode: 'DAPIL-2', jenisPenugasanId: 2, jabatanPimpinanList: [{ jabatan: 'Wakil Ketua', unitKerja: 'Komisi B' }], kegiatan: 'Kunjungan Lapangan Aula Kecamatan', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Magelang', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-12-15', jamMulai: '10:00', jamSelesai: '12:30', catatan: '', status: 'Approve', anggotaResponse: null, rejectReason: null, approverIds: [1], approvedByUserId: null, approvedAt: null, createdByUserId: 11, createdAt: '2026-10-12T09:00:00' },
  { id: 4, personId: 3, batchId: 4, noPenugasan: 'PGS-2026-004', dapilKode: 'DAPIL-3', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Ketua', unitKerja: 'Badan Pembentukan Peraturan Daerah' }], kegiatan: 'Pertemuan Masyarakat Tidar Selatan', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Tidar Selatan', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-10-25', jamMulai: '08:30', jamSelesai: '11:00', catatan: '', status: 'Approve', anggotaResponse: null, rejectReason: null, approverIds: [], approvedByUserId: null, approvedAt: null, createdByUserId: 3, createdAt: '2026-10-15T09:00:00' },
  { id: 5, personId: 8, batchId: 5, noPenugasan: 'PGS-2026-005', dapilKode: 'DAPIL-2', jenisPenugasanId: 3, jabatanPimpinanList: [{ jabatan: 'Ketua', unitKerja: 'Fraksi Golkar' }], kegiatan: 'Studi Banding Pengelolaan Pasar Rakyat', lokasiJenis: 'LUAR_KOTA', lokasiKelurahan: null, lokasiKabupaten: 'Kota Surakarta', lokasiProvinsi: 'Jawa Tengah', lokasiNegara: null, tanggalRencana: '2026-11-18', jamMulai: '08:00', jamSelesai: '16:00', catatan: 'Tindak lanjut aspirasi penataan lapak PKL', status: 'Draft', anggotaResponse: null, rejectReason: null, approverIds: [], approvedByUserId: null, approvedAt: null, createdByUserId: 8, createdAt: '2026-10-18T09:00:00' },
  { id: 6, personId: 13, batchId: 6, noPenugasan: 'PGS-2026-006', dapilKode: 'DAPIL-1', jenisPenugasanId: 2, jabatanPimpinanList: [{ jabatan: 'Ketua', unitKerja: 'Badan Anggaran' }], kegiatan: 'Kunjungan Fasilitas Kesehatan', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Kramat Utara', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-11-01', jamMulai: '09:00', jamSelesai: '11:00', catatan: 'Contoh pengajuan yang sedang menunggu approver - view only bagi pembuat', status: 'Menunggu Approval', anggotaResponse: null, rejectReason: null, approverIds: [4], approvedByUserId: null, approvedAt: null, createdByUserId: 4, createdAt: '2026-10-08T09:00:00' },
  { id: 7, personId: 17, batchId: 7, noPenugasan: 'PGS-2026-007', dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Wakil Ketua', unitKerja: 'Badan Kehormatan' }], kegiatan: 'Dialog Masyarakat Jurangombo Utara', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Jurangombo Utara', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2027-01-13', jamMulai: '09:00', jamSelesai: '11:30', catatan: '', status: 'Approve', anggotaResponse: 'Terima', rejectReason: null, approverIds: [8], approvedByUserId: null, approvedAt: null, createdByUserId: 7, createdAt: '2026-12-22T09:00:00' },
  { id: 8, personId: 23, batchId: 8, noPenugasan: 'PGS-2026-008', dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Sekretaris', unitKerja: 'Fraksi Golkar' }], kegiatan: 'Penyerapan Aspirasi Rejowinangun Utara', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Rejowinangun Selatan', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-11-20', jamMulai: '10:00', jamSelesai: '12:00', catatan: 'Ditinjau ulang karena bertepatan dengan agenda Rapat Paripurna', status: 'Draft', anggotaResponse: null, rejectReason: null, approverIds: [], approvedByUserId: null, approvedAt: null, createdByUserId: 10, createdAt: '2026-10-19T09:00:00' },
  { id: 9, personId: 7, batchId: 9, noPenugasan: 'PGS-2026-009', dapilKode: 'DAPIL-2', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Wakil Ketua', unitKerja: 'Fraksi PDI Perjuangan' }], kegiatan: 'Pertemuan Masyarakat Jurangombo Selatan', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Jurangombo Selatan', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-10-24', jamMulai: '08:00', jamSelesai: '10:30', catatan: '', status: 'Menunggu Approval', anggotaResponse: null, rejectReason: null, approverIds: [4], approvedByUserId: null, approvedAt: null, createdByUserId: 2, createdAt: '2026-10-20T09:00:00' },
  { id: 10, personId: 19, batchId: 10, noPenugasan: 'PGS-2026-010', dapilKode: 'DAPIL-1', jenisPenugasanId: 2, jabatanPimpinanList: [{ jabatan: 'Ketua', unitKerja: 'Komisi C' }], kegiatan: 'Kunjungan Lapangan Proyek Drainase', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Wates', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-09-12', jamMulai: '14:00', jamSelesai: '16:00', catatan: 'Contoh penugasan yang sudah di-Cancel oleh pembuat', status: 'Cancel', anggotaResponse: null, rejectReason: null, approverIds: [], approvedByUserId: null, approvedAt: null, createdByUserId: 1, createdAt: '2026-08-25T09:00:00' },
  { id: 11, personId: 5, batchId: 11, noPenugasan: 'PGS-2026-011', dapilKode: 'DAPIL-1', jenisPenugasanId: 3, jabatanPimpinanList: [{ jabatan: 'Sekretaris', unitKerja: 'Komisi C' }], kegiatan: 'Kunjungan Kerja Posyandu Gelangan', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Gelangan', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-10-29', jamMulai: '09:00', jamSelesai: '11:00', catatan: '', status: 'Menunggu Approval', anggotaResponse: null, rejectReason: null, approverIds: [4], approvedByUserId: null, approvedAt: null, createdByUserId: 10, createdAt: '2026-10-05T09:00:00' },
  { id: 12, personId: 20, batchId: 12, noPenugasan: 'PGS-2026-012', dapilKode: 'DAPIL-2', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Anggota', unitKerja: 'Fraksi Golkar' }], kegiatan: 'Dialog Masyarakat Kramat Selatan', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Kramat Selatan', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-10-05', jamMulai: '09:00', jamSelesai: '11:00', catatan: 'Contoh pengajuan yang ditolak approver', status: 'Reject', anggotaResponse: null, rejectReason: 'Bertepatan dengan agenda Rapat Paripurna, mohon diajukan ulang di tanggal lain.', approverIds: [4, 37], approvedByUserId: 37, approvedAt: '2026-09-29T14:20:00', createdByUserId: 11, createdAt: '2026-09-28T09:00:00' },
  { id: 13, personId: 11, batchId: 13, noPenugasan: 'PGS-2026-013', dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Anggota', unitKerja: 'Komisi C' }], kegiatan: 'Sosialisasi Program Kerja DPRD', lokasiJenis: 'LUAR_NEGERI', lokasiKelurahan: null, lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: 'Singapura', tanggalRencana: '2026-09-02', jamMulai: '08:00', jamSelesai: '17:00', catatan: 'Contoh penugasan masih draft', status: 'Draft', anggotaResponse: null, rejectReason: null, approverIds: [8], approvedByUserId: null, approvedAt: null, createdByUserId: 7, createdAt: '2026-08-20T09:00:00' },
  { id: 14, personId: 1, batchId: 14, noPenugasan: 'PGS-2026-014', dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Sekretaris', unitKerja: 'Komisi C' }], kegiatan: 'Reses Gabungan Dapil 1 - Wilayah Utara', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Kedungsari', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-11-10', jamMulai: '09:00', jamSelesai: '12:00', catatan: 'Contoh penugasan ber-5 Anggota - sebagian menolak lewat aplikasi mobile (lihat kolom Respon Anggota)', status: 'Approve', anggotaResponse: 'Tolak', rejectReason: null, approverIds: [4], approvedByUserId: null, approvedAt: null, createdByUserId: 10, createdAt: '2026-10-21T09:00:00' },
  { id: 15, personId: 2, batchId: 14, noPenugasan: 'PGS-2026-014', dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Sekretaris', unitKerja: 'Komisi C' }], kegiatan: 'Reses Gabungan Dapil 1 - Wilayah Utara', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Kedungsari', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-11-10', jamMulai: '09:00', jamSelesai: '12:00', catatan: 'Contoh penugasan ber-5 Anggota - sebagian menolak lewat aplikasi mobile (lihat kolom Respon Anggota)', status: 'Approve', anggotaResponse: 'Tolak', rejectReason: null, approverIds: [4], approvedByUserId: null, approvedAt: null, createdByUserId: 10, createdAt: '2026-10-21T09:00:00' },
  { id: 16, personId: 3, batchId: 14, noPenugasan: 'PGS-2026-014', dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Sekretaris', unitKerja: 'Komisi C' }], kegiatan: 'Reses Gabungan Dapil 1 - Wilayah Utara', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Kedungsari', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-11-10', jamMulai: '09:00', jamSelesai: '12:00', catatan: 'Contoh penugasan ber-5 Anggota - sebagian menolak lewat aplikasi mobile (lihat kolom Respon Anggota)', status: 'Approve', anggotaResponse: 'Tolak', rejectReason: null, approverIds: [4], approvedByUserId: null, approvedAt: null, createdByUserId: 10, createdAt: '2026-10-21T09:00:00' },
  { id: 17, personId: 4, batchId: 14, noPenugasan: 'PGS-2026-014', dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Sekretaris', unitKerja: 'Komisi C' }], kegiatan: 'Reses Gabungan Dapil 1 - Wilayah Utara', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Kedungsari', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-11-10', jamMulai: '09:00', jamSelesai: '12:00', catatan: 'Contoh penugasan ber-5 Anggota - sebagian menolak lewat aplikasi mobile (lihat kolom Respon Anggota)', status: 'Approve', anggotaResponse: 'Terima', rejectReason: null, approverIds: [4], approvedByUserId: null, approvedAt: null, createdByUserId: 10, createdAt: '2026-10-21T09:00:00' },
  { id: 18, personId: 5, batchId: 14, noPenugasan: 'PGS-2026-014', dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Sekretaris', unitKerja: 'Komisi C' }], kegiatan: 'Reses Gabungan Dapil 1 - Wilayah Utara', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Kedungsari', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-11-10', jamMulai: '09:00', jamSelesai: '12:00', catatan: 'Contoh penugasan ber-5 Anggota - sebagian menolak lewat aplikasi mobile (lihat kolom Respon Anggota)', status: 'Approve', anggotaResponse: 'Terima', rejectReason: null, approverIds: [4], approvedByUserId: null, approvedAt: null, createdByUserId: 10, createdAt: '2026-10-21T09:00:00' },
  { id: 19, personId: 6, batchId: 19, noPenugasan: 'PGS-2026-015', dapilKode: 'DAPIL-3', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Ketua', unitKerja: 'Komisi C' }], kegiatan: 'Reses Gabungan Dapil 3 - Wilayah Selatan', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Tidar Selatan', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-11-12', jamMulai: '09:00', jamSelesai: '12:00', catatan: 'Contoh penugasan ber-5 Anggota - SEMUA menolak lewat aplikasi mobile, otomatis Cancel by Anggota', status: 'Approve', anggotaResponse: 'Tolak', rejectReason: null, approverIds: [], approvedByUserId: null, approvedAt: null, createdByUserId: 3, createdAt: '2026-10-22T09:00:00' },
  { id: 20, personId: 9, batchId: 19, noPenugasan: 'PGS-2026-015', dapilKode: 'DAPIL-3', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Ketua', unitKerja: 'Komisi C' }], kegiatan: 'Reses Gabungan Dapil 3 - Wilayah Selatan', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Tidar Selatan', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-11-12', jamMulai: '09:00', jamSelesai: '12:00', catatan: 'Contoh penugasan ber-5 Anggota - SEMUA menolak lewat aplikasi mobile, otomatis Cancel by Anggota', status: 'Approve', anggotaResponse: 'Tolak', rejectReason: null, approverIds: [], approvedByUserId: null, approvedAt: null, createdByUserId: 3, createdAt: '2026-10-22T09:00:00' },
  { id: 21, personId: 12, batchId: 19, noPenugasan: 'PGS-2026-015', dapilKode: 'DAPIL-3', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Ketua', unitKerja: 'Komisi C' }], kegiatan: 'Reses Gabungan Dapil 3 - Wilayah Selatan', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Tidar Selatan', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-11-12', jamMulai: '09:00', jamSelesai: '12:00', catatan: 'Contoh penugasan ber-5 Anggota - SEMUA menolak lewat aplikasi mobile, otomatis Cancel by Anggota', status: 'Approve', anggotaResponse: 'Tolak', rejectReason: null, approverIds: [], approvedByUserId: null, approvedAt: null, createdByUserId: 3, createdAt: '2026-10-22T09:00:00' },
  { id: 22, personId: 14, batchId: 19, noPenugasan: 'PGS-2026-015', dapilKode: 'DAPIL-3', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Ketua', unitKerja: 'Komisi C' }], kegiatan: 'Reses Gabungan Dapil 3 - Wilayah Selatan', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Tidar Selatan', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-11-12', jamMulai: '09:00', jamSelesai: '12:00', catatan: 'Contoh penugasan ber-5 Anggota - SEMUA menolak lewat aplikasi mobile, otomatis Cancel by Anggota', status: 'Approve', anggotaResponse: 'Tolak', rejectReason: null, approverIds: [], approvedByUserId: null, approvedAt: null, createdByUserId: 3, createdAt: '2026-10-22T09:00:00' },
  { id: 23, personId: 15, batchId: 19, noPenugasan: 'PGS-2026-015', dapilKode: 'DAPIL-3', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Ketua', unitKerja: 'Komisi C' }], kegiatan: 'Reses Gabungan Dapil 3 - Wilayah Selatan', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Tidar Selatan', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalRencana: '2026-11-12', jamMulai: '09:00', jamSelesai: '12:00', catatan: 'Contoh penugasan ber-5 Anggota - SEMUA menolak lewat aplikasi mobile, otomatis Cancel by Anggota', status: 'Approve', anggotaResponse: 'Tolak', rejectReason: null, approverIds: [], approvedByUserId: null, approvedAt: null, createdByUserId: 3, createdAt: '2026-10-22T09:00:00' },
  // Contoh tanggalMode 'RANGE' (Tanggal Mulai-Selesai, TANPA Jam Mulai/Selesai - lihat
  // setTanggalMode()/tanggalJamCellForRow() di penugasan-dapil-reses.html). jamMulai/jamSelesai
  // null karena memang tidak diisi utk mode ini.
  { id: 24, personId: 16, batchId: 24, noPenugasan: 'PGS-2026-016', dapilKode: 'DAPIL-2', jenisPenugasanId: 3, jabatanPimpinanList: [{ jabatan: 'Wakil Ketua', unitKerja: 'Komisi B' }], kegiatan: 'Studi Banding Pengelolaan Pasar Rakyat (Multi Hari)', lokasiJenis: 'LUAR_KOTA', lokasiKelurahan: null, lokasiKabupaten: 'Kota Surakarta', lokasiProvinsi: 'Jawa Tengah', lokasiNegara: null, tanggalMode: 'RANGE', tanggalRencana: '2026-11-23', tanggalSelesai: '2026-11-25', jamMulai: null, jamSelesai: null, catatan: 'Contoh penugasan dengan rentang tanggal (3 hari), tanpa jam spesifik', status: 'Approve', anggotaResponse: 'Terima', rejectReason: null, approverIds: [1], approvedByUserId: 1, approvedAt: '2026-10-23T11:05:00', createdByUserId: 11, createdAt: '2026-10-23T09:00:00' },
  { id: 25, personId: 22, batchId: 25, noPenugasan: 'PGS-2026-017', dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Ketua', unitKerja: 'Pimpinan DPRD' }], kegiatan: 'Kunjungan Kerja Luar Negeri - Studi Tata Kelola Pemerintahan', lokasiJenis: 'LUAR_NEGERI', lokasiKelurahan: null, lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: 'Singapura', tanggalMode: 'RANGE', tanggalRencana: '2026-12-08', tanggalSelesai: '2026-12-11', jamMulai: null, jamSelesai: null, catatan: 'Contoh penugasan rentang tanggal (4 hari) ke luar negeri, tanpa jam spesifik', status: 'Draft', anggotaResponse: null, rejectReason: null, approverIds: [], approvedByUserId: null, approvedAt: null, createdByUserId: 4, createdAt: '2026-10-24T09:00:00' },
  // Contoh data utk simulasi "Bentrok Jadwal" di saveJadwal() (penugasan-dapil-reses.html) - 2
  // dari 3 Anggota Fraksi Demokrat (WALUYO=21, DIAN MEGA ARYANI=22) SUDAH punya penugasan aktif
  // (status Approve, ikut terhitung krn bukan Cancel/Reject/Cancel by Anggota) di 2026-11-28
  // 09:00-11:00, sedangkan Y. IG. MARJI NUGROHO=20 (Ketua Fraksi Demokrat, jg createdByUserId di
  // sini) BELUM punya penugasan di jam itu. Jadi kalau admin yang "Login sebagai" Y. IG. MARJI
  // NUGROHO membuat Tambah Penugasan baru dgn chip "Ketua - Fraksi Demokrat" di tanggal/jam yang
  // sama: pilih SEMUA 3 Anggota -> Case 1 (2 dari 3 bentrok, pop-up "Bentrok Jadwal Terdeteksi",
  // tetap bisa "Lanjutkan Simpan"); pilih HANYA WALUYO & DIAN MEGA ARYANI -> Case 2 (2 dari 2
  // bentrok, pop-up "Penugasan Tidak Dapat Disimpan", tidak bisa disimpan).
  { id: 26, personId: 21, batchId: 26, noPenugasan: 'PGS-2026-018', dapilKode: 'DAPIL-2', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Ketua', unitKerja: 'Fraksi Demokrat' }], kegiatan: 'Rapat Konsolidasi Fraksi Demokrat', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Magelang', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalMode: 'SINGLE', tanggalRencana: '2026-11-28', tanggalSelesai: null, jamMulai: '09:00', jamSelesai: '11:00', catatan: 'Contoh data bentrok jadwal (dipakai bersama DIAN MEGA ARYANI) untuk simulasi pop-up Bentrok Jadwal', status: 'Approve', anggotaResponse: null, rejectReason: null, approverIds: [], approvedByUserId: null, approvedAt: null, createdByUserId: 20, createdAt: '2026-10-26T09:00:00' },
  { id: 27, personId: 22, batchId: 26, noPenugasan: 'PGS-2026-018', dapilKode: 'DAPIL-2', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Ketua', unitKerja: 'Fraksi Demokrat' }], kegiatan: 'Rapat Konsolidasi Fraksi Demokrat', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Magelang', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalMode: 'SINGLE', tanggalRencana: '2026-11-28', tanggalSelesai: null, jamMulai: '09:00', jamSelesai: '11:00', catatan: 'Contoh data bentrok jadwal (dipakai bersama WALUYO) untuk simulasi pop-up Bentrok Jadwal', status: 'Approve', anggotaResponse: null, rejectReason: null, approverIds: [], approvedByUserId: null, approvedAt: null, createdByUserId: 20, createdAt: '2026-10-26T09:00:00' },
  // Contoh status 'Selesai' (TERMINAL, view only - lihat jadwalIsSelesaiable()/openSelesaiJadwal()
  // di penugasan-dapil-reses.html) - kegiatannya sudah lewat & sudah ditandai Selesai lewat tombol
  // "Tandai Selesai" dari status Approve sebelumnya, bukan berasal dari status Approve otomatis.
  // kehadiran: 'Hadir' | 'Tidak Hadir' - HANYA terisi utk penugasan status Selesai (dicatat
  // manual oleh admin lewat Presensi/prototipe), ditampilkan di popup "Lihat Penugasan" (lihat
  // openPokirListModal() di penugasan-dapil-reses.html).
  { id: 28, personId: 7, batchId: 28, noPenugasan: 'PGS-2026-019', dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Ketua', unitKerja: 'Pimpinan DPRD' }], kegiatan: 'Reses Dapil 1 - Evaluasi Pembangunan Jalan', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Wates', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalMode: 'SINGLE', tanggalRencana: '2026-09-20', tanggalSelesai: null, jamMulai: '09:00', jamSelesai: '11:30', catatan: 'Contoh penugasan yang sudah ditandai Selesai setelah kegiatan dilaksanakan', status: 'Selesai', anggotaResponse: 'Terima', kehadiran: 'Hadir', rejectReason: null, approverIds: [], approvedByUserId: null, approvedAt: null, createdByUserId: 4, createdAt: '2026-09-10T09:00:00' },
  { id: 29, personId: 17, batchId: 28, noPenugasan: 'PGS-2026-019', dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Ketua', unitKerja: 'Pimpinan DPRD' }], kegiatan: 'Reses Dapil 1 - Evaluasi Pembangunan Jalan', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Wates', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalMode: 'SINGLE', tanggalRencana: '2026-09-20', tanggalSelesai: null, jamMulai: '09:00', jamSelesai: '11:30', catatan: 'Contoh penugasan yang sudah ditandai Selesai setelah kegiatan dilaksanakan', status: 'Selesai', anggotaResponse: 'Terima', kehadiran: 'Tidak Hadir', rejectReason: null, approverIds: [], approvedByUserId: null, approvedAt: null, createdByUserId: 4, createdAt: '2026-09-10T09:00:00' },
  // Case 5: status 'Approve' dengan Respon Anggota "Ditolak" (lihat anggotaResponseLabel() di
  // penugasan-dapil-reses.html - sudah ada yang menolak TAPI sebagian lain masih null/belum
  // merespon, beda dengan "Sebagian Disetujui" yang mensyaratkan SEMUA sudah merespon). Tombol
  // yang tersedia di buildActionsForRow(): Detail Approval (selalu ada) & Tandai Selesai (status
  // masih 'Approve') - Edit/Delete TIDAK ada (bukan Draft), "Lihat Penugasan" TIDAK ada (label
  // respon bukan Disetujui/Sebagian Disetujui).
  { id: 30, personId: 23, batchId: 30, noPenugasan: 'PGS-2026-020', dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Sekretaris', unitKerja: 'Komisi C' }], kegiatan: 'Dialog Masyarakat Kelurahan Cacaban', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Cacaban', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalMode: 'SINGLE', tanggalRencana: '2026-11-15', tanggalSelesai: null, jamMulai: '09:00', jamSelesai: '11:00', catatan: 'Contoh Case 5 - Respon Anggota "Ditolak" (anggota ini menolak, anggota lain dalam penugasan belum merespon)', status: 'Approve', anggotaResponse: 'Tolak', rejectReason: null, approverIds: [4], approvedByUserId: null, approvedAt: null, createdByUserId: 10, createdAt: '2026-10-27T09:00:00' },
  { id: 31, personId: 24, batchId: 30, noPenugasan: 'PGS-2026-020', dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Sekretaris', unitKerja: 'Komisi C' }], kegiatan: 'Dialog Masyarakat Kelurahan Cacaban', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Cacaban', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalMode: 'SINGLE', tanggalRencana: '2026-11-15', tanggalSelesai: null, jamMulai: '09:00', jamSelesai: '11:00', catatan: 'Contoh Case 5 - Respon Anggota "Ditolak" (anggota ini belum merespon, anggota lain dalam penugasan sudah menolak)', status: 'Approve', anggotaResponse: null, rejectReason: null, approverIds: [4], approvedByUserId: null, approvedAt: null, createdByUserId: 10, createdAt: '2026-10-27T09:00:00' },
  // Case 7: status 'Approve' dengan Respon Anggota "Cancel by System" (SEMUA Anggota dalam
  // penugasan ini menolak lewat aplikasi mobile). Tombol yang tersedia sama seperti Case 5 di
  // atas: Detail Approval & Tandai Selesai saja - Edit/Delete/"Lihat Penugasan" TIDAK ada.
  { id: 32, personId: 25, batchId: 32, noPenugasan: 'PGS-2026-021', dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Sekretaris', unitKerja: 'Komisi C' }], kegiatan: 'Dialog Masyarakat Kelurahan Panjang', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Panjang', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalMode: 'SINGLE', tanggalRencana: '2026-11-16', tanggalSelesai: null, jamMulai: '09:00', jamSelesai: '11:00', catatan: 'Contoh Case 7 - Respon Anggota "Cancel by System" (SEMUA Anggota dalam penugasan ini menolak)', status: 'Approve', anggotaResponse: 'Tolak', rejectReason: null, approverIds: [4], approvedByUserId: null, approvedAt: null, createdByUserId: 10, createdAt: '2026-10-27T09:00:00' },
  { id: 33, personId: 18, batchId: 32, noPenugasan: 'PGS-2026-021', dapilKode: 'DAPIL-1', jenisPenugasanId: 1, jabatanPimpinanList: [{ jabatan: 'Sekretaris', unitKerja: 'Komisi C' }], kegiatan: 'Dialog Masyarakat Kelurahan Panjang', lokasiJenis: 'DALAM_KOTA', lokasiKelurahan: 'Panjang', lokasiKabupaten: null, lokasiProvinsi: null, lokasiNegara: null, tanggalMode: 'SINGLE', tanggalRencana: '2026-11-16', tanggalSelesai: null, jamMulai: '09:00', jamSelesai: '11:00', catatan: 'Contoh Case 7 - Respon Anggota "Cancel by System" (SEMUA Anggota dalam penugasan ini menolak)', status: 'Approve', anggotaResponse: 'Tolak', rejectReason: null, approverIds: [4], approvedByUserId: null, approvedAt: null, createdByUserId: 10, createdAt: '2026-10-27T09:00:00' }
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
