/**
 * Smart Patrol YPI — kirim data Google Sheet ke peta (panel Kelola Data).
 * Mengirim sheet "Temuan Patroli" dan "Effort Patrol" sebagai JSON.
 *
 * TIDAK PERLU MENGEDIT KODE INI. Langkah:
 *  1. Tempel seluruh kode ini ke Code.gs, lalu Save.
 *  2. Pilih fungsi "buatToken" di toolbar, klik Run (izinkan akses bila diminta).
 *     Token muncul di Execution log — salin dan simpan.
 *  3. Deploy > New deployment > Web app: Execute as "Me", Who has access "Anyone" > Deploy.
 *  4. URL untuk panel: <Web app URL>?token=<token>
 *
 * Token disimpan di Script Properties (bukan di kode). Untuk mengganti token
 * (mis. bocor), jalankan buatToken lagi: token lama langsung tidak berlaku.
 * Melihat token yang aktif: jalankan lihatToken.
 */

const VERSI = 3;
const SHEET_DEFAULT = ['Temuan Patroli', 'Effort Patrol'];

function buatToken() {
  const token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  PropertiesService.getScriptProperties().setProperty('TOKEN', token);
  Logger.log('Token baru (salin untuk URL panel): ' + token);
}

function lihatToken() {
  Logger.log('Token aktif: ' + (PropertiesService.getScriptProperties().getProperty('TOKEN') || '(belum ada, jalankan buatToken)'));
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  const token = PropertiesService.getScriptProperties().getProperty('TOKEN');
  if (!token) return kirim_({ versi: VERSI, error: 'Token belum dibuat. Jalankan fungsi buatToken di editor Apps Script.' });
  if (p.token !== token) return kirim_({ versi: VERSI, error: 'Token salah atau tidak ada.' });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const nama = p.sheet ? [p.sheet] : SHEET_DEFAULT;
  const sheets = nama.map(n => ss.getSheetByName(n));
  const hilang = nama.filter((n, i) => !sheets[i]);
  if (hilang.length) return kirim_({ versi: VERSI, error: 'Sheet tidak ditemukan: ' + hilang.join(', ') });

  // Hasil per sheet: { "Temuan Patroli": [ {kolom: nilai}, ... ], "Effort Patrol": [ ... ] }
  const hasil = {};
  sheets.forEach(sh => {
    // getDisplayValues: tanggal & jam persis seperti tampil di sheet (mis. "24-Aug-25", "2:36:29 PM").
    const nilai = sh.getDataRange().getDisplayValues();
    const data = [];
    if (nilai.length >= 2) {
      const judul = nilai.shift().map(j => String(j).trim());
      nilai.forEach(baris => {
        if (baris.every(c => String(c).trim() === '')) return;
        const o = {};
        judul.forEach((j, i) => { if (j) o[j] = baris[i]; });
        data.push(o);
      });
    }
    hasil[sh.getName()] = data;
  });
  return kirim_({ versi: VERSI, sumber: ss.getName(), diambil: new Date().toISOString(), sheets: hasil });
}

function kirim_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
