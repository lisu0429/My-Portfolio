/**
 * 视觉自检脚本：逐板块截图 + 横向溢出检查 + 降级动效检查 + 控制台报错收集
 *
 *   node scripts/shoot.mjs               # 默认 1920x1080 截四个内容板块
 *   node scripts/shoot.mjs 1440 1280     # 追加指定宽度的响应式截图
 *
 * 依赖 playwright-core；若本机未安装，可用 Codex 内置运行时：
 *   CODEX_NODE_MODULES=... node scripts/shoot.mjs
 */
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const RUNTIME =
  process.env.CODEX_NODE_MODULES ||
  'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/';

function loadPlaywright() {
  for (const base of [RUNTIME, fileURLToPath(new URL('../node_modules/', import.meta.url))]) {
    if (!existsSync(base)) continue;
    try {
      return createRequire(base)('playwright-core');
    } catch {
      /* 继续尝试下一个候选路径 */
    }
  }
  throw new Error('未找到 playwright-core，请先安装 playwright-core');
}

const { chromium } = loadPlaywright();

const OUT = fileURLToPath(new URL('../preview/', import.meta.url));
const BASE = process.env.SHOOT_URL || 'http://127.0.0.1:5173/';
const SECTIONS = [
  ['about', '#about'],
  ['work', '#work'],
  ['strengths', '#strengths'],
  ['contact', '#contact'],
];

const widths = process.argv.slice(2).map(Number).filter(Boolean);
const viewports = widths.length ? widths : [1920];
const errors = [];

const LAUNCH = { waitUntil: 'domcontentloaded', timeout: 60000 };

/**
 * 按元素在整页中的位置裁切截图：比 element.screenshot 稳，不会卡在"元素稳定"等待上。
 * 截之前先滚过整个元素——像星体画布这种靠 IntersectionObserver 才绘制的内容，
 * 从没进过视口就是空白，fullPage 截出来会是空的。
 */
async function capture(page, locator, file) {
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const height = (await locator.boundingBox()).height;
  await page.evaluate((dy) => window.scrollBy(0, dy), height);
  await page.waitForTimeout(900);
  const box = await locator.boundingBox();
  const scrollY = await page.evaluate(() => window.scrollY);
  await page.screenshot({
    path: file,
    fullPage: true,
    clip: { x: box.x, y: box.y + scrollY, width: box.width, height: box.height },
  });
}

const browser = await chromium.launch({ channel: 'chrome' });

for (const width of viewports) {
  const page = await browser.newPage({ viewport: { width, height: 1080 } });
  page.setDefaultTimeout(120000);
  // 外网不通时 Google Fonts 的样式表永远挂着，document.fonts 不 settle，
  // 截图会一直卡在 "waiting for fonts to load"。掐断即可，页面本来就带字体回退。
  await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort());
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${width}] ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`[${width}] ${e.message}`));

  await page.goto(BASE, LAUNCH);
  await page.waitForTimeout(3000);
  // 跳过滚动显现动画，避免截到半透明的中间态
  await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((n) => n.classList.add('is-in')));
  await page.waitForTimeout(700);

  // 判据是"是否真能横向滚动"：装饰层（视频、雾带、星盘辉光）本就出血到视口外，
  // scrollWidth 会把它们算进去，但 body 的 overflow-x:hidden 已经裁掉了。
  const overflow = await page.evaluate(() => {
    const before = window.scrollX;
    window.scrollTo(500, 0);
    const after = window.scrollX;
    window.scrollTo(0, 0);
    return { scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth, canScrollX: after > before };
  });
  const tag = viewports.length > 1 ? `w${width}` : '';
  console.log(
    `[${width}px]`,
    overflow.canScrollX
      ? `可横向滚动 ${overflow.scrollW} > ${overflow.clientW}`
      : '无横向滚动',
  );

  for (const [name, sel] of SECTIONS) {
    await capture(page, page.locator(sel), `${OUT}v2-${name}${tag ? '-' + tag : ''}.png`);
  }

  // 优势卡片的"指针点亮"交互态
  if (!tag) {
    const card = page.locator('#strengths article').first();
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const box = await card.boundingBox();
    await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.22);
    await page.waitForTimeout(900);
    await capture(page, card, `${OUT}v2-hover-card.png`);
  }

  // 星盘统计格：hover 触发一次绕行
  if (!tag) {
    const stat = page.locator('#about [class*="stat"]').first();
    await stat.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const box = await stat.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(700);
    await capture(page, stat, `${OUT}v2-hover-stat.png`);
  }

  await page.close();
}

// prefers-reduced-motion 下内容必须直接可见
const rm = await browser.newPage({ viewport: { width: 1920, height: 1080 }, reducedMotion: 'reduce' });
rm.setDefaultTimeout(120000);
await rm.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort());
rm.on('pageerror', (e) => errors.push(`[reduced-motion] ${e.message}`));
await rm.goto(BASE, LAUNCH);
await rm.waitForTimeout(2000);
// 动效体系换成 GSAP 之后，降级检查的对象也换成 data-anim：
// reduced-motion 下所有动效元素必须直接处于终态，不能停在入场前的隐藏态
const rmState = await rm.evaluate(() => {
  const nodes = [...document.querySelectorAll('[data-anim]')];
  const hidden = nodes.filter((el) => {
    const cs = getComputedStyle(el);
    return cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.05;
  });
  return { total: nodes.length, hidden: hidden.length };
});
console.log('reduced-motion 动效元素 =', rmState.total, '，停在隐藏态 =', rmState.hidden);
await rm.close();

console.log('控制台报错:', errors.length ? JSON.stringify(errors, null, 2) : '无');
await browser.close();