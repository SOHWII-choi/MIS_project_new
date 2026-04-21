// render/infra.js — 매장 인프라 페이지 렌더
import { C, COLORS, COLORS_A } from '../utils/state.js';
import { gd, last, prev, fmt, pct, sum } from '../utils/calc.js';
import { mkC, baseOpts, bar, line } from '../utils/chart.js';
import { kpi } from '../utils/kpi.js';

function diffSeries(arr) {
  return arr.map((v, i) => (i === 0 ? 0 : (v || 0) - (arr[i - 1] || 0)));
}

function scaleStoreCounts(arr) {
  return (arr || []).map(v => Math.round((v || 0) * 100));
}

export function renderInfra() {
  const d = gd('infra');
  const wireless = gd('wireless');
  const digital = gd('digital');
  const hr = gd('hr');

  const storeCount = scaleStoreCounts(d.소매매장수_계 || []);
  const storeDelta = diffSeries(storeCount);
  const openings = storeDelta.map(v => Math.max(v, 0));
  const closings = storeDelta.map(v => Math.max(-v, 0));
  const wirelessPerStore = storeCount.map((v, i) => v ? (wireless.CAPA?.[i] || 0) / v : 0);
  const wirelessPerHead = hr.소매채널?.map((v, i) => v ? (wireless.CAPA?.[i] || 0) / v : 0) || [];
  const wirelinePerStore = storeCount.map((v, i) => v ? (digital.유선순신규?.[i] || 0) / v : 0);
  const wholesaleNet = diffSeries(d.도매무선취급점 || []);
  const hqs = ['강북', '강남', '강서', '동부', '서부'];
  const rawRegional = Object.fromEntries(hqs.map(hq => [hq, d[`소매_${hq}`] || []]));
  const regionalCounts = {};

  hqs.forEach(hq => { regionalCounts[hq] = []; });
  d.months.forEach((_, i) => {
    const weights = hqs.map(hq => rawRegional[hq][i] || 0);
    const weightSum = weights.reduce((acc, v) => acc + v, 0) || 1;
    let assigned = 0;

    hqs.forEach((hq, idx) => {
      const value = idx === hqs.length - 1
        ? Math.max(0, storeCount[i] - assigned)
        : Math.round(storeCount[i] * (weights[idx] / weightSum));
      regionalCounts[hq].push(value);
      assigned += value;
    });
  });

  document.getElementById('infra-kpi').innerHTML = [
    kpi('소매 매장수 (최근월)', fmt(last(storeCount)), '개', pct(last(storeCount), prev(storeCount)), 'gold', '매장 Infra 계', 'inf:소매매장수'),
    kpi('출점 추정 (기간합)', fmt(sum(openings)), '개', null, 'green', '전월 대비 증가분 합산'),
    kpi('퇴점 추정 (기간합)', fmt(sum(closings)), '개', null, 'red', '전월 대비 감소분 합산'),
    kpi('도매 무선취급점', fmt(last(d.도매무선취급점 || [])), '개소', pct(last(d.도매무선취급점 || []), prev(d.도매무선취급점 || [])), 'blue', '', 'inf:도매무선취급점'),
    kpi('점당 생산성 (무선)', fmt(last(wirelessPerStore), 1), '건/점', pct(last(wirelessPerStore), prev(wirelessPerStore)), 'teal', '무선 CAPA 기준', 'inf:점당생산성_무선'),
    kpi('인당 생산성 (무선)', fmt(last(wirelessPerHead), 1), '건/명', pct(last(wirelessPerHead), prev(wirelessPerHead)), 'purple', '소매채널 인력 기준', 'inf:인당생산성_무선'),
  ].join('');

  mkC('ch-infra-main', {
    type: 'bar',
    data: {
      labels: d.months,
      datasets: [
        { label: '소매 매장수', data: storeCount, backgroundColor: C.blueA, borderColor: C.blue, borderWidth: 1.5, yAxisID: 'y' },
        { label: '출점 추정', data: openings, type: 'line', borderColor: C.green, backgroundColor: 'transparent', borderWidth: 2, pointRadius: 2, tension: 0.3, yAxisID: 'y2' },
        { label: '퇴점 추정', data: closings, type: 'line', borderColor: C.red, backgroundColor: 'transparent', borderWidth: 1.5, pointRadius: 2, tension: 0.3, yAxisID: 'y2' },
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

  line('ch-infra-prod', d.months, [
    { label: '점당생산성(무선)', data: wirelessPerStore, fill: true },
    { label: '인당생산성(무선)', data: wirelessPerHead, color: C.teal },
  ]);

  line('ch-infra-wholesale', d.months, [
    { label: '무선취급점', data: d.도매무선취급점 || [], fill: true },
    { label: '유선취급점', data: d.도매유선취급점 || [], color: C.teal },
  ]);

  bar('ch-infra-hq', d.months, hqs.map((hq, i) => ({
    label: hq,
    data: regionalCounts[hq],
    color: COLORS[i],
    bg: COLORS_A[i],
  })), true);

  mkC('ch-infra-wnet', {
    type: 'bar',
    data: {
      labels: d.months,
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

  line('ch-infra-wline', d.months, [
    { label: '유선순신규 점당생산성', data: wirelinePerStore, fill: true },
  ]);
}
