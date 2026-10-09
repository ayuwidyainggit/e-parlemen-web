// Data referensi Partai Politik (prototipe), dipakai oleh master-partai.html & master-fraksi.html.
// Disimpan di localStorage supaya data partai tetap ada setelah reload.
// Skema: id (uuid, PK), kode (varchar(20), UQ, wajib), nama (varchar(150), wajib, nama resmi partai),
// singkatan (varchar(30), wajib), logo_url (text, opsional - tampil di halaman Fraksi), is_aktif (boolean, wajib).
var PARTAI_STORAGE_KEY = 'ep_master_partai_list';

var PARTAI_DEFAULT_LIST = [
  { id: '987362f7-493a-4508-977f-45637f3a175c', kode: 'PDIP', nama: 'Partai Demokrasi Indonesia Perjuangan', singkatan: 'PDI-P', logo_url: null, is_aktif: true },
  { id: '31fdb48d-dd2b-40ba-ad2e-5f193eca14e4', kode: 'GOLKAR', nama: 'Partai Golongan Karya', singkatan: 'Golkar', logo_url: null, is_aktif: true },
  { id: 'fd36e66b-71f3-4296-93f5-031c404aed4d', kode: 'PKB', nama: 'Partai Kebangkitan Bangsa', singkatan: 'PKB', logo_url: null, is_aktif: true },
  { id: '13f397f7-0c35-4b9d-aa61-29a77a999809', kode: 'PKS', nama: 'Partai Keadilan Sejahtera', singkatan: 'PKS', logo_url: null, is_aktif: true },
  { id: 'cad6afb3-180b-4bdc-b958-60be86ac482f', kode: 'DEMOKRAT', nama: 'Partai Demokrat', singkatan: 'Demokrat', logo_url: null, is_aktif: true },
  { id: '88f578b5-75aa-4f58-9f89-e39ad2b45870', kode: 'GERINDRA', nama: 'Partai Gerakan Indonesia Raya', singkatan: 'Gerindra', logo_url: null, is_aktif: true }
];

function partaiLoadList(){
  try{
    var raw = localStorage.getItem(PARTAI_STORAGE_KEY);
    if(raw){
      var parsed = JSON.parse(raw);
      if(Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch(e){}
  var seed = JSON.parse(JSON.stringify(PARTAI_DEFAULT_LIST));
  partaiSaveList(seed);
  return seed;
}
function partaiSaveList(list){
  try{ localStorage.setItem(PARTAI_STORAGE_KEY, JSON.stringify(list)); } catch(e){}
}
function partaiGenerateUuid(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
function partaiNama(id){
  if(!id) return null;
  var p = partaiLoadList().find(function(p){ return p.id === id; });
  return p ? p.nama : null;
}
function partaiById(id){
  if(!id) return null;
  return partaiLoadList().find(function(p){ return p.id === id; }) || null;
}
