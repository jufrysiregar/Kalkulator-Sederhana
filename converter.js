// ── CONVERTER DATA ─────────────────────────────────────

const CONV_DATA = {
    panjang: {
        title: '📏 Panjang',
        units: ['mm','cm','m','km','inch','feet','yard','mile'],
        base: 'm', // semua ke meter
        toBase: { mm:0.001, cm:0.01, m:1, km:1000, inch:0.0254, feet:0.3048, yard:0.9144, mile:1609.344 }
    },
    massa: {
        title: '⚖️ Massa',
        units: ['mg','g','kg','ton','lb','oz'],
        base: 'kg',
        toBase: { mg:0.000001, g:0.001, kg:1, ton:1000, lb:0.453592, oz:0.0283495 }
    },
    area: {
        title: '📐 Area',
        units: ['mm²','cm²','m²','km²','inch²','feet²','acre','hectare'],
        base: 'm²',
        toBase: { 'mm²':0.000001, 'cm²':0.0001, 'm²':1, 'km²':1e6, 'inch²':0.00064516, 'feet²':0.092903, acre:4046.86, hectare:10000 }
    },
    waktu: {
        title: '🕐 Waktu',
        units: ['ms','detik','menit','jam','hari','minggu','bulan','tahun'],
        base: 'detik',
        toBase: { ms:0.001, detik:1, menit:60, jam:3600, hari:86400, minggu:604800, bulan:2629800, tahun:31557600 }
    },
    data: {
        title: '💾 Data',
        units: ['bit','byte','KB','MB','GB','TB'],
        base: 'bit',
        toBase: { bit:1, byte:8, KB:8192, MB:8388608, GB:8589934592, TB:8796093022208 }
    },
    volume: {
        title: '📦 Volume',
        units: ['ml','liter','m³','cm³','gal','fl oz','cup'],
        base: 'liter',
        toBase: { ml:0.001, liter:1, 'm³':1000, 'cm³':0.001, gal:3.78541, 'fl oz':0.0295735, cup:0.24 }
    },
    kecepatan: {
        title: '⚡ Kecepatan',
        units: ['m/s','km/h','mph','knot','ft/s'],
        base: 'm/s',
        toBase: { 'm/s':1, 'km/h':0.277778, mph:0.44704, knot:0.514444, 'ft/s':0.3048 }
    }
};

// ── OPEN/CLOSE ──────────────────────────────────────────
function openConv(type) {
    const overlay = document.getElementById('conv-overlay');
    const title   = document.getElementById('conv-modal-title');
    const body    = document.getElementById('conv-modal-body');
    overlay.classList.add('open');

    switch(type) {
        case 'panjang':    renderUnitConv('panjang');  break;
        case 'massa':      renderUnitConv('massa');    break;
        case 'area':       renderUnitConv('area');     break;
        case 'waktu':      renderUnitConv('waktu');    break;
        case 'data':       renderUnitConv('data');     break;
        case 'volume':     renderUnitConv('volume');   break;
        case 'kecepatan':  renderUnitConv('kecepatan'); break;
        case 'suhu':       renderSuhu();   break;
        case 'diskon':     renderDiskon(); break;
        case 'keuangan':   renderKeuangan(); break;
        case 'matauang':   renderMataUang(); break;
        case 'sistemangka': renderSistemAngka(); break;
        case 'tanggal':    renderTanggal(); break;
        case 'imt':        renderIMT();    break;
    }
}

function closeConv() {
    document.getElementById('conv-overlay').classList.remove('open');
}

// ── UNIT CONVERTER (generic) ────────────────────────────
function renderUnitConv(type) {
    const d = CONV_DATA[type];
    document.getElementById('conv-modal-title').innerText = d.title;
    const opts = d.units.map(u => `<option value="${u}">${u}</option>`).join('');

    document.getElementById('conv-modal-body').innerHTML = `
        <div class="conv-row">
            <label>Nilai</label>
            <div class="conv-input-wrap">
                <input class="conv-input" id="cv-input" type="number" value="1" oninput="calcUnit('${type}')">
                <select class="conv-select" id="cv-from" onchange="calcUnit('${type}')">${opts}</select>
            </div>
        </div>
        <div class="conv-divider"></div>
        <div class="conv-section-title">HASIL KONVERSI</div>
        <div id="cv-results"></div>
    `;
    calcUnit(type);
}

