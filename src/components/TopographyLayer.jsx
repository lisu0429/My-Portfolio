import Topography from './Topography/Topography.jsx';
import s from './TopographyLayer.module.css';

/**
 * 内容板块背景：React Bits 的 <Topography /> 动态地形等高线
 * 固定在所有内容之后，顶部与底部渐隐，避免抢正文
 */
export default function TopographyLayer() {
  return (
    <div className={s.layer} aria-hidden="true">
      <Topography
        color="#4E93AB"
        lineCount={32}
        lineWidth={0.9}
        majorLines
        elevation={1.05}
        foreground={0.22}
        scale={1.9}
        detail={0.25}
        tilt={55}
        speed={0.12}
        direction="forward"
        morph={0.18}
        glow={0.22}
        depthOfField={0.3}
        fog={0.62}
        brightness={0.4}
        opacity={0.3}
        mouseInteraction
        hoverEffect="trace"
        mouseRadius={1}
        mouseStrength={0.4}
        trail={0.3}
        parallax={0.18}
        clickEffect="pulse"
        markers="none"
        glitch={0}
        intro
        lightMode={false}
        dpr={1.25}
      />
    </div>
  );
}


