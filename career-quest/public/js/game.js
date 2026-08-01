// Career Quest - Online Multiplayer Client (SSE + REST)

const API = ''; // same origin

let state = {
  playerId: null,
  roomCode: null,
  room: null,
  es: null // EventSource
};

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

async function api(path, method, body) {
  const opts = { method: method || 'GET', headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API + path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error');
  return data;
}

function subscribe() {
  if (state.es) state.es.close();
  const url = API + '/api/subscribe?code=' + state.roomCode + '&playerId=' + state.playerId;
  state.es = new EventSource(url);
  state.es.addEventListener('state', (e) => {
    state.room = JSON.parse(e.data);
    onStateUpdate();
  });
  state.es.onerror = () => {
    // reconnect after a bit
    setTimeout(() => { if (state.roomCode) subscribe(); }, 2000);
  };
}

function onStateUpdate() {
  const r = state.room;
  if (!r) return;

  if (r.phase === 'lobby') {
    showPage('lobby');
    document.getElementById('lobby-room-name').textContent = r.name;
    document.getElementById('lobby-code').textContent = r.code;
    document.getElementById('lobby-players').innerHTML = r.players.map(p =>
      '<div class="player-chip ' + (p.isHost ? 'host' : '') + '"><div class="avatar" style="background:' + p.color + '">' + p.avatar + '</div><span>' + p.name + '</span></div>'
    ).join('');
    const startBtn = document.getElementById('lobby-start-btn');
    if (r.hostId === state.playerId) {
      startBtn.classList.remove('hidden');
      startBtn.disabled = r.players.length < 2;
      startBtn.textContent = r.players.length < 2 ? 'รอผู้เล่นอย่างน้อย 2 คน' : 'เริ่มเกม (' + r.players.length + '/' + r.maxPlayers + ')';
    } else {
      startBtn.classList.add('hidden');
      document.getElementById('lobby-status').textContent = 'รอ Host เริ่มเกม... (' + r.players.length + '/' + r.maxPlayers + ')';
    }
  } else if (r.phase === 'career') {
    showPage('career-select');
    const current = r.players[r.selectingIndex];
    document.getElementById('current-selector').textContent = current ? current.name : '-';
    const isMyTurn = current && current.id === state.playerId;
    document.getElementById('careers-grid').innerHTML = CAREERS.map(c =>
      '<div class="career-card' + (isMyTurn ? '' : ' disabled') + '" onclick="' + (isMyTurn ? "selectCareer('" + c.id + "')" : '') + '">' +
      '<div class="icon">' + c.icon + '</div><h3>' + c.nameTh + '</h3>' +
      '<div class="salary">รายได้ ' + c.salary.toLocaleString() + ' บาท/รอบ</div>' +
      '<div class="bonus">' + (c.bonus || '') + '</div></div>'
    ).join('');
  } else if (r.phase === 'playing') {
    showPage('game');
    renderGame();
  } else if (r.phase === 'ended') {
    showPage('game-over');
    renderGameOver();
  }
}

// ===== Create / Join =====
let playerCount = 4;
function changePlayerCount(d) {
  playerCount = Math.max(3, Math.min(5, playerCount + d));
  document.getElementById('player-count').textContent = playerCount;
}

async function createRoom() {
  const roomName = document.getElementById('room-name').value.trim() || 'ห้อง Career Quest';
  const hostName = document.getElementById('host-name').value.trim();
  if (!hostName) { alert('กรุณาใส่ชื่อ'); return; }
  try {
    const data = await api('/api/create', 'POST', { roomName, hostName, maxPlayers: playerCount });
    state.playerId = data.playerId;
    state.roomCode = data.room.code;
    state.room = data.room;
    subscribe();
    showPage('lobby');
    document.getElementById('lobby-room-name').textContent = data.room.name;
    document.getElementById('lobby-code').textContent = data.room.code;
    onStateUpdate();
  } catch (e) { alert(e.message); }
}

async function joinRoom() {
  const code = document.getElementById('join-code').value.trim().toUpperCase();
  const name = document.getElementById('join-name').value.trim();
  if (!code) { alert('ใส่รหัสห้อง'); return; }
  if (!name) { alert('ใส่ชื่อ'); return; }
  try {
    const data = await api('/api/join', 'POST', { code, name });
    state.playerId = data.playerId;
    state.roomCode = data.room.code;
    state.room = data.room;
    subscribe();
    onStateUpdate();
  } catch (e) { alert(e.message); }
}

async function startGame() {
  try {
    await api('/api/action', 'POST', { code: state.roomCode, playerId: state.playerId, action: 'start' });
  } catch (e) { alert(e.message); }
}

async function selectCareer(careerId) {
  try {
    await api('/api/action', 'POST', {
      code: state.roomCode, playerId: state.playerId,
      action: 'selectCareer', payload: { careerId }
    });
  } catch (e) { alert(e.message); }
}

// ===== Game UI =====
function renderGame() {
  const r = state.room;
  document.getElementById('current-round').textContent = r.round;
  const cur = r.players[r.currentPlayerIndex];
  document.getElementById('current-player-name').textContent = cur ? cur.name : '-';

  // Players panel
  document.getElementById('players-panel').innerHTML = r.players.map((p, i) =>
    '<div class="player-card ' + (i === r.currentPlayerIndex ? 'active' : '') + '">' +
    '<div class="name"><span style="color:' + p.color + '">' + p.avatar + '</span> ' + p.name + ' ' + (p.career ? p.career.icon : '') + '</div>' +
    '<div class="stats"><span class="money">💰 ' + p.money.toLocaleString() + '</span><span>🏦 ' + p.savings.toLocaleString() + '</span>' +
    '<span>⭐ Lv.' + p.level + '</span><span>❤️ ' + p.life + '/10</span>' +
    '<span>🎯 ' + p.skills.length + ' ทักษะ</span><span>' + (p.career ? p.career.nameTh : '-') + '</span></div></div>'
  ).join('');

  // Board
  const board = document.getElementById('game-board');
  if (!board.children.length) buildBoard();
  updateTokens();

  // Log
  const logEl = document.getElementById('game-log');
  logEl.innerHTML = (r.log || []).slice().reverse().map(l =>
    '<div class="log-entry' + (l.msg.indexOf('——') >= 0 ? ' highlight' : '') + '">' + l.msg + '</div>'
  ).join('');

  // Dice button
  const isMyTurn = cur && cur.id === state.playerId;
  const canRoll = isMyTurn && !r.pendingAction;
  document.getElementById('roll-btn').disabled = !canRoll;

  // Pending action modal
  if (r.pendingAction && r.pendingAction.playerId === state.playerId) {
    showPendingModal(r.pendingAction);
  } else {
    hideModal();
  }
}

function buildBoard() {
  const board = document.getElementById('game-board');
  board.innerHTML = '';
  BOARD_LAYOUT.forEach((cell, i) => {
    const div = document.createElement('div');
    div.className = 'cell ' + cell.type;
    div.id = 'cell-' + i;
    div.innerHTML = '<span class="cell-icon">' + cell.icon + '</span><span class="cell-label">' + cell.label + '</span><div class="tokens" id="tokens-' + i + '"></div>';
    board.appendChild(div);
  });
}

function updateTokens() {
  for (let i = 0; i < 40; i++) {
    const t = document.getElementById('tokens-' + i);
    if (t) t.innerHTML = '';
  }
  (state.room.players || []).forEach(p => {
    const t = document.getElementById('tokens-' + p.position);
    if (t) {
      const tok = document.createElement('div');
      tok.className = 'token';
      tok.style.background = p.color;
      tok.title = p.name;
      t.appendChild(tok);
    }
  });
}

async function rollDice() {
  const btn = document.getElementById('roll-btn');
  btn.disabled = true;
  const diceEl = document.getElementById('dice-face');
  diceEl.classList.add('rolling');
  const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
  let n = 0;
  const iv = setInterval(() => {
    diceEl.textContent = faces[Math.floor(Math.random()*6)];
    n++;
    if (n > 8) {
      clearInterval(iv);
      diceEl.classList.remove('rolling');
      doRoll();
    }
  }, 70);
}

async function doRoll() {
  try {
    const data = await api('/api/action', 'POST', {
      code: state.roomCode, playerId: state.playerId, action: 'roll'
    });
    if (data.dice) {
      const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
      document.getElementById('dice-face').textContent = faces[data.dice - 1];
      document.getElementById('dice-result').textContent = 'ทอยได้ ' + data.dice;
      document.getElementById('dice-result').classList.remove('hidden');
    }
  } catch (e) { alert(e.message); document.getElementById('roll-btn').disabled = false; }
}

// ===== Modals for pending actions =====
function showModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('hidden');
}
function hideModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

