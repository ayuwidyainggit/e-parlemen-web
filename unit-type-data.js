// Data referensi Unit Type (prototipe), dipakai oleh master-unit-type.html.
// Struktur mengikuti tabel `unit_types` skema eparlemenv2 (lihat docs/DDL_Insert_Struktur_DPRD.md):
//   id, code, name, image_url, unit_type (AKD/FRAKSI/SEKRE), domain (DEWAN/SETWAN),
//   level, parent_id, max_per_member, allows_vacancy, sort_order.
// domain bukan input bebas -- diturunkan otomatis dari unit_type (AKD & FRAKSI -> DEWAN, SEKRE -> SETWAN),
// persis seperti seed data eparlemenv2 (lihat UNIT_TYPE_DOMAIN_MAP di bawah).
// Disimpan di localStorage supaya data tetap ada setelah reload.
var UNIT_TYPE_STORAGE_KEY = 'ep_master_unit_type_list';
var UNIT_TYPE_SEED_VERSION = 1;
var UNIT_TYPE_VERSION_KEY = 'ep_master_unit_type_seed_version';

var UNIT_TYPE_TABS = ['AKD', 'FRAKSI', 'SEKRE'];
var UNIT_TYPE_TAB_LABEL = { AKD: 'AKD', FRAKSI: 'Fraksi', SEKRE: 'Sekretariat' };
var UNIT_TYPE_DOMAIN_MAP = { AKD: 'DEWAN', FRAKSI: 'DEWAN', SEKRE: 'SETWAN' };

