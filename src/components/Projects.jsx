import { useRef, useState } from 'react';
import CardSwap, { Card } from './CardSwap/CardSwap.jsx';
import SectionHead from './SectionHead/SectionHead.jsx';
import { ContourRule, Marker } from './Survey/Survey.jsx';
import s from './Projects.module.css';
import { projects, survey } from '../data/profile.js';

export default function Projects() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const api = useRef(null);
  const p = projects[active];

  const goTo = (target) => {
    const count = projects.length;
    const steps = (target - active + count) % count;
    for (let i = 0; i < steps; i++) {
      window.setTimeout(() => api.current?.next(), i * 140);
    }
  };

  return (
    <section className="section" id="work" data-scene>
      <div className="shell">
        <SectionHead
          kicker="02 · SELECTED WORK"
          title="精选项目"
          note="三个最能代表我工作方式的项目：一个独立从 0 定义的 C 端 + B 端 AI 系统，一个把模型效果量化到可对比的评测平台，以及深入业务一线后沉淀的 B 端系统改造思路。拖动卡片可切换。"
          readout={survey.work}
          seed={17}
        />

        <div className={s.stage}>
          <div className={s.swapCol}>
            <CardSwap
              ref={api}
              width={880}
              height={520}
              cardDistance={64}
              verticalDistance={54}
              depth={100}
              skewAmount={5}
              visibleCards={3}
              delay={7000}
              autoplay={auto}
              pauseOnHover
              draggable
              speed={1}
              bounce={0.3}
              parallax={0.4}
              hoverSpread={0.14}
              dim={0.55}
              cardRadius={16}
              intro
              theme="dark"
              onChange={setActive}
              onCardClick={setActive}
              className={s.swap}
            >
              {projects.map((item) => (
                <Card key={item.index}>
                  <div className={s.swapCard} data-anim="media">
                    <img
                      src={item.image}
                      alt={`${item.title} 界面示意`}
                      draggable={false}
                      data-parallax
                    />
                    <span className={s.swapScrim} aria-hidden="true" />
                    <span className={s.swapContour} aria-hidden="true">
                      <ContourRule fill lines={16} amp={2} spacing={3.4} seed={5} />
                    </span>

                    <div className={s.swapTop}>
                      <span className={s.swapIndex}>{item.index}</span>
                      <span className={s.swapKind}>{item.kind}</span>
                      <span className={s.swapPeriod}>{item.period}</span>
                    </div>

                    <div className={s.swapBottom}>
                      <h3 className={s.swapTitle}>{item.title}</h3>
                      <ul className={s.swapMetrics}>
                        {item.metrics.map((m) => (
                          <li key={m.label}>
                            <b>{m.value}</b>
                            <span>{m.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </CardSwap>

            <div className={s.controls}>
              <button
                type="button"
                className={s.arrow}
                onClick={() => api.current?.prev()}
                aria-label="上一个项目"
              >
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                  <path
                    d="M14 8H3M7 4 3 8l4 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className={s.dots}>
                {projects.map((item, i) => (
                  <button
                    key={item.index}
                    type="button"
                    className={`${s.dot} ${i === active ? s.dotOn : ''}`}
                    onClick={() => goTo(i)}
                    aria-label={`查看 ${item.title}`}
                    aria-current={i === active}
                  >
                    {item.index}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className={s.arrow}
                onClick={() => api.current?.next()}
                aria-label="下一个项目"
              >
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
              </button>
            </div>
          </div>

          <aside
            className={s.detail}
            data-anim="block"
            onMouseEnter={() => setAuto(false)}
            onMouseLeave={() => setAuto(true)}
          >
            <div className={s.detailInner} key={p.index}>
              <div className={s.detailTop}>
                <span className={s.detailIndex}>{p.index}</span>
                <span className={s.detailKind}>{p.kind}</span>
                <span className={s.detailPeriod}>{p.period}</span>
              </div>

              <ContourRule className={s.detailRule} seed={29} lines={4} spacing={13} amp={10} />

              <h3 className={s.detailTitle}>{p.title}</h3>
              <p className={s.detailSummary}>{p.summary}</p>

              <ul className={s.resp}>
                {p.responsibilities.map((r) => (
                  <li key={r.title}>
                    <span className={s.respTitle}>
                      <Marker size={8} />
                      {r.title}
                    </span>
                    <p className={s.respText}>{r.text}</p>
                  </li>
                ))}
              </ul>

              {p.repo && (
                <a
                  className={s.repo}
                  href={p.repo}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <span className={s.repoIcon}>
                    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
                      />
                    </svg>
                  </span>
                  <span className={s.repoText}>
                    <b>查看 GitHub 源码</b>
                    <span>{p.repo.replace('https://github.com/', '')}</span>
                  </span>
                  <svg className={s.repoArrow} viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                    <path
                      d="M2 8h11M9 4l4 4-4 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              )}

              <div className={s.flow}>
                <span className={s.flowLabel}>核心链路</span>
                <ol className={s.flowList}>
                  {p.flow.map((f, i) => (
                    <li key={f}>
                      <span className={s.flowStation}>
                        <Marker size={10} />
                      </span>
                      <span className={s.flowIndex}>{String(i + 1).padStart(2, '0')}</span>
                      <span className={s.flowName}>{f}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <ul className={s.tags}>
                {p.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}