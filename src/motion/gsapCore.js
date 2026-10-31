import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * 缓动词汇表：入场用 expo（快起慢收，丝滑），收尾用 power4（沉稳），
 * 不用 back / elastic —— 任何回弹都会把"高级"变成"廉价"。
 */
export const EASE = {
  enter: 'power4.out',
  settle: 'power4.out',
  soft: 'power3.out',
  scrub: 'none',
};

/** 入场统一时长：节奏慢，但不至于让人等 */
export const DUR = {
  mask: 1.7,
  rise: 1.35,
  card: 1.45,
  media: 1.8,
};

export const reducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export { gsap, ScrollTrigger };
