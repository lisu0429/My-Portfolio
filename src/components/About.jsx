import { lazy, Suspense, useMemo, useState } from 'react';
import s from './About.module.css';
import headshot from '../assets/headshot.webp';
import SectionHead from './SectionHead/SectionHead.jsx';
import StarBorder from './StarBorder/StarBorder.jsx';
import NeuronGlobe from './NeuronGlobe/NeuronGlobe.jsx';

import { Marker, Ticks } from './Survey/Survey.jsx';
import { about, stats, timeline, tools, toolGroups, profile, survey } from '../data/profile.js';

/** three.js 体积大，拆成异步 chunk，别拖慢首屏 */
const Lanyard = lazy(() => import('./Lanyard/Lanyard.jsx'));

/** 四个数据格的星头各跑各的节拍，避免四个动画同步显得机械 */
const STAR_DURATION = [6, 6.5, 7, 7.5];

export default function About() {
  const [hovered, setHovered] = useState(null);
  const [expandedCount, setExpandedCount] = useState(0);

  // 工具 → 球面上的枢纽星点，颜色跟所属能力簇
  const hubs = useMemo(
    () =>
      tools.map((t) => ({
        name: t.name,
        group: t.group,
        color: toolGroups.find((g) => g.id === t.group)?.color,
      })),
    [],
  );
  return (
    <section className="section" id="about" data-scene>
      <div className="shell">
        <SectionHead
          kicker={about.kicker}
          title={about.title}
          note={about.note}
          readout={survey.about}
          seed={11}
        />

        <div className={s.grid}>
          <figure className={s.portrait} data-anim="media">
            <span className={s.sideLabel}>PROFILE / 2026</span>
            <div className={s.frame}>
              <span className={`${s.corner} ${s.cornerTl}`} />
              <span className={`${s.corner} ${s.cornerTr}`} />
              <span className={`${s.corner} ${s.cornerBl}`} />
              <span className={`${s.corner} ${s.cornerBr}`} />
              <div className={s.lanyardStage}>
                <Suspense fallback={<span className={s.lanyardFallback} />}>
                  <Lanyard
                    frontImage={headshot}
                    backImage="/media/id-card-back.jpg"
                    imageFit="cover"
                    cardColor="#ffffff"
                    cornerRadius={0.14}
                    size={0.9}
                    strapLength={0.26}
                    strapColor="#141d26"
                    strapWidth={0.8}
                    metal="silver"
                    className={s.lanyard}
                  />
                </Suspense>
              </div>
            </div>
            <figcaption className={s.caption}>
              <strong>{profile.name}</strong>
              <span>
                {profile.school} · {profile.major} · {profile.degree}
              </span>
              <span className={s.coord}>22.5431°N 114.0579°E · WGS 84</span>
            </figcaption>
          </figure>

          <div className={s.body}>
            <div className={s.paras} data-anim="block">
              {about.paragraphs.map((p) => (
                <p key={p} className={s.para}>
                  {p}
                </p>
              ))}
            </div>

            <dl className={s.contacts} data-anim="rows">
              {about.contacts.map((c) => (
                <div className={s.contactRow} key={c.label} data-anim="row">
                  <dt>
                    <Marker size={8} />
                    {c.label}
                  </dt>
                  <dd>
                    {c.href ? (
                      <a href={c.href}>
                        {c.value}
                        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                          <path
                            d="M3 13 13 3M6 3h7v7"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="square"
                          />
                        </svg>
                      </a>
                    ) : (
                      c.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className={s.stats} data-anim="cards">
          {stats.map((st, i) => (
            <StarBorder
              as="div"
              key={st.label}
              className={s.stat}
              color="#D8F2F8"
              trailColor="#4E93AB"
              duration={STAR_DURATION[i % STAR_DURATION.length]}
              thickness={1}
              radius={10}
              glow={0.55}
              stars={1}
              trailLength={0.26}
              hover="lap"
              clickPulse
              sparkle
              theme="dark"
              backgroundColor="transparent"
              borderColor="rgba(220, 238, 248, 0.18)"
              textColor="var(--text)"
              data-anim="card"
            >
              <span className={s.statValue}>{st.value}</span>
              <span className={s.statLabel}>{st.label}</span>
              <Ticks
                className={s.statTicks}
                count={12}
                level={st.level}
                label={`${st.label}：共 12 格，已点亮 ${st.level} 格`}
              />
              <span className={s.statNote}>{st.note}</span>
            </StarBorder>
          ))}
        </div>

        <div className={s.timeline}>
          <h3 className={s.subTitle} data-anim="block">
            经历时间线
          </h3>
          <div className={s.transect} data-anim="rows">
            {timeline.map((t, i) => (
              <div
                className={s.tlRow}
                key={t.period}
                data-anim="row"
              >
                <span className={s.tlStation}>
                  <Marker size={12} blink={i === 0} />
                </span>
                <span className={s.tlPeriod}>{t.period}</span>
                <div className={s.tlMain}>
                  <strong>{t.org}</strong>
                  <span className={s.tlRole}>{t.role}</span>
                </div>
                <p className={s.tlDetail}>{t.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={s.tools} data-anim="block">
          <div className={s.toolsHead}>
            <span className={s.toolsLabel}>
              <Marker size={9} />
              工具链与工作方式
            </span>
            <p className={s.toolsNote}>
              {tools.length} 个工具聚成一个大球体，按能力分 {toolGroups.length} 色。
              按住球体左右拖可以加快或反转自转，上下拖可以拧动俯角，松手后惯性衰减；指针靠近星点会拉出一条引线并报出名字，点击球体则展开这批工具。
            </p>
          </div>

          <div className={s.globeFrame}>
            <NeuronGlobe
              hubs={hubs}
              groupBy="all"
              colors={['#3F7E93', '#D8F2F8']}
              backgroundColor="transparent"
              nodesPerSphere={240}
              connections={3}
              reach={0.28}
              clustering={0.16}
              chords={12}
              radius={0.4}
              originY={0.5}
              lineOpacity={0.5}
              nodeSize={0.8}
              depthFade={0.55}
              spin={1}
              interactive
              draggable
              hoverRadius={0.5}
              clickPulse
              pulseSpeed={1.3}
              seed={11}
              paused={false}
              dpr={2}
              onHover={setHovered}
              onExpand={setExpandedCount}
              className={s.globe}
            >
              <div className={s.globeHud}>
                <span className={s.hudLabel}>
                  {hovered
                    ? hovered.group.toUpperCase()
                    : expandedCount
                      ? `EXPANDED ×${expandedCount}`
                      : `TOOLS ${tools.length}`}
                </span>
                <span className={s.hudValue}>
                  {hovered
                    ? hovered.name
                    : expandedCount
                      ? '再点球体可叠加展开'
                      : '悬停看名字 · 点击球体展开'}
                </span>
              </div>
            </NeuronGlobe>
          </div>

          <ul className={s.legend}>
            {toolGroups.map((g) => (
              <li key={g.id} className={s.legendItem}>
                <span className={s.legendDot} style={{ '--dot': g.color }} />
                {g.label}
                <span className={s.legendCount}>
                  {tools.filter((t) => t.group === g.id).length}
                </span>
              </li>
            ))}
          </ul>

          <ul className="srOnly">
            {tools.map((t) => (
              <li key={t.name}>
                {t.name}（{toolGroups.find((g) => g.id === t.group)?.label}）
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
