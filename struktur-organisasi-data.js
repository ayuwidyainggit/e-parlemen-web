// Data Struktur Organisasi Sekretariat DPRD Kota Magelang (view-only, seeder dari BE - prototipe).
// Dipakai oleh struktur-organisasi.html. Tidak ada fungsi save - murni dibaca.
// Sumber: data/org_units.json + data/positions.json + data/assignments.json + data/persons.json
// (domain SETWAN). nama/nip = null berarti posisi tersebut lowong (belum ada pemegang jabatan).
var STRUKTUR_ORGANISASI = {
  sekretaris: { posisi: 'Sekretaris DPRD', nama: 'INDAH DWIANTARI, S.Sos.', nip: '19720429 199703 2 002' },

  bagian: [
    {
      kode: 'BAG-UMUM',
      nama: 'Kepala Bagian Umum',
      pejabat: { nama: 'TRI WINARNO, S.E.', nip: '19730722 199703 1 003' },
      subBagian: [
        {
          kode: 'SUBBAG-RT',
          nama: 'Kepala Sub Bagian Rumah Tangga dan Perlengkapan',
          pejabat: { nama: 'HERY PURWOKO, S.E.', nip: '19741130 200604 1 015' },
          staf: [
            { posisi: 'Penelaah Teknis Kebijakan', nama: null, nip: null },
            { posisi: 'Pengelola Layanan Operasional', nama: null, nip: null },
            { posisi: 'Pengadministrasi Perkantoran', nama: 'DWI LESTARI', nip: '19670605 198603 2 002' },
            { posisi: 'Operator Layanan Operasional', nama: 'AGUS SANTOSO', nip: '19750805 200604 1 015' },
            { posisi: 'Operator Layanan Operasional', nama: 'KABUL LAKSONO', nip: '19700822 200801 1 006' }
          ]
        },
        {
          kode: 'SUBBAG-TU',
          nama: 'Kepala Sub Bagian Tata Usaha dan Kepegawaian',
          pejabat: { nama: 'AMIRUDDIN CHAIRUL HADI, S.H.', nip: '19861210 201502 1 002' },
          staf: [
            { posisi: 'Pranata Humas Ahli Pertama', nama: 'LUCKIE ADITYA RACHMA, S.E.', nip: '19920607 202421 1 004' },
            { posisi: 'Pranata Komputer Ahli Pertama', nama: 'CRISTIAN NISA YANSEN, S.Kom.', nip: '19871009 202421 1 003' },
            { posisi: 'Penelaah Teknis Kebijakan', nama: null, nip: null },
            { posisi: 'Pranata SDM Aparatur Terampil', nama: null, nip: null },
            { posisi: 'Pengadministrasi Perkantoran', nama: 'SUROTO', nip: '19710209 201001 1 001' },
            { posisi: 'Pengadministrasi Perkantoran', nama: 'ARIFIN RAJ SANDA', nip: '19981112 202521 1 003' },
            { posisi: 'Operator Layanan Operasional', nama: 'SUPARJAN', nip: '19670724 200701 1 013' },
            { posisi: 'Operator Layanan Operasional', nama: 'MUH FAUZI', nip: '19810320 201001 1 003' }
          ]
        }
      ],
      staf: []
    },
    {
      kode: 'BAG-KEU',
      nama: 'Kepala Bagian Keuangan',
      pejabat: { nama: 'RUMIYATI, S.Sos., M.M.', nip: '19691029 199003 2 003' },
      subBagian: [],
      staf: [
        { posisi: 'Analis Kebijakan Ahli Muda', nama: 'TITIK SETIYANINGRUM, S.E.', nip: '19720412 199403 2 005' },
        { posisi: 'Analis Kebijakan Ahli Muda', nama: 'SWASTI KUSUMA DEWI, S.E.', nip: '19770901 201001 2 004' },
        { posisi: 'Penelaah Teknis Kebijakan', nama: 'TITIK SUSDARWATI, A.Md.', nip: '19700108 200312 2 005' },
        { posisi: 'Penelaah Teknis Kebijakan', nama: null, nip: null },
        { posisi: 'Pengadministrasi Perkantoran', nama: 'MOH TOYIBAN', nip: '19800120 202521 1 004' },
        { posisi: 'Pengadministrasi Keuangan', nama: null, nip: null }
      ]
    },
    {
      kode: 'BAG-PERSID',
      nama: 'Kepala Bagian Persidangan dan Perundang-undangan',
      pejabat: { nama: 'CATUR ADI SUBAGIO, S.H.', nip: '19680530 199001 1 001' },
      subBagian: [],
      staf: [
        { posisi: 'Perisalah Legislatif Ahli Madya', nama: null, nip: null },
        { posisi: 'Perisalah Legislatif Ahli Muda', nama: 'PUTRO BAGUS PRASETIYO, S.H.', nip: '19830810 201001 1 023' },
        { posisi: 'Perancang Peraturan Perundang-undangan Ahli Pertama', nama: null, nip: null },
        { posisi: 'Perisalah Legislatif Ahli Pertama', nama: 'RACHMITA BUNGA PURI D, S.E.', nip: '19890214 202421 2 006' },
        { posisi: 'Perisalah Legislatif Ahli Pertama', nama: 'FAUZZIAH ANIS NUR S, S.E.', nip: '19931016 202421 2 003' },
        { posisi: 'Perisalah Legislatif Ahli Pertama', nama: 'UUS SOLIKHUDIN, S.H.', nip: '19880518 202521 1 011' },
        { posisi: 'Perisalah Legislatif Ahli Pertama', nama: 'HASMAN KURNIYAWAN, S.Pd.', nip: '19881210 202521 1 012' },
        { posisi: 'Asisten Perisalah Legislatif Penyelia', nama: null, nip: null },
        { posisi: 'Asisten Perisalah Legislatif Mahir', nama: null, nip: null },
        { posisi: 'Penyusun Materi Hukum dan Perundang-undangan', nama: 'PANCA ARIANA, S.H.', nip: '19790222 201001 2 001' },
        { posisi: 'Dokumentalis Hukum', nama: null, nip: null },
        { posisi: 'Asisten Perisalah Legislatif Terampil', nama: 'PRIHATINI, A.Md.A.Pkt.', nip: '19891102 202421 2 004' }
      ]
    }
  ]
};

function strukturOrganisasi(){
  return STRUKTUR_ORGANISASI;
}
