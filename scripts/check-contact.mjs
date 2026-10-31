/** 联系页弧形输入条自检：按钮点击 / 回车提交 是否真的打开 GitHub */
import { createRequire } from 'node:module';
const RUNTIME = 'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/';
const { chromium } = createRequire(RUNTIME)('playwright-core');

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.setDefaultTimeout(120000);
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(e.message));

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((n) => n.classList.add('is-in')));

// 拦下 window.open，记录被打开的地址
await page.evaluate(() => {
  window.__opened = [];
  window.open = (url) => { window.__opened.push(url); return null; };
});

const contact = page.locator('#contact');
await contact.scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);

const bar = page.locator('[class*="githubBar"]');
console.log('1) 弧形条可见 =', await bar.isVisible());
console.log('   显示文本 =', (await bar.innerText()).trim() || '(SVG 文本，非 DOM 文本)');

// 点按钮
const btn = page.locator('[class*="githubBar"] g[role="button"]');
await btn.click({ force: true });
await page.waitForTimeout(400);
console.log('2) 点击"前往"后 window.open =', JSON.stringify(await page.evaluate(() => window.__opened)));

// 回车提交
await page.locator('[class*="githubBar"] input').focus();
await page.keyboard.press('Enter');
await page.waitForTimeout(400);
console.log('3) 回车后 window.open =', JSON.stringify(await page.evaluate(() => window.__opened)));

// 输入框是否被锁死（值不可改）
const locked = await page.evaluate(() => {
  const i = document.querySelector('[class*="githubBar"] input');
  const before = i.value;
  i.focus();
  return { before, readOnlyEffective: before === 'github.com/lisu0429' };
});
console.log('4) 输入框当前值 =', JSON.stringify(locked));

console.log('控制台报错:', errors.length ? JSON.stringify(errors, null, 2) : '无');
await browser.close();