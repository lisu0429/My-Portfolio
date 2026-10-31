import { useEffect, useRef } from 'react';
import Aurora from './Aurora/Aurora.jsx';
import s from './AuroraLayer.module.css';

/**
 * 极光背景层：React Bits 的 <Aurora />
 * 首屏留给骑行视频，这条从「个人经历」板块开始接管页面背景，一路铺到页尾
 */
const START_ANCHOR = 'about';

/** 帘幕固定在视口顶部，只有等首屏的骑行视频退出视野才看得见它 */
const FADE_SPAN = 0.55;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function AuroraLayer() {
  const layerRef = useRef(null);

  useEffect(() => {
    const anchor = document.getElementById(START_ANCHOR);
    const layer = layerRef.current;
    if (!anchor || !layer) return undefined;
    const update = () => {
      const rect = anchor.getBoundingClientRect();
      // 透明度直接跟着滚动走：锚点顶边从视口底一路升到顶，帘幕连续浮现，
      // 而不是等某个临界点再整块切进来
      const next = clamp(1 - rect.top / (window.innerHeight * FADE_SPAN), 0, 1);
      layer.style.opacity = next.toFixed(3);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div ref={layerRef} className={s.layer} aria-hidden="true">
      <Aurora
        colorStops={['#8fe3ff', '#bbede1', '#6f9bff']}
        direction="top"
        amplitude={1}
        blend={0.5}
        height={0.32}
        speed={0.8}
        glow={0.6}
        scale={1}
        brightness={1}
        layers={2}
        opacity={0.85}
        mouseInteraction
        dpr={1.25}
      />
    </div>
  );
}


