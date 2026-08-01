/**
 * Career Quest - Real-time Multiplayer Server
 * Pure Node.js (no external deps) using HTTP + Server-Sent Events (SSE)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, '..', 'public');

const CAREERS = [
  { id: 'chef', name: 'Chef', nameTh: 'เชฟ', icon: '👨‍🍳', salary: 8000, special: 'food_bonus' },
  { id: 'programmer', name: 'Programmer', nameTh: 'โปรแกรมเมอร์', icon: '💻', salary: 12000, special: 'coding_bonus' },
  { id: 'teacher', name: 'Teacher', nameTh: 'ครู', icon: '👩‍🏫', salary: 7000, special: 'life_bonus' },
  { id: 'farmer', name: 'Farmer', nameTh: 'เกษตรกร', icon: '🌾', salary: 6000, special: 'stable' },
  { id: 'electrician', name: 'Electrician', nameTh: 'ช่างไฟฟ้า', icon: '⚡', salary: 9000, special: 'repair_free' },
  { id: 'designer', name: 'Graphic Designer', nameTh: 'นักออกแบบ', icon: '🎨', salary: 8500, special: 'creative_bonus' },
  { id: 'nurse', name: 'Nurse', nameTh: 'พยาบาล', icon: '👩‍⚕️', salary: 9500, special: 'health_discount' },
  { id: 'photographer', name: 'Photographer', nameTh: 'ช่างภาพ', icon: '📷', salary: 7500, special: 'opp_bonus' }
];

const SKILLS = [
  { id: 'english', name: 'English', icon: '🔤' },
  { id: 'ai', name: 'AI', icon: '🤖' },
  { id: 'marketing', name: 'Marketing', icon: '📣' },
  { id: 'accounting', name: 'Accounting', icon: '🧮' },
  { id: 'coding', name: 'Coding', icon: '⌨️' },
  { id: 'communication', name: 'Communication', icon: '💬' },
  { id: 'leadership', name: 'Leadership', icon: '👑' },
  { id: 'creativity', name: 'Creativity', icon: '✨' }
];

const EVENTS = [
  { id: 'laptop_broke', name: 'Laptop เสีย!', icon: '💻', money: -3000 },
  { id: 'bonus', name: 'โบนัสพิเศษ!', icon: '🎁', money: 2000 },
  { id: 'economy_down', name: 'เศรษฐกิจตกต่ำ', icon: '📉', money: -1500 },
  { id: 'scholarship', name: 'ได้ทุนเรียน!', icon: '🎓', money: 3000, giveSkill: true },
  { id: 'electric_bill', name: 'ค่าไฟขึ้น', icon: '💡', money: -800 },
  { id: 'medical', name: 'ค่ารักษาพยาบาล', icon: '🏥', money: -2500 },
  { id: 'more_clients', name: 'ลูกค้าเพิ่ม!', icon: '👥', money: 2500 },
  { id: 'ai_help', name: 'AI ช่วยงาน', icon: '🤖', money: 1500 },
  { id: 'tax', name: 'ต้องจ่ายภาษี', icon: '🧾', money: -1200 },
  { id: 'side_hustle', name: 'งานพิเศษ', icon: '💼', money: 1800 }
];

const LIFE_EVENTS = [
  { id: 'rest', name: 'พักผ่อน', icon: '😴', life: 2 },
  { id: 'stress', name: 'เครียด', icon: '😰', life: -2 },
  { id: 'healthy', name: 'สุขภาพดี', icon: '💪', life: 1 },
  { id: 'family', name: 'เวลาครอบครัว', icon: '👨‍👩‍👧', life: 2 },
  { id: 'hobby', name: 'งานอดิเรก', icon: '🎸', life: 1 },
  { id: 'burnout', name: 'หมดไฟ', icon: '🔥', life: -3 }
];

const BOARD = [
  'start','salary','skill','event','saving','salary','investment','life','opportunity','event',
  'salary','skill','bonus','saving','event','investment','salary','life','skill','opportunity',
  'event','salary','saving','investment','bonus','life','skill','event','salary','opportunity',
  'saving','investment','life','event','skill','salary','bonus','opportunity','saving','event'
];

const PLAYER_COLORS = ['#ef5350','#42a5f5','#66bb6a','#ffca28','#ab47bc'];
const PLAYER_AVATARS = ['👦','👧','👨','👩','🧑'];

const rooms = new Map();

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

function createRoom(name, hostName, maxPlayers) {
  let code;
  do { code = genCode(); } while (rooms.has(code));
  const room = {
    code, name: name || 'ห้อง Career Quest',
    maxPlayers: Math.max(2, Math.min(5, maxPlayers || 4)),
    hostId: null, phase: 'lobby', players: [],
    currentPlayerIndex: 0, round: 1, maxRounds: 12,
    log: [], pendingAction: null, selectingIndex: 0,
    clients: new Map(), finalRanking: null
  };
  rooms.set(code, room);
  return room;
}

function addPlayer(room, name, isHost) {
  if (room.players.length >= room.maxPlayers || room.phase !== 'lobby') return null;
  const id = randomUUID().slice(0, 8);
  const idx = room.players.length;
  const player = {
    id, name: (name || 'Player').slice(0, 20),
    avatar: PLAYER_AVATARS[idx % 5], color: PLAYER_COLORS[idx % 5],
    isHost: !!isHost, career: null, money: 5000, savings: 0,
    position: 0, level: 1, skills: [], life: 5, salaryBonus: 0
  };
  room.players.push(player);
  if (isHost) room.hostId = id;
  return player;
}

function getPublicState(room) {
  return {
    code: room.code, name: room.name, maxPlayers: room.maxPlayers,
    hostId: room.hostId, phase: room.phase,
    players: room.players.map(p => ({
      id: p.id, name: p.name, avatar: p.avatar, color: p.color, isHost: p.isHost,
      career: p.career, money: p.money, savings: p.savings, position: p.position,
      level: p.level, skills: p.skills, life: p.life, salaryBonus: p.salaryBonus
    })),
    currentPlayerIndex: room.currentPlayerIndex, round: room.round,
    maxRounds: room.maxRounds, log: room.log.slice(-30),
    pendingAction: room.pendingAction, selectingIndex: room.selectingIndex,
    finalRanking: room.finalRanking
  };
}

function broadcast(room, event, data) {
  const payload = 'event: ' + event + '\ndata: ' + JSON.stringify(data) + '\n\n';
  for (const [, res] of room.clients) {
    try { res.write(payload); } catch (e) {}
  }
}

function addLog(room, msg) {
  room.log.push({ t: Date.now(), msg });
  if (room.log.length > 50) room.log.shift();
}

function calcScore(p) {
  const sav = Math.min(40, Math.floor(p.savings / 1250));
  const car = Math.min(30, p.level * 6);
  const ski = Math.min(20, Math.floor(p.skills.length * 3.4));
  const lif = Math.min(10, p.life);
  return { total: sav + car + ski + lif, savings: sav, career: car, skills: ski, life: lif };
}

function startGame(room) {
  if (room.players.length < 2) return { error: 'ต้องการอย่างน้อย 2 คน' };
  room.phase = 'career';
  room.selectingIndex = 0;
  addLog(room, '🎮 เริ่มเลือกอาชีพ!');
  broadcast(room, 'state', getPublicState(room));
  return { ok: true };
}

function selectCareer(room, playerId, careerId) {
  const player = room.players.find(p => p.id === playerId);
  if (!player || room.phase !== 'career') return { error: 'ไม่สามารถเลือกได้' };
  const current = room.players[room.selectingIndex];
  if (!current || current.id !== playerId) return { error: 'ยังไม่ถึงตาคุณ' };
  const career = CAREERS.find(c => c.id === careerId);
  if (!career) return { error: 'อาชีพไม่ถูกต้อง' };
  player.career = career;
  addLog(room, player.avatar + ' ' + player.name + ' เลือก ' + career.icon + ' ' + career.nameTh);
  room.selectingIndex++;
  if (room.selectingIndex >= room.players.length) {
    room.phase = 'playing';
    room.currentPlayerIndex = 0;
    room.round = 1;
    addLog(room, '🚀 เกมเริ่มต้น! เล่น 12 รอบ');
  }
  broadcast(room, 'state', getPublicState(room));
  return { ok: true };
}

function rollDice(room, playerId) {
  if (room.phase !== 'playing') return { error: 'เกมยังไม่เริ่ม' };
  const player = room.players[room.currentPlayerIndex];
  if (!player || player.id !== playerId) return { error: 'ยังไม่ถึงตาคุณ' };
  if (room.pendingAction) return { error: 'รอดำเนินการก่อน' };
  const result = Math.floor(Math.random() * 6) + 1;
  player.position = (player.position + result) % 40;
  addLog(room, player.avatar + ' ' + player.name + ' ทอยได้ ' + result + ' → ช่อง ' + (player.position + 1));
  resolveCell(room, player, BOARD[player.position]);
  return { ok: true, dice: result };
}

function resolveCell(room, player, cell) {
  switch (cell) {
    case 'start':
      player.money += 2000;
      addLog(room, player.name + ' ผ่าน START +2,000');
      nextTurn(room); break;
    case 'salary': {
      const sal = (player.career ? player.career.salary : 5000) + player.salaryBonus + (player.level - 1) * 1000;
      player.money += sal;
      addLog(room, '💰 ' + player.name + ' ได้เงินเดือน ' + sal.toLocaleString());
      nextTurn(room); break;
    }
    case 'bonus': {
      const b = 1500 + Math.floor(Math.random() * 1500);
      player.money += b;
      addLog(room, '🎁 ' + player.name + ' ได้โบนัส ' + b.toLocaleString());
      nextTurn(room); break;
    }
    case 'skill': {
      const avail = SKILLS.filter(s => player.skills.indexOf(s.id) < 0);
      const opts = avail.sort(function(){return Math.random()-0.5}).slice(0, 3);
      if (!opts.length) { addLog(room, player.name + ' มีทักษะครบ'); nextTurn(room); return; }
      room.pendingAction = { type: 'skill', playerId: player.id, options: opts };
      broadcast(room, 'state', getPublicState(room));
      break;
    }
    case 'saving':
      room.pendingAction = { type: 'saving', playerId: player.id, options: [0,1000,2000,3000,5000] };
      broadcast(room, 'state', getPublicState(room));
      break;
    case 'investment':
      room.pendingAction = {
        type: 'investment', playerId: player.id,
        options: [
          { id: 'equipment', name: 'ซื้ออุปกรณ์', icon: '🛠️', cost: 3000, desc: 'รายได้ +500/รอบ' },
          { id: 'course', name: 'เรียนคอร์ส', icon: '📚', cost: 2000, desc: 'ได้ทักษะใหม่' },
          { id: 'business', name: 'ลงทุนธุรกิจ', icon: '🏪', cost: 5000, desc: 'เสี่ยงสูง' },
          { id: 'stock', name: 'ลงทุนหุ้น', icon: '📊', cost: 2500, desc: 'เสี่ยงปานกลาง' },
          { id: 'skip', name: 'ข้าม', icon: '➡️', cost: 0, desc: 'ไม่ลงทุน' }
        ]
      };
      broadcast(room, 'state', getPublicState(room));
      break;
    case 'event': {
      const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      let money = ev.money;
      if (ev.id === 'laptop_broke' && player.career && player.career.special === 'repair_free') money = 0;
      if (ev.id === 'medical' && player.career && player.career.special === 'health_discount') money = Math.floor(money / 2);
      if (ev.id === 'economy_down' && player.career && player.career.special === 'stable') money = 0;
      room.pendingAction = { type: 'event', playerId: player.id, event: { id: ev.id, name: ev.name, icon: ev.icon, money: money, giveSkill: ev.giveSkill } };
      broadcast(room, 'state', getPublicState(room));
      break;
    }
    case 'opportunity':
      if (player.skills.length >= 3 && player.level < 5) {
        room.pendingAction = { type: 'opportunity', playerId: player.id };
        broadcast(room, 'state', getPublicState(room));
      } else {
        player.money += 500;
        addLog(room, player.name + ' ยังไม่พร้อมเลื่อน (+500)');
        nextTurn(room);
      }
      break;
    case 'life': {
      const le = LIFE_EVENTS[Math.floor(Math.random() * LIFE_EVENTS.length)];
      room.pendingAction = { type: 'life', playerId: player.id, event: le };
      broadcast(room, 'state', getPublicState(room));
      break;
    }
    default: nextTurn(room);
  }
}

function handleAction(room, playerId, actionType, payload) {
  if (!room.pendingAction || room.pendingAction.playerId !== playerId) return { error: 'ไม่ใช่การกระทำของคุณ' };
  const player = room.players.find(p => p.id === playerId);
  if (!player) return { error: 'ไม่พบผู้เล่น' };
  const pa = room.pendingAction;

  if (actionType === 'skill' && pa.type === 'skill') {
    const skill = SKILLS.find(s => s.id === payload.skillId);
    if (!skill || !pa.options.find(o => o.id === payload.skillId)) return { error: 'ทักษะไม่ถูกต้อง' };
    player.skills.push(skill.id);
    if (skill.id === 'english') player.salaryBonus += 500;
    if (skill.id === 'ai') player.salaryBonus += 1000;
    if (skill.id === 'leadership') player.salaryBonus += 800;
    addLog(room, '⭐ ' + player.name + ' เรียนรู้ ' + skill.icon + ' ' + skill.name);
  } else if (actionType === 'saving' && pa.type === 'saving') {
    const amt = Number(payload.amount) || 0;
    if (amt > 0 && player.money >= amt) {
      player.money -= amt; player.savings += amt;
      addLog(room, '🏦 ' + player.name + ' ออม ' + amt.toLocaleString());
    } else addLog(room, player.name + ' ไม่ออม');
  } else if (actionType === 'investment' && pa.type === 'investment') {
    const opt = pa.options.find(o => o.id === payload.invId);
    if (!opt) return { error: 'ตัวเลือกไม่ถูกต้อง' };
    if (opt.id === 'skip') addLog(room, player.name + ' ข้ามการลงทุน');
    else if (player.money < opt.cost) return { error: 'เงินไม่พอ' };
    else {
      player.money -= opt.cost;
      if (opt.id === 'equipment') { player.salaryBonus += 500; addLog(room, '📈 ' + player.name + ' ซื้ออุปกรณ์'); }
      else if (opt.id === 'course') {
        const avail = SKILLS.filter(s => player.skills.indexOf(s.id) < 0);
        if (avail.length) { const s = avail[Math.floor(Math.random()*avail.length)]; player.skills.push(s.id); addLog(room, '📈 ' + player.name + ' ได้ทักษะ ' + s.name); }
      } else if (opt.id === 'business') {
        const gain = Math.random() > 0.4 ? Math.floor(Math.random()*6000)+2000 : -(Math.floor(Math.random()*2000)+500);
        player.money += gain;
        addLog(room, '📈 ' + player.name + ' ธุรกิจ ' + (gain>=0?'กำไร ':'ขาดทุน ') + Math.abs(gain).toLocaleString());
      } else if (opt.id === 'stock') {
        const gain = Math.random() > 0.45 ? Math.floor(Math.random()*4000)+500 : -(Math.floor(Math.random()*1500)+200);
        player.money += gain;
        addLog(room, '📈 ' + player.name + ' หุ้น ' + (gain>=0?'กำไร ':'ขาดทุน ') + Math.abs(gain).toLocaleString());
      }
    }
  } else if (actionType === 'event' && pa.type === 'event') {
    player.money += pa.event.money;
    if (player.money < 0) player.money = 0;
    if (pa.event.giveSkill) {
      const avail = SKILLS.filter(s => player.skills.indexOf(s.id) < 0);
      if (avail.length) player.skills.push(avail[Math.floor(Math.random()*avail.length)].id);
    }
    addLog(room, pa.event.icon + ' ' + player.name + ': ' + pa.event.name);
  } else if (actionType === 'opportunity' && pa.type === 'opportunity') {
    if (payload.promote) {
      player.level = Math.min(5, player.level + 1);
      player.salaryBonus += 1500;
      addLog(room, '🎉 ' + player.name + ' เลื่อน Level ' + player.level);
    } else addLog(room, player.name + ' ข้ามเลื่อนตำแหน่ง');
  } else if (actionType === 'life' && pa.type === 'life') {
    player.life = Math.max(0, Math.min(10, player.life + pa.event.life));
    addLog(room, '❤️ ' + player.name + ': ' + pa.event.name + ' (' + player.life + '/10)');
  } else return { error: 'การกระทำไม่ถูกต้อง' };

  room.pendingAction = null;
  nextTurn(room);
  return { ok: true };
}

function nextTurn(room) {
  room.pendingAction = null;
  room.currentPlayerIndex++;
  if (room.currentPlayerIndex >= room.players.length) {
    room.currentPlayerIndex = 0;
    room.round++;
    addLog(room, '—— รอบที่ ' + (room.round - 1) + ' จบ ——');
    if (room.round > room.maxRounds) { endGame(room); return; }
  }
  broadcast(room, 'state', getPublicState(room));
}

function endGame(room) {
  room.phase = 'ended';
  const ranked = room.players.map(function(p) {
    return Object.assign({}, p, { score: calcScore(p) });
  }).sort(function(a,b){ return b.score.total - a.score.total; });
  room.finalRanking = ranked.map(function(p) {
    return { id: p.id, name: p.name, avatar: p.avatar, color: p.color, career: p.career,
      money: p.money, savings: p.savings, level: p.level, skills: p.skills, life: p.life, score: p.score };
  });
  addLog(room, '🏆 จบเกม! ผู้ชนะ: ' + ranked[0].name);
  broadcast(room, 'state', getPublicState(room));
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml'
};

function parseBody(req) {
  return new Promise(function(resolve) {
    var body = '';
    req.on('data', function(c) { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', function() { try { resolve(JSON.parse(body || '{}')); } catch(e) { resolve({}); } });
  });
}

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async function(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(); return;
  }

  const url = new URL(req.url, 'http://localhost:' + PORT);
  const pathname = url.pathname;

  if (pathname.startsWith('/api/')) {
    if (pathname === '/api/create' && req.method === 'POST') {
      const body = await parseBody(req);
      const room = createRoom(body.roomName, body.hostName, body.maxPlayers || 4);
      const player = addPlayer(room, body.hostName || 'Host', true);
      sendJSON(res, 200, { ok: true, room: getPublicState(room), playerId: player.id });
      return;
    }
    if (pathname === '/api/join' && req.method === 'POST') {
      const body = await parseBody(req);
      const code = (body.code || '').toUpperCase().trim();
      const room = rooms.get(code);
      if (!room) { sendJSON(res, 404, { error: 'ไม่พบห้อง' }); return; }
      const player = addPlayer(room, body.name || 'Player');
      if (!player) { sendJSON(res, 400, { error: 'ห้องเต็มหรือเกมเริ่มแล้ว' }); return; }
      broadcast(room, 'state', getPublicState(room));
      sendJSON(res, 200, { ok: true, room: getPublicState(room), playerId: player.id });
      return;
    }
    if (pathname === '/api/subscribe' && req.method === 'GET') {
      const code = (url.searchParams.get('code') || '').toUpperCase();
      const playerId = url.searchParams.get('playerId');
      const room = rooms.get(code);
      if (!room || !playerId) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, {
        'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache',
        'Connection': 'keep-alive', 'Access-Control-Allow-Origin': '*'
      });
      res.write('event: state\ndata: ' + JSON.stringify(getPublicState(room)) + '\n\n');
      room.clients.set(playerId, res);
      req.on('close', function() { room.clients.delete(playerId); });
      return;
    }
    if (pathname === '/api/action' && req.method === 'POST') {
      const body = await parseBody(req);
      const room = rooms.get((body.code || '').toUpperCase());
      if (!room) { sendJSON(res, 404, { error: 'ไม่พบห้อง' }); return; }
      const playerId = body.playerId, action = body.action, payload = body.payload || {};
      var result;
      if (action === 'start') {
        if (room.hostId !== playerId) { sendJSON(res, 403, { error: 'เฉพาะ Host' }); return; }
        result = startGame(room);
      } else if (action === 'selectCareer') result = selectCareer(room, playerId, payload.careerId);
      else if (action === 'roll') result = rollDice(room, playerId);
      else if (['skill','saving','investment','event','opportunity','life'].indexOf(action) >= 0)
        result = handleAction(room, playerId, action, payload);
      else result = { error: 'unknown action' };
      sendJSON(res, result.error ? 400 : 200, result);
      return;
    }
    if (pathname === '/api/state' && req.method === 'GET') {
      const code = (url.searchParams.get('code') || '').toUpperCase();
      const room = rooms.get(code);
      if (!room) { sendJSON(res, 404, { error: 'ไม่พบห้อง' }); return; }
      sendJSON(res, 200, getPublicState(room));
      return;
    }
    sendJSON(res, 404, { error: 'Not found' });
    return;
  }

  var filePath = path.join(PUBLIC, pathname === '/' ? 'index.html' : pathname);
  if (!filePath.startsWith(PUBLIC)) { res.writeHead(403); res.end(); return; }
  fs.readFile(filePath, function(err, data) {
    if (err) {
      fs.readFile(path.join(PUBLIC, 'index.html'), function(e2, d2) {
        if (e2) { res.writeHead(404); res.end('Not Found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(d2);
      });
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, function() {
  console.log('');
  console.log('  🎓 Career Quest Multiplayer Server');
  console.log('  ➜  http://localhost:' + PORT);
  console.log('  Real-time online multiplayer ready!');
  console.log('');
});
