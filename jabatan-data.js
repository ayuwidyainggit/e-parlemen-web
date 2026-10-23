// Data referensi Jabatan (prototipe), dipakai oleh master-jabatan.html.
// Struktur mengikuti tabel `positions` skema eparlemenv2 (lihat docs/trd-database-eparlemen.md
// Bagian 4.5 & docs/DDL_Insert_Struktur_DPRD.md):
//   id, category (KELOMPOK/STRUKTURAL/FUNGSIONAL/PELAKSANA), code, name, hierarchy_level.
// `parentId` ditambahkan di prototipe ini (belum ada di DDL) untuk merepresentasikan hierarki
// jabatan sejenis (mis. Wakil Ketua di bawah Ketua, Kepala Sub Bagian di bawah Kepala Bagian).
// `status` (AKTIF/NONAKTIF) ditambahkan sesuai Alternate Flow EP-MD-02 (lihat docs/review_srs/
// master-jabatan-review-dan-feedback-srs.md §1.3) - field ini belum ada di DDL asli (DDL hanya
// punya `is_active` di tabel `org_units`, bukan di `positions`) - dipakai sbg representasi
// "is_active" jabatan di form Tambah/Edit karena tidak ada field lain utk itu di prototipe ini.
// `isSingleHolder` diisi sesuai kolom `is_single_holder` di docs/DDL_Insert_Struktur_DPRD.md
// (match per id) - TRUE berarti jabatan ini hanya boleh dipegang oleh satu orang sekaligus.
// Disimpan di localStorage supaya data tetap ada setelah reload.
var JABATAN_STORAGE_KEY = 'ep_master_jabatan_list';
var JABATAN_SEED_VERSION = 4;
var JABATAN_VERSION_KEY = 'ep_master_jabatan_seed_version';

var JABATAN_CATEGORIES = ['KELOMPOK', 'STRUKTURAL', 'FUNGSIONAL', 'PELAKSANA'];
var JABATAN_CATEGORY_LABEL = { KELOMPOK: 'Kelompok', STRUKTURAL: 'Struktural', FUNGSIONAL: 'Fungsional', PELAKSANA: 'Pelaksana' };
var JABATAN_STATUSES = ['AKTIF', 'NONAKTIF'];
var JABATAN_STATUS_LABEL = { AKTIF: 'Aktif', NONAKTIF: 'Nonaktif' };
var JABATAN_CODE_MAXLEN = 20;
var JABATAN_NAME_MINLEN = 3;
var JABATAN_NAME_MAXLEN = 150;

