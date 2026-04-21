// render/quality.js — TCSI / VOC 페이지 렌더
import { gd, last, prev, fmt, pct } from '../utils/calc.js';
import { mkC, baseOpts, line } from '../utils/chart.js';
import { kpi } from '../utils/kpi.js';
import { C } from '../utils/state.js';

export function renderQuality() {
  const tc = gd('tcsi');
  const vc = gd('voc');

  document.getElementById('qual-kpi').innerHTML = [
    kpi('TCSI 점수 (최근월)', fmt(last(tc.TCSI점수), 1), '점', pct(last(tc.TCSI점수), prev(tc.TCSI점수)), 'gold', `KT점수 ${fmt(last(tc.KT점수), 1)}`, 'tc:TCSI점수'),
    kpi('KT 점수', fmt(last(tc.KT점수), 1), '점', pct(last(tc.KT점수), prev(tc.KT점수)), 'teal', `대리점 ${fmt(last(tc.대리점점수), 1)}`, 'tc:KT점수'),
    kpi('대리점 점수', fmt(last(tc.대리점점수), 1), '점', pct(last(tc.대리점점수), prev(tc.대리점점수)), 'blue', '', 'tc:대리점점수'),
    kpi('R-VOC 발생률', fmt(last(vc.도소매발생률), 4), '%', pct(last(vc.도소매발생률), prev(vc.도소매발생률)), 'green', '도소매 기준', 'voc:도소매발생률'),
    kpi('디지털 VOC 발생률', fmt(last(vc.디지털발생률), 4), '%', pct(last(vc.디지털발생률), prev(vc.디지털발생률)), 'purple', '', 'voc:디지털발생률'),
    kpi('대외민원 건수', fmt(last(vc.대외민원_건수)), '건', pct(last(vc.대외민원_건수), prev(vc.대외민원_건수)), 'red', `귀책률 ${fmt(last(vc.대외민원_귀책률) * 100, 1)}%`, 'voc:대외민원_건수'),
  ].join('');

  mkC('ch-tcsi', {
    type: 'line',
    data: {
      labels: tc.months,
      datasets: [
        { label: 'TCSI 전체', data: tc.TCSI점수, borderColor: C.gold, backgroundColor: C.goldA, borderWidth: 2.5, pointRadius: 2, tension: 0.3, fill: true },
        { label: 'KT점수', data: tc.KT점수, borderColor: C.teal, backgroundColor: 'transparent', borderWidth: 2, pointRadius: 0, tension: 0.3 },
        { label: '대리점점수', data: tc.대리점점수, borderColor: C.blue, backgroundColor: 'transparent', borderWidth: 1.8, pointRadius: 0, tension: 0.3 },
      ],
    },
    options: baseOpts({
      scales: {
        x: { grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { maxRotation: 45, color: '#5c6e9a', font: { size: 10 } } },
        y: { min: 88, max: 100, grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { color: '#5c6e9a' } },
      },
    }),
  });

  line('ch-voc', vc.months, [
    { label: '도소매 발생률', data: vc.도소매발생률, fill: true },
    { label: '디지털 발생률', data: vc.디지털발생률, color: C.teal },
  ]);

  mkC('ch-민원', {
    type: 'bar',
    data: {
      labels: vc.months,
      datasets: [
        { label: '대외민원 건수', data: vc.대외민원_건수, backgroundColor: C.redA, borderColor: C.red, borderWidth: 1.5, yAxisID: 'y' },
        { label: '귀책률(%)', data: vc.대외민원_귀책률.map(v => (v || 0) * 100), type: 'line', borderColor: C.orange, backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2, tension: 0.3, yAxisID: 'y2' },
      ],
    },
    options: baseOpts({
      scales: {
        x: { grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { maxRotation: 45, color: '#5c6e9a', font: { size: 10 } } },
        y: { grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { color: '#5c6e9a' }, title: { display: true, text: '건수', color: '#5c6e9a' } },
        y2: { position: 'right', grid: { display: false }, ticks: { color: '#5c6e9a' }, title: { display: true, text: '귀책률(%)', color: '#5c6e9a' } },
      },
    }),
  });

  const regionEl = document.getElementById('region-tables');
  if (!regionEl) return;

  const regionKeys = Object.keys(tc).filter(key => key.endsWith('소매'));
  const vocRows = vc.months.slice(-6).map((month, idx) => {
    const i = vc.months.length - 6 + idx;
    return {
      month,
      rvoc: vc.도소매발생률[i] ?? 0,
      digital: vc.디지털발생률[i] ?? 0,
      complaint: vc.대외민원_건수[i] ?? 0,
    };
  });

  regionEl.innerHTML = `
    <div class="region-table">
      <h3>🗺️ 소매 지역별 TCSI 점수 (최근월)</h3>
      <table class="data-table">
        <thead><tr><th>지역</th><th class="num">점수</th><th class="num">전월 대비</th></tr></thead>
        <tbody>
          ${regionKeys.map((key) => {
            const cur = last(tc[key]);
            const prv = prev(tc[key]);
            const diff = cur - prv;
            return `<tr><td>${key.replace('소매', '')}</td><td class="num">${fmt(cur, 1)}</td><td class="num ${diff >= 0 ? 'pos' : 'neg'}">${diff >= 0 ? '+' : ''}${fmt(diff, 2)}</td></tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    <div class="region-table">
      <h3>📋 VOC 월간 요약 (최근 6개월)</h3>
      <table class="data-table">
        <thead><tr><th>월</th><th class="num">도소매 발생률</th><th class="num">디지털 발생률</th><th class="num">민원 건수</th></tr></thead>
        <tbody>
          ${vocRows.map((row) => `<tr><td>${row.month}</td><td class="num">${fmt(row.rvoc, 4)}%</td><td class="num">${fmt(row.digital, 4)}%</td><td class="num">${fmt(row.complaint)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
}
