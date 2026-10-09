// Data referensi Jabatan (prototipe), dipakai oleh master-jabatan.html, master-pegawai.html
// & pengguna-buat.html.
// Disimpan di localStorage supaya data jabatan tetap ada setelah reload.
var JABATAN_STORAGE_KEY = 'ep_master_jabatan_list';

var UNIT_KERJA_LIST = [
  { id: 'unit-sekre', nama: 'Sekretariat DPRD' },
  { id: 'unit-umum', nama: 'Bagian Umum' },
  { id: 'unit-keuangan', nama: 'Bagian Keuangan' },
  { id: 'unit-persidangan', nama: 'Bagian Persidangan dan Perundang-undangan' }
];

var JABATAN_DEFAULT_LIST = [
  // --- Politik (hierarki Pimpinan & Anggota DPRD) ---
  { id: 'jab-1', jenisJabatan: 'Politik', nama: 'Ketua DPRD', keterangan: 'Pimpinan utama DPRD, memiliki akses sebagai Ketua',
    role: 'Ketua', platform: 'WEB', fraksiWajib: 'Ya', parentId: null, level: 1,
    eselon: null, unitKerjaId: null, rumpunFungsional: null, jenjangFungsional: null, status: 'Aktif' },
  { id: 'jab-2', jenisJabatan: 'Politik', nama: 'Wakil Ketua DPRD', keterangan: 'Masuk dalam kelompok pimpinan DPRD',
    role: 'Ketua', platform: 'WEB', fraksiWajib: 'Ya', parentId: 'jab-1', level: 2,
    eselon: null, unitKerjaId: null, rumpunFungsional: null, jenjangFungsional: null, status: 'Aktif' },
  { id: 'jab-3', jenisJabatan: 'Politik', nama: 'Anggota DPRD', keterangan: 'Anggota legislatif DPRD, user aplikasi mobile',
    role: 'Anggota', platform: 'Mobile', fraksiWajib: 'Ya', parentId: 'jab-2', level: 3,
    eselon: null, unitKerjaId: null, rumpunFungsional: null, jenjangFungsional: null, status: 'Aktif' },

  // --- Struktural (Sekretariat DPRD: Eselon + Unit Kerja) ---
  { id: 'jab-4', jenisJabatan: 'Struktural', nama: 'Sekretaris DPRD / Sekwan', keterangan: 'Pimpinan Sekretariat DPRD',
    role: 'Administrator', platform: 'WEB', fraksiWajib: 'Tidak', parentId: 'jab-1', level: 2,
    eselon: 'II.b', unitKerjaId: 'unit-sekre', rumpunFungsional: null, jenjangFungsional: null, status: 'Aktif' },
  { id: 'jab-5', jenisJabatan: 'Struktural', nama: 'Kepala Bagian Umum', keterangan: 'Memimpin Bagian Umum',
    role: 'Administrator', platform: 'WEB', fraksiWajib: 'Tidak', parentId: 'jab-4', level: 3,
    eselon: 'III.a', unitKerjaId: 'unit-umum', rumpunFungsional: null, jenjangFungsional: null, status: 'Aktif' },
  { id: 'jab-6', jenisJabatan: 'Struktural', nama: 'Kepala Bagian Keuangan', keterangan: 'Memimpin Bagian Keuangan',
    role: 'Administrator', platform: 'WEB', fraksiWajib: 'Tidak', parentId: 'jab-4', level: 3,
    eselon: 'III.a', unitKerjaId: 'unit-keuangan', rumpunFungsional: null, jenjangFungsional: null, status: 'Aktif' },
  { id: 'jab-7', jenisJabatan: 'Struktural', nama: 'Kepala Bagian Persidangan dan Perundang-undangan', keterangan: 'Memimpin Bagian Persidangan dan Perundang-undangan',
    role: 'Administrator', platform: 'WEB', fraksiWajib: 'Tidak', parentId: 'jab-4', level: 3,
    eselon: 'III.a', unitKerjaId: 'unit-persidangan', rumpunFungsional: null, jenjangFungsional: null, status: 'Aktif' },
  { id: 'jab-8', jenisJabatan: 'Struktural', nama: 'Kepala Sub Bagian Tata Usaha dan Rumah Tangga', keterangan: 'Sub Bagian di bawah Bagian Umum',
    role: 'Administrator', platform: 'WEB', fraksiWajib: 'Tidak', parentId: 'jab-5', level: 4,
    eselon: 'IV.a', unitKerjaId: 'unit-umum', rumpunFungsional: null, jenjangFungsional: null, status: 'Aktif' },
  { id: 'jab-9', jenisJabatan: 'Struktural', nama: 'Kepala Sub Bagian Perbendaharaan dan Akuntansi', keterangan: 'Sub Bagian di bawah Bagian Keuangan',
    role: 'Administrator', platform: 'WEB', fraksiWajib: 'Tidak', parentId: 'jab-6', level: 4,
    eselon: 'IV.a', unitKerjaId: 'unit-keuangan', rumpunFungsional: null, jenjangFungsional: null, status: 'Aktif' },

  // --- Fungsional (jalur karier ASN non-struktural, flat tanpa parent/level) ---
  { id: 'jab-10', jenisJabatan: 'Fungsional', nama: 'Analis Kebijakan Ahli Muda', keterangan: 'Jabatan Fungsional rumpun Analis Kebijakan',
    role: 'Administrator', platform: 'WEB', fraksiWajib: 'Tidak', parentId: null, level: null,
    eselon: null, unitKerjaId: null, rumpunFungsional: 'Analis Kebijakan', jenjangFungsional: 'Ahli Muda', status: 'Aktif' },
  { id: 'jab-11', jenisJabatan: 'Fungsional', nama: 'Pranata Komputer Ahli Pertama', keterangan: 'Jabatan Fungsional rumpun Pranata Komputer',
    role: 'Administrator', platform: 'WEB', fraksiWajib: 'Tidak', parentId: null, level: null,
    eselon: null, unitKerjaId: null, rumpunFungsional: 'Pranata Komputer', jenjangFungsional: 'Ahli Pertama', status: 'Aktif' },
  { id: 'jab-12', jenisJabatan: 'Fungsional', nama: 'Pengelola Umum Operasional Terampil', keterangan: 'Jabatan Fungsional rumpun Pengelola Umum Operasional',
    role: 'Administrator', platform: 'WEB', fraksiWajib: 'Tidak', parentId: null, level: null,
    eselon: null, unitKerjaId: null, rumpunFungsional: 'Pengelola Umum Operasional', jenjangFungsional: 'Terampil', status: 'Aktif' }
];

function jabatanLoadList(){
  try{
    var raw = localStorage.getItem(JABATAN_STORAGE_KEY);
    if(raw){
      var parsed = JSON.parse(raw);
      if(Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch(e){}
  var seed = JSON.parse(JSON.stringify(JABATAN_DEFAULT_LIST));
  jabatanSaveList(seed);
  return seed;
}
function jabatanSaveList(list){
  try{ localStorage.setItem(JABATAN_STORAGE_KEY, JSON.stringify(list)); } catch(e){}
}
function jabatanNextId(list){
  var max = 0;
  list.forEach(function(j){
    var n = parseInt(String(j.id).replace('jab-', ''), 10);
    if(n > max) max = n;
  });
  return 'jab-' + (max + 1);
}
function jabatanNama(id){
  var list = jabatanLoadList();
  var j = list.find(function(j){ return j.id === id; });
  return j ? j.nama : '—';
}
function unitKerjaNama(id){
  if(!id) return null;
  var u = UNIT_KERJA_LIST.find(function(u){ return u.id === id; });
  return u ? u.nama : null;
}
