param(
  [string]$OutDir = 'audit_cache'
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$reader = Join-Path $PSScriptRoot 'read_xlsx.ps1'
$outPath = Join-Path $root $OutDir

New-Item -ItemType Directory -Force -Path $outPath | Out-Null

$jobs = @(
  @{ Category = 'finance';  Path = 'C:\Users\user\Downloads\경영성과 Factbook 편집본_20260317.164825\경영성과_재무.xlsx'; RowTo = 60; SheetIndex = 0 },
  @{ Category = 'wireless'; Path = 'C:\Users\user\Downloads\경영성과 Factbook 편집본_20260317.164825\경영성과_무선 가입자.xlsx'; RowTo = 40; SheetIndex = 0 },
  @{ Category = 'wired';    Path = 'C:\Users\user\Downloads\경영성과 Factbook 편집본_20260317.164825\경영성과_유선 가입자.xlsx'; RowTo = 40; SheetIndex = 0 },
  @{ Category = 'org';      Path = 'C:\Users\user\Downloads\경영성과 Factbook 편집본_20260317.164825\경영성과_유무선 가입자(조직별).xlsx'; RowTo = 30; SheetIndex = 3 },
  @{ Category = 'digital';  Path = 'C:\Users\user\Downloads\경영성과_B2B(채널)_20260317.170236\경영성과_디지털(채널).xlsx'; RowTo = 40; SheetIndex = 0 },
  @{ Category = 'b2b';      Path = 'C:\Users\user\Downloads\경영성과_B2B(채널)_20260317.170236\경영성과_B2B(채널).xlsx'; RowTo = 60; SheetIndex = 0 },
  @{ Category = 'smb';      Path = 'C:\Users\user\Downloads\경영성과_B2B(채널)_20260317.170236\경영성과_소상공인(채널).xlsx'; RowTo = 40; SheetIndex = 0 },
  @{ Category = 'platform'; Path = 'C:\Users\user\Downloads\경영성과_B2B(채널)_20260317.170236\경영성과_유통플랫폼(채널).xlsx'; RowTo = 30; SheetIndex = 0 },
  @{ Category = 'tcsi';     Path = 'C:\Users\user\Downloads\경영성과_B2B(채널)_20260317.170236\경영성과_TCSI(기타).xlsx'; RowTo = 30; SheetIndex = 0 },
  @{ Category = 'voc';      Path = 'C:\Users\user\Downloads\경영성과_B2B(채널)_20260317.170236\경영성과_영업품질(기타).xlsx'; RowTo = 40; SheetIndex = 0 },
  @{ Category = 'hr';       Path = 'C:\Users\user\Downloads\경영성과_B2B(채널)_20260317.170236\경영성과_인력(기타).xlsx'; RowTo = 60; SheetIndex = 0 },
  @{ Category = 'strategy'; Path = 'C:\Users\user\Downloads\경영성과_B2B(채널)_20260317.170236\경영성과_전략상품(기타).xlsx'; RowTo = 40; SheetIndex = 0 }
)

foreach ($job in $jobs) {
  $target = Join-Path $outPath ($job.Category + '.json')
  Write-Host "[audit-cache] $($job.Category) -> $target"
  & $reader -Path $job.Path -SheetIndex $job.SheetIndex -Json -RowFrom 1 -RowTo $job.RowTo | Set-Content -Encoding utf8 $target
}
