// Data referensi Surat Keluar (prototipe), meniru struktur outgoing_letters +
// outgoing_letter_signers + outgoing_letter_attachments (lihat docs/Surat_Keluar.md §7.1, §9.4).
// Dipakai oleh fitur Export Laporan di surat-keluar.html (dataset Sheet 1/2/3, §2.3-2.5) -
// baris ini merepresentasikan 9 permintaan lajur REQUEST (diajukan Anggota lewat Mobile) yang
// sudah tampil statis di 3 tab surat-keluar.html. Surat lajur DIRECT (dibuat admin lewat
// surat-keluar-buat.html) TIDAK didaftar di sini - disimpan sendiri di localStorage
// (SURAT_KELUAR_ADMIN_KEY) & digabung saat export (lihat exportMatchingLettersSK di surat-keluar.html).
//
// periodId/orgUnitId ditambahkan (tidak ada di versi tampilan sebelumnya) supaya Export Laporan
// punya nilai utk filter Periode (wajib, BR-01) & Unit Organisasi Tujuan (opsional, BR-03/BR-04) -
// sama seperti catatan di surat-masuk-data.js, seluruh data contoh ini berada di SATU periode
// aktif (prd-2024) saja (§7.4.a docs/Surat_Keluar.md). orgUnitId HARUS salah satu id di ORG_UNITS
// di bawah - daftar ini meniru (bukan menggantikan) ORG_UNITS lokal di surat-keluar-buat.html.
var ORG_UNITS = [
  {id: 'ou-pimpinan', name: 'Pimpinan DPRD'},
  {id: 'ou-komisi-1', name: 'Komisi I'},
  {id: 'ou-komisi-2', name: 'Komisi II'},
  {id: 'ou-komisi-3', name: 'Komisi III'},
  {id: 'ou-komisi-4', name: 'Komisi IV'}
];

