// main.js — ES Module 진입점
import { RAW } from './data/raw.js';
import { S, C, COLORS, COLORS_A, COLORS_BAR, MENUS, AI_MODEL } from './utils/state.js';
import { showToast } from './utils/toast.js';
import { sl, sum, last, prev, fmt, pct, gd, getPL, getYear, getMon, yoySum } from './utils/calc.js';
import { mkC, baseOpts, makeDonut, addSparklines, line, bar } from './utils/chart.js';
import { kpi, openKpiPopup, closeKpiPanel, initKpiEvents } from './utils/kpi.js';
import { buildPB, selY, updP } from './utils/period.js';
import { buildSidebar, nav, toggleSidebar, closeSidebar, showForecastBtn, isMobile } from './utils/nav.js';
import {
  getApiKey, saveApiKeyLocal, clearApiKey, updateApiKeyBtn,
  openApiKey, closeApiKey, toggleApiKeyVisible, onApiKeyInput, saveApiKey,
  callAI, setAILoading, setAIResult, setAIError
} from './utils/ai.js';

import { renderFinance, calcChannelFinance, selectFinCh, runFinanceAI, runChannelAI } from './render/finance.js';
import { renderWireless, openWlMonthModal } from './render/wireless.js';
import { renderWired } from './render/wired.js';
import { renderOrg } from './render/org.js';
import { renderDigital } from './render/digital.js';
import { renderB2B } from './render/b2b.js';
import { renderSMB } from './render/smb.js';
import { renderPlatform } from './render/platform.js';
import { renderQuality } from './render/quality.js';
import { renderInfra } from './render/infra.js';
import { renderStrategy } from './render/strategy.js';
import { renderHR } from './render/hr.js';
import {
  UPLOAD_H, METRICS_L, USERS_FULL,
  renderAdminOverview, openUploadDetail, redownloadFile,
  buildSrcPicker, selectMetricSrc, renderFieldList, selectMetricField, clearMetricSrc,
  renderAdminUpload, renderAdminMetrics, toggleMetric, openMetricEdit, openMetricAdd,
  saveMetric, deleteMetric,
  renderAdminUsers, togglePw, openUserEdit, openUserAdd, saveUser, deleteUser,
  openFindModal, switchFindTab, doFind,
  renderAdminBeta, previewPage, doDeploy
} from './render/admin.js';
import {
  openForecast, closeForecast, switchFtab,
  renderFtab, renderFtabShort, renderFtabMid, renderFtabRisk, renderFtabScenario,
  buildForecastContext, runForecastAI
} from './render/forecast.js';

// ── Chart.js 전역 설정 (CDN 전역 Chart 사용) ──
Chart.defaults.color = '#8b93b8';
Chart.defaults.font.family = "'Noto Sans KR',sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.animation = false;
Chart.defaults.animations = false;
Chart.defaults.transitions = {};
try {
  Chart.defaults.plugins.tooltip.animation = false;
  ['line', 'bar', 'doughnut', 'pie', 'radar', 'scatter', 'polarArea'].forEach(t => {
    if (!Chart.overrides[t]) Chart.overrides[t] = {};
    Chart.overrides[t].animation = false;
    Chart.overrides[t].animations = false;
    Chart.overrides[t].transitions = {};
  });
} catch (e) {}

// ── window 노출 (app.js 및 인라인 onclick 호환) ──
Object.assign(window, {
  // state
  S, C, COLORS, COLORS_A, COLORS_BAR, MENUS, AI_MODEL, RAW,

  // toast
  showToast,

  // calc
  sl, sum, last, prev, fmt, pct, gd, getPL, getYear, getMon, yoySum,

  // chart
  mkC, baseOpts, makeDonut, addSparklines, line, bar,

  // kpi
  kpi, openKpiPopup, closeKpiPanel,

  // period
  buildPB, selY, updP,

  // nav
  buildSidebar, nav, toggleSidebar, closeSidebar, showForecastBtn, isMobile,

  // ai
  getApiKey, saveApiKeyLocal, clearApiKey, updateApiKeyBtn,
  openApiKey, closeApiKey, toggleApiKeyVisible, onApiKeyInput, saveApiKey,
  callAI, setAILoading, setAIResult, setAIError,

  // render — pages
  renderFinance, calcChannelFinance, selectFinCh, runFinanceAI, runChannelAI,
  renderWireless, openWlMonthModal,
  renderWired,
  renderOrg,
  renderDigital,
  renderB2B,
  renderSMB,
  renderPlatform,
  renderQuality,
  renderInfra,
  renderStrategy,
  renderHR,

  // render — admin
  UPLOAD_H, METRICS_L, USERS_FULL,
  renderAdminOverview, openUploadDetail, redownloadFile,
  buildSrcPicker, selectMetricSrc, renderFieldList, selectMetricField, clearMetricSrc,
  renderAdminUpload, renderAdminMetrics, toggleMetric, openMetricEdit, openMetricAdd,
  saveMetric, deleteMetric,
  renderAdminUsers, togglePw, openUserEdit, openUserAdd, saveUser, deleteUser,
  openFindModal, switchFindTab, doFind,
  renderAdminBeta, previewPage, doDeploy,

  // render — forecast
  openForecast, closeForecast, switchFtab,
  renderFtab, renderFtabShort, renderFtabMid, renderFtabRisk, renderFtabScenario,
  buildForecastContext, runForecastAI,
});

// ── RENDER_MAP (app.js가 읽는 window.RENDER_MAP) ──
window.RENDER_MAP = {
  finance:  () => { buildPB('pb-finance',  'renderFinance');  renderFinance(); },
  wireless: () => { buildPB('pb-wireless', 'renderWireless'); renderWireless(); },
  wired:    () => { buildPB('pb-wired',    'renderWired');    renderWired(); },
  org:      () => { buildPB('pb-org',      'renderOrg');      renderOrg(); },
  digital:  () => { buildPB('pb-digital',  'renderDigital');  renderDigital(); },
  b2b:      () => { buildPB('pb-b2b',      'renderB2B');      renderB2B(); },
  smb:      () => { buildPB('pb-smb',      'renderSMB');      renderSMB(); },
  platform: () => { buildPB('pb-platform', 'renderPlatform'); renderPlatform(); },
  quality:  () => { buildPB('pb-quality',  'renderQuality');  renderQuality(); },
  infra:    () => { buildPB('pb-infra',    'renderInfra');    renderInfra(); },
  strategy: () => { buildPB('pb-strategy', 'renderStrategy'); renderStrategy(); },
  hr:       () => { buildPB('pb-hr',       'renderHR');       renderHR(); },
  'admin-overview': renderAdminOverview,
  'admin-upload':   renderAdminUpload,
  'admin-metrics':  renderAdminMetrics,
  'admin-users':    renderAdminUsers,
  'admin-export':   () => { if (window.initEditMonthSelect) window.initEditMonthSelect(); if (window.loadEditData) window.loadEditData(); },
  'admin-beta':     renderAdminBeta,
};

// ── KPI 이벤트 초기화 ──
initKpiEvents();
