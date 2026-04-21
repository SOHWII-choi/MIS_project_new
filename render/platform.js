// render/platform.js — 유통플랫폼 채널 페이지 렌더
import { S, C } from '../utils/state.js';
import { gd, last, prev, fmt, pct, sum } from '../utils/calc.js';
import { line } from '../utils/chart.js';
import { kpi } from '../utils/kpi.js';

export function renderPlatform() {
  const d = gd('platform');
  document.getElementById('plat-kpi').innerHTML = [
    kpi('중고폰 매입건수 (최근월)', fmt(last(d.중고폰_매입건수)), '건', pct(last(d.중고폰_매입건수), prev(d.중고폰_매입건수)), 'gold', ''),
    kpi('중고폰 매각건수 (최근월)', fmt(last(d.중고폰_매각건수)), '건', pct(last(d.중고폰_매각건수), prev(d.중고폰_매각건수)), 'teal', ''),
    kpi('중고폰 매입금액 (최근월)', fmt(last(d.중고폰_매입금액), 1), '억원', null, 'blue', ''),
    kpi('기간 매입 합계', fmt(sum(d.중고폰_매입건수)), '건', null, 'purple', '중고폰'),
    kpi('시연폰 매각건수 (최근월)', fmt(last(d.시연폰_매각건수)), '건', null, 'green', ''),
    kpi('시연폰 매각이익 (최근월)', fmt(last(d.시연폰_매각이익), 1), '억원', null, 'orange', ''),
  ].join('');

  line('ch-plat-main', d.months, [{ label: '중고폰 매입', data: d.중고폰_매입건수, fill: true }, { label: '중고폰 매각', data: d.중고폰_매각건수, color: C.teal }]);
  line('ch-plat-demo', d.months, [{ label: '시연폰 매입', data: d.시연폰_매입건수, fill: true }, { label: '시연폰 매각', data: d.시연폰_매각건수, color: C.teal }]);
  line('ch-plat-amt', d.months, [{ label: '중고폰 매입금액(억)', data: d.중고폰_매입금액, fill: true }, { label: '시연폰 매각이익(억)', data: d.시연폰_매각이익, color: C.teal }]);
}
