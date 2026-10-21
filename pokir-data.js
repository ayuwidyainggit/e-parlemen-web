// Data referensi usulan Pokok Pikiran (Pokir) (prototipe), ringkasan dari laporan-pokir.html,
// dipakai di penugasan-dapil-reses.html supaya admin bisa menautkan Penugasan Kunjungan Dapil
// ke usulan pokir terkait & melihat persentase progres realisasi terakhirnya.
var POKIR_STORAGE_KEY = 'ep_master_pokir_list';
var POKIR_STATUS_CLASS = { 'Diajukan': 'badge-neutral', 'Diproses': 'badge-warn', 'Selesai': 'badge-success' };
var POKIR_DEFAULT_LIST = [
  { id: 1, judul: 'Perbaikan Jalan Dusun Krasak', dapilKode: 'DAPIL-3', kategori: 'Infrastruktur', status: 'Diajukan', progres: 0, updated: '30 Agu 2026' },
  { id: 2, judul: 'Bantuan Bibit Pertanian', dapilKode: 'DAPIL-3', kategori: 'Ekonomi & UMKM', status: 'Diproses', progres: 45, updated: '15 Sep 2026' },
  { id: 3, judul: 'Perbaikan Atap Pasar Rejowinangun', dapilKode: 'DAPIL-1', kategori: 'Infrastruktur', status: 'Selesai', progres: 100, updated: '20 Sep 2026' },
  { id: 4, judul: 'Penataan Lapak PKL', dapilKode: 'DAPIL-1', kategori: 'Ekonomi & UMKM', status: 'Diproses', progres: 60, updated: '18 Sep 2026' },
  { id: 5, judul: 'Pembangunan Talud Penahan Longsor', dapilKode: 'DAPIL-2', kategori: 'Infrastruktur', status: 'Diproses', progres: 30, updated: '22 Sep 2026' },
  { id: 6, judul: 'Rehabilitasi Saluran Irigasi Sawah', dapilKode: 'DAPIL-2', kategori: 'Infrastruktur', status: 'Diajukan', progres: 0, updated: '27 Agu 2026' },
  { id: 7, judul: 'Bantuan Alat Pertanian Kelompok Tani', dapilKode: 'DAPIL-3', kategori: 'Ekonomi & UMKM', status: 'Diproses', progres: 55, updated: '14 Sep 2026' },
  { id: 8, judul: 'Rehabilitasi Ruang Kelas SDN 2 Rejowinangun', dapilKode: 'DAPIL-1', kategori: 'Pendidikan', status: 'Diproses', progres: 70, updated: '19 Sep 2026' },
  { id: 9, judul: 'Pengadaan Buku Perpustakaan Desa', dapilKode: 'DAPIL-1', kategori: 'Pendidikan', status: 'Selesai', progres: 100, updated: '1 Sep 2026' },
  { id: 10, judul: 'Normalisasi Saluran Drainase', dapilKode: 'DAPIL-2', kategori: 'Infrastruktur', status: 'Diajukan', progres: 0, updated: '10 Mei 2026' }
];

function pokirLoadList(){
  try{
    var raw = localStorage.getItem(POKIR_STORAGE_KEY);
    if(raw){
      var parsed = JSON.parse(raw);
      if(Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch(e){}
  var seed = JSON.parse(JSON.stringify(POKIR_DEFAULT_LIST));
  pokirSaveList(seed);
  return seed;
}
function pokirSaveList(list){
  try{ localStorage.setItem(POKIR_STORAGE_KEY, JSON.stringify(list)); } catch(e){}
}
