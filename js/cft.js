// CFT 柱 (Concrete Filled Tube) 強度檢核模組
document.addEventListener('DOMContentLoaded', () => {

    // ===== Ec 自動計算 =====
    function updateCftEc() {
        const fc = parseFloat(document.getElementById('cftFc').value) || 0;
        const Ec = Math.round(12000 * Math.sqrt(fc));
        document.getElementById('cftEc').value = Ec.toLocaleString('en-US');
    }
    updateCftEc();
    document.getElementById('cftFc')?.addEventListener('input', updateCftEc);

    // ===== 初始繪製 =====
    drawCftSection();
    drawCftPMPlaceholder();

    // 監聽斷面輸入，即時重繪
    ['cftB', 'cftH', 'cftTw'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', drawCftSection);
    });

    // 主題變更重繪
    new MutationObserver(() => {
        drawCftSection();
        if (lastCftResults) drawCftPMChart(lastCftResults);
        else drawCftPMPlaceholder();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // ===== 載重模組 =====
    initCftLoadModule();

    // ===== 計算按鈕 =====
    document.getElementById('btnCftCalc')?.addEventListener('click', () => {
        const results = cftCalculateAll();
        lastCftResults = results;
        cftRenderResults(results);
        drawCftPMChart(results);
    });

    // ===== P-M 圖表 hover tooltip =====
    const pmCanvas = document.getElementById('cftPMCanvas');
    const pmTip = document.createElement('div');
    pmTip.id = 'cftPMTooltip';
    document.body.appendChild(pmTip);

    pmCanvas?.addEventListener('mousemove', (e) => {
        const rect = pmCanvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        let hit = null;
        for (const pt of cftChartPoints) {
            const dist = Math.sqrt((mx - pt.sx) ** 2 + (my - pt.sy) ** 2);
            if (dist <= 12) { hit = pt; break; }
        }
        if (hit) {
            pmTip.textContent = hit.label;
            pmTip.style.display = 'block';
            pmTip.style.left = (e.clientX + 12) + 'px';
            pmTip.style.top = (e.clientY - 28) + 'px';
            pmCanvas.style.cursor = 'pointer';
        } else {
            pmTip.style.display = 'none';
            pmCanvas.style.cursor = 'default';
        }
    });

    pmCanvas?.addEventListener('mouseleave', () => {
        pmTip.style.display = 'none';
        pmCanvas.style.cursor = 'default';
    });
});

let lastCftResults = null;
let cftChartPoints = []; // 圖表上載重點的螢幕座標 [{sx, sy, label, ok}]

// ============================================
//  CFT 設計載重模組
// ============================================
let cftLoadData = [];

function cftRenderLoadList() {
    const listEl = document.getElementById('cftLoadList');
    if (!listEl) return;

    if (cftLoadData.length === 0) {
        listEl.innerHTML = '<div class="load-list-empty">尚未輸入載重</div>';
        return;
    }

    let html = `<div class="load-item load-item-header">
        <span class="load-col-no">No.</span>
        <span class="load-col-val">P<sub>u</sub> (tf)</span>
        <span class="load-col-val">M<sub>u</sub> (tf-m)</span>
        <span class="load-col-del"></span>
    </div>`;

    cftLoadData.forEach((item, idx) => {
        html += `<div class="load-item${idx % 2 === 1 ? ' load-item-alt' : ''}" data-idx="${idx}">
            <span class="load-col-no">${item.no}</span>
            <span class="load-col-val">${item.Pu}</span>
            <span class="load-col-val">${item.Mu}</span>
            <button class="load-del-btn" data-idx="${idx}" title="刪除">&times;</button>
        </div>`;
    });

    listEl.innerHTML = html;

    // 刪除按鈕
    listEl.querySelectorAll('.load-del-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            cftLoadData.splice(parseInt(e.target.dataset.idx), 1);
            cftRenderLoadList();
        });
    });

    // 點擊載重項目 → 填入輸入欄
    listEl.querySelectorAll('.load-item:not(.load-item-header)').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('load-del-btn')) return;
            const idx = parseInt(item.dataset.idx);
            const d = cftLoadData[idx];
            document.getElementById('cftLoadNo').value = d.no;
            document.getElementById('cftLoadPu').value = d.Pu;
            document.getElementById('cftLoadMu').value = d.Mu;
        });
    });
}

function cftGetNextNo() {
    if (cftLoadData.length === 0) return 1;
    return Math.max(...cftLoadData.map(d => d.no)) + 1;
}

