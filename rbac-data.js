// Katalog menu Web & Mobile + data Role dan hak akses menunya (prototipe), dipakai oleh master-rbac.html.
// Role (nama, kode, akses platform) dikelola langsung di sini - tidak ada halaman Master Role terpisah.
// Katalog Web mengikuti struktur sidebar admin yang sudah ada di seluruh halaman.
// Katalog Mobile adalah referensi menu aplikasi mobile Anggota DPRD (aplikasi mobile belum ada di repo ini).
var RBAC_STORAGE_KEY = 'ep_rbac_roles';

var WEB_MENU_CATALOG = [
  { group: 'Menu Utama', items: [
    { id: 'web-dashboard', label: 'Dashboard' }
  ]},
  { group: 'Master Data', items: [
    { id: 'web-master-periode', label: 'Master Periode' },
    { id: 'web-master-jabatan', label: 'Master Jabatan' },
    { id: 'web-config-fraksi', label: 'Config Fraksi' },
    { id: 'web-rbac', label: 'RBAC' },
    { id: 'web-pegawai', label: 'Pegawai' },
    { id: 'web-akun-pengguna-mobile', label: 'Akun Pengguna Mobile' },
    { id: 'web-create-new-account', label: 'Create New Account' },
    { id: 'web-master-dapil', label: 'Master Dapil' },
    { id: 'web-master-reses', label: 'Master Reses' },
    { id: 'web-periode-reses', label: 'Periode Reses' },
    { id: 'web-jenis-kegiatan', label: 'Jenis Kegiatan' }
  ]},
  { group: 'Reses & Dapil', items: [
    { id: 'web-assignment-dapil', label: 'Assignment Dapil' },
    { id: 'web-penugasan-dapil-reses', label: 'Penugasan Dapil & Reses' },
    { id: 'web-laporan-reses', label: 'Laporan Reses' },
    { id: 'web-laporan-dapil', label: 'Laporan Dapil' },
    { id: 'web-approval-pokir', label: 'Approval Pokir' },
    { id: 'web-laporan-pokir', label: 'Laporan Pokir' }
  ]},
  { group: 'Persuratan', items: [
    { id: 'web-buat-surat', label: 'Buat Surat' },
    { id: 'web-surat-keluar', label: 'Surat Keluar' }
  ]},
  { group: 'Rapat', items: [
    { id: 'web-jadwal-rapat', label: 'Jadwal Rapat' },
    { id: 'web-create-rapat', label: 'Create Rapat (Generate QR)' },
    { id: 'web-presensi', label: 'Presensi (Tampilkan QR)' },
    { id: 'web-laporan-rapat', label: 'Laporan Rapat' }
  ]},
  { group: 'Lainnya', items: [
    { id: 'web-notifikasi', label: 'Notifikasi' }
  ]}
];

var MOBILE_MENU_CATALOG = [
  { group: 'Menu Utama', items: [
    { id: 'mob-beranda', label: 'Beranda' }
  ]},
  { group: 'Reses & Dapil', items: [
    { id: 'mob-catat-reses', label: 'Catat Kegiatan Reses' },
    { id: 'mob-dapil-saya', label: 'Dapil Saya' },
    { id: 'mob-pokir', label: 'Pokir (Ajukan & Pantau)' }
  ]},
  { group: 'Rapat', items: [
    { id: 'mob-jadwal-rapat', label: 'Jadwal Rapat' },
    { id: 'mob-presensi', label: 'Presensi Rapat (Scan QR)' }
  ]},
  { group: 'Lainnya', items: [
    { id: 'mob-notifikasi', label: 'Notifikasi' },
    { id: 'mob-profil', label: 'Profil Saya' }
  ]}
];

function rbacCatalogFor(akses){
  return akses === 'Mobile' ? MOBILE_MENU_CATALOG : WEB_MENU_CATALOG;
}
function rbacAllIds(catalog){
  var ids = [];
  catalog.forEach(function(g){ g.items.forEach(function(it){ ids.push(it.id); }); });
  return ids;
}

