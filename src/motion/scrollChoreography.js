import { gsap, ScrollTrigger, EASE, DUR, reducedMotion } from './gsapCore.js';

const pick = (root, sel) => Array.from(root.querySelectorAll(sel));

/**
 * 滚动编排：每个板块一套镜头语言
 *
 *   英文标签横向擦入 → 大标题自遮罩后升起（领先内容）→ 说明读数 → 等高线断开
 *   → 媒体揭示 → 卡片 / 列表行依次 stagger
 *
 * 板块头部是一个整体时间线（跟着板块顶边触发）；
 * 内容块各自带触发点，滚到才进，不会在屏幕外偷偷演完。
 */
export function initScrollChoreography(root = document) {
  if (reducedMotion()) {
    gsap.set(root.querySelectorAll('[data-anim]'), { clearProps: 'all' });
    return null;
  }

  const triggers = [];

  // ---- 板块头部 ----
  pick(root, '[data-scene]').forEach(scene => {
    const kicker = scene.querySelector('[data-anim="head-kicker"]');
    const title = scene.querySelector('[data-anim="head-title"]');
    const titles = title ? Array.from(scene.querySelectorAll('[data-anim="head-title"]')) : [];
    const note = scene.querySelector('[data-anim="head-note"]');
    const rule = scene.querySelector('[data-anim="head-rule"]');

    if (!kicker && !titles.length && !note && !rule) return;

    const tl = gsap.timeline({
      defaults: { ease: EASE.enter },
      scrollTrigger: { trigger: scene, start: 'top 80%', once: true },
    });

    if (kicker) {
      tl.fromTo(
        kicker,
        { xPercent: -14, opacity: 0, clipPath: 'inset(0% 100% 0% 0%)' },
        { xPercent: 0, opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 1.35 },
        0,
      );
    }

    if (titles.length) {
      tl.fromTo(
        titles,
        { yPercent: 108, opacity: 0.2 },
        { yPercent: 0, opacity: 1, duration: DUR.mask, stagger: 0.16 },
        0.16,
      );
    }

    if (note) {
      tl.from(note, { y: 32, opacity: 0, duration: DUR.rise }, 0.5);
    }

    if (rule) {
      tl.from(rule, { scaleX: 0, transformOrigin: '0% 50%', opacity: 0, duration: 1.7 }, 0.6);
    }

    triggers.push(tl.scrollTrigger);
  });

  // ---- 媒体揭示 ----
  pick(root, '[data-anim="media"]').forEach(el => {
    gsap.fromTo(
      el,
      { clipPath: 'inset(9% 0% 9% 0%)', scale: 1.05, transformOrigin: '50% 50%', opacity: 0.35 },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        scale: 1,
        opacity: 1,
        duration: DUR.media,
        ease: EASE.enter,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onStart: () => gsap.set(el, { willChange: 'clip-path' }),
        onComplete: () => gsap.set(el, { clearProps: 'willChange' }),
      },
    );
  });

  // ---- 整块内容 ----
  pick(root, '[data-anim="block"]').forEach(el => {
    gsap.from(el, {
      y: 46,
      opacity: 0,
      duration: DUR.card,
      ease: EASE.enter,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // ---- 卡片 / 列表行依次进场 ----
  const stagger = (containerSel, itemSel, distance) => {
    pick(root, containerSel).forEach(container => {
      const items = Array.from(container.querySelectorAll(itemSel));
      if (!items.length) return;
      gsap.from(items, {
        y: distance,
        opacity: 0,
        scale: 0.97,
        duration: DUR.card,
        ease: EASE.enter,
        stagger: 0.14,
        scrollTrigger: { trigger: container, start: 'top 86%', once: true },
      });
    });
  };
  stagger('[data-anim="cards"]', '[data-anim="card"]', 64);
  stagger('[data-anim="rows"]', '[data-anim="row"]', 40);

  // ---- 视差：图片比版块慢半拍 ----
  pick(root, '[data-parallax]').forEach(el => {
    const scene = el.closest('[data-scene]') || el;
    gsap.fromTo(
      el,
      { yPercent: -5 },
      {
        yPercent: 5,
        ease: EASE.scrub,
        scrollTrigger: { trigger: scene, start: 'top bottom', end: 'bottom top', scrub: 0.7 },
      },
    );
  });

  // ---- 首屏媒体：随滚动慢速上移 ----
  const heroMedia = root.querySelector('[data-anim="hero-media"]');
  if (heroMedia) {
    gsap.fromTo(
      heroMedia,
      { yPercent: 3.5, scale: 1.12, transformOrigin: '50% 50%' },
      {
        yPercent: -3.5,
        scale: 1.12,
        ease: EASE.scrub,
        scrollTrigger: {
          trigger: heroMedia.closest('section') || heroMedia,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.7,
        },
      },
    );
  }

  return () => triggers.forEach(t => t?.kill());
}
