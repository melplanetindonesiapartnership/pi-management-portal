// Panel Kelola Data: input data, kurasi (edit / sampah / status), riwayat unggahan & log.
// Memakai SUPABASE_URL, SUPABASE_KEY, esc, fmt, unik, semua, map dari index.html.
// Keamanan ada di database (RLS + tabel admin); panel ini hanya antarmuka.
const Kelola = (() => {
  const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const PER_HALAMAN = 50;
  const KOLOM_TABEL = 'id,waktu,kawasan,tim,kategori,subkategori,spesies_satwa,jenis_observasi,status,dihapus_pada,lon,lat';
  const FORM = [ // [kolom, label, jenis]
    ['kawasan', 'Kawasan', 'text'], ['tim', 'Tim', 'text'], ['waktu', 'Waktu', 'datetime-local'],
    ['lon', 'Longitude', 'number'], ['lat', 'Latitude', 'number'], ['status', 'Status kurasi', 'status'],
    ['kategori', 'Kategori', 'text'], ['subkategori', 'Subkategori', 'text'], ['jenis_observasi', 'Jenis observasi', 'text'],
    ['spesies_satwa', 'Spesies satwa', 'text'], ['spesies_tumbuhan', 'Spesies tumbuhan', 'text'], ['jenis_kelamin', 'Jenis kelamin', 'text'],
    ['umur', 'Umur', 'text'], ['jumlah', 'Jumlah', 'number'], ['satuan', 'Satuan', 'text'],
    ['total_orang', 'Jumlah orang', 'number'], ['pelanggaran', 'Pelanggaran', 'bool'], ['kondisi_fitur', 'Kondisi fitur', 'text'],
    ['tindakan', 'Tindakan', 'text'], ['nama', 'Nama pelaku (privat)', 'text'], ['info_lain', 'Informasi lainnya (privat)', 'textarea']
  ];

  let berubah = false, siapUnggah = [], siapEffort = [], namaFileUnggah = '', halaman = 0, dipilih = new Set(), barisTampil = [];
  let petaMini, penandaMini, sorot;

  const root = document.createElement('div');
  root.id = 'kelola'; root.hidden = true;
  root.innerHTML = `
  <div class="k-latar" data-tutup></div>
  <div id="kSaran" hidden></div>
  <section class="k-kotak" role="dialog" aria-modal="true" aria-labelledby="kJudul">
    <header class="k-kepala">
      <h2 id="kJudul">Kelola Data</h2>
      <span class="k-siapa" id="kSiapa"></span>
      <button id="kKeluar" hidden>Keluar</button>
      <button class="k-tutup" data-tutup aria-label="Tutup">×</button>
    </header>
    <div class="k-badan">
      <div id="kLogin" class="k-kartu" style="max-width:420px;margin:30px auto">
        <h3>Masuk sebagai admin</h3>
        <p class="k-ket">Hanya email yang terdaftar sebagai admin yang bisa menambah, mengubah, dan menghapus data.</p>
        <form id="kFormLogin">
          <label for="kEmail">Email</label><input type="email" id="kEmail" required autocomplete="username">
          <label for="kSandi">Kata sandi</label><input type="password" id="kSandi" required autocomplete="current-password">
          <div style="margin-top:14px"><button class="k-btn" type="submit">Masuk</button></div>
        </form>
        <div id="kPesanLogin"></div>
      </div>

      <div id="kIsi" hidden>
        <nav class="k-tab" role="tablist">
          <button role="tab" data-tab="input" aria-selected="true">Input Data</button>
          <button role="tab" data-tab="kurasi" aria-selected="false">Kurasi Data</button>
          <button role="tab" data-tab="kamus" aria-selected="false">Kamus Kode</button>
          <button role="tab" data-tab="riwayat" aria-selected="false">Riwayat</button>
        </nav>

        <div data-panel="input">
          <div class="k-kartu">
            <h3>Unggah data patroli</h3>
            <p class="k-ket"><b>JSON SMART Mobile</b> (disarankan): patroli, jalur GPS, durasi, jarak, dan observasi sekaligus,
              jadi effort dan encounter rate bisa dihitung.<br>
              <b>Excel SMART Patrol Master</b> (Google Sheet → File → Download → Microsoft Excel): sheet Temuan Patroli + Effort Patrol, semua mitra sekaligus.<br>
              <b>CSV / Excel</b> ekspor SMART (${Impor.WAJIB.map(k => `<code>${k}</code>`).join(', ')}, …): hanya titik temuan, tanpa effort.<br>
              File boleh tumpang tindih dengan data lama: yang sudah ada otomatis dilewati.
              Data baru berstatus <span class="k-status baru">baru</span> dan langsung tampil di peta.</p>
            <div class="k-drop" id="kDrop" tabindex="0" role="button"><b>Klik untuk memilih file</b> (.json, .geojson, .csv, .xlsx) atau tarik file ke sini
              <input type="file" id="kFile" accept=".json,.geojson,.csv,.xlsx,.xls" hidden></div>
            <div id="kPesanFile"></div>
          </div>
          <div class="k-kartu">
            <h3>Ambil dari Google Sheet (Apps Script)</h3>
            <p class="k-ket">Tempel URL web app Apps Script beserta token, contoh
              <code>https://script.google.com/macros/s/…/exec?token=…</code>. Tambahkan <code>&amp;sheet=Nama Sheet</code> untuk satu sheet saja.
              Kolomnya sama dengan ekspor SMART. URL tidak disimpan di browser.</p>
            <div class="k-baris">
              <div style="flex:4"><label for="kAsUrl">URL Apps Script</label><input type="text" id="kAsUrl" autocomplete="off" spellcheck="false" placeholder="https://script.google.com/macros/s/…/exec?token=…"></div>
              <div style="flex:none"><button class="k-btn" id="kAsAmbil">Ambil data</button></div>
            </div>
            <div id="kPesanAs"></div>
          </div>
          <div class="k-kartu" id="kPratinjau" hidden>
            <h3>Periksa sebelum mengunggah</h3>
            <p class="k-ket" id="kNamaFile"></p>
            <div class="k-angka">
              <div><b id="kNBaris">0</b><span>baris di file</span></div>
              <div><b id="kNValid">0</b><span>siap diunggah</span></div>
              <div class="merah"><b id="kNSalah">0</b><span>bermasalah (dilewati)</span></div>
            </div>
            <div id="kSalahBox" hidden><p class="k-ket"><b>Baris bermasalah</b> (nomor baris di file, termasuk judul):</p>
              <div class="k-tabel" style="max-height:200px"><table id="kTSalah"></table></div></div>
            <div id="kEffortBox" hidden></div>
            <p class="k-ket" style="margin-top:12px"><b>Contoh 10 baris pertama:</b></p>
            <div class="k-tabel"><table id="kTContoh"></table></div>
            <div style="margin-top:12px;display:flex;gap:8px">
              <button class="k-btn" id="kUnggah">Unggah ke database</button>
              <button class="k-btn dua" id="kBatalUnggah">Batal</button>
            </div>
            <div class="k-bar" id="kBar" hidden><i></i></div>
            <div id="kPesanUnggah"></div>
          </div>

          <div class="k-kartu" id="kPratinjauJson" hidden>
            <h3>Periksa data patroli (JSON)</h3>
            <p class="k-ket" id="kJNama"></p>
            <div class="k-angka" id="kJAngka"></div>
            <div id="kJMasalah"></div>
            <div class="k-baris"><div><label for="kJKawasan">Kawasan untuk data ini (wajib)</label>
              <input type="text" id="kJKawasan" list="kJDaftarKawasan" placeholder="mis. Wolomuku"><datalist id="kJDaftarKawasan"></datalist></div></div>
            <p class="k-ket" style="margin-top:12px"><b>Patroli</b></p>
            <div class="k-tabel"><table id="kJPatroli"></table></div>
            <p class="k-ket" style="margin-top:14px"><b>Beri nama kode SMART</b>. File SMART Mobile hanya berisi kode, nama aslinya ada di
              <i>Configurable Model</i> SMART Desktop. Isi yang kamu tahu; yang kosong tetap tersimpan sebagai kode dan bisa dinamai nanti di tab <b>Kamus Kode</b>.
              Untuk kategori, pakai <code>Kategori &gt; Subkategori</code>. Atribut tanpa kolom tujuan masuk ke <span class="k-privat">info lainnya (privat)</span>.</p>
            <div class="k-tabel" style="max-height:360px"><table id="kJKode"></table></div>
            <div style="margin-top:8px"><button class="k-btn dua kecil" id="kJTerapkan">Perbarui pratinjau dengan nama di atas</button></div>
            <p class="k-ket" style="margin-top:14px"><b>Contoh temuan yang akan disimpan:</b></p>
            <div class="k-tabel"><table id="kJContoh"></table></div>
            <div style="margin-top:12px;display:flex;gap:8px">
              <button class="k-btn" id="kJUnggah">Simpan nama &amp; unggah ke database</button>
              <button class="k-btn dua" id="kJBatal">Batal</button>
            </div>
            <div id="kJPesan"></div>
          </div>
        </div>

        <div data-panel="kamus" hidden>
          <div class="k-kartu">
            <h3>Kamus kode SMART</h3>
            <p class="k-ket">Nama untuk kode UUID dari file JSON SMART Mobile. Kode yang muncul di data tapi belum bernama ditandai kuning.
              Setelah mengubah nama, klik <b>Terapkan ke semua data JSON</b> supaya temuan dan patroli lama ikut berubah.</p>
            <div class="k-tabel" style="max-height:480px"><table id="kTKamus"></table></div>
            <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
              <button class="k-btn" id="kKSimpan">Simpan kamus</button>
              <button class="k-btn dua" id="kKTerapkan">Terapkan ke semua data JSON</button>
            </div>
            <div id="kPesanKamus"></div>
          </div>
        </div>

        <div data-panel="kurasi" hidden>
          <div class="k-kartu">
            <div class="k-baris">
              <div style="flex:2"><label for="kCari">Cari (spesies, jenis, tim, catatan, nama, atau ID)</label><input type="text" id="kCari" placeholder="mis. bekantan, 13587"></div>
              <div><label for="kFKawasan">Kawasan</label><select id="kFKawasan"><option value="">Semua</option></select></div>
              <div><label for="kFStatus">Status</label><select id="kFStatus">
                <option value="">Semua</option><option value="baru">Baru</option><option value="terverifikasi">Terverifikasi</option><option value="disembunyikan">Disembunyikan</option></select></div>
              <div><label for="kFMode">Tampilkan</label><select id="kFMode"><option value="aktif">Data aktif</option><option value="sampah">Sampah</option></select></div>
              <div style="flex:none"><button class="k-btn" id="kTerapkan">Tampilkan</button></div>
            </div>
            <div class="k-massal" id="kMassal"></div>
            <div class="k-tabel"><table id="kTData"></table></div>
            <div class="k-halaman"><span id="kInfoHal"></span>
              <button class="k-btn dua kecil" id="kSebelum">‹ Sebelumnya</button>
              <button class="k-btn dua kecil" id="kBerikut">Berikutnya ›</button></div>
            <div id="kPesanKurasi"></div>
          </div>
        </div>

        <div data-panel="riwayat" hidden>
          <div class="k-kartu">
            <h3>Riwayat unggahan</h3>
            <p class="k-ket">"Batalkan" memindahkan semua temuan dari unggahan itu ke Sampah (bisa dipulihkan).
              Data yang masuk sebelum fitur ini dibuat tidak tercatat sebagai unggahan.</p>
            <div class="k-tabel"><table id="kTUnggahan"></table></div>
          </div>
          <div class="k-kartu">
            <h3>Log perubahan (100 terakhir)</h3>
            <div class="k-tabel" style="max-height:420px"><table id="kTLog"></table></div>
          </div>
          <div id="kPesanRiwayat"></div>
        </div>
      </div>
    </div>

    <div class="k-edit" id="kEdit" hidden>
      <form id="kFormEdit">
        <h3 id="kEditJudul">Edit temuan</h3>
        <p class="k-ket">Geser penanda di peta kecil untuk memperbaiki koordinat. Kolom <span class="k-privat">privat</span> tidak pernah tampil ke publik.</p>
        <div class="k-grid" id="kEditKolom"></div>
        <div class="k-peta-mini" id="kPetaMini"></div>
        <div id="kPesanEdit"></div>
        <div class="k-kaki">
          <button type="button" class="k-btn dua" id="kEditBatal">Batal</button>
          <button type="submit" class="k-btn">Simpan perubahan</button>
        </div>
      </form>
    </div>
  </section>`;
  document.body.append(root);

  const $k = id => root.querySelector('#' + id);
  const pesan = (id, jenis, teks) => { $k(id).innerHTML = teks ? `<div class="k-pesan ${jenis}">${teks}</div>` : ''; };
  const tglTampil = s => s ? s.replace('T', ' ').slice(0, 16) : '';
  const lencana = s => `<span class="k-status ${s}">${s}</span>`;

  // ---------- buka / tutup / login ----------
  function buka() {
    root.hidden = false;
    const kws = unik(semua.map(r => r.kawasan));
    $k('kFKawasan').length = 1;
    kws.forEach(k => $k('kFKawasan').add(new Option(k, k)));
    isiSaran();
    tampilkanSesi();
  }
  function tutup() {
    root.hidden = true;
    if (berubah) location.reload(); // muat ulang peta supaya perubahan terlihat
  }
  root.querySelectorAll('[data-tutup]').forEach(b => b.addEventListener('click', tutup));
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || root.hidden) return;
    if (!$k('kEdit').hidden) $k('kEdit').hidden = true; else tutup();
  });

  async function tampilkanSesi() {
    const { data: { session } } = await sb.auth.getSession();
    let admin = false;
    if (session) { const { data } = await sb.rpc('is_admin'); admin = data === true; }
    $k('kLogin').hidden = admin; $k('kIsi').hidden = !admin; $k('kKeluar').hidden = !session;
    $k('kSiapa').textContent = session ? session.user.email : '';
    if (session && !admin) pesan('kPesanLogin', 'gagal', `Akun <b>${esc(session.user.email)}</b> belum terdaftar sebagai admin. Minta admin menambahkan email ini ke tabel <code>admin</code>.`);
  }
  $k('kFormLogin').addEventListener('submit', async e => {
    e.preventDefault();
    pesan('kPesanLogin', 'info', 'Memeriksa…');
    const { error } = await sb.auth.signInWithPassword({ email: $k('kEmail').value, password: $k('kSandi').value });
    $k('kSandi').value = '';
    if (error) return pesan('kPesanLogin', 'gagal', 'Gagal masuk: email atau kata sandi salah.');
    pesan('kPesanLogin', '', ''); tampilkanSesi();
  });
  $k('kKeluar').addEventListener('click', async () => { await sb.auth.signOut(); pesan('kPesanLogin', '', ''); tampilkanSesi(); });

  // ---------- tab ----------
  root.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => {
    root.querySelectorAll('[data-tab]').forEach(x => x.setAttribute('aria-selected', x === b));
    root.querySelectorAll('[data-panel]').forEach(p => p.hidden = p.dataset.panel !== b.dataset.tab);
    if (b.dataset.tab === 'kurasi' && !barisTampil.length) muatKurasi();
    if (b.dataset.tab === 'riwayat') muatRiwayat();
    if (b.dataset.tab === 'kamus') muatKamusTab();
  }));

  // ---------- input data ----------
  async function pilihFile(file) {
    $k('kPratinjau').hidden = true; $k('kPratinjauJson').hidden = true;
    if (/\.(geo)?json$/i.test(file.name)) return pilihJson(file);
    pesan('kPesanFile', 'info', 'Membaca file…');
    try { tampilkanTabel(await Impor.baca(file), file.name, 'kPesanFile'); }
    catch (err) { pesan('kPesanFile', 'gagal', esc(err.message)); }
  }

  // Pratinjau data tabel (CSV / Excel / Apps Script) sebelum diunggah.
  function tampilkanTabel(h, nama, idPesan) {
      if (!h.total) return pesan(idPesan, 'gagal', 'Sumber kosong: tidak ada baris data.');
      if (h.kurang.length) return pesan(idPesan, 'gagal', `Kolom wajib tidak ditemukan: <b>${h.kurang.map(esc).join(', ')}</b>. Pastikan baris pertama berisi judul kolom ekspor SMART.`);
      pesan(idPesan, '', '');
      siapUnggah = h.siap; namaFileUnggah = nama; siapEffort = h.effort || [];
      const nTerhubung = h.siap.filter(r => r.patroli_id).length;
      $k('kEffortBox').hidden = !h.master;
      if (h.master) $k('kEffortBox').innerHTML = `<p class="k-ket" style="margin-top:12px"><b>Effort patroli (sheet Effort Patrol):</b>
        ${fmt(siapEffort.length)} hari patroli, total ${(siapEffort.reduce((s, p) => s + p.jarak_m, 0) / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} km.
        ${fmt(nTerhubung)} dari ${fmt(h.siap.length)} temuan cocok dengan hari patroli (mitra + desa + tim + tanggal) dan ikut dihitung encounter rate.
        ${h.salahEffort?.length ? `<br>${fmt(h.salahEffort.length)} baris effort dilewati: ${h.salahEffort.slice(0, 5).map(([n, s]) => `baris ${n} (${esc(s)})`).join('; ')}${h.salahEffort.length > 5 ? '; …' : ''}` : ''}</p>
        <div class="k-tabel" style="max-height:200px"><table><tr><th>Mitra</th><th>Desa</th><th>Tim</th><th>Tanggal</th><th>Km</th><th>Jam efektif</th><th>Anggota</th></tr>${
          siapEffort.slice(0, 10).map(p => `<tr><td>${esc(p.mitra)}</td><td>${esc(p.desa)}</td><td>${esc(p.tim)}</td><td>${p.mulai.slice(0, 10)}</td>
            <td>${(p.jarak_m / 1000).toFixed(2)}</td><td>${p.durasi_aktif_menit == null ? '–' : (p.durasi_aktif_menit / 60).toFixed(1)}</td><td>${p.jumlah_anggota ?? '–'}</td></tr>`).join('')}</table></div>`;
      $k('kNamaFile').textContent = `${nama} · ${h.sheet}`;
      $k('kNBaris').textContent = fmt(h.total); $k('kNValid').textContent = fmt(h.siap.length); $k('kNSalah').textContent = fmt(h.salah.length);
      $k('kSalahBox').hidden = !h.salah.length;
      $k('kTSalah').innerHTML = '<tr><th>Baris</th><th>Masalah</th></tr>' + h.salah.slice(0, 50).map(([n, s]) => `<tr><td>${n}</td><td>${esc(s)}</td></tr>`).join('') +
        (h.salah.length > 50 ? `<tr><td colspan="2">… dan ${h.salah.length - 50} baris lain</td></tr>` : '');
      const kol = [...(h.master ? ['mitra'] : []), 'waktu', 'kawasan', 'tim', 'kategori', 'subkategori', 'spesies_satwa', 'jumlah', 'satuan', 'pelanggaran', 'lon', 'lat'];
      $k('kTContoh').innerHTML = `<tr>${kol.map(c => `<th>${c}</th>`).join('')}</tr>` +
        h.siap.slice(0, 10).map(r => `<tr>${kol.map(c => `<td>${esc(r[c])}</td>`).join('')}</tr>`).join('');
      $k('kUnggah').disabled = !h.siap.length; $k('kBatalUnggah').disabled = false;
      $k('kBar').hidden = true; pesan('kPesanUnggah', '', '');
      $k('kPratinjau').hidden = false;
      $k('kPratinjau').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  const drop = $k('kDrop'), inp = $k('kFile');
  drop.addEventListener('click', () => inp.click());
  drop.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp.click(); } });
  drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('aktif'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('aktif'));
  drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('aktif'); if (e.dataTransfer.files[0]) pilihFile(e.dataTransfer.files[0]); });
  inp.addEventListener('change', () => { if (inp.files[0]) pilihFile(inp.files[0]); inp.value = ''; });
  $k('kBatalUnggah').addEventListener('click', () => { $k('kPratinjau').hidden = true; siapUnggah = []; });

  $k('kAsAmbil').addEventListener('click', async () => {
    const b = $k('kAsAmbil'), url = $k('kAsUrl').value.trim();
    if (!url) return pesan('kPesanAs', 'gagal', 'Tempel URL Apps Script dulu.');
    $k('kPratinjau').hidden = true; $k('kPratinjauJson').hidden = true;
    b.disabled = true; pesan('kPesanAs', 'info', 'Mengambil data dari Apps Script…');
    try {
      const h = await Impor.ambilAppsScript(url);
      // Nama batch tanpa token, supaya token tidak tersimpan di riwayat unggahan.
      tampilkanTabel(h, `Apps Script: ${h.sheet}`, 'kPesanAs');
    } catch (e) { pesan('kPesanAs', 'gagal', esc(e.message)); }
    finally { b.disabled = false; }
  });
  $k('kAsUrl').addEventListener('keydown', e => { if (e.key === 'Enter') $k('kAsAmbil').click(); });

  $k('kUnggah').addEventListener('click', async () => {
    $k('kUnggah').disabled = true; $k('kBatalUnggah').disabled = true; $k('kBar').hidden = false;
    const per = 500; let baru = 0, batch;
    try {
      const { data: u, error: eU } = await sb.from('unggahan').insert({ nama_file: namaFileUnggah, jumlah_baris: siapUnggah.length }).select('id').single();
      if (eU) throw eU;
      batch = u.id;
      // Effort dulu (temuan merujuk ke patroli). Diperbarui bila sheet diubah: hari patroli yang sama ditimpa.
      for (let i = 0; i < siapEffort.length; i += per) {
        const { error } = await sb.from('patroli').upsert(siapEffort.slice(i, i + per).map(p => ({ ...p, batch_id: batch })), { onConflict: 'id' });
        if (error) throw error;
      }
      for (let i = 0; i < siapUnggah.length; i += per) {
        // ON CONFLICT (kunci) DO NOTHING: temuan yang sudah ada (termasuk yang di Sampah) dilewati.
        const potong = siapUnggah.slice(i, i + per).map(r => ({ ...r, batch_id: batch }));
        const { data, error } = await sb.from('temuan_patroli').upsert(potong, { onConflict: 'kunci', ignoreDuplicates: true }).select('id');
        if (error) throw error;
        baru += data.length;
        $k('kBar').firstElementChild.style.width = `${Math.min(100, ((i + per) / siapUnggah.length) * 100)}%`;
      }
      await sb.from('unggahan').update({ jumlah_baru: baru }).eq('id', batch);
      berubah = berubah || baru > 0;
      berubah = berubah || siapEffort.length > 0;
      pesan('kPesanUnggah', 'ok', `Selesai. <b>${fmt(baru)}</b> temuan baru ditambahkan, <b>${fmt(siapUnggah.length - baru)}</b> sudah ada dan dilewati${
        siapEffort.length ? `; <b>${fmt(siapEffort.length)}</b> hari patroli (effort) disimpan/diperbarui` : ''}. Peta diperbarui saat panel ditutup.`);
    } catch (e) {
      if (batch) await sb.from('unggahan').update({ jumlah_baru: baru }).eq('id', batch);
      berubah = berubah || baru > 0;
      pesan('kPesanUnggah', 'gagal', `Gagal mengunggah: ${esc(e.message)}. ${baru ? `${fmt(baru)} temuan sempat masuk; unggah ulang file yang sama aman.` : ''}`);
    } finally { $k('kBatalUnggah').disabled = false; }
  });

  // ---------- input JSON SMART Mobile ----------
  const URUT_JENIS = ['tim', 'kategori', 'atribut', 'pilihan', 'mandat', 'transportasi', 'lain'];
  const jenisKode = k => k.startsWith('c:') ? 'kategori' : k.startsWith('a:') ? 'atribut' : /^[lt]:/.test(k) ? 'pilihan'
    : k.startsWith('pt:') ? 'tim' : k.startsWith('pm:') ? 'mandat' : k.startsWith('tt:') ? 'transportasi' : 'lain';
  const pendek = k => k.length > 14 ? k.slice(0, 12) + '…' : k;
  let kamus = {}, jsonHasil = null, draf = {};
  const kamusEfektif = () => {
    const k = { ...kamus };
    for (const [kode, v] of Object.entries(draf)) k[kode] = { ...(k[kode] || {}), label: v.label ?? k[kode]?.label, kolom: v.kolom ?? k[kode]?.kolom };
    return k;
  };
  async function muatKamus() {
    const { data, error } = await sb.from('kamus').select('*');
    if (error) throw error;
    kamus = Object.fromEntries(data.map(r => [r.kode, r]));
  }

  // Saran nama dari data yang sudah ada (CSV), supaya nama dari JSON seragam dengan data lama.
  const SARAN = { kategori: 'kSaranKategori', tim: 'kSaranTim', atribut: 'kSaranAtribut' };
  function isiSaran() {
    const opsi = arr => unik(arr).map(v => `<option value="${esc(v)}">`).join('');
    const kat = semua.filter(r => r.kategori && !/^c:/.test(r.kategori));
    root.querySelector('#kSaran').innerHTML =
      `<datalist id="kSaranKategori">${opsi([...kat.map(r => r.kategori), ...kat.filter(r => r.subkategori).map(r => `${r.kategori} > ${r.subkategori}`)])}</datalist>
       <datalist id="kSaranTim">${opsi(semua.map(r => r.tim).filter(t => t && !/^pt:/.test(t)))}</datalist>
       <datalist id="kSaranAtribut">${opsi(['Jenis observasi', 'Spesies satwa', 'Spesies tumbuhan', 'Jumlah', 'Satuan', 'Jenis kelamin', 'Umur', 'Tindakan', 'Kondisi', 'Keterangan', 'Lokasi'])}</datalist>
       <datalist id="kSaranNilai">${opsi(semua.flatMap(r => [r.spesies_satwa, r.spesies_tumbuhan, r.jenis_observasi, r.subkategori, r.satuan, r.tindakan, r.kondisi_fitur]).filter(v => v && !/^[ltc]:/.test(v)))}</datalist>`;
  }

  // Baris form penamaan kode (dipakai di pratinjau JSON dan tab Kamus).
  function barisKode(kode, jenis, konteks, k) {
    const v = k[kode] || {}, kosong = !v.label;
    const kolom = jenis === 'atribut'
      ? `<select data-kolom="${esc(kode)}">${Impor.KOLOM_ATRIBUT.map(c => `<option value="${c}" ${(v.kolom || 'info_lain') === c ? 'selected' : ''}>${c === 'info_lain' ? 'info lainnya (privat)' : c}</option>`).join('')}</select>` : '';
    return `<tr${kosong ? ' style="background:#fff8e6"' : ''}><td>${jenis}</td><td title="${esc(kode)}"><code>${esc(pendek(kode))}</code></td>
      <td><input type="text" data-label="${esc(kode)}" value="${esc(v.label || '')}" list="${SARAN[jenis] || 'kSaranNilai'}" placeholder="${jenis === 'kategori' ? 'Kategori > Subkategori' : 'nama'}"></td>
      <td>${kolom}</td><td class="lebar">${konteks}</td></tr>`;
  }
  const kepalaKode = '<tr><th>Jenis</th><th>Kode</th><th>Nama</th><th>Kolom tujuan (atribut)</th><th>Contoh / konteks</th></tr>';
  function bacaInputKode(tabel, target) {
    tabel.querySelectorAll('[data-label]').forEach(i => { (target[i.dataset.label] ??= {}).label = i.value.trim() || null; });
    tabel.querySelectorAll('[data-kolom]').forEach(s => { (target[s.dataset.kolom] ??= {}).kolom = s.value; });
  }

  async function pilihJson(file) {
    pesan('kPesanFile', 'info', 'Membaca JSON…');
    try {
      jsonHasil = Impor.parseSmartJson(await file.text());
      await muatKamus();
    } catch (e) { return pesan('kPesanFile', 'gagal', esc(e.message)); }
    pesan('kPesanFile', '', '');
    namaFileUnggah = file.name; draf = {};
    const h = jsonHasil;
    $k('kJNama').textContent = file.name;
    const nFoto = h.observasi.reduce((n, o) => n + o.foto.length, 0);
    $k('kJAngka').innerHTML = `<div><b>${h.patroli.length}</b><span>patroli</span></div><div><b>${h.observasi.length}</b><span>observasi / temuan</span></div>
      <div><b>${h.nTrack}</b><span>titik jalur GPS</span></div><div><b>${nFoto}</b><span>foto (dikecilkan lalu diunggah)</span></div>`;
    $k('kJMasalah').innerHTML = h.masalah.length ? `<div class="k-pesan info">${h.masalah.map(esc).join('<br>')}</div>` : '';
    $k('kJDaftarKawasan').innerHTML = unik(semua.map(r => r.kawasan)).map(k => `<option value="${esc(k)}">`).join('');
    if (!$k('kJKawasan').value) $k('kJKawasan').value = (file.name.match(/^([a-z0-9 ]+?)_SMDATA/i)?.[1] || '').replace(/^./, c => c.toUpperCase());
    $k('kJPatroli').innerHTML = '<tr><th>ID</th><th>Tujuan</th><th>Mulai</th><th>Selesai</th><th>Durasi aktif</th><th>Jarak SMART</th><th>Jarak jalur GPS</th><th>Anggota</th><th>Temuan</th><th>Titik jalur</th></tr>' +
      h.patroli.map(p => `<tr><td title="${esc(p.id)}">${esc(p.id.slice(0, 8))}</td><td>${esc(p.tujuan || '–')}</td><td>${tglTampil(p.mulai)}</td><td>${tglTampil(p.selesai)}</td>
        <td>${Math.floor(p.durasi_aktif_menit / 60)} j ${Math.round(p.durasi_aktif_menit % 60)} m</td>
        <td>${p.jarak_m == null ? '–' : (p.jarak_m / 1000).toFixed(2) + ' km'}</td><td>${(p.jarak_jalur_m / 1000).toFixed(2)} km</td>
        <td>${p.jumlah_anggota ?? '–'}</td><td>${p.nObs}</td><td>${p.nTitik}</td></tr>`).join('');
    gambarKodeJson();
    $k('kJUnggah').disabled = false; $k('kJBatal').disabled = false; pesan('kJPesan', '', '');
    $k('kPratinjauJson').hidden = false;
  }
  function gambarKodeJson() {
    const k = kamusEfektif();
    const konteks = (kode, e) => {
      const c = [...e.contoh];
      if (e.jenis === 'pilihan') return c.map(ak => `pilihan untuk atribut <b>${esc(k[ak]?.label || pendek(ak))}</b>`).join('');
      return c.map(esc).join(' | ');
    };
    const daftar = [...jsonHasil.kode].sort((a, b) => URUT_JENIS.indexOf(a[1].jenis) - URUT_JENIS.indexOf(b[1].jenis));
    $k('kJKode').innerHTML = kepalaKode + daftar.map(([kode, e]) => barisKode(kode, e.jenis, konteks(kode, e), k)).join('');
    gambarContohJson();
  }
  function gambarContohJson() {
    const kw = $k('kJKawasan').value.trim() || '(kawasan)';
    const { temuan } = Impor.susunJson(jsonHasil, kamusEfektif(), kw);
    const kol = ['waktu', 'tim', 'kategori', 'subkategori', 'spesies_satwa', 'jenis_observasi', 'jumlah', 'info_lain'];
    $k('kJContoh').innerHTML = `<tr>${kol.map(c => `<th>${c === 'info_lain' ? '<span class="k-privat">info_lain (privat)</span>' : c}</th>`).join('')}</tr>` +
      temuan.slice(0, 10).map(r => `<tr>${kol.map(c => `<td class="${c === 'info_lain' ? 'lebar' : ''}">${esc(c === 'waktu' ? tglTampil(r[c]) : r[c] ?? '')}</td>`).join('')}</tr>`).join('');
  }
  $k('kJTerapkan').addEventListener('click', () => { bacaInputKode($k('kJKode'), draf); gambarKodeJson(); });
  $k('kJKode').addEventListener('change', () => { bacaInputKode($k('kJKode'), draf); gambarContohJson(); });
  $k('kJBatal').addEventListener('click', () => { $k('kPratinjauJson').hidden = true; jsonHasil = null; });

  async function simpanKamus(entri) {
    const baris = Object.entries(entri).filter(([, v]) => v.label || (v.kolom && v.kolom !== 'info_lain'))
      .map(([kode, v]) => ({ kode, jenis: jenisKode(kode), label: v.label || null, kolom: v.kolom || null, diubah_pada: new Date().toISOString() }));
    if (!baris.length) return 0;
    const { error } = await sb.from('kamus').upsert(baris, { onConflict: 'kode' });
    if (error) throw error;
    return baris.length;
  }

  $k('kJUnggah').addEventListener('click', async () => {
    const kawasan = $k('kJKawasan').value.trim();
    if (!kawasan) return pesan('kJPesan', 'gagal', 'Isi kawasan dulu.');
    bacaInputKode($k('kJKode'), draf);
    $k('kJUnggah').disabled = true; $k('kJBatal').disabled = true;
    pesan('kJPesan', 'info', 'Menyimpan…');
    let batch, nPatroli = 0, nTemuan = 0;
    try {
      await simpanKamus(draf); await muatKamus(); draf = {};
      const s = Impor.susunJson(jsonHasil, kamus, kawasan);
      const { data: u, error: eU } = await sb.from('unggahan').insert({ nama_file: namaFileUnggah, jumlah_baris: s.temuan.length }).select('id').single();
      if (eU) throw eU;
      batch = u.id;
      const { data: p, error: eP } = await sb.from('patroli').upsert(s.patroli.map(r => ({ ...r, batch_id: batch })), { onConflict: 'id', ignoreDuplicates: true }).select('id');
      if (eP) throw eP;
      nPatroli = p.length;
      for (let i = 0; i < s.temuan.length; i += 500) {
        const { data, error } = await sb.from('temuan_patroli')
          .upsert(s.temuan.slice(i, i + 500).map(r => ({ ...r, batch_id: batch })), { onConflict: 'smart_id', ignoreDuplicates: true }).select('id');
        if (error) throw error;
        nTemuan += data.length;
      }
      await sb.from('unggahan').update({ jumlah_baru: nTemuan }).eq('id', batch);
      const nFoto = await unggahFoto(jsonHasil.observasi);
      berubah = berubah || nTemuan > 0 || nPatroli > 0 || nFoto > 0;
      pesan('kJPesan', 'ok', `Selesai. <b>${nPatroli}</b> patroli baru, <b>${fmt(nTemuan)}</b> temuan baru, dan <b>${fmt(nFoto)}</b> foto disimpan
        (${s.patroli.length - nPatroli} patroli dan ${fmt(s.temuan.length - nTemuan)} temuan sudah ada, dilewati). Peta diperbarui saat panel ditutup.`);
    } catch (e) {
      if (batch) await sb.from('unggahan').update({ jumlah_baru: nTemuan }).eq('id', batch);
      berubah = berubah || nTemuan > 0 || nPatroli > 0;
      pesan('kJPesan', 'gagal', `Gagal: ${esc(e.message)}. Unggah ulang file yang sama aman; data yang sudah masuk dilewati.`);
    } finally { $k('kJBatal').disabled = false; }
  });

  // Foto: diunggah untuk setiap temuan di file yang belum punya foto di database,
  // termasuk temuan lama yang dulu diunggah tanpa foto. Unggah ulang file yang sama aman.
  async function unggahFoto(observasi) {
    const adaFoto = observasi.filter(o => o.smart_id && o.foto.length);
    if (!adaFoto.length) return 0;
    const diDb = {};
    for (let i = 0; i < adaFoto.length; i += 100) {
      const { data, error } = await sb.from('temuan_patroli').select('id,smart_id,foto').in('smart_id', adaFoto.slice(i, i + 100).map(o => o.smart_id));
      if (error) throw error;
      data.forEach(r => diDb[r.smart_id] = r);
    }
    const perlu = adaFoto.filter(o => diDb[o.smart_id] && !diDb[o.smart_id].foto?.length);
    const total = perlu.reduce((n, o) => n + o.foto.length, 0);
    let n = 0;
    for (const o of perlu) {
      const path = [];
      for (let i = 0; i < o.foto.length; i++) {
        const blob = await Impor.kompresFoto(o.foto[i]);
        const p = `${o.smart_id}/${i}.jpg`;
        const { error } = await sb.storage.from('foto-temuan').upload(p, blob, { contentType: 'image/jpeg', upsert: true });
        if (error) throw new Error(`Foto ${p}: ${error.message}`);
        path.push(p);
        pesan('kJPesan', 'info', `Mengunggah foto… ${++n}/${total}`);
      }
      const { error } = await sb.from('temuan_patroli').update({ foto: path }).eq('id', diDb[o.smart_id].id);
      if (error) throw error;
    }
    return n;
  }

  // ---------- tab kamus ----------
  let kodeDiData = new Map(); // kode -> konteks
  async function muatKamusTab() {
    pesan('kPesanKamus', 'info', 'Memuat…');
    try {
      await muatKamus();
      kodeDiData = new Map();
      const tambah = (k, konteks) => { if (k && !kodeDiData.has(k)) kodeDiData.set(k, konteks || ''); };
      // shortcut: ambil semua temuan JSON sekaligus (maks 10.000); pindah ke fungsi SQL bila data JSON jauh lebih besar.
      const { data: t, error: e1 } = await sb.from('temuan_patroli').select('atribut').not('atribut', 'is', null).limit(10000);
      const { data: p, error: e2 } = await sb.from('patroli').select('kode_tim,kode_mandat,kode_transportasi');
      if (e1 || e2) throw e1 || e2;
      for (const r of p) [r.kode_tim, r.kode_mandat, r.kode_transportasi].forEach(k => tambah(k));
      for (const { atribut: m } of t) {
        tambah(m.tim); tambah(m.kat);
        for (const [ak, v] of Object.entries(m.atr || {})) {
          tambah(ak, typeof v === 'string' && /^[lt]:/.test(v) ? '' : String(v).slice(0, 60));
          if (typeof v === 'string' && /^[lt]:/.test(v)) tambah(v, `pilihan untuk atribut <b>${esc(kamus[ak]?.label || pendek(ak))}</b>`);
        }
      }
      for (const k of Object.keys(kamus)) tambah(k);
      const daftar = [...kodeDiData].sort((a, b) => URUT_JENIS.indexOf(jenisKode(a[0])) - URUT_JENIS.indexOf(jenisKode(b[0])) || (kamus[a[0]]?.label ? 1 : 0) - (kamus[b[0]]?.label ? 1 : 0));
      $k('kTKamus').innerHTML = kepalaKode + (daftar.length ? daftar.map(([k, ctx]) => barisKode(k, jenisKode(k), /<b>/.test(ctx) ? ctx : esc(ctx), kamus)).join('')
        : '<tr><td colspan="5">Belum ada data JSON.</td></tr>');
      const kosong = daftar.filter(([k]) => !kamus[k]?.label).length;
      pesan('kPesanKamus', kosong ? 'info' : '', kosong ? `${kosong} kode belum bernama.` : '');
    } catch (e) { pesan('kPesanKamus', 'gagal', esc(e.message)); }
  }
  $k('kKSimpan').addEventListener('click', async () => {
    const entri = {}; bacaInputKode($k('kTKamus'), entri);
    try { const n = await simpanKamus(entri); await muatKamusTab(); pesan('kPesanKamus', 'ok', `${n} kode disimpan. Klik "Terapkan ke semua data JSON" untuk memperbarui data lama.`); }
    catch (e) { pesan('kPesanKamus', 'gagal', esc(e.message)); }
  });
  $k('kKTerapkan').addEventListener('click', async () => {
    const b = $k('kKTerapkan'); b.disabled = true;
    try {
      const entri = {}; bacaInputKode($k('kTKamus'), entri); await simpanKamus(entri); await muatKamus();
      pesan('kPesanKamus', 'info', 'Menerapkan kamus…');
      const { data: t, error: e1 } = await sb.from('temuan_patroli').select('id,atribut,tim,kategori,subkategori,jumlah,' + Impor.KOLOM_ATRIBUT.filter(k => k !== 'abaikan' && k !== 'jumlah').join(','))
        .not('atribut', 'is', null).limit(10000);
      const { data: p, error: e2 } = await sb.from('patroli').select('id,kode_tim,kode_mandat,kode_transportasi,tim,mandat,transportasi');
      if (e1 || e2) throw e1 || e2;
      const tugas = [];
      for (const r of t) {
        const baru = Impor.labelTemuan(r.atribut, kamus);
        const beda = Object.fromEntries(Object.entries(baru).filter(([k, v]) => (r[k] ?? null) !== (v ?? null)));
        if (Object.keys(beda).length) tugas.push(() => sb.from('temuan_patroli').update(beda).eq('id', r.id));
      }
      for (const r of p) {
        const baru = Impor.labelPatroli(r, kamus);
        const beda = Object.fromEntries(Object.entries(baru).filter(([k, v]) => (r[k] ?? null) !== (v ?? null)));
        if (Object.keys(beda).length) tugas.push(() => sb.from('patroli').update(beda).eq('id', r.id));
      }
      // 5 permintaan paralel; shortcut: satu update per baris, ganti ke fungsi SQL bila data JSON ribuan baris.
      let selesai = 0, gagal = 0;
      for (let i = 0; i < tugas.length; i += 5) {
        const hasil = await Promise.all(tugas.slice(i, i + 5).map(f => f()));
        hasil.forEach(h => h.error ? gagal++ : selesai++);
        pesan('kPesanKamus', 'info', `Menerapkan kamus… ${selesai + gagal}/${tugas.length}`);
      }
      berubah = berubah || selesai > 0;
      await muatKamusTab();
      pesan('kPesanKamus', gagal ? 'gagal' : 'ok', `${selesai} baris diperbarui${gagal ? `, ${gagal} gagal` : ''}.`);
    } catch (e) { pesan('kPesanKamus', 'gagal', esc(e.message)); }
    finally { b.disabled = false; }
  });

  // ---------- kurasi ----------
  const mode = () => $k('kFMode').value;
  async function muatKurasi() {
    pesan('kPesanKurasi', '', '');
    let q = sb.from('temuan_patroli').select(KOLOM_TABEL, { count: 'exact' });
    q = mode() === 'sampah' ? q.not('dihapus_pada', 'is', null) : q.is('dihapus_pada', null);
    if ($k('kFKawasan').value) q = q.eq('kawasan', $k('kFKawasan').value);
    if ($k('kFStatus').value) q = q.eq('status', $k('kFStatus').value);
    const cari = $k('kCari').value.trim();
    if (/^\d+$/.test(cari)) q = q.eq('id', +cari);
    else if (cari) {
      const s = cari.replace(/[,()*%\\]/g, ' ').trim(); // jangan biarkan teks pencarian mengubah sintaks filter
      q = q.or(['spesies_satwa', 'spesies_tumbuhan', 'jenis_observasi', 'subkategori', 'tim', 'info_lain', 'nama'].map(k => `${k}.ilike.*${s}*`).join(','));
    }
    const { data, count, error } = await q.order('waktu', { ascending: false }).order('id', { ascending: false })
      .range(halaman * PER_HALAMAN, halaman * PER_HALAMAN + PER_HALAMAN - 1);
    if (error) return pesan('kPesanKurasi', 'gagal', esc(error.message));
    barisTampil = data;
    const total = count || 0, maksHal = Math.max(0, Math.ceil(total / PER_HALAMAN) - 1);
    $k('kInfoHal').textContent = `${fmt(total)} temuan · halaman ${halaman + 1} dari ${maksHal + 1}`;
    $k('kSebelum').disabled = halaman === 0; $k('kBerikut').disabled = halaman >= maksHal;
    gambarTabel();
  }
  function gambarTabel() {
    const sampah = mode() === 'sampah';
    $k('kTData').innerHTML = `<tr><th><input type="checkbox" id="kSemua" aria-label="Pilih semua di halaman ini"></th>
      <th>ID</th><th>Waktu</th><th>Kawasan</th><th>Tim</th><th>Kategori</th><th>Temuan</th><th>Status</th><th>Aksi</th></tr>` +
      (barisTampil.length ? barisTampil.map(r => `<tr class="${dipilih.has(r.id) ? 'pilih' : ''}">
        <td><input type="checkbox" data-pilih="${r.id}" ${dipilih.has(r.id) ? 'checked' : ''} aria-label="Pilih ${r.id}"></td>
        <td>${r.id}</td><td>${tglTampil(r.waktu)}</td><td>${esc(r.kawasan)}</td><td>${esc(r.tim)}</td>
        <td>${esc([r.kategori, r.subkategori].filter(Boolean).join(' · '))}</td>
        <td class="lebar">${esc(r.spesies_satwa || r.jenis_observasi || '')}</td>
        <td>${lencana(r.status)}</td>
        <td><div class="k-aksi">
          <button data-edit="${r.id}">Edit</button>
          <button data-lihat="${r.id}">Lihat di peta</button>
          ${sampah ? `<button data-pulih="${r.id}">Pulihkan</button>` : `<button data-buang="${r.id}">Hapus</button>`}
        </div></td></tr>`).join('') : '<tr><td colspan="9">Tidak ada data.</td></tr>');
    gambarMassal();
  }
  function gambarMassal() {
    const n = dipilih.size, sampah = mode() === 'sampah';
    $k('kMassal').innerHTML = n ? `<b>${fmt(n)} dipilih</b>` + (sampah
      ? `<button class="k-btn kecil" data-massal="pulihkan">Pulihkan</button>
         <button class="k-btn bahaya kecil" data-massal="permanen">Hapus permanen</button>`
      : `<button class="k-btn kecil" data-massal="terverifikasi">Tandai terverifikasi</button>
         <button class="k-btn dua kecil" data-massal="disembunyikan">Sembunyikan dari publik</button>
         <button class="k-btn dua kecil" data-massal="baru">Kembalikan ke "baru"</button>
         <button class="k-btn bahaya kecil" data-massal="sampah">Pindah ke Sampah</button>`) +
      `<button class="k-btn dua kecil" data-massal="batal">Batal pilih</button>`
      : '<span class="k-ket" style="margin:0">Centang baris untuk memverifikasi, menyembunyikan, atau menghapus beberapa temuan sekaligus.</span>';
  }

  async function ubahBanyak(ids, nilai, keterangan) {
    const { error } = await sb.from('temuan_patroli').update(nilai).in('id', ids);
    if (error) return pesan('kPesanKurasi', 'gagal', esc(error.message));
    berubah = true; dipilih.clear();
    await muatKurasi();
    pesan('kPesanKurasi', 'ok', `${fmt(ids.length)} temuan ${keterangan}.`);
  }

  $k('kTerapkan').addEventListener('click', () => { halaman = 0; dipilih.clear(); muatKurasi(); });
  $k('kCari').addEventListener('keydown', e => { if (e.key === 'Enter') $k('kTerapkan').click(); });
  $k('kFMode').addEventListener('change', () => $k('kTerapkan').click());
  $k('kSebelum').addEventListener('click', () => { halaman--; muatKurasi(); });
  $k('kBerikut').addEventListener('click', () => { halaman++; muatKurasi(); });

  $k('kTData').addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'kSemua') barisTampil.forEach(r => t.checked ? dipilih.add(r.id) : dipilih.delete(r.id));
    else if (t.dataset.pilih) t.checked ? dipilih.add(+t.dataset.pilih) : dipilih.delete(+t.dataset.pilih);
    gambarTabel();
  });
  $k('kTData').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.edit) bukaEdit(+b.dataset.edit);
    if (b.dataset.lihat) lihatDiPeta(barisTampil.find(r => r.id === +b.dataset.lihat));
    if (b.dataset.buang) ubahBanyak([+b.dataset.buang], { dihapus_pada: new Date().toISOString() }, 'dipindah ke Sampah');
    if (b.dataset.pulih) ubahBanyak([+b.dataset.pulih], { dihapus_pada: null }, 'dipulihkan');
  });
  $k('kMassal').addEventListener('click', async e => {
    const aksi = e.target.dataset?.massal; if (!aksi) return;
    const ids = [...dipilih];
    if (aksi === 'batal') { dipilih.clear(); return gambarTabel(); }
    if (aksi === 'sampah') return ubahBanyak(ids, { dihapus_pada: new Date().toISOString() }, 'dipindah ke Sampah');
    if (aksi === 'pulihkan') return ubahBanyak(ids, { dihapus_pada: null }, 'dipulihkan');
    if (aksi === 'permanen') {
      if (!confirm(`Hapus PERMANEN ${ids.length} temuan? Tindakan ini tidak bisa dibatalkan. Isi data lama tetap tersimpan di log perubahan.`)) return;
      const { error } = await sb.from('temuan_patroli').delete().in('id', ids);
      if (error) return pesan('kPesanKurasi', 'gagal', esc(error.message));
      dipilih.clear(); await muatKurasi();
      return pesan('kPesanKurasi', 'ok', `${fmt(ids.length)} temuan dihapus permanen.`);
    }
    const ket = { terverifikasi: 'ditandai terverifikasi', disembunyikan: 'disembunyikan dari publik', baru: 'dikembalikan ke status baru' }[aksi];
    ubahBanyak(ids, { status: aksi }, ket);
  });

  function lihatDiPeta(r) {
    if (!r) return;
    root.hidden = true;
    map.setView([r.lat, r.lon], 18);
    sorot?.remove();
    sorot = L.circleMarker([r.lat, r.lon], { radius: 22, color: '#FFB432', weight: 4, fill: false }).addTo(map)
      .bindTooltip(`ID ${r.id} · ${esc(r.spesies_satwa || r.subkategori || r.kategori || '')}`, { permanent: true, direction: 'top' });
    setTimeout(() => sorot?.remove(), 8000);
  }

  // ---------- form edit ----------
  let barisEdit = null;
  async function bukaEdit(id) {
    pesan('kPesanKurasi', '', '');
    const { data, error } = await sb.from('temuan_patroli').select('*').eq('id', id).single();
    if (error) return pesan('kPesanKurasi', 'gagal', esc(error.message));
    barisEdit = data;
    $k('kEditJudul').textContent = `Edit temuan ID ${id}`;
    $k('kEditKolom').innerHTML = FORM.map(([k, label, jenis]) => {
      const v = data[k], privat = label.includes('privat');
      const lab = `<label for="kE_${k}">${privat ? `<span class="k-privat">${label}</span>` : label}</label>`;
      if (jenis === 'status') return `<div>${lab}<select id="kE_${k}">${['baru', 'terverifikasi', 'disembunyikan'].map(s => `<option ${s === v ? 'selected' : ''}>${s}</option>`).join('')}</select></div>`;
      if (jenis === 'bool') return `<div>${lab}<select id="kE_${k}"><option value="">(kosong)</option><option value="true" ${v === true ? 'selected' : ''}>Ya</option><option value="false" ${v === false ? 'selected' : ''}>Bukan</option></select></div>`;
      if (jenis === 'textarea') return `<div class="penuh">${lab}<textarea id="kE_${k}" rows="2">${esc(v ?? '')}</textarea></div>`;
      const step = jenis === 'number' ? ' step="any"' : jenis === 'datetime-local' ? ' step="1"' : '';
      const nilai = jenis === 'datetime-local' ? (v || '').slice(0, 19) : (v ?? '');
      return `<div>${lab}<input type="${jenis}" id="kE_${k}"${step} value="${esc(nilai)}"></div>`;
    }).join('');
    pesan('kPesanEdit', '', '');
    $k('kEdit').hidden = false;
    // Peta kecil dengan penanda yang bisa digeser
    if (!petaMini) {
      petaMini = L.map($k('kPetaMini'));
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Esri' }).addTo(petaMini);
      penandaMini = L.marker([0, 0], { draggable: true }).addTo(petaMini);
      penandaMini.on('dragend', () => { const p = penandaMini.getLatLng(); $k('kE_lat').value = p.lat.toFixed(6); $k('kE_lon').value = p.lng.toFixed(6); });
    }
    setTimeout(() => { petaMini.invalidateSize(); petaMini.setView([data.lat, data.lon], 16); penandaMini.setLatLng([data.lat, data.lon]); }, 50);
    ['kE_lat', 'kE_lon'].forEach(id => $k(id).addEventListener('change', () => {
      const lat = +$k('kE_lat').value, lon = +$k('kE_lon').value;
      if (Number.isFinite(lat) && Number.isFinite(lon)) { penandaMini.setLatLng([lat, lon]); petaMini.panTo([lat, lon]); }
    }));
  }
  $k('kEditBatal').addEventListener('click', () => { $k('kEdit').hidden = true; });
  $k('kFormEdit').addEventListener('submit', async e => {
    e.preventDefault();
    const ubah = {};
    for (const [k, , jenis] of FORM) {
      const raw = $k('kE_' + k).value;
      let v;
      if (jenis === 'number') v = raw.trim() === '' ? null : Number(raw);
      else if (jenis === 'bool') v = raw === '' ? null : raw === 'true';
      else if (jenis === 'datetime-local') v = raw ? (raw.length === 16 ? raw + ':00' : raw) : null;
      else v = raw.trim() === '' ? null : raw.trim();
      const lama = jenis === 'datetime-local' ? (barisEdit[k] || '').slice(0, 19) || null : barisEdit[k];
      if (jenis === 'number' && v !== null && !Number.isFinite(v)) return pesan('kPesanEdit', 'gagal', `${k} harus angka.`);
      if (v !== lama && !(v === null && lama === null)) ubah[k] = v;
    }
    if (ubah.lat !== undefined || ubah.lon !== undefined) {
      const lat = ubah.lat ?? barisEdit.lat, lon = ubah.lon ?? barisEdit.lon;
      if (!Impor.dalamBatas(lon, lat)) return pesan('kPesanEdit', 'gagal', 'Koordinat di luar wilayah Indonesia.');
    }
    if (!ubah.kawasan && 'kawasan' in ubah) return pesan('kPesanEdit', 'gagal', 'Kawasan wajib diisi.');
    if (!Object.keys(ubah).length) { $k('kEdit').hidden = true; return; }
    const { error } = await sb.from('temuan_patroli').update(ubah).eq('id', barisEdit.id);
    if (error) return pesan('kPesanEdit', 'gagal', esc(error.message));
    berubah = true; $k('kEdit').hidden = true;
    await muatKurasi();
    pesan('kPesanKurasi', 'ok', `Temuan ID ${barisEdit.id} disimpan (${Object.keys(ubah).join(', ')}).`);
  });

  // ---------- riwayat ----------
  async function muatRiwayat() {
    pesan('kPesanRiwayat', '', '');
    const [{ data: ung, error: e1 }, { data: log, error: e2 }] = await Promise.all([
      sb.from('unggahan').select('*').order('dibuat_pada', { ascending: false }).limit(100),
      sb.from('log_perubahan').select('*').order('pada', { ascending: false }).limit(100)
    ]);
    if (e1 || e2) return pesan('kPesanRiwayat', 'gagal', esc((e1 || e2).message));
    const aktif = await Promise.all(ung.map(u => sb.from('temuan_patroli').select('id', { count: 'exact', head: true }).eq('batch_id', u.id).is('dihapus_pada', null).then(r => r.count ?? 0)));
    $k('kTUnggahan').innerHTML = '<tr><th>Waktu</th><th>File</th><th>Oleh</th><th>Baris</th><th>Baru masuk</th><th>Masih aktif</th><th></th></tr>' +
      (ung.length ? ung.map((u, i) => `<tr><td>${tglTampil(u.dibuat_pada)}</td><td>${esc(u.nama_file)}</td><td>${esc(u.dibuat_oleh)}</td>
        <td>${fmt(u.jumlah_baris)}</td><td>${u.jumlah_baru == null ? '–' : fmt(u.jumlah_baru)}</td><td>${fmt(aktif[i])}</td>
        <td>${aktif[i] ? `<button class="k-btn bahaya kecil" data-batal="${u.id}" data-n="${aktif[i]}">Batalkan unggahan</button>` : ''}</td></tr>`).join('')
      : '<tr><td colspan="7">Belum ada unggahan lewat panel ini.</td></tr>');
    $k('kTLog').innerHTML = '<tr><th>Waktu</th><th>Oleh</th><th>ID</th><th>Aksi</th><th>Perubahan</th></tr>' +
      (log.length ? log.map(l => `<tr><td>${tglTampil(l.pada)}</td><td>${esc(l.oleh || 'sistem')}</td><td>${l.temuan_id}</td><td>${esc(l.aksi)}</td>
        <td class="lebar">${l.aksi === 'hapus permanen'
          ? esc(`${l.data_lama?.kawasan ?? ''} · ${l.data_lama?.waktu ?? ''} · ${l.data_lama?.spesies_satwa || l.data_lama?.subkategori || ''}`)
          : Object.keys(l.data_baru || {}).map(k => `<b>${esc(k)}</b>: ${esc(JSON.stringify(l.data_lama?.[k]))} → ${esc(JSON.stringify(l.data_baru[k]))}`).join('<br>')}</td></tr>`).join('')
      : '<tr><td colspan="5">Belum ada perubahan.</td></tr>');
  }
  $k('kTUnggahan').addEventListener('click', async e => {
    const b = e.target.closest('[data-batal]'); if (!b) return;
    if (!confirm(`Pindahkan ${b.dataset.n} temuan dari unggahan ini ke Sampah? Bisa dipulihkan dari tab Kurasi > Sampah.`)) return;
    b.disabled = true;
    const kapan = new Date().toISOString();
    const { error } = await sb.from('temuan_patroli').update({ dihapus_pada: kapan }).eq('batch_id', +b.dataset.batal).is('dihapus_pada', null);
    const { error: eP } = error ? {} : await sb.from('patroli').update({ dihapus_pada: kapan }).eq('batch_id', +b.dataset.batal).is('dihapus_pada', null);
    if (error || eP) { b.disabled = false; return pesan('kPesanRiwayat', 'gagal', esc((error || eP).message)); }
    berubah = true; await muatRiwayat();
    pesan('kPesanRiwayat', 'ok', 'Unggahan dibatalkan; temuannya ada di Sampah.');
  });

  return { buka };
})();