var SURAT_KELUAR_DATA = {
  'SK-1': {
    periodId: 'prd-2024', orgUnitId: 'ou-komisi-1', origin: 'REQUEST', status: 'SUBMIT',
    letterNumber: null, title: 'Surat Keterangan Kunjungan Kerja ke Kecamatan Magelang Utara',
    nature: 'Biasa', letterCity: 'Magelang', letterDateISO: null, deadlineISO: '2025-05-24',
    requestStamp: true,
    recipientAddress: 'Yth. Camat Magelang Utara, Jabatan: Camat, Alamat: Jl. Jenderal Sudirman No. 10, Magelang Utara, Kota Magelang',
    createdBy: 'Ir. Budi Santoso, M.T.', submittedAtISO: '2026-11-25T09:12:00',
    claimedBy: null, claimedAtISO: null, completedBy: null, completedAtISO: null,
    signers: [{level: 1, nama: 'Ir. Budi Santoso, M.T.', jabatan: 'Anggota DPRD Kota Magelang', unit: 'Komisi I'}],
    attachments: [],
    notes: ''
  },
  'SK-2': {
    periodId: 'prd-2024', orgUnitId: 'ou-komisi-3', origin: 'REQUEST', status: 'SUBMIT',
    letterNumber: null, title: 'Surat Pengantar Reses',
    nature: 'Penting', letterCity: 'Magelang', letterDateISO: null, deadlineISO: '2026-11-10',
    requestStamp: true,
    recipientAddress: 'Yth. Kepala Desa/Kelurahan se-Dapil Komisi III, Jabatan: Kepala Desa/Kelurahan, Alamat: Wilayah Dapil Komisi III, Kota Magelang',
    createdBy: 'Drs. Ahmad Fauzi', submittedAtISO: '2026-11-25T08:05:00',
    claimedBy: null, claimedAtISO: null, completedBy: null, completedAtISO: null,
    signers: [{level: 1, nama: 'Drs. Ahmad Fauzi', jabatan: 'Anggota DPRD Kota Magelang', unit: 'Komisi III'}],
    attachments: [],
    notes: ''
  },
  'SK-3': {
    periodId: 'prd-2024', orgUnitId: 'ou-komisi-2', origin: 'REQUEST', status: 'SUBMIT',
    letterNumber: null, title: 'Surat Keterangan Domisili Fraksi',
    nature: 'Biasa', letterCity: 'Magelang', letterDateISO: null, deadlineISO: '2026-11-10',
    requestStamp: true,
    recipientAddress: 'Yth. Ketua DPC Partai Golkar Kota Magelang, Jabatan: Ketua DPC, Alamat: Kota Magelang',
    createdBy: 'R. Hendra Wijaya, S.H.', submittedAtISO: '2026-11-24T15:30:00',
    claimedBy: null, claimedAtISO: null, completedBy: null, completedAtISO: null,
    signers: [{level: 1, nama: 'R. Hendra Wijaya, S.H.', jabatan: 'Anggota DPRD Kota Magelang', unit: 'Komisi II'}],
    attachments: [],
    notes: ''
  },
  'SK-4': {
    periodId: 'prd-2024', orgUnitId: 'ou-komisi-4', origin: 'REQUEST', status: 'IN_PROGRESS',
    letterNumber: null, title: 'Surat Undangan Kunjungan Dapil',
    nature: 'Segera', letterCity: 'Magelang', letterDateISO: null, deadlineISO: '2026-11-09',
    requestStamp: false,
    recipientAddress: 'Yth. Camat Magelang Selatan, Jabatan: Camat, Alamat: Magelang Selatan, Kota Magelang',
    createdBy: 'Hj. Siti Rahmawati', submittedAtISO: '2026-11-24T14:40:00',
    claimedBy: 'Sri Wahyuni', claimedAtISO: '2026-11-25T08:30:00', completedBy: null, completedAtISO: null,
    signers: [{level: 1, nama: 'Hj. Siti Rahmawati', jabatan: 'Anggota DPRD Kota Magelang', unit: 'Komisi IV'}],
    attachments: [],
    notes: ''
  },
  'SK-5': {
    periodId: 'prd-2024', orgUnitId: 'ou-komisi-1', origin: 'REQUEST', status: 'IN_PROGRESS',
    letterNumber: null, title: 'Surat Keterangan Tugas',
    nature: 'Biasa', letterCity: 'Magelang', letterDateISO: null, deadlineISO: '2026-11-10',
    requestStamp: true,
    recipientAddress: 'Yth. Kepala Badan Kepegawaian Daerah Kota Magelang, Jabatan: Kepala Badan, Alamat: Kota Magelang',
    createdBy: 'M. Yusuf Ridwan', submittedAtISO: '2026-11-23T11:00:00',
    claimedBy: 'Dedi Kurniawan', claimedAtISO: '2026-11-24T09:15:00', completedBy: null, completedAtISO: null,
    signers: [{level: 1, nama: 'M. Yusuf Ridwan', jabatan: 'Anggota DPRD Kota Magelang', unit: 'Komisi I'}],
    attachments: [],
    notes: ''
  },
  'SK-6': {
    periodId: 'prd-2024', orgUnitId: 'ou-komisi-3', origin: 'REQUEST', status: 'COMPLETED',
    letterNumber: '045/112/DPRD/2026', title: 'Surat Rekomendasi Reses',
    nature: 'Penting', letterCity: 'Magelang', letterDateISO: '2026-11-25', deadlineISO: '2026-11-09',
    requestStamp: true,
    recipientAddress: 'Yth. Kepala Dinas PUPR Kota Magelang, Jabatan: Kepala Dinas, Alamat: Kota Magelang',
    createdBy: 'Drs. Ahmad Fauzi', submittedAtISO: '2026-11-25T06:40:00',
    claimedBy: 'Sri Wahyuni', claimedAtISO: '2026-11-25T07:10:00', completedBy: 'Sri Wahyuni', completedAtISO: '2026-11-25T07:50:00',
    signers: [{level: 1, nama: 'Drs. Ahmad Fauzi', jabatan: 'Anggota DPRD Kota Magelang', unit: 'Komisi III'}],
    attachments: [
      {fileName: 'Surat-045-112-DPRD-2026.pdf', mime: 'application/pdf', sizeBytes: 198000, uploadedBy: 'Sri Wahyuni', uploadedAtISO: '2026-11-25T07:48:00', type: 'FINAL'}
    ],
    notes: ''
  },
  'SK-7': {
    periodId: 'prd-2024', orgUnitId: 'ou-komisi-1', origin: 'REQUEST', status: 'COMPLETED',
    letterNumber: '038/089/DPRD/2025', title: 'Surat Keterangan Tugas',
    nature: 'Biasa', letterCity: 'Magelang', letterDateISO: '2025-05-18', deadlineISO: '2025-05-17',
    requestStamp: true,
    recipientAddress: 'Yth. Kepala Dinas Perhubungan Kota Magelang, Jabatan: Kepala Dinas, Alamat: Kota Magelang',
    createdBy: 'Ir. Budi Santoso, M.T.', submittedAtISO: '2025-05-16T09:00:00',
    claimedBy: 'Sri Wahyuni', claimedAtISO: '2025-05-17T10:00:00', completedBy: 'Sri Wahyuni', completedAtISO: '2025-05-18T00:00:00',
    signers: [{level: 1, nama: 'Ir. Budi Santoso, M.T.', jabatan: 'Anggota DPRD Kota Magelang', unit: 'Komisi I'}],
    attachments: [
      {fileName: 'Surat-038-089-DPRD-2025.pdf', mime: 'application/pdf', sizeBytes: 210000, uploadedBy: 'Sri Wahyuni', uploadedAtISO: '2025-05-17T23:40:00', type: 'FINAL'}
    ],
    notes: ''
  },
  'SK-8': {
    periodId: 'prd-2024', orgUnitId: 'ou-komisi-4', origin: 'REQUEST', status: 'COMPLETED',
    letterNumber: '031/076/DPRD/2025', title: 'Surat Pengantar Reses',
    nature: 'Biasa', letterCity: 'Magelang', letterDateISO: '2025-05-15', deadlineISO: '2025-05-14',
    requestStamp: false,
    recipientAddress: 'Yth. Kepala Desa/Kelurahan se-Dapil IV, Jabatan: Kepala Desa/Kelurahan, Alamat: Wilayah Dapil IV, Kota Magelang',
    createdBy: 'Hj. Siti Rahmawati', submittedAtISO: '2025-05-13T13:20:00',
    claimedBy: 'Dedi Kurniawan', claimedAtISO: '2025-05-14T09:00:00', completedBy: 'Dedi Kurniawan', completedAtISO: '2025-05-15T00:00:00',
    signers: [{level: 1, nama: 'Hj. Siti Rahmawati', jabatan: 'Anggota DPRD Kota Magelang', unit: 'Komisi IV'}],
    attachments: [
      {fileName: 'Surat-031-076-DPRD-2025.pdf', mime: 'application/pdf', sizeBytes: 176000, uploadedBy: 'Dedi Kurniawan', uploadedAtISO: '2025-05-14T23:30:00', type: 'FINAL'}
    ],
    notes: ''
  },
  'SK-9': {
    periodId: 'prd-2024', orgUnitId: 'ou-komisi-2', origin: 'REQUEST', status: 'COMPLETED',
    letterNumber: '027/061/DPRD/2025', title: 'Surat Keterangan Tugas',
    nature: 'Penting', letterCity: 'Magelang', letterDateISO: '2025-05-12', deadlineISO: '2025-05-11',
    requestStamp: true,
    recipientAddress: 'Yth. Kepala Dinas Kesehatan Kota Magelang, Jabatan: Kepala Dinas, Alamat: Kota Magelang',
    createdBy: 'R. Hendra Wijaya, S.H.', submittedAtISO: '2025-05-10T10:15:00',
    claimedBy: 'Sri Wahyuni', claimedAtISO: '2025-05-11T08:40:00', completedBy: 'Sri Wahyuni', completedAtISO: '2025-05-12T00:00:00',
    signers: [{level: 1, nama: 'R. Hendra Wijaya, S.H.', jabatan: 'Anggota DPRD Kota Magelang', unit: 'Komisi II'}],
    attachments: [
      {fileName: 'Surat-027-061-DPRD-2025.pdf', mime: 'application/pdf', sizeBytes: 164000, uploadedBy: 'Sri Wahyuni', uploadedAtISO: '2025-05-11T23:50:00', type: 'FINAL'}
    ],
    notes: ''
  }
};

function orgUnitName(id){
  var u = ORG_UNITS.find(function(o){ return o.id === id; });
  return u ? u.name : '';
}
