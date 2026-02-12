// 複合柱強度檢核 - 前端互動邏輯
document.addEventListener('DOMContentLoaded', () => {

    // ===== Tab 切換 =====
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            document.getElementById(`tab${tab.toUpperCase()}`)?.classList.add('active');
        });
    });

    // ===== 鋼筋配置模式切換 =====
    const radioButtons = document.querySelectorAll('input[name="rebarMode"]');
    const uniformPanel = document.getElementById('rebarUniformPanel');
    const customPanel = document.getElementById('rebarCustomPanel');

    radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'uniform') {
                uniformPanel.style.display = 'block';
                customPanel.style.display = 'none';
            } else {
                uniformPanel.style.display = 'none';
                customPanel.style.display = 'block';
            }
        });
    });

    // ===== 按鈕 placeholder 事件 (尚未實作的按鈕) =====
    const buttonActions = {
        'btnModifyRebar': '修改鋼筋',
        'btnDeleteRebar': '刪除鋼筋',
        'btnExportRebar': '匯出鋼筋',
        'btnInitRebar': '初始化鋼筋',
        'btnDrawSection': '繪製斷面',
        'btnPMCurve': '計算 PM-Curve',
        'btnExportPM': '匯出結果',
    };

    Object.entries(buttonActions).forEach(([id, label]) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                console.log(`[TODO] ${label} - 功能尚未實作`);
            });
        }
    });

    // ===== 設計載重管理 =====
    initLoadModule();

    // ===== Ec 自動計算 =====
    function updateEc() {
        const fc = parseFloat(document.getElementById('fc').value) || 0;
        const Ec = Math.round(12000 * Math.sqrt(fc));
        document.getElementById('Ec').value = Ec.toLocaleString('en-US');
    }
    updateEc();
    document.getElementById('fc').addEventListener('input', updateEc);

    // ===== 規範版本切換 =====
    const codeVersionEl = document.getElementById('codeVersion');
    const ryRowEl = document.getElementById('ryRow');
    const steelGradeEl = document.getElementById('steelGrade');

    codeVersionEl.addEventListener('change', () => {
        ryRowEl.style.display = codeVersionEl.value === '2024' ? 'flex' : 'none';
    });

    // Fys 改變時自動建議鋼材種類
    document.getElementById('Fys').addEventListener('input', () => {
        const fys = parseFloat(document.getElementById('Fys').value) || 0;
        if (fys > 4000) steelGradeEl.value = 'SM570';
        else if (fys > 2800) steelGradeEl.value = 'A572';
        else steelGradeEl.value = 'A36';
    });

    // ===== 初始繪製 =====
    drawSectionPlaceholder();
    drawPMCurvePlaceholder();

    // 監聯所有影響斷面圖的輸入
    const sectionInputIds = [
        'sectionB', 'sectionH',
        'steelH', 'steelB', 'steelTw', 'steelTf',
        'cover', 'rebarCountY', 'rebarCountZ'
    ];
    sectionInputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => drawSectionPlaceholder());
        }
    });

    // 監聽下拉選單切換
    ['steelShape', 'rebarSizeUniform', 'stirrupSize'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', () => drawSectionPlaceholder());
        }
    });
});

// ===== 鋼筋號數 → 直徑 (cm) 對照表 =====
const REBAR_DIAMETER = {
    'D10': 0.953, 'D13': 1.27, 'D16': 1.59, 'D19': 1.91,
    'D22': 2.22,  'D25': 2.54, 'D29': 2.87, 'D32': 3.18, 'D36': 3.58,
};

function getRebarDiameter(sizeStr) {
    return REBAR_DIAMETER[sizeStr] || 2.54;
}

// ===== 取得當前鋼骨形狀 =====
function getSteelShape() {
    const el = document.getElementById('steelShape');
    return el ? el.value : 'H';
}

// ===== 取得鋼骨尺寸 (cm) =====
function getSteelDimensions() {
    return {
        H: (parseFloat(document.getElementById('steelH').value) || 400) / 10,
        B: (parseFloat(document.getElementById('steelB').value) || 200) / 10,
        tw: (parseFloat(document.getElementById('steelTw').value) || 8) / 10,
        tf: (parseFloat(document.getElementById('steelTf').value) || 13) / 10,
    };
}

// ===== 繪製 H 型鋼 =====
function drawHShape(ctx, cx, cy, dH, dB, dTw, dTf, fillColor, strokeColor) {
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    // 上翼板
    ctx.fillRect(cx - dB / 2, cy - dH / 2, dB, dTf);
    ctx.strokeRect(cx - dB / 2, cy - dH / 2, dB, dTf);
    // 下翼板
    ctx.fillRect(cx - dB / 2, cy + dH / 2 - dTf, dB, dTf);
    ctx.strokeRect(cx - dB / 2, cy + dH / 2 - dTf, dB, dTf);
    // 腹板
    ctx.fillRect(cx - dTw / 2, cy - dH / 2 + dTf, dTw, dH - 2 * dTf);
    ctx.strokeRect(cx - dTw / 2, cy - dH / 2 + dTf, dTw, dH - 2 * dTf);
}

// ===== 繪製 Double H 型鋼 (兩支 H 型鋼十字交叉：一支腹板垂直，一支腹板水平) =====
function drawDoubleHShape(ctx, cx, cy, dH, dB, dTw, dTf, fillColor, strokeColor) {
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;

    // --- 第一支：腹板垂直 (H 字形，與單 H 相同) ---
    // 上翼板
    ctx.fillRect(cx - dB / 2, cy - dH / 2, dB, dTf);
    ctx.strokeRect(cx - dB / 2, cy - dH / 2, dB, dTf);
    // 下翼板
    ctx.fillRect(cx - dB / 2, cy + dH / 2 - dTf, dB, dTf);
    ctx.strokeRect(cx - dB / 2, cy + dH / 2 - dTf, dB, dTf);
    // 腹板 (垂直)
    ctx.fillRect(cx - dTw / 2, cy - dH / 2 + dTf, dTw, dH - 2 * dTf);
    ctx.strokeRect(cx - dTw / 2, cy - dH / 2 + dTf, dTw, dH - 2 * dTf);

    // --- 第二支：腹板水平 (工 字形，將 H 旋轉 90 度) ---
    // 尺寸對調：旋轉後高度方向用 B，寬度方向用 H
    // 左翼板 (原上翼板旋轉 90 度)
    ctx.fillRect(cx - dH / 2, cy - dB / 2, dTf, dB);
    ctx.strokeRect(cx - dH / 2, cy - dB / 2, dTf, dB);
    // 右翼板 (原下翼板旋轉 90 度)
    ctx.fillRect(cx + dH / 2 - dTf, cy - dB / 2, dTf, dB);
    ctx.strokeRect(cx + dH / 2 - dTf, cy - dB / 2, dTf, dB);
    // 腹板 (水平)
    ctx.fillRect(cx - dH / 2 + dTf, cy - dTw / 2, dH - 2 * dTf, dTw);
    ctx.strokeRect(cx - dH / 2 + dTf, cy - dTw / 2, dH - 2 * dTf, dTw);
}

