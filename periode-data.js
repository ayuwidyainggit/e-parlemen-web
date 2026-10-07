// Data referensi Periode DPRD (prototipe), dipakai oleh master-periode.html & master-fraksi.html.
// Disimpan di localStorage supaya periode yang ditambahkan tetap ada setelah reload.
var PERIODE_STORAGE_KEY = 'ep_master_periode_list';

var PERIODE_DEFAULT_LIST = [
  { id: 'prd-2024', kode: 'PRD-2024', nama: 'Periode 2024 - 2029', mulai: '2024-09-01', selesai: '2029-08-31', status: 'Aktif', createdAt: '2024-08-15T09:00:00', updatedAt: '2024-08-15T09:00:00' },
  { id: 'prd-2019', kode: 'PRD-2019', nama: 'Periode 2019 - 2024', mulai: '2019-09-01', selesai: '2024-08-31', status: 'Nonaktif', createdAt: '2019-08-10T09:00:00', updatedAt: '2024-09-01T09:00:00' }
];

function periodeLoadList(){
  try{
    var raw = localStorage.getItem(PERIODE_STORAGE_KEY);
    if(raw){
      var parsed = JSON.parse(raw);
      if(Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch(e){}
  var seed = JSON.parse(JSON.stringify(PERIODE_DEFAULT_LIST));
  periodeSaveList(seed);
  return seed;
}
function periodeSaveList(list){
  try{ localStorage.setItem(PERIODE_STORAGE_KEY, JSON.stringify(list)); } catch(e){}
}
function periodeNextId(list){
  var max = 0;
  list.forEach(function(p){
    var m = /^prd-custom-(\d+)$/.exec(p.id || '');
    if(m){ var n = parseInt(m[1], 10); if(n > max) max = n; }
  });
  return 'prd-custom-' + (max + 1);
}
function periodeNama(id){
  var list = periodeLoadList();
  var p = list.find(function(p){ return p.id === id; });
  return p ? p.nama : '—';
}
