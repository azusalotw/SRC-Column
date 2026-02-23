<script setup lang="ts">
import { computed } from 'vue'
import { useCftStore } from '@/stores/cft'
import { formatValue } from '@/utils/format'
import { tip } from '@/utils/tooltip'
import BaseCard from '@/components/shared/BaseCard.vue'

const store = useCftStore()
const r = computed(() => store.results)
const f = formatValue
</script>

<template>
  <BaseCard title="CFT 強度檢核結果" iconClass="icon-result">
    <template #icon>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    </template>

    <div v-if="!r" class="result-placeholder">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
      <p>點擊「計算強度檢核」查看結果</p>
    </div>

    <div v-else class="result-content">
      <!-- 斷面性質 -->
      <div class="result-section">
        <div class="result-section-title"><span class="dot dot-blue"></span>斷面性質</div>
        <table class="result-table">
          <tr><td v-html="tip('A<sub>g</sub>', 'B × H')"></td><td>{{ f(r.sec.Ag, 2) }} cm²</td></tr>
          <tr><td v-html="tip('A<sub>s</sub> (鋼管面積)', 'BH − (B−2t<sub>w</sub>)(H−2t<sub>w</sub>)')"></td><td>{{ f(r.sec.As, 2) }} cm²</td></tr>
          <tr><td v-html="tip('A<sub>c</sub> (混凝土面積)', '(B−2t<sub>w</sub>)(H−2t<sub>w</sub>)')"></td><td>{{ f(r.sec.Ac, 2) }} cm²</td></tr>
          <tr><td v-html="tip('I<sub>g</sub>', 'BH³ / 12')"></td><td>{{ f(r.sec.Ig, 2) }} cm⁴</td></tr>
          <tr><td v-html="tip('I<sub>s</sub>', 'I<sub>g</sub> − B<sub>i</sub>H<sub>i</sub>³ / 12')"></td><td>{{ f(r.sec.Is, 2) }} cm⁴</td></tr>
          <tr><td v-html="tip('Z<sub>s</sub>', 'BH² / 4 − B<sub>i</sub>H<sub>i</sub>² / 4')"></td><td>{{ f(r.sec.Zs, 2) }} cm³</td></tr>
          <tr><td v-html="tip('r<sub>s</sub>', '√(I<sub>s</sub> / A<sub>s</sub>)')"></td><td>{{ f(r.sec.rs, 2) }} cm</td></tr>
          <tr><td v-html="tip('ρ = A<sub>s</sub> / A<sub>g</sub>')"></td><td>{{ (r.sec.rho * 100).toFixed(2) }}%</td></tr>
        </table>
      </div>

      <!-- 板厚檢核 -->
      <div class="result-section">
        <div class="result-section-title"><span class="dot dot-green"></span>板厚檢核</div>
        <table class="result-table">
          <tr><td v-html="tip('t<sub>min</sub>', 'B · √(F<sub>ys</sub> / 3E<sub>s</sub>)')"></td><td>{{ f(r.sec.t_min, 3) }} cm</td></tr>
          <tr>
            <td v-html="'t<sub>w</sub> = ' + f(r.inp.tw, 1) + ' cm'"></td>
            <td v-html="r.wt.twOK ? '<span class=\'badge badge-seismic\'>OK</span>' : '<span class=\'badge badge-fail\'>NG</span>'"></td>
          </tr>
        </table>
      </div>

      <!-- 複合強度參數 -->
      <div class="result-section">
        <div class="result-section-title"><span class="dot dot-purple"></span>複合強度參數</div>
        <table class="result-table">
          <tr><td v-html="tip('E<sub>c</sub>', '12000√f\'<sub>c</sub>')"></td><td>{{ f(r.comp.Ec, 2) }} kgf/cm²</td></tr>
          <tr><td v-html="tip('F<sub>my</sub>', 'F<sub>ys</sub> + c<sub>1</sub>F<sub>yr</sub>(A<sub>r</sub>/A<sub>s</sub>) + c<sub>2</sub>f\'<sub>c</sub>(A<sub>c</sub>/A<sub>s</sub>)')"></td><td>{{ f(r.comp.Fmy, 2) }} kgf/cm²</td></tr>
          <tr><td v-html="tip('E<sub>m</sub>', 'E<sub>s</sub> + c<sub>3</sub>E<sub>c</sub>(A<sub>c</sub>/A<sub>s</sub>)')"></td><td>{{ f(r.comp.Em, 2) }} kgf/cm²</td></tr>
          <tr><td v-html="tip('r<sub>m</sub>', '√(I<sub>s</sub> / A<sub>s</sub>)')"></td><td>{{ f(r.comp.rm, 2) }} cm</td></tr>
        </table>
      </div>

      <!-- 柱挫屈強度 -->
      <div class="result-section">
        <div class="result-section-title"><span class="dot dot-orange"></span>柱挫屈強度</div>
        <table class="result-table">
          <tr><td v-html="tip('KL / (π·r<sub>m</sub>)')"></td><td>{{ f((r.inp.K * r.inp.L * 100) / (Math.PI * r.comp.rm), 3) }}</td></tr>
          <tr>
            <td v-html="tip('λ<sub>c</sub>', 'KL / (πr<sub>m</sub>) · √(F<sub>my</sub> / E<sub>m</sub>)')"></td>
            <td>{{ f(r.buck.lc, 4) }} {{ r.buck.lc <= 1.5 ? '≤ 1.5' : '> 1.5' }}</td>
          </tr>
          <tr>
            <td v-html="tip('F<sub>cr</sub>', r.buck.lc <= 1.5 ? '0.658<sup>λc²</sup> · F<sub>my</sub>' : '(0.877 / λ<sub>c</sub>²) · F<sub>my</sub>')"></td>
            <td>{{ f(r.buck.Fcr, 2) }} kgf/cm²</td>
          </tr>
          <tr><td v-html="tip('P<sub>n</sub>', 'A<sub>s</sub> · F<sub>cr</sub>')"></td><td>{{ f(r.buck.Pn, 2) }} tf</td></tr>
          <tr><td v-html="tip('φ<sub>c</sub>P<sub>n</sub>', 'φ<sub>c</sub> · A<sub>s</sub> · F<sub>cr</sub>')"></td><td>{{ f(r.buck.phiPn, 2) }} tf</td></tr>
        </table>
      </div>

      <!-- 彎矩強度 -->
      <div class="result-section">
        <div class="result-section-title"><span class="dot dot-cyan"></span>彎矩強度</div>
        <table class="result-table">
          <tr><td v-html="tip('M<sub>n</sub>', 'Z<sub>s</sub> · F<sub>ys</sub>')"></td><td>{{ f(r.mom.Mn, 2) }} tf-m</td></tr>
          <tr><td v-html="tip('φ<sub>b</sub>M<sub>n</sub>', 'φ<sub>b</sub> · Z<sub>s</sub> · F<sub>ys</sub>')"></td><td>{{ f(r.mom.phiMn, 2) }} tf-m</td></tr>
        </table>
      </div>

      <!-- P-M 交互作用檢核 -->
      <div class="result-section">
        <div class="result-section-title"><span class="dot dot-red"></span>P-M 交互作用檢核</div>
        <table class="result-table">
          <tr>
            <td v-html="tip('P<sub>u</sub> / (φ<sub>c</sub>P<sub>n</sub>)')"></td>
            <td>{{ f(r.inter.ratio_P, 4) }} {{ r.inter.ratio_P >= 0.2 ? '≥ 0.2 → ' + r.inter.formula : '< 0.2 → ' + r.inter.formula }}</td>
          </tr>
          <tr>
            <td v-html="tip('M<sub>u</sub> / (φ<sub>b</sub>M<sub>n</sub>)')"></td>
            <td>{{ f(r.inter.ratio_M, 4) }}</td>
          </tr>
          <tr class="result-verdict">
            <td v-html="tip('檢核值 (' + r.inter.formula + ')', r.inter.formula === 'H1-1a' ? 'P<sub>u</sub>/(φ<sub>c</sub>P<sub>n</sub>) + 8/9 · M<sub>u</sub>/(φ<sub>b</sub>M<sub>n</sub>)' : 'P<sub>u</sub>/(2φ<sub>c</sub>P<sub>n</sub>) + M<sub>u</sub>/(φ<sub>b</sub>M<sub>n</sub>)')"></td>
            <td v-html="f(r.inter.value, 4) + (r.inter.ok ? ' ≤ 1.0 ' : ' > 1.0 ') + (r.inter.ok ? '<span class=\'badge badge-seismic\'>OK</span>' : '<span class=\'badge badge-fail\'>NG</span>')"></td>
          </tr>
        </table>
      </div>
    </div>
  </BaseCard>
</template>