// ===== 繪製 Box 型鋼 =====
function drawBoxShape(ctx, cx, cy, dH, dB, dTw, dTf, fillColor, strokeColor) {
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    // 上翼板
    ctx.fillRect(cx - dB / 2, cy - dH / 2, dB, dTf);
    ctx.strokeRect(cx - dB / 2, cy - dH / 2, dB, dTf);
    // 下翼板
    ctx.fillRect(cx - dB / 2, cy + dH / 2 - dTf, dB, dTf);
    ctx.strokeRect(cx - dB / 2, cy + dH / 2 - dTf, dB, dTf);
    // 左腹板
    ctx.fillRect(cx - dB / 2, cy - dH / 2 + dTf, dTw, dH - 2 * dTf);
    ctx.strokeRect(cx - dB / 2, cy - dH / 2 + dTf, dTw, dH - 2 * dTf);
    // 右腹板
    ctx.fillRect(cx + dB / 2 - dTw, cy - dH / 2 + dTf, dTw, dH - 2 * dTf);
    ctx.strokeRect(cx + dB / 2 - dTw, cy - dH / 2 + dTf, dTw, dH - 2 * dTf);
}

// ===== 依形狀繪製鋼骨 =====
function drawSteelByShape(ctx, shape, cx, cy, dH, dB, dTw, dTf, fillColor, strokeColor, lineWidth) {
    ctx.lineWidth = lineWidth;
    if (shape === 'DoubleH') {
        drawDoubleHShape(ctx, cx, cy, dH, dB, dTw, dTf, fillColor, strokeColor);
    } else if (shape === 'Box') {
        drawBoxShape(ctx, cx, cy, dH, dB, dTw, dTf, fillColor, strokeColor);
    } else {
        drawHShape(ctx, cx, cy, dH, dB, dTw, dTf, fillColor, strokeColor);
    }
}

// ===== 取得鋼骨圖例文字 =====
function getSteelLegendText(shape) {
    const labels = { 'H': 'H型鋼', 'DoubleH': 'Double H型鋼', 'Box': 'Box型鋼' };
    return labels[shape] || 'H型鋼';
}

