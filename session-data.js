// Sesi login (prototipe) - menyimpan siapa yang sedang login & Role AKTIF yang
// sedang dipakai. Satu akun (pegawai) bisa memiliki lebih dari satu Role sekaligus
// (lihat field roleIds di pegawai-data.js, mis. NARISQA = Ketua + Anggota) -
// activeRoleId menentukan menu/halaman mana yang bisa diakses saat ini.
// Muat pegawai-data.js & rbac-data.js SEBELUM file ini kalau dipakai untuk resolve
// nama Role/akun. Ditulis oleh login.html, dibaca & diubah (switch role) oleh
// dashboard.html lewat dropdown Role di topbar.
var SESSION_KEY = 'ep_session';

function sessionStart(personId, nama, roleIds){
  roleIds = (roleIds || []).filter(function(id){ return id != null; });
  if(!roleIds.length) roleIds = [null];
  var session = { personId: personId, nama: nama, roleIds: roleIds, activeRoleId: roleIds[0] };
  try{ localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch(e){}
  return session;
}
function sessionLoad(){
  try{
    var raw = localStorage.getItem(SESSION_KEY);
    if(raw) return JSON.parse(raw);
  } catch(e){}
  return null;
}
function sessionSetActiveRole(roleId){
  var s = sessionLoad();
  if(!s) return null;
  s.activeRoleId = roleId;
  try{ localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch(e){}
  return s;
}
function sessionClear(){
  try{ localStorage.removeItem(SESSION_KEY); } catch(e){}
}
