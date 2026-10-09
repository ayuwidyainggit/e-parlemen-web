// Data referensi Jenis Kelompok (view-only, seeder dari BE - prototipe).
// Dipakai oleh master-kelompok.html. Tidak ada fungsi save - data ini murni dibaca,
// merepresentasikan tabel lookup yang di production diseed langsung oleh backend.
// Skema: id (uuid, PK), kode (varchar(20), UQ, wajib), nama (varchar(100), wajib),
// maks_per_anggota (smallint, opsional - batas keanggotaan aktif per anggota), urutan (smallint, wajib).
var JENIS_KELOMPOK_LIST = [
  { id: 'a432bcf7-2439-4565-b2bc-e1c8b5b7ebd0', kode: 'PIMPINAN', nama: 'Pimpinan DPRD', maks_per_anggota: null, urutan: 1 },
  { id: '001659b3-4698-42d2-b484-07088aa53de4', kode: 'FRAKSI', nama: 'Fraksi', maks_per_anggota: 1, urutan: 2 },
  { id: 'e0373abf-cf21-4ac6-99b0-730bc58861aa', kode: 'KOMISI', nama: 'Komisi', maks_per_anggota: 1, urutan: 3 },
  { id: 'ee52dcb2-618f-407c-a55e-87cb197863d0', kode: 'AKD', nama: 'Alat Kelengkapan DPRD', maks_per_anggota: null, urutan: 4 }
];

function jenisKelompokList(){
  return JENIS_KELOMPOK_LIST;
}
function jenisKelompokById(id){
  return JENIS_KELOMPOK_LIST.find(function(j){ return j.id === id; }) || null;
}
function jenisKelompokNama(id){
  var j = jenisKelompokById(id);
  return j ? j.nama : '—';
}