// ===== 繪製斷面配置圖 =====
function drawSectionPlaceholder() {
    const canvas = document.getElementById('sectionCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bgColor = isDark ? '#1a2332' : '#fafbfc';
    const axisColor = isDark ? '#94a3b8' : '#64748b';
    const rcColor = isDark ? '#3b82f6' : '#2563eb';
    const steelColor = isDark ? '#a78bfa' : '#7c3aed';
    const steelFill = isDark ? 'rgba(167, 139, 250, 0.2)' : 'rgba(124, 58, 237, 0.1)';
    const rebarColor = isDark ? '#fbbf24' : '#d97706';
    const textColor = isDark ? '#cbd5e1' : '#475569';

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    // 取得斷面尺寸
    const B = parseFloat(document.getElementById('sectionB').value) || 80;
    const H = parseFloat(document.getElementById('sectionH').value) || 80;
    const shape = getSteelShape();
    const steel = getSteelDimensions();

    // Double H 十字形：兩方向都有 H 的跨度
    const effectiveB = (shape === 'DoubleH') ? Math.max(B, steel.H) : Math.max(B, steel.B);
    const effectiveH = (shape === 'DoubleH') ? Math.max(H, steel.H) : Math.max(H, steel.H);

    const margin = 60;
    const drawW = w - margin * 2;
    const drawH = h - margin * 2;
    const scale = Math.min(drawW / effectiveB, drawH / effectiveH) * 0.85;

    const cx = w / 2;
    const cy = h / 2;

    // 繪製座標軸
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(margin - 10, cy);
    ctx.lineTo(w - margin + 10, cy);
    ctx.moveTo(cx, margin - 10);
    ctx.lineTo(cx, h - margin + 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // 軸標籤
    ctx.fillStyle = textColor;
    ctx.font = '16px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Y', w - margin + 25, cy + 5);
    ctx.fillText('Z', cx, margin - 20);

    // 繪製 RC 斷面 (矩形)
    const rcW = B * scale;
    const rcH = H * scale;
    const rcX = cx - rcW / 2;
    const rcY = cy - rcH / 2;

    ctx.strokeStyle = rcColor;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(rcX, rcY, rcW, rcH);

    // B, H 標註
    ctx.fillStyle = rcColor;
    ctx.font = 'bold 16px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`B = ${B} cm`, cx, rcY + rcH + 25);
    ctx.save();
    ctx.translate(rcX - 25, cy);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`H = ${H} cm`, 0, 0);
    ctx.restore();

    // 繪製鋼骨
    const shH = steel.H * scale;
    const shB = steel.B * scale;
    const shTw = steel.tw * scale;
    const shTf = steel.tf * scale;

    drawSteelByShape(ctx, shape, cx, cy, shH, shB, shTw, shTf, steelFill, steelColor, 2);

    // ===== 讀取鋼筋 / 箍筋參數 =====
    const cover = parseFloat(document.getElementById('cover').value) || 6;          // 保護層淨間距 (cm)
    const stirrupSizeStr = document.getElementById('stirrupSize')?.value || 'D13';
    const rebarSizeStr = document.getElementById('rebarSizeUniform')?.value || 'D25';
    const stirrupDia = getRebarDiameter(stirrupSizeStr);                           // 箍筋直徑 (cm)
    const rebarDia = getRebarDiameter(rebarSizeStr);                               // 主筋直徑 (cm)
    const rebarCountY = parseInt(document.getElementById('rebarCountY').value) || 4;
    const rebarCountZ = parseInt(document.getElementById('rebarCountZ').value) || 4;

    const stirrupColor = isDark ? '#34d399' : '#059669';

    // ===== 繪製箍筋 =====
    // 箍筋外緣位置 = 混凝土邊 + 保護層淨間距
    // 箍筋中心線位置 = 混凝土邊 + cover + stirrupDia/2
    const stirrupCenterOffset = (cover + stirrupDia / 2) * scale;
    const stirrupThickness = stirrupDia * scale;

    const stX = rcX + stirrupCenterOffset - stirrupThickness / 2;
    const stY = rcY + stirrupCenterOffset - stirrupThickness / 2;
    const stW = rcW - 2 * stirrupCenterOffset + stirrupThickness;
    const stH_draw = rcH - 2 * stirrupCenterOffset + stirrupThickness;

    ctx.strokeStyle = stirrupColor;
    ctx.lineWidth = Math.max(stirrupThickness, 1.5);
    ctx.strokeRect(stX, stY, stW, stH_draw);

    // 繪製 135 度彎鉤示意 (四個角落短斜線)
    const hookLen = 8;
    ctx.lineWidth = Math.max(stirrupThickness * 0.8, 1);
    const corners = [
        [stX, stY, 1, 1],
        [stX + stW, stY, -1, 1],
        [stX + stW, stY + stH_draw, -1, -1],
        [stX, stY + stH_draw, 1, -1],
    ];
    corners.forEach(([x, y, dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx * hookLen, y + dy * hookLen);
        ctx.stroke();
    });

    // ===== 繪製主筋 =====
    // 主筋中心位置 = 混凝土邊 + cover + stirrupDia + rebarDia/2
    const rebarCenterOffset = (cover + stirrupDia + rebarDia / 2) * scale;
    const rebarRadius = (rebarDia / 2) * scale;
    // 確保鋼筋圓圈在畫面上至少有 3px 的半徑可見
    const drawRebarRadius = Math.max(rebarRadius, 3);

    const rebarStartY = rcX + rebarCenterOffset;
    const rebarEndY = rcX + rcW - rebarCenterOffset;
    const rebarStartZ = rcY + rebarCenterOffset;
    const rebarEndZ = rcY + rcH - rebarCenterOffset;

    ctx.fillStyle = rebarColor;
    ctx.strokeStyle = isDark ? '#b45309' : '#92400e';
    ctx.lineWidth = 1;
    for (let i = 0; i < rebarCountZ; i++) {
        for (let j = 0; j < rebarCountY; j++) {
            // 只畫邊上的鋼筋
            if (i > 0 && i < rebarCountZ - 1 && j > 0 && j < rebarCountY - 1) continue;
            const ry = (rebarCountY > 1)
                ? rebarStartY + (rebarEndY - rebarStartY) * j / (rebarCountY - 1)
                : (rebarStartY + rebarEndY) / 2;
            const rz = (rebarCountZ > 1)
                ? rebarStartZ + (rebarEndZ - rebarStartZ) * i / (rebarCountZ - 1)
                : (rebarStartZ + rebarEndZ) / 2;
            ctx.beginPath();
            ctx.arc(ry, rz, drawRebarRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
    }

    // ===== 圖例 =====
    const legendX = 15;
    const legendY = h - 70;
    ctx.font = '13px -apple-system, sans-serif';
    ctx.textAlign = 'left';

    // RC 斷面
    ctx.fillStyle = rcColor;
    ctx.fillRect(legendX, legendY, 14, 3);
    ctx.fillStyle = textColor;
    ctx.fillText('RC斷面', legendX + 20, legendY + 5);

    // 鋼骨
    ctx.fillStyle = steelColor;
    ctx.fillRect(legendX, legendY + 16, 14, 3);
    ctx.fillStyle = textColor;
    ctx.fillText(`鋼骨(${getSteelLegendText(shape)})`, legendX + 20, legendY + 21);

    // 箍筋
    ctx.strokeStyle = stirrupColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(legendX, legendY + 30, 14, 8);
    ctx.fillStyle = textColor;
    ctx.fillText(`箍筋(${stirrupSizeStr})`, legendX + 20, legendY + 39);

    // 主筋
    ctx.fillStyle = rebarColor;
    ctx.strokeStyle = isDark ? '#b45309' : '#92400e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(legendX + 7, legendY + 52, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = textColor;
    ctx.fillText(`主筋(${rebarSizeStr})`, legendX + 20, legendY + 55);
}

// ===== 繪製 PM Curve 佔位圖 =====
function drawPMCurvePlaceholder() {
    const canvas = document.getElementById('pmCurveCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bgColor = isDark ? '#1a2332' : '#fafbfc';
    const gridColor = isDark ? '#2d3a4a' : '#e8ecf0';
    const axisColor = isDark ? '#94a3b8' : '#64748b';
    const curveColor = isDark ? '#60a5fa' : '#2563eb';
    const textColor = isDark ? '#cbd5e1' : '#475569';

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    const margin = { top: 40, right: 40, bottom: 50, left: 70 };
    const plotW = w - margin.left - margin.right;
    const plotH = h - margin.top - margin.bottom;

    // 繪製網格
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
        const y = margin.top + plotH * i / 5;
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(w - margin.right, y);
        ctx.stroke();

        const x = margin.left + plotW * i / 5;
        ctx.beginPath();
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, h - margin.bottom);
        ctx.stroke();
    }

    // 繪製座標軸
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, h - margin.bottom);
    ctx.lineTo(w - margin.right, h - margin.bottom);
    ctx.stroke();

    // 軸標籤
    ctx.fillStyle = textColor;
    ctx.font = 'bold 16px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('M (tf-m)', w / 2, h - 10);
    ctx.save();
    ctx.translate(18, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('P (tf)', 0, 0);
    ctx.restore();

    // 繪製示意 PM Curve
    ctx.strokeStyle = curveColor;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();

    const pmCx = margin.left + plotW * 0.5;
    const pmCy = margin.top + plotH * 0.45;
    const pmRx = plotW * 0.4;
    const pmRy = plotH * 0.42;

    for (let angle = 0; angle <= Math.PI * 2; angle += 0.02) {
        const x = pmCx + pmRx * Math.cos(angle) * (0.6 + 0.4 * Math.sin(angle));
        const y = pmCy - pmRy * Math.sin(angle);
        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 提示文字
    ctx.fillStyle = isDark ? 'rgba(148, 163, 184, 0.5)' : 'rgba(100, 116, 139, 0.4)';
    ctx.font = '17px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('點擊「計算 PM-Curve」開始計算', w / 2, h / 2 + 10);
}

// 監聽主題切換，重新繪製 canvas
const observer = new MutationObserver(() => {
    drawSectionPlaceholder();
    drawPMCurvePlaceholder();
});
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

// ===== 斷面性質計算 =====

/** 格式化數值：大數用千分位，小數保留適當位數 */
function formatValue(val, decimals) {
    if (decimals === undefined) {
        if (Math.abs(val) >= 1000) decimals = 2;
        else if (Math.abs(val) >= 1) decimals = 4;
        else decimals = 6;
    }
    return val.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

/** 帶 tooltip 的標籤 (hover 顯示公式) */
function tip(label, formula) {
    if (!formula) return label;
    return `<span class="tip-wrap" data-formula="${formula.replace(/"/g, '&quot;')}">${label}</span>`;
}

/** 初始化全域公式 Tooltip (掛在 body，不受 overflow:hidden 影響) */
(function initFormulaTooltip() {
    const el = document.createElement('div');
    el.id = 'formulaTooltip';
    document.body.appendChild(el);

    document.addEventListener('mouseover', (e) => {
        const wrap = e.target.closest('.tip-wrap[data-formula]');
        if (!wrap) return;
        el.innerHTML = wrap.getAttribute('data-formula');
        el.style.display = 'block';
        const rect = wrap.getBoundingClientRect();
        const tw = el.offsetWidth;
        let left = rect.left + rect.width / 2 - tw / 2;
        if (left < 4) left = 4;
        if (left + tw > window.innerWidth - 4) left = window.innerWidth - 4 - tw;
        el.style.left = left + 'px';
        el.style.top = (rect.top - el.offsetHeight - 8) + 'px';
    });

    document.addEventListener('mouseout', (e) => {
        const wrap = e.target.closest('.tip-wrap[data-formula]');
        if (!wrap) return;
        if (wrap.contains(e.relatedTarget)) return;
        el.style.display = 'none';
    });
})();

/** 計算鋼骨面積 (cm²) */
function calcSteelArea(shape, H, B, tw, tf) {
    if (shape === 'H') {
        return 2 * B * tf + (H - 2 * tf) * tw;
    } else if (shape === 'Box') {
        return 2 * B * tf + 2 * (H - 2 * tf) * tw;
    } else { // DoubleH
        const As1 = 2 * B * tf + (H - 2 * tf) * tw;
        return 2 * As1 - tw * tw;
    }
}

/** 計算鋼骨慣性矩 Iy — 繞 Y 軸 (水平軸，量測垂直距離) (cm⁴) */
function calcSteelIy(shape, H, B, tw, tf) {
    if (shape === 'H') {
        return (B * Math.pow(H, 3) - (B - tw) * Math.pow(H - 2 * tf, 3)) / 12;
    } else if (shape === 'Box') {
        return (B * Math.pow(H, 3) - (B - 2 * tw) * Math.pow(H - 2 * tf, 3)) / 12;
    } else { // DoubleH
        const Iy1 = (B * Math.pow(H, 3) - (B - tw) * Math.pow(H - 2 * tf, 3)) / 12;
        const Iy2 = (2 * tf * Math.pow(B, 3) + (H - 2 * tf) * Math.pow(tw, 3)) / 12;
        const Ioverlap = Math.pow(tw, 4) / 12;
        return Iy1 + Iy2 - Ioverlap;
    }
}

/** 計算鋼骨慣性矩 Iz — 繞 Z 軸 (垂直軸，量測水平距離) (cm⁴) */
function calcSteelIz(shape, H, B, tw, tf) {
    if (shape === 'H') {
        return (2 * tf * Math.pow(B, 3) + (H - 2 * tf) * Math.pow(tw, 3)) / 12;
    } else if (shape === 'Box') {
        return (H * Math.pow(B, 3) - (H - 2 * tf) * Math.pow(B - 2 * tw, 3)) / 12;
    } else { // DoubleH: 與 Iy 相同 (十字對稱)
        return calcSteelIy('DoubleH', H, B, tw, tf);
    }
}

/** 計算鋼骨塑性斷面模數 Zy — 繞 Y 軸 (cm³) */
function calcSteelZy(shape, H, B, tw, tf) {
    if (shape === 'H') {
        return (B * H * H - (B - tw) * Math.pow(H - 2 * tf, 2)) / 4;
    } else if (shape === 'Box') {
        return (B * H * H - (B - 2 * tw) * Math.pow(H - 2 * tf, 2)) / 4;
    } else { // DoubleH
        const Zy1 = (B * H * H - (B - tw) * Math.pow(H - 2 * tf, 2)) / 4;
        const Zy2 = (2 * tf * B * B + (H - 2 * tf) * tw * tw) / 4;
        const Zoverlap = Math.pow(tw, 3) / 4;
        return Zy1 + Zy2 - Zoverlap;
    }
}

/** 計算鋼骨塑性斷面模數 Zz — 繞 Z 軸 (cm³) */
function calcSteelZz(shape, H, B, tw, tf) {
    if (shape === 'H') {
        return (2 * tf * B * B + (H - 2 * tf) * tw * tw) / 4;
    } else if (shape === 'Box') {
        return (H * B * B - (H - 2 * tf) * Math.pow(B - 2 * tw, 2)) / 4;
    } else { // DoubleH: 與 Zy 相同
        return calcSteelZy('DoubleH', H, B, tw, tf);
    }
}

/** 計算鋼筋群慣性矩 (parallel axis theorem) */
function calcRebarInertia(B, H, cover, stirrupDia, rebarDia, countY, countZ) {
    const offset = cover + stirrupDia + rebarDia / 2; // 鋼筋中心到混凝土邊距離
    const Abar = Math.PI * Math.pow(rebarDia, 2) / 4;

    // 鋼筋位置範圍 (以斷面中心為原點)
    const yMin = -(B / 2 - offset);
    const yMax =  (B / 2 - offset);
    const zMin = -(H / 2 - offset);
    const zMax =  (H / 2 - offset);

    let Ist_y = 0; // 繞 Y 軸 (Σ A·z²)
    let Ist_z = 0; // 繞 Z 軸 (Σ A·y²)

    for (let i = 0; i < countZ; i++) {
        for (let j = 0; j < countY; j++) {
            // 只算邊上的鋼筋
            if (i > 0 && i < countZ - 1 && j > 0 && j < countY - 1) continue;
            const yi = (countY > 1) ? yMin + (yMax - yMin) * j / (countY - 1) : 0;
            const zi = (countZ > 1) ? zMin + (zMax - zMin) * i / (countZ - 1) : 0;
            Ist_y += Abar * zi * zi;
            Ist_z += Abar * yi * yi;
        }
    }
    return { Ist_y, Ist_z };
}

/** 計算所有斷面性質 */
function calculateSectionProperties() {
    // RC 斷面尺寸 (cm)
    const B = parseFloat(document.getElementById('sectionB').value) || 80;
    const H = parseFloat(document.getElementById('sectionH').value) || 80;

    // 鋼骨尺寸 (mm → cm)
    const shape = getSteelShape();
    const steel = getSteelDimensions(); // 已轉 cm
    const sH = steel.H, sB = steel.B, sTw = steel.tw, sTf = steel.tf;

    // 鋼筋
    const rebarSizeStr = document.getElementById('rebarSizeUniform')?.value || 'D25';
    const rebarDia = getRebarDiameter(rebarSizeStr);
    const countY = parseInt(document.getElementById('rebarCountY').value) || 4;
    const countZ = parseInt(document.getElementById('rebarCountZ').value) || 4;

    // ===== SRC 全斷面 =====
    const Ag = B * H;
    const Ig_y = B * Math.pow(H, 3) / 12;
    const Ig_z = H * Math.pow(B, 3) / 12;

    // ===== 鋼骨 =====
    const As = calcSteelArea(shape, sH, sB, sTw, sTf);
    const Is_y = calcSteelIy(shape, sH, sB, sTw, sTf);
    const Is_z = calcSteelIz(shape, sH, sB, sTw, sTf);
    const Zs_y = calcSteelZy(shape, sH, sB, sTw, sTf);
    const Zs_z = calcSteelZz(shape, sH, sB, sTw, sTf);
    const Ss_y = Is_y / (sH / 2);
    const Ss_z = (shape === 'DoubleH')
        ? Is_z / (Math.max(sH, sB) / 2)
        : Is_z / (sB / 2);
    const rs_y = Math.sqrt(Is_y / As);
    const rs_z = Math.sqrt(Is_z / As);
    const rho_s = As / Ag;

    // ===== 鋼骨寬厚比 =====
    let lambda_f, lambda_w;
    if (shape === 'H') {
        lambda_f = sB / (2 * sTf);              // 翼板: B/(2·tf)
        lambda_w = (sH - 2 * sTf) / sTw;        // 腹板: (H-2·tf)/tw
    } else if (shape === 'DoubleH') {
        lambda_f = sB / (2 * sTf);              // 翼板: B/(2·tf)
        lambda_w = (sH - 2 * sTf) / (2 * sTw);  // 腹板: (H-2·tf)/(2·tw)，十字交叉腹板互為加勁
    } else { // Box
        lambda_f = (sB - 2 * sTw) / sTf;        // 翼板: (B-2·tw)/tf
        lambda_w = (sH - 2 * sTf) / sTw;        // 腹板: (H-2·tf)/tw
    }

    // ===== 寬厚比檢核 =====
    const codeVer = document.getElementById('codeVersion')?.value || '2011';
    const Fys = parseFloat(document.getElementById('Fys').value) || 3500;
    const Es_val = parseFloat(document.getElementById('Es').value) || 2040000;
    const isHighStrength = Fys > 2800;

    const RY_MAP = { 'A572': 1.1, 'SN490B': 1.2, 'A36': 1.3, 'SM570': 1.1 };
    const GRADE_LABELS = {
        'A572': 'A572 Gr.50', 'SN490B': 'SN490B',
        'A36': 'A36 / SN400', 'SM570': 'SM570',
    };

    let lambda_pd_f, lambda_pd_w, lambda_p_f, lambda_p_w;
    let gradeLabel, seismicLabel;

    if (codeVer === '2024') {
        // ---- 修正草案 (2024) ----
        const gradeKey = document.getElementById('steelGrade')?.value || 'A572';
        const Ry = RY_MAP[gradeKey] || 1.1;
        gradeLabel = `${GRADE_LABELS[gradeKey]} (Ry=${Ry})`;
        seismicLabel = '高等韌性';
        const sqrtTerm = Math.sqrt(Es_val / (Ry * Fys));

        if (shape === 'Box') {
            lambda_pd_f = 1.4 * sqrtTerm;
            lambda_pd_w = lambda_pd_f;
            lambda_p_f = 2.26 * sqrtTerm;
            lambda_p_w = lambda_p_f;
        } else {
            lambda_pd_f = 0.46 * sqrtTerm;
            lambda_pd_w = 1.86 * sqrtTerm;
            lambda_p_f = 0.74 * sqrtTerm;
            lambda_p_w = 3.02 * sqrtTerm;
        }
    } else {
        // ---- 現行規範 (2011) ----
        const Fys_tf = Fys / 1000;
        gradeLabel = isHighStrength ? 'SN490 (A572 Gr.50)' : 'SN400 (A36)';
        seismicLabel = '耐震設計';

        if (shape === 'Box') {
            lambda_pd_f = Math.sqrt(3 * Es_val / Fys);
            lambda_pd_w = lambda_pd_f;
            lambda_p_f = isHighStrength ? 61 : 72;
            lambda_p_w = lambda_p_f;
        } else {
            lambda_pd_f = 21 / Math.sqrt(Fys_tf);
            lambda_pd_w = 123 / Math.sqrt(Fys_tf);
            lambda_p_f = isHighStrength ? 20 : 23;
            lambda_p_w = isHighStrength ? 81 : 96;
        }
    }

    // 個別判定
    const classifyPart = (lam, lpd, lp) => {
        if (lam <= lpd) return 'seismic';
        if (lam <= lp) return 'compact';
        return 'noncompact';
    };
    const flangeClass = classifyPart(lambda_f, lambda_pd_f, lambda_p_f);
    const webClass = classifyPart(lambda_w, lambda_pd_w, lambda_p_w);

    // 整體判定 (取較差的)
    let sectionClass;
    if (flangeClass === 'seismic' && webClass === 'seismic') {
        sectionClass = 'seismic';
    } else if (flangeClass !== 'noncompact' && webClass !== 'noncompact') {
        sectionClass = 'compact';
    } else {
        sectionClass = 'noncompact';
    }

    // ===== 鋼筋 / RC =====
    const cover = parseFloat(document.getElementById('cover').value) || 6;
    const stirrupSizeStr = document.getElementById('stirrupSize')?.value || 'D13';
    const stirrupDia = getRebarDiameter(stirrupSizeStr);

    const totalRebarCount = (countY >= 2 && countZ >= 2)
        ? 2 * countY + 2 * countZ - 4
        : countY * countZ;
    const Abar = Math.PI * Math.pow(rebarDia, 2) / 4;
    const Ast = totalRebarCount * Abar;
    const rho_g = Ast / Ag;
    const Ac = Ag - As - Ast;

    // ===== 鋼筋群慣性矩 =====
    const { Ist_y, Ist_z } = calcRebarInertia(B, H, cover, stirrupDia, rebarDia, countY, countZ);

    // ===== 混凝土淨慣性矩 =====
    const Ic_y = Ig_y - Is_y - Ist_y;
    const Ic_z = Ig_z - Is_z - Ist_z;

    // ===== 剛度計算 =====
    const fc = parseFloat(document.getElementById('fc').value) || 280;
    const Ec_val = 12000 * Math.sqrt(fc);

    // 鋼骨剛度
    const EA_s = Es_val * As;
    const EI_s_y = Es_val * Is_y;
    const EI_s_z = Es_val * Is_z;

    // RC 剛度 (未折減)
    const EA_rc_raw = Ec_val * Ac;
    const EI_rc_y_raw = Ec_val * Ig_y;
    const EI_rc_z_raw = Ec_val * Ig_z;

    // RC 剛度折減 (規範規定)
    const EA_rc = 0.55 * EA_rc_raw;
    const EI_rc_y = 0.35 * EI_rc_y_raw;
    const EI_rc_z = 0.35 * EI_rc_z_raw;

    // 全斷面剛度 (鋼骨 + 折減後 RC)
    const EA_total = EA_s + EA_rc;
    const EI_total_y = EI_s_y + EI_rc_y;
    const EI_total_z = EI_s_z + EI_rc_z;

    // 剛度比
    const EA_s_ratio = EA_s / EA_total;
    const EA_rc_ratio = EA_rc / EA_total;
    const EI_s_y_ratio = EI_s_y / EI_total_y;
    const EI_rc_y_ratio = EI_rc_y / EI_total_y;
    const EI_s_z_ratio = EI_s_z / EI_total_z;
    const EI_rc_z_ratio = EI_rc_z / EI_total_z;

    return {
        // SRC
        Ag, Ig_y, Ig_z,
        // 鋼骨
        shape, As, Is_y, Is_z, Zs_y, Zs_z, Ss_y, Ss_z, rs_y, rs_z, rho_s, lambda_f, lambda_w,
        // 寬厚比檢核
        codeVer, lambda_pd_f, lambda_pd_w, lambda_p_f, lambda_p_w,
        flangeClass, webClass, sectionClass, gradeLabel, seismicLabel,
        // 鋼筋 / RC
        rebarSize: rebarSizeStr, totalRebarCount, Abar, Ast, rho_g, Ac,
        Ist_y, Ist_z, Ic_y, Ic_z,
        // 剛度
        Ec_val, Es_val,
        EA_s, EA_rc, EA_total, EA_s_ratio, EA_rc_ratio,
        EI_s_y, EI_rc_y, EI_total_y, EI_s_y_ratio, EI_rc_y_ratio,
        EI_s_z, EI_rc_z, EI_total_z, EI_s_z_ratio, EI_rc_z_ratio,
        // 原始參數
        B, H, sH, sB, sTw, sTf,
    };
}

/** 寬厚比判定標籤 */
function classLabel(cls, seismicText) {
    if (cls === 'seismic') return `<span class="badge badge-seismic">${seismicText}斷面</span>`;
    if (cls === 'compact') return '<span class="badge badge-compact">結實斷面</span>';
    return '<span class="badge badge-fail">需加大斷面</span>';
}

/** 渲染斷面性質結果 */
function renderSectionProperties(props) {
    const shapeLabels = { 'H': 'H 型', 'DoubleH': 'Double H 型', 'Box': 'Box 型' };
    const shapeLabel = shapeLabels[props.shape] || props.shape;

    const f = formatValue;
    const seismicSub = props.codeVer === '2024' ? 'hd' : 'pd';

    const html = `
    <!-- SRC 全斷面 -->
    <div class="result-section">
        <div class="result-section-title">
            <span class="dot dot-blue"></span>
            SRC 全斷面
        </div>
        <table class="result-table">
            <tr><td>${tip('A<sub>g</sub> (全斷面積)', 'B × D')}</td><td>${f(props.Ag, 2)} cm²</td></tr>
            <tr><td>${tip('I<sub>g,y</sub> (慣性矩, Y軸)', 'BD³ / 12')}</td><td>${f(props.Ig_y, 2)} cm⁴</td></tr>
            <tr><td>${tip('I<sub>g,z</sub> (慣性矩, Z軸)', 'DB³ / 12')}</td><td>${f(props.Ig_z, 2)} cm⁴</td></tr>
        </table>
    </div>

    <!-- 鋼骨斷面 -->
    <div class="result-section">
        <div class="result-section-title">
            <span class="dot dot-purple"></span>
            鋼骨斷面 (${shapeLabel})
        </div>
        <table class="result-table">
            <tr><td>${tip('A<sub>s</sub> (鋼骨面積)')}</td><td>${f(props.As, 2)} cm²</td></tr>
            <tr><td>${tip('I<sub>s,y</sub> (慣性矩, Y軸)')}</td><td>${f(props.Is_y, 2)} cm⁴</td></tr>
            <tr><td>${tip('I<sub>s,z</sub> (慣性矩, Z軸)')}</td><td>${f(props.Is_z, 2)} cm⁴</td></tr>
            <tr><td>${tip('Z<sub>s,y</sub> (塑性斷面模數, Y軸)')}</td><td>${f(props.Zs_y, 2)} cm³</td></tr>
            <tr><td>${tip('Z<sub>s,z</sub> (塑性斷面模數, Z軸)')}</td><td>${f(props.Zs_z, 2)} cm³</td></tr>
            <tr><td>${tip('S<sub>s,y</sub> (彈性斷面模數, Y軸)', 'I<sub>s,y</sub> / (H/2)')}</td><td>${f(props.Ss_y, 2)} cm³</td></tr>
            <tr><td>${tip('S<sub>s,z</sub> (彈性斷面模數, Z軸)', 'I<sub>s,z</sub> / (B/2)')}</td><td>${f(props.Ss_z, 2)} cm³</td></tr>
            <tr><td>${tip('r<sub>s,y</sub> (迴轉半徑, Y軸)', '√(I<sub>s,y</sub> / A<sub>s</sub>)')}</td><td>${f(props.rs_y, 2)} cm</td></tr>
            <tr><td>${tip('r<sub>s,z</sub> (迴轉半徑, Z軸)', '√(I<sub>s,z</sub> / A<sub>s</sub>)')}</td><td>${f(props.rs_z, 2)} cm</td></tr>
            <tr><td>${tip('ρ<sub>s</sub> (鋼骨比)', 'A<sub>s</sub> / A<sub>g</sub>')}</td><td>${(props.rho_s * 100).toFixed(2)} %</td></tr>
        </table>
    </div>

    <!-- 寬厚比檢核 -->
    <div class="result-section">
        <div class="result-section-title">
            <span class="dot dot-green"></span>
            寬厚比檢核 — ${props.codeVer === '2024' ? '修正草案 (2024)' : '現行規範 (2011)'}
        </div>
        <table class="result-table">
            <tr><td>鋼材種類</td><td>${props.gradeLabel}</td></tr>
            <tr><td>${tip('翼板 λ<sub>f</sub>', 'b / t<sub>f</sub>')}</td><td>${f(props.lambda_f, 2)}</td></tr>
            <tr><td>　${tip('λ<sub>' + seismicSub + '</sub> (' + props.seismicLabel + ')')}</td><td>${f(props.lambda_pd_f, 2)}</td></tr>
            <tr><td>　${tip('λ<sub>p</sub> (結實)')}</td><td>${f(props.lambda_p_f, 2)}</td></tr>
            <tr><td>　翼板判定</td><td>${classLabel(props.flangeClass, props.seismicLabel)}</td></tr>
            <tr><td>${tip('腹板 λ<sub>w</sub>', 'h<sub>c</sub> / t<sub>w</sub>')}</td><td>${f(props.lambda_w, 2)}</td></tr>
            <tr><td>　${tip('λ<sub>' + seismicSub + '</sub> (' + props.seismicLabel + ')')}</td><td>${f(props.lambda_pd_w, 2)}</td></tr>
            <tr><td>　${tip('λ<sub>p</sub> (結實)')}</td><td>${f(props.lambda_p_w, 2)}</td></tr>
            <tr><td>　腹板判定</td><td>${classLabel(props.webClass, props.seismicLabel)}</td></tr>
            <tr class="result-verdict"><td>斷面判定</td><td>${classLabel(props.sectionClass, props.seismicLabel)}</td></tr>
        </table>
    </div>

    <!-- 鋼筋 / RC -->
    <div class="result-section">
        <div class="result-section-title">
            <span class="dot dot-orange"></span>
            鋼筋 / RC
        </div>
        <table class="result-table">
            <tr><td>主筋號數</td><td>${props.rebarSize}</td></tr>
            <tr><td>主筋總支數</td><td>${props.totalRebarCount} 支</td></tr>
            <tr><td>${tip('A<sub>b</sub> (單根面積)')}</td><td>${f(props.Abar, 4)} cm²</td></tr>
            <tr><td>${tip('A<sub>st</sub> (主筋總面積)', 'n · A<sub>b</sub>')}</td><td>${f(props.Ast, 2)} cm²</td></tr>
            <tr><td>${tip('ρ<sub>g</sub> (主筋比)', 'A<sub>st</sub> / A<sub>g</sub>')}</td><td>${(props.rho_g * 100).toFixed(2)} %</td></tr>
            <tr><td>${tip('I<sub>st,y</sub> (鋼筋慣性矩, Y軸)', 'Σ A<sub>b</sub> · d<sub>i</sub>²')}</td><td>${f(props.Ist_y, 2)} cm⁴</td></tr>
            <tr><td>${tip('I<sub>st,z</sub> (鋼筋慣性矩, Z軸)', 'Σ A<sub>b</sub> · d<sub>i</sub>²')}</td><td>${f(props.Ist_z, 2)} cm⁴</td></tr>
            <tr><td>${tip('A<sub>c</sub> (淨混凝土面積)', 'A<sub>g</sub> − A<sub>s</sub> − A<sub>st</sub>')}</td><td>${f(props.Ac, 2)} cm²</td></tr>
            <tr><td>${tip('I<sub>c,y</sub> (混凝土慣性矩, Y軸)', 'I<sub>g,y</sub> − I<sub>s,y</sub> − I<sub>st,y</sub>')}</td><td>${f(props.Ic_y, 2)} cm⁴</td></tr>
            <tr><td>${tip('I<sub>c,z</sub> (混凝土慣性矩, Z軸)', 'I<sub>g,z</sub> − I<sub>s,z</sub> − I<sub>st,z</sub>')}</td><td>${f(props.Ic_z, 2)} cm⁴</td></tr>
        </table>
    </div>

    <!-- 剛度與比例 -->
    <div class="result-section">
        <div class="result-section-title">
            <span class="dot dot-cyan"></span>
            剛度 EA / EI <span class="badge badge-info">RC 已折減</span>
        </div>
        <table class="result-table">
            <tr class="result-subheader"><td colspan="2">軸向剛度 EA (kgf)</td></tr>
            <tr><td>${tip('鋼骨 EA<sub>s</sub>', 'E<sub>s</sub> · A<sub>s</sub>')}</td><td>${f(props.EA_s, 0)}</td></tr>
            <tr><td>${tip('RC　 0.55·E<sub>c</sub>·A<sub>c</sub>', '0.55 × E<sub>c</sub> × A<sub>c</sub>')}</td><td>${f(props.EA_rc, 0)}</td></tr>
            <tr><td>合計 EA</td><td>${f(props.EA_total, 0)}</td></tr>
            <tr class="result-ratio"><td>鋼骨占比</td><td><span class="ratio-bar"><span class="ratio-fill ratio-steel" style="width:${(props.EA_s_ratio*100).toFixed(1)}%"></span></span>${(props.EA_s_ratio*100).toFixed(1)}%</td></tr>
            <tr class="result-ratio"><td>RC 占比</td><td><span class="ratio-bar"><span class="ratio-fill ratio-rc" style="width:${(props.EA_rc_ratio*100).toFixed(1)}%"></span></span>${(props.EA_rc_ratio*100).toFixed(1)}%</td></tr>

            <tr class="result-subheader"><td colspan="2">撓曲剛度 EI<sub>y</sub> (kgf-cm²)</td></tr>
            <tr><td>${tip('鋼骨 EI<sub>s,y</sub>', 'E<sub>s</sub> · I<sub>s,y</sub>')}</td><td>${f(props.EI_s_y, 0)}</td></tr>
            <tr><td>${tip('RC　 0.35·E<sub>c</sub>·I<sub>g,y</sub>', '0.35 × E<sub>c</sub> × I<sub>g,y</sub>')}</td><td>${f(props.EI_rc_y, 0)}</td></tr>
            <tr><td>合計 EI<sub>y</sub></td><td>${f(props.EI_total_y, 0)}</td></tr>
            <tr class="result-ratio"><td>鋼骨占比</td><td><span class="ratio-bar"><span class="ratio-fill ratio-steel" style="width:${(props.EI_s_y_ratio*100).toFixed(1)}%"></span></span>${(props.EI_s_y_ratio*100).toFixed(1)}%</td></tr>
            <tr class="result-ratio"><td>RC 占比</td><td><span class="ratio-bar"><span class="ratio-fill ratio-rc" style="width:${(props.EI_rc_y_ratio*100).toFixed(1)}%"></span></span>${(props.EI_rc_y_ratio*100).toFixed(1)}%</td></tr>

            <tr class="result-subheader"><td colspan="2">撓曲剛度 EI<sub>z</sub> (kgf-cm²)</td></tr>
            <tr><td>${tip('鋼骨 EI<sub>s,z</sub>', 'E<sub>s</sub> · I<sub>s,z</sub>')}</td><td>${f(props.EI_s_z, 0)}</td></tr>
            <tr><td>${tip('RC　 0.35·E<sub>c</sub>·I<sub>g,z</sub>', '0.35 × E<sub>c</sub> × I<sub>g,z</sub>')}</td><td>${f(props.EI_rc_z, 0)}</td></tr>
            <tr><td>合計 EI<sub>z</sub></td><td>${f(props.EI_total_z, 0)}</td></tr>
            <tr class="result-ratio"><td>鋼骨占比</td><td><span class="ratio-bar"><span class="ratio-fill ratio-steel" style="width:${(props.EI_s_z_ratio*100).toFixed(1)}%"></span></span>${(props.EI_s_z_ratio*100).toFixed(1)}%</td></tr>
            <tr class="result-ratio"><td>RC 占比</td><td><span class="ratio-bar"><span class="ratio-fill ratio-rc" style="width:${(props.EI_rc_z_ratio*100).toFixed(1)}%"></span></span>${(props.EI_rc_z_ratio*100).toFixed(1)}%</td></tr>
        </table>
    </div>`;

    const resultContent = document.getElementById('resultContent');
    const resultPlaceholder = document.getElementById('resultPlaceholder');

    resultContent.innerHTML = html;
    resultContent.style.display = 'flex';
    resultPlaceholder.style.display = 'none';
}

// ===== 計算斷面性質按鈕事件 =====
document.getElementById('btnCalcProps')?.addEventListener('click', () => {
    const props = calculateSectionProperties();
    renderSectionProperties(props);
});

// ===== 設計載重模組 =====
let loadData = [];

function renderLoadList() {
    const listEl = document.getElementById('loadList');
    if (!listEl) return;

    if (loadData.length === 0) {
        listEl.innerHTML = '<div class="load-list-empty">尚未輸入載重</div>';
        return;
    }

    let html = `<div class="load-item load-item-header">
        <span class="load-col-no">No.</span>
        <span class="load-col-val">Pu (tf)</span>
        <span class="load-col-val">Muy (tf-m)</span>
        <span class="load-col-del"></span>
    </div>`;

    loadData.forEach((item, idx) => {
        html += `<div class="load-item${idx % 2 === 1 ? ' load-item-alt' : ''}">
            <span class="load-col-no">${item.no}</span>
            <span class="load-col-val">${item.Pu}</span>
            <span class="load-col-val">${item.Muy}</span>
            <button class="load-del-btn" data-idx="${idx}" title="刪除">&times;</button>
        </div>`;
    });

    listEl.innerHTML = html;

    // 綁定刪除按鈕
    listEl.querySelectorAll('.load-del-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.idx);
            loadData.splice(idx, 1);
            renderLoadList();
        });
    });
}

