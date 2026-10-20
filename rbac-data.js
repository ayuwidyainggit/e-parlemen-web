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

// Menu Mobile diatur per aksi CRUD (Create/Read/Update/Delete), bukan 1 checkbox akses penuh
// seperti Web - id permission-nya jadi komposit '<itemId>:<aksi>' (mis. 'mob-pokir:C'). Menu Web
// tetap 1 id polos per menu (akses penuh ke menu tersebut, tidak dipecah per aksi).
var CRUD_ACTIONS = ['C', 'R', 'U', 'D'];
var CRUD_ACTION_LABEL = { C: 'Create', R: 'Read', U: 'Update', D: 'Delete' };
function rbacIdsForItem(itemId, akses){
  if(akses === 'Mobile') return CRUD_ACTIONS.map(function(a){ return itemId + ':' + a; });
  return [itemId];
}
function rbacAllIds(catalog, akses){
  var ids = [];
  catalog.forEach(function(g){ g.items.forEach(function(it){ ids = ids.concat(rbacIdsForItem(it.id, akses)); }); });
  return ids;
}
// Jumlah menu yg punya minimal 1 permission tercentang (Web: id polosnya; Mobile: salah satu
// dari C/R/U/D) - dipakai utk kolom "Jumlah Menu" di master-rbac.html supaya tidak ikut
// menghitung ganda 4 aksi CRUD per menu Mobile sebagai 4 menu berbeda.
function rbacMenuCount(role){
  var count = 0;
  (role.akses || []).forEach(function(akses){
    rbacCatalogFor(akses).forEach(function(g){
      g.items.forEach(function(it){
        var ids = rbacIdsForItem(it.id, akses);
        if(ids.some(function(id){ return role.permissions.indexOf(id) > -1; })) count++;
      });
    });
  });
  return count;
}
// Migrasi non-destruktif: role tersimpan dari sebelum CRUD Mobile ditambahkan masih punya id
// polos mob-xxx (akses penuh ke menu itu) - dipetakan jadi 4 aksi (C/R/U/D) sekaligus supaya
// tidak kehilangan akses yg sudah diberikan sebelumnya.
function rbacMigrateMobilePermissions(list){
  var legacyIds = [];
  MOBILE_MENU_CATALOG.forEach(function(g){ g.items.forEach(function(it){ legacyIds.push(it.id); }); });
  var changed = false;
  list.forEach(function(r){
    if(!r.permissions || !r.permissions.length) return;
    if(!r.permissions.some(function(p){ return legacyIds.indexOf(p) > -1; })) return;
    var next = r.permissions.filter(function(p){ return legacyIds.indexOf(p) === -1; });
    r.permissions.forEach(function(p){
      if(legacyIds.indexOf(p) === -1) return;
      CRUD_ACTIONS.forEach(function(a){
        var cid = p + ':' + a;
        if(next.indexOf(cid) === -1) next.push(cid);
      });
    });
    r.permissions = next;
    changed = true;
  });
  return changed;
}

// Role "Super Admin" (id 0) bersifat bawaan sistem & terkunci (locked: true) - akses penuh ke
// SELURUH menu Web & Mobile, selalu ditampilkan paling atas di master-rbac.html, dan TIDAK bisa
// di-Edit/Hapus lewat UI (lihat guard `r.locked` di master-rbac.html & master-rbac-edit.html).
var RBAC_SUPERADMIN_ROLE = { id: 0, kode: 'ROL-00', nama: 'Super Admin', akses: ['Web', 'Mobile'], permissions: rbacAllIds(WEB_MENU_CATALOG, 'Web').concat(rbacAllIds(MOBILE_MENU_CATALOG, 'Mobile')), locked: true, createdAt: '2026-01-12T09:00:00', updatedAt: '2026-01-12T09:00:00' };

var RBAC_DEFAULT_ROLES = [
  RBAC_SUPERADMIN_ROLE,
  { id: 1, kode: 'ROL-01', nama: 'Ketua', akses: ['Web'], permissions: rbacAllIds(WEB_MENU_CATALOG, 'Web'), createdAt: '2026-01-12T09:00:00', updatedAt: '2026-01-12T09:00:00' },
  { id: 2, kode: 'ROL-02', nama: 'Administrator', akses: ['Web'], permissions: rbacAllIds(WEB_MENU_CATALOG, 'Web'), createdAt: '2026-01-12T09:00:00', updatedAt: '2026-01-12T09:00:00' },
  { id: 3, kode: 'ROL-03', nama: 'Anggota', akses: ['Mobile'], permissions: rbacAllIds(MOBILE_MENU_CATALOG, 'Mobile'), createdAt: '2026-01-12T09:00:00', updatedAt: '2026-01-12T09:00:00' }
];

function rbacLoadRoles(){
  try{
    var raw = localStorage.getItem(RBAC_STORAGE_KEY);
    if(raw){
      var parsed = JSON.parse(raw);
      if(Array.isArray(parsed) && parsed.length){
        // Migrasi non-destruktif: browser dgn data lama (sebelum role Super Admin ditambahkan)
        // dapat role ini disisipkan di urutan pertama, tanpa menghapus role custom yg sudah dibuat.
        var needsSave = false;
        if(!parsed.some(function(r){ return r.locked; })){
          parsed.unshift(JSON.parse(JSON.stringify(RBAC_SUPERADMIN_ROLE)));
          needsSave = true;
        }
        if(rbacMigrateMobilePermissions(parsed)) needsSave = true;
        if(needsSave) rbacSaveRoles(parsed);
        return parsed;
      }
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
    var isMobile = akses === 'Mobile';
    html += '<div class="perm-section"><div class="perm-section-title">Menu ' + akses + (isMobile ? ' &middot; Create / Read / Update / Delete' : '') + '</div>';
    catalog.forEach(function(g, gi){
      var groupId = 'grp-' + akses.toLowerCase() + '-' + gi;
      var ids = [];
      g.items.forEach(function(it){ ids = ids.concat(rbacIdsForItem(it.id, akses)); });
      var allChecked = ids.length > 0 && ids.every(function(id){ return checkedIds[id]; });
      html += '<div class="perm-group">'
        + '<div class="perm-group-title"><label class="perm-group-all"><input type="checkbox" id="' + groupId + '" data-ids="' + ids.join(',') + '" onchange="toggleGroup(this)" ' + (allChecked ? 'checked' : '') + '> ' + g.group + ' &middot; <span class="opt">Pilih Semua</span></label></div>';
      g.items.forEach(function(it){
        if(isMobile){
          var crudHtml = CRUD_ACTIONS.map(function(a){
            var cid = it.id + ':' + a;
            var isChecked = checkedIds[cid] ? 'checked' : '';
            return '<label class="perm-crud-chip" title="' + CRUD_ACTION_LABEL[a] + '"><input type="checkbox" id="perm-' + cid + '" data-id="' + cid + '" data-group="' + groupId + '" onchange="handlePermToggle(this)" ' + isChecked + '> ' + a + '</label>';
          }).join('');
          html += '<div class="perm-row perm-row-crud"><span class="perm-item-label">' + it.label + '</span><div class="perm-crud-group">' + crudHtml + '</div></div>';
        } else {
          var isChecked = checkedIds[it.id] ? 'checked' : '';
          html += '<div class="perm-row"><input type="checkbox" id="perm-' + it.id + '" data-id="' + it.id + '" data-group="' + groupId + '" onchange="handlePermToggle(this)" ' + isChecked + '><label for="perm-' + it.id + '">' + it.label + '</label></div>';
        }
      });
      html += '</div>';
    });
    html += '</div>';
  });

  return html;
}
