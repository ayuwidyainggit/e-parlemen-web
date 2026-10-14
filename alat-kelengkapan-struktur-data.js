// Data struktur Pimpinan DPRD + Alat Kelengkapan DPRD (AKD): Komisi A/B/C, Badan Anggaran,
// Badan Musyawarah, Badan Pembentukan Peraturan Daerah, Badan Kehormatan.
// Dipakai oleh master-alat-kelengkapan.html untuk render bagan (org chart).
// Sumber: docs/query-struktur-pimpinan-dprd.sql (dipersempit ke subtree Pimpinan DPRD saja,
// Fraksi & Sekretariat DPRD tidak disertakan -- lihat struktur-organisasi-data.js utk SETWAN).
// Bentuk tiap baris: { id, parentId, level, unit, jabatan, nama } -- flat list ala adjacency
// list (level + parentId), persis kontrak di docs/api-kontrak-struktur-organisasi-setwan.md.
// nama = null berarti jabatan lowong.
//
// periodeId (ditambahkan belakangan, lihat master-alat-kelengkapan.html filter Periode):
// SEMUA baris di bawah ini adalah roster periode AKTIF ('prd-2024' / 2024-2029, lihat
// periode-data.js) -- di database eparlemenv2, org_units domain DEWAN (Pimpinan/Komisi/AKD)
// baru punya struktur utk periode aktif ini; periode 2019-2024 belum ada datanya (lihat
// data/README.md). Jadi filter periode 2019-2024 di halaman ini akan tampil kosong - itu
// bukan bug, memang belum ada datanya.
var AKD_STRUKTUR = [
  { id:'8d45b766-c734-5fd7-a405-a1e7b64947c3', parentId:null, level:0, unit:'Pimpinan DPRD', jabatan:'Ketua', nama:'EVIN SEPTA HARYANTO KAMIL, S.H.' },
  { id:'1560d441-1823-54ed-88ff-44d706203c86', parentId:'8d45b766-c734-5fd7-a405-a1e7b64947c3', level:1, unit:'Pimpinan DPRD', jabatan:'Wakil Ketua', nama:'BUSTANUL ARIFIN, S.T.' },
  { id:'a02b0161-f7c9-550a-a070-c4549d8f2b25', parentId:'8d45b766-c734-5fd7-a405-a1e7b64947c3', level:1, unit:'Pimpinan DPRD', jabatan:'Wakil Ketua', nama:'IMAM INDRA SETYAWAN, S.E., M.M.' },

  { id:'05851614-b735-5bca-abfc-96614e05982f', parentId:'8d45b766-c734-5fd7-a405-a1e7b64947c3', level:1, unit:'Komisi A', jabatan:'Ketua', nama:'TITIEK UTAMI, S.Sos., M.M.' },
  { id:'7747bc9a-33bd-54ee-9a99-0d174477495f', parentId:'05851614-b735-5bca-abfc-96614e05982f', level:2, unit:'Komisi A', jabatan:'Wakil Ketua', nama:'ADI CHANDRA PAMUNGKAS, A.Md.' },
  { id:'707e6de8-003c-5baf-8748-b08e735a0131', parentId:'05851614-b735-5bca-abfc-96614e05982f', level:2, unit:'Komisi A', jabatan:'Sekretaris', nama:'ATANG KUSTIONO, S.T.' },
  { id:'fd94923b-8df0-57d3-ba16-f8097aaa5f31', parentId:'05851614-b735-5bca-abfc-96614e05982f', level:2, unit:'Komisi A', jabatan:'Anggota', nama:'DIAN MEGA ARYANI, S.E., M.M.' },
  { id:'89bfb84f-9325-52c0-b65d-af0b646ce2f8', parentId:'05851614-b735-5bca-abfc-96614e05982f', level:2, unit:'Komisi A', jabatan:'Anggota', nama:'FEBRIAN PRABOWO' },
  { id:'26eb7675-f46b-5de0-9698-fc136f6584f5', parentId:'05851614-b735-5bca-abfc-96614e05982f', level:2, unit:'Komisi A', jabatan:'Anggota', nama:'H.I.R JATMIKO, S.H., M.M.' },
  { id:'38fb2b71-75b7-58df-9819-a9358c195ce7', parentId:'05851614-b735-5bca-abfc-96614e05982f', level:2, unit:'Komisi A', jabatan:'Anggota', nama:'SLAMET BAMBANG SULISTYO, S.Sos., M.M.' },

  { id:'e261d8fb-dd6f-50b3-a262-1c9288a94b61', parentId:'8d45b766-c734-5fd7-a405-a1e7b64947c3', level:1, unit:'Komisi B', jabatan:'Ketua', nama:'KEVIN MAHESA AMUWARDHANI, S.H.' },
  { id:'8e15e237-7197-54ac-86e7-b48e33d709bd', parentId:'e261d8fb-dd6f-50b3-a262-1c9288a94b61', level:2, unit:'Komisi B', jabatan:'Wakil Ketua', nama:'MUH HARJADI, S.H.' },
  { id:'18d35dd2-d9e0-5d9b-8d33-405676e60071', parentId:'e261d8fb-dd6f-50b3-a262-1c9288a94b61', level:2, unit:'Komisi B', jabatan:'Sekretaris', nama:'WALUYO' },
  { id:'9fc0071c-bc85-5084-83b9-7f1119765574', parentId:'e261d8fb-dd6f-50b3-a262-1c9288a94b61', level:2, unit:'Komisi B', jabatan:'Anggota', nama:'ACHMAD WIDODO' },
  { id:'ac7951d9-7a75-50f6-a972-6fd3a8b98f8c', parentId:'e261d8fb-dd6f-50b3-a262-1c9288a94b61', level:2, unit:'Komisi B', jabatan:'Anggota', nama:'DELLA SETYA MAHARANI' },
  { id:'a0d7c3c8-717d-521b-b0b9-e65dd8e3b406', parentId:'e261d8fb-dd6f-50b3-a262-1c9288a94b61', level:2, unit:'Komisi B', jabatan:'Anggota', nama:'Hj. YUNITA BUDI CHRISSANNI, S.H., M.Kn.' },
  { id:'fa89a8c2-7f1d-56b9-bc9a-a2cfe6b2e5bc', parentId:'e261d8fb-dd6f-50b3-a262-1c9288a94b61', level:2, unit:'Komisi B', jabatan:'Anggota', nama:'YUSUF SUSILO, S.H.' },

  { id:'f9e3372e-86f5-5dfc-a20b-72607feadc58', parentId:'8d45b766-c734-5fd7-a405-a1e7b64947c3', level:1, unit:'Komisi C', jabatan:'Ketua', nama:'NARISQA' },
  { id:'6e80f869-73b1-5348-96d6-f449b7885ee7', parentId:'f9e3372e-86f5-5dfc-a20b-72607feadc58', level:2, unit:'Komisi C', jabatan:'Wakil Ketua', nama:'NELLA KARNELA YUNISSARI, S.H., M.H.' },
  { id:'6e2c2d26-d135-5ac4-adc9-f8c8acb27562', parentId:'f9e3372e-86f5-5dfc-a20b-72607feadc58', level:2, unit:'Komisi C', jabatan:'Sekretaris', nama:'TYAS ANGGRAENI BP, S.E., M.Sc.' },
  { id:'53a0bd51-ab5c-5bc9-b075-230117bc86b7', parentId:'f9e3372e-86f5-5dfc-a20b-72607feadc58', level:2, unit:'Komisi C', jabatan:'Anggota', nama:'IMAM MUSAECHONI' },
  { id:'a05da327-fcca-523c-b861-ee4f675dae3a', parentId:'f9e3372e-86f5-5dfc-a20b-72607feadc58', level:2, unit:'Komisi C', jabatan:'Anggota', nama:'LEXIANO GAMMA PRADITYA' },
  { id:'8aad5e4f-62c4-526a-9fd4-9235ad0ac7f4', parentId:'f9e3372e-86f5-5dfc-a20b-72607feadc58', level:2, unit:'Komisi C', jabatan:'Anggota', nama:'H. SALLAFUDIN, S.E.' },
  { id:'e9e800bd-5acb-5239-92bc-6648fc764ee4', parentId:'f9e3372e-86f5-5dfc-a20b-72607feadc58', level:2, unit:'Komisi C', jabatan:'Anggota', nama:'VENTJE JEHEZKIEL ROGI, S.Pd.' },
  { id:'2775fcb5-c1b1-51b8-8b47-33d77ad00234', parentId:'f9e3372e-86f5-5dfc-a20b-72607feadc58', level:2, unit:'Komisi C', jabatan:'Anggota', nama:'Y. IG. MARJI NUGROHO, S.E.' },

  { id:'e8f46f18-be95-5126-a0e7-5c368289b6f3', parentId:'8d45b766-c734-5fd7-a405-a1e7b64947c3', level:1, unit:'Badan Anggaran', jabatan:'Ketua', nama:'EVIN SEPTA HARYANTO KAMIL, S.H.' },
  { id:'96a15af1-432a-5f4f-97d5-26460494c816', parentId:'e8f46f18-be95-5126-a0e7-5c368289b6f3', level:2, unit:'Badan Anggaran', jabatan:'Wakil Ketua', nama:'BUSTANUL ARIFIN, S.T.' },
  { id:'54e4036c-e946-5ca2-b073-d584c2a1e8ab', parentId:'e8f46f18-be95-5126-a0e7-5c368289b6f3', level:2, unit:'Badan Anggaran', jabatan:'Wakil Ketua', nama:'IMAM INDRA SETYAWAN, S.E., M.M.' },
  { id:'6b63f99c-06a5-5999-81f0-dcea46160937', parentId:'e8f46f18-be95-5126-a0e7-5c368289b6f3', level:2, unit:'Badan Anggaran', jabatan:'Sekretaris Bukan Anggota', nama:'PRAWERTI PRAJNAJATI, S.H., M.H.' },
  { id:'3dfc898c-805e-5354-b06e-a7158b7fb72e', parentId:'e8f46f18-be95-5126-a0e7-5c368289b6f3', level:2, unit:'Badan Anggaran', jabatan:'Anggota', nama:'DIAN MEGA ARYANI, S.E., M.M.' },
  { id:'b4d9b76d-1756-5b94-8e03-924203132f7b', parentId:'e8f46f18-be95-5126-a0e7-5c368289b6f3', level:2, unit:'Badan Anggaran', jabatan:'Anggota', nama:'H.I.R JATMIKO, S.H., M.M.' },
  { id:'dbd43bf5-5d71-54dd-a140-045f61aef767', parentId:'e8f46f18-be95-5126-a0e7-5c368289b6f3', level:2, unit:'Badan Anggaran', jabatan:'Anggota', nama:'IMAM MUSAECHONI' },
  { id:'5c5eab33-2feb-5c1e-8c83-0c3e2725d167', parentId:'e8f46f18-be95-5126-a0e7-5c368289b6f3', level:2, unit:'Badan Anggaran', jabatan:'Anggota', nama:'KEVIN MAHESA AMUWARDHANI, S.H.' },
  { id:'869da151-39b7-5618-ae5c-b0e042645e72', parentId:'e8f46f18-be95-5126-a0e7-5c368289b6f3', level:2, unit:'Badan Anggaran', jabatan:'Anggota', nama:'NARISQA' },
  { id:'f44895d9-0120-5303-99b7-75ab52a1995e', parentId:'e8f46f18-be95-5126-a0e7-5c368289b6f3', level:2, unit:'Badan Anggaran', jabatan:'Anggota', nama:'NELLA KARNELA YUNISSARI, S.H., M.H.' },
  { id:'1301a397-aff6-5b5b-b3d8-43999da1b682', parentId:'e8f46f18-be95-5126-a0e7-5c368289b6f3', level:2, unit:'Badan Anggaran', jabatan:'Anggota', nama:'TITIEK UTAMI, S.Sos., M.M.' },
  { id:'263a869c-d000-5e8e-8a75-4fef145c7082', parentId:'e8f46f18-be95-5126-a0e7-5c368289b6f3', level:2, unit:'Badan Anggaran', jabatan:'Anggota', nama:'Hj. YUNITA BUDI CHRISSANNI, S.H., M.Kn.' },

  { id:'13fe3e59-8991-57b4-bb90-2f8342d25009', parentId:'8d45b766-c734-5fd7-a405-a1e7b64947c3', level:1, unit:'Badan Musyawarah', jabatan:'Ketua', nama:'EVIN SEPTA HARYANTO KAMIL, S.H.' },
  { id:'df7d02dc-a20b-578e-a7b5-de5336845c25', parentId:'13fe3e59-8991-57b4-bb90-2f8342d25009', level:2, unit:'Badan Musyawarah', jabatan:'Wakil Ketua', nama:'BUSTANUL ARIFIN, S.T.' },
  { id:'24218bda-5dec-50a9-872d-9051cda2da78', parentId:'13fe3e59-8991-57b4-bb90-2f8342d25009', level:2, unit:'Badan Musyawarah', jabatan:'Wakil Ketua', nama:'IMAM INDRA SETYAWAN, S.E., M.M.' },
  { id:'ab21aa08-83fd-5200-a74f-64d1a8a7fcec', parentId:'13fe3e59-8991-57b4-bb90-2f8342d25009', level:2, unit:'Badan Musyawarah', jabatan:'Sekretaris Bukan Anggota', nama:'PRAWERTI PRAJNAJATI, S.H., M.H.' },
  { id:'227873a0-ddf8-5e36-b538-6c7537e37550', parentId:'13fe3e59-8991-57b4-bb90-2f8342d25009', level:2, unit:'Badan Musyawarah', jabatan:'Anggota', nama:'ACHMAD WIDODO' },
  { id:'9d2db72d-2c80-5d04-af30-7dc5b0f9ec57', parentId:'13fe3e59-8991-57b4-bb90-2f8342d25009', level:2, unit:'Badan Musyawarah', jabatan:'Anggota', nama:'ADI CHANDRA PAMUNGKAS, A.Md.' },
  { id:'67babc92-5836-5ff9-aefc-721bf28a8820', parentId:'13fe3e59-8991-57b4-bb90-2f8342d25009', level:2, unit:'Badan Musyawarah', jabatan:'Anggota', nama:'ATANG KUSTIONO, S.T.' },
  { id:'75dda78f-1761-5558-854f-e61b033b8a50', parentId:'13fe3e59-8991-57b4-bb90-2f8342d25009', level:2, unit:'Badan Musyawarah', jabatan:'Anggota', nama:'LEXIANO GAMMA PRADITYA' },
  { id:'2f9de8ee-08a5-52e4-8fd8-5e1ebc6d8ac6', parentId:'13fe3e59-8991-57b4-bb90-2f8342d25009', level:2, unit:'Badan Musyawarah', jabatan:'Anggota', nama:'TITIEK UTAMI, S.Sos., M.M.' },
  { id:'6c0ac045-32f5-5a57-afb6-e3ea67fa7b96', parentId:'13fe3e59-8991-57b4-bb90-2f8342d25009', level:2, unit:'Badan Musyawarah', jabatan:'Anggota', nama:'VENTJE JEHEZKIEL ROGI, S.Pd.' },
  { id:'d09bd03b-62c1-52aa-bad6-cb542e6a9ee7', parentId:'13fe3e59-8991-57b4-bb90-2f8342d25009', level:2, unit:'Badan Musyawarah', jabatan:'Anggota', nama:'WALUYO' },
  { id:'47fde330-6a99-50cd-85cf-af261b4a5748', parentId:'13fe3e59-8991-57b4-bb90-2f8342d25009', level:2, unit:'Badan Musyawarah', jabatan:'Anggota', nama:'Hj. YUNITA BUDI CHRISSANNI, S.H., M.Kn.' },

  { id:'a2bf9e9f-31fe-55fe-8c85-b2e5ac7b4c0f', parentId:'8d45b766-c734-5fd7-a405-a1e7b64947c3', level:1, unit:'Badan Pembentukan Peraturan Daerah', jabatan:'Ketua', nama:'SLAMET BAMBANG SULISTYO, S.Sos., M.M.' },
  { id:'a73af90f-b7ac-5a95-84df-3ff3a69bc6fe', parentId:'a2bf9e9f-31fe-55fe-8c85-b2e5ac7b4c0f', level:2, unit:'Badan Pembentukan Peraturan Daerah', jabatan:'Wakil Ketua', nama:'YUSUF SUSILO, S.H.' },
  { id:'eb6f59b2-c242-5f0a-b661-84bd13e28839', parentId:'a2bf9e9f-31fe-55fe-8c85-b2e5ac7b4c0f', level:2, unit:'Badan Pembentukan Peraturan Daerah', jabatan:'Sekretaris Bukan Anggota', nama:'PRAWERTI PRAJNAJATI, S.H., M.H.' },
  { id:'7d69d8c4-3a7d-571b-b85b-02f253ebc17d', parentId:'a2bf9e9f-31fe-55fe-8c85-b2e5ac7b4c0f', level:2, unit:'Badan Pembentukan Peraturan Daerah', jabatan:'Anggota', nama:'ACHMAD WIDODO' },
  { id:'38574d24-eaab-5fb1-838c-3104af0037eb', parentId:'a2bf9e9f-31fe-55fe-8c85-b2e5ac7b4c0f', level:2, unit:'Badan Pembentukan Peraturan Daerah', jabatan:'Anggota', nama:'DELLA SETYA MAHARANI' },
  { id:'7753b030-e7e3-51e4-b8c7-5f32b7f2b791', parentId:'a2bf9e9f-31fe-55fe-8c85-b2e5ac7b4c0f', level:2, unit:'Badan Pembentukan Peraturan Daerah', jabatan:'Anggota', nama:'MUH HARJADI, S.H.' },
  { id:'1a45d73e-d37e-5c86-b91d-a21a2ae0a9be', parentId:'a2bf9e9f-31fe-55fe-8c85-b2e5ac7b4c0f', level:2, unit:'Badan Pembentukan Peraturan Daerah', jabatan:'Anggota', nama:'H. SALLAFUDIN, S.E.' },
  { id:'c7ac51fa-d735-5eaa-9d78-339c9535388a', parentId:'a2bf9e9f-31fe-55fe-8c85-b2e5ac7b4c0f', level:2, unit:'Badan Pembentukan Peraturan Daerah', jabatan:'Anggota', nama:'TYAS ANGGRAENI BP, S.E., M.Sc.' },
  { id:'bf98d215-4878-549d-b83c-ccfcc491fe9c', parentId:'a2bf9e9f-31fe-55fe-8c85-b2e5ac7b4c0f', level:2, unit:'Badan Pembentukan Peraturan Daerah', jabatan:'Anggota', nama:'Y. IG. MARJI NUGROHO, S.E.' },

  { id:'f842af50-4148-57c7-9bfb-8c94c57ff24c', parentId:'8d45b766-c734-5fd7-a405-a1e7b64947c3', level:1, unit:'Badan Kehormatan', jabatan:'Ketua', nama:'VENTJE JEHEZKIEL ROGI, S.Pd.' },
  { id:'64230565-6fbb-5761-bf1e-6af1f2f54c8b', parentId:'f842af50-4148-57c7-9bfb-8c94c57ff24c', level:2, unit:'Badan Kehormatan', jabatan:'Wakil Ketua', nama:'LEXIANO GAMMA PRADITYA' },
  { id:'edefe1ab-c331-5cf3-9e8f-ab38c89bca0c', parentId:'f842af50-4148-57c7-9bfb-8c94c57ff24c', level:2, unit:'Badan Kehormatan', jabatan:'Anggota', nama:'FEBRIAN PRABOWO' }
];

AKD_STRUKTUR.forEach(function(r){ r.periodeId = 'prd-2024'; });

function akdStrukturList(periodeId){
  if(!periodeId) return AKD_STRUKTUR;
  return AKD_STRUKTUR.filter(function(r){ return r.periodeId === periodeId; });
}
