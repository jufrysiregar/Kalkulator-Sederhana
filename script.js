let expr        = '';          
let justCalc    = false;       
let jokeModeOn  = false;
let sciMode     = false;
let is2nd       = false;
let isDeg       = true;
let calcHistory = JSON.parse(localStorage.getItem('calcHistory') || '[]');
const OPERATORS  = ['+', '-', '*', '/'];
const DISP_SYM   = { '*': '×', '/': '÷', '+': '+', '-': '−' };
function formatNum(val) {
    if (val === null || val === undefined) return '0';
    const str = val.toString();
    if (isNaN(parseFloat(str))) return str;
    const [intPart, decPart] = str.split('.');
    const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return decPart !== undefined ? intFormatted + ',' + decPart : intFormatted;
}
function elExpr()    { return document.getElementById(sciMode ? 'expr-sci'    : 'expr'); }
function elMain()    { return document.getElementById(sciMode ? 'current-sci' : 'current'); }
function elPreview() { return document.getElementById(sciMode ? 'preview-sci' : 'preview'); }
function toHuman(e) {
    let out = '', i = 0;
    while (i < e.length) {
        const c = e[i];
        if (c === '*') { out += ' × '; i++; continue; }
        if (c === '/') { out += ' ÷ '; i++; continue; }
        if (c === '+') { out += ' + '; i++; continue; }
        if (c === '-') {
            const prev = out.trimEnd().slice(-1);
            if (prev === '' || prev === '(' || '×÷+−'.includes(prev)) {
                out += '−';
            } else {
                out += ' − ';
            }
            i++; continue;
        }
        if (c === '.') { out += ','; i++; continue; }
        out += c; i++;
    }
    return out.trim();
}
function tryEval(e) {
    if (!e) return null;
    const open  = (e.match(/\(/g) || []).length;
    const close = (e.match(/\)/g) || []).length;
    let safe = e;
    for (let i = 0; i < open - close; i++) safe += ')';
    safe = safe.replace(/[\+\-\*\/]+$/, '');
    if (!safe) return null;
    try {
        if (!/^[\d\.\+\-\*\/\(\)\s]+$/.test(safe)) return null;
        const res = Function('"use strict"; return (' + safe + ')')();
        if (!isFinite(res) || isNaN(res)) return null;
        return parseFloat(Number(res).toFixed(8));
    } catch { return null; }
}
function render() {
    const mEl = elMain();
    const pEl = elPreview();
    const eEl = elExpr();
    mEl.classList.remove('love-you');
    if (!expr) {
        eEl.innerText  = '';
        mEl.innerText  = '0';
        pEl.innerText  = '';
        return;
    }
    mEl.innerText = toHuman(expr);
    const prev = tryEval(expr);
    pEl.innerText = prev !== null ? '= ' + formatNum(prev) : '';
    eEl.innerText = '';
}
function press(key) {
    switch (key) {
        case 'AC':  return clearAll();
        case '⌫':  return del();
        case '=':   return calculate();
        case '%':   return percent();
        case '+/-': return toggleSign();
        case '.':   return addDecimal();
        default:
            if ('0123456789'.includes(key)) return addDigit(key);
            if (['+','-','*','/'].includes(key)) return addOperator(key);
    }
}
function pressSci(token) {
    if (token === ')') { closeParen(); return; }
    if (token === '^') { addOperator('^'); return; }
    if (token === 'π') { insertConst(Math.PI.toFixed(8)); return; }
    if (token === 'e') { insertConst(Math.E.toFixed(8)); return; }
    insertFunc(token);
}
function addDigit(d) {
    if (justCalc) { expr = ''; justCalc = false; }
    if (expr === '0') expr = '';
    expr += d;
    render();
}
function addDecimal() {
    if (justCalc) { expr = '0'; justCalc = false; }
    if (!expr) expr = '0';
    const m = expr.match(/([\d]*)$/);
    const lastNum = m ? m[1] : '';
    const lastDotPart = expr.slice(expr.search(/[\d\.]*$/));
    if (!lastDotPart.includes('.')) expr += '.';
    render();
}
function addOperator(op) {
    if (justCalc) justCalc = false;
    if (expr === 'Error') { expr = ''; return; }
    const last = expr ? expr[expr.length - 1] : '';
    if (!expr) {
        if (op === '-') { expr = '-'; render(); }
        return;
    }
    if (last === '(') {
        if (op === '-') { expr += '-'; render(); }
        return;
    }
    if (OPERATORS.includes(last) || last === '^') {
        if (op === '-') {
            if (last !== '-') { expr += '-'; render(); }
        } else {
            const prev2 = expr.length >= 2 ? expr[expr.length - 2] : '';
            if (last === '-' && (OPERATORS.includes(prev2) || prev2 === '(' || prev2 === '')) {
                expr = expr.slice(0, -2) + op;
            } else {
                expr = expr.slice(0, -1) + op;
            }
            render();
        }
        return;
    }
    expr += op;
    render();
}
function openParen() {
    if (justCalc) { expr = ''; justCalc = false; }
    const last = expr ? expr[expr.length - 1] : '';
    if (last && ('0123456789)'.includes(last))) expr += '*';
    expr += '(';
    render();
}
function closeParen() {
    const open  = (expr.match(/\(/g) || []).length;
    const close = (expr.match(/\)/g) || []).length;
    const last  = expr ? expr[expr.length - 1] : '';
    if (open > close && !'+-*/^('.includes(last)) {
        expr += ')';
        render();
    }
}
function insertFunc(token) {
    if (justCalc) { expr = ''; justCalc = false; }
    const last = expr ? expr[expr.length - 1] : '';
    if (last && ('0123456789)'.includes(last))) expr += '*';
    expr += token;
    render();
}
function insertConst(val) {
    if (justCalc) { expr = ''; justCalc = false; }
    const last = expr ? expr[expr.length - 1] : '';
    if (!expr || OPERATORS.includes(last) || last === '(') {
        expr += val;
    } else {
        expr = val; 
    }
    render();
}
function toggleSign() {
    if (!expr || expr === '0') { expr = '-'; render(); return; }
    const m = expr.match(/(\(?-?[\d\.]+\)?)$/);
    if (!m) return;
    const last = m[1];
    const prefix = expr.slice(0, -last.length);
    if (last.startsWith('-')) {
        expr = prefix + last.slice(1);
    } else {
        expr = prefix + '-' + last;
    }
    render();
}
function percent() {
    const m = expr.match(/([\d\.]+)$/);
    if (!m) return;
    const num = parseFloat(m[1]) / 100;
    expr = expr.slice(0, -m[1].length) + num.toString();
    render();
}
function del() {
    if (justCalc) { clearAll(); return; }
    expr = expr.slice(0, -1);
    render();
}
function clearAll() {
    expr = ''; justCalc = false;
    elMain().classList.remove('love-you');
    elMain().innerText  = '0';
    elPreview().innerText = '';
    elExpr().innerText    = '';
}
function calculate() {
    if (!expr) return;
    if (jokeModeOn && activeJoke && expr === activeJoke.expr) {
        elMain().classList.add('love-you');
        elMain().innerText    = activeJoke.display;
        elPreview().innerText = '';
        elExpr().innerText    = activeJoke.label + ' =';
        pushHistory(activeJoke.label, activeJoke.display);
        expr = ''; justCalc = true; jokeModeOn = false; activeJoke = null;
        return;
    }
    jokeModeOn = false;
    let e = expr;
    const open  = (e.match(/\(/g) || []).length;
    const close = (e.match(/\)/g) || []).length;
    for (let i = 0; i < open - close; i++) e += ')';
    e = e.replace(/[\+\-\*\/\^]+$/, '');
    if (!e) return;
    e = e
        .replace(/sin\(/g,  'Math.sin(')
        .replace(/cos\(/g,  'Math.cos(')
        .replace(/tan\(/g,  'Math.tan(')
        .replace(/lg\(/g,   'Math.log10(')
        .replace(/ln\(/g,   'Math.log(')
        .replace(/√\(/g,    'Math.sqrt(')
        .replace(/fact\(/g, '_fact(')
        .replace(/1\/\(/g,  '1/(')
        .replace(/\^/g,     '**');
    if (isDeg) {
        e = e
            .replace(/Math\.sin\(([^)]+)\)/g, (_,a) => `Math.sin(${a}*Math.PI/180)`)
            .replace(/Math\.cos\(([^)]+)\)/g, (_,a) => `Math.cos(${a}*Math.PI/180)`)
            .replace(/Math\.tan\(([^)]+)\)/g, (_,a) => `Math.tan(${a}*Math.PI/180)`);
    }
    let result;
    try {
        if (!/^[\d\.\+\-\*\/\(\)\s\_a-zA-Z\.]+$/.test(e)) throw new Error();
        result = Function('"use strict"; function _fact(n){if(n<=1)return 1;let r=1;for(let i=2;i<=n;i++)r*=i;return r;} return (' + e + ')')();
    } catch {
        elMain().innerText    = 'Error';
        elPreview().innerText = '';
        expr = ''; justCalc = true; return;
    }
    if (!isFinite(result) || isNaN(result)) {
        elMain().innerText = isNaN(result) ? 'Error' : '∞';
        expr = ''; justCalc = true; return;
    }
    const resStr  = parseFloat(Number(result).toFixed(8)).toString();
    const eqLabel = toHuman(expr.replace(/\^/g, '^'));
    pushHistory(eqLabel, resStr);
    elExpr().innerText    = eqLabel + ' =';
    elMain().classList.remove('love-you');
    elMain().innerText    = formatNum(resStr);
    elPreview().innerText = '';
    expr = resStr; justCalc = true;
}
function toggleSciMode() {
    sciMode = !sciMode;
    document.getElementById('view-standard').style.display   = sciMode ? 'none' : 'flex';
    document.getElementById('view-scientific').style.display = sciMode ? 'flex'  : 'none';
    render();
}
function toggle2nd() {
    is2nd = !is2nd;
    document.getElementById('btn-2nd').classList.toggle('active-sci', is2nd);
    document.getElementById('btn-sin').innerText = is2nd ? 'sin⁻¹' : 'sin';
    document.getElementById('btn-cos').innerText = is2nd ? 'cos⁻¹' : 'cos';
    document.getElementById('btn-tan').innerText = is2nd ? 'tan⁻¹' : 'tan';
    document.getElementById('btn-sin').onclick = () => pressSci(is2nd ? 'asin(' : 'sin(');
    document.getElementById('btn-cos').onclick = () => pressSci(is2nd ? 'acos(' : 'cos(');
    document.getElementById('btn-tan').onclick = () => pressSci(is2nd ? 'atan(' : 'tan(');
}
function toggleDeg() {
    isDeg = !isDeg;
    const btn = document.getElementById('btn-deg');
    btn.innerText = isDeg ? 'deg' : 'rad';
    btn.classList.toggle('active-sci', !isDeg);
}
function pushHistory(eq, res) {
    calcHistory.unshift({ eq, res });
    localStorage.setItem('calcHistory', JSON.stringify(calcHistory));
}
function showFullHistory() {
    document.getElementById('history-overlay').style.display = 'block';
    document.getElementById('dropdown-menu').style.display   = 'none';
    renderHistory();
}
function renderHistory() {
    const c = document.getElementById('history-content');
    const JOKE_RESULTS = ['I L0v3 {', 'Kamu Milik Saya', '128√e980', 'Hello World.!', 'Kebanyakan nanya :)'];
    c.innerHTML = calcHistory.map(item => `
        <div style="text-align:right;margin-bottom:14px;padding:14px 18px;background:#13141f;border-radius:16px;border:1px solid rgba(255,255,255,0.05);">
            <div style="color:#555;font-size:0.82rem;font-family:'Nunito',sans-serif;margin-bottom:6px;">${item.eq} =</div>
            <div style="color:#fff;font-size:${JOKE_RESULTS.includes(item.res)?'1rem':'1.4rem'};font-weight:400;font-family:'Nunito',sans-serif;">${JOKE_RESULTS.includes(item.res) ? item.res : formatNum(item.res)}</div>
        </div>
    `).join('') || '<p style="text-align:center;color:#3d4166;padding-top:40px;font-size:0.9rem;">Belum ada riwayat</p>';
}
function clearAllHistory() { calcHistory = []; localStorage.removeItem('calcHistory'); renderHistory(); }
function hideFullHistory()  { document.getElementById('history-overlay').style.display = 'none'; }
const ALL_JOKES = [
    { expr: '1+1',     label: '1 + 1',       display: 'I L0v3 {}' },
    { expr: '2+2',     label: '2 + 2',       display: 'Kamu Milik Saya' },
    { expr: '1*1',     label: '1 × 1',       display: '128√e980' },
    { expr: '1-1',     label: '1 − 1',       display: 'Hello World.!' },
    { expr: '100*100', label: '100 × 100',   display: 'Kebanyakan nanya :)' },
    { expr: '0/0',     label: '0 ÷ 0',       display: 'PRANK ~LOL' },
];
let usedJokes = [];
let activeJoke = null;
function showTips() {
    if (usedJokes.length >= ALL_JOKES.length) usedJokes = [];
    const remaining = ALL_JOKES.filter(j => !usedJokes.includes(j.expr));
    activeJoke = remaining[Math.floor(Math.random() * remaining.length)];
    usedJokes.push(activeJoke.expr);
    jokeModeOn = true;
    const box = document.querySelector('.tips-box');
    box.innerHTML = `
        <p>✨ Coba hitung ini</p>
        <div style="font-size:1.4rem;font-family:'Nunito',sans-serif;color:#FFD700;margin:14px 0;letter-spacing:1px;">${activeJoke.label} = ?</div>
        <small>(Klik di mana saja untuk menutup)</small>
    `;
    document.getElementById('tips-popup').style.display = 'flex';
}
function hideTips() { document.getElementById('tips-popup').style.display = 'none'; }
function switchTab(type) {
    document.getElementById('calc-section').style.display = type === 'calc' ? 'flex'  : 'none';
    document.getElementById('conv-section').style.display = type === 'conv' ? 'block' : 'none';
    document.querySelectorAll('.tab')[0].classList.toggle('active', type === 'calc');
    document.querySelectorAll('.tab')[1].classList.toggle('active', type === 'conv');
}
document.getElementById('menu-trigger').addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = document.getElementById('dropdown-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
});
document.addEventListener('click', () => { document.getElementById('dropdown-menu').style.display = 'none'; });
document.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace')               press('⌫');
    else if (e.key === 'Enter' || e.key === '=') press('=');
    else if (e.key >= '0' && e.key <= '9')   press(e.key);
    else if (e.key === '.' || e.key === ',')  press('.');
    else if (e.key === '+')                   press('+');
    else if (e.key === '-')                   press('-');
    else if (e.key === '*')                   press('*');
    else if (e.key === '/') { e.preventDefault(); press('/'); }
    else if (e.key === '(')                   openParen();
    else if (e.key === ')')                   closeParen();
    else if (e.key === 'Escape')              press('AC');
});
const CONV_DATA = {
    panjang: {
        title: '📏 Panjang',
        units: ['mm','cm','m','km','inch','feet','yard','mile'],
        base: 'm', 
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
                <div class="conv-result-val">${formatNum(fmt)}</div>
                <div class="conv-result-unit">${u}</div>
            </div>`;
    });
    document.getElementById('cv-results').innerHTML = html;
}
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
            <div class="conv-result-val">${formatNum(parseFloat(v.toFixed(4)).toString())}</div>
            <div class="conv-result-unit">${u}</div>
        </div>`;
    document.getElementById('suhu-results').innerHTML =
        (from !== '°C' ? show(c,'°C') : '') +
        (from !== '°F' ? show(f,'°F') : '') +
        (from !== 'K'  ? show(k,'K')  : '');
}
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
function renderMataUang() {
    document.getElementById('conv-modal-title').innerText = '💱 Mata Uang';
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