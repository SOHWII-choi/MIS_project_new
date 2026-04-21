// render/hr.js — 인력 현황 페이지 렌더
import { C } from '../utils/state.js';
import { gd, last, prev, fmt, pct } from '../utils/calc.js';
import { bar, line, makeDonut } from '../utils/chart.js';
import { kpi } from '../utils/kpi.js';

function diffSeries(arr) {
  return arr.map((v, i) => (i === 0 ? 0 : (v || 0) - (arr[i - 1] || 0)));
}

export function renderHR() {
  const d = gd('hr');
  const total = d.전사계 || [];
  const sales = d.영업직 || [];
  const sc = d.SC직 || [];
  const general = d.일반직 || [];
  const retail = d.소매채널 || [];
  const wholesale = d.도매채널 || [];
  const support = total.map((v, i) => Math.max(0, (v || 0) - (retail[i] || 0) - (wholesale[i] || 0)));
  const totalDelta = diffSeries(total);

  document.getElementById('hr-kpi').innerHTML = [
    kpi('전사계 (최근월)', fmt(last(total)), '명', pct(last(total), prev(total)), 'gold', '기간 시작 대비', 'hr:전사계'),
    kpi('영업직', fmt(last(sales)), '명', pct(last(sales), prev(sales)), 'blue', '', 'hr:영업직'),
    kpi('SC직', fmt(last(sc)), '명', pct(last(sc), prev(sc)), 'teal', '', 'hr:SC직'),
    kpi('일반직', fmt(last(general)), '명', pct(last(general), prev(general)), 'purple', '', 'hr:일반직'),
    kpi('소매채널', fmt(last(retail)), '명', pct(last(retail), prev(retail)), 'green', '', 'hr:소매채널'),
    kpi('도매채널', fmt(last(wholesale)), '명', pct(last(wholesale), prev(wholesale)), 'orange', '', 'hr:도매채널'),
  ].join('');

  line('ch-hr-main', d.months, [
    { label: '전사계', data: total, fill: true },
    { label: '영업직', data: sales, color: C.blue },
    { label: 'SC직', data: sc, color: C.teal },
    { label: '일반직', data: general, color: C.purple },
  ]);

  bar('ch-hr-ch', d.months, [{
    label: '전사 인력 증감',
    data: totalDelta,
    color: C.red,
    bg: 'rgba(239,68,68,0.65)',
  }]);

  const latestIdx = d.months.length - 1;
  const latestYear = (d.months[latestIdx] || '').split('.')[0] || '';
  const jobTypes = [
    { label: '영업직', value: sales[latestIdx] || 0, color: 'rgba(91,110,245,0.72)' },
    { label: 'SC직', value: sc[latestIdx] || 0, color: 'rgba(6,182,212,0.72)' },
    { label: '일반직', value: general[latestIdx] || 0, color: 'rgba(139,92,246,0.72)' },
  ];
  const vals = jobTypes.map(j => j.value);
  const hrTotal = vals.reduce((acc, v) => acc + v, 0);
  makeDonut('ch-hr-donut', jobTypes.map(j => j.label), vals, jobTypes.map(j => j.color), `${fmt(hrTotal)}명`, `${latestYear}년`);

  bar('ch-hr-hq', d.months, [
    { label: '소매채널', data: retail, color: C.blue, bg: 'rgba(91,110,245,0.18)' },
    { label: '도매채널', data: wholesale, color: C.teal, bg: 'rgba(6,182,212,0.18)' },
    { label: '기타지원', data: support, color: C.orange, bg: 'rgba(249,115,22,0.18)' },
  ], true);
}
