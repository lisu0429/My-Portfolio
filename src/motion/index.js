import { gsap, ScrollTrigger } from './gsapCore.js';
import { playHeroIntro } from './heroIntro.js';
import { initScrollChoreography } from './scrollChoreography.js';

/**
 * 页面动效总入口：
 * 首屏 opening 立刻播，滚动编排交给 ScrollTrigger。
 * 统一挂在一个 ScrollTrigger.context 里，卸载时一次性回滚。
 */
export function initMotion() {
  // GSAP 3.15 起 ScrollTrigger.context 已移除，统一用核心的 gsap.context()：
  // 在它里面创建的 ScrollTrigger 会自动纳入作用域，revert() 一次清干净
  const ctx = gsap.context(() => {
    playHeroIntro(document);
    initScrollChoreography(document);
  });

  // 图片 / 字体落位后重新量一次触发点，避免高度变化导致触发位置偏移
  window.addEventListener('load', () => ScrollTrigger.refresh());
  window.setTimeout(() => ScrollTrigger.refresh(), 1200);

  return () => {
    ctx.revert();
  };
}
