// render/strategy.js — 전략상품 페이지 렌더
import { S, C } from '../utils/state.js';
import { gd, last, prev, fmt, pct } from '../utils/calc.js';
import { bar, line } from '../utils/chart.js';
import { kpi } from '../utils/kpi.js';

export function renderStrategy() {
  const d = gd('strategy');
  document.getElementById('str-kpi').innerHTML = [
    kpi('하이오더 점포수 (최근월)', fmt(last(d.하이오더_점포수)), '개', pct(last(d.하이오더_점포수), d.하이오더_점포수[0]), 'gold', ''),
    kpi('하이오더 태블릿수 (최근월)', fmt(last(d.하이오더_태블릿수)), '대', null, 'teal', ''),
    kpi('소상공인 점포수 (최근월)', fmt(last(d.소상공인_점포수)), '개', null, 'blue', ''),
    kpi('GiGAeyes (최근월)', fmt(last(d.GiGAeyes_계)), '대', pct(last(d.GiGAeyes_계), d.GiGAeyes_계[0]), 'purple', '소상공인 포함'),
    kpi('AI전화 (최근월)', fmt(last(d.AI전화_계)), '대', null, 'green', ''),
    kpi('스마트로VAN (최근월)', fmt(last(d.스마트로VAN_계)), '대', null, 'orange', ''),
  ].join('');

  bar('ch-str-main', d.months, [
    { label: '하이오더 점포', data: d.하이오더_점포수 },
    { label: '소상공인 점포', data: d.소상공인_점포수, color: C.teal, bg: C.tealA },
    { label: '매장 점포', data: d.매장_점포수, color: C.blue, bg: C.blueA }
  ], true);

  line('ch-str-giga', d.months, [{ label: 'GiGAeyes 전체', data: d.GiGAeyes_계, fill: true }, { label: '소상공인', data: d.GiGAeyes_소상공인, color: C.teal }]);
  line('ch-str-etc', d.months, [{ label: '로봇', data: d.로봇_계 }, { label: 'AI전화', data: d.AI전화_계, color: C.teal }, { label: '스마트로VAN', data: d.스마트로VAN_계, color: C.blue }]);
}
