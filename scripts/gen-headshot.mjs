// 从原图生成挂带卡片正面用的证件照：裁掉水印、抠掉白底、下半身渐隐进卡片底色
// 用法: node scripts/gen-headshot.mjs
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/');
const sharp = require('sharp');

const SRC = 'C:/Users/Administrator/Desktop/简历/照片/kling_20261030_作品_使用改照片生成对应的_4208_0.png';
const BG_LEVEL = 252;
const CARD = [255, 255, 255]; // 卡片白底

(async () => {
  const { data, info } = await sharp(SRC).extract({ left: 0, top: 0, width: 880, height: 1100 }).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const N = W * H;

  const nearWhite = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    const r = data[i * C], g = data[i * C + 1], b = data[i * C + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    nearWhite[i] = mn > 235 && mx - mn < 14 ? 1 : 0;
  }
  // 只从左、右、上三边洪泛：底边中央是白 T 恤，灌进去会把躯干抠掉
  const bg = new Uint8Array(N);
  const queue = new Int32Array(N);
  let qh = 0, qt = 0;
  const push = i => { if (!bg[i] && nearWhite[i]) { bg[i] = 1; queue[qt++] = i; } };
  for (let x = 0; x < W; x++) push(x);
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (qh < qt) {
    const i = queue[qh++], x = i % W, y = (i / W) | 0;
    if (x > 0) push(i - 1);
    if (x < W - 1) push(i + 1);
    if (y > 0) push(i - W);
    if (y < H - 1) push(i + W);
  }

  const dist = new Int32Array(N).fill(-1);
  qh = 0; qt = 0;
  for (let i = 0; i < N; i++) if (bg[i]) { dist[i] = 0; queue[qt++] = i; }
  while (qh < qt) {
    const i = queue[qh++], x = i % W, y = (i / W) | 0, d = dist[i] + 1;
    if (x > 0 && dist[i - 1] < 0) { dist[i - 1] = d; queue[qt++] = i - 1; }
    if (x < W - 1 && dist[i + 1] < 0) { dist[i + 1] = d; queue[qt++] = i + 1; }
    if (y > 0 && dist[i - W] < 0) { dist[i - W] = d; queue[qt++] = i - W; }
    if (y < H - 1 && dist[i + W] < 0) { dist[i + W] = d; queue[qt++] = i + W; }
  }

  const smoothstep = (e0, e1, v) => { const t = Math.min(1, Math.max(0, (v - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  const px = new Uint8ClampedArray(N * 4);
  for (let i = 0; i < N; i++) {
    const x = i % W, y = (i / W) | 0;
    const r0 = data[i * C], g0 = data[i * C + 1], b0 = data[i * C + 2];
    const d = dist[i];
    let spatial = 1;
    if (d === 0) spatial = 0;
    else if (d === 1) spatial = 0.3;
    else if (d === 2) spatial = 0.55;
    else if (d === 3) spatial = 0.75;
    else if (d === 4) spatial = 0.9;
    const mn = Math.min(r0, g0, b0);
    const aEst = Math.min(1, Math.max(0, 1 - mn / BG_LEVEL));
    let cr = r0, cg = g0, cb = b0;
    if (spatial > 0 && spatial < 1 && aEst > 0.06) {
      cr = (r0 - BG_LEVEL * (1 - aEst)) / aEst;
      cg = (g0 - BG_LEVEL * (1 - aEst)) / aEst;
      cb = (b0 - BG_LEVEL * (1 - aEst)) / aEst;
    }
    // 底部（白 T 恤 / 米色布景）渐隐进卡片底色，避免整块浅色压在卡上
    const t = smoothstep(600, H, y) * 0.94;
    cr = cr + (CARD[0] - cr) * t;
    cg = cg + (CARD[1] - cg) * t;
    cb = cb + (CARD[2] - cb) * t;
    px[i * 4] = cr; px[i * 4 + 1] = cg; px[i * 4 + 2] = cb; px[i * 4 + 3] = spatial * 255;
  }

  const out = 'C:/Users/Administrator/Desktop/简历/个人作品集/src/assets/headshot.webp';
  await sharp(px, { raw: { width: W, height: H, channels: 4 } })
    .webp({ quality: 92, alphaQuality: 90, effort: 5 })
    .toFile(out);
  console.log('saved', out);
  const st = fs.statSync(out);
  console.log('size', st.size, 'bytes');
  await sharp({ create: { width: W, height: H, channels: 4, background: '#ffffff' } })
    .composite([{ input: out }]).png().toFile('C:/Users/Administrator/.codex/visualizations/2026/10/30/01a18c0b-a55b-7430-b3e6-5bf7d768420c/full_on_card.png');
})();
