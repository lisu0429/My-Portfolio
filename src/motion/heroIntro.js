import { gsap, EASE, DUR, reducedMotion } from './gsapCore.js';

/**
 * 首屏 opening：一条 2.6s 的编排时间线
 *
 * 节奏：媒体揭幕 → 小标签升 → 巨名（遮罩掀开 + 压缩后归位）→ 副文案 → CTA → 底部信息
 * 所有入场只碰 transform / opacity / clip-path，不触发重排。
 */
export function playHeroIntro(root = document) {
  const pick = sel => Array.from(root.querySelectorAll(sel));
  const media = pick('[data-anim="hero-media"]');
  const labels = pick('[data-anim="hero-label"]');
  const name = pick('[data-anim="hero-name"]');
  const lead = pick('[data-anim="hero-lead"]');
  const cta = pick('[data-anim="hero-cta"]');
  const meta = pick('[data-anim="hero-meta"]');
  const nav = pick('[data-anim="nav"]');
  const navParts = pick('[data-anim="nav-part"]');

  const all = [...media, ...labels, ...name, ...lead, ...cta, ...meta, ...nav, ...navParts];

  if (reducedMotion()) {
    gsap.set(all, { clearProps: 'all' });
    return null;
  }

  const tl = gsap.timeline({ defaults: { ease: EASE.settle }, paused: true });

  // 媒体：一道自上而下的幕布，同时镜头从略微推近归位
  if (media.length) {
    // 只做遮罩揭开：全屏元素逐帧 scale 会让整张 1440×900 的图层重绘，
    // 缩放交给视差那一条常驻 tween，保持一个静态值
    tl.fromTo(
      media,
      { clipPath: 'inset(0% 0% 100% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 2.2,
        ease: 'power3.inOut',
        // 揭幕期间提层，动画结束后撤掉：clip-path 能尽量走合成线程
        onStart: () => gsap.set(media, { willChange: 'clip-path' }),
        onComplete: () => gsap.set(media, { clearProps: 'willChange' }),
      },
      0,
    );
  }

  // 导航：自上方落下
  if (nav.length) {
    tl.from(nav, { y: -26, opacity: 0, duration: 1.4, ease: EASE.enter }, 0.15);
  }
  if (navParts.length) {
    tl.from(
      navParts,
      { y: 12, opacity: 0, duration: 1.2, stagger: 0.08, ease: EASE.enter },
      0.35,
    );
  }

  // 巨名两侧的等宽标签：从遮罩后升起
  if (labels.length) {
    tl.from(
      labels,
      { yPercent: 118, opacity: 0, duration: 1.5, stagger: 0.14, ease: EASE.enter },
      0.4,
    );
  }

  // 巨名：遮罩掀开 + 纵向压缩后归位（squash → settle），带一点横向拉伸
  if (name.length) {
    tl.fromTo(
      name,
      {
        yPercent: 16,
        scaleY: 0.74,
        scaleX: 1.05,
        opacity: 0,
        transformOrigin: '50% 0%',
        clipPath: 'inset(0% 0% 100% 0%)',
      },
      {
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        opacity: 1,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 2.1,
        ease: EASE.enter,
        // 遮罩只是揭幕的道具，揭完就摘掉：否则巨名那圈 drop-shadow 光晕会被裁掉
        onComplete: () => gsap.set(name, { clearProps: 'clipPath' }),
      },
      0.75,
    );
  }

  // 副文案：擦入
  if (lead.length) {
    tl.fromTo(
      lead,
      { y: 34, opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' },
      { y: 0, opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: EASE.enter },
      1.8,
    );
  }

  // CTA：依次落位
  if (cta.length) {
    tl.from(
      cta,
      { y: 26, opacity: 0, scale: 0.95, duration: 1.3, stagger: 0.13, ease: EASE.enter },
      2.05,
    );
  }

  // 底部信息条：逐条升起
  if (meta.length) {
    tl.from(
      meta,
      { y: 18, opacity: 0, duration: 1.1, stagger: 0.08, ease: EASE.enter },
      2.35,
    );
  }

  // 下一帧再开播：StrictMode 会把 effect 跑两遍，推迟一帧可以只播一次
  requestAnimationFrame(() => tl.play());

  return tl;
}
