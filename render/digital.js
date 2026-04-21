// render/digital.js — 디지털 채널 페이지 렌더
import { S, C } from '../utils/state.js';
import { gd, last, prev, fmt, pct, sum } from '../utils/calc.js';
import { mkC, baseOpts, bar, line } from '../utils/chart.js';
import { kpi } from '../utils/kpi.js';

export function renderDigital() {
  const d = gd('digital');
  document.getElementById('dig-kpi').innerHTML = [
    kpi('일반후불 (최근월)', fmt(last(d.일반후불_총계)), '건', pct(last(d.일반후불_총계), prev(d.일반후불_총계)), 'gold', 'KT닷컴 전체', 'dig:일반후불'),
    kpi('KT닷컴 직접 (최근월)', fmt(last(d['일반후불_KT닷컴'])), '건', pct(last(d['일반후불_KT닷컴']), prev(d['일반후불_KT닷컴'])), 'teal', '', 'dig:KT닷컴'),
    kpi('운영후불 (최근월)', fmt(last(d.운영후불_총계)), '건', pct(last(d.운영후불_총계), prev(d.운영후불_총계)), 'blue', '', 'dig:운영후불'),
    kpi('유심단독 (최근월)', fmt(last(d.유심단독)), '건', null, 'purple', '', 'dig:유심단독'),
    kpi('유선순신규 (최근월)', fmt(last(d.유선순신규)), '건', pct(last(d.유선순신규), prev(d.유선순신규)), 'green', '', 'dig:유선순신규'),
    kpi('디지털채널 인력', fmt(last(d.인력_총계)), '명', pct(last(d.인력_총계), prev(d.인력_총계)), 'orange', ''),
  ].join('');

  bar('ch-dig-main', d.months, [
    { label: 'KT닷컴 직접', data: d['일반후불_KT닷컴'] },
    { label: 'O2O', data: d['일반후불_O2O'], color: C.teal, bg: C.tealA },
    { label: '온라인유통', data: d['일반후불_온라인유통'], color: C.blue, bg: C.blueA }
  ], true);

  line('ch-dig-type', d.months, [{ label: '운영후불', data: d.운영후불_총계 }, { label: '유심단독', data: d.유심단독, color: C.purple }]);

  mkC('ch-dig-etc', {
    type: 'line', data: {
      labels: d.months, datasets: [
        { label: '유선순신규', data: d.유선순신규, borderColor: C.teal, backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2, tension: .3, yAxisID: 'y' },
        { label: '인력', data: d.인력_총계, borderColor: C.orange, backgroundColor: 'transparent', borderWidth: 1.5, pointRadius: 0, tension: .3, yAxisID: 'y2' }
      ]
    },
    options: baseOpts({ scales: { x: { grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { maxRotation: 45, color: '#5c6e9a', font: { size: 10 } } }, y: { grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { color: '#5c6e9a' }, title: { display: true, text: '유선순신규(명)', color: '#5c6e9a' } }, y2: { position: 'right', grid: { display: false }, ticks: { color: '#5c6e9a' }, title: { display: true, text: '인력(명)', color: '#5c6e9a' } } } })
  });
}
