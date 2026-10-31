import { ContourRule, Readout } from '../Survey/Survey.jsx';

/**
 * 板块抬头：编号标签 + 标题 + 图幅读数 + 说明 + 等高线分隔
 * 四个内容板块共用，保证测绘语言一致
 */
export default function SectionHead({
  kicker,
  title,
  note,
  readout = [],
  seed = 11,
  className = '',
}) {
  return (
    <div className={`sec-head ${className}`.trim()}>
      <div className="sec-head-main">
        <span className="kicker" data-anim="head-kicker">
          {kicker}
        </span>
        <div className="sec-titleMask">
          <h2 className="sec-title" data-anim="head-title">
            {title}
          </h2>
        </div>
      </div>

      <div className="sec-head-aside">
        {readout.length ? <Readout items={readout} /> : null}
        {note ? (
          <p className="sec-note" data-anim="head-note">
            {note}
          </p>
        ) : null}
      </div>

      <ContourRule className="sec-head-rule" seed={seed} data-anim="head-rule" />
    </div>
  );
}