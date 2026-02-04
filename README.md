# 콩 한쪽

에어팟·갤럭시 버즈 짝 찾기 웹사이트입니다.

## 실행 방법

**방법 1 – Python (Node 없이)**  
이미 실행 중일 수 있습니다. 브라우저에서 **http://localhost:3000** 으로 접속하세요.

```bash
py -3 server.py
```

**방법 2 – Node.js**
```bash
npm install
npm start
```

## 기능

- **메인 (/**): 분실한 기기 종류 선택, 왼쪽/오른쪽 선택, 이름·전화번호·이메일 입력, 기기 사진 첨부 후 제출
- **운영자 페이지 (/admin.html)**: 제출된 내역과 사진 확인
- **미니 게임 (/games/)**: 5가지 게임 (가위바위보, 사다리타기, 제비뽑기, 10초 맞추기, 트럼프 뽑기). 완료 시 결과가 자동으로 운영자에게 전송됨
- **게임 결과 (운영자) (/games/admin.html)**: 게임 결과 목록 확인

## 데이터 저장 위치

- 제출 정보: `data/submissions.json`
- 업로드된 사진: `uploads/` 폴더
- 게임 결과: `data/game_results.json`

---

## GitHub 저장소 동기화

원격 저장소: **https://github.com/hoonsung0123-ai/conghanjjok.git**

Cursor에서 수정한 내용을 저장소에 반영하려면:

### 1) 처음 한 번만 (Git 설치 후)

프로젝트 폴더에서:

```bash
git init
git remote add origin https://github.com/hoonsung0123-ai/conghanjjok.git
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

이미 다른 곳에서 clone 했다면 `git remote add` 는 생략하고, `git push origin main` 만 사용하면 됩니다.

### 2) 완전 자동 푸시 (추천)

**Cursor에서 이 폴더를 열면** 파일 감시가 자동으로 켜지고, **저장할 때마다 약 5초 뒤 자동으로 GitHub에 푸시**됩니다.

- 처음 한 번: Cursor가 "이 폴더에서 자동 작업을 실행할까요?" 하면 **허용**을 선택하세요.
- 자동 실행을 끄려면: `Ctrl+Shift+P` → "Tasks: Manage Automatic Tasks in Folder" → "Disallow" 선택.

**수동으로 감시만 켜려면:** 터미널에서 `.\watch-and-push.ps1` 실행 후 창을 켜 두세요.

### 3) 수동 푸시

```powershell
.\sync-to-github.ps1
```

또는 `git add .` 후 `git commit` (훅으로 자동 push).
