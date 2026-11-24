// Data referensi Surat Masuk (prototipe), meniru struktur incoming_letters +
// incoming_letter_dispositions + letter_attachments (lihat docs/surat_masuk.md §7.1, §9.4).
// Dipakai BERSAMA oleh surat-masuk-detail.html (timeline disposisi/lampiran per surat) & oleh
// fitur Export Laporan di surat-masuk.html (dataset Sheet 1/2/3, §2.2-2.5) - sebelumnya data ini
// hanya didefinisikan inline di surat-masuk-detail.html, dipindah ke sini supaya satu sumber data
// tidak menyimpang antar halaman (pola yang sama dengan periode-data.js/dapil-data.js/dst).
//
// periodId & orgUnitId ditambahkan (tidak ada di versi lama) supaya Export Laporan punya nilai
// utk filter Periode (wajib, §2.1 BR-01) & Unit Organisasi (opsional, BR-03/BR-04) - lihat §7.4.a
// docs/surat_masuk.md: seluruh data contoh ini berada di SATU periode aktif (prd-2024) saja.
// orgUnitId HARUS salah satu id di ORG_UNITS di bawah - daftar ini meniru (bukan menggantikan)
// ORG_UNITS lokal di surat-masuk-buat.html (dipakai saat MEMBUAT surat); kalau salah satu diubah,
// ubah juga yang lain supaya tetap konsisten.
var ORG_UNITS = [
  {id: 'ou-pimpinan', name: 'Pimpinan DPRD'},
  {id: 'ou-komisi-1', name: 'Komisi I'},
  {id: 'ou-komisi-2', name: 'Komisi II'},
  {id: 'ou-komisi-3', name: 'Komisi III'},
  {id: 'ou-komisi-4', name: 'Komisi IV'}
];