// Seed persis sesuai INSERT INTO unit_types di docs/DDL_Insert_Struktur_DPRD.md (22 baris, id asli).
var UNIT_TYPE_DEFAULT_LIST = [
  { id: '80fd0bac-7dc1-5a7b-9e86-cbac3ca1d75a', code: 'PIMPINAN', name: 'Pimpinan DPRD', imageUrl: null, unitType: 'AKD', level: 0, parentId: null, maxPerMember: 1, allowsVacancy: false, sortOrder: 1 },
  { id: 'a11b278e-e93f-584d-914c-04d207e1b1ca', code: 'FRAKSI', name: 'Fraksi', imageUrl: null, unitType: 'FRAKSI', level: 0, parentId: null, maxPerMember: 1, allowsVacancy: false, sortOrder: 2 },
  { id: 'b0259834-de2f-5648-be44-bd576db6d9a4', code: 'SEKRETARIAT', name: 'Sekretariat', imageUrl: null, unitType: 'SEKRE', level: 0, parentId: null, maxPerMember: 1, allowsVacancy: true, sortOrder: 1 },

  { id: 'f14157bb-d374-579c-a364-344b20f95539', code: 'PDIP', name: 'Partai Demokrasi Indonesia Perjuangan', imageUrl: null, unitType: 'FRAKSI', level: 1, parentId: 'a11b278e-e93f-584d-914c-04d207e1b1ca', maxPerMember: null, allowsVacancy: false, sortOrder: 1 },
  { id: '1368b977-8715-5170-9651-43baeec237a1', code: 'GOLKAR', name: 'Partai Golongan Karya', imageUrl: null, unitType: 'FRAKSI', level: 1, parentId: 'a11b278e-e93f-584d-914c-04d207e1b1ca', maxPerMember: null, allowsVacancy: false, sortOrder: 2 },
  { id: '6e3df131-63b1-5105-bda3-c7ab4455f8f4', code: 'PKB', name: 'Partai Kebangkitan Bangsa', imageUrl: null, unitType: 'FRAKSI', level: 1, parentId: 'a11b278e-e93f-584d-914c-04d207e1b1ca', maxPerMember: null, allowsVacancy: false, sortOrder: 3 },
  { id: '72c17db7-173d-5ab3-8021-b807d9b803e6', code: 'PKS', name: 'Partai Keadilan Sejahtera', imageUrl: null, unitType: 'FRAKSI', level: 1, parentId: 'a11b278e-e93f-584d-914c-04d207e1b1ca', maxPerMember: null, allowsVacancy: false, sortOrder: 4 },
  { id: 'b87b09bc-86de-5f57-839d-f706baf88334', code: 'DEMOKRAT', name: 'Partai Demokrat', imageUrl: null, unitType: 'FRAKSI', level: 1, parentId: 'a11b278e-e93f-584d-914c-04d207e1b1ca', maxPerMember: null, allowsVacancy: false, sortOrder: 5 },
  { id: '482d497c-c94e-52ad-91f7-b7a381d00aab', code: 'GERINDRA', name: 'Partai Gerakan Indonesia Raya', imageUrl: null, unitType: 'FRAKSI', level: 1, parentId: 'a11b278e-e93f-584d-914c-04d207e1b1ca', maxPerMember: null, allowsVacancy: false, sortOrder: 6 },

  { id: '617dff00-2101-51d9-8c78-6b39ebc42f7d', code: 'KOMISI', name: 'Komisi', imageUrl: null, unitType: 'AKD', level: 1, parentId: '80fd0bac-7dc1-5a7b-9e86-cbac3ca1d75a', maxPerMember: 1, allowsVacancy: false, sortOrder: 3 },
  { id: 'ab89d114-ecf4-5207-b49d-239e83acccf9', code: 'AKD-1', name: 'Badan Pembentukan Daerah', imageUrl: null, unitType: 'AKD', level: 1, parentId: '80fd0bac-7dc1-5a7b-9e86-cbac3ca1d75a', maxPerMember: null, allowsVacancy: false, sortOrder: 1 },
  { id: 'e22dc7ee-130c-5e24-a7fa-defa2e721a76', code: 'AKD-2', name: 'Badan Musyawarah', imageUrl: null, unitType: 'AKD', level: 1, parentId: '80fd0bac-7dc1-5a7b-9e86-cbac3ca1d75a', maxPerMember: null, allowsVacancy: false, sortOrder: 2 },
  { id: '579bdf3b-51d6-56bc-bd2e-63e890435b27', code: 'AKD-3', name: 'Badan Kehormatan', imageUrl: null, unitType: 'AKD', level: 1, parentId: '80fd0bac-7dc1-5a7b-9e86-cbac3ca1d75a', maxPerMember: null, allowsVacancy: false, sortOrder: 3 },
  { id: '3e426352-23a8-5f11-b313-9802998aaf38', code: 'PANSUS', name: 'Panitia Khusus', imageUrl: null, unitType: 'AKD', level: 1, parentId: '80fd0bac-7dc1-5a7b-9e86-cbac3ca1d75a', maxPerMember: null, allowsVacancy: false, sortOrder: 5 },

  { id: '2af29419-1d46-589a-84db-c53456b4fdbc', code: 'BAGIAN-1', name: 'Kepala Bagian Umum', imageUrl: null, unitType: 'SEKRE', level: 1, parentId: 'b0259834-de2f-5648-be44-bd576db6d9a4', maxPerMember: null, allowsVacancy: true, sortOrder: 1 },
  { id: 'e2254893-b777-54c5-a45f-5e6425622715', code: 'BAGIAN-2', name: 'Kepala Bagian Keuangan', imageUrl: null, unitType: 'SEKRE', level: 1, parentId: 'b0259834-de2f-5648-be44-bd576db6d9a4', maxPerMember: null, allowsVacancy: true, sortOrder: 2 },
  { id: '9fa393c0-e5a5-5f2c-a25e-bbf1c68e1e15', code: 'BAGIAN-3', name: 'Kepala Bagian Persidangan dan Perundang-Undangan', imageUrl: null, unitType: 'SEKRE', level: 1, parentId: 'b0259834-de2f-5648-be44-bd576db6d9a4', maxPerMember: null, allowsVacancy: true, sortOrder: 3 },

  { id: '39fd7d6d-0893-5005-b4c6-79538393dc12', code: 'KOMISI-A', name: 'Komisi A', imageUrl: null, unitType: 'AKD', level: 2, parentId: '617dff00-2101-51d9-8c78-6b39ebc42f7d', maxPerMember: null, allowsVacancy: false, sortOrder: 1 },
  { id: '7ecb6564-6006-5530-a0a0-0d7f5fbc036b', code: 'KOMISI-B', name: 'Komisi B', imageUrl: null, unitType: 'AKD', level: 2, parentId: '617dff00-2101-51d9-8c78-6b39ebc42f7d', maxPerMember: null, allowsVacancy: false, sortOrder: 2 },
  { id: 'c49414ec-eeb6-5659-af8e-e4f94f623d0d', code: 'KOMISI-C', name: 'Komisi C', imageUrl: null, unitType: 'AKD', level: 2, parentId: '617dff00-2101-51d9-8c78-6b39ebc42f7d', maxPerMember: null, allowsVacancy: false, sortOrder: 3 },

  { id: '5cd44512-1caa-55b3-a101-f1ec4484add0', code: 'SUBBAGIAN 1', name: 'Sub Bagian Rumah Tangga & Perlengkapan', imageUrl: null, unitType: 'SEKRE', level: 2, parentId: '2af29419-1d46-589a-84db-c53456b4fdbc', maxPerMember: 1, allowsVacancy: true, sortOrder: 1 },
  { id: 'a8a24c2c-a823-5bc6-987a-7eab47936a5c', code: 'SUBBAGIAN 2', name: 'Sub Bagian Tata Usaha dan Kepegawaian', imageUrl: null, unitType: 'SEKRE', level: 2, parentId: '2af29419-1d46-589a-84db-c53456b4fdbc', maxPerMember: null, allowsVacancy: true, sortOrder: 2 }
];