function initCftLoadModule() {
    const noEl = document.getElementById('cftLoadNo');
    const puEl = document.getElementById('cftLoadPu');
    const muEl = document.getElementById('cftLoadMu');

    // 輸入載重
    document.getElementById('btnCftInputLoad')?.addEventListener('click', () => {
        const no = parseInt(noEl.value) || cftGetNextNo();
        const Pu = parseFloat(puEl.value) || 0;
        const Mu = parseFloat(muEl.value) || 0;
        cftLoadData.push({ no, Pu, Mu });
        cftRenderLoadList();
        noEl.value = no + 1;
        puEl.value = 0;
        muEl.value = 0;
        puEl.focus();
    });

    // 初始化
    document.getElementById('btnCftInitLoad')?.addEventListener('click', () => {
        cftLoadData = [];
        cftRenderLoadList();
        noEl.value = 1;
        puEl.value = 0;
        muEl.value = 0;
    });

    // 匯入 (文字格式 Modal)
    const importModal = document.getElementById('cftImportModal');
    const importTextarea = document.getElementById('cftImportTextarea');

    document.getElementById('btnCftImport')?.addEventListener('click', () => {
        importTextarea.value = '';
        importModal.classList.add('active');
        importTextarea.focus();
    });

    document.getElementById('cftImportConfirm')?.addEventListener('click', () => {
        const text = importTextarea.value.trim();
        if (!text) { importModal.classList.remove('active'); return; }

        let startNo = cftGetNextNo();
        text.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;
            const parts = trimmed.split(/[,\s\t]+/);
            if (parts.length >= 2) {
                const Pu = parseFloat(parts[0]);
                const Mu = parseFloat(parts[1]);
                if (!isNaN(Pu) && !isNaN(Mu)) {
                    cftLoadData.push({ no: startNo++, Pu, Mu });
                }
            }
        });

        cftRenderLoadList();
        importModal.classList.remove('active');
        noEl.value = cftGetNextNo();
    });

    document.getElementById('cftImportCancel')?.addEventListener('click', () => {
        importModal.classList.remove('active');
    });

    document.getElementById('cftImportCancelBtn')?.addEventListener('click', () => {
        importModal.classList.remove('active');
    });

    importModal?.addEventListener('click', (e) => {
        if (e.target === importModal) importModal.classList.remove('active');
    });
}

// ============================================
//  讀取輸入
// ============================================
function cftGetInputs() {
    return {
        B:    parseFloat(document.getElementById('cftB').value) || 150,
        H:    parseFloat(document.getElementById('cftH').value) || 150,
        tw:   parseFloat(document.getElementById('cftTw').value) || 6,
        L:    parseFloat(document.getElementById('cftLength').value) || 3.5,
        K:    parseFloat(document.getElementById('cftKx').value) || 1.0,
        fc:   parseFloat(document.getElementById('cftFc').value) || 280,
        Fys:  parseFloat(document.getElementById('cftFys').value) || 3500,
        Fyr:  parseFloat(document.getElementById('cftFyr').value) || 0,
        Es:   parseFloat(document.getElementById('cftEs').value) || 2040000,
        Pu:   parseFloat(document.getElementById('cftLoadPu').value) || 0,
        Mux:  parseFloat(document.getElementById('cftLoadMu').value) || 0,
        phiC: parseFloat(document.getElementById('cftPhiC').value) || 0.85,
        phiB: parseFloat(document.getElementById('cftPhiB').value) || 0.90,
        c1:   parseFloat(document.getElementById('cftC1').value) || 1.00,
        c2:   parseFloat(document.getElementById('cftC2').value) || 0.85,
        c3:   parseFloat(document.getElementById('cftC3').value) || 0.40,
    };
}

// ============================================
//  斷面性質計算
// ============================================
function cftCalcSectionProps(inp) {
    const { B, H, tw, Fys, Es } = inp;
    const Bi = B - 2 * tw;
    const Hi = H - 2 * tw;

    const Ag = B * H;
    const As = Ag - Bi * Hi;
    const Ac = Bi * Hi;
    const Ar = 0; // CFT 無鋼筋

    const Ig = B * Math.pow(H, 3) / 12;
    const Is = Ig - Bi * Math.pow(Hi, 3) / 12;
    const Zs = B * Math.pow(H, 2) / 4 - Bi * Math.pow(Hi, 2) / 4;
    const rs = Math.sqrt(Is / As);
    const rho = As / Ag;

    // 最小板厚
    const t_min = B * Math.sqrt(Fys / (3 * Es));

    return { Ag, As, Ac, Ar, Ig, Is, Zs, rs, rho, t_min, Bi, Hi };
}

// ============================================
//  寬厚比檢核
// ============================================
function cftCalcWidthThickness(inp, sec) {
    const twOK = inp.tw >= sec.t_min;
    return { twOK };
}

