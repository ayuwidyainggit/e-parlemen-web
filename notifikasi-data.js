// Data layer Notifikasi lintas-modul (prototipe) - localStorage-backed, dipakai BERSAMA oleh
// halaman yang MEMICU notifikasi (mis. penugasan-dapil-reses.html saat job export selesai) dan
// notifikasi.html yang MENAMPILKANNYA. Meniru tabel `notifications` (channel `database`, §2.7
// docs/Penugasan — Ringkasan Penugasan per Periode.md) - setiap baris di-scope ke SATU userId
// penerima (BR-17: notifikasi export hanya utk pengekspor sendiri, bukan fan-out ke banyak user).
//
// Dependency opsional: muat pegawai-data.js SEBELUM file ini kalau mau pakai notifCurrentUserId()
// (dipakai bersama SIM_LOGIN_KEY yang sama dengan penugasan-dapil-reses.html/approval-penugasan.html
// supaya "user yang sedang login" konsisten lintas halaman).
var NOTIF_STORAGE_KEY = 'ep_notifications';
var NOTIF_SIM_LOGIN_KEY = 'ep_penugasan_sim_login_person_id';
// Aktor export Surat Masuk adalah Admin/Staf Sekretariat (BR-13 docs/surat_masuk.md), BUKAN
// Anggota DPRD seperti pengekspor Penugasan - halaman admin (surat-masuk.html dkk) tidak punya
// switcher "Login sebagai" seperti penugasan-dapil-reses.html, jadi dipakai satu id tetap supaya
// notifikasi export-nya (BR-16/17: hanya ke pengekspor) tetap bisa discoped & ditemukan balik oleh
// notifikasi.html tanpa ikut skema simulasi login per-Politisi di atas.
var NOTIF_ADMIN_USER_ID = 'admin-sekretariat';

function notifLoadList(){
  try{
    var raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    if(raw){ var parsed = JSON.parse(raw); if(Array.isArray(parsed)) return parsed; }
  } catch(e){}
  return [];
}
function notifSaveList(list){
  try{ localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(list.slice(-300))); } catch(e){}
}
// entry wajib membawa userId (penerima) - lihat BR-17. id dibuat otomatis kalau tidak diisi.
function notifPush(entry){
  var list = notifLoadList();
  var rec = Object.assign({
    id: 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    createdAtMs: Date.now(),
    read: false
  }, entry);
  list.push(rec);
  notifSaveList(list);
  return rec;
}
function notifCurrentUserId(){
  if(typeof pegawaiLoadList !== 'function') return null;
  var id = parseInt(localStorage.getItem(NOTIF_SIM_LOGIN_KEY), 10);
  var list = pegawaiLoadList().filter(function(p){ return p.tipePegawai === 'Politisi'; });
  var p = list.find(function(p){ return p.id === id; });
  if(!p && list.length){ p = list.slice().sort(function(a, b){ return a.nama.localeCompare(b.nama); })[0]; }
  return p ? p.id : null;
}
function notifListFor(userId, type){
  return notifLoadList().filter(function(n){
    if(n.userId !== userId) return false;
    if(type && n.type !== type) return false;
    return true;
  }).sort(function(a, b){ return b.createdAtMs - a.createdAtMs; });
}
function notifUnreadCountFor(userId, type){
  return notifListFor(userId, type).filter(function(n){ return !n.read; }).length;
}
function notifMarkRead(id){
  var list = notifLoadList();
  var rec = list.find(function(n){ return n.id === id; });
  if(rec && !rec.read){ rec.read = true; notifSaveList(list); }
}
function notifMarkAllReadFor(userId, type){
  var list = notifLoadList();
  var changed = false;
  list.forEach(function(n){
    if(n.userId === userId && (!type || n.type === type) && !n.read){ n.read = true; changed = true; }
  });
  if(changed) notifSaveList(list);
  return changed;
}
