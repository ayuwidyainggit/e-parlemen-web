// Data referensi Dapil (prototipe), dipakai oleh master-dapil.html.
// Disimpan di localStorage supaya data dapil tetap ada setelah reload.
var DAPIL_STORAGE_KEY = 'ep_master_dapil_list';
var DAPIL_DEFAULT_LIST = [
  { kode: 'DAPIL-1', nama: 'Dapil 1', status: 'Aktif', kecamatan: [{ nama: 'Magelang Selatan', kelurahan: ['Jurangombo Utara', 'Jurangombo Selatan', 'Magersari', 'Tidar Selatan', 'Rejowinangun Selatan'] }] },
  { kode: 'DAPIL-2', nama: 'Dapil 2', status: 'Aktif', kecamatan: [{ nama: 'Magelang Tengah', kelurahan: ['Kemirirejo', 'Cacaban', 'Magelang', 'Panjang', 'Gelangan'] }] },
  { kode: 'DAPIL-3', nama: 'Dapil 3', status: 'Aktif', kecamatan: [{ nama: 'Magelang Utara', kelurahan: ['Kedungsari', 'Potrobangsan', 'Wates', 'Kramat Selatan', 'Kramat Utara'] }] }
];

function dapilLoadList(){
  try{
    var raw = localStorage.getItem(DAPIL_STORAGE_KEY);
    if(raw){
      var parsed = JSON.parse(raw);
      if(Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch(e){}
  var seed = JSON.parse(JSON.stringify(DAPIL_DEFAULT_LIST));
  dapilSaveList(seed);
  return seed;
}
function dapilSaveList(list){
  try{ localStorage.setItem(DAPIL_STORAGE_KEY, JSON.stringify(list)); } catch(e){}
}
function dapilNamaByKode(kode){
  if(!kode) return null;
  var list = dapilLoadList();
  var d = list.find(function(d){ return d.kode === kode; });
  return d ? d.nama : null;
}
