param(
  [Parameter(Mandatory = $true)]
  [string]$Path,
  [int]$SheetIndex = 0,
  [switch]$Summary,
  [switch]$Json,
  [int]$RowFrom = 1,
  [int]$RowTo = 30
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-CellValue {
  param(
    [xml]$SheetXml,
    [System.Collections.Generic.List[string]]$SharedStrings,
    [string]$Ref
  )

  $cell = $SheetXml.worksheet.sheetData.row.c | Where-Object { $_.r -eq $Ref } | Select-Object -First 1
  if (-not $cell) { return $null }
  if ($cell.t -eq 's') {
    $index = [int]$cell.v
    if ($index -ge 0 -and $index -lt $SharedStrings.Count) {
      return $SharedStrings[$index]
    }
    return $null
  }
  if ($cell.v) { return [string]$cell.v }
  return $null
}

function Get-RowCells {
  param(
    [xml]$SheetXml,
    [System.Collections.Generic.List[string]]$SharedStrings,
    [int]$RowNumber,
    [string[]]$Columns
  )

  $values = [ordered]@{}
  foreach ($column in $Columns) {
    $values[$column] = Get-CellValue -SheetXml $SheetXml -SharedStrings $SharedStrings -Ref ($column + $RowNumber)
  }
  return $values
}

$zip = [IO.Compression.ZipFile]::OpenRead($Path)
try {
  $workbookEntry = $zip.GetEntry('xl/workbook.xml')
  $relsEntry = $zip.GetEntry('xl/_rels/workbook.xml.rels')
  $sharedStringsEntry = $zip.GetEntry('xl/sharedStrings.xml')

  $workbookXml = [xml](New-Object IO.StreamReader($workbookEntry.Open())).ReadToEnd()
  $relsXml = [xml](New-Object IO.StreamReader($relsEntry.Open())).ReadToEnd()

  $sharedStrings = New-Object 'System.Collections.Generic.List[string]'
  if ($sharedStringsEntry) {
    $sharedXml = [xml](New-Object IO.StreamReader($sharedStringsEntry.Open())).ReadToEnd()
    foreach ($si in $sharedXml.sst.si) {
      $null = $sharedStrings.Add($si.InnerText)
    }
  }

  $nsWorkbook = New-Object System.Xml.XmlNamespaceManager($workbookXml.NameTable)
  $nsWorkbook.AddNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')
  $nsWorkbook.AddNamespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')

  $nsRels = New-Object System.Xml.XmlNamespaceManager($relsXml.NameTable)
  $nsRels.AddNamespace('r', 'http://schemas.openxmlformats.org/package/2006/relationships')

  $sheets = @()
  foreach ($sheet in $workbookXml.SelectNodes('//x:sheets/x:sheet', $nsWorkbook)) {
    $rid = $sheet.GetAttribute('id', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
    $rel = $relsXml.SelectSingleNode("//r:Relationship[@Id='$rid']", $nsRels)
    if (-not $rel) { continue }
    $target = $rel.Target
    if ($target -notmatch '^xl/') {
      $target = 'xl/' + $target.TrimStart('/')
    }
    $sheets += [pscustomobject]@{
      Name = $sheet.name
      Target = $target
    }
  }

  if ($Summary) {
    $summaryRows = $sheets | ForEach-Object {
      [pscustomobject]@{
        Name = $_.Name
        Target = $_.Target
      }
    }
    if ($Json) {
      $summaryRows | ConvertTo-Json -Depth 5
    } else {
      $summaryRows | Format-Table -AutoSize
    }
    return
  }

  if ($SheetIndex -lt 0 -or $SheetIndex -ge $sheets.Count) {
    throw "Invalid SheetIndex: $SheetIndex"
  }

  $sheetEntry = $zip.GetEntry($sheets[$SheetIndex].Target)
  if (-not $sheetEntry) {
    throw "Worksheet entry not found: $($sheets[$SheetIndex].Target)"
  }

  $sheetXml = [xml](New-Object IO.StreamReader($sheetEntry.Open())).ReadToEnd()
  $columns = @(
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R',
    'S','T','U','V','W','X','Y','Z','AA','AB','AC','AD','AE','AF','AG','AH','AI','AJ','AK','AL',
    'AM','AN','AO','AP','AQ','AR','AS','AT','AU','AV','AW','AX','AY','AZ'
  )

  $outputRows = @()
  for ($row = $RowFrom; $row -le $RowTo; $row++) {
    $cells = Get-RowCells -SheetXml $sheetXml -SharedStrings $sharedStrings -RowNumber $row -Columns $columns
    if (($cells.Values | Where-Object { $_ -ne $null }).Count -eq 0) { continue }
    $outputRows += [pscustomobject]@{
      Row = $row
      A = $cells['A']
      B = $cells['B']
      C = $cells['C']
      D = $cells['D']
      E = $cells['E']
      F = $cells['F']
      G = $cells['G']
      H = $cells['H']
      I = $cells['I']
      J = $cells['J']
      K = $cells['K']
      L = $cells['L']
      M = $cells['M']
      N = $cells['N']
      O = $cells['O']
      P = $cells['P']
      Q = $cells['Q']
      R = $cells['R']
      S = $cells['S']
      T = $cells['T']
      U = $cells['U']
      V = $cells['V']
      W = $cells['W']
      X = $cells['X']
      Y = $cells['Y']
      Z = $cells['Z']
      AA = $cells['AA']
      AB = $cells['AB']
      AC = $cells['AC']
      AD = $cells['AD']
      AE = $cells['AE']
      AF = $cells['AF']
      AG = $cells['AG']
      AH = $cells['AH']
      AI = $cells['AI']
      AJ = $cells['AJ']
      AK = $cells['AK']
      AL = $cells['AL']
      AM = $cells['AM']
      AN = $cells['AN']
      AO = $cells['AO']
      AP = $cells['AP']
      AQ = $cells['AQ']
      AR = $cells['AR']
      AS = $cells['AS']
      AT = $cells['AT']
      AU = $cells['AU']
      AV = $cells['AV']
      AW = $cells['AW']
      AX = $cells['AX']
      AY = $cells['AY']
      AZ = $cells['AZ']
    }
  }

  if ($Json) {
    $outputRows | ConvertTo-Json -Depth 5
  } else {
    $outputRows | Format-Table -AutoSize
  }
}
finally {
  $zip.Dispose()
}