// ============================================
//  修正降伏強度與彈性模數
// ============================================
function cftCalcComposite(inp, sec) {
    const { Fys, Fyr, fc, Es, c1, c2, c3 } = inp;
    const { As, Ac, Ar, Is } = sec;

    const Ec = 12000 * Math.sqrt(fc);

    // Fmy = Fys + c1·Fyr·(Ar/As) + c2·fc'·(Ac/As)
    const Fmy = Fys + c1 * Fyr * (Ar / As) + c2 * fc * (Ac / As);

    // Em = Es + c3·Ec·(Ac/As)
    const Em = Es + c3 * Ec * (Ac / As);

    // rm = sqrt(Is/As)
    const rm = Math.sqrt(Is / As);

    return { Ec, Fmy, Em, rm };
}

// ============================================
//  柱挫屈強度
// ============================================
function cftCalcBuckling(inp, comp, sec) {
    const { K, L, phiC } = inp;
    const { Fmy, Em, rm } = comp;
    const { As } = sec;
    const Lcm = L * 100; // m → cm

    const lc = (K * Lcm) / (Math.PI * rm) * Math.sqrt(Fmy / Em);
    const Fcr = lc <= 1.5
        ? Math.pow(0.658, lc * lc) * Fmy
        : (0.877 / (lc * lc)) * Fmy;

    const Pn = As * Fcr / 1000; // kgf → tf
    const phiPn = phiC * Pn;

    return { lc, Fcr, Pn, phiPn };
}

// ============================================
//  彎矩強度
// ============================================
function cftCalcMoment(inp, sec) {
    const { Fys, phiB } = inp;
    const { Zs } = sec;

    const Mn = Zs * Fys / 100000; // kgf·cm → tf·m
    const phiMn = phiB * Mn;

    return { Mn, phiMn };
}

// ============================================
//  P-M 交互作用檢核 (AISC 雙線性)
// ============================================
function cftCalcInteraction(inp, buck, mom) {
    const { Pu, Mux } = inp;
    const { phiPn } = buck;
    const { phiMn } = mom;

    if (phiPn === 0) return { ratio_P: 0, ratio_M: 0, value: 0, formula: '-', ok: true };

    const ratio_P = Pu / phiPn;
    const ratio_M = phiMn > 0 ? Mux / phiMn : 0;

    let value, formula;
    if (ratio_P >= 0.2) {
        // H1-1a: Pu/(φcPn) + 8/9·Mu/(φbMn) ≤ 1.0
        value = ratio_P + (8 / 9) * ratio_M;
        formula = 'H1-1a';
    } else {
        // H1-1b: Pu/(2φcPn) + Mu/(φbMn) ≤ 1.0
        value = ratio_P / 2 + ratio_M;
        formula = 'H1-1b';
    }

    return { ratio_P, ratio_M, value, formula, ok: value <= 1.0 };
}

// ============================================
//  主計算函式
// ============================================
function cftCalculateAll() {
    const inp  = cftGetInputs();
    const sec  = cftCalcSectionProps(inp);
    const wt   = cftCalcWidthThickness(inp, sec);
    const comp = cftCalcComposite(inp, sec);
    const buck = cftCalcBuckling(inp, comp, sec);
    const mom  = cftCalcMoment(inp, sec);
    const inter = cftCalcInteraction(inp, buck, mom);
    return { inp, sec, wt, comp, buck, mom, inter };
}

