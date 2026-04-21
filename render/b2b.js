// render/b2b.js — B2B 채널 페이지 렌더
import { S, C } from '../utils/state.js';
import { gd, last, prev, fmt, pct, sum } from '../utils/calc.js';
import { bar, line } from '../utils/chart.js';
import { kpi } from '../utils/kpi.js';

export function renderB2B() {
  const d = gd('b2b');
  document.getElementById('b2b-kpi').innerHTML = [
    kpi('일반후불 (최근월)', fmt(last(d.전체_일반후불)), '건', pct(last(d.전체_일반후불), prev(d.전체_일반후불)), 'gold', 'B2B 전체', 'b2b:일반후불'),
    kpi('후불신규 (최근월)', fmt(last(d.전체_후불신규)), '건', pct(last(d.전체_후불신규), prev(d.전체_후불신규)), 'teal', '', 'b2b:후불신규'),
    kpi('무선순증 (최근월)', fmt(last(d.전체_무선순증)), '건', null, last(d.전체_무선순증) >= 0 ? 'green' : 'red', '', 'b2b:무선순증'),
    kpi('무선유지 가입자', fmt(last(d.가입자_무선유지)), '건', pct(last(d.가입자_무선유지), d.가입자_무선유지[0]), 'blue', 'B2B 전체', 'b2b:무선유지'),
    kpi('기업 무선유지', fmt(last(d.가입자_기업무선)), '건', pct(last(d.가입자_기업무선), d.가입자_기업무선[0]), 'purple', '기업채널', 'b2b:기업무선'),
    kpi('법인 무선유지', fmt(last(d.가입자_법인무선)), '건', pct(last(d.가입자_법인무선), d.가입자_법인무선[0]), 'orange', '법인채널', 'b2b:법인무선'),
  ].join('');

  bar('ch-b2b-main', d.months, [
    { label: '일반후불', data: d.전체_일반후불 },
    { label: '운영후불', data: d.전체_운영후불, color: C.teal, bg: C.tealA },
    { label: '후불신규', data: d.전체_후불신규, color: C.blue, bg: C.blueA }
  ], true);

  line('ch-b2b-seg', d.months, [{ label: '기업 일반후불', data: d.기업_일반후불 }, { label: '법인 일반후불', data: d.법인_일반후불, color: C.teal }]);
  line('ch-b2b-sub', d.months, [{ label: 'B2B 전체', data: d.가입자_무선유지 }, { label: '기업', data: d.가입자_기업무선, color: C.teal }, { label: '법인', data: d.가입자_법인무선, color: C.blue }]);
}
