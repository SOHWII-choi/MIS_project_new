// render/wired.js — 유선 가입자 페이지 렌더
import { S, C } from '../utils/state.js';
import { gd, last, prev, fmt, pct, sum } from '../utils/calc.js';
import { mkC, baseOpts } from '../utils/chart.js';
import { kpi } from '../utils/kpi.js';

export function renderWired() {
  const d = gd('wired');
  document.getElementById('wd-kpi').innerHTML = [
    kpi('유지 (전체)', fmt(last(d.유지_전체)), '건', pct(last(d.유지_전체), d.유지_전체[0]), 'blue', '인터넷+TV', 'wd:유지전체'),
    kpi('신규 (최근월)', fmt(last(d.신규_전체)), '건', pct(last(d.신규_전체), prev(d.신규_전체)), 'teal', '유선 전체', 'wd:신규전체'),
    kpi('해지 (최근월)', fmt(last(d.해지_전체)), '건', pct(last(d.해지_전체), prev(d.해지_전체)), 'red', '유선 전체', 'wd:해지전체'),
    kpi('순증 (최근월)', fmt(last(d.순증_전체)), '건', null, last(d.순증_전체) >= 0 ? 'green' : 'red', '유선 전체', 'wd:순증전체'),
    kpi('인터넷 유지', fmt(last(d.유지_인터넷)), '건', pct(last(d.유지_인터넷), d.유지_인터넷[0]), 'gold', '인터넷 전용', 'wd:유지인터넷'),
    kpi('인터넷 신규 (최근월)', fmt(last(d.신규_인터넷)), '건', null, 'green', '인터넷 전용', 'wd:신규인터넷'),
  ].join('');

  mkC('ch-wd-main', {
    type: 'line', data: {
      labels: d.months, datasets: [
        { label: '유지(전체)', data: d.유지_전체, borderColor: C.blue, backgroundColor: C.blueA, borderWidth: 2, pointRadius: 0, tension: .3, fill: true, yAxisID: 'y' },
        { label: '신규', data: d.신규_전체, borderColor: C.teal, backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2, tension: .3, yAxisID: 'y2' },
        { label: '해지', data: d.해지_전체, borderColor: C.red, backgroundColor: 'transparent', borderWidth: 1.5, pointRadius: 0, tension: .3, yAxisID: 'y2' }
      ]
    },
    options: baseOpts({ scales: { x: { grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { maxRotation: 45, color: '#5c6e9a', font: { size: 10 } } }, y: { grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { color: '#5c6e9a' }, title: { display: true, text: '유지(건)', color: '#5c6e9a' } }, y2: { position: 'right', grid: { display: false }, ticks: { color: '#5c6e9a' }, title: { display: true, text: '신규/해지(건)', color: '#5c6e9a' } } } })
  });

  mkC('ch-wd-net', {
    type: 'bar', data: {
      labels: d.months, datasets: [{
        label: '순증(전체)', data: d.순증_전체,
        backgroundColor: d.순증_전체.map(v => v >= 0 ? C.greenA : C.redA),
        borderColor: d.순증_전체.map(v => v >= 0 ? C.green : C.red),
        borderWidth: 1.5
      }]
    },
    options: baseOpts()
  });

  mkC('ch-wd-inet', {
    type: 'line', data: {
      labels: d.months, datasets: [
        { label: '인터넷유지', data: d.유지_인터넷, borderColor: C.gold, backgroundColor: C.goldA, borderWidth: 2, pointRadius: 0, tension: .3, fill: true, yAxisID: 'y' },
        { label: '신규', data: d.신규_인터넷, borderColor: C.teal, backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2, tension: .3, yAxisID: 'y2' },
        { label: '해지', data: d.해지_인터넷, borderColor: C.red, backgroundColor: 'transparent', borderWidth: 1.5, pointRadius: 0, tension: .3, yAxisID: 'y2' }
      ]
    },
    options: baseOpts({ scales: { x: { grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { maxRotation: 45, color: '#5c6e9a', font: { size: 10 } } }, y: { grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { color: '#5c6e9a' }, title: { display: true, text: '유지(건)', color: '#5c6e9a' } }, y2: { position: 'right', grid: { display: false }, ticks: { color: '#5c6e9a' }, title: { display: true, text: '신규/해지(건)', color: '#5c6e9a' } } } })
  });
}
