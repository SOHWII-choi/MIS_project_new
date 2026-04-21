import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const RAW_PATH = path.join(ROOT, 'data', 'raw.js');
const CACHE_DIR = path.join(ROOT, 'audit_cache');
const MONTH_RE = /^'?\d{2}\.\d{1,2}월$/u;
const TOLERANCE = 1e-4;
const MIN_OVERLAP = 12;
const SCALE_FACTORS = [1, 100, 10, 0.1, 0.01, 1000, 0.001];
const COLUMNS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
  'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE',
  'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS',
  'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ',
];

const SOURCE_FILES = {
  finance: 'C:\\Users\\user\\Downloads\\경영성과 Factbook 편집본_20260317.164825\\경영성과_재무.xlsx',
  wireless: 'C:\\Users\\user\\Downloads\\경영성과 Factbook 편집본_20260317.164825\\경영성과_무선 가입자.xlsx',
  wired: 'C:\\Users\\user\\Downloads\\경영성과 Factbook 편집본_20260317.164825\\경영성과_유선 가입자.xlsx',
  org: 'C:\\Users\\user\\Downloads\\경영성과 Factbook 편집본_20260317.164825\\경영성과_유무선 가입자(조직별).xlsx [sheet: 유무선(조직별)]',
  digital: 'C:\\Users\\user\\Downloads\\경영성과_B2B(채널)_20260317.170236\\경영성과_디지털(채널).xlsx',
  b2b: 'C:\\Users\\user\\Downloads\\경영성과_B2B(채널)_20260317.170236\\경영성과_B2B(채널).xlsx',
  smb: 'C:\\Users\\user\\Downloads\\경영성과_B2B(채널)_20260317.170236\\경영성과_소상공인(채널).xlsx',
  platform: 'C:\\Users\\user\\Downloads\\경영성과_B2B(채널)_20260317.170236\\경영성과_유통플랫폼(채널).xlsx',
  tcsi: 'C:\\Users\\user\\Downloads\\경영성과_B2B(채널)_20260317.170236\\경영성과_TCSI(기타).xlsx',
  voc: 'C:\\Users\\user\\Downloads\\경영성과_B2B(채널)_20260317.170236\\경영성과_영업품질(기타).xlsx',
  hr: 'C:\\Users\\user\\Downloads\\경영성과_B2B(채널)_20260317.170236\\경영성과_인력(기타).xlsx',
  strategy: 'C:\\Users\\user\\Downloads\\경영성과_B2B(채널)_20260317.170236\\경영성과_전략상품(기타).xlsx',
};

const SPECIAL_NOTES = {
  infra: '현재 화면은 raw.infra가 아니라 utils/infra.js의 원본 엑셀 기반 시리즈를 사용하므로 본 자동감사에서는 제외',
};

function parseRaw(rawSource) {
  const jsonSource = rawSource
    .replace(/^[\s\S]*?export const RAW=/, '')
    .replace(/;\s*$/, '');
  return JSON.parse(jsonSource);
}

function parseNumber(value) {
  if (value == null) return null;
  const text = String(value).trim().replace(/,/g, '');
  if (!text || text === '-') return null;
  const num = Number(text);
  return Number.isFinite(num) ? num : null;
}

function normalizeMonth(value) {
  return String(value || '').trim().replace(/^'/, '');
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[\s\n\r\t/()_*:+\-.,%]/g, '')
    .toLowerCase();
}

function keyTokens(key) {
  return String(key)
    .split('_')
    .map((token) => normalizeText(token))
    .filter((token) => token.length >= 2);
}

function hasKeywordAffinity(key, label) {
  const labelNorm = normalizeText(label);
  const tokens = keyTokens(key);
  if (tokens.length === 0) return false;
  return tokens.some((token) => labelNorm.includes(token));
}

async function readWorkbookRows(category) {
  const cachePath = path.join(CACHE_DIR, `${category}.json`);
  const output = (await fs.readFile(cachePath, 'utf8')).replace(/^\uFEFF/, '');
  const rows = JSON.parse(output);
  return Array.isArray(rows) ? rows : [rows];
}

function buildWorkbookIndex(rows) {
  const header = rows.find((row) => row.Row === 1) || rows[0];
  const monthColumns = COLUMNS.filter((column) => MONTH_RE.test(normalizeMonth(header[column])));
  const months = monthColumns.map((column) => normalizeMonth(header[column]));
  const indexedRows = rows
    .filter((row) => row.Row !== 1)
    .map((row) => {
      const labelParts = ['A', 'B', 'C', 'D']
        .map((column) => String(row[column] || '').trim())
        .filter(Boolean);
      const values = Object.fromEntries(
        monthColumns.map((column, index) => [months[index], parseNumber(row[column])]),
      );
      return {
        row: row.Row,
        label: labelParts.join(' / '),
        values,
      };
    })
    .filter((row) => row.label || Object.values(row.values).some((value) => value != null));

  return { months, rows: indexedRows };
}

function getSeriesEntries(raw, category) {
  const data = raw[category];
  if (!data?.months) return [];
  return Object.entries(data)
    .filter(([key, value]) => key !== 'months' && Array.isArray(value))
    .map(([key, value]) => ({
      key,
      months: data.months,
      values: value,
    }));
}

