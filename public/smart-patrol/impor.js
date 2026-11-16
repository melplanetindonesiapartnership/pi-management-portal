// Pembaca file ekspor SMART (CSV / Excel) -> baris tabel temuan_patroli.
// Dipakai panel Kelola Data. Uji cepat: Impor.uji() di console.
const Impor = (() => {
  // Batas wajar koordinat: wilayah Indonesia (Kalbar, Flores, dan mitra lain).
  const BATAS = { lonMin: 94, lonMax: 142, latMin: -11.5, latMax: 6.5 };
  // Number.isFinite wajib: null (sel kosong) dianggap 0 oleh perbandingan >= / <= dan lolos diam-diam.
  const dalamBatas = (lon, lat) => Number.isFinite(lon) && Number.isFinite(lat) &&
    lon >= BATAS.lonMin && lon <= BATAS.lonMax && lat >= BATAS.latMin && lat <= BATAS.latMax;
  const WAJIB = ['Kawasan', 'Tanggal', 'Longitude (X)', 'Latitude (Y)', 'Observation Kategory 0'];
  // kolom database <- judul kolom di file SMART
  const PETA = {
    kawasan: 'Kawasan', tim: 'Tim', kategori: 'Observation Kategory 0', subkategori: 'Observation Kategory 1',
    jenis_kelamin: 'Jenis Kelamin', spesies_satwa: 'Spesies Satwa Liar', spesies_tumbuhan: 'Spesies Tumbuhan',
    info_lain: 'Informasi Lainnya', kondisi_fitur: 'Kondisi Fitur', nama: 'Nama', satuan: 'Satuan',
    tindakan: 'Tindakan', jenis_observasi: 'Jenis Observasi', umur: 'Umur'
  };
  const BULAN = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, mei: 5, jun: 6, jul: 7, aug: 8, agu: 8, agt: 8, sep: 9, oct: 10, okt: 10, nov: 11, dec: 12, des: 12 };
  const p2 = n => String(n).padStart(2, '0');
  const teks = v => { if (v == null) return null; const s = String(v).trim(); return s === '' ? null : s; };

  // Tanggal: angka seri Excel, "21-Sep-20", "2020-09-21", atau "21/09/2020" (hari/bulan/tahun).
  function tanggal(v) {
    if (typeof v === 'number') { const d = new Date(Math.round((v - 25569) * 86400000)); return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]; }
    const s = teks(v); if (!s) return null;
    let m;
    if ((m = s.match(/^(\d{1,2})[-\s]([A-Za-z]{3})[A-Za-z]*[-\s](\d{2}|\d{4})$/)) && BULAN[m[2].toLowerCase()])
      return [m[3].length === 2 ? 2000 + +m[3] : +m[3], BULAN[m[2].toLowerCase()], +m[1]];
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return [+m[1], +m[2], +m[3]];
    if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/))) return [m[3].length === 2 ? 2000 + +m[3] : +m[3], +m[2], +m[1]];
    return null;
  }
  // Jam: pecahan hari Excel, "2:36:29 PM", atau "16:05:24".
  function jam(v) {
    if (v == null || v === '') return [0, 0, 0];
    if (typeof v === 'number') { const d = Math.round((v % 1) * 86400); return [Math.floor(d / 3600) % 24, Math.floor(d / 60) % 60, d % 60]; }
    const m = String(v).trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])?$/);
    if (!m) return null;
    let h = +m[1];
    if (m[4]) { if (h < 1 || h > 12) return null; h = h % 12 + (/p/i.test(m[4]) ? 12 : 0); }
    return h > 23 ? null : [h, +m[2], +(m[3] || 0)];
  }
  function angka(v) {
    if (v == null || v === '') return null;
    const n = typeof v === 'number' ? v : Number(String(v).trim().replace(',', '.'));
    return Number.isFinite(n) ? n : NaN;
  }

  // Satu baris file -> { baris } atau { salah: alasan }.
  function ubahBaris(b) {
    const r = {};
    for (const [kol, judul] of Object.entries(PETA)) r[kol] = teks(b[judul]);
    const tgl = tanggal(b['Tanggal']), j = jam(b['Waktu']);
    if (!tgl || tgl[1] < 1 || tgl[1] > 12 || tgl[2] < 1 || tgl[2] > 31) return { salah: `Tanggal tidak terbaca: "${b['Tanggal'] ?? ''}"` };
    if (!j) return { salah: `Waktu tidak terbaca: "${b['Waktu'] ?? ''}"` };
    r.waktu = `${tgl[0]}-${p2(tgl[1])}-${p2(tgl[2])}T${p2(j[0])}:${p2(j[1])}:${p2(j[2])}`;
    r.lon = angka(b['Longitude (X)']); r.lat = angka(b['Latitude (Y)']);
    if (!dalamBatas(r.lon, r.lat))
      return { salah: `Koordinat di luar Indonesia atau kosong: ${b['Longitude (X)'] ?? '-'}, ${b['Latitude (Y)'] ?? '-'}` };
    r.jumlah = angka(b['Total']); r.total_orang = angka(b['Total Orang']);
    if (Number.isNaN(r.jumlah) || Number.isNaN(r.total_orang)) return { salah: 'Total / Total Orang bukan angka' };
    const pl = (teks(b['Pelanggaran']) || '').toLowerCase();
    r.pelanggaran = pl === 'ya' ? true : (pl === 'bukan' || pl === 'tidak') ? false : null;
    if (!r.kawasan) return { salah: 'Kawasan kosong' };
    return { baris: r };
  }

  // Baris identik dalam satu file diberi nomor urut 1, 2, ... supaya kunci anti-duplikat konsisten.
  function beriUrutan(rows) {
    const hit = new Map();
    for (const r of rows) { const k = JSON.stringify(r); const n = (hit.get(k) || 0) + 1; hit.set(k, n); r.urutan = n; }
    return rows;
  }

  // SheetJS dimuat saat pertama dibutuhkan (±900 KB), bukan saat peta dibuka.
  let xlsxSiap;
  function muatXlsx() {
    return xlsxSiap ??= new Promise((ok, gagal) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
      s.onload = ok; s.onerror = () => { xlsxSiap = null; gagal(new Error('Gagal memuat pembaca Excel')); };
      document.head.append(s);
    });
  }

  // File -> { sheet, total, siap: [...], salah: [[nomorBaris, alasan]], kurang: [kolom wajib yang hilang] }
  async function baca(file) {
    await muatXlsx();
    const buf = await file.arrayBuffer();
    const csv = /\.csv$/i.test(file.name);
    // CSV dibaca sebagai teks apa adanya; Excel memberi angka seri untuk tanggal/jam.
    const wb = XLSX.read(buf, csv ? { type: 'array', raw: true, codepage: 65001 } : { type: 'array' });
    // Excel "SMART Patrol Master" (unduhan Google Sheet): baca sheet Temuan Patroli + Effort Patrol
    // sebagai teks tampilan, sama seperti yang dikirim Apps Script.
    const cari = re => wb.SheetNames.find(n => re.test(n.trim()));
    const shTemuan = cari(/^temuan patroli$/i), shEffort = cari(/^effort patrol$/i);
    if (shTemuan) {
      const teksSheet = n => n ? XLSX.utils.sheet_to_json(wb.Sheets[n], { raw: false, defval: '' })
        .filter(o => Object.values(o).some(v => String(v).trim())) : [];
      const temuan = teksSheet(shTemuan);
      if (formatMaster(temuan)) return { sheet: [shTemuan, shEffort].filter(Boolean).join(' + '), ...olahMaster(temuan, teksSheet(shEffort)) };
    }
    const sheet = wb.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(wb.Sheets[sheet], { defval: null, raw: true });
    return { sheet, ...olahBaris(data) };
  }

  // Array objek berjudul kolom SMART (dari file atau Apps Script) -> { total, siap, salah, kurang }.
  function olahBaris(data) {
    // Judul diambil dari semua baris: Apps Script/JSON bisa melewatkan kolom kosong di baris tertentu.
    const judul = new Set(data.flatMap(b => Object.keys(b).map(k => k.trim())));
    const kurang = WAJIB.filter(k => !judul.has(k));
    const siap = [], salah = [];
    if (!kurang.length) data.forEach((b, i) => {
      const bersih = Object.fromEntries(Object.entries(b).map(([k, v]) => [k.trim(), v]));
      const h = ubahBaris(bersih); h.baris ? siap.push(h.baris) : salah.push([i + 2, h.salah]);
    });
    return { total: data.length, siap: beriUrutan(siap), salah, kurang };
  }

  // ================= Format "SMART Patrol Master" (Google Sheet multi-mitra) =================
  const TETAP_KAPITAL = new Set(['HHBK', 'KPH', 'KPHL', 'CTI', 'TNI', 'POLRI', 'BKSDA', 'TN', 'HL', 'DAS']);
  // "SATWA LIAR" -> "Satwa Liar"; teks yang sudah campuran huruf dibiarkan. Spasi ganda dirapikan.
  function rapikanNama(v) {
    const s = teks(v); if (!s) return null;
    const t = s.replace(/\s+/g, ' ');
    if (t !== t.toUpperCase() || !/[A-Z]/.test(t)) return t;
    return t.toLowerCase().replace(/\b\p{L}+/gu, w => TETAP_KAPITAL.has(w.toUpperCase()) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1));
  }
  const ambil = (b, ...k) => { for (const x of k) { const v = teks(b[x]); if (v) return v; } return null; };
  // Tanggal Master: "Kode Bulan" (24-Aug-25) tidak ambigu; kolom Tanggal memakai bulan/hari/tahun (8/24/2025).
  function tanggalMaster(b) {
    const kb = tanggal(b['Kode Bulan']);
    if (kb) return kb;
    const m = String(b['Tanggal'] ?? '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return [+m[3], +m[1], +m[2]];
    if (teks(b['Tanggal'])) return tanggal(b['Tanggal']);
    // Cadangan: kolom Referensi = tanggal + desa, mis. "19/03/2025Enggano" (hari/bulan/tahun) atau "45893Enggano" (seri Excel).
    const ref = String(b['Referensi'] ?? '').trim();
    const r1 = ref.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (r1) return [+r1[3], +r1[2], +r1[1]];
    const r2 = ref.match(/^(4\d{4})(?!\d)/); // seri Excel 40000–49999 = 2009–2036
    return r2 ? tanggal(+r2[1]) : null;
  }
  // Jam longgar: "12.06.38 PM" (titik), "16:20:36 PM" (jam 24 + PM: PM diabaikan).
  function jamLonggar(v) {
    if (v == null || v === '') return [0, 0, 0];
    let s = String(v).trim().replace(/\./g, ':');
    const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])?$/);
    if (m && m[4] && +m[1] > 12) s = s.replace(/\s*[AaPp][Mm]$/, '');
    return jam(s);
  }
  const kunciTeks = s => (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const idEffort = (mitra, desa, tim, tgl) => ['sheet', mitra, desa, tim, tgl].map(kunciTeks).join('|');

  function barisMaster(b) {
    const tgl = tanggalMaster(b), j = jamLonggar(b['Waktu']);
    if (!tgl || tgl[1] < 1 || tgl[1] > 12 || tgl[2] < 1 || tgl[2] > 31) return { salah: `Tanggal tidak terbaca: "${b['Kode Bulan'] || b['Tanggal'] || ''}"` };
    if (!j) return { salah: `Waktu tidak terbaca: "${b['Waktu'] ?? ''}"` };
    const lon = angka(b['Longitude (X)']), lat = angka(b['Latitude (Y)']);
    if (!dalamBatas(lon, lat)) return { salah: `Koordinat tidak valid: ${b['Longitude (X)'] ?? '-'}, ${b['Latitude (Y)'] ?? '-'}` };
    const jumlah = angka(b['Total']);
    const asal = teks(b['Asal']), info = teks(b['Informasi Lainnya']);
    const pl = (teks(b['Pelanggaran']) || '').toLowerCase();
    const r = {
      mitra: ambil(b, 'Mitra'), desa: ambil(b, 'Desa'), kawasan: ambil(b, 'Desa', 'Lokasi', 'Mitra'), tim: ambil(b, 'Tim'),
      waktu: `${tgl[0]}-${p2(tgl[1])}-${p2(tgl[2])}T${p2(j[0])}:${p2(j[1])}:${p2(j[2])}`, lon, lat,
      kategori: rapikanNama(b['Observasi Kategori 0'] ?? b['Observation Kategory 0']),
      subkategori: rapikanNama(b['Observasi Kategori 1'] ?? b['Observation Kategory 1']),
      kelompok: rapikanNama(b['Kategori 0']),
      spesies_satwa: ambil(b, 'Spesies Satwa', 'Spesies Satwa Liar'), spesies_tumbuhan: ambil(b, 'Spesies Tumbuhan'),
      jumlah: Number.isNaN(jumlah) ? null : jumlah, satuan: ambil(b, 'Satuan'), jenis_observasi: ambil(b, 'Jenis Observasi'),
      tindakan: ambil(b, 'Tindakan'), umur: ambil(b, 'Umur'), jenis_kelamin: ambil(b, 'Jenis Kelamin'),
      nama: ambil(b, 'Nama Pelaku', 'Nama'), // privat
      info_lain: [info, asal && `Asal: ${asal}`].filter(Boolean).join('; ') || null, // privat
      pelanggaran: pl === 'ya' ? true : (pl === 'bukan' || pl === 'tidak') ? false : null
    };
    if (!r.kawasan) return { salah: 'Desa / Lokasi / Mitra kosong' };
    if (!r.kategori) return { salah: 'Observasi Kategori 0 kosong' };
    r.patroli_id = r.tim ? idEffort(r.mitra, r.desa, r.tim, r.waktu.slice(0, 10)) : null;
    return { baris: r };
  }

  // Sheet Effort Patrol -> baris tabel patroli (satu per mitra + desa + tim + tanggal).
  function olahEffort(data) {
    const per = new Map(), salah = [];
    data.forEach((b0, i) => {
      const b = Object.fromEntries(Object.entries(b0).map(([k, v]) => [k.trim(), v]));
      const m = String(b['Period'] ?? b['Tanggal'] ?? '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); // hari/bulan/tahun
      const tgl = m ? `${m[3]}-${p2(+m[2])}-${p2(+m[1])}` : null;
      const km = angka(b['Jarak Tempuh']), jamEf = angka(b['Waktu Efektif']);
      const tim = teks(b['Tim']), mitra = teks(b['Mitra']), desa = teks(b['Desa']);
      if (!tgl || +m[2] > 12) return salah.push([i + 2, `Period tidak terbaca (harus hari/bulan/tahun): "${b['Period'] ?? ''}"`]);
      if (!tim) return salah.push([i + 2, 'Tim kosong']);
      if (!(km > 0 && km < 200)) return salah.push([i + 2, `Jarak Tempuh kosong/tidak wajar: "${b['Jarak Tempuh'] ?? ''}"`]);
      const id = idEffort(mitra, desa, tim, tgl);
      const e = per.get(id) ?? per.set(id, { id, sumber: 'sheet', mitra, desa, kawasan: desa || mitra, tim, mulai: `${tgl}T00:00:00`,
        jarak_m: 0, durasi_aktif_menit: null, jumlah_anggota: null }).get(id);
      e.jarak_m = Math.round((e.jarak_m + km * 1000) * 10) / 10;
      // Waktu efektif dalam jam; nilai > 24 kemungkinan angka tanggal yang salah ketik, diabaikan.
      if (jamEf > 0 && jamEf <= 24) e.durasi_aktif_menit = Math.round(((e.durasi_aktif_menit || 0) + jamEf * 60) * 100) / 100;
      const ang = angka(b['Anggota']); if (ang > 0) e.jumlah_anggota = Math.max(e.jumlah_anggota || 0, ang);
    });
    return { patroli: [...per.values()], salah };
  }

  // Data Master: { temuan: [...], effort: [...] } -> hasil siap unggah.
  function olahMaster(temuanData, effortData) {
    const siap = [], salah = [];
    temuanData.forEach((b0, i) => {
      const b = Object.fromEntries(Object.entries(b0).map(([k, v]) => [k.trim(), v]));
      const h = barisMaster(b); h.baris ? siap.push(h.baris) : salah.push([i + 2, h.salah]);
    });
    const ef = olahEffort(effortData || []);
    const ada = new Set(ef.patroli.map(p => p.id));
    for (const r of siap) if (!ada.has(r.patroli_id)) r.patroli_id = null; // temuan tanpa data effort hari itu
    return { total: temuanData.length, siap: beriUrutan(siap), salah, kurang: [], effort: ef.patroli, salahEffort: ef.salah, master: true };
  }
  const formatMaster = data => data.some(b => Object.keys(b).some(k => k.trim() === 'Observasi Kategori 0'));

  // URL web app Apps Script -> { sheet, total, siap, salah, kurang }.
  async function ambilAppsScript(url) {
    let u;
    try { u = new URL(url); } catch { throw new Error('URL tidak valid.'); }
    if (!/^script\.google(usercontent)?\.com$/.test(u.hostname)) throw new Error('URL harus web app Apps Script (script.google.com/macros/s/…/exec).');
    let res;
    try { res = await fetch(u, { redirect: 'follow' }); }
    catch { throw new Error('Tidak bisa menghubungi Apps Script. Periksa URL (harus berakhiran /exec), koneksi internet, dan deployment "Who has access: Anyone".'); }
    if (!res.ok) throw new Error(`Apps Script membalas HTTP ${res.status}. Pastikan deployment "Who has access: Anyone".`);
    let j;
    try { j = await res.json(); } catch { throw new Error('Balasan bukan JSON. Pastikan URL berakhiran /exec dan deployment sudah diperbarui.'); }
    if (j.error) throw new Error(`Apps Script: ${j.error}`);
    if (j.sheets && typeof j.sheets === 'object') {
      const nama = Object.keys(j.sheets);
      const temuan = nama.filter(n => !/effort/i.test(n)).flatMap(n => j.sheets[n]);
      const effort = nama.filter(n => /effort/i.test(n)).flatMap(n => j.sheets[n]);
      const label = [j.sumber, nama.join(' + ')].filter(Boolean).join(' · ');
      return { sheet: label, ...(formatMaster(temuan) ? olahMaster(temuan, effort) : olahBaris(temuan)) };
    }
    const data = Array.isArray(j) ? j : j.data;
    if (!Array.isArray(data)) throw new Error('Format JSON tidak dikenali: harus array baris atau { data: [...] }.');
    return { sheet: [j.sumber, ...(j.sheet || [])].filter(Boolean).join(' · ') || 'Apps Script', ...(formatMaster(data) ? olahMaster(data, []) : olahBaris(data)) };
  }

  // ================= JSON SMART Mobile (GeoJSON FeatureCollection) =================
  // Fitur dengan properties.sighting.SMART_PatrolID = event patroli / observasi;
  // fitur tanpa sighting = titik jalur GPS. Kategori, atribut, tim, dll. berupa kode UUID
  // yang diterjemahkan lewat tabel kamus.
  const waktuLokal = s => s ? String(s).slice(0, 19) : null; // "2026-06-01T11:47:12.010+08:00" -> jam lokal lapangan
  const ms = s => Date.parse(s);
  function jarakM([lon1, lat1], [lon2, lat2]) { // haversine, meter
    const R = 6371008.8, r = Math.PI / 180, dLat = (lat2 - lat1) * r, dLon = (lon2 - lon1) * r;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }
  const JENIS_PREFIX = { 'pt:': 'tim', 'pm:': 'mandat', 'tt:': 'transportasi', 'l:': 'pilihan', 't:': 'pilihan' };
  const AKURASI_MAKS_M = 30;

  function parseSmartJson(teks) {
    let j;
    try { j = JSON.parse(teks); } catch { throw new Error('File bukan JSON yang valid.'); }
    if (j?.type !== 'FeatureCollection' || !Array.isArray(j.features))
      throw new Error('Format JSON belum dikenali. Yang didukung: ekspor GeoJSON SMART Mobile (FeatureCollection).');
    const titik = f => f.geometry?.type === 'Point' && Array.isArray(f.geometry.coordinates) ? f.geometry.coordinates.slice(0, 2).map(Number) : null;
    const sight = j.features.filter(f => f.properties?.sighting?.SMART_PatrolID && titik(f));
    if (!sight.length) throw new Error('Tidak ada data patroli SMART (SMART_PatrolID) di file ini.');
    // Titik jalur dengan akurasi GPS buruk dibuang supaya jarak tidak membengkak oleh lompatan sinyal.
    const semuaTrack = j.features.filter(f => !f.properties?.sighting && titik(f) && f.properties?.dateTime);
    const track = semuaTrack.filter(f => !(+f.properties.accuracy > AKURASI_MAKS_M))
      .map(f => ({ t: f.properties.dateTime, xy: titik(f) }));
    const nBuruk = semuaTrack.length - track.length;

    const kode = new Map(); // kode -> { jenis, contoh: Set }
    const catat = (k, jenis, contoh) => {
      if (!k) return;
      const e = kode.get(k) ?? kode.set(k, { jenis, contoh: new Set() }).get(k);
      if (contoh && e.contoh.size < 3) e.contoh.add(String(contoh).slice(0, 60));
    };

    const perPatroli = new Map();
    for (const f of sight) {
      const id = f.properties.sighting.SMART_PatrolID;
      (perPatroli.get(id) ?? perPatroli.set(id, []).get(id)).push(f);
    }

    const patroli = [], observasi = [], masalah = [];
    for (const [id, fs] of perPatroli) {
      fs.sort((a, b) => ms(a.properties.dateTime) - ms(b.properties.dateTime));
      const s0 = fs[0].properties.sighting;
      // Durasi aktif: jumlah selang mulai/lanjut -> jeda/selesai.
      let aktifMs = 0, dari = null, selesai = null, mulai = null;
      const legMaks = {};
      for (const f of fs) {
        const s = f.properties.sighting, t = ms(f.properties.dateTime), jenis = s.SMART_ObservationType;
        const leg = s.SMART_PatrolLegCounter ?? 1;
        if (Number.isFinite(+s.SMART_PatrolLegDistance)) legMaks[leg] = Math.max(legMaks[leg] ?? 0, +s.SMART_PatrolLegDistance);
        if (jenis === 'NewPatrol') { mulai ??= f.properties.dateTime; dari = t; }
        else if (jenis === 'ResumePatrol') { dari ??= t; }
        else if (jenis === 'PausePatrol' || jenis === 'StopPatrol') {
          if (dari != null) { aktifMs += t - dari; dari = null; }
          if (jenis === 'StopPatrol') selesai = f.properties.dateTime;
        }
      }
      mulai ??= fs[0].properties.dateTime;
      if (!selesai) { selesai = fs[fs.length - 1].properties.dateTime; masalah.push(`Patroli ${id.slice(0, 8)}: tidak ada event StopPatrol; waktu selesai memakai titik terakhir.`); }
      if (dari != null) aktifMs += ms(selesai) - dari;

      // Jalur: titik GPS dalam rentang waktu patroli + titik event, diurutkan waktu.
      const a = ms(mulai), b = ms(selesai);
      const jalur = [...track.filter(p => ms(p.t) >= a && ms(p.t) <= b), ...fs.map(f => ({ t: f.properties.dateTime, xy: titik(f) }))]
        .sort((p, q) => ms(p.t) - ms(q.t))
        .map(p => p.xy).filter((xy, i, arr) => i === 0 || xy[0] !== arr[i - 1][0] || xy[1] !== arr[i - 1][1]);
      let jarakJalur = 0;
      for (let i = 1; i < jalur.length; i++) jarakJalur += jarakM(jalur[i - 1], jalur[i]);
      if (jalur.some(([x, y]) => !dalamBatas(x, y))) masalah.push(`Patroli ${id.slice(0, 8)}: ada titik jalur di luar Indonesia.`);

      ['SMART_Team', 'SMART_Mandate', 'SMART_PatrolTransport'].forEach(k => s0[k] && catat(s0[k], JENIS_PREFIX[s0[k].split(':')[0] + ':'] || 'lain'));
      const obs = fs.filter(f => f.properties.sighting.SMART_ObservationType === 'Observation');
      patroli.push({
        id, kodeTim: s0.SMART_Team || null, kodeMandat: s0.SMART_Mandate || null, kodeTransportasi: s0.SMART_PatrolTransport || null,
        tujuan: (typeof s0.SMART_Objective === 'string' && s0.SMART_Objective.trim()) || null,
        jumlah_anggota: Object.entries(s0).filter(([k, v]) => k.startsWith('e:') && v === true).length || null,
        mulai: waktuLokal(mulai), selesai: waktuLokal(selesai),
        durasi_aktif_menit: Math.round(aktifMs / 600) / 100,
        jarak_m: Object.keys(legMaks).length ? Math.round(Object.values(legMaks).reduce((x, y) => x + y, 0) * 10) / 10 : null,
        jarak_jalur_m: Math.round(jarakJalur * 10) / 10,
        jalur: jalur.length >= 2 ? `SRID=4326;LINESTRING(${jalur.map(([x, y]) => `${x} ${y}`).join(',')})` : null,
        nTitik: jalur.length, nObs: obs.length
      });

      for (const f of obs) {
        const s = f.properties.sighting, [lon, lat] = titik(f);
        const kat = s['c:0'] ? 'c:' + s['c:0'] : null;
        const atr = Object.entries(s).filter(([k]) => /^a:\d+:/.test(k)).map(([k, v]) => ['a:' + k.split(':')[2], v]);
        const teksContoh = atr.map(([, v]) => v).find(v => typeof v === 'string' && !/^[lt]:/.test(v));
        catat(kat, 'kategori', teksContoh);
        for (const [ak, v] of atr) {
          catat(ak, 'atribut', typeof v === 'string' && /^[lt]:/.test(v) ? null : v);
          if (typeof v === 'string' && /^[lt]:/.test(v)) catat(v, 'pilihan', ak);
        }
        if (!dalamBatas(lon, lat)) { masalah.push(`Observasi ${f.properties.id?.slice(0, 8)}: koordinat di luar Indonesia (${lon}, ${lat}), dilewati.`); continue; }
        observasi.push({ smart_id: f.properties.id || null, waypoint_id: s.SMART_SightingGroupId || null, patroli_id: id, waktu: waktuLokal(f.properties.dateTime), lon, lat,
          mentah: { kat, tim: s.SMART_Team || s0.SMART_Team || null, atr: Object.fromEntries(atr) },
          foto: Object.keys(s).filter(k => /^SMART_Photo\d+:\d+$/.test(k) && typeof s[k] === 'string')
            .sort((a, b) => a.localeCompare(b, 'en', { numeric: true })).map(k => s[k]) });
      }
    }
    if (nBuruk) masalah.push(`${nBuruk} titik jalur dibuang karena akurasi GPS lebih buruk dari ${AKURASI_MAKS_M} m.`);
    return { patroli, observasi, kode, masalah, nTrack: track.length };
  }

  // Kolom tujuan untuk atribut SMART. Default 'info_lain' (privat) supaya data tak sengaja terbuka ke publik.
  const KOLOM_ATRIBUT = ['info_lain', 'spesies_satwa', 'spesies_tumbuhan', 'jenis_observasi', 'jumlah', 'satuan', 'jenis_kelamin', 'umur', 'tindakan', 'kondisi_fitur', 'nama', 'abaikan'];
  const KOLOM_TEKS = KOLOM_ATRIBUT.filter(k => k !== 'abaikan' && k !== 'jumlah');

  // Kolom temuan yang berasal dari kamus, dihitung dari kode mentah.
  // Dipakai saat unggah dan saat "terapkan ulang kamus" (tidak menyentuh waktu/koordinat hasil kurasi).
  function labelTemuan(mentah, kamus) {
    const label = k => kamus[k]?.label || null;
    const [kategori, ...sub] = (label(mentah.kat) || mentah.kat || '').split('>').map(s => s.trim());
    const r = { tim: label(mentah.tim) || mentah.tim, kategori: kategori || null, subkategori: sub.join(' > ') || null, jumlah: null };
    for (const k of KOLOM_TEKS) r[k] = null;
    const teks = {};
    for (const [ak, v] of Object.entries(mentah.atr || {})) {
      const nilai = typeof v === 'string' && /^[lt]:/.test(v) ? (label(v) || v) : v;
      const kol = kamus[ak]?.kolom || 'info_lain';
      if (kol === 'abaikan') continue;
      if (kol === 'jumlah') { const n = Number(String(nilai).replace(',', '.')); if (Number.isFinite(n)) r.jumlah = n; continue; }
      (teks[kol] ??= []).push(kol === 'info_lain' ? `${label(ak) || ak}: ${nilai}` : String(nilai));
    }
    for (const [kol, arr] of Object.entries(teks)) r[kol] = arr.join('; ');
    return r;
  }
  function labelPatroli(p, kamus) {
    const label = k => kamus[k]?.label || k || null;
    return { tim: label(p.kode_tim), mandat: label(p.kode_mandat), transportasi: label(p.kode_transportasi) };
  }

  // Hasil parse + kamus { kode: {label, kolom} } -> baris siap simpan.
  function susunJson(h, kamus, kawasan) {
    const patroli = h.patroli.map(p => {
      const kode = { kode_tim: p.kodeTim, kode_mandat: p.kodeMandat, kode_transportasi: p.kodeTransportasi };
      return { id: p.id, kawasan, tujuan: p.tujuan, ...kode, ...labelPatroli(kode, kamus), jumlah_anggota: p.jumlah_anggota, mulai: p.mulai, selesai: p.selesai,
        durasi_aktif_menit: p.durasi_aktif_menit, jarak_m: p.jarak_m, jarak_jalur_m: p.jarak_jalur_m, jalur: p.jalur };
    });
    const temuan = h.observasi.map(o => ({
      kawasan, waktu: o.waktu, lon: o.lon, lat: o.lat, patroli_id: o.patroli_id, smart_id: o.smart_id, waypoint_id: o.waypoint_id, pelanggaran: null,
      atribut: o.mentah, ...labelTemuan(o.mentah, kamus)
    }));
    return { patroli, temuan: beriUrutan(temuan) };
  }

  // Foto base64 dari SMART -> Blob JPEG yang lebih kecil (sisi terpanjang maks 1600 px).
  async function kompresFoto(base64, maks = 1600, kualitas = 0.8) {
    const mime = base64.startsWith('iVBOR') ? 'image/png' : 'image/jpeg';
    const img = new Image();
    img.src = `data:${mime};base64,${base64}`;
    await img.decode();
    const skala = Math.min(1, maks / Math.max(img.naturalWidth, img.naturalHeight));
    // Foto JPEG yang sudah kecil diunggah apa adanya: kompres ulang malah memperbesar file.
    if (skala === 1 && mime === 'image/jpeg') return new Blob([Uint8Array.from(atob(base64), ch => ch.charCodeAt(0))], { type: mime });
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * skala); c.height = Math.round(img.naturalHeight * skala);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return new Promise((ok, gagal) => c.toBlob(b => b ? ok(b) : gagal(new Error('Gagal mengompres foto')), 'image/jpeg', kualitas));
  }

  function uji() {
    const sama = (a, b) => console.assert(JSON.stringify(a) === JSON.stringify(b), JSON.stringify(a), '!=', JSON.stringify(b));
    sama(tanggal('21-Sep-20'), [2020, 9, 21]); sama(tanggal('2024-03-05'), [2024, 3, 5]); sama(tanggal('5/3/2024'), [2024, 3, 5]);
    sama(tanggal(44095), [2020, 9, 21]); sama(jam('2:36:29 PM'), [14, 36, 29]); sama(jam('12:05:00 AM'), [0, 5, 0]);
    sama(jam('16:05:24'), [16, 5, 24]); sama(jam(0.5), [12, 0, 0]); sama(jam('13:00 PM'), null);
    sama(ubahBaris({ Kawasan: 'X', Tanggal: '1-Jan-25', Waktu: '1:00:00 AM', 'Longitude (X)': '0', 'Latitude (Y)': '0', 'Observation Kategory 0': 'Posisi' }).salah?.startsWith('Koordinat'), true);
    return 'uji impor selesai (lihat console untuk assertion gagal)';
  }

  return { baca, olahBaris, olahMaster, rapikanNama, jamLonggar, ambilAppsScript, uji, WAJIB, parseSmartJson, susunJson, labelTemuan, labelPatroli, KOLOM_ATRIBUT, dalamBatas, kompresFoto };
})();
