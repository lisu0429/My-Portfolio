import s from './Contact.module.css';
import CurvedInput from './CurvedInput/CurvedInput.jsx';
import { ContourRule, Marker, Readout } from './Survey/Survey.jsx';
import { contact, profile, survey } from '../data/profile.js';

/** GitHub 标记：跟着弧线一起倾的前置芯片 */
function GitHubIcon() {
  return (
    <g>
      <rect x={-21} y={-17} width={42} height={34} rx={9} fill="#A9DEE8" />
      <path
        fill="#06131B"
        transform="translate(-8 -8)"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
      />
    </g>
  );
}

export default function Contact() {
  return (
    <section className={s.contact} id="contact" data-scene>
      <div className={s.glow} aria-hidden="true" />
      <span className={`${s.fog} ${s.f1}`} aria-hidden="true" />
      <span className={`${s.fog} ${s.f2}`} aria-hidden="true" />
      <div className="shell">
        <div className={s.top}>
          <span className="kicker" data-anim="head-kicker">
            {contact.kicker}
          </span>
          <h2 className={s.title}>
            {contact.title.split('\n').map((line) => (
              <span key={line} className={s.titleLineMask}>
                <span className={s.titleLine} data-anim="head-title">
                  {line}
                </span>
              </span>
            ))}
          </h2>
          <div className={s.leadCol}>
            <Readout items={survey.contact} />
            <p className={s.lead} data-anim="head-note">
              {contact.lead}
            </p>
          </div>
        </div>

        <ContourRule className={s.rule} seed={41} data-anim="head-rule" />

        <div className={s.githubWrap} data-anim="media">
          <CurvedInput
            className={s.githubBar}
            value={`github.com/${profile.github}`}
            onChange={() => {}}
            onSubmit={() => window.open(profile.githubUrl, '_blank', 'noopener,noreferrer')}
            type="text"
            name="github"
            ariaLabel={`GitHub 主页 ${profile.githubUrl}`}
            placeholder={`github.com/${profile.github}`}
            buttonText="前往"
            theme="dark"
            width="100%"
            bend={30}
            height={76}
            cornerRadius={20}
            borderWidth={1.4}
            fontSize={25}
            backgroundColor="rgba(222, 240, 249, 0.035)"
            textColor="#EDF3F7"
            placeholderColor="rgba(159, 177, 189, 0.65)"
            borderColor="rgba(169, 222, 232, 0.3)"
            buttonColor="#A9DEE8"
            buttonTextColor="#06131B"
            iconColor="#A9DEE8"
            shadowSize="md"
            shadowColor="#000000"
            showButton
            showIcon
            icon={<GitHubIcon />}
          />
          <p className={s.githubNote}>
            作品源码与实验记录都在这里，点右侧按钮直达我的 GitHub 主页。
          </p>
        </div>

        <div className={s.bottom} data-anim="block">
          <ul className={s.channels} data-anim="rows">
            {contact.channels.map((c) => (
              <li key={c.label} data-anim="row">
                <span className={s.channelLabel}>
                  <Marker size={8} />
                  {c.label}
                </span>
                {c.href ? (
                  <a className={s.channelValue} href={c.href}>
                    {c.value}
                  </a>
                ) : (
                  <span className={s.channelValue}>{c.value}</span>
                )}
              </li>
            ))}
          </ul>

          <div className={s.meta}>
            <a className={s.resume} href={profile.resume} download="李彬-AI产品经理简历.pdf">
              下载简历 PDF
            </a>
            <span className={s.copy}>© 2026 {profile.name} · {profile.role} · {profile.location}</span>
          </div>
        </div>
      </div>
    </section>
  );
}