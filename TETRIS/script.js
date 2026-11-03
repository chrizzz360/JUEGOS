'use strict';
/* Tetris: Infinite Matrix — Vanilla JS. Lógica a 60 Hz fijos, render con requestAnimationFrame. */
const COLS = 10, ROWS = 22, HID = 2, CELL = 30, LOCK_FRAMES = 30, FLASH_FRAMES = 35, SLIDE_FRAMES = 12, MAX_RESETS = 15;
const $ = id => document.getElementById(id);
const bx = $('board').getContext('2d'), hx = $('hold').getContext('2d'), nx = $('next').getContext('2d');

/* ---------- Piezas, SRS ---------- */
const SH = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]], L: [[0,0,1],[1,1,1],[0,0,0]], O: [[1,1],[1,1]],
  S: [[0,1,1],[1,1,0],[0,0,0]], T: [[0,1,0],[1,1,1],[0,0,0]], Z: [[1,1,0],[0,1,1],[0,0,0]]
};
const COL = { I:'#00f3ff', J:'#4d6bff', L:'#ff9100', O:'#ffe600', S:'#00ff9c', T:'#bc13fe', Z:'#ff0055' };
const cw = m => m[0].map((_, x) => m.map(r => r[x]).reverse());
const ST = {};
for (const k in SH) { ST[k] = [SH[k]]; for (let i = 1; i < 4; i++) ST[k].push(cw(ST[k][i - 1])); }
const parse = s => s.split(' ').map(p => p.split(',').map(Number));
const KJ = { '01':'0,0 -1,0 -1,1 0,-2 -1,-2','10':'0,0 1,0 1,-1 0,2 1,2','12':'0,0 1,0 1,-1 0,2 1,2','21':'0,0 -1,0 -1,1 0,-2 -1,-2',
             '23':'0,0 1,0 1,1 0,-2 1,-2','32':'0,0 -1,0 -1,-1 0,2 -1,2','30':'0,0 -1,0 -1,-1 0,2 -1,2','03':'0,0 1,0 1,1 0,-2 1,-2' };
const KI = { '01':'0,0 -2,0 1,0 -2,-1 1,2','10':'0,0 2,0 -1,0 2,1 -1,-2','12':'0,0 -1,0 2,0 -1,2 2,-1','21':'0,0 1,0 -2,0 1,-2 -2,1',
             '23':'0,0 2,0 -1,0 2,1 -1,-2','32':'0,0 -2,0 1,0 -2,-1 1,2','30':'0,0 1,0 -2,0 1,-2 -2,1','03':'0,0 -1,0 2,0 -1,2 2,-1' };
for (const t of [KJ, KI]) for (const k in t) t[k] = parse(t[k]);
const GRAV = [48,43,38,33,28,23,18,13,8,6,5,5,5,4,4,4,3,3,3,2,2,2,2,2,2,2,2,2,2,1];

/* ---------- Estado ---------- */
let G = null, cfg = { das: 10, arr: 2, start: 0, mode: 'endless' }, PT = [];
const keys = new Set();
const clamp = (v, a, b) => Math.max(a, Math.min(b, Number.isFinite(v) ? v : a));

