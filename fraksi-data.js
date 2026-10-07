// Data referensi Fraksi (prototipe), dipakai oleh master-fraksi.html.
// Disimpan di localStorage supaya fraksi yang ditambahkan tetap ada setelah reload.
// Data Periode DPRD diambil dari periode-data.js (Master Periode) - muat file itu sebelum fraksi-data.js.
var FRAKSI_STORAGE_KEY = 'ep_master_fraksi_list';

var FRAKSI_DEFAULT_LIST = [
  { id: 1, kode: 'FRK-01', nama: 'Fraksi Golongan Karya', periodeId: 'prd-2024', createdAt: '2026-01-12T09:00:00', updatedAt: '2026-09-02T10:15:00' },
  { id: 2, kode: 'FRK-02', nama: 'Fraksi PDI Perjuangan', periodeId: 'prd-2024', createdAt: '2026-01-12T09:05:00', updatedAt: '2026-08-20T14:40:00' },
  { id: 3, kode: 'FRK-03', nama: 'Fraksi Gerindra', periodeId: 'prd-2024', createdAt: '2026-01-12T09:10:00', updatedAt: '2026-07-11T08:30:00' },
  { id: 4, kode: 'FRK-04', nama: 'Fraksi Kebangkitan Bangsa', periodeId: 'prd-2024', createdAt: '2026-01-12T09:12:00', updatedAt: '2026-06-05T11:00:00' },
  { id: 5, kode: 'FRK-05', nama: 'Fraksi Keadilan Sejahtera', periodeId: 'prd-2019', createdAt: '2021-03-04T09:00:00', updatedAt: '2024-10-01T09:00:00' }
];

function fraksiLoadList(){
  try{
    var raw = localStorage.getItem(FRAKSI_STORAGE_KEY);
    if(raw){
      var parsed = JSON.parse(raw);
      if(Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch(e){}
  var seed = JSON.parse(JSON.stringify(FRAKSI_DEFAULT_LIST));
  fraksiSaveList(seed);
  return seed;
}
function fraksiSaveList(list){
  try{ localStorage.setItem(FRAKSI_STORAGE_KEY, JSON.stringify(list)); } catch(e){}
}
function fraksiPeriodeNama(id){
  return periodeNama(id);
}
function fraksiNextId(list){
  var max = 0;
  list.forEach(function(f){ if(f.id > max) max = f.id; });
  return max + 1;
}
function fraksiOptionLabel(f){
  return f.kode + ' - ' + f.nama;
}