function initLoadModule() {
    const loadNoEl = document.getElementById('loadNo');
    const loadPuEl = document.getElementById('loadPu');
    const loadMuyEl = document.getElementById('loadMuy');

    // ===== 輸入載重 =====
    document.getElementById('btnInputLoad')?.addEventListener('click', () => {
        const no = parseInt(loadNoEl.value) || (loadData.length + 1);
        const Pu = parseFloat(loadPuEl.value) || 0;
        const Muy = parseFloat(loadMuyEl.value) || 0;

        loadData.push({ no, Pu, Muy });
        renderLoadList();

        // 自動遞增編號，清空數值
        loadNoEl.value = no + 1;
        loadPuEl.value = 0;
        loadMuyEl.value = 0;
        loadPuEl.focus();
    });

    // ===== 初始化載重 =====
    document.getElementById('btnInitLoad')?.addEventListener('click', () => {
        loadData = [];
        renderLoadList();
        loadNoEl.value = 1;
        loadPuEl.value = 0;
        loadMuyEl.value = 0;
    });

    // ===== 建立表單 (Modal) =====
    const modal = document.getElementById('loadTableModal');
    const modalBody = document.getElementById('modalTableBody');
    const btnAddRow = document.getElementById('modalAddRow');
    const btnConfirm = document.getElementById('modalConfirm');
    const btnCancel = document.getElementById('modalCancel');
    function getNextNo() {
        if (loadData.length === 0) return 1;
        return Math.max(...loadData.map(d => d.no)) + 1;
    }

    function createModalRows(count, startNo) {
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `<tr>
                <td><input type="number" class="modal-input modal-no" value="${startNo + i}"></td>
                <td><input type="number" class="modal-input modal-pu" value="0"></td>
                <td><input type="number" class="modal-input modal-muy" value="0"></td>
                <td><button class="modal-row-del" title="刪除列">&times;</button></td>
            </tr>`;
        }
        return html;
    }

    function bindModalRowDel() {
        modalBody.querySelectorAll('.modal-row-del').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('tr').remove();
            });
        });
    }

    document.getElementById('btnCreateTable')?.addEventListener('click', () => {
        const startNo = getNextNo();
        modalBody.innerHTML = createModalRows(5, startNo);
        bindModalRowDel();
        modal.classList.add('active');
    });

    btnAddRow?.addEventListener('click', () => {
        // 根據最後一行的編號 +1
        const rows = modalBody.querySelectorAll('tr');
        let nextNo = getNextNo();
        if (rows.length > 0) {
            const lastNoInput = rows[rows.length - 1].querySelector('.modal-no');
            nextNo = (parseInt(lastNoInput.value) || 0) + 1;
        }
        modalBody.insertAdjacentHTML('beforeend', createModalRows(1, nextNo));
        // 重新綁定新加的列
        const newRow = modalBody.querySelector('tr:last-child .modal-row-del');
        newRow?.addEventListener('click', (e) => e.target.closest('tr').remove());
    });

    btnConfirm?.addEventListener('click', () => {
        const rows = modalBody.querySelectorAll('tr');
        rows.forEach(row => {
            const no = parseInt(row.querySelector('.modal-no').value) || 0;
            const Pu = parseFloat(row.querySelector('.modal-pu').value) || 0;
            const Muy = parseFloat(row.querySelector('.modal-muy').value) || 0;
            if (no > 0) {
                loadData.push({ no, Pu, Muy });
            }
        });
        renderLoadList();
        modal.classList.remove('active');

        // 更新輸入欄的編號
        loadNoEl.value = getNextNo();
    });

    btnCancel?.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    document.getElementById('modalCancelBtn')?.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // 點遮罩關閉
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // ===== 匯入載重 (文字格式 Modal) =====
    const importModal = document.getElementById('loadImportModal');
    const importTextarea = document.getElementById('importTextarea');

    document.getElementById('btnImportTable')?.addEventListener('click', () => {
        importTextarea.value = '';
        importModal.classList.add('active');
        importTextarea.focus();
    });

    document.getElementById('importConfirm')?.addEventListener('click', () => {
        const text = importTextarea.value.trim();
        if (!text) { importModal.classList.remove('active'); return; }

        let startNo = getNextNo();
        const lines = text.split('\n');
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;
            // 支援逗號、空白、tab 分隔
            const parts = trimmed.split(/[,\s\t]+/);
            if (parts.length >= 2) {
                const Pu = parseFloat(parts[0]);
                const Muy = parseFloat(parts[1]);
                if (!isNaN(Pu) && !isNaN(Muy)) {
                    loadData.push({ no: startNo++, Pu, Muy });
                }
            }
        });

        renderLoadList();
        importModal.classList.remove('active');
        loadNoEl.value = getNextNo();
    });

    document.getElementById('importCancel')?.addEventListener('click', () => {
        importModal.classList.remove('active');
    });

    document.getElementById('importCancelBtn')?.addEventListener('click', () => {
        importModal.classList.remove('active');
    });

    importModal?.addEventListener('click', (e) => {
        if (e.target === importModal) importModal.classList.remove('active');
    });
}