function bag() {
  const a = Object.keys(SH);
  for (let i = 6; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const pull = () => { while (G.q.length < 8) G.q.push(...bag()); return G.q.shift(); };
const mk = k => ({ k, r: 0, x: k === 'O' ? 4 : 3, y: 1 });

function cells(p, r = p.r, x = p.x, y = p.y) {
  const m = ST[p.k][r], out = [];
  m.forEach((row, j) => row.forEach((v, i) => { if (v) out.push([x + i, y + j]); }));
  return out;
}
const hit = (p, r = p.r, x = p.x, y = p.y) =>
  cells(p, r, x, y).some(([cx, cy]) => cx < 0 || cx >= COLS || cy >= ROWS || (cy >= 0 && G.B[cy][cx]));
const grounded = () => hit(G.p, G.p.r, G.p.x, G.p.y + 1);

function readCfg() {
  cfg.mode = $('mode').value;
  cfg.das = clamp(+$('das').value, 6, 16); cfg.arr = clamp(+$('arr').value, 0, 6); cfg.start = clamp(+$('startLevel').value, 0, 29);
  $('das').value = cfg.das; $('arr').value = cfg.arr; $('startLevel').value = cfg.start;
}
function newGame() {
  readCfg(); PT = [];
  G = { B: Array.from({ length: ROWS }, () => Array(COLS).fill(0)), q: [], hold: null, used: false, score: 0, lines: 0,
        level: cfg.start, fall: 0, lockT: 0, resets: 0, dir: 0, dasT: 0, rot: false, state: 'play', combo: -1,
        clr: [], cT: 0, off: Array(ROWS).fill(0), slideT: 0, ms: 0, pieces: 0, keysN: 0, frames: 0, left: 0, rotLock: false };
  if (cfg.mode === 'glitch') {                 // tablero corrupto: límpialo con un máximo de piezas
    G.level = 2; G.left = 24;
    for (let y = 14; y < ROWS; y++) {
      const h = Math.random() * COLS | 0;
      for (let x = 0; x < COLS; x++) G.B[y][x] = (x !== h && Math.random() < .75) ? '#7a7a9a' : 0;
    }
  }
  spawn(); $('overlay').classList.add('hidden'); $('play').blur();
  Snd.init(); Snd.music(true);
}
function spawn() {
  G.p = mk(pull()); G.used = false; G.fall = G.lockT = G.resets = 0; G.rot = false;
  if (hit(G.p)) over();
}

/* ---------- Movimiento ---------- */
// Cualquier movimiento/giro exitoso con la pieza apoyada reinicia el Lock Delay (con tope para evitar bloqueo infinito)
function bump() { if (grounded() && G.resets < MAX_RESETS) { G.lockT = 0; G.resets++; } }
function move(dx) {
  if (hit(G.p, G.p.r, G.p.x + dx, G.p.y)) return false;
  G.p.x += dx; G.rot = false; bump(); Snd.sfx('move'); return true;
}
function rotate(dir) {
  const p = G.p; if (p.k === 'O' || G.rotLock) return;
  const nr = (p.r + dir + 4) % 4, tbl = p.k === 'I' ? KI : KJ;
  for (const [kx, ky] of tbl[p.r + '' + nr]) {
    if (!hit(p, nr, p.x + kx, p.y - ky)) { p.r = nr; p.x += kx; p.y -= ky; G.rot = true; bump(); Snd.sfx('rot'); return; }
  }
}
function hardDrop() {            // ignora el Lock Delay: se fija al instante
  let n = 0; while (!hit(G.p, G.p.r, G.p.x, G.p.y + 1)) { G.p.y++; n++; }
  G.score += 2 * n; Snd.sfx('drop'); lock();
}
function holdPiece() {
  if (G.used) return;
  const k = G.p.k; G.p = G.hold ? mk(G.hold) : mk(pull()); G.hold = k; G.used = true;
  G.fall = G.lockT = G.resets = 0; G.rot = false; Snd.sfx('rot');
  if (hit(G.p)) over();
}

/* ---------- Fijar y limpiar líneas ---------- */
function lock() {
  const p = G.p; let ts = false;
  if (p.k === 'T' && G.rot) {
    let c = 0;
    for (const [dx, dy] of [[-1,-1],[1,-1],[-1,1],[1,1]]) {
      const X = p.x + 1 + dx, Y = p.y + 1 + dy;
      if (X < 0 || X >= COLS || Y >= ROWS || (Y >= 0 && G.B[Y][X])) c++;
    }
    ts = c >= 3;
  }
  G.pieces++; if (cfg.mode === 'glitch') G.left--;
  const cs = cells(p);
  for (const [x, y] of cs) if (y >= 0) G.B[y][x] = COL[p.k];
  if (cs.every(([, y]) => y < HID)) return over();
  const full = [];
  for (let y = 0; y < ROWS; y++) if (G.B[y].every(Boolean)) full.push(y);
  const m = G.level + 1;
  if (full.length) {
    G.state = 'clearing'; G.cT = FLASH_FRAMES; G.clr = full; G.ts = ts; G.p = null;
    Snd.sfx('clear', full.length); return;
  }
  G.combo = -1; if (ts) G.score += 400 * m;
  if (!check()) spawn();
}
function finishClear() {
  const full = G.clr, n = full.length, m = G.level + 1;
  for (const y of full) for (let x = 0; x < COLS; x++) for (let k = 0; k < 4; k++)   // explosión de partículas
    PT.push({ x: x * CELL + 15, y: (y - HID) * CELL + 15, vx: (Math.random() - .5) * 9, vy: (Math.random() - .9) * 7,
              a: 1, decay: .014 + Math.random() * .02, c: G.B[y][x], s: 2 + Math.random() * 4 });
  const off = Array(ROWS).fill(0);                                                    // desplazamiento suave
  for (let oy = 0; oy < ROWS; oy++) if (!full.includes(oy)) { const c = full.filter(y => y > oy).length; off[oy + c] = c; }
  G.B = G.B.filter((_, y) => !full.includes(y));
  while (G.B.length < ROWS) G.B.unshift(Array(COLS).fill(0));
  G.off = off; G.slideT = SLIDE_FRAMES;
  G.score += (G.ts ? [0, 800, 1200, 1600][n] : [0, 40, 100, 300, 1200][n]) * m;
  G.combo++; if (G.combo > 0) G.score += 50 * G.combo * m;
  G.lines += n; if (cfg.mode === 'endless') G.level = Math.min(cfg.start + (G.lines / 10 | 0), 99);
  G.state = 'play'; if (!check()) spawn();
}
function check() {                              // condiciones de victoria / derrota por modo
  if (cfg.mode === 'sprint' && G.lines >= 40) { over(true); return true; }
  if (cfg.mode === 'glitch') {
    if (G.B.every(r => r.every(c => !c))) { over(true); return true; }
    if (G.left <= 0) { over(false); return true; }
  }
  return false;
}
function over(win = false) {
  G.state = 'over'; Snd.music(false);
  const s = G.ms / 1000;
  $('ovTitle').textContent = win ? (cfg.mode === 'sprint' ? '¡40 LÍNEAS!' : '¡MATRIZ RESCATADA!') : 'GAME OVER';
  $('msg').textContent = win && cfg.mode === 'sprint' ? `Tiempo: ${s.toFixed(3)} s · PPS ${(G.pieces / s).toFixed(2)} · KPP ${(G.keysN / G.pieces).toFixed(2)}`
    : `Puntaje: ${G.score} · Líneas: ${G.lines}`;
  $('play').textContent = 'Reiniciar'; $('overlay').classList.remove('hidden');
}

/* ---------- Paso lógico (60 Hz) ---------- */
function step() {
  for (const q of PT) { q.x += q.vx; q.y += q.vy; q.vy += .15; q.a -= q.decay; }
  PT = PT.filter(q => q.a > 0);
  if (G.slideT > 0) G.slideT--;
  if (G.state === 'play' || G.state === 'clearing') { G.ms += 1000 / 60; G.frames++; }
  const evo = cfg.mode === 'endless' && G.level >= 29;       // Endless Evolution: modificadores tras el nivel 29
  G.rotLock = evo && (G.frames / 60 % 20) > 17;
  $('mod').textContent = G.rotLock ? 'ROTACIÓN BLOQUEADA' : evo ? 'GRAVEDAD PROGRESIVA' : '';
  $('board').style.filter = evo ? `hue-rotate(${(G.level - 29) * 40}deg) saturate(1.3)` : '';
  if (G.state === 'clearing') { if (--G.cT <= 0) finishClear(); return; }
  if (G.state !== 'play') return;

  if (G.dir) {                                                   // DAS / ARR
    G.dasT++;
    if (G.dasT >= cfg.das) {
      if (cfg.arr === 0) while (move(G.dir));
      else if ((G.dasT - cfg.das) % cfg.arr === 0) move(G.dir);
    }
  }
  const soft = keys.has('ArrowDown'), g = G.level >= 29 ? 1 : GRAV[G.level], iv = soft ? Math.min(2, g) : g;
  if (++G.fall >= iv) { G.fall = 0; if (!grounded()) { G.p.y++; if (soft) G.score++; } }
  if (grounded()) { if (++G.lockT >= LOCK_FRAMES) lock(); } else G.lockT = 0;
}

/* ---------- Entrada ---------- */
const GK = ['ArrowLeft','ArrowRight','ArrowDown','ArrowUp','Space','KeyZ','KeyX','KeyC','KeyP','Escape'];
function pause() {
  if (G.state === 'play') { G.state = 'pause'; Snd.music(false); $('ovTitle').textContent = 'PAUSA'; $('msg').textContent = 'Pulsa P para continuar'; $('play').textContent = 'Continuar'; $('overlay').classList.remove('hidden'); }
  else if (G.state === 'pause') { G.state = 'play'; $('overlay').classList.add('hidden'); Snd.music(true); }
}
addEventListener('keydown', e => {
  if (/INPUT|SUMMARY/.test(e.target.tagName) && e.code !== 'Enter') return;
  if (GK.includes(e.code)) e.preventDefault();
  if (e.code === 'Enter' && (!G || G.state === 'over')) return newGame();
  if (e.repeat || !G) return;
  if (e.code === 'KeyP' || e.code === 'Escape') return pause();
  if (G.state !== 'play') return;
  keys.add(e.code); G.keysN++;
  switch (e.code) {
    case 'ArrowLeft': G.dir = -1; G.dasT = 0; move(-1); break;
    case 'ArrowRight': G.dir = 1; G.dasT = 0; move(1); break;
    case 'ArrowUp': case 'KeyX': rotate(1); break;
    case 'KeyZ': rotate(-1); break;
    case 'Space': hardDrop(); break;
    case 'KeyC': holdPiece(); break;
  }
});
addEventListener('keyup', e => {
  if (GK.includes(e.code)) e.preventDefault();
  keys.delete(e.code);
  if (G && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) { G.dir = keys.has('ArrowLeft') ? -1 : keys.has('ArrowRight') ? 1 : 0; G.dasT = 0; }
});
$('mode').onchange = () => { $('modeHint').textContent = {
  endless: 'Sobrevive: tras el nivel 29 la gravedad se vuelve progresiva y se bloquea la rotación por momentos.',
  sprint: 'Limpia 40 líneas en el menor tiempo. Verás tiempo, PPS y KPP.',
  glitch: 'Tablero corrupto: límpialo por completo con un máximo de 24 piezas.' }[$('mode').value]; };
$('play').onclick = () => (G && G.state === 'pause') ? pause() : newGame();

/* ---------- Render ---------- */
function cell(c, x, y, s, color, a = 1) {
  c.globalAlpha = a; c.fillStyle = color; c.shadowColor = color; c.shadowBlur = a < 1 ? 0 : 10;
  c.fillRect(x + 1, y + 1, s - 2, s - 2); c.shadowBlur = 0;
  c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x + 2, y + 2, s - 4, 3);
  c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(x + 2, y + s - 5, s - 4, 3); c.globalAlpha = 1;
}
function mini(c, k, cx, cy, s) {
  const m = SH[k]; let x0 = 9, x1 = -1, y0 = 9, y1 = -1;
  m.forEach((r, j) => r.forEach((v, i) => { if (v) { x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, j); y1 = Math.max(y1, j); } }));
  const ox = cx - (x1 - x0 + 1) * s / 2, oy = cy - (y1 - y0 + 1) * s / 2;
  m.forEach((r, j) => r.forEach((v, i) => { if (v) cell(c, ox + (i - x0) * s, oy + (j - y0) * s, s, COL[k]); }));
}
function draw() {
  bx.clearRect(0, 0, 300, 600); hx.clearRect(0, 0, 100, 100); nx.clearRect(0, 0, 100, 240);
  bx.strokeStyle = 'rgba(140,100,255,.13)'; bx.lineWidth = 1; bx.beginPath();
  for (let i = 1; i < COLS; i++) { bx.moveTo(i * CELL, 0); bx.lineTo(i * CELL, 600); }
  for (let j = 1; j < 20; j++) { bx.moveTo(0, j * CELL); bx.lineTo(300, j * CELL); }
  bx.stroke();
  if (G) {
    const ease = (G.slideT / SLIDE_FRAMES) ** 2, flash = G.state === 'clearing' && (G.cT / 5 | 0) % 2 === 0;
    for (let y = HID; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const v = G.B[y][x]; if (!v) continue;
      const clr = G.state === 'clearing' && G.clr.includes(y);
      cell(bx, x * CELL, (y - HID - G.off[y] * ease) * CELL, CELL, clr ? (flash ? '#ffffff' : '#ff00cc') : v);
    }
    if (G.p && G.state !== 'over') {
      let gy = G.p.y; while (!hit(G.p, G.p.r, G.p.x, gy + 1)) gy++;
      for (const [x, y] of cells(G.p, G.p.r, G.p.x, gy)) if (y >= HID) cell(bx, x * CELL, (y - HID) * CELL, CELL, COL[G.p.k], .25);
      for (const [x, y] of cells(G.p)) if (y >= HID) cell(bx, x * CELL, (y - HID) * CELL, CELL, COL[G.p.k]);
    }
    if (G.hold) mini(hx, G.hold, 50, 50, 20);
    G.q.slice(0, 3).forEach((k, i) => mini(nx, k, 50, 40 + i * 80, 20));
    const s = G.ms / 1000;
    $('score').textContent = G.score; $('level').textContent = G.level;
    $('lines').textContent = cfg.mode === 'sprint' ? G.lines + ' / 40' : G.lines;
    $('time').textContent = `${s / 60 | 0}:${(s % 60).toFixed(3).padStart(6, '0')}`;
    $('pk').textContent = `${s ? (G.pieces / s).toFixed(2) : '0.00'} · ${G.pieces ? (G.keysN / G.pieces).toFixed(2) : '0.00'}`;
    $('modeLabel').textContent = cfg.mode === 'glitch' ? `GLITCH · ${G.left} pzs` : cfg.mode === 'sprint' ? 'SPRINT 40' : 'ENDLESS';
  }
  bx.globalCompositeOperation = 'lighter';
  for (const q of PT) { bx.globalAlpha = Math.max(0, q.a); bx.fillStyle = q.c; bx.shadowColor = q.c; bx.shadowBlur = 8; bx.fillRect(q.x, q.y, q.s, q.s); }
  bx.globalCompositeOperation = 'source-over'; bx.globalAlpha = 1; bx.shadowBlur = 0;
}
let last = 0, acc = 0;
function loop(t) {
  const d = Math.min(100, t - last); last = t;
  if (G && G.state !== 'pause') { acc += d; while (acc >= 1000 / 60) { acc -= 1000 / 60; step(); } } else acc = 0;
  draw(); requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* ---------- Audio chiptune ---------- */
const Snd = (() => {
  let ac = null, on = false, i = 0, t = 0;
  const mid = n => 440 * 2 ** ((n - 69) / 12);
  const MEL = [[76,1],[71,.5],[72,.5],[74,1],[72,.5],[71,.5],[69,1],[69,.5],[72,.5],[76,1],[74,.5],[72,.5],[71,1.5],[72,.5],[74,1],[76,1],[72,1],[69,1],[69,1],[0,1]];
  function o(at, f, d, ty, v, to) {
    const s = ac.createOscillator(), g = ac.createGain(); s.type = ty; s.frequency.setValueAtTime(f, at);
    if (to) s.frequency.exponentialRampToValueAtTime(to, at + d);
    g.gain.setValueAtTime(v, at); g.gain.exponentialRampToValueAtTime(.0001, at + d);
    s.connect(g).connect(ac.destination); s.start(at); s.stop(at + d + .02);
  }
  setInterval(() => {
    if (!ac || !on || !G) return;
    const top = G.B.findIndex(r => r.some(Boolean)), dg = top >= 0 && (ROWS - top) / 20 > .7;
    const bpm = (140 + G.level * 1.5) * (dg ? 1.25 : 1), sh = dg ? 3 : 0;
    while (t < ac.currentTime + .2) {
      const [n, b] = MEL[i % MEL.length], d = b * 60 / bpm;
      if (n) o(t, mid(n + sh), d * .9, 'square', .04);
      o(t, mid((i % 2 ? 40 : 45) + sh), d * .9, 'triangle', .09);
      t += d; i++;
    }
  }, 50);
  return {
    init() { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); ac.resume(); },
    music(v) { on = v; if (v && ac) { t = ac.currentTime + .1; i = 0; } },
    sfx(n, c) {
      if (!ac) return; const a = ac.currentTime;
      if (n === 'move') o(a, 880, .03, 'square', .03);
      else if (n === 'rot') o(a, 1320, .04, 'square', .04);
      else if (n === 'drop') o(a, 140, .12, 'triangle', .25, 40);
      else if (n === 'clear') (c === 4 ? [523, 659, 784, 1047, 1319, 1568] : Array.from({ length: c + 2 }, (_, k) => mid(72 + k * 2)))
        .forEach((f, k) => o(a + k * .06, f, c === 4 ? .35 : .12, 'square', .06));
    }
  };
})();