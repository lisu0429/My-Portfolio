import { useRef } from 'react';
import s from './Strengths.module.css';
import SectionHead from './SectionHead/SectionHead.jsx';
import { ContourRule, Marker, Ticks } from './Survey/Survey.jsx';
import { strengths, survey } from '../data/profile.js';

export default function Strengths() {
  // 卡片不随指针移动，进入时取一次外框即可，避免每次 mousemove 强制重排
  const rectRef = useRef(null);

  const handleEnter = (event) => {
    rectRef.current = event.currentTarget.getBoundingClientRect();
  };

  const handleMove = (event) => {
    const rect = rectRef.current;
    if (!rect) return;
    event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };

  return (
    <section className="section" id="strengths" data-scene>
      <div className="shell">
        <SectionHead
          kicker="03 · STRENGTHS"
          title="个人优势"
          note="技术背景让我能听懂算法的取舍，结果导向让我把需求推到上线。这两点合起来，决定了我在 AI 产品里能走多远。"
          readout={survey.strengths}
          seed={23}
        />

        <div className={s.grid} data-anim="cards">
          {strengths.map((item, i) => (
            <article
              className={s.card}
              key={item.index}
              data-anim="card"
              onPointerEnter={handleEnter}
              onPointerMove={handleMove}
            >
              <span className={s.contourField} aria-hidden="true">
                <span className={s.contour}>
                  <ContourRule fill lines={13} amp={3} spacing={4.4} seed={31 + i * 7} />
                </span>
                <span className={s.contourHot}>
                  <ContourRule fill lines={13} amp={3} spacing={4.4} seed={31 + i * 7} />
                </span>
              </span>

              <div className={s.cardTop}>
                <span className={s.index}>
                  <Marker size={9} />
                  {item.index}
                </span>
                <Ticks className={s.cardTicks} count={12} />
              </div>

              <h3 className={s.title}>{item.title}</h3>
              <p className={s.text}>{item.text}</p>
              <ul className={s.tags}>
                {item.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}