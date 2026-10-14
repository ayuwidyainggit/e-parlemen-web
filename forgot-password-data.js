// Data permintaan Reset Kata Sandi (prototipe), dipakai oleh forgot-password.html
// (membuat permintaan) & pengguna.html (approval/penolakan oleh admin).
// Disimpan di localStorage supaya data tetap ada setelah reload - lihat pegawai-data.js
// untuk pola yang sama (seed + versi).
//
// Flow: user klik "Lupa kata sandi?" di login.html -> forgot-password.html -> isi
// email + kata sandi baru + konfirmasi -> request dibuat dgn status PENDING, dan
// pegawai terkait (pegawai-data.js) di-set loginStatus = 'PENDING_RESET_APPROVAL'
// (login diblokir selama status ini). Admin meninjau di pengguna.html:
//  - Setujui -> pegawai.password diganti ke newPassword, loginStatus = 'ACTIVE',
//    request.status = 'APPROVED'.
//  - Tolak   -> loginStatus dikembalikan ke 'ACTIVE' (password lama tetap berlaku),
//    request.status = 'REJECTED'.
//
// Field request: { id, pegawaiId, email, newPassword, status: 'PENDING'|'APPROVED'|'REJECTED',
//   requestedAt, decidedAt }.
var FORGOT_PWD_STORAGE_KEY = 'ep_forgot_password_requests';
var FORGOT_PWD_SEED_VERSION = 1;
var FORGOT_PWD_VERSION_KEY = 'ep_forgot_password_seed_version';
var FORGOT_PWD_DEFAULT_LIST = [];

function forgotPwdLoadList(){
  try{
    var storedVersion = localStorage.getItem(FORGOT_PWD_VERSION_KEY);
    if(storedVersion === String(FORGOT_PWD_SEED_VERSION)){
      var raw = localStorage.getItem(FORGOT_PWD_STORAGE_KEY);
      if(raw){
        var parsed = JSON.parse(raw);
        if(Array.isArray(parsed)) return parsed;
      }
    }
  } catch(e){}
  var seed = JSON.parse(JSON.stringify(FORGOT_PWD_DEFAULT_LIST));
  forgotPwdSaveList(seed);
  try{ localStorage.setItem(FORGOT_PWD_VERSION_KEY, String(FORGOT_PWD_SEED_VERSION)); } catch(e){}
  return seed;
}
function forgotPwdSaveList(list){
  try{ localStorage.setItem(FORGOT_PWD_STORAGE_KEY, JSON.stringify(list)); } catch(e){}
}
function forgotPwdNextId(list){
  var max = 0;
  list.forEach(function(r){ if(r.id > max) max = r.id; });
  return max + 1;
}
function forgotPwdFindById(list, id){
  return list.find(function(r){ return r.id === id; });
}
// Permintaan PENDING terbaru milik satu pegawai - dipakai pengguna.html utk tahu
// kata sandi baru mana yang mau disetujui/ditolak.
function forgotPwdFindPendingByPegawaiId(list, pegawaiId){
  var matches = list.filter(function(r){ return r.pegawaiId === pegawaiId && r.status === 'PENDING'; });
  if(!matches.length) return null;
  return matches[matches.length - 1];
}
function forgotPwdCreateRequest(list, pegawaiId, email, newPassword){
  var req = {
    id: forgotPwdNextId(list),
    pegawaiId: pegawaiId,
    email: email,
    newPassword: newPassword,
    status: 'PENDING',
    requestedAt: new Date().toISOString(),
    decidedAt: null
  };
  list.push(req);
  forgotPwdSaveList(list);
  return req;
}
