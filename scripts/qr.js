/* qr.js — Offline QR Code generator for MTP Digital classroom
   Byte mode · EC level L · versions 1–5 (up to 106 bytes)
   Public API: window.drawQR(canvas, text, moduleSize=8, quietZone=4) */
(function (global) {
"use strict";

/* ── GF(256) with primitive polynomial x^8+x^4+x^3+x^2+1 ── */
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
(function () {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x = ((x << 1) ^ (x & 0x80 ? 0x1D : 0)) & 0xFF;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
}());

function gfMul(a, b) {
  return (a && b) ? EXP[LOG[a] + LOG[b]] : 0;
}

/* ── Reed–Solomon error correction ── */
function rsRemainder(data, nEC) {
  // Build generator poly g(x) = prod(x + alpha^i) for i=0..nEC-1
  const gen = new Uint8Array(nEC + 1);
  gen[0] = 1;
  for (let i = 0; i < nEC; i++) {
    for (let j = i + 1; j >= 1; j--) {
      gen[j] ^= gfMul(gen[j - 1], EXP[i]);
    }
  }
  // Synthetic division: data * x^nEC mod g(x)
  const msg = new Uint8Array(data.length + nEC);
  msg.set(data);
  for (let i = 0; i < data.length; i++) {
    const c = msg[i];
    if (c) for (let j = 1; j <= nEC; j++) msg[i + j] ^= gfMul(gen[j], c);
  }
  return msg.slice(data.length);
}

/* ── Version table: [dataCW, ecCW] for EC level L, versions 1–5 ── */
const VER = [null, [19,7], [34,10], [55,15], [80,20], [108,26]];
// Byte capacity: floor((dataCW*8 - 12) / 8) = dataCW - 2 (approx)
// Exact: 4+8+n*8 <= dataCW*8 → n <= dataCW - 1 - floor(12/8) hmm
// Simpler: check 12 + n*8 <= dataCW*8
function pickVersion(n) {
  for (let v = 1; v <= 5; v++) {
    if (12 + n * 8 <= VER[v][0] * 8) return v;
  }
  return null; // too long
}

/* ── Byte-mode data encoding ── */
function encodeData(bytes, dataCW) {
  const bits = [];
  const push = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1); };
  push(0b0100, 4);           // byte mode indicator
  push(bytes.length, 8);     // character count (8 bits for versions 1–9)
  for (const b of bytes) push(b, 8);
  // Terminator
  for (let i = 0; i < 4 && bits.length < dataCW * 8; i++) bits.push(0);
  // Pad to byte boundary
  while (bits.length % 8) bits.push(0);
  // Fill with padding codewords
  const PAD = [0xEC, 0x11];
  for (let p = 0; bits.length < dataCW * 8; p++) push(PAD[p % 2], 8);
  // Pack bits into codeword bytes
  const cw = new Uint8Array(dataCW);
  for (let i = 0; i < dataCW; i++)
    for (let b = 0; b < 8; b++) cw[i] = (cw[i] << 1) | bits[i * 8 + b];
  return cw;
}

/* ── Format information (BCH + XOR mask) ── */
function fmtWord(mask) {
  // EC level L = indicator 01; format data = 01 << 3 | mask
  const data = (1 << 3) | mask;
  let rem = data << 10;
  for (let i = 14; i >= 10; i--)
    if (rem & (1 << i)) rem ^= 0x537 << (i - 10);
  return ((data << 10) | (rem & 0x3FF)) ^ 0x5412;
}

/* ── Matrix helpers ── */
function makeMatrix(size) {
  const n = size * size;
  const mod = new Uint8Array(n); // 0=light, 1=dark
  const rsv = new Uint8Array(n); // 1=function module (skip during data placement)
  return {
    size, mod, rsv,
    fn(r, c, dark) { mod[r*size+c] = dark ? 1 : 0; rsv[r*size+c] = 1; },
    dt(r, c, dark) { mod[r*size+c] = dark ? 1 : 0; },          // data/format write
    get(r, c)      { return mod[r*size+c]; },
    isFn(r, c)     { return rsv[r*size+c] === 1; },
  };
}

