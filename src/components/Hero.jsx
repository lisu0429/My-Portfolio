import s from './Hero.module.css';
import TechText from './TechText/TechText.jsx';
import { hero } from '../data/profile.js';

export default function Hero() {
  return (
    <section className={s.hero} id="top">
      <div className={s.media} data-anim="hero-media" aria-hidden="true">
        <video
          className={s.video}
          src="/media/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className={s.haze} />
        <span className={`${s.fog} ${s.f1}`} />
        <span className={`${s.fog} ${s.f2}`} />
        <span className={`${s.fog} ${s.f3}`} />
        <span className={`${s.fog} ${s.f4}`} />
      </div>

      <div className={`shell ${s.shell}`}>
        <div className={s.body}>
          <div className={s.labelRow}>
            {hero.labels.map((l) => (
              <span key={l.text} className={`${s.label} ${s[l.align]}`}>
                <span className={s.labelMask} data-anim="hero-label">
                  {l.text}
                </span>
              </span>
            ))}
          </div>

          <h1 className={s.name}>
            <span className={s.srOnly}>
              {hero.name} · {hero.kicker} · 打造能被信任的 AI 产品
            </span>
            <div className={s.nameStage} data-anim="hero-name" aria-hidden="true">
              <TechText
                text={hero.name}
                fontFamily="'Manrope Local', 'Manrope', 'Noto Sans SC', sans-serif"
                fontWeight={800}
                fontSize={620}
                letterSpacing={-0.04}
                align="center"
                color="#EFF6F9"
                accentColor="#A9DEE8"
                reveal="area"
                reach={260}
                softness={0.75}
                dashLength={4}
                dashGap={2}
                strokeWidth={1.4}
                specks={18}
                selection
                labels
                draggable
                bounce={0.4}
                clickKick
                intro="type"
                introDuration={0.9}
                guides={false}
                sweep
                speed={0.6}
                className={s.techText}
              />
            </div>
          </h1>

          <p className={s.lead} data-anim="hero-lead">
            {hero.lead}
          </p>

          <div className={s.ctaRow}>
            {hero.cta.map((c) => (
              <a
                key={c.label}
                href={c.href}
                className={c.primary ? s.btnPrimary : s.btnGhost}
                download={c.href.endsWith('.pdf') ? '李彬-AI产品经理简历.pdf' : undefined}
                data-anim="hero-cta"
              >
                {c.label}
                {c.primary && (
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <path
                      d="M2 8h11M9 4l4 4-4 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </a>
            ))}
          </div>
        </div>

        <div className={s.foot}>
          <dl className={s.meta}>
            {hero.meta.map((m) => (
              <div className={s.metaItem} key={m.label} data-anim="hero-meta">
                <dt>{m.label}</dt>
                <dd>
                  {m.dot && <span className={s.dot} />}
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>

          <a href="#about" className={s.scrollCue} data-anim="hero-meta">
            <span>SCROLL</span>
            <span className={s.scrollLine}>
              <span className={s.scrollDot} />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

