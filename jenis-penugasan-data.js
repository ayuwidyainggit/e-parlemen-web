// Data referensi Jenis Penugasan (prototipe), dipakai oleh master-jenis-penugasan.html untuk CRUD-nya.
// Kode mengikuti format JP-#### (running number 4 digit, auto generate - tidak bisa diisi manual).
var JENIS_PENUGASAN_STORAGE_KEY = 'ep_master_jenis_penugasan_list';
var JENIS_PENUGASAN_DEFAULT_LIST = [
  { id: 1, kode: 'JP-0001', nama: 'Reses', description: 'Penugasan resmi & terjadwal untuk menyerap aspirasi masyarakat di Dapil, terikat Periode Reses.', status: 'Aktif' },
  { id: 2, kode: 'JP-0002', nama: 'Kunjungan Dapil', description: 'Penugasan fleksibel/insidental ke Dapil, tidak terikat Periode Reses.', status: 'Aktif' },
  { id: 3, kode: 'JP-0003', nama: 'Kunjungan Kerja', description: 'Penugasan dinas ke lokasi/instansi tertentu di luar agenda reses & kunjungan dapil rutin.', status: 'Aktif' }
];

function jenisPenugasanLoadList(){
  try{
    var raw = localStorage.getItem(JENIS_PENUGASAN_STORAGE_KEY);
    if(raw){
      var parsed = JSON.parse(raw);
      if(Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch(e){}
  var seed = JSON.parse(JSON.stringify(JENIS_PENUGASAN_DEFAULT_LIST));
  jenisPenugasanSaveList(seed);
  return seed;
}
function jenisPenugasanSaveList(list){
  try{ localStorage.setItem(JENIS_PENUGASAN_STORAGE_KEY, JSON.stringify(list)); } catch(e){}
}
function jenisPenugasanNextId(list){
  var max = 0;
  list.forEach(function(j){ if(j.id > max) max = j.id; });
  return max + 1;
}
function jenisPenugasanNextKode(list){
  var max = 0;
  list.forEach(function(j){
    var m = /^JP-(\d+)$/.exec(j.kode || '');
    if(m){ var n = parseInt(m[1], 10); if(n > max) max = n; }
  });
  return 'JP-' + String(max + 1).padStart(4, '0');
}