var SURAT_MASUK_DATA = {
  'SM-001': {
    periode: 'Periode 2024 - 2029', periodId: 'prd-2024', orgUnitId: 'ou-pimpinan',
    letterNumber: '005/123/DPRD/2026', title: 'Undangan Rapat Paripurna Pembahasan APBD 2027',
    place: 'Ruang Paripurna DPRD', letterDate: '28 Okt 2026, 09.00 WIB', letterDateISO: '2026-10-28', letterPast: true,
    notes: 'Mohon kehadiran tepat waktu, agenda pembahasan Rancangan APBD TA 2027.',
    status: 'SUBMIT', submittedAt: '26 Okt 2026, 08.30 WIB', submittedAtISO: '2026-10-26T08:30:00', completedAt: null, completedAtISO: null,
    createdBy: 'Admin Sekretariat',
    attachments: [
      { fileName: 'Draft-Agenda-APBD-2027.pdf', mime: 'application/pdf', sizeBytes: 251000, uploadedAt: '2026-10-26T08:28:00' }
    ],
    dispositions: [
      { parent: null, assigner: 'Admin Sekretariat', recipient: 'Narisqa', recipientRole: 'Ketua DPRD',
        status: 'PENDING', createdAt: '26 Okt 2026, 08.35 WIB', createdAtISO: '2026-10-26T08:35:00', actionedAt: null, actionedAtISO: null, readAtISO: null, idle: true, note: null }
    ]
  },
  'SM-002': {
    periode: 'Periode 2024 - 2029', periodId: 'prd-2024', orgUnitId: 'ou-komisi-1',
    letterNumber: '004/118/DPRD/2026', title: 'Undangan Rapat Koordinasi Komisi I',
    place: 'Ruang Rapat Komisi I', letterDate: '6 Nov 2026, 10.00 WIB', letterDateISO: '2026-11-06', letterPast: false,
    notes: 'Koordinasi agenda reses tahap II bersama anggota Komisi I.',
    status: 'SUBMIT', submittedAt: '1 Nov 2026, 14.10 WIB', submittedAtISO: '2026-11-01T14:10:00', completedAt: null, completedAtISO: null,
    createdBy: 'Admin Sekretariat',
    attachments: [],
    dispositions: [
      { parent: null, assigner: 'Admin Sekretariat', recipient: 'Ir. Budi Santoso, M.T.', recipientRole: 'Ketua Komisi I',
        status: 'DISPOSISI', createdAt: '1 Nov 2026, 14.12 WIB', createdAtISO: '2026-11-01T14:12:00', actionedAt: '2 Nov 2026, 09.00 WIB', actionedAtISO: '2026-11-02T09:00:00', readAtISO: '2026-11-01T18:00:00', idle: false, note: null },
      { parent: 0, assigner: 'Ir. Budi Santoso, M.T.', recipient: 'M. Yusuf Ridwan', recipientRole: 'Anggota Komisi I',
        status: 'PENDING', createdAt: '2 Nov 2026, 09.00 WIB', createdAtISO: '2026-11-02T09:00:00', actionedAt: null, actionedAtISO: null, readAtISO: '2026-11-02T09:30:00',  idle: false,
        note: 'Mohon diwakili menghadiri rapat koordinasi, saya ada kegiatan dinas luar kota.' }
    ]
  },
  'SM-004': {
    periode: 'Periode 2024 - 2029', periodId: 'prd-2024', orgUnitId: 'ou-komisi-4',
    letterNumber: '003/101/DPRD/2026', title: 'Permohonan Data Dukung Reses Dapil 2',
    place: 'Kantor Sekretariat DPRD', letterDate: '28 Okt 2026, 09.00 WIB', letterDateISO: '2026-10-28', letterPast: true,
    notes: 'Mohon dilengkapi sebelum rapat reses tahap berikutnya.',
    status: 'SELESAI', submittedAt: '27 Okt 2026, 09.10 WIB', submittedAtISO: '2026-10-27T09:10:00', completedAt: '29 Okt 2026, 10.12 WIB', completedAtISO: '2026-10-29T10:12:00',
    createdBy: 'Admin Sekretariat',
    attachments: [
      { fileName: 'Form-Data-Dukung-Reses.pdf', mime: 'application/pdf', sizeBytes: 184000, uploadedAt: '2026-10-27T09:08:00' }
    ],
    dispositions: [
      { parent: null, assigner: 'Admin Sekretariat', recipient: 'Hj. Siti Rahmawati', recipientRole: 'Anggota Komisi IV',
        status: 'TERIMA', createdAt: '27 Okt 2026, 09.12 WIB', createdAtISO: '2026-10-27T09:12:00', actionedAt: '29 Okt 2026, 10.12 WIB', actionedAtISO: '2026-10-29T10:12:00', readAtISO: '2026-10-28T08:00:00', idle: false, note: null }
    ]
  },
  'SM-005': {
    periode: 'Periode 2024 - 2029', periodId: 'prd-2024', orgUnitId: 'ou-komisi-3',
    letterNumber: '006/130/DPRD/2026', title: 'Pemberitahuan Jadwal Reses Tahap II',
    place: null, letterDate: '12 Nov 2026, 13.00 WIB', letterDateISO: '2026-11-12', letterPast: false,
    notes: '',
    status: 'SUBMIT', submittedAt: 'Hari ini, 09.45 WIB', submittedAtISO: '2026-11-23T09:45:00', completedAt: null, completedAtISO: null,
    createdBy: 'Admin Sekretariat',
    attachments: [],
    dispositions: [
      { parent: null, assigner: 'Admin Sekretariat', recipient: 'Drs. Ahmad Fauzi', recipientRole: 'Anggota Komisi III',
        status: 'PENDING', createdAt: 'Hari ini, 09.46 WIB', createdAtISO: '2026-11-23T09:46:00', actionedAt: null, actionedAtISO: null, readAtISO: null, idle: false, note: null }
    ]
  },
  'SM-006': {
    periode: 'Periode 2024 - 2029', periodId: 'prd-2024', orgUnitId: 'ou-komisi-2',
    letterNumber: '002/095/DPRD/2026', title: 'Undangan Rapat Kerja Komisi II dengan Dinas PU',
    place: 'Ruang Rapat Komisi II', letterDate: '20 Okt 2026, 09.30 WIB', letterDateISO: '2026-10-20', letterPast: true,
    notes: '',
    status: 'SELESAI', submittedAt: '19 Okt 2026, 15.00 WIB', submittedAtISO: '2026-10-19T15:00:00', completedAt: '20 Okt 2026, 08.00 WIB', completedAtISO: '2026-10-20T08:00:00',
    createdBy: 'Admin Sekretariat',
    attachments: [],
    dispositions: [
      { parent: null, assigner: 'Admin Sekretariat', recipient: 'R. Hendra Wijaya, S.H.', recipientRole: 'Anggota Komisi II',
        status: 'TERIMA', createdAt: '19 Okt 2026, 15.02 WIB', createdAtISO: '2026-10-19T15:02:00', actionedAt: '20 Okt 2026, 08.00 WIB', actionedAtISO: '2026-10-20T08:00:00', readAtISO: '2026-10-19T16:00:00', idle: false, note: null }
    ]
  }
};

function orgUnitName(id){
  var u = ORG_UNITS.find(function(o){ return o.id === id; });
  return u ? u.name : '';
}
