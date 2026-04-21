// render/infra.js — 매장 인프라 페이지 렌더
import { S, C, COLORS, COLORS_A } from '../utils/state.js';
import { gd, last, prev, fmt, pct, sum } from '../utils/calc.js';
import { mkC, baseOpts, bar, line } from '../utils/chart.js';
import { kpi } from '../utils/kpi.js';

export function renderInfra() {
  const d = gd('infra');
  document.getElementById('infra-kpi').innerHTML = [
    kpi('소매 매장수', fmt(last(d.소매매장수_계)), '개', pct(last(d.소매매장수_계), d.소매매장수_계[0]), 'gold', '매장 Infra 계', 'inf:소매매장수'),
    kpi('출점 (기간합)', fmt(sum(d.출점_계)), '개', null, 'green', ''),
    kpi('퇴점 (기간합)', fmt(sum(d.퇴점_계)), '개', null, 'red', ''),
    kpi('도매 무선취급점', fmt(last(d.도매무선취급점)), '개', pct(last(d.도매무선취급점), d.도매무선취급점[0]), 'blue', '', 'inf:도매무선'),
    kpi('점당생산성 무선 (최근월)', fmt(last(d.점당생산성_무선), 1), '건/점', null, 'teal', '', 'inf:점당생산성'),
    kpi('인당생산성 무선 (최근월)', fmt(last(d.인당생산성_무선), 1), '건/인', null, 'purple', '', 'inf:인당생산성'),
  ].join('');

  mkC('ch-infra-main', {
    type: 'bar', data: {
      labels: d.months, datasets: [
        { label: '매장수', data: d.소매매장수_계, backgroundColor: C.blueA, borderColor: C.blue, borderWidth: 1.5, yAxisID: 'y' },
        { label: '출점', data: d.출점_계, type: 'line', borderColor: C.green, backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2, tension: .3, yAxisID: 'y2' },
        { label: '퇴점', data: d.퇴점_계, type: 'line', borderColor: C.red, backgroundColor: 'transparent', borderWidth: 1.5, pointRadius: 2, tension: .3, yAxisID: 'y2' }
      ]
    },
    options: baseOpts({ scales: { x: { grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { maxRotation: 45, color: '#5c6e9a', font: { size: 10 } } }, y: { grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { color: '#5c6e9a' }, title: { display: true, text: '매장수(개)', color: '#5c6e9a' } }, y2: { position: 'right', grid: { display: false }, ticks: { color: '#5c6e9a' }, title: { display: true, text: '출/퇴점(개)', color: '#5c6e9a' } } } })
  });

  line('ch-infra-prod', d.months, [{ label: '점당생산성(무선)', data: d.점당생산성_무선, fill: true }, { label: '인당생산성(무선)', data: d.인당생산성_무선, color: C.teal }]);
  line('ch-infra-wholesale', d.months, [{ label: '무선취급점', data: d.도매무선취급점, fill: true }, { label: '유선취급점', data: d.도매유선취급점, color: C.teal }]);

  const hqs = ['강북', '강남', '강서', '동부', '서부'];
  bar('ch-infra-hq', d.months, hqs.map((h, i) => ({ label: h, data: d[`소매_${h}`] || [], color: COLORS[i], bg: COLORS_A[i] })), true);

  mkC('ch-infra-wnet', {
    type: 'bar', data: {
      labels: d.months, datasets: [{
        label: '도매 순증(무선)', data: d.도매순증_무선,
        backgroundColor: d.도매순증_무선.map(v => v >= 0 ? C.greenA : C.redA),
        borderColor: d.도매순증_무선.map(v => v >= 0 ? C.green : C.red),
        borderWidth: 1.5
      }]
    },
    options: baseOpts()
  });

  line('ch-infra-wline', d.months, [{ label: '유선순신규 점당생산성', data: d.점당생산성_유선, fill: true }]);
}
