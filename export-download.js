// Shared cross-page: baca Riwayat Export (`assignment_report_exports`, localStorage bersama) &
// picu unduhan dari file yang SUDAH DIBANGUN saat job resolve (r.fileHtml, diisi oleh
// penugasan-dapil-reses.html begitu status jadi DONE) - meniru BE yang cuma men-stream
// `file_path` dari disk `minio` saat endpoint download dipanggil (§14.3, BR-13), BUKAN membangun
// ulang workbook setiap kali diunduh. Dipakai oleh penugasan-dapil-reses.html (tempat file
// pertama kali "dibangun") MAUPUN notifikasi.html (tombol Unduh di List Notification - redirect
// page sengaja "(Tidak ada)" sesuai spesifikasi notifikasi, jadi unduhan harus bisa jalan
// langsung dari halaman manapun tanpa pindah halaman dulu).
var EXPORT_HISTORY_STORAGE_KEY = 'ep_assignment_report_exports';

function exportHistoryLoad(){
  try{
    var raw = localStorage.getItem(EXPORT_HISTORY_STORAGE_KEY);
    if(raw){ var parsed = JSON.parse(raw); if(Array.isArray(parsed)) return parsed; }
  } catch(e){}
  return [];
}
function exportHistorySave(list){
  try{ localStorage.setItem(EXPORT_HISTORY_STORAGE_KEY, JSON.stringify(list.slice(-200))); } catch(e){}
}
function exportHistoryNextId(list){
  var max = 0; list.forEach(function(r){ if(r.id > max) max = r.id; }); return max + 1;
}
function triggerBlobDownload(fileName, htmlContent){
  var blob = new Blob(['﻿' + htmlContent], { type: 'application/vnd.ms-excel' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = fileName;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);
}
// Validasi auth + kepemilikan + status DONE di SETIAP pemanggilan (BR-13/§11 poin 4 & 8) - bukan
// hanya sekali saat link diterbitkan, karena link download sengaja tidak kedaluwarsa.
function downloadExportById(exportId, currentUserId){
  var r = exportHistoryLoad().find(function(x){ return x.id === exportId; });
  if(!r) return { ok: false, message: 'Data export tidak ditemukan' };
  if(currentUserId != null && r.userId !== currentUserId) return { ok: false, message: 'Anda bukan pemilik export ini' };
  if(r.status !== 'DONE') return { ok: false, message: 'File belum siap diunduh' };
  if(!r.fileHtml) return { ok: false, message: 'Berkas export ini sudah tidak tersedia' };
  triggerBlobDownload(r.fileName, r.fileHtml);
  return { ok: true, message: 'Laporan diunduh' };
}