function calcUnit(type) {
    const d      = CONV_DATA[type];
    const val    = parseFloat(document.getElementById('cv-input').value);
    const from   = document.getElementById('cv-from').value;
    if (isNaN(val)) { document.getElementById('cv-results').innerHTML = ''; return; }

    const inBase = val * d.toBase[from];
    let html = '';
    d.units.forEach(u => {
        if (u === from) return;
        const result = inBase / d.toBase[u];
        const fmt    = result >= 0.0001 ? parseFloat(result.toFixed(6)).toString() : result.toExponential(4);
        html += `
            <div class="conv-result-box" style="margin-bottom:10px;">
                <div class="conv-result-label">${val} ${from} =</div>
                <div class="conv-result-val">${fmt.replace('.', ',')}</div>
                <div class="conv-result-unit">${u}</div>
            </div>`;
    });
    document.getElementById('cv-results').innerHTML = html;
}

// ── SUHU ────────────────────────────────────────────────
function renderSuhu() {
    document.getElementById('conv-modal-title').innerText = '🌡️ Suhu';
    document.getElementById('conv-modal-body').innerHTML = `
        <div class="conv-row">
            <label>Nilai</label>
            <div class="conv-input-wrap">
                <input class="conv-input" id="suhu-input" type="number" value="100" oninput="calcSuhu()">
                <select class="conv-select" id="suhu-from" onchange="calcSuhu()">
                    <option>°C</option><option>°F</option><option>K</option>
                </select>
            </div>
        </div>
        <div class="conv-divider"></div>
        <div class="conv-section-title">HASIL KONVERSI</div>
        <div id="suhu-results"></div>
    `;
    calcSuhu();
}

function calcSuhu() {
    const val  = parseFloat(document.getElementById('suhu-input').value);
    const from = document.getElementById('suhu-from').value;
    if (isNaN(val)) return;

    let c, f, k;
    if (from === '°C') { c=val; f=c*9/5+32; k=c+273.15; }
    else if (from === '°F') { f=val; c=(f-32)*5/9; k=c+273.15; }
    else { k=val; c=k-273.15; f=c*9/5+32; }

    const show = (v, u) => `
        <div class="conv-result-box" style="margin-bottom:10px;">
            <div class="conv-result-val">${parseFloat(v.toFixed(4)).toString().replace('.',',')}</div>
            <div class="conv-result-unit">${u}</div>
        </div>`;

    document.getElementById('suhu-results').innerHTML =
        (from !== '°C' ? show(c,'°C') : '') +
        (from !== '°F' ? show(f,'°F') : '') +
        (from !== 'K'  ? show(k,'K')  : '');
}

// ── DISKON ──────────────────────────────────────────────
function renderDiskon() {
    document.getElementById('conv-modal-title').innerText = '🏷️ Kalkulator Diskon';
    document.getElementById('conv-modal-body').innerHTML = `
        <div class="conv-row">
            <label>Harga Asli (Rp)</label>
            <input class="conv-input" id="disc-price" type="number" placeholder="100000" oninput="calcDiskon()">
        </div>
        <div class="conv-row">
            <label>Diskon (%)</label>
            <input class="conv-input" id="disc-pct" type="number" placeholder="20" oninput="calcDiskon()">
        </div>
        <div class="conv-divider"></div>
        <div id="disc-result"></div>
    `;
}

function calcDiskon() {
    const price = parseFloat(document.getElementById('disc-price').value);
    const pct   = parseFloat(document.getElementById('disc-pct').value);
    if (isNaN(price) || isNaN(pct)) return;
    const saved  = price * pct / 100;
    const final  = price - saved;
    const fmt    = v => 'Rp ' + Math.round(v).toLocaleString('id-ID');
    document.getElementById('disc-result').innerHTML = `
        <div class="conv-result-box" style="margin-bottom:10px;">
            <div class="conv-result-label">Hemat</div>
            <div class="conv-result-val" style="color:#ff6b6b;">${fmt(saved)}</div>
        </div>
        <div class="conv-result-box">
            <div class="conv-result-label">Harga Setelah Diskon</div>
            <div class="conv-result-val">${fmt(final)}</div>
        </div>`;
}

// ── KEUANGAN (bunga sederhana) ──────────────────────────
function renderKeuangan() {
    document.getElementById('conv-modal-title').innerText = '💵 Kalkulator Keuangan';
    document.getElementById('conv-modal-body').innerHTML = `
        <div class="conv-section-title">BUNGA SEDERHANA</div>
        <div class="conv-row"><label>Modal (Rp)</label>
            <input class="conv-input" id="fin-p" type="number" placeholder="1000000" oninput="calcKeuangan()"></div>
        <div class="conv-row"><label>Bunga per tahun (%)</label>
            <input class="conv-input" id="fin-r" type="number" placeholder="10" oninput="calcKeuangan()"></div>
        <div class="conv-row"><label>Waktu (tahun)</label>
            <input class="conv-input" id="fin-t" type="number" placeholder="2" oninput="calcKeuangan()"></div>
        <div class="conv-divider"></div>
        <div id="fin-result"></div>
    `;
}

