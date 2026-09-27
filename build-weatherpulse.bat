@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo.
echo ========================================
echo        WeatherPulse Builder
echo ========================================
echo.

echo Updating data\backgrounds.json automatically...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$root=(Get-Location).Path; $bg=Join-Path $root 'images\background'; $out=Join-Path $root 'data\backgrounds.json'; $conditions=@('clear','partly-cloudy','cloudy','rain','snow','sleet','wind','fog'); $periods=@('day','night'); $entries=[ordered]@{}; foreach($condition in $conditions){ $entries[$condition]=[ordered]@{}; foreach($period in $periods){ $folder=Join-Path $bg ($condition+'\'+$period); $files=@(); if(Test-Path -LiteralPath $folder){ $files=@(Get-ChildItem -LiteralPath $folder -File | Where-Object { $_.Extension -in @('.jpg','.jpeg','.png','.webp') } | Sort-Object Name | ForEach-Object { $_.FullName.Substring($root.Length+1).Replace([IO.Path]::DirectorySeparatorChar,'/').Replace([IO.Path]::AltDirectorySeparatorChar,'/') }); } $entries[$condition][$period]=$files; } } $json=[ordered]@{version=3;entries=$entries} | ConvertTo-Json -Depth 6; Set-Content -LiteralPath $out -Value $json -Encoding UTF8; Write-Host 'Background index updated.'"
if errorlevel 1 (
    echo.
    echo ERROR: Could not update data\backgrounds.json.
    echo Make sure Windows PowerShell is available.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build completed successfully.
echo ========================================
echo.
echo Updated: data\backgrounds.json
echo.
echo Add images to the appropriate background folder and
echo double-click this BAT again. No JSON editing is needed.
echo.
pause
endlocal