// ============================================
//  結果渲染
// ============================================
function cftRenderResults(r) {
    const { inp, sec, wt, comp, buck, mom, inter } = r;
    const f = formatValue;

    const okBadge = '<span class="badge badge-seismic">OK</span>';
    const ngBadge = '<span class="badge badge-fail">NG</span>';

    // Fcr 公式
    const fcrFormula = buck.lc <= 1.5
        ? '0.658<sup>λc²</sup> · F<sub>my</sub>'
        : '(0.877 / λ<sub>c</sub>²) · F<sub>my</sub>';

    // P-M 檢核公式
    const interFormula = inter.formula === 'H1-1a'
        ? 'P<sub>u</sub>/(φ<sub>c</sub>P<sub>n</sub>) + 8/9 · M<sub>u</sub>/(φ<sub>b</sub>M<sub>n</sub>)'
        : 'P<sub>u</sub>/(2φ<sub>c</sub>P<sub>n</sub>) + M<sub>u</sub>/(φ<sub>b</sub>M<sub>n</sub>)';

    const html = `
    <!-- 斷面性質 -->
    <div class="result-section">
        <div class="result-section-title"><span class="dot dot-blue"></span>斷面性質</div>
        <table class="result-table">
            <tr><td>${tip('A<sub>g</sub>', 'B × H')}</td><td>${f(sec.Ag, 2)} cm²</td></tr>
            <tr><td>${tip('A<sub>s</sub> (鋼管面積)', 'BH − (B−2t<sub>w</sub>)(H−2t<sub>w</sub>)')}</td><td>${f(sec.As, 2)} cm²</td></tr>
            <tr><td>${tip('A<sub>c</sub> (混凝土面積)', '(B−2t<sub>w</sub>)(H−2t<sub>w</sub>)')}</td><td>${f(sec.Ac, 2)} cm²</td></tr>
            <tr><td>${tip('I<sub>g</sub>', 'BH³ / 12')}</td><td>${f(sec.Ig, 2)} cm⁴</td></tr>
            <tr><td>${tip('I<sub>s</sub>', 'I<sub>g</sub> − B<sub>i</sub>H<sub>i</sub>³ / 12')}</td><td>${f(sec.Is, 2)} cm⁴</td></tr>
            <tr><td>${tip('Z<sub>s</sub>', 'BH² / 4 − B<sub>i</sub>H<sub>i</sub>² / 4')}</td><td>${f(sec.Zs, 2)} cm³</td></tr>
            <tr><td>${tip('r<sub>s</sub>', '√(I<sub>s</sub> / A<sub>s</sub>)')}</td><td>${f(sec.rs, 2)} cm</td></tr>
            <tr><td>${tip('ρ = A<sub>s</sub> / A<sub>g</sub>')}</td><td>${(sec.rho * 100).toFixed(2)}%</td></tr>
        </table>
    </div>

    <!-- 板厚檢核 -->
    <div class="result-section">
        <div class="result-section-title"><span class="dot dot-green"></span>板厚檢核</div>
        <table class="result-table">
            <tr><td>${tip('t<sub>min</sub>', 'B · √(F<sub>ys</sub> / 3E<sub>s</sub>)')}</td><td>${f(sec.t_min, 3)} cm</td></tr>
            <tr><td>t<sub>w</sub> = ${f(inp.tw, 1)} cm</td><td>${wt.twOK ? okBadge : ngBadge}</td></tr>
        </table>
    </div>

    <!-- 修正降伏強度與彈性模數 -->
    <div class="result-section">
        <div class="result-section-title"><span class="dot dot-purple"></span>複合強度參數</div>
        <table class="result-table">
            <tr><td>${tip('E<sub>c</sub>', '12000√f\'<sub>c</sub>')}</td><td>${f(comp.Ec, 2)} kgf/cm²</td></tr>
            <tr><td>${tip('F<sub>my</sub>', 'F<sub>ys</sub> + c<sub>1</sub>F<sub>yr</sub>(A<sub>r</sub>/A<sub>s</sub>) + c<sub>2</sub>f\'<sub>c</sub>(A<sub>c</sub>/A<sub>s</sub>)')}</td><td>${f(comp.Fmy, 2)} kgf/cm²</td></tr>
            <tr><td>${tip('E<sub>m</sub>', 'E<sub>s</sub> + c<sub>3</sub>E<sub>c</sub>(A<sub>c</sub>/A<sub>s</sub>)')}</td><td>${f(comp.Em, 2)} kgf/cm²</td></tr>
            <tr><td>${tip('r<sub>m</sub>', '√(I<sub>s</sub> / A<sub>s</sub>)')}</td><td>${f(comp.rm, 2)} cm</td></tr>
        </table>
    </div>

    <!-- 柱挫屈強度 -->
    <div class="result-section">
        <div class="result-section-title"><span class="dot dot-orange"></span>柱挫屈強度</div>
        <table class="result-table">
            <tr><td>${tip('KL / (π·r<sub>m</sub>)')}</td><td>${f((inp.K * inp.L * 100) / (Math.PI * comp.rm), 3)}</td></tr>
            <tr><td>${tip('λ<sub>c</sub>', 'KL / (πr<sub>m</sub>) · √(F<sub>my</sub> / E<sub>m</sub>)')}</td><td>${f(buck.lc, 4)} ${buck.lc <= 1.5 ? '≤ 1.5' : '> 1.5'}</td></tr>
            <tr><td>${tip('F<sub>cr</sub>', fcrFormula)}</td><td>${f(buck.Fcr, 2)} kgf/cm²</td></tr>
            <tr><td>${tip('P<sub>n</sub>', 'A<sub>s</sub> · F<sub>cr</sub>')}</td><td>${f(buck.Pn, 2)} tf</td></tr>
            <tr><td>${tip('φ<sub>c</sub>P<sub>n</sub>', 'φ<sub>c</sub> · A<sub>s</sub> · F<sub>cr</sub>')}</td><td>${f(buck.phiPn, 2)} tf</td></tr>
        </table>
    </div>

    <!-- 彎矩強度 -->
    <div class="result-section">
        <div class="result-section-title"><span class="dot dot-cyan"></span>彎矩強度</div>
        <table class="result-table">
            <tr><td>${tip('M<sub>n</sub>', 'Z<sub>s</sub> · F<sub>ys</sub>')}</td><td>${f(mom.Mn, 2)} tf-m</td></tr>
            <tr><td>${tip('φ<sub>b</sub>M<sub>n</sub>', 'φ<sub>b</sub> · Z<sub>s</sub> · F<sub>ys</sub>')}</td><td>${f(mom.phiMn, 2)} tf-m</td></tr>
        </table>
    </div>

    <!-- P-M 交互作用檢核 -->
    <div class="result-section">
        <div class="result-section-title"><span class="dot dot-red"></span>P-M 交互作用檢核</div>
        <table class="result-table">
            <tr><td>${tip('P<sub>u</sub> / (φ<sub>c</sub>P<sub>n</sub>)')}</td><td>${f(inter.ratio_P, 4)} ${inter.ratio_P >= 0.2 ? '≥ 0.2 → ' + inter.formula : '< 0.2 → ' + inter.formula}</td></tr>
            <tr><td>${tip('M<sub>u</sub> / (φ<sub>b</sub>M<sub>n</sub>)')}</td><td>${f(inter.ratio_M, 4)}</td></tr>
            <tr class="result-verdict"><td>${tip('檢核值 (' + inter.formula + ')', interFormula)}</td><td>${f(inter.value, 4)} ${inter.ok ? '≤ 1.0' : '> 1.0'} ${inter.ok ? okBadge : ngBadge}</td></tr>
        </table>
    </div>`;

    const content = document.getElementById('cftResultContent');
    const placeholder = document.getElementById('cftResultPlaceholder');
    content.innerHTML = html;
    content.style.display = 'flex';
    placeholder.style.display = 'none';
}