function calcKeuangan() {
    const p = parseFloat(document.getElementById('fin-p').value);
    const r = parseFloat(document.getElementById('fin-r').value) / 100;
    const t = parseFloat(document.getElementById('fin-t').value);
    if (isNaN(p)||isNaN(r)||isNaN(t)) return;
    const bunga = p * r * t;
    const total = p + bunga;
    const fmt   = v => 'Rp ' + Math.round(v).toLocaleString('id-ID');
    document.getElementById('fin-result').innerHTML = `
        <div class="conv-result-box" style="margin-bottom:10px;">
            <div class="conv-result-label">Total Bunga</div>
            <div class="conv-result-val" style="color:#5b8eff;">${fmt(bunga)}</div>
        </div>
        <div class="conv-result-box">
            <div class="conv-result-label">Total Akhir</div>
            <div class="conv-result-val">${fmt(total)}</div>
        </div>`;
}

// ── MATA UANG ───────────────────────────────────────────
function renderMataUang() {
    document.getElementById('conv-modal-title').innerText = '💱 Mata Uang';
    // Rate manual (relatif ke USD)
    const rates = { USD:1, IDR:16300, EUR:0.92, SGD:1.34, MYR:4.7, JPY:149.5, GBP:0.79, AUD:1.52, CNY:7.24, SAR:3.75, KRW:1320 };
    const opts  = Object.keys(rates).map(c => `<option value="${c}">${c}</option>`).join('');
    document.getElementById('conv-modal-body').innerHTML = `
        <div style="background:rgba(91,142,255,0.08);border:1px solid rgba(91,142,255,0.2);border-radius:12px;padding:10px 14px;font-size:0.75rem;color:var(--text-dim);margin-bottom:16px;">
            ⚠️ Kurs perkiraan, bukan real-time
        </div>
        <div class="conv-row"><label>Jumlah</label>
            <div class="conv-input-wrap">
                <input class="conv-input" id="cur-input" type="number" value="1" oninput="calcMataUang()">
                <select class="conv-select" id="cur-from" onchange="calcMataUang()">${opts}</select>
            </div>
        </div>
        <div class="conv-divider"></div>
        <div class="conv-section-title">HASIL KONVERSI</div>
        <div id="cur-results"></div>
    `;
    document.getElementById('cur-from').value = 'USD';
    calcMataUang();
}

function calcMataUang() {
    const rates = { USD:1, IDR:16300, EUR:0.92, SGD:1.34, MYR:4.7, JPY:149.5, GBP:0.79, AUD:1.52, CNY:7.24, SAR:3.75, KRW:1320 };
    const val   = parseFloat(document.getElementById('cur-input').value);
    const from  = document.getElementById('cur-from').value;
    if (isNaN(val)) return;
    const inUSD = val / rates[from];
    let html = '';
    Object.entries(rates).forEach(([c, r]) => {
        if (c === from) return;
        const res = inUSD * r;
        const fmt = res >= 1 ? parseFloat(res.toFixed(2)).toLocaleString('id-ID') : res.toFixed(4);
        html += `<div class="conv-result-box" style="margin-bottom:8px;">
            <div class="conv-result-label">${val} ${from} =</div>
            <div class="conv-result-val">${fmt}</div>
            <div class="conv-result-unit">${c}</div>
        </div>`;
    });
    document.getElementById('cur-results').innerHTML = html;
}

// ── SISTEM ANGKA ────────────────────────────────────────
function renderSistemAngka() {
    document.getElementById('conv-modal-title').innerText = '🔢 Sistem Angka';
    document.getElementById('conv-modal-body').innerHTML = `
        <div class="conv-row"><label>Desimal (Base 10)</label>
            <input class="conv-input" id="num-dec" type="number" placeholder="255" oninput="calcAngka('dec')"></div>
        <div class="conv-divider"></div>
        <div class="conv-row"><label>Biner (Base 2)</label>
            <input class="conv-input" id="num-bin" placeholder="11111111" oninput="calcAngka('bin')"></div>
        <div class="conv-row"><label>Oktal (Base 8)</label>
            <input class="conv-input" id="num-oct" placeholder="377" oninput="calcAngka('oct')"></div>
        <div class="conv-row"><label>Heksadesimal (Base 16)</label>
            <input class="conv-input" id="num-hex" placeholder="FF" oninput="calcAngka('hex')" style="text-transform:uppercase;"></div>
    `;
}

