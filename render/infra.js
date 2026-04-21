// render/infra.js — 매장 인프라 페이지 렌더
import { C, COLORS, COLORS_A } from '../utils/state.js';
import { gd, last, prev, fmt, pct, sum } from '../utils/calc.js';
import { mkC, baseOpts, bar, line } from '../utils/chart.js';
import { kpi } from '../utils/kpi.js';
import { getInfraSeries } from '../utils/infra.js';

export function renderInfra() {
  const d = gd('infra');
  const {
    months,
    storeCount,
    openings,
    closings,
    wirelessPerStore,
    wirelessPerHead,
    wirelinePerStore,
    wholesaleWireless,
    wholesaleWireline,
    wholesaleNet,
    regionalCounts,
  } = getInfraSeries(d.months);
  const hqs = ['강북', '강남', '강서', '동부', '서부'];

  document.getElementById('infra-kpi').innerHTML = [
    kpi('소매 매장수 (최근월)', fmt(last(storeCount)), '개', pct(last(storeCount), prev(storeCount)), 'gold', '매장 Infra 계', 'inf:소매매장수'),
    kpi('출점 (기간합)', fmt(sum(openings)), '개', null, 'green', '원본 총계 행 기준'),
    kpi('퇴점 (기간합)', fmt(sum(closings)), '개', null, 'red', '원본 총계 행 기준'),
    kpi('도매 무선취급점', fmt(last(wholesaleWireless)), '개소', pct(last(wholesaleWireless), prev(wholesaleWireless)), 'blue', '', 'inf:도매무선'),
    kpi('점당 생산성 (무선)', fmt(last(wirelessPerStore), 1), '건/점', pct(last(wirelessPerStore), prev(wirelessPerStore)), 'teal', '원본 총계 행 기준', 'inf:점당생산성'),
    kpi('인당 생산성 (무선)', fmt(last(wirelessPerHead), 1), '건/명', pct(last(wirelessPerHead), prev(wirelessPerHead)), 'purple', '원본 총계 행 기준', 'inf:인당생산성'),
  ].join('');

  mkC('ch-infra-main', {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        { label: '소매 매장수', data: storeCount, backgroundColor: C.blueA, borderColor: C.blue, borderWidth: 1.5, yAxisID: 'y' },
        { label: '출점', data: openings, type: 'line', borderColor: C.green, backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2, tension: 0.3, yAxisID: 'y2' },
        { label: '퇴점', data: closings, type: 'line', borderColor: C.red, backgroundColor: 'transparent', borderWidth: 1.5, pointRadius: 2, tension: 0.3, yAxisID: 'y2' },
      ],
    },
    options: baseOpts({
      scales: {
        x: { grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { maxRotation: 45, color: '#5c6e9a', font: { size: 10 } } },
        y: { grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { color: '#5c6e9a' }, title: { display: true, text: '매장수(개)', color: '#5c6e9a' } },
        y2: { position: 'right', grid: { display: false }, ticks: { color: '#5c6e9a' }, title: { display: true, text: '출점/퇴점(개)', color: '#5c6e9a' } },
      },
    }),
  });

  line('ch-infra-prod', months, [
    { label: '점당생산성(무선)', data: wirelessPerStore, fill: true },
    { label: '인당생산성(무선)', data: wirelessPerHead, color: C.teal },
  ]);

  line('ch-infra-wholesale', months, [
    { label: '무선취급점', data: wholesaleWireless, fill: true },
    { label: '유선취급점', data: wholesaleWireline, color: C.teal },
  ]);

  bar('ch-infra-hq', months, hqs.map((hq, i) => ({
    label: hq,
    data: regionalCounts[hq],
    color: COLORS[i],
    bg: COLORS_A[i],
  })), true);

  mkC('ch-infra-wnet', {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: '도매 순증(무선취급점)',
        data: wholesaleNet,
        backgroundColor: wholesaleNet.map(v => v >= 0 ? C.greenA : C.redA),
        borderColor: wholesaleNet.map(v => v >= 0 ? C.green : C.red),
        borderWidth: 1.5,
      }],
    },
    options: baseOpts(),
  });

  line('ch-infra-wline', months, [
    { label: '유선순신규 점당생산성', data: wirelinePerStore, fill: true },
  ]);
}
