import { useMemo } from 'react';
import s from './Survey.module.css';

const VIEW_W = 1000;
const VIEW_H = 60;
const SAMPLES = 28;

/* ------------------------------------------------------------------ *
 * 地形生成：确定性随机 —— 同一个 seed 永远得到同一张等高线图
 * ------------------------------------------------------------------ */

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 多谐波地形：连续的高度函数，可沿横向连续采样。
 * 频率互不成整数比，波形因此不会退化成规则的正弦带。
 */
function makeTerrain(seed, harmonics = 5) {
  const rnd = mulberry32(seed);
  const waves = Array.from({ length: harmonics }, () => ({
    f: 0.9 + rnd() * 2.4,
    a: 0.35 + rnd() * 0.65,
    p: rnd() * Math.PI * 2,
  }));
  const norm = waves.reduce((sum, w) => sum + w.a, 0);
  return (u) => {
    let y = 0;
    for (const w of waves) y += Math.sin(u * Math.PI * 2 * w.f + w.p) * w.a;
    return y / norm;
  };
}

/** Catmull-Rom 转三次贝塞尔，得到穿过控制点的平滑曲线 */
function smoothPath(pts) {
  const ring = [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M ${ring[1].x.toFixed(1)} ${ring[1].y.toFixed(1)}`;
  for (let i = 1; i < ring.length - 2; i += 1) {
    const p0 = ring[i - 1];
    const p1 = ring[i];
    const p2 = ring[i + 1];
    const p3 = ring[i + 2];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}


/* ------------------------------------------------------------------ *
 * 等高线
 * ------------------------------------------------------------------ */

/**
 * 一组等高线。计曲线（index contour）每隔 majorEvery 条加粗提亮，
 * 与背景 Topography 的 majorLines 规则一致。
 */
export function ContourRule({
  lines = 6,
  amp = 9,
  spacing = 8,
  majorEvery = 3,
  seed = 7,
  fill = false,
  className = '',
  ...rest
}) {
  const paths = useMemo(() => {
    const terrain = makeTerrain(seed);
    const rnd = mulberry32(seed ^ 0x9e3779b9);
    const out = [];
    for (let i = 0; i < lines; i += 1) {
      const t = lines === 1 ? 0.5 : i / (lines - 1);
      // 线距按坡度收拢：一侧密、一侧疏，与地图上的等高线一致
      const offset = (Math.pow(t, 1.45) - 0.5) * spacing * (lines - 1);
      const gain = 0.82 + rnd() * 0.36;
      const drift = (rnd() - 0.5) * 0.04;
      const pts = Array.from({ length: SAMPLES }, (_, k) => {
        const u = k / (SAMPLES - 1);
        return {
          x: u * VIEW_W,
          y: offset + terrain(u + drift) * amp * gain,
        };
      });
      out.push({
        d: smoothPath(pts),
        major: majorEvery > 0 && i % majorEvery === 0,
      });
    }
    return out;
  }, [lines, amp, spacing, majorEvery, seed]);

  return (
    <span
      className={`${s.root} ${fill ? s.fill : s.rule} ${className}`.trim()}
      aria-hidden="true"
      {...rest}
    >
      <svg
        className={s.svg}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        focusable="false"
      >
        <g fill="none" stroke="currentColor" strokeLinecap="round">
          {paths.map((p, i) => (
            <path
              key={i}
              d={p.d}
              strokeWidth={p.major ? 1.4 : 0.7}
              opacity={p.major ? 0.95 : 0.4}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * 测绘标记 / 高程刻度 / 等宽读数
 * ------------------------------------------------------------------ */

/** 十字测绘标记，对应背景里会闪烁的 survey markers */
export function Marker({ size = 10, blink = false, className = '' }) {
  return (
    <svg
      className={`${s.marker} ${blink ? s.blink : ''} ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6 0.6v10.8M0.6 6h10.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
      />
    </svg>
  );
}

/** 高程刻度尺；level 表示前 level 格被点亮，用于读出数量 */
export function Ticks({ count = 12, level = 0, majorEvery = 4, label, className = '' }) {
  const a11y = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': 'true' };
  return (
    <span className={`${s.ticks} ${className}`.trim()} {...a11y}>
      {Array.from({ length: count }, (_, i) => (
        <i
          key={i}
          className={i < level ? s.on : ''}
          data-major={i % majorEvery === 0 ? 'true' : undefined}
        />
      ))}
    </span>
  );
}

/** 图幅规格读数条：等宽字体的小号测绘参数 */
export function Readout({ items = [], className = '' }) {
  if (!items.length) return null;
  return (
    <dl className={`${s.readout} ${className}`.trim()}>
      {items.map(([k, v]) => (
        <div key={k} className={s.readoutItem}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}