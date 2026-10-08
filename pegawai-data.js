// Data referensi Pegawai (prototipe), dipakai oleh master-pegawai.html & pengguna-buat.html.
// Disimpan di localStorage supaya data pegawai tetap ada setelah reload.
var PEGAWAI_STORAGE_KEY = 'ep_master_pegawai_list';
var PEGAWAI_DEFAULT_LIST = [
  { id: 1, nama: 'M. Yusuf Ridwan, S.E.', nik: '3371012203880001', nip: 'DPRD-AGT-0044', alamat: 'Jl. Pahlawan No. 12, Magelang Selatan', hp: '0812-2500-1044', jabatanId: 'jab-3', roleId: 3, fraksiId: 1 },
  { id: 2, nama: 'R. Hendra Wijaya, S.H.', nik: '3371011508850002', nip: 'DPRD-AGT-0031', alamat: 'Jl. Diponegoro No. 5, Magelang Tengah', hp: '0813-2700-2031', jabatanId: 'jab-3', roleId: 3, fraksiId: 2 },
  { id: 3, nama: 'Hj. Siti Rahmawati', nik: '3371014507800003', nip: 'DPRD-SEK-0002', alamat: 'Jl. Pemuda No. 20, Magelang Utara', hp: '0811-2900-3002', jabatanId: 'jab-4', roleId: 2, fraksiId: null },
  { id: 4, nama: 'Ir. Budi Santoso, M.T.', nik: '3371010906820004', nip: 'DPRD-OPS-0007', alamat: 'Jl. Mertoyudan No. 8, Magelang Selatan', hp: '0812-3100-4007', jabatanId: 'jab-5', roleId: 2, fraksiId: null }
];

function pegawaiLoadList(){
  try{
    var raw = localStorage.getItem(PEGAWAI_STORAGE_KEY);
    if(raw){
      var parsed = JSON.parse(raw);
      if(Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch(e){}
  var seed = JSON.parse(JSON.stringify(PEGAWAI_DEFAULT_LIST));
  pegawaiSaveList(seed);
  return seed;
}
function pegawaiSaveList(list){
  try{ localStorage.setItem(PEGAWAI_STORAGE_KEY, JSON.stringify(list)); } catch(e){}
}
function pegawaiNextId(list){
  var max = 0;
  list.forEach(function(p){ if(p.id > max) max = p.id; });
  return max + 1;
}
