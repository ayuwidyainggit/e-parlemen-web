// Referensi Jabatan (prototipe), dipakai oleh master-pegawai.html untuk dropdown Jabatan.
// Mengikuti data yang sudah ada di master-jabatan.html (belum ada API/DB bersama di prototipe ini).
var JABATAN_LIST = [
  { id: 'jab-1', nama: 'Ketua DPRD' },
  { id: 'jab-2', nama: 'Wakil Ketua DPRD' },
  { id: 'jab-3', nama: 'Anggota DPRD' },
  { id: 'jab-4', nama: 'Sekretaris DPRD / Sekwan' },
  { id: 'jab-5', nama: 'Operator Sekretariat' }
];
function jabatanNama(id){
  var j = JABATAN_LIST.find(function(j){ return j.id === id; });
  return j ? j.nama : '—';
}