/* ── Finder pattern (7×7) + 1-wide white separator ── */
function placeFinder(m, row, col) {
  for (let dr = -1; dr <= 7; dr++) {
    for (let dc = -1; dc <= 7; dc++) {
      const r = row + dr, c = col + dc;
      if (r < 0 || c < 0 || r >= m.size || c >= m.size) continue;
      const inBox = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
      const dark = inBox && (
        dr === 0 || dr === 6 || dc === 0 || dc === 6 ||
        (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4)
      );
      m.fn(r, c, dark);
    }
  }
}

/* ── Timing patterns (row 6, col 6) ── */
function placeTiming(m) {
  for (let i = 8; i < m.size - 8; i++) {
    m.fn(6, i, i % 2 === 0);
    m.fn(i, 6, i % 2 === 0);
  }
}

/* ── Alignment pattern (5×5), center at (row, col) ── */
function placeAlign(m, row, col) {
  for (let dr = -2; dr <= 2; dr++)
    for (let dc = -2; dc <= 2; dc++)
      m.fn(row + dr, col + dc,
        dr === -2 || dr === 2 || dc === -2 || dc === 2 || (dr === 0 && dc === 0));
}

/* ── Format info positions (two copies) ── */
const FMT_POS1 = [
  [8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],
  [7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]
];
function reserveFormat(m) {
  const s = m.size;
  for (const [r,c] of FMT_POS1) m.fn(r, c, false);
  for (let i = 0; i < 7; i++) m.fn(s-1-i, 8, false);  // copy 2 bottom-left
  m.fn(8, s-8, false);                                  // copy 2 bit 7
  for (let i = 0; i < 7; i++) m.fn(8, s-7+i, false);  // copy 2 top-right
}
function writeFormat(m, fw) {
  const s = m.size;
  for (let i = 0; i < 15; i++) {
    const bit = (fw >> (14 - i)) & 1;
    m.dt(FMT_POS1[i][0], FMT_POS1[i][1], bit);
  }
  for (let i = 0; i < 7; i++) m.dt(s-1-i, 8, (fw >> i) & 1);
  m.dt(8, s-8, (fw >> 7) & 1);
  for (let i = 0; i < 7; i++) m.dt(8, s-7+i, (fw >> (14-i)) & 1);
}

/* ── Place data bits (zigzag, skip reserved) ── */
function placeDataBits(m, bits) {
  let bi = 0;
  let up = true;
  for (let col = m.size - 1; col >= 1; col -= 2) {
    if (col === 6) col = 5; // skip timing column
    for (let off = 0; off < m.size; off++) {
      const row = up ? m.size - 1 - off : off;
      for (const c of [col, col - 1]) {
        if (!m.isFn(row, c)) {
          m.dt(row, c, bi < bits.length ? bits[bi++] : 0);
        }
      }
    }
    up = !up;
  }
}

/* ── Mask patterns ── */
const MASK_FN = [
  (r,c) => (r+c)%2 === 0,
  (r,c) => r%2 === 0,
  (r,c) => c%3 === 0,
  (r,c) => (r+c)%3 === 0,
  (r,c) => (Math.floor(r/2)+Math.floor(c/3))%2 === 0,
  (r,c) => (r*c)%2+(r*c)%3 === 0,
  (r,c) => ((r*c)%2+(r*c)%3)%2 === 0,
  (r,c) => ((r+c)%2+(r*c)%3)%2 === 0,
];
function applyMask(m, maskNum) {
  const fn = MASK_FN[maskNum];
  for (let r = 0; r < m.size; r++)
    for (let c = 0; c < m.size; c++)
      if (!m.isFn(r, c) && fn(r, c)) m.mod[r*m.size+c] ^= 1;
}

