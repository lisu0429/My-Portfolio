/**
 * 交互自检：星体网络的引线标注 / 展开收起 / 拖拽转动 / 帧率 / 降级动效
 *
 *   node scripts/check-interactions.mjs
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const RUNTIME =
  process.env.CODEX_NODE_MODULES ||
  'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/';
const require = createRequire(RUNTIME);
const { chromium } = require('playwright-core');

const OUT = fileURLToPath(new URL('../preview/', import.meta.url));
const BASE = process.env.SHOOT_URL || 'http://127.0.0.1:5173/';

const browser = await chromium.launch({ channel: 'chrome' });
const errors = [];

const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.setDefaultTimeout(120000);
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
page.on('pageerror', (e) => errors.push(e.message));

await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((n) => n.classList.add('is-in')));

const frame = page.locator('[class*="globeFrame"]').first();
await frame.scrollIntoViewIfNeeded();
await page.waitForTimeout(2500);
const rect = await frame.boundingBox();
const cx = rect.x + rect.width / 2;
const cy = rect.y + rect.height / 2;

const shot = async (name) => {
  await page.screenshot({
    path: `${OUT}v2-${name}.png`,
    fullPage: true,
    clip: {
      x: rect.x,
      y: rect.y + (await page.evaluate(() => window.scrollY)),
      width: rect.width,
      height: rect.height,
    },
  });
};

// 1) 悬停：引线 + 名字
let hit = null;
outer: for (const dx of [-0.25, -0.15, 0.15, 0.25, -0.05, 0.05, -0.32, 0.32]) {
  for (const dy of [-0.28, -0.12, 0.12, 0.28, 0]) {
    await page.mouse.move(cx + rect.width * dx, cy + rect.height * dy);
    await page.waitForTimeout(110);
    const hud = await page.locator('[class*="hudValue"]').first().innerText();
    if (hud && !hud.includes('悬停看名字')) {
      hit = { dx, dy, hud };
      break outer;
    }
  }
}
console.log('1) 悬停引线读数 =', hit ? hit.hud : '未命中');
if (hit) {
  await page.mouse.move(cx + rect.width * hit.dx, cy + rect.height * hit.dy);
  await page.waitForTimeout(800);
  await shot('globe-hover-callout');
}

// 2) 点击球体 -> 全部名字带引线展开；再点收起
await page.mouse.click(cx + rect.width * 0.02, cy + rect.height * 0.04);
await page.waitForTimeout(1400);
console.log('2) 展开态 HUD =', await page.locator('[class*="hudLabel"]').first().innerText());
await shot('globe-expanded');

const fps = await page.evaluate(
  () =>
    new Promise((resolve) => {
      let f = 0;
      const t0 = performance.now();
      const tick = () => {
        f += 1;
        if (performance.now() - t0 < 3000) requestAnimationFrame(tick);
        else resolve(Math.round((f * 1000) / (performance.now() - t0)));
      };
      requestAnimationFrame(tick);
    }),
);
console.log('3) 展开态 fps =', fps);

await page.mouse.click(cx + rect.width * 0.02, cy + rect.height * 0.04);
await page.waitForTimeout(1200);
console.log('4) 收起后 HUD =', await page.locator('[class*="hudLabel"]').first().innerText());

// 5) 拖拽转动
const globeData = () => page.evaluate(() => document.querySelector('canvas[data-globe-canvas]').toDataURL());
const before = await globeData();
await page.mouse.move(cx, cy);
await page.mouse.down();
for (let i = 1; i <= 12; i += 1) {
  await page.mouse.move(cx + i * 22, cy);
  await page.waitForTimeout(16);
}
await page.mouse.up();
await page.waitForTimeout(400);
const after = await globeData();
console.log('5) 拖拽后画面变化 =', before !== after ? '是 ✓' : '否 ✗');

await page.close();

// 6) reduced-motion：球体必须逐像素静止
const rm = await browser.newPage({ viewport: { width: 1920, height: 1080 }, reducedMotion: 'reduce' });
rm.setDefaultTimeout(120000);
rm.on('pageerror', (e) => errors.push(`[reduced-motion] ${e.message}`));
await rm.goto(BASE, { waitUntil: 'domcontentloaded' });
await rm.waitForTimeout(3000);
await rm.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((n) => n.classList.add('is-in')));
await rm.locator('[class*="globeFrame"]').first().scrollIntoViewIfNeeded();
await rm.waitForTimeout(2000);
const rmData = () => rm.evaluate(() => document.querySelector('canvas[data-globe-canvas]').toDataURL());
const dA = await rmData();
await rm.waitForTimeout(1500);
const dB = await rmData();
console.log('6) reduced-motion 球体静止 =', dA === dB ? '是 ✓' : '否 ✗');
await rm.close();

console.log('控制台报错:', errors.length ? JSON.stringify(errors, null, 2) : '无');
await browser.close();