function showPendingModal(pa) {
  if (pa.type === 'skill') {
    showModal('<h3>⭐ เลือกทักษะใหม่</h3><div class="modal-options">' +
      pa.options.map(s => '<div class="modal-option" onclick="doAction(\'skill\',{skillId:\'' + s.id + '\'})"><div class="opt-title">' + s.icon + ' ' + s.name + '</div></div>').join('') +
      '</div>');
  } else if (pa.type === 'saving') {
    showModal('<h3>🏦 ออมเงิน</h3><div class="modal-options">' +
      pa.options.map(a => '<div class="modal-option" onclick="doAction(\'saving\',{amount:' + a + '})"><div class="opt-title">' + (a === 0 ? 'ไม่ออม' : 'ออม ' + a.toLocaleString() + ' บาท') + '</div></div>').join('') +
      '</div>');
  } else if (pa.type === 'investment') {
    showModal('<h3>📈 เลือกลงทุน</h3><div class="modal-options">' +
      pa.options.map(o => '<div class="modal-option" onclick="doAction(\'investment\',{invId:\'' + o.id + '\'})"><div class="opt-title">' + o.icon + ' ' + o.name + (o.cost ? ' (' + o.cost.toLocaleString() + ')' : '') + '</div><div class="opt-desc">' + o.desc + '</div></div>').join('') +
      '</div>');
  } else if (pa.type === 'event') {
    const m = pa.event.money;
    showModal('<h3>' + pa.event.icon + ' ' + pa.event.name + '</h3><p style="text-align:center;font-size:1.2rem;color:' + (m >= 0 ? 'var(--success)' : 'var(--danger)') + '">' + (m > 0 ? '+' : '') + (m !== 0 ? m.toLocaleString() + ' บาท' : 'ไม่มีผลเงิน') + '</p><div class="modal-actions"><button class="btn btn-primary" onclick="doAction(\'event\',{})">ตกลง</button></div>');
  } else if (pa.type === 'opportunity') {
    showModal('<h3>🚪 โอกาสเลื่อนตำแหน่ง!</h3><p style="text-align:center;color:var(--success)">รายได้ +1,500 และ Level +1</p><div class="modal-actions"><button class="btn btn-success" onclick="doAction(\'opportunity\',{promote:true})">เลื่อนตำแหน่ง!</button><button class="btn btn-outline" onclick="doAction(\'opportunity\',{promote:false})">ข้าม</button></div>');
  } else if (pa.type === 'life') {
    showModal('<h3>' + pa.event.icon + ' ' + pa.event.name + '</h3><p style="text-align:center">คุณภาพชีวิต ' + (pa.event.life > 0 ? '+' : '') + pa.event.life + '</p><div class="modal-actions"><button class="btn btn-primary" onclick="doAction(\'life\',{})">ตกลง</button></div>');
  }
}