// ============================================
//  Canvas 繪圖 - 箱型斷面
// ============================================
function drawCftSection() {
    const canvas = document.getElementById('cftSectionCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    ctx.clearRect(0, 0, W, H);

    // 讀取尺寸
    const B  = parseFloat(document.getElementById('cftB')?.value) || 150;
    const sH = parseFloat(document.getElementById('cftH')?.value) || 150;
    const tw = parseFloat(document.getElementById('cftTw')?.value) || 6;

    // 縮放
    const margin = 70;
    const drawW = W - 2 * margin;
    const drawH = H - 2 * margin;
    const scale = Math.min(drawW / B, drawH / sH) * 0.85;

    const cx = W / 2, cy = H / 2;
    const bx = B * scale, by = sH * scale;
    const x0 = cx - bx / 2, y0 = cy - by / 2;

    // 混凝土填充
    ctx.fillStyle = isDark ? 'rgba(96, 165, 250, 0.12)' : 'rgba(37, 99, 235, 0.08)';
    ctx.fillRect(x0, y0, bx, by);

    // 鋼管
    const twPx = tw * scale;
    ctx.fillStyle = isDark ? 'rgba(167, 139, 250, 0.4)' : 'rgba(124, 58, 237, 0.25)';
    // 上翼板
    ctx.fillRect(x0, y0, bx, twPx);
    // 下翼板
    ctx.fillRect(x0, y0 + by - twPx, bx, twPx);
    // 左腹板
    ctx.fillRect(x0, y0, twPx, by);
    // 右腹板
    ctx.fillRect(x0 + bx - twPx, y0, twPx, by);

    // 外框線
    ctx.strokeStyle = isDark ? '#a78bfa' : '#7c3aed';
    ctx.lineWidth = 2;
    ctx.strokeRect(x0, y0, bx, by);

    // 內框線 (混凝土核心)
    ctx.strokeStyle = isDark ? 'rgba(96, 165, 250, 0.5)' : 'rgba(37, 99, 235, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(x0 + twPx, y0 + twPx, bx - 2 * twPx, by - 2 * twPx);
    ctx.setLineDash([]);

    // 尺寸標註
    ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
    ctx.font = '14px -apple-system, sans-serif';
    ctx.textAlign = 'center';

    // B (底部)
    drawDimLine(ctx, x0, y0 + by + 20, x0 + bx, y0 + by + 20, `B = ${B} cm`, isDark);
    // H (左側)
    drawDimLineV(ctx, x0 - 20, y0, x0 - 20, y0 + by, `H = ${sH} cm`, isDark);
    // tw (上方)
    if (twPx > 8) {
        ctx.fillStyle = isDark ? '#a78bfa' : '#7c3aed';
        ctx.font = '13px -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`tw=${tw}`, x0 + bx + 8, y0 + twPx / 2 + 4);
    }

    // 圖例
    const legendY = H - 20;
    ctx.font = '13px -apple-system, sans-serif';
    ctx.textAlign = 'left';

    ctx.fillStyle = isDark ? 'rgba(167, 139, 250, 0.4)' : 'rgba(124, 58, 237, 0.25)';
    ctx.fillRect(margin, legendY - 10, 14, 14);
    ctx.fillStyle = isDark ? '#c4b5fd' : '#7c3aed';
    ctx.fillText('鋼管', margin + 18, legendY + 1);

    ctx.fillStyle = isDark ? 'rgba(96, 165, 250, 0.12)' : 'rgba(37, 99, 235, 0.08)';
    ctx.fillRect(margin + 70, legendY - 10, 14, 14);
    ctx.strokeStyle = isDark ? 'rgba(96, 165, 250, 0.5)' : 'rgba(37, 99, 235, 0.4)';
    ctx.strokeRect(margin + 70, legendY - 10, 14, 14);
    ctx.fillStyle = isDark ? '#93c5fd' : '#2563eb';
    ctx.fillText('混凝土', margin + 88, legendY + 1);

    // 十字中心線
    ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.3)' : 'rgba(100, 116, 139, 0.2)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, y0 - 10); ctx.lineTo(cx, y0 + by + 10);
    ctx.moveTo(x0 - 10, cy); ctx.lineTo(x0 + bx + 10, cy);
    ctx.stroke();
    ctx.setLineDash([]);
}

