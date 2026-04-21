// render/smb.js — 소상공인 채널 페이지 렌더
import { S, C } from '../utils/state.js';
import { gd, last, prev, fmt, pct, sum } from '../utils/calc.js';
import { bar, line } from '../utils/chart.js';
import { kpi } from '../utils/kpi.js';

export function renderSMB() {
  const d = gd('smb');
  document.getElementById('smb-kpi').innerHTML = [
    kpi('일반후불 (최근월)', fmt(last(d.상품_일반후불)), '건', pct(last(d.상품_일반후불), prev(d.상품_일반후불)), 'gold', '', 'smb:일반후불'),
    kpi('운영후불 (최근월)', fmt(last(d.상품_운영후불)), '건', pct(last(d.상품_운영후불), prev(d.상품_운영후불)), 'teal', '', 'smb:운영후불'),
    kpi('인터넷순신규 (최근월)', fmt(last(d.인터넷순신규)), '건', pct(last(d.인터넷순신규), prev(d.인터넷순신규)), 'blue', '', 'smb:인터넷순신규'),
    kpi('기간 인터넷순신규 합계', fmt(sum(d.인터넷순신규)), '건', null, 'green', ''),
    kpi('전담 인력 (최근월)', fmt(last(d.인력_총원)), '명', pct(last(d.인력_총원), d.인력_총원[0]), 'purple', '소상공인 채널'),
    kpi('기간 일반후불 합계', fmt(sum(d.상품_일반후불)), '건', null, 'orange', ''),
  ].join('');

  bar('ch-smb-main', d.months, [
    { label: '일반후불', data: d.상품_일반후불 },
    { label: '운영후불', data: d.상품_운영후불, color: C.teal, bg: C.tealA },
    { label: '인터넷순신규', data: d.인터넷순신규, color: C.blue, bg: C.blueA }
  ], false);

  bar('ch-smb-hq', d.months, [
    { label: '강북', data: d.본부별_강북 },
    { label: '강남', data: d.본부별_강남, color: C.teal, bg: C.tealA },
    { label: '강서', data: d.본부별_강서, color: C.blue, bg: C.blueA },
    { label: '동부', data: d.본부별_동부, color: C.purple, bg: C.purpleA },
    { label: '서부', data: d.본부별_서부, color: C.orange, bg: C.orangeA }
  ], true);

  line('ch-smb-hr', d.months, [{ label: '전담 인력', data: d.인력_총원, fill: true }]);
}
