// Data referensi Periode Reses (prototipe), dipakai oleh master-periode-reses.html
// & master-periode.html (cek referensi saat hapus/ubah Kode di Master Periode).
// Disimpan di localStorage supaya periode reses yang ditambahkan tetap ada setelah reload.
var PERIODE_RESES_STORAGE_KEY = 'ep_master_periode_reses_list';

var PERIODE_RESES_DEFAULT_LIST = [
  { id: 1, periodeId: 'prd-2024', nama: 'Reses I Tahun 2026', mulai: '2026-01-12', selesai: '2026-01-19', status: 'Nonaktif', createdAt: '2026-01-05T09:00:00', updatedAt: '2026-01-19T09:00:00' },
  { id: 2, periodeId: 'prd-2024', nama: 'Reses II Tahun 2026', mulai: '2026-05-11', selesai: '2026-05-18', status: 'Nonaktif', createdAt: '2026-04-20T09:00:00', updatedAt: '2026-05-18T09:00:00' },
  { id: 3, periodeId: 'prd-2024', nama: 'Reses III Tahun 2026', mulai: '2026-08-26', selesai: '2026-09-02', status: 'Aktif', createdAt: '2026-08-10T09:00:00', updatedAt: '2026-08-26T09:00:00' },
  { id: 4, periodeId: 'prd-2024', nama: 'Reses I Tahun 2027', mulai: '2027-01-11', selesai: '2027-01-18', status: 'Nonaktif', createdAt: '2026-12-20T09:00:00', updatedAt: '2026-12-20T09:00:00' }
];

function periodeResesLoadList(){
  try{
    var raw = localStorage.getItem(PERIODE_RESES_STORAGE_KEY);
    if(raw){
      var parsed = JSON.parse(raw);
      if(Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch(e){}
  var seed = JSON.parse(JSON.stringify(PERIODE_RESES_DEFAULT_LIST));
  periodeResesSaveList(seed);
  return seed;
}
function periodeResesSaveList(list){
  try{ localStorage.setItem(PERIODE_RESES_STORAGE_KEY, JSON.stringify(list)); } catch(e){}
}
function periodeResesNextId(list){
  var max = 0;
  list.forEach(function(p){ if(p.id > max) max = p.id; });
  return max + 1;
}