function calcAngka(from) {
    let dec;
    if (from==='dec') { dec = parseInt(document.getElementById('num-dec').value,10); }
    else if (from==='bin') { dec = parseInt(document.getElementById('num-bin').value,2); }
    else if (from==='oct') { dec = parseInt(document.getElementById('num-oct').value,8); }
    else if (from==='hex') { dec = parseInt(document.getElementById('num-hex').value,16); }
    if (isNaN(dec)||dec<0) return;
    if (from!=='dec') document.getElementById('num-dec').value = dec;
    if (from!=='bin') document.getElementById('num-bin').value = dec.toString(2);
    if (from!=='oct') document.getElementById('num-oct').value = dec.toString(8);
    if (from!=='hex') document.getElementById('num-hex').value = dec.toString(16).toUpperCase();
}

// ── TANGGAL ─────────────────────────────────────────────
function renderTanggal() {
    document.getElementById('conv-modal-title').innerText = '📅 Selisih Tanggal';
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('conv-modal-body').innerHTML = `
        <div class="conv-row"><label>Tanggal Mulai</label>
            <input class="conv-input" id="tgl-start" type="date" value="${today}" oninput="calcTanggal()"></div>
        <div class="conv-row"><label>Tanggal Akhir</label>
            <input class="conv-input" id="tgl-end" type="date" value="${today}" oninput="calcTanggal()"></div>
        <div class="conv-divider"></div>
        <div id="tgl-result"></div>
    `;
    calcTanggal();
}

function calcTanggal() {
    const s = new Date(document.getElementById('tgl-start').value);
    const e = new Date(document.getElementById('tgl-end').value);
    if (isNaN(s)||isNaN(e)) return;
    const diff = Math.abs(e - s);
    const days  = Math.floor(diff / 86400000);
    const weeks = Math.floor(days / 7);
    const months= Math.floor(days / 30.44);
    const years = Math.floor(days / 365.25);
    document.getElementById('tgl-result').innerHTML = `
        <div class="conv-result-box" style="margin-bottom:8px;"><div class="conv-result-label">Hari</div><div class="conv-result-val">${days.toLocaleString('id-ID')}</div></div>
        <div class="conv-result-box" style="margin-bottom:8px;"><div class="conv-result-label">Minggu</div><div class="conv-result-val">${weeks.toLocaleString('id-ID')}</div></div>
        <div class="conv-result-box" style="margin-bottom:8px;"><div class="conv-result-label">Bulan (perkiraan)</div><div class="conv-result-val">${months.toLocaleString('id-ID')}</div></div>
        <div class="conv-result-box"><div class="conv-result-label">Tahun (perkiraan)</div><div class="conv-result-val">${years.toLocaleString('id-ID')}</div></div>
    `;
}

// ── IMT ─────────────────────────────────────────────────
function renderIMT() {
    document.getElementById('conv-modal-title').innerText = '🏋️ Indeks Massa Tubuh';
    document.getElementById('conv-modal-body').innerHTML = `
        <div class="conv-row"><label>Berat (kg)</label>
            <input class="conv-input" id="imt-w" type="number" placeholder="70" oninput="calcIMT()"></div>
        <div class="conv-row"><label>Tinggi (cm)</label>
            <input class="conv-input" id="imt-h" type="number" placeholder="170" oninput="calcIMT()"></div>
        <div class="conv-divider"></div>
        <div id="imt-result"></div>
    `;
}

function calcIMT() {
    const w = parseFloat(document.getElementById('imt-w').value);
    const h = parseFloat(document.getElementById('imt-h').value) / 100;
    if (isNaN(w)||isNaN(h)||h===0) return;
    const bmi = w / (h * h);
    let kat, color;
    if      (bmi < 18.5) { kat='Kurus';         color='#5b8eff'; }
    else if (bmi < 25)   { kat='Normal ✓';       color='#44d08c'; }
    else if (bmi < 30)   { kat='Kelebihan Berat';color='#f5c842'; }
    else                 { kat='Obesitas';        color='#ff6b4a'; }
    const pct = Math.min(Math.max((bmi-10)/30*100, 0), 100);
    document.getElementById('imt-result').innerHTML = `
        <div class="conv-result-box">
            <div class="conv-result-label">IMT Kamu</div>
            <div class="conv-result-val">${bmi.toFixed(1)}</div>
            <div class="imt-gauge"><div class="imt-needle" style="left:${pct}%"></div></div>
            <div class="imt-label" style="color:${color};">${kat}</div>
        </div>
    `;
}