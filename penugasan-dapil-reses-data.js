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

// Bagian 2: Jadwal Penugasan Reses & Kunjungan Dapil - admin menjadwalkan SIAPA
// bertugas reses/kunjungan dapil DI MANA & KAPAN; Anggota mencatat realisasinya
// lewat aplikasi mobile (reses-buat.html). Jenis & vokabuler status disamakan dengan
// eparlemen-mobile/reses-kunjungan.html & reses-buat.html (RESES / KUNJUNGAN,
// Draft/Terjadwal/Selesai/Batal) - di sini "Sudah Lapor" dipakai utk menandai jadwal
// yang laporannya sudah tercatat (lihat juga Laporan Dapil & Reses).
var RESES_JADWAL_STORAGE_KEY = 'ep_jadwal_penugasan_reses';
var RESES_JADWAL_DEFAULT_LIST = [
  { id: 1, personId: 10, jenis: 'RESES', periodeResesId: 3, tanggalRencana: '2026-08-27', lokasiRencana: 'Balai Desa Kedungsari, Kec. Magelang Utara', catatan: '', status: 'Sudah Lapor', createdAt: '2026-08-10T09:00:00' },
  { id: 2, personId: 1, jenis: 'RESES', periodeResesId: 3, tanggalRencana: '2026-08-28', lokasiRencana: 'Balai Kelurahan Wates, Kec. Magelang Utara', catatan: '', status: 'Sudah Lapor', createdAt: '2026-08-10T09:00:00' },
  { id: 3, personId: 2, jenis: 'RESES', periodeResesId: 3, tanggalRencana: '2026-08-29', lokasiRencana: 'Aula Kecamatan Magelang Tengah', catatan: '', status: 'Terjadwal', createdAt: '2026-08-10T09:00:00' },
  { id: 4, personId: 3, jenis: 'RESES', periodeResesId: 3, tanggalRencana: '2026-08-25', lokasiRencana: 'Balai Desa Tidar Selatan', catatan: '', status: 'Belum Lapor', createdAt: '2026-08-05T09:00:00' },
  { id: 5, personId: 8, jenis: 'KUNJUNGAN', periodeResesId: null, tanggalRencana: '2026-09-10', lokasiRencana: 'Pasar Rejowinangun, Kec. Magelang Tengah', catatan: 'Tindak lanjut aspirasi penataan lapak PKL', status: 'Terjadwal', createdAt: '2026-08-20T09:00:00' },
  { id: 6, personId: 13, jenis: 'KUNJUNGAN', periodeResesId: null, tanggalRencana: '2026-09-05', lokasiRencana: 'Puskesmas Magelang Utara', catatan: '', status: 'Sudah Lapor', createdAt: '2026-08-18T09:00:00' },
  { id: 7, personId: 17, jenis: 'RESES', periodeResesId: 4, tanggalRencana: '2027-01-13', lokasiRencana: 'Balai Desa Jurangombo Utara', catatan: '', status: 'Terjadwal', createdAt: '2026-12-22T09:00:00' },
  { id: 8, personId: 23, jenis: 'RESES', periodeResesId: 3, tanggalRencana: '2026-08-30', lokasiRencana: 'Balai Desa Rejowinangun Utara', catatan: 'Dibatalkan karena bertepatan dengan agenda Rapat Paripurna', status: 'Batal', createdAt: '2026-08-10T09:00:00' },
  { id: 9, personId: 7, jenis: 'RESES', periodeResesId: 3, tanggalRencana: '2026-08-26', lokasiRencana: 'Balai Desa Jurangombo Selatan', catatan: '', status: 'Sudah Lapor', createdAt: '2026-08-10T09:00:00' },
  { id: 10, personId: 19, jenis: 'KUNJUNGAN', periodeResesId: null, tanggalRencana: '2026-09-12', lokasiRencana: 'Proyek Drainase Kel. Wates', catatan: '', status: 'Terjadwal', createdAt: '2026-08-25T09:00:00' }
];

function jadwalResesLoadList(){
  try{
    var raw = localStorage.getItem(RESES_JADWAL_STORAGE_KEY);
    if(raw){
      var parsed = JSON.parse(raw);
      if(Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch(e){}
  var seed = JSON.parse(JSON.stringify(RESES_JADWAL_DEFAULT_LIST));
  jadwalResesSaveList(seed);
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