// 水平尺寸線
function drawDimLine(ctx, x1, y, x2, y2, label, isDark) {
    ctx.strokeStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y - 6); ctx.lineTo(x1, y + 6);
    ctx.moveTo(x2, y - 6); ctx.lineTo(x2, y + 6);
    ctx.moveTo(x1, y); ctx.lineTo(x2, y);
    ctx.stroke();
    // 箭頭
    ctx.beginPath(); ctx.moveTo(x1 + 6, y - 3); ctx.lineTo(x1, y); ctx.lineTo(x1 + 6, y + 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2 - 6, y - 3); ctx.lineTo(x2, y); ctx.lineTo(x2 - 6, y + 3); ctx.stroke();
    ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
    ctx.font = '14px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, (x1 + x2) / 2, y + 18);
}

// 垂直尺寸線
function drawDimLineV(ctx, x, y1, x2, y2, label, isDark) {
    ctx.strokeStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 6, y1); ctx.lineTo(x + 6, y1);
    ctx.moveTo(x - 6, y2); ctx.lineTo(x + 6, y2);
    ctx.moveTo(x, y1); ctx.lineTo(x, y2);
    ctx.stroke();
    // 箭頭
    ctx.beginPath(); ctx.moveTo(x - 3, y1 + 6); ctx.lineTo(x, y1); ctx.lineTo(x + 3, y1 + 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 3, y2 - 6); ctx.lineTo(x, y2); ctx.lineTo(x + 3, y2 - 6); ctx.stroke();
    ctx.save();
    ctx.translate(x - 16, (y1 + y2) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
    ctx.font = '14px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 0, 0);
    ctx.restore();
}

