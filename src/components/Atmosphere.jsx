import { useEffect, useRef } from 'react';
import s from './Atmosphere.module.css';

/**
 * 全局雾层：柔和雾带 + 朦胧光斑 + 半透明粒子
 * 所有运动都是 9–14s 级别的慢速漂移，避免快速闪动
 */
export default function Atmosphere({ variant = 'page' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;

    // 预渲染一枚柔光粒子，后续只做 drawImage，避免每帧建渐变
    const sprite = document.createElement('canvas');
    const S = 64;
    sprite.width = S;
    sprite.height = S;
    const sctx = sprite.getContext('2d');
    const grad = sctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    grad.addColorStop(0, 'rgba(226, 242, 250, 0.95)');
    grad.addColorStop(0.35, 'rgba(180, 214, 228, 0.28)');
    grad.addColorStop(1, 'rgba(180, 214, 228, 0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, S, S);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 110;
    const motes = Array.from({ length: COUNT }, () => ({
      x: Math.random() * (window.innerWidth || 1920),
      y: Math.random() * (window.innerHeight || 1080),
      r: 0.6 + Math.random() * 2.4,
      speed: 0.05 + Math.random() * 0.22,
      alpha: 0.1 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
      warm: Math.random() < 0.18,
    }));

    const paint = () => {
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        const size = m.r * 9;
        ctx.globalAlpha = m.alpha;
        ctx.drawImage(
          sprite,
          m.x - size / 2,
          m.y - size / 2,
          size,
          size,
        );
      }
      ctx.globalAlpha = 1;
    };

    const step = () => {
      for (const m of motes) {
        m.y -= m.speed;
        m.x += Math.sin(m.phase + m.y * 0.008) * 0.14;
        if (m.y < -20) {
          m.y = h + 20;
          m.x = Math.random() * w;
        }
      }
      paint();
      raf = window.requestAnimationFrame(step);
    };

    if (reduced) {
      paint();
    } else {
      raf = window.requestAnimationFrame(step);
    }

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className={`${s.atmosphere} ${s[variant]}`} aria-hidden="true">
      <span className={`${s.band} ${s.band1}`} />
      <span className={`${s.band} ${s.band2}`} />
      <span className={`${s.band} ${s.band3}`} />
      <span className={`${s.band} ${s.band4}`} />
      <span className={`${s.spot} ${s.spot1}`} />
      <span className={`${s.spot} ${s.spot2}`} />
      <span className={`${s.spot} ${s.spot3}`} />
      <canvas className={s.motes} ref={canvasRef} />
    </div>
  );
}