var RBAC_DEFAULT_ROLES = [
  { id: 1, kode: 'ROL-01', nama: 'Ketua', akses: ['Web'], permissions: rbacAllIds(WEB_MENU_CATALOG), createdAt: '2026-01-12T09:00:00', updatedAt: '2026-01-12T09:00:00' },
  { id: 2, kode: 'ROL-02', nama: 'Administrator', akses: ['Web'], permissions: rbacAllIds(WEB_MENU_CATALOG), createdAt: '2026-01-12T09:00:00', updatedAt: '2026-01-12T09:00:00' },
  { id: 3, kode: 'ROL-03', nama: 'Anggota', akses: ['Mobile'], permissions: rbacAllIds(MOBILE_MENU_CATALOG), createdAt: '2026-01-12T09:00:00', updatedAt: '2026-01-12T09:00:00' }
];

function rbacLoadRoles(){
  try{
    var raw = localStorage.getItem(RBAC_STORAGE_KEY);
    if(raw){
      var parsed = JSON.parse(raw);
      if(Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch(e){}
  var seed = JSON.parse(JSON.stringify(RBAC_DEFAULT_ROLES));
  rbacSaveRoles(seed);
  return seed;
}
function rbacSaveRoles(list){
  try{ localStorage.setItem(RBAC_STORAGE_KEY, JSON.stringify(list)); } catch(e){}
}
function rbacNextId(list){
  var max = 0;
  list.forEach(function(r){ if(r.id > max) max = r.id; });
  return max + 1;
}

// Membangun markup checklist menu per akses, dengan checkbox "Pilih Semua" di tiap modul (group).
// Mengandalkan fungsi global handlePermToggle(cb), toggleGroup(groupCb), selectAll(state)
// yang harus didefinisikan di halaman pemanggil (lihat master-rbac.html / master-rbac-buat.html).
function rbacBuildPermHtml(aksesList, checkedIds){
  if(!aksesList.length){
    return '<div class="perm-empty">Pilih akses terlebih dahulu untuk menampilkan daftar menu.</div>';
  }
  var html = '<div class="perm-head"><h4>Hak Akses Menu</h4><div class="perm-actions">'
    + '<button type="button" class="btn btn-outline btn-sm" onclick="selectAll(true)">Pilih Semua</button>'
    + '<button type="button" class="btn btn-outline btn-sm" onclick="selectAll(false)">Kosongkan</button>'
    + '</div></div>';

  aksesList.forEach(function(akses){
    var catalog = rbacCatalogFor(akses);
    html += '<div class="perm-section"><div class="perm-section-title">Menu ' + akses + '</div>';
    catalog.forEach(function(g, gi){
      var groupId = 'grp-' + akses.toLowerCase() + '-' + gi;
      var ids = g.items.map(function(it){ return it.id; });
      var allChecked = ids.length > 0 && ids.every(function(id){ return checkedIds[id]; });
      html += '<div class="perm-group">'
        + '<div class="perm-group-title"><label class="perm-group-all"><input type="checkbox" id="' + groupId + '" data-ids="' + ids.join(',') + '" onchange="toggleGroup(this)" ' + (allChecked ? 'checked' : '') + '> ' + g.group + ' &middot; <span class="opt">Pilih Semua</span></label></div>';
      g.items.forEach(function(it){
        var isChecked = checkedIds[it.id] ? 'checked' : '';
        html += '<div class="perm-row"><input type="checkbox" id="perm-' + it.id + '" data-id="' + it.id + '" data-group="' + groupId + '" onchange="handlePermToggle(this)" ' + isChecked + '><label for="perm-' + it.id + '">' + it.label + '</label></div>';
      });
      html += '</div>';
    });
    html += '</div>';
  });

  return html;
}
