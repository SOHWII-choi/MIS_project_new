// render/quality.js — TCSI / VOC 페이지 렌더
import { RAW } from '../data/raw.js';
import { S, C } from '../utils/state.js';
import { gd, last, prev, fmt, pct, sum } from '../utils/calc.js';
import { mkC, baseOpts, line } from '../utils/chart.js';
import { kpi } from '../utils/kpi.js';

export function renderQuality() {
  const tc = gd('tcsi'), vc = gd('voc');
  document.getElementById('qual-kpi').innerHTML = [
    kpi('TCSI 점수 (최근월)', fmt(last(tc.TCSI점수), 1), '점', pct(last(tc.TCSI점수), tc.TCSI점수[0]), 'gold', `KT점수 ${fmt(last(tc.KT점수), 1)}`, 'tc:TCSI점수'),
    kpi('KT 점수', fmt(last(tc.KT점수), 1), '점', null, 'teal', `대리점 ${fmt(last(tc.대리점점수), 1)}`, 'tc:KT점수'),
    kpi('VOC 도+소매 발생률', fmt(last(vc.도소매발생률), 4), '%', pct(last(vc.도소매발생률), vc.도소매발생률[0]), 'green', '낮을수록 우수', 'voc:도소매발생률'),
    kpi('VOC 소매 발생률', fmt(last(vc.소매발생률 || []), 4), '%', null, 'blue', '', 'voc:소매발생률'),
    kpi('대외민원 건수 (최근월)', fmt(last(vc.대외민원_건수)), '건', pct(last(vc.대외민원_건수), prev(vc.대외민원_건수)), 'red', '', 'voc:대외민원'),
    kpi('대외민원 귀책률 (최근월)', fmt(last(vc.대외민원_귀책률), 1), '%', null, 'orange', ''),
  ].join('');

  mkC('ch-tcsi', {
    type: 'line', data: {
      labels: tc.months, datasets: [
        { label: 'TCSI 전체', data: tc.TCSI점수, borderColor: C.gold, backgroundColor: C.goldA, borderWidth: 2.5, pointRadius: 2, tension: .3, fill: true },
        { label: 'KT점수', data: tc.KT점수, borderColor: C.teal, backgroundColor: 'transparent', borderWidth: 2, pointRadius: 0, tension: .3 },
        { label: '대리점점수', data: tc.대리점점수, borderColor: C.blue, backgroundColor: 'transparent', borderWidth: 1.5, pointRadius: 0, tension: .3 }
      ]
    },
    options: baseOpts({ scales: { x: { grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { maxRotation: 45, color: '#5c6e9a', font: { size: 10 } } }, y: { min: 88, grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { color: '#5c6e9a' } } } })
  });

  line('ch-voc', vc.months, [
    { label: '도+소매', data: vc.도소매발생률 },
    { label: '소매', data: vc.소매발생률 || [], color: C.teal },
    { label: '도매', data: vc.도매발생률 || [], color: C.blue },
    { label: '디지털', data: vc.디지털발생률 || [], color: C.purple }
  ]);

  mkC('ch-민원', {
    type: 'bar', data: {
      labels: vc.months, datasets: [
        { label: '대외민원 건수', data: vc.대외민원_건수, backgroundColor: C.redA, borderColor: C.red, borderWidth: 1.5, yAxisID: 'y' },
        { label: '귀책률(%)', data: vc.대외민원_귀책률, type: 'line', borderColor: C.orange, backgroundColor: 'transparent', borderWidth: 2, pointRadius: 0, tension: .3, yAxisID: 'y2' }
      ]
    },
    options: baseOpts({ scales: { x: { grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { maxRotation: 45, color: '#5c6e9a', font: { size: 10 } } }, y: { grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { color: '#5c6e9a' }, title: { display: true, text: '건수', color: '#5c6e9a' } }, y2: { position: 'right', grid: { display: false }, ticks: { color: '#5c6e9a' }, title: { display: true, text: '귀책률(%)', color: '#5c6e9a' } } } })
  });

  const rEl = document.getElementById('region-tables'); if (!rEl) return;
  const tcsiRegions = Object.keys(tc.regions || RAW.tcsi.regions || {});
  const vocRegions = Object.keys(vc.소매_지역 || {});
  rEl.innerHTML = `
    <div class="region-table"><h3>🗺️ 소매 지역별 TCSI 점수 (최근월)</h3>
      <table class="data-table"><thead><tr><th>지역</th><th class="num">점수</th><th class="num">전월비</th></tr></thead><tbody>
      ${tcsiRegions.map(r => { const v = last(tc.regions[r]), p = prev(tc.regions[r]), d = v - p; return `<tr><td>${r}</td><td class="num">${fmt(v, 1)}</td><td class="num ${d >= 0 ? 'pos' : 'neg'}">${d >= 0 ? '+' : ''}${fmt(d, 2)}</td></tr>`; }).join('')}
      </tbody></table>
    </div>
    <div class="region-table"><h3>📊 소매 지역별 VOC 발생률 (최근월)</h3>
      <table class="data-table"><thead><tr><th>지역</th><th class="num">발생률(%)</th><th class="num">전월비</th></tr></thead><tbody>
      ${vocRegions.map(r => { const v = last(vc.소매_지역[r]), p = prev(vc.소매_지역[r]), d = v - p; return `<tr><td>${r}</td><td class="num">${fmt(v, 4)}</td><td class="num ${d <= 0 ? 'pos' : 'neg'}">${d >= 0 ? '+' : ''}${fmt(d, 4)}</td></tr>`; }).join('')}
      </tbody></table>
    </div>`;
}