/* ── Penalty scoring ── */
function penalty(m) {
  const s = m.size;
  const g = (r,c) => m.mod[r*s+c];
  let score = 0;

  // Rule 1: 5+ same-color in a row/col
  for (let i = 0; i < s; i++) {
    for (let vert = 0; vert < 2; vert++) {
      let run = 1;
      for (let j = 1; j < s; j++) {
        const cur  = vert ? g(j,i)   : g(i,j);
        const prev = vert ? g(j-1,i) : g(i,j-1);
        if (cur === prev) { run++; if (run >= 5) score += (run === 5 ? 3 : 1); }
        else run = 1;
      }
    }
  }
  // Rule 2: 2×2 same-color blocks
  for (let r = 0; r < s-1; r++)
    for (let c = 0; c < s-1; c++) {
      const v = g(r,c);
      if (v===g(r,c+1) && v===g(r+1,c) && v===g(r+1,c+1)) score += 3;
    }
  // Rule 3: finder-like patterns
  const P1=[1,0,1,1,1,0,1,0,0,0,0], P2=[0,0,0,0,1,0,1,1,1,0,1];
  for (let r = 0; r < s; r++) {
    for (let c = 0; c <= s-11; c++) {
      let a1=true,a2=true,b1=true,b2=true;
      for (let k=0;k<11;k++){
        if(g(r,c+k)!==P1[k])a1=false; if(g(r,c+k)!==P2[k])a2=false;
        if(g(c+k,r)!==P1[k])b1=false; if(g(c+k,r)!==P2[k])b2=false;
      }
      if(a1||a2) score+=40; if(b1||b2) score+=40;
    }
  }
  // Rule 4: dark proportion
  let dark=0;
  for (let i=0;i<s*s;i++) dark+=m.mod[i];
  const p = dark/(s*s)*100;
  score += Math.min(Math.abs(Math.floor(p/5)*5-50),Math.abs(Math.ceil(p/5)*5-50))/5*10;
  return score;
}

/* ── Alignment pattern center positions for versions 1–5 ── */
const ALIGN_CENTER = [0, 0, 18, 22, 26, 30]; // index = version
// Remainder bits appended after all codewords
const REMAINDER   = [0, 0, 7, 7, 7, 7];      // index = version

/* ── Build the QR matrix for a given text string ── */
function buildQR(text) {
  const bytes = new TextEncoder().encode(text);
  const version = pickVersion(bytes.length);
  if (!version) throw new Error('Text too long for QR version 5 (max ~106 bytes)');

  const [dataCW, ecCW] = VER[version];
  const size = 4 * version + 17;

  // 1. Encode data codewords
  const dCW = encodeData(bytes, dataCW);

  // 2. Error-correction codewords (single block for versions 1–5 at L)
  const eCW = rsRemainder(dCW, ecCW);

  // 3. Interleave (trivial for 1 block) and convert to bit stream
  const bits = [];
  for (const b of [...dCW, ...eCW])
    for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1);
  for (let i = 0; i < REMAINDER[version]; i++) bits.push(0);

  // 4. Base matrix: function patterns + format reservation
  const m = makeMatrix(size);
  placeFinder(m, 0, 0);
  placeFinder(m, 0, size - 7);
  placeFinder(m, size - 7, 0);
  placeTiming(m);
  const ac = ALIGN_CENTER[version];
  if (ac) placeAlign(m, ac, ac);
  m.fn(4 * version + 9, 8, true); // dark module
  reserveFormat(m);

  // 5. Place data bits
  placeDataBits(m, bits);

  // 6. Try all 8 masks, pick lowest penalty
  // We work on snapshot copies for scoring, then rebuild the winner
  let bestMask = 0, bestScore = Infinity;
  const snapshot = new Uint8Array(m.mod);
  for (let mask = 0; mask < 8; mask++) {
    m.mod.set(snapshot);
    applyMask(m, mask);
    writeFormat(m, fmtWord(mask));
    const s = penalty(m);
    if (s < bestScore) { bestScore = s; bestMask = mask; }
  }

  // 7. Rebuild with winner
  m.mod.set(snapshot);
  applyMask(m, bestMask);
  writeFormat(m, fmtWord(bestMask));

  return m;
}

/* ── Public API ── */
global.drawQR = function drawQR(canvas, text, moduleSize, quietZone) {
  moduleSize = moduleSize || 8;
  quietZone  = (quietZone === undefined) ? 4 : quietZone;
  try {
    const m = buildQR(text);
    const total = (m.size + 2 * quietZone) * moduleSize;
    canvas.width  = total;
    canvas.height = total;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, total, total);
    ctx.fillStyle = '#000000';
    for (let r = 0; r < m.size; r++)
      for (let c = 0; c < m.size; c++)
        if (m.get(r, c))
          ctx.fillRect((c + quietZone)*moduleSize, (r + quietZone)*moduleSize,
                       moduleSize, moduleSize);
  } catch (err) {
    // Fallback: draw error text on canvas
    const ctx = canvas.getContext('2d');
    canvas.width = 200; canvas.height = 50;
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,200,50);
    ctx.fillStyle = '#f00'; ctx.font = '11px sans-serif';
    ctx.fillText('QR error: ' + err.message, 4, 20);
  }
};

}(window));