// Seed persis sesuai INSERT INTO positions di docs/DDL_Insert_Struktur_DPRD.md (26 baris, id asli).
// parentId diisi untuk jalur KELOMPOK & STRUKTURAL yang jelas berjenjang; FUNGSIONAL & PELAKSANA flat (null).
var JABATAN_DEFAULT_LIST = [
  { id: '0d21b5b9-30a7-5345-9ffe-7987d0e7a947', category: 'KELOMPOK', code: 'KETUA', name: 'Ketua', level: 1, parentId: null, status: 'AKTIF', isSingleHolder: true },
  { id: '8941fe45-9288-50da-874c-c149b0a7c350', category: 'KELOMPOK', code: 'WAKIL_KETUA', name: 'Wakil Ketua', level: 2, parentId: '0d21b5b9-30a7-5345-9ffe-7987d0e7a947', status: 'AKTIF', isSingleHolder: false },
  { id: '306dc94b-c8a3-5274-b638-09ecfc192e86', category: 'KELOMPOK', code: 'SEKRETARIS', name: 'Sekretaris', level: 3, parentId: '0d21b5b9-30a7-5345-9ffe-7987d0e7a947', status: 'AKTIF', isSingleHolder: true },
  { id: '085e0dc6-ce1a-5682-b4af-81144a629550', category: 'KELOMPOK', code: 'SEKRETARIS_BUKAN_ANGGOTA', name: 'Sekretaris Bukan Anggota', level: 4, parentId: '0d21b5b9-30a7-5345-9ffe-7987d0e7a947', status: 'AKTIF', isSingleHolder: true },
  { id: 'b80c6030-b60f-511a-b69a-e1fcaf15ef9a', category: 'KELOMPOK', code: 'ANGGOTA', name: 'Anggota', level: 9, parentId: '0d21b5b9-30a7-5345-9ffe-7987d0e7a947', status: 'AKTIF', isSingleHolder: false },

  { id: '78588557-c2e9-5b41-883f-ee7c98d24bef', category: 'STRUKTURAL', code: 'SEKRETARIS_DPRD', name: 'Sekretaris DPRD', level: 1, parentId: null, status: 'AKTIF', isSingleHolder: true },
  { id: '370fc088-3bec-5d9a-8da4-94f944e5c8de', category: 'STRUKTURAL', code: 'KEPALA_BAGIAN', name: 'Kepala Bagian', level: 2, parentId: '78588557-c2e9-5b41-883f-ee7c98d24bef', status: 'AKTIF', isSingleHolder: true },
  { id: '24865043-380a-5929-aa29-b2ae9e09cbd3', category: 'STRUKTURAL', code: 'KEPALA_SUB_BAGIAN', name: 'Kepala Sub Bagian', level: 3, parentId: '370fc088-3bec-5d9a-8da4-94f944e5c8de', status: 'AKTIF', isSingleHolder: true },

  { id: 'd00a235a-a693-5786-9c70-928c732447af', category: 'FUNGSIONAL', code: 'PRANATA_HUMAS_AHLI_PERTAMA', name: 'Pranata Humas Ahli Pertama', level: 5, parentId: null, status: 'AKTIF', isSingleHolder: false },
  { id: '04dce491-6172-5e2b-af9f-b217b7d43395', category: 'FUNGSIONAL', code: 'PRANATA_KOMPUTER_AHLI_PERTAMA', name: 'Pranata Komputer Ahli Pertama', level: 5, parentId: null, status: 'AKTIF', isSingleHolder: false },
  { id: '7cf2507b-35e2-5b06-a20a-e7e98e73a45f', category: 'FUNGSIONAL', code: 'PRANATA_SDM_APARATUR_TERAMPIL', name: 'Pranata SDM Aparatur Terampil', level: 5, parentId: null, status: 'AKTIF', isSingleHolder: false },
  { id: '87240066-c49b-52d6-980a-3cbba2815561', category: 'FUNGSIONAL', code: 'ANALIS_KEBIJAKAN_AHLI_MUDA', name: 'Analis Kebijakan Ahli Muda', level: 5, parentId: null, status: 'AKTIF', isSingleHolder: false },
  { id: 'd6024ddc-ac71-54bd-a38e-1e1bca223cc7', category: 'FUNGSIONAL', code: 'PERISALAH_LEGISLATIF_AHLI_MADYA', name: 'Perisalah Legislatif Ahli Madya', level: 5, parentId: null, status: 'AKTIF', isSingleHolder: false },
  { id: '99954d21-8d76-5bc9-9c64-60f921d99d50', category: 'FUNGSIONAL', code: 'PERISALAH_LEGISLATIF_AHLI_MUDA', name: 'Perisalah Legislatif Ahli Muda', level: 5, parentId: null, status: 'AKTIF', isSingleHolder: false },
  { id: 'd6c03e4b-c67a-5280-b8b6-6683c8aa6040', category: 'FUNGSIONAL', code: 'PERANCANG_PERATURAN_PERUNDANG_UNDANGAN_AHLI_PERTAMA', name: 'Perancang Peraturan Perundang-undangan Ahli Pertama', level: 5, parentId: null, status: 'AKTIF', isSingleHolder: false },
  { id: 'f803c918-51d5-5919-ad4e-7a3d7a83e313', category: 'FUNGSIONAL', code: 'PERISALAH_LEGISLATIF_AHLI_PERTAMA', name: 'Perisalah Legislatif Ahli Pertama', level: 5, parentId: null, status: 'AKTIF', isSingleHolder: false },
  { id: 'ebdd7ce9-cfe7-5df8-9f29-77f6bb9c8298', category: 'FUNGSIONAL', code: 'ASISTEN_PERISALAH_LEGISLATIF_PENYELIA', name: 'Asisten Perisalah Legislatif Penyelia', level: 5, parentId: null, status: 'AKTIF', isSingleHolder: false },
  { id: 'fb11da3c-df6e-58e2-916a-5964140afef4', category: 'FUNGSIONAL', code: 'ASISTEN_PERISALAH_LEGISLATIF_MAHIR', name: 'Asisten Perisalah Legislatif Mahir', level: 5, parentId: null, status: 'AKTIF', isSingleHolder: false },
  { id: '951459cd-1124-55d9-bb77-857218e88ffd', category: 'FUNGSIONAL', code: 'ASISTEN_PERISALAH_LEGISLATIF_TERAMPIL', name: 'Asisten Perisalah Legislatif Terampil', level: 5, parentId: null, status: 'AKTIF', isSingleHolder: false },

  { id: 'ce85c387-8129-5dce-9c91-7e9fe3fa6498', category: 'PELAKSANA', code: 'PENELAAH_TEKNIS_KEBIJAKAN', name: 'Penelaah Teknis Kebijakan', level: 6, parentId: null, status: 'AKTIF', isSingleHolder: false },
  { id: '11e3ada7-c900-55c4-819b-b51e5928dd1d', category: 'PELAKSANA', code: 'PENGELOLA_LAYANAN_OPERASIONAL', name: 'Pengelola Layanan Operasional', level: 6, parentId: null, status: 'AKTIF', isSingleHolder: false },
  { id: 'bb22c8a1-9e75-5277-b9ab-fee2d7966619', category: 'PELAKSANA', code: 'PENGADMINISTRASI_PERKANTORAN', name: 'Pengadministrasi Perkantoran', level: 6, parentId: null, status: 'AKTIF', isSingleHolder: false },
  { id: 'dc2e3c13-583c-50e6-aa05-5be865014014', category: 'PELAKSANA', code: 'OPERATOR_LAYANAN_OPERASIONAL', name: 'Operator Layanan Operasional', level: 6, parentId: null, status: 'AKTIF', isSingleHolder: false },
  { id: 'dcdbf0ae-835d-5a90-825e-3c655e01ecdf', category: 'PELAKSANA', code: 'PENGADMINISTRASI_KEUANGAN', name: 'Pengadministrasi Keuangan', level: 6, parentId: null, status: 'AKTIF', isSingleHolder: false },
  { id: '3dac938a-da2e-5aaa-9efc-221242cc8a37', category: 'PELAKSANA', code: 'PENYUSUN_MATERI_HUKUM_DAN_PERUNDANG_UNDANGAN', name: 'Penyusun Materi Hukum dan Perundang-undangan', level: 6, parentId: null, status: 'AKTIF', isSingleHolder: false },
  { id: '1d274582-2817-59be-90a2-6beb99836985', category: 'PELAKSANA', code: 'DOKUMENTALIS_HUKUM', name: 'Dokumentalis Hukum', level: 6, parentId: null, status: 'AKTIF', isSingleHolder: false }
];