function compareSeries(series, workbookRow) {
  let overlap = 0;
  let exact = 0;
  let totalAbs = 0;
  let maxAbs = 0;
  let bestScale = 1;

  for (const factor of SCALE_FACTORS) {
    let localOverlap = 0;
    let localExact = 0;
    let localTotalAbs = 0;
    let localMaxAbs = 0;

    for (let i = 0; i < series.months.length; i += 1) {
      const month = series.months[i];
      const rawValue = parseNumber(series.values[i]);
      const workbookValue = workbookRow.values[month];
      if (rawValue == null || workbookValue == null) continue;
      localOverlap += 1;
      const diff = Math.abs(rawValue - workbookValue * factor);
      localTotalAbs += diff;
      localMaxAbs = Math.max(localMaxAbs, diff);
      if (diff <= TOLERANCE) localExact += 1;
    }

    if (
      localOverlap > overlap ||
      (localOverlap === overlap && localExact > exact) ||
      (localOverlap === overlap && localExact === exact && localTotalAbs < totalAbs)
    ) {
      overlap = localOverlap;
      exact = localExact;
      totalAbs = localTotalAbs;
      maxAbs = localMaxAbs;
      bestScale = factor;
    }
  }

  return {
    overlap,
    exact,
    meanAbs: overlap ? totalAbs / overlap : Number.POSITIVE_INFINITY,
    maxAbs,
    scale: bestScale,
  };
}

function findBestMatch(series, workbook) {
  const candidates = workbook.rows
    .map((row) => {
      const metrics = compareSeries(series, row);
      return {
        row: row.row,
        label: row.label,
        ...metrics,
      };
    })
    .filter((candidate) => candidate.overlap >= Math.min(MIN_OVERLAP, series.months.length))
    .sort((a, b) => {
      if (b.exact !== a.exact) return b.exact - a.exact;
      if (a.meanAbs !== b.meanAbs) return a.meanAbs - b.meanAbs;
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      return a.row - b.row;
    });

  return candidates.slice(0, 3);
}

function classifyResult(seriesKey, bestMatch, expectedMonths) {
  if (!bestMatch) {
    return { status: 'no_match', detail: '비교 가능한 엑셀 행을 찾지 못함' };
  }

  const labelAffinity = hasKeywordAffinity(seriesKey, bestMatch.label);
  if (bestMatch.exact === bestMatch.overlap && bestMatch.meanAbs <= TOLERANCE && bestMatch.overlap < expectedMonths) {
    return {
      status: 'partial_exact',
      detail: `겹치는 ${bestMatch.overlap}개월은 엑셀 ${bestMatch.row}행과 정확히 일치하지만 원본 기간이 더 짧음`,
    };
  }

  if (bestMatch.exact === expectedMonths) {
    if (bestMatch.scale !== 1) {
      return {
        status: 'scaled_match',
        detail: `엑셀 ${bestMatch.row}행과 배율 ${bestMatch.scale} 적용 시 정확히 일치`,
      };
    }
    if (!labelAffinity) {
      return {
        status: 'name_mismatch',
        detail: `숫자는 엑셀 ${bestMatch.row}행과 정확히 일치하지만 행 이름이 어색함`,
      };
    }
    return {
      status: 'exact',
      detail: `엑셀 ${bestMatch.row}행과 정확히 일치`,
    };
  }

  if (bestMatch.exact >= Math.max(expectedMonths - 1, 1) && bestMatch.meanAbs <= 0.01) {
    return {
      status: 'near_exact',
      detail: `엑셀 ${bestMatch.row}행과 거의 일치 (평균 오차 ${bestMatch.meanAbs.toFixed(6)})`,
    };
  }

  return {
    status: 'mismatch',
    detail: `가장 가까운 값은 엑셀 ${bestMatch.row}행이지만 평균 오차 ${bestMatch.meanAbs.toFixed(6)}`,
  };
}

function formatTopMatches(matches) {
  return matches.map((match) => {
    const scaleText = match.scale !== 1 ? `, scale=${match.scale}` : '';
    return `row ${match.row} | ${match.label || '(라벨없음)'} | exact ${match.exact}/${match.overlap}, meanAbs ${match.meanAbs.toFixed(6)}${scaleText}`;
  });
}

async function main() {
  const rawSource = await fs.readFile(RAW_PATH, 'utf8');
  const raw = parseRaw(rawSource);

  const report = [];
  report.push(`# Dashboard Data Audit`);
  report.push(`generated_at: ${new Date().toISOString()}`);
  report.push('');

  for (const [category, note] of Object.entries(SPECIAL_NOTES)) {
    report.push(`## ${category}`);
    report.push(`- note: ${note}`);
    report.push('');
  }

  for (const [category, filePath] of Object.entries(SOURCE_FILES)) {
    const workbook = buildWorkbookIndex(await readWorkbookRows(category));
    const seriesEntries = getSeriesEntries(raw, category);
    const results = seriesEntries.map((series) => {
      const matches = findBestMatch(series, workbook);
      const best = matches[0];
      const classification = classifyResult(series.key, best, series.months.length);
      return {
        key: series.key,
        status: classification.status,
        detail: classification.detail,
        best,
        topMatches: formatTopMatches(matches),
      };
    });

    const summary = results.reduce((acc, result) => {
      acc[result.status] = (acc[result.status] || 0) + 1;
      return acc;
    }, {});

    report.push(`## ${category}`);
    report.push(`- workbook: ${filePath}`);
    report.push(`- month_columns: ${workbook.months.length}`);
    report.push(`- series_count: ${results.length}`);
    report.push(`- summary: ${Object.entries(summary).map(([key, value]) => `${key}=${value}`).join(', ')}`);
    report.push('');

    for (const result of results) {
      report.push(`### ${category}.${result.key}`);
      report.push(`- status: ${result.status}`);
      report.push(`- detail: ${result.detail}`);
      if (result.best) {
        report.push(`- best_match: row ${result.best.row} / ${result.best.label || '(라벨없음)'}`);
      }
      if (result.topMatches.length > 0) {
        report.push(`- candidates:`);
        for (const line of result.topMatches) {
          report.push(`  ${line}`);
        }
      }
      report.push('');
    }
  }

  process.stdout.write(report.join('\n'));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