async function doAction(action, payload) {
  hideModal();
  try {
    await api('/api/action', 'POST', {
      code: state.roomCode, playerId: state.playerId, action, payload
    });
  } catch (e) { alert(e.message); }
}

function showScoreboard() {
  if (!state.room) return;
  const ranked = state.room.players.map(p => {
    const sav = Math.min(40, Math.floor(p.savings / 1250));
    const car = Math.min(30, p.level * 6);
    const ski = Math.min(20, Math.floor(p.skills.length * 3.4));
    const lif = Math.min(10, p.life);
    return Object.assign({}, p, { score: { total: sav+car+ski+lif } });
  }).sort((a,b) => b.score.total - a.score.total);
  document.getElementById('scoreboard-content').innerHTML = ranked.map((p, i) =>
    '<div class="final-player ' + (i===0?'rank-1':'') + '"><div class="rank">' + (i+1) + '</div><div class="details"><strong>' + p.avatar + ' ' + p.name + '</strong></div><div class="score">' + p.score.total + '</div></div>'
  ).join('');
  document.getElementById('scoreboard-modal').classList.remove('hidden');
}
function hideScoreboard() { document.getElementById('scoreboard-modal').classList.add('hidden'); }

function renderGameOver() {
  const ranked = state.room.finalRanking || [];
  if (!ranked.length) return;
  const w = ranked[0];
  document.getElementById('final-results').innerHTML =
    '<p style="text-align:center;font-size:1.3rem;margin-bottom:20px">ผู้ชนะ: <strong style="color:var(--accent)">' + w.avatar + ' ' + w.name + '</strong> คะแนน ' + w.score.total + '!</p>' +
    ranked.map((p, i) =>
      '<div class="final-player ' + (i===0?'rank-1':'') + '"><div class="rank">' + (['🥇','🥈','🥉','4','5'][i]||(i+1)) + '</div>' +
      '<div class="details"><strong>' + p.avatar + ' ' + p.name + '</strong> ' + (p.career ? p.career.nameTh : '') +
      '<div style="font-size:0.8rem;color:var(--text-muted)">ออม ' + p.savings.toLocaleString() + ' | Lv.' + p.level + ' | ทักษะ ' + p.skills.length + ' | ชีวิต ' + p.life + '</div></div>' +
      '<div class="score">' + p.score.total + '</div></div>'
    ).join('');
}

function copyCode() {
  const code = state.roomCode || document.getElementById('lobby-code').textContent;
  navigator.clipboard.writeText(code).then(() => alert('คัดลอก: ' + code));
}

document.addEventListener('DOMContentLoaded', () => showPage('landing'));
