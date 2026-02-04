# Cursor에서 파일이 저장될 때마다 자동으로 GitHub에 푸시 (완전 자동)
# 사용: .\watch-and-push.ps1  → 이 창을 켜 두면 파일 저장 시 자동 푸시

$repoRoot = $PSScriptRoot
$debounceSeconds = 5
$lastChange = [DateTime]::MinValue

$gitExe = "git"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    if (Test-Path "C:\Program Files\Git\cmd\git.exe") { $gitExe = "C:\Program Files\Git\cmd\git.exe" }
    else { Write-Host "Git을 찾을 수 없습니다." -ForegroundColor Red; exit 1 }
}

function Sync-ToGitHub {
    Set-Location $repoRoot | Out-Null
    $branch = & $gitExe rev-parse --abbrev-ref HEAD 2>$null
    if (-not $branch) { $branch = "main" }
    & $gitExe add -A 2>$null
    $status = & $gitExe status --short 2>$null
    if (-not $status) { return $false }
    $msg = "Update from Cursor - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    & $gitExe commit -m $msg 2>$null
    & $gitExe push origin $branch 2>$null
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] GitHub 푸시 완료" -ForegroundColor Green
    return $true
}

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $repoRoot
$watcher.IncludeSubdirectories = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]::FileName -bor [System.IO.NotifyFilters]::LastWrite

$action = {
    $path = $Event.SourceEventArgs.FullPath
    if ($path -match '\\.git\\' -or $path -match '\\node_modules\\' -or $path -match '\\data\\' -or $path -match '\\uploads\\') { return }
    $script:lastChange = Get-Date
}

Register-ObjectEvent -InputObject $watcher -EventName Changed -Action $action -SourceIdentifier Changed | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Created -Action $action -SourceIdentifier Created | Out-Null
$watcher.EnableRaisingEvents = $true

Write-Host "자동 GitHub 푸시 감시 중... (저장 후 ${debounceSeconds}초 뒤 푸시, 종료: Ctrl+C)" -ForegroundColor Cyan
Write-Host "폴더: $repoRoot`n" -ForegroundColor Gray

try {
    while ($true) {
        Start-Sleep -Seconds 2
        if ($lastChange -eq [DateTime]::MinValue) { continue }
        $elapsed = (Get-Date) - $lastChange
        if ($elapsed.TotalSeconds -ge $debounceSeconds) {
            $lastChange = [DateTime]::MinValue
            Sync-ToGitHub | Out-Null
        }
    }
} finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Get-EventSubscriber | Where-Object { $_.SourceIdentifier -in @('Changed','Created') } | Unregister-Event -ErrorAction SilentlyContinue
}
