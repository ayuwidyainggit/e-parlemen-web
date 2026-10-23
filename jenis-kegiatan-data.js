// Data referensi Jenis Kegiatan (prototipe), dipakai oleh master-jenis-kegiatan.html untuk
// CRUD-nya, dan oleh penugasan-dapil-reses.html supaya pilihan "Jenis Kegiatan" di form
// Tambah/Edit Penugasan otomatis ikut field "Berlaku Untuk" (Reses / Kunjungan Dapil) &
// Status (Aktif/Nonaktif) yang diatur di Master Jenis Kegiatan - bukan daftar statis terpisah.
var JENIS_KEGIATAN_STORAGE_KEY = 'ep_master_jenis_kegiatan_list';
var JENIS_KEGIATAN_DEFAULT_LIST = [
  { id: 1, nama: 'Pertemuan Masyarakat', berlakuUntuk: 'Reses', status: 'Aktif' },
  { id: 2, nama: 'Kunjungan Lapangan', berlakuUntuk: 'Kunjungan Dapil', status: 'Aktif' },
  { id: 3, nama: 'Dialog Masyarakat', berlakuUntuk: 'Reses', status: 'Aktif' },
  { id: 4, nama: 'Sosialisasi', berlakuUntuk: 'Kunjungan Dapil', status: 'Aktif' },
  { id: 5, nama: 'Penyerapan Aspirasi', berlakuUntuk: 'Reses', status: 'Aktif' },
  { id: 6, nama: 'Kunjungan Fasilitas Publik', berlakuUntuk: 'Kunjungan Dapil', status: 'Aktif' },
  { id: 7, nama: 'Lainnya', berlakuUntuk: 'Reses', status: 'Aktif' },
  { id: 8, nama: 'Lainnya', berlakuUntuk: 'Kunjungan Dapil', status: 'Aktif' }
];

function jenisKegiatanLoadList(){
  try{
    var raw = localStorage.getItem(JENIS_KEGIATAN_STORAGE_KEY);
    if(raw){
      var parsed = JSON.parse(raw);
      if(Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch(e){}
  var seed = JSON.parse(JSON.stringify(JENIS_KEGIATAN_DEFAULT_LIST));
  jenisKegiatanSaveList(seed);
  return seed;
}
function jenisKegiatanSaveList(list){
  try{ localStorage.setItem(JENIS_KEGIATAN_STORAGE_KEY, JSON.stringify(list)); } catch(e){}
}
function jenisKegiatanNextId(list){
  var max = 0;
  list.forEach(function(j){ if(j.id > max) max = j.id; });
  return max + 1;
}
