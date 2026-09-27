@echo off
setlocal
set "ROOT=%~dp0"
echo Generating WeatherPulse background index...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$root = [IO.Path]::GetFullPath('%ROOT%'); $base = Join-Path $root 'images\background'; $conditions = 'clear','partly-cloudy','cloudy','rain','snow','sleet','wind','fog'; $periods = 'day','night'; $exts = '.jpg','.jpeg','.png','.webp'; $entries = [ordered]@{}; foreach($c in $conditions){ $entries[$c]=[ordered]@{}; foreach($p in $periods){ $folder=Join-Path $base ($c+'\'+$p); $files=@(); if(Test-Path $folder){ $files=Get-ChildItem -LiteralPath $folder -File | Where-Object { $exts -contains $_.Extension.ToLower() } | Sort-Object Name | ForEach-Object { $_.FullName.Substring($root.Length).TrimStart('\').Replace('\','/') } }; $entries[$c][$p]=@($files) } }; $obj=[ordered]@{version=4;entries=$entries}; $json=$obj | ConvertTo-Json -Depth 6; Set-Content -LiteralPath (Join-Path $root 'data\backgrounds.json') -Value $json -Encoding UTF8"
if errorlevel 1 (
  echo Background index generation failed.
  exit /b 1
)
echo Background index updated successfully.
echo.
echo WeatherPulse build preparation completed.
echo You can now load the extension from this folder in Chrome.
pause
endlocal