// ============================================
//  Canvas 繪圖 - P-M 交互作用 (placeholder)
// ============================================
function drawCftPMPlaceholder() {
    const canvas = document.getElementById('cftPMCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '17px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('點擊「計算強度檢核」繪製 P-M 交互作用圖', W / 2, H / 2);
}

// ============================================
//  Canvas 文字工具 - 支援下標繪製
//  segments: [{ t: '主文字', sub: '下標' }, ...]
// ============================================
function drawSubText(ctx, x, y, segments, fontSize) {
    const mainFont = `${fontSize}px -apple-system, sans-serif`;
    const subFont = `${Math.round(fontSize * 0.7)}px -apple-system, sans-serif`;
    let cx = x;
    for (const seg of segments) {
        // 主文字
        ctx.font = mainFont;
        ctx.textAlign = 'left';
        ctx.fillText(seg.t, cx, y);
        cx += ctx.measureText(seg.t).width;
        // 下標
        if (seg.sub) {
            ctx.font = subFont;
            ctx.fillText(seg.sub, cx, y + fontSize * 0.3);
            cx += ctx.measureText(seg.sub).width;
        }
    }
}

function measureSubText(ctx, segments, fontSize) {
    const mainFont = `${fontSize}px -apple-system, sans-serif`;
    const subFont = `${Math.round(fontSize * 0.7)}px -apple-system, sans-serif`;
    let w = 0;
    for (const seg of segments) {
        ctx.font = mainFont;
        w += ctx.measureText(seg.t).width;
        if (seg.sub) {
            ctx.font = subFont;
            w += ctx.measureText(seg.sub).width;
        }
    }
    return w;
}

// ============================================
//  Canvas 繪圖 - P-M 交互作用圖
// ============================================
function drawCftPMChart(r) {
    const canvas = document.getElementById('cftPMCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    ctx.clearRect(0, 0, W, H);

    const { buck, mom, inter, inp } = r;
    const phiPn = buck.phiPn;
    const phiMn = mom.phiMn;

    if (phiPn <= 0 || phiMn <= 0) { drawCftPMPlaceholder(); return; }

    // 繪圖區域
    const pad = { l: 80, r: 30, t: 30, b: 50 };
    const gW = W - pad.l - pad.r;
    const gH = H - pad.t - pad.b;

    // 軸最大值：考慮所有載重點，以 1000 為單位取整上限
    let maxP = phiPn * 1.1;
    let maxM = phiMn * 1.2;
    cftLoadData.forEach(d => {
        if (d.Pu > maxP) maxP = d.Pu * 1.1;
        if (d.Mu > maxM) maxM = d.Mu * 1.1;
    });
    const Pmax = Math.ceil(maxP / 1000) * 1000;
    const Mmax = Math.ceil(maxM / 1000) * 1000;

    const toX = (m) => pad.l + (m / Mmax) * gW;
    const toY = (p) => pad.t + gH - (p / Pmax) * gH;

    // 以 1000 為刻度間距的格線
    const pTickCount = Pmax / 1000;
    const mTickCount = Mmax / 1000;

    ctx.strokeStyle = isDark ? 'rgba(148,163,184,0.15)' : 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= pTickCount; i++) {
        const y = toY(i * 1000);
        ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + gW, y); ctx.stroke();
    }
    for (let i = 0; i <= mTickCount; i++) {
        const x = toX(i * 1000);
        ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, pad.t + gH); ctx.stroke();
    }

    // 軸線
    ctx.strokeStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + gH); ctx.lineTo(pad.l + gW, pad.t + gH);
    ctx.stroke();

    // 軸標籤
    ctx.fillStyle = isDark ? '#cbd5e1' : '#475569';
    ctx.font = '14px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('M (tf-m)', pad.l + gW / 2, H - 8);

    ctx.save();
    ctx.translate(16, pad.t + gH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('P (tf)', 0, 0);
    ctx.restore();

    // 軸刻度 (每 1000 一格)
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    for (let i = 0; i <= pTickCount; i++) {
        const pVal = i * 1000;
        ctx.textAlign = 'right';
        ctx.fillText(pVal.toLocaleString(), pad.l - 8, toY(pVal) + 4);
    }
    for (let i = 0; i <= mTickCount; i++) {
        const mVal = i * 1000;
        ctx.textAlign = 'center';
        ctx.fillText(mVal.toLocaleString(), toX(mVal), pad.t + gH + 18);
    }

    // AISC 雙線性邊界曲線
    // 點 A: (M=0, P=φcPn)
    // 點 B: (MB, 0.2·φcPn) → H1-1a 與 H1-1b 交界
    // 點 C: (φbMn, P=0)
    const PA = phiPn;
    const PB = 0.2 * phiPn;
    const MB = (9 / 8) * phiMn * (1 - PB / phiPn);
    const MC = phiMn;

    ctx.strokeStyle = isDark ? '#60a5fa' : '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(PA));
    ctx.lineTo(toX(MB), toY(PB));
    ctx.lineTo(toX(MC), toY(0));
    ctx.stroke();

    // 填充邊界內區域
    ctx.fillStyle = isDark ? 'rgba(96, 165, 250, 0.08)' : 'rgba(37, 99, 235, 0.05)';
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(PA));
    ctx.lineTo(toX(MB), toY(PB));
    ctx.lineTo(toX(MC), toY(0));
    ctx.lineTo(toX(0), toY(0));
    ctx.closePath();
    ctx.fill();

    // φcPn 標示線
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = isDark ? 'rgba(148,163,184,0.3)' : 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, toY(phiPn)); ctx.lineTo(pad.l + gW, toY(phiPn));
    ctx.stroke();

    // φbMn 標示線
    ctx.beginPath();
    ctx.moveTo(toX(phiMn), pad.t); ctx.lineTo(toX(phiMn), pad.t + gH);
    ctx.stroke();

    // 0.2φcPn 標示線
    ctx.beginPath();
    ctx.moveTo(pad.l, toY(PB)); ctx.lineTo(toX(MB), toY(PB));
    ctx.stroke();
    ctx.setLineDash([]);

    // 標示文字 φcPn
    ctx.fillStyle = isDark ? '#60a5fa' : '#2563eb';
    ctx.textAlign = 'left';
    drawSubText(ctx, pad.l + 4, toY(phiPn) - 5, [
        { t: 'φ', sub: 'c' }, { t: 'P', sub: 'n' }, { t: ` = ${Math.round(phiPn)}` }
    ], 13);

    // 標示文字 φbMn
    ctx.textAlign = 'center';
    const phiMnLabel = [
        { t: 'φ', sub: 'b' }, { t: 'M', sub: 'n' }, { t: ` = ${Math.round(phiMn)}` }
    ];
    const phiMnW = measureSubText(ctx, phiMnLabel, 13);
    const phiMnX = toX(phiMn) - phiMnW / 2;
    drawSubText(ctx, phiMnX, pad.t - 5 > 12 ? pad.t - 5 : pad.t + 14, phiMnLabel, 13);

    // 轉折點 B 標示 (0.2φcPn, MB)
    ctx.fillStyle = isDark ? '#60a5fa' : '#2563eb';
    ctx.beginPath();
    ctx.arc(toX(MB), toY(PB), 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`(${Math.round(MB)}, ${Math.round(PB)})`, toX(MB) + 6, toY(PB) - 8);

    // 0.2φcPn 文字 (放在圖表內，靠近虛線右端)
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    const pbLabel = [
        { t: '0.2' }, { t: 'φ', sub: 'c' }, { t: 'P', sub: 'n' }, { t: ` = ${Math.round(PB)}` }
    ];
    const pbLabelW = measureSubText(ctx, pbLabel, 12);
    drawSubText(ctx, toX(MB) - pbLabelW - 6, toY(PB) - 6, pbLabel, 12);

    // P-M 交互作用判定函式 (用於每個載重點)
    function checkPM(Pu, Mu) {
        const rP = phiPn > 0 ? Pu / phiPn : 0;
        const rM = phiMn > 0 ? Mu / phiMn : 0;
        let val;
        if (rP >= 0.2) {
            val = rP + (8 / 9) * rM;
        } else {
            val = rP / 2 + rM;
        }
        return val <= 1.0;
    }

    // 繪製所有載重點 (cftLoadData)，並存座標供 hover 用
    let allOK = true;
    cftChartPoints = []; // 重置

    const points = cftLoadData.length > 0 ? cftLoadData : [];

    // 若 loadData 為空，至少畫輸入欄的值
    if (points.length === 0 && (inp.Pu !== 0 || inp.Mux !== 0)) {
        const ok = checkPM(inp.Pu, inp.Mux);
        if (!ok) allOK = false;
        const dx = toX(inp.Mux), dy = toY(inp.Pu);
        if (dx >= pad.l && dx <= pad.l + gW && dy >= pad.t && dy <= pad.t + gH) {
            ctx.fillStyle = ok ? (isDark ? '#34d399' : '#059669') : (isDark ? '#f87171' : '#dc2626');
            ctx.beginPath(); ctx.arc(dx, dy, 3, 0, Math.PI * 2); ctx.fill();
            cftChartPoints.push({ sx: dx, sy: dy, label: `P=${inp.Pu}, M=${inp.Mux}`, ok });
        }
    }

    points.forEach((item) => {
        const ok = checkPM(item.Pu, item.Mu);
        if (!ok) allOK = false;
        const dx = toX(item.Mu), dy = toY(item.Pu);
        if (dx >= pad.l && dx <= pad.l + gW && dy >= pad.t && dy <= pad.t + gH) {
            ctx.fillStyle = ok ? (isDark ? '#34d399' : '#059669') : (isDark ? '#f87171' : '#dc2626');
            ctx.beginPath(); ctx.arc(dx, dy, 3, 0, Math.PI * 2); ctx.fill();
            cftChartPoints.push({ sx: dx, sy: dy, label: `No.${item.no}  P=${item.Pu}, M=${item.Mu}`, ok });
        }
    });

    // 整體判定
    if (points.length > 0 || inp.Pu !== 0 || inp.Mux !== 0) {
        ctx.font = 'bold 16px -apple-system, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillStyle = allOK ? (isDark ? '#34d399' : '#059669') : (isDark ? '#f87171' : '#dc2626');
        ctx.fillText(allOK ? 'ALL OK ✓' : 'NG ✗', pad.l + gW - 10, pad.t + 22);
    }

}