function jabatanLoadList(){
  try{
    var storedVersion = localStorage.getItem(JABATAN_VERSION_KEY);
    if(storedVersion === String(JABATAN_SEED_VERSION)){
      var raw = localStorage.getItem(JABATAN_STORAGE_KEY);
      if(raw){
        var parsed = JSON.parse(raw);
        if(Array.isArray(parsed) && parsed.length) return parsed;
      }
    }
  } catch(e){}
  var seed = JSON.parse(JSON.stringify(JABATAN_DEFAULT_LIST));
  jabatanSaveList(seed);
  try{ localStorage.setItem(JABATAN_VERSION_KEY, String(JABATAN_SEED_VERSION)); } catch(e){}
  return seed;
}
function jabatanSaveList(list){
  try{ localStorage.setItem(JABATAN_STORAGE_KEY, JSON.stringify(list)); } catch(e){}
}
function jabatanNextId(){
  if(window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
  return 'jab-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
}
function jabatanFindById(list, id){
  return list.find(function(j){ return j.id === id; });
}
function jabatanByCategory(list, category){
  return list.filter(function(j){ return j.category === category; });
}
function jabatanHasChildren(list, id){
  return list.some(function(j){ return j.parentId === id; });
}
function jabatanDescendantIds(list, id){
  var result = [];
  var queue = [id];
  while(queue.length){
    var current = queue.shift();
    list.forEach(function(j){
      if(j.parentId === current){ result.push(j.id); queue.push(j.id); }
    });
  }
  return result;
}
function jabatanLabel(j){
  return j.code + ' - ' + j.name;
}
function jabatanNama(id){
  var list = jabatanLoadList();
  var j = jabatanFindById(list, id);
  // Fallback literal "(-)" sesuai AC EP-MD-02 utk jabatan yg sudah dihapus tapi masih dirujuk riwayat.
  return j ? j.name : '(-)';
}
// Level dihitung otomatis & dinamis (AC EP-MD-02): Parent.level + 1, root (tanpa Parent) = 1.
// Lihat docs/review_srs/master-jabatan-review-dan-feedback-srs.md §1.2 - SRS tidak menetapkan
// rumus resmi, ini adalah interpretasi yang dipakai prototipe agar AC "otomatis & dinamis" terpenuhi.
function jabatanComputeLevel(list, parentId){
  if(!parentId) return 1;
  var parent = jabatanFindById(list, parentId);
  return parent ? parent.level + 1 : 1;
}
// Hitung ulang level node & seluruh keturunannya (dipanggil setelah Parent sebuah jabatan berubah).
function jabatanRecalcSubtreeLevels(list, id){
  var node = jabatanFindById(list, id);
  if(!node) return;
  node.level = jabatanComputeLevel(list, node.parentId);
  list.filter(function(j){ return j.parentId === id; }).forEach(function(child){
    jabatanRecalcSubtreeLevels(list, child.id);
  });
}
// Jumlah pegawai yang sedang memegang jabatan ini (field `jabatanId` di pegawai-data.js).
function jabatanUsagePegawaiCount(pegawaiList, id){
  return pegawaiList.filter(function(p){ return p.jabatanId === id; }).length;
}
// Hapus permanen hanya diizinkan bila jabatan tidak punya anak DAN tidak dirujuk pegawai manapun
// (lihat docs/review_srs/master-jabatan-review-dan-feedback-srs.md §1.1 - Opsi A).
// Jabatan yang sedang dipakai harus dinonaktifkan dulu, bukan dihapus langsung.
function jabatanCanHardDelete(jabatanList, pegawaiList, id){
  return !jabatanHasChildren(jabatanList, id) && jabatanUsagePegawaiCount(pegawaiList, id) === 0;
}
function jabatanIsDuplicateName(list, category, name, excludeId){
  var normalized = name.trim().toLowerCase();
  return list.some(function(j){
    return j.category === category && j.id !== excludeId && j.name.trim().toLowerCase() === normalized;
  });
}
// Kompatibilitas lama: `positions` tidak punya field unit kerja, jadi selalu null.
function unitKerjaNama(id){
  return null;
}
