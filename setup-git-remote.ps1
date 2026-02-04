# GitHub 원격 저장소 한 번만 설정
# 사용: .\setup-git-remote.ps1

$ErrorActionPreference = "Stop"
$repoRoot = $PSScriptRoot
Set-Location $repoRoot

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git이 설치되어 있지 않습니다. https://git-scm.com 에서 설치 후 다시 실행하세요." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path .git)) {
    git init
    Write-Host "git init 완료." -ForegroundColor Green
}

$origin = git remote get-url origin 2>$null
if (-not $origin) {
    git remote add origin https://github.com/hoonsung0123-ai/conghanjjok.git
    Write-Host "원격 저장소 추가: https://github.com/hoonsung0123-ai/conghanjjok.git" -ForegroundColor Green
} else {
    Write-Host "이미 원격이 설정되어 있습니다: $origin" -ForegroundColor Gray
}

# 훅으로 커밋 후 자동 푸시 사용 (선택)
git config core.hooksPath .githooks 2>$null
Write-Host "설정 완료. 이제 sync-to-github.ps1 로 푸시하거나, git add / commit 후 자동으로 push 됩니다." -ForegroundColor Green
