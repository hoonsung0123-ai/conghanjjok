# Cursor에서 수정한 내용을 GitHub(hoonsung0123-ai/conghanjjok)에 푸시
# 사용: .\sync-to-github.ps1

$ErrorActionPreference = "Stop"
$repoRoot = $PSScriptRoot

Set-Location $repoRoot

# Git 경로 (PATH 또는 기본 설치 경로)
$gitExe = "git"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    $progGit = "C:\Program Files\Git\cmd\git.exe"
    if (Test-Path $progGit) { $gitExe = $progGit }
    else {
        Write-Host "Git이 설치되어 있지 않거나 PATH에 없습니다. Git 설치 후 다시 실행하세요." -ForegroundColor Yellow
        exit 1
    }
}

# 원격 설정 확인
$remote = & $gitExe remote get-url origin 2>$null
if (-not $remote) {
    Write-Host "원격 저장소가 없습니다. 추가 중: https://github.com/hoonsung0123-ai/conghanjjok.git"
    & $gitExe remote add origin https://github.com/hoonsung0123-ai/conghanjjok.git
}

$branch = & $gitExe rev-parse --abbrev-ref HEAD 2>$null
if (-not $branch) { $branch = "main" }

& $gitExe add -A
$status = & $gitExe status --short
if (-not $status) {
    Write-Host "커밋할 변경 사항이 없습니다." -ForegroundColor Gray
    exit 0
}

$msg = "Update from Cursor - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
& $gitExe commit -m $msg
& $gitExe push origin $branch
Write-Host "GitHub에 푸시했습니다. ($branch)" -ForegroundColor Green
