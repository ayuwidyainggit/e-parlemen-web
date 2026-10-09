// Data referensi Fraksi (prototipe), dipakai oleh master-fraksi.html.
// Disimpan di localStorage supaya fraksi yang ditambahkan tetap ada setelah reload.
// Data Periode DPRD diambil dari periode-data.js (Master Periode) - muat file itu sebelum fraksi-data.js.
var FRAKSI_STORAGE_KEY = 'ep_master_fraksi_list';
var FRAKSI_SEED_VERSION = 2;
var FRAKSI_VERSION_KEY = 'ep_master_fraksi_seed_version';

var FRAKSI_DEFAULT_LIST = [
  { id: 1, kode: 'FRK-01', nama: 'Fraksi Golongan Karya', periodeId: 'prd-2024', partaiId: '31fdb48d-dd2b-40ba-ad2e-5f193eca14e4', createdAt: '2026-01-12T09:00:00', updatedAt: '2026-09-02T10:15:00' },
  { id: 2, kode: 'FRK-02', nama: 'Fraksi PDI Perjuangan', periodeId: 'prd-2024', partaiId: '987362f7-493a-4508-977f-45637f3a175c', createdAt: '2026-01-12T09:05:00', updatedAt: '2026-08-20T14:40:00' },
  { id: 3, kode: 'FRK-03', nama: 'Fraksi Gerindra', periodeId: 'prd-2024', partaiId: '88f578b5-75aa-4f58-9f89-e39ad2b45870', createdAt: '2026-01-12T09:10:00', updatedAt: '2026-07-11T08:30:00' },
  { id: 4, kode: 'FRK-04', nama: 'Fraksi Kebangkitan Bangsa', periodeId: 'prd-2024', partaiId: 'fd36e66b-71f3-4296-93f5-031c404aed4d', createdAt: '2026-01-12T09:12:00', updatedAt: '2026-06-05T11:00:00' },
  { id: 5, kode: 'FRK-05', nama: 'Fraksi Keadilan Sejahtera', periodeId: 'prd-2019', partaiId: '13f397f7-0c35-4b9d-aa61-29a77a999809', createdAt: '2021-03-04T09:00:00', updatedAt: '2024-10-01T09:00:00' },
  { id: 6, kode: 'FRK-06', nama: 'Fraksi Demokrat', periodeId: 'prd-2024', partaiId: 'cad6afb3-180b-4bdc-b958-60be86ac482f', createdAt: '2026-01-12T09:14:00', updatedAt: '2026-01-12T09:14:00' }
];

function fraksiLoadList(){
  try{
    var storedVersion = localStorage.getItem(FRAKSI_VERSION_KEY);
    if(storedVersion === String(FRAKSI_SEED_VERSION)){
      var raw = localStorage.getItem(FRAKSI_STORAGE_KEY);
      if(raw){
        var parsed = JSON.parse(raw);
        if(Array.isArray(parsed) && parsed.length) return parsed;
      }
    }
  } catch(e){}
  var seed = JSON.parse(JSON.stringify(FRAKSI_DEFAULT_LIST));
  fraksiSaveList(seed);
  try{ localStorage.setItem(FRAKSI_VERSION_KEY, String(FRAKSI_SEED_VERSION)); } catch(e){}
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