function unitTypeLoadList(){
  try{
    var storedVersion = localStorage.getItem(UNIT_TYPE_VERSION_KEY);
    if(storedVersion === String(UNIT_TYPE_SEED_VERSION)){
      var raw = localStorage.getItem(UNIT_TYPE_STORAGE_KEY);
      if(raw){
        var parsed = JSON.parse(raw);
        if(Array.isArray(parsed) && parsed.length) return parsed;
      }
    }
  } catch(e){}
  var seed = JSON.parse(JSON.stringify(UNIT_TYPE_DEFAULT_LIST));
  unitTypeSaveList(seed);
  try{ localStorage.setItem(UNIT_TYPE_VERSION_KEY, String(UNIT_TYPE_SEED_VERSION)); } catch(e){}
  return seed;
}
function unitTypeSaveList(list){
  try{ localStorage.setItem(UNIT_TYPE_STORAGE_KEY, JSON.stringify(list)); } catch(e){}
}
function unitTypeNextId(){
  if(window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
  return 'ut-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
}
function unitTypeDomain(unitType){
  return UNIT_TYPE_DOMAIN_MAP[unitType] || 'DEWAN';
}
function unitTypeFindById(list, id){
  return list.find(function(u){ return u.id === id; });
}
function unitTypeByType(list, unitType){
  return list.filter(function(u){ return u.unitType === unitType; });
}
function unitTypeLevelForParent(list, parentId){
  if(!parentId) return 0;
  var parent = unitTypeFindById(list, parentId);
  return parent ? parent.level + 1 : 0;
}
function unitTypeHasChildren(list, id){
  return list.some(function(u){ return u.parentId === id; });
}
function unitTypeDescendantIds(list, id){
  var result = [];
  var queue = [id];
  while(queue.length){
    var current = queue.shift();
    list.forEach(function(u){
      if(u.parentId === current){ result.push(u.id); queue.push(u.id); }
    });
  }
  return result;
}
function unitTypeLabel(u){
  return u.code + ' - ' + u.name;
}
