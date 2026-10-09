// Data referensi Kelompok DPRD (view-only, seeder dari BE - prototipe).
// Satu baris = satu Fraksi, Komisi, Badan, atau Pimpinan DPRD. parent_id dipakai untuk hirarki
// (Komisi & AKD berada di bawah Pimpinan DPRD). Dipakai oleh master-kelompok.html.
// Tidak ada fungsi save - data ini murni dibaca (hanya data seeder dari BE).
// Skema: id (uuid, PK), periode_id (FK->periode, wajib), jenis_kelompok_id (FK->jenis_kelompok, wajib),
// parent_id (FK->kelompok, opsional, kosong = langsung di bawah DPRD), partai_id (FK->partai, opsional,
// diisi hanya utk Fraksi), kode (UQ per periode_id, wajib), nama (wajib), bidang (opsional, teks),
// tugas (opsional, teks), urutan (wajib), is_aktif (wajib).
//
// Catatan: teks bidang/tugas di bawah bersifat contoh representatif untuk prototipe (belum diambil
// dari situs resmi DPRD) - lihat kolom "Keterangan" pada skema asli (bidang/tugas "dari situs").

var PIMPINAN_DPRD_ID = '50e0d60d-0632-4558-a41c-7abe7b83d16b';

var KELOMPOK_LIST = [
  { id: PIMPINAN_DPRD_ID, periode_id: 'prd-2024', jenis_kelompok_id: 'a432bcf7-2439-4565-b2bc-e1c8b5b7ebd0', parent_id: null, partai_id: null,
    kode: 'PIMPINAN-DPRD', nama: 'Pimpinan DPRD', bidang: null,
    tugas: 'Memimpin rapat DPRD, menyusun agenda kerja, menjadi penghubung DPRD dengan Pemerintah Daerah & masyarakat, serta mengoordinasikan Alat Kelengkapan DPRD.',
    urutan: 1, is_aktif: true },

  { id: '71d20b57-3849-4191-ab11-b41b1ced8bef', periode_id: 'prd-2024', jenis_kelompok_id: '001659b3-4698-42d2-b484-07088aa53de4', parent_id: null, partai_id: '31fdb48d-dd2b-40ba-ad2e-5f193eca14e4',
    kode: 'FRAKSI-GOLKAR', nama: 'Fraksi Golongan Karya', bidang: null, tugas: null, urutan: 2, is_aktif: true },
  { id: '104d1462-557e-4bab-ab8b-109c69e2efe5', periode_id: 'prd-2024', jenis_kelompok_id: '001659b3-4698-42d2-b484-07088aa53de4', parent_id: null, partai_id: '987362f7-493a-4508-977f-45637f3a175c',
    kode: 'FRAKSI-PDIP', nama: 'Fraksi PDI Perjuangan', bidang: null, tugas: null, urutan: 3, is_aktif: true },
  { id: '6997d1a4-14be-42c3-8e09-259005254b3b', periode_id: 'prd-2024', jenis_kelompok_id: '001659b3-4698-42d2-b484-07088aa53de4', parent_id: null, partai_id: '88f578b5-75aa-4f58-9f89-e39ad2b45870',
    kode: 'FRAKSI-GERINDRA', nama: 'Fraksi Gerindra', bidang: null, tugas: null, urutan: 4, is_aktif: true },
  { id: 'db9bb94d-05b3-4284-b757-7d55706651b8', periode_id: 'prd-2024', jenis_kelompok_id: '001659b3-4698-42d2-b484-07088aa53de4', parent_id: null, partai_id: 'fd36e66b-71f3-4296-93f5-031c404aed4d',
    kode: 'FRAKSI-PKB', nama: 'Fraksi Kebangkitan Bangsa', bidang: null, tugas: null, urutan: 5, is_aktif: true },
  { id: 'e6b1479f-0b3c-4393-9a5e-2330d9e22eb1', periode_id: 'prd-2024', jenis_kelompok_id: '001659b3-4698-42d2-b484-07088aa53de4', parent_id: null, partai_id: '13f397f7-0c35-4b9d-aa61-29a77a999809',
    kode: 'FRAKSI-PKS', nama: 'Fraksi Keadilan Sejahtera', bidang: null, tugas: null, urutan: 6, is_aktif: true },

  { id: '3fcb2d6a-70df-4781-a17b-624f26ef7d7d', periode_id: 'prd-2024', jenis_kelompok_id: 'e0373abf-cf21-4ac6-99b0-730bc58861aa', parent_id: PIMPINAN_DPRD_ID, partai_id: null,
    kode: 'KOMISI-A', nama: 'Komisi A', bidang: 'Pemerintahan, Hukum, dan Politik', tugas: null, urutan: 7, is_aktif: true },
  { id: 'c26570da-6207-465c-a499-e4c09fd68d1c', periode_id: 'prd-2024', jenis_kelompok_id: 'e0373abf-cf21-4ac6-99b0-730bc58861aa', parent_id: PIMPINAN_DPRD_ID, partai_id: null,
    kode: 'KOMISI-B', nama: 'Komisi B', bidang: 'Perekonomian dan Keuangan', tugas: null, urutan: 8, is_aktif: true },
  { id: 'eec553a6-c2d3-46f6-994d-951805a7e690', periode_id: 'prd-2024', jenis_kelompok_id: 'e0373abf-cf21-4ac6-99b0-730bc58861aa', parent_id: PIMPINAN_DPRD_ID, partai_id: null,
    kode: 'KOMISI-C', nama: 'Komisi C', bidang: 'Pembangunan dan Infrastruktur', tugas: null, urutan: 9, is_aktif: true },
  { id: '9269582f-86d5-44ae-8070-c4c9184c0476', periode_id: 'prd-2024', jenis_kelompok_id: 'e0373abf-cf21-4ac6-99b0-730bc58861aa', parent_id: PIMPINAN_DPRD_ID, partai_id: null,
    kode: 'KOMISI-D', nama: 'Komisi D', bidang: 'Kesejahteraan Rakyat', tugas: null, urutan: 10, is_aktif: true },

  { id: 'b9c762ab-4fc8-40db-b0f8-399770be005e', periode_id: 'prd-2024', jenis_kelompok_id: 'ee52dcb2-618f-407c-a55e-87cb197863d0', parent_id: PIMPINAN_DPRD_ID, partai_id: null,
    kode: 'BANGGAR', nama: 'Badan Anggaran', bidang: null,
    tugas: 'Menyusun rancangan APBD bersama Pemerintah Daerah, membahas KUA-PPAS, serta membahas Raperda APBD.', urutan: 11, is_aktif: true },
  { id: '88f38616-95fd-454b-8372-9bd7997f5a86', periode_id: 'prd-2024', jenis_kelompok_id: 'ee52dcb2-618f-407c-a55e-87cb197863d0', parent_id: PIMPINAN_DPRD_ID, partai_id: null,
    kode: 'BAMUS', nama: 'Badan Musyawarah', bidang: null,
    tugas: 'Menetapkan agenda DPRD, menyusun jadwal rapat, dan memberikan rekomendasi pembentukan panitia khusus.', urutan: 12, is_aktif: true },
  { id: '08113ae6-f6da-4bc3-b37d-7f922a5b9853', periode_id: 'prd-2024', jenis_kelompok_id: 'ee52dcb2-618f-407c-a55e-87cb197863d0', parent_id: PIMPINAN_DPRD_ID, partai_id: null,
    kode: 'BALEG', nama: 'Badan Pembentukan Peraturan Daerah', bidang: null,
    tugas: 'Menyusun program pembentukan Perda serta melakukan harmonisasi, pembulatan, dan pemantapan konsepsi Raperda.', urutan: 13, is_aktif: true },
  { id: 'd9931ead-0d18-4f11-be96-6412a1a51fc5', periode_id: 'prd-2024', jenis_kelompok_id: 'ee52dcb2-618f-407c-a55e-87cb197863d0', parent_id: PIMPINAN_DPRD_ID, partai_id: null,
    kode: 'BK', nama: 'Badan Kehormatan', bidang: null,
    tugas: 'Mengawasi dan menjaga kehormatan, martabat, dan citra DPRD, serta menegakkan kode etik Anggota DPRD.', urutan: 14, is_aktif: true }
];

function kelompokList(){
  return KELOMPOK_LIST;
}
function kelompokById(id){
  return KELOMPOK_LIST.find(function(k){ return k.id === id; }) || null;
}
function kelompokNama(id){
  var k = kelompokById(id);
  return k ? k.nama : '—';
}
function kelompokByPeriode(periode_id){
  return KELOMPOK_LIST.filter(function(k){ return k.periode_id === periode_id; });
}
