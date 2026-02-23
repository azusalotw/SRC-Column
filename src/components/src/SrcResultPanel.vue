<script setup lang="ts">
import { computed } from 'vue'
import { useSrcStore } from '@/stores/src'
import { formatValue } from '@/utils/format'
import { tip } from '@/utils/tooltip'
import { classLabel } from '@/utils/format'
import BaseCard from '@/components/shared/BaseCard.vue'

const store = useSrcStore()
const props = computed(() => store.sectionProps)
const f = formatValue
</script>

<template>
  <BaseCard title="斷面性質" iconClass="icon-result">
    <template #icon>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    </template>

    <div v-if="!props" class="result-placeholder">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
      <p>點擊「計算斷面性質」查看結果</p>
    </div>

    <div v-else class="result-content">
      <!-- SRC 全斷面 -->
      <div class="result-section">
        <div class="result-section-title"><span class="dot dot-blue"></span>SRC 全斷面</div>
        <table class="result-table">
          <tr><td v-html="tip('A<sub>g</sub> (全斷面積)', 'B × D')"></td><td>{{ f(props.Ag, 2) }} cm²</td></tr>
          <tr><td v-html="tip('I<sub>g,y</sub> (慣性矩, Y軸)', 'BD³ / 12')"></td><td>{{ f(props.Ig_y, 2) }} cm⁴</td></tr>
          <tr><td v-html="tip('I<sub>g,z</sub> (慣性矩, Z軸)', 'DB³ / 12')"></td><td>{{ f(props.Ig_z, 2) }} cm⁴</td></tr>
        </table>
      </div>

      <!-- 鋼骨斷面 -->
      <div class="result-section">
        <div class="result-section-title">
          <span class="dot dot-purple"></span>
          鋼骨斷面 ({{ { 'H': 'H 型', 'DoubleH': 'Double H 型', 'Box': 'Box 型' }[props.shape] }})
        </div>
        <table class="result-table">
          <tr><td v-html="tip('A<sub>s</sub> (鋼骨面積)')"></td><td>{{ f(props.As, 2) }} cm²</td></tr>
          <tr><td v-html="tip('I<sub>s,y</sub> (慣性矩, Y軸)')"></td><td>{{ f(props.Is_y, 2) }} cm⁴</td></tr>
          <tr><td v-html="tip('I<sub>s,z</sub> (慣性矩, Z軸)')"></td><td>{{ f(props.Is_z, 2) }} cm⁴</td></tr>
          <tr><td v-html="tip('Z<sub>s,y</sub> (塑性斷面模數, Y軸)')"></td><td>{{ f(props.Zs_y, 2) }} cm³</td></tr>
          <tr><td v-html="tip('Z<sub>s,z</sub> (塑性斷面模數, Z軸)')"></td><td>{{ f(props.Zs_z, 2) }} cm³</td></tr>
          <tr><td v-html="tip('S<sub>s,y</sub> (彈性斷面模數, Y軸)', 'I<sub>s,y</sub> / (H/2)')"></td><td>{{ f(props.Ss_y, 2) }} cm³</td></tr>
          <tr><td v-html="tip('S<sub>s,z</sub> (彈性斷面模數, Z軸)', 'I<sub>s,z</sub> / (B/2)')"></td><td>{{ f(props.Ss_z, 2) }} cm³</td></tr>
          <tr><td v-html="tip('r<sub>s,y</sub> (迴轉半徑, Y軸)', '√(I<sub>s,y</sub> / A<sub>s</sub>)')"></td><td>{{ f(props.rs_y, 2) }} cm</td></tr>
          <tr><td v-html="tip('r<sub>s,z</sub> (迴轉半徑, Z軸)', '√(I<sub>s,z</sub> / A<sub>s</sub>)')"></td><td>{{ f(props.rs_z, 2) }} cm</td></tr>
          <tr><td v-html="tip('ρ<sub>s</sub> (鋼骨比)', 'A<sub>s</sub> / A<sub>g</sub>')"></td><td>{{ (props.rho_s * 100).toFixed(2) }} %</td></tr>
        </table>
      </div>

      <!-- 寬厚比檢核 -->
      <div class="result-section">
        <div class="result-section-title">
          <span class="dot dot-green"></span>
          寬厚比檢核 — {{ props.codeVer === '2024' ? '修正草案 (2024)' : '現行規範 (2011)' }}
        </div>
        <table class="result-table">
          <tr><td>鋼材種類</td><td>{{ props.gradeLabel }}</td></tr>
          <tr><td v-html="tip('翼板 λ<sub>f</sub>', 'b / t<sub>f</sub>')"></td><td>{{ f(props.lambda_f, 2) }}</td></tr>
          <tr><td v-html="'　' + tip('λ<sub>' + (props.codeVer === '2024' ? 'hd' : 'pd') + '</sub> (' + props.seismicLabel + ')')"></td><td>{{ f(props.lambda_pd_f, 2) }}</td></tr>
          <tr><td v-html="'　' + tip('λ<sub>p</sub> (結實)')"></td><td>{{ f(props.lambda_p_f, 2) }}</td></tr>
          <tr><td>　翼板判定</td><td v-html="classLabel(props.flangeClass, props.seismicLabel)"></td></tr>
          <tr><td v-html="tip('腹板 λ<sub>w</sub>', 'h<sub>c</sub> / t<sub>w</sub>')"></td><td>{{ f(props.lambda_w, 2) }}</td></tr>
          <tr><td v-html="'　' + tip('λ<sub>' + (props.codeVer === '2024' ? 'hd' : 'pd') + '</sub> (' + props.seismicLabel + ')')"></td><td>{{ f(props.lambda_pd_w, 2) }}</td></tr>
          <tr><td v-html="'　' + tip('λ<sub>p</sub> (結實)')"></td><td>{{ f(props.lambda_p_w, 2) }}</td></tr>
          <tr><td>　腹板判定</td><td v-html="classLabel(props.webClass, props.seismicLabel)"></td></tr>
          <tr class="result-verdict"><td>斷面判定</td><td v-html="classLabel(props.sectionClass, props.seismicLabel)"></td></tr>
        </table>
      </div>

      <!-- 鋼筋 / RC -->
      <div class="result-section">
        <div class="result-section-title"><span class="dot dot-orange"></span>鋼筋 / RC</div>
        <table class="result-table">
          <tr><td>主筋號數</td><td>{{ props.rebarSize }}</td></tr>
          <tr><td>主筋總支數</td><td>{{ props.totalRebarCount }} 支</td></tr>
          <tr><td v-html="tip('A<sub>b</sub> (單根面積)')"></td><td>{{ f(props.Abar, 4) }} cm²</td></tr>
          <tr><td v-html="tip('A<sub>st</sub> (主筋總面積)', 'n · A<sub>b</sub>')"></td><td>{{ f(props.Ast, 2) }} cm²</td></tr>
          <tr><td v-html="tip('ρ<sub>g</sub> (主筋比)', 'A<sub>st</sub> / A<sub>g</sub>')"></td><td>{{ (props.rho_g * 100).toFixed(2) }} %</td></tr>
          <tr><td v-html="tip('I<sub>st,y</sub> (鋼筋慣性矩, Y軸)', 'Σ A<sub>b</sub> · d<sub>i</sub>²')"></td><td>{{ f(props.Ist_y, 2) }} cm⁴</td></tr>
          <tr><td v-html="tip('I<sub>st,z</sub> (鋼筋慣性矩, Z軸)', 'Σ A<sub>b</sub> · d<sub>i</sub>²')"></td><td>{{ f(props.Ist_z, 2) }} cm⁴</td></tr>
          <tr><td v-html="tip('A<sub>c</sub> (淨混凝土面積)', 'A<sub>g</sub> − A<sub>s</sub> − A<sub>st</sub>')"></td><td>{{ f(props.Ac, 2) }} cm²</td></tr>
          <tr><td v-html="tip('I<sub>c,y</sub> (混凝土慣性矩, Y軸)', 'I<sub>g,y</sub> − I<sub>s,y</sub> − I<sub>st,y</sub>')"></td><td>{{ f(props.Ic_y, 2) }} cm⁴</td></tr>
          <tr><td v-html="tip('I<sub>c,z</sub> (混凝土慣性矩, Z軸)', 'I<sub>g,z</sub> − I<sub>s,z</sub> − I<sub>st,z</sub>')"></td><td>{{ f(props.Ic_z, 2) }} cm⁴</td></tr>
        </table>
      </div>

      <!-- 剛度 -->
      <div class="result-section">
        <div class="result-section-title">
          <span class="dot dot-cyan"></span>
          剛度 EA / EI <span class="badge badge-info">RC 已折減</span>
        </div>
        <table class="result-table">
          <tr class="result-subheader"><td colspan="2">軸向剛度 EA (kgf)</td></tr>
          <tr><td v-html="tip('鋼骨 EA<sub>s</sub>', 'E<sub>s</sub> · A<sub>s</sub>')"></td><td>{{ f(props.EA_s, 0) }}</td></tr>
          <tr><td v-html="tip('RC　 0.55·E<sub>c</sub>·A<sub>c</sub>', '0.55 × E<sub>c</sub> × A<sub>c</sub>')"></td><td>{{ f(props.EA_rc, 0) }}</td></tr>
          <tr><td>合計 EA</td><td>{{ f(props.EA_total, 0) }}</td></tr>
          <tr class="result-ratio"><td>鋼骨占比</td><td><span class="ratio-bar"><span class="ratio-fill ratio-steel" :style="{ width: (props.EA_s_ratio*100).toFixed(1) + '%' }"></span></span>{{ (props.EA_s_ratio*100).toFixed(1) }}%</td></tr>
          <tr class="result-ratio"><td>RC 占比</td><td><span class="ratio-bar"><span class="ratio-fill ratio-rc" :style="{ width: (props.EA_rc_ratio*100).toFixed(1) + '%' }"></span></span>{{ (props.EA_rc_ratio*100).toFixed(1) }}%</td></tr>

          <tr class="result-subheader"><td colspan="2">撓曲剛度 EI<sub>y</sub> (kgf-cm²)</td></tr>
          <tr><td v-html="tip('鋼骨 EI<sub>s,y</sub>', 'E<sub>s</sub> · I<sub>s,y</sub>')"></td><td>{{ f(props.EI_s_y, 0) }}</td></tr>
          <tr><td v-html="tip('RC　 0.35·E<sub>c</sub>·I<sub>g,y</sub>', '0.35 × E<sub>c</sub> × I<sub>g,y</sub>')"></td><td>{{ f(props.EI_rc_y, 0) }}</td></tr>
          <tr><td v-html="'合計 EI<sub>y</sub>'"></td><td>{{ f(props.EI_total_y, 0) }}</td></tr>
          <tr class="result-ratio"><td>鋼骨占比</td><td><span class="ratio-bar"><span class="ratio-fill ratio-steel" :style="{ width: (props.EI_s_y_ratio*100).toFixed(1) + '%' }"></span></span>{{ (props.EI_s_y_ratio*100).toFixed(1) }}%</td></tr>
          <tr class="result-ratio"><td>RC 占比</td><td><span class="ratio-bar"><span class="ratio-fill ratio-rc" :style="{ width: (props.EI_rc_y_ratio*100).toFixed(1) + '%' }"></span></span>{{ (props.EI_rc_y_ratio*100).toFixed(1) }}%</td></tr>

          <tr class="result-subheader"><td colspan="2">撓曲剛度 EI<sub>z</sub> (kgf-cm²)</td></tr>
          <tr><td v-html="tip('鋼骨 EI<sub>s,z</sub>', 'E<sub>s</sub> · I<sub>s,z</sub>')"></td><td>{{ f(props.EI_s_z, 0) }}</td></tr>
          <tr><td v-html="tip('RC　 0.35·E<sub>c</sub>·I<sub>g,z</sub>', '0.35 × E<sub>c</sub> × I<sub>g,z</sub>')"></td><td>{{ f(props.EI_rc_z, 0) }}</td></tr>
          <tr><td v-html="'合計 EI<sub>z</sub>'"></td><td>{{ f(props.EI_total_z, 0) }}</td></tr>
          <tr class="result-ratio"><td>鋼骨占比</td><td><span class="ratio-bar"><span class="ratio-fill ratio-steel" :style="{ width: (props.EI_s_z_ratio*100).toFixed(1) + '%' }"></span></span>{{ (props.EI_s_z_ratio*100).toFixed(1) }}%</td></tr>
          <tr class="result-ratio"><td>RC 占比</td><td><span class="ratio-bar"><span class="ratio-fill ratio-rc" :style="{ width: (props.EI_rc_z_ratio*100).toFixed(1) + '%' }"></span></span>{{ (props.EI_rc_z_ratio*100).toFixed(1) }}%</td></tr>
        </table>
      </div>
    </div>
  </BaseCard>
</template>
