(function () {
  const results = { game1: null, game2: null, game3: null, game4: null, game5: null };

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(function (el) {
      el.classList.add('hidden');
      el.hidden = true;
    });
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('hidden');
      el.hidden = false;
    }
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ----- 게임 1: 가위바위보 -----
  document.getElementById('game1StartBtn').addEventListener('click', function () {
    document.getElementById('game1Start').hidden = true;
    document.getElementById('game1Play').hidden = false;
  });

  document.querySelectorAll('.rps-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (results.game1 !== null) return;
      const user = this.dataset.choice;
      results.game1 = { userChoice: user };
      document.getElementById('game1Result').textContent = '상대는 과연?';
      document.getElementById('game1Result').hidden = false;
      document.getElementById('game1Next').hidden = false;
    });
  });

  document.getElementById('game1Next').addEventListener('click', function () {
    showScreen('game2');
    document.getElementById('game2Start').hidden = false;
    document.getElementById('game2Play').hidden = true;
  });

  // ----- 게임 2: 사다리타기 (4줄, 꽝2 합격2) -----
  const LEVELS = 6;
  const COLS = 4;
  const COL_WIDTH = 56;
  const LEVEL_HEIGHT = 36;
  const POLE_WIDTH = 6;
  const RUNG_HEIGHT = 5;

  function buildLadderData() {
    const outcomes = shuffle(['당첨', '당첨', '꽝', '꽝']);
    const rungs = [];
    for (let level = 0; level < LEVELS; level++) {
      const pair = Math.random() < 0.7 ? Math.floor(Math.random() * 3) : -1;
      if (pair >= 0) rungs.push({ level: level, leftCol: pair });
    }
    function simulate(startCol) {
      let col = startCol;
      for (let lev = 0; lev < LEVELS; lev++) {
        const r = rungs.find(function (x) { return x.level === lev; });
        if (r && r.leftCol === col) col = col + 1;
        else if (r && r.leftCol === col - 1) col = col - 1;
      }
      return col;
    }
    const endCols = [0, 1, 2, 3].map(function (c) { return simulate(c); });
    return { outcomes: outcomes, rungs: rungs, simulate: simulate };
  }

  function drawLadder(ladderData, chosenNum) {
    const wrap = document.getElementById('ladderWrap');
    wrap.innerHTML = '';
    wrap.classList.remove('hidden');

    const w = (COLS - 1) * COL_WIDTH + 40;
    const resultBoxH = 28;
    const h = LEVELS * LEVEL_HEIGHT + 80 + resultBoxH + 8;
    const poleBottomY = LEVELS * LEVEL_HEIGHT + 48;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'ladder-svg');
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.setAttribute('width', Math.min(w, 320));
    svg.setAttribute('height', Math.min(h, 340));

    const wood = '#9a7b1a';
    const woodDark = '#6d5712';
    const pathPoints = chosenNum !== null ? [] : null;
    if (chosenNum !== null) {
      let col = chosenNum - 1;
      const cx = function (c) { return 20 + c * COL_WIDTH + POLE_WIDTH / 2; };
      const levelY = function (lev) { return 28 + lev * LEVEL_HEIGHT + LEVEL_HEIGHT / 2; };
      pathPoints.push({ x: cx(col), y: 24 });
      pathPoints.push({ x: cx(col), y: levelY(0) });
      for (let lev = 0; lev < LEVELS; lev++) {
        const y = levelY(lev);
        const r = ladderData.rungs.find(function (x) { return x.level === lev; });
        if (r && r.leftCol === col) {
          pathPoints.push({ x: cx(col + 1), y: y });
          col = col + 1;
        } else if (r && r.leftCol === col - 1) {
          pathPoints.push({ x: cx(col - 1), y: y });
          col = col - 1;
        }
        if (lev < LEVELS - 1) {
          pathPoints.push({ x: cx(col), y: levelY(lev + 1) });
        }
      }
      pathPoints.push({ x: cx(col), y: poleBottomY });
    }

    for (let c = 0; c < COLS; c++) {
      const x = 20 + c * COL_WIDTH;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x + POLE_WIDTH / 2);
      line.setAttribute('y1', 24);
      line.setAttribute('x2', x + POLE_WIDTH / 2);
      line.setAttribute('y2', poleBottomY);
      line.setAttribute('stroke', wood);
      line.setAttribute('stroke-width', POLE_WIDTH);
      line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);
    }

    ladderData.rungs.forEach(function (r) {
      const x1 = 20 + r.leftCol * COL_WIDTH + POLE_WIDTH / 2;
      const x2 = 20 + (r.leftCol + 1) * COL_WIDTH + POLE_WIDTH / 2;
      const y = 28 + r.level * LEVEL_HEIGHT + LEVEL_HEIGHT / 2;
      const bar = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      bar.setAttribute('x1', x1);
      bar.setAttribute('y1', y);
      bar.setAttribute('x2', x2);
      bar.setAttribute('y2', y);
      bar.setAttribute('stroke', woodDark);
      bar.setAttribute('stroke-width', RUNG_HEIGHT);
      bar.setAttribute('stroke-linecap', 'round');
      svg.appendChild(bar);
    });

    if (pathPoints && pathPoints.length >= 2) {
      const pathLine = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      const pts = pathPoints.map(function (p) { return p.x + ',' + p.y; }).join(' ');
      pathLine.setAttribute('points', pts);
      pathLine.setAttribute('fill', 'none');
      pathLine.setAttribute('stroke', '#e74c3c');
      pathLine.setAttribute('stroke-width', 8);
      pathLine.setAttribute('stroke-linecap', 'round');
      pathLine.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(pathLine);
    }

    var boxH = resultBoxH;
    var boxY = h - 8;
    var boxW = COL_WIDTH - 4;
    for (var c = 0; c < COLS; c++) {
      var cx = 20 + c * COL_WIDTH + POLE_WIDTH / 2;
      var boxCenterX = cx;
      var boxTopY = boxY - boxH;
      var boxX = boxCenterX - boxW / 2;
      var conn = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      conn.setAttribute('x1', cx);
      conn.setAttribute('y1', poleBottomY);
      conn.setAttribute('x2', boxCenterX);
      conn.setAttribute('y2', boxTopY);
      conn.setAttribute('stroke', wood);
      conn.setAttribute('stroke-width', POLE_WIDTH);
      conn.setAttribute('stroke-linecap', 'round');
      svg.appendChild(conn);
      var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', boxX);
      rect.setAttribute('y', boxTopY);
      rect.setAttribute('width', boxW);
      rect.setAttribute('height', boxH);
      rect.setAttribute('rx', 6);
      rect.setAttribute('fill', ladderData.outcomes[c] === '당첨' ? '#1e5631' : '#6b2a2a');
      svg.appendChild(rect);
      var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', boxCenterX);
      text.setAttribute('y', boxTopY + boxH / 2 + 5);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#fff');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('font-size', '14');
      text.textContent = ladderData.outcomes[c];
      svg.appendChild(text);
    }

    wrap.appendChild(svg);
  }

  let ladderData = null;

  document.getElementById('game2StartBtn').addEventListener('click', function () {
    document.getElementById('game2Start').hidden = true;
    document.getElementById('game2Play').hidden = false;
    document.getElementById('game2Result').hidden = true;
    document.getElementById('game2Next').hidden = true;
    document.getElementById('ladderChoose').hidden = false;
    document.getElementById('ladderWrap').classList.add('hidden');
    document.getElementById('ladderWrap').innerHTML = '';
    ladderData = buildLadderData();
  });

  document.querySelectorAll('.ladder-num-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (results.game2 !== null || !ladderData) return;
      const num = parseInt(this.dataset.num, 10);
      const endCol = ladderData.simulate(num - 1);
      const result = ladderData.outcomes[endCol];
      results.game2 = { start: num, result: result };
      document.getElementById('ladderChoose').hidden = true;
      document.getElementById('game2PromptChoose').hidden = true;
      drawLadder(ladderData, num);
      document.getElementById('game2Result').innerHTML = '<strong>' + num + '번</strong> → <span class="ladder-result-box ' + (result === '당첨' ? 'hit' : 'miss') + '">' + result + '</span>';
      document.getElementById('game2Result').hidden = false;
      document.getElementById('game2Next').hidden = false;
    });
  });

  document.getElementById('game2Next').addEventListener('click', function () {
    showScreen('game3');
    document.getElementById('game3Start').hidden = false;
    document.getElementById('game3Play').hidden = true;
  });

  // ----- 게임 3: 제비뽑기 (6개 중 꽝3 합격3) -----
  function buildSticks() {
    const arr = ['꽝', '꽝', '꽝', '합격', '합격', '합격'];
    const shuffled = shuffle(arr);
    const wrap = document.getElementById('game3Sticks');
    wrap.innerHTML = '';
    shuffled.forEach(function (val, i) {
      const stick = document.createElement('div');
      stick.className = 'stick';
      stick.textContent = '?';
      stick.dataset.result = val;
      stick.dataset.index = String(i);
      stick.addEventListener('click', function () {
        if (this.classList.contains('revealed')) return;
        this.classList.add('revealed');
        this.textContent = val;
        this.classList.add(val === '합격' ? 'hit' : 'miss');
        results.game3 = { choice: i + 1, result: val };
        document.getElementById('game3Result').textContent = (i + 1) + '번 제비 → ' + val + '!';
        document.getElementById('game3Result').hidden = false;
        document.getElementById('game3Next').hidden = false;
      });
      wrap.appendChild(stick);
    });
  }

  document.getElementById('game3StartBtn').addEventListener('click', function () {
    document.getElementById('game3Start').hidden = true;
    document.getElementById('game3Play').hidden = false;
    document.getElementById('game3Result').hidden = true;
    document.getElementById('game3Next').hidden = true;
    buildSticks();
  });

  document.getElementById('game3Next').addEventListener('click', function () {
    showScreen('game4');
    document.getElementById('game4Start').hidden = false;
    document.getElementById('game4Play').hidden = true;
    document.getElementById('game4StopBtn').disabled = true;
  });

  // ----- 게임 4: 10초 스톱워치 (Start 1회, Stop 1회) -----
  let stopwatchStart = null;
  let stopwatchId = null;

  document.getElementById('game4StartBtn').addEventListener('click', function () {
    this.disabled = true;
    document.getElementById('game4Start').hidden = true;
    document.getElementById('game4Play').hidden = false;
    document.getElementById('game4StopBtn').disabled = false;
    document.getElementById('game4Result').hidden = true;
    document.getElementById('game4Next').hidden = true;
    stopwatchStart = Date.now();
    const el = document.getElementById('stopwatch');
    stopwatchId = setInterval(function () {
      el.textContent = ((Date.now() - stopwatchStart) / 1000).toFixed(2);
    }, 20);
  });

  document.getElementById('game4StopBtn').addEventListener('click', function () {
    if (!stopwatchStart || stopwatchId === null) return;
    this.disabled = true;
    clearInterval(stopwatchId);
    stopwatchId = null;
    const sec = ((Date.now() - stopwatchStart) / 1000).toFixed(2);
    results.game4 = { recordedSeconds: parseFloat(sec) };
    document.getElementById('game4Result').textContent = '기록: ' + sec + '초';
    document.getElementById('game4Result').hidden = false;
    document.getElementById('game4Next').hidden = false;
  });

  document.getElementById('game4Next').addEventListener('click', function () {
    showScreen('game5');
    document.getElementById('game5Start').hidden = false;
    document.getElementById('game5Play').hidden = true;
  });

  // ----- 게임 5: 트럼프 카드 (A,2..10 중 하나) -----
  const CARD_VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  function buildCards() {
    const shuffled = shuffle(CARD_VALUES.slice());
    const wrap = document.getElementById('game5Cards');
    wrap.innerHTML = '';
    shuffled.forEach(function (val, i) {
      const card = document.createElement('div');
      card.className = 'card';
      card.textContent = '?';
      card.dataset.value = val;
      card.dataset.index = String(i);
      card.addEventListener('click', function () {
        if (this.classList.contains('flipped')) return;
        document.querySelectorAll('#game5Cards .card').forEach(function (c) { c.classList.remove('chosen'); });
        this.classList.add('flipped', 'chosen');
        this.textContent = val;
        results.game5 = { drawn: val };
        document.getElementById('game5Result').textContent = '뽑은 카드: ' + val;
        document.getElementById('game5Result').hidden = false;
        document.getElementById('game5Next').hidden = false;
      });
      wrap.appendChild(card);
    });
  }

  document.getElementById('game5StartBtn').addEventListener('click', function () {
    document.getElementById('game5Start').hidden = true;
    document.getElementById('game5Play').hidden = false;
    document.getElementById('game5Result').hidden = true;
    document.getElementById('game5Next').hidden = true;
    buildCards();
  });

  document.getElementById('game5Next').addEventListener('click', function () {
    showScreen('gameDone');
    document.getElementById('doneSummary').hidden = true;
    document.getElementById('doneMessage').textContent = '결과를 운영자에게 전송 중입니다...';
    document.getElementById('doneMessage').hidden = false;

    const payload = {
      game1: results.game1,
      game2: results.game2,
      game3: results.game3,
      game4: results.game4,
      game5: results.game5,
      completedAt: new Date().toISOString()
    };

    fetch('/api/game-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json().catch(function () { return {}; }); })
      .then(function () {
        document.getElementById('doneMessage').innerHTML = '운영자에게 결과가 전송되었습니다.<br><strong>승패는 이메일로 알려드리겠습니다!!</strong>';
        const sum = document.getElementById('doneSummary');
        sum.innerHTML =
          '1. 가위바위보(뽑은 것): ' + (results.game1 ? results.game1.userChoice : '-') + '<br>' +
          '2. 사다리: ' + (results.game2 ? results.game2.result : '-') + '<br>' +
          '3. 제비뽑기: ' + (results.game3 ? results.game3.result : '-') + '<br>' +
          '4. 10초 맞추기: ' + (results.game4 ? results.game4.recordedSeconds + '초' : '-') + '<br>' +
          '5. 트럼프 카드: ' + (results.game5 ? results.game5.drawn : '-');
        sum.hidden = false;
      })
      .catch(function () {
        document.getElementById('doneMessage').textContent = '전송에 실패했습니다. 다시 시도해 주세요.';
      });
  });
})();
