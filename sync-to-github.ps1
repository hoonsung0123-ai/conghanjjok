# Cursor에서 수정한 내용을 GitHub(hoonsung0123-ai/conghanjjok)에 푸시
# 사용: .\sync-to-github.ps1

$ErrorActionPreference = "Stop"
$repoRoot = $PSScriptRoot

Set-Location $repoRoot

# Git 있는지 확인
$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) {
    Write-Host "Git이 설치되어 있지 않거나 PATH에 없습니다. Git 설치 후 다시 실행하세요." -ForegroundColor Yellow
    exit 1
}

# 원격 설정 확인
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host "원격 저장소가 없습니다. 추가 중: https://github.com/hoonsung0123-ai/conghanjjok.git"
    git remote add origin https://github.com/hoonsung0123-ai/conghanjjok.git
}

$branch = git rev-parse --abbrev-ref HEAD 2>$null
if (-not $branch) { $branch = "main" }

git add -A
$status = git status --short
if (-not $status) {
    Write-Host "커밋할 변경 사항이 없습니다." -ForegroundColor Gray
    exit 0
}

$msg = "Update from Cursor - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git commit -m $msg
git push origin $branch
Write-Host "GitHub에 푸시했습니다. ($branch)" -ForegroundColor Green
