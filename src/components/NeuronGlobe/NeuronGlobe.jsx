import { useEffect, useRef } from 'react';
import s from './NeuronGlobe.module.css';

const TAU = Math.PI * 2;

/* ------------------------------------------------------------------ *
 * 球面几何
 * ------------------------------------------------------------------ */

function mulberry32(seed) {
  let a = (seed >>> 0) || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 斐波那契球：点在球面上均匀铺开，不会像经纬网格那样堆在两极 */
function fibonacci(count) {
  const pts = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - ((i + 0.5) / count) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    pts.push([Math.cos(theta) * r, y, Math.sin(theta) * r]);
  }
  return pts;
}

const normalize3 = ([x, y, z]) => {
  const len = Math.hypot(x, y, z) || 1;
  return [x / len, y / len, z / len];
};

const lerp3 = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

/**
 * 搭一张球面网络：
 * - 全部星点先按斐波那契球均匀铺在球面上——这是"球"这个形读得出来的前提
 * - 从这批星点里均匀挑出工具枢纽，所以枢纽本来就长在球面上，不是外挂的
 * - 其余星点按 clustering 向最近的枢纽轻微聚拢，聚拢越强星群越分明
 * - 每颗星连到最近的若干邻居，再连到自己的枢纽
 * - 另外补几条横穿球体的长弦
 */
function buildNetwork(hubs, opts) {
  const rnd = mulberry32(opts.seed);
  const base = fibonacci(opts.nodes);

  const hubIndices = [];
  const stride = base.length / Math.max(1, hubs.length);
  for (let i = 0; i < hubs.length; i += 1) {
    hubIndices.push(Math.min(base.length - 1, Math.floor(i * stride + stride / 2)));
  }

  const points = base.slice();
  const owner = new Array(base.length).fill(-1);

  for (let i = 0; i < base.length; i += 1) {
    let best = 0;
    let bestD = Infinity;
    for (let k = 0; k < hubIndices.length; k += 1) {
      const hp = base[hubIndices[k]];
      const dx = hp[0] - base[i][0];
      const dy = hp[1] - base[i][1];
      const dz = hp[2] - base[i][2];
      const d = dx * dx + dy * dy + dz * dz;
      if (d < bestD) {
        bestD = d;
        best = k;
      }
    }
    owner[i] = best;
  }

  // 只让背景星轻微向枢纽靠拢：球面轮廓仍然成立
  for (let i = 0; i < points.length; i += 1) {
    const hub = base[hubIndices[owner[i]]];
    points[i] = normalize3(lerp3(base[i], hub, opts.clustering));
  }

  const reachSq = opts.reach * opts.reach;
  const links = [];
  for (let i = 0; i < points.length; i += 1) {
    const cands = [];
    for (let j = 0; j < points.length; j += 1) {
      if (i === j) continue;
      const dx = points[i][0] - points[j][0];
      const dy = points[i][1] - points[j][1];
      const dz = points[i][2] - points[j][2];
      const d = dx * dx + dy * dy + dz * dz;
      if (d <= reachSq) cands.push([d, j]);
    }
    cands.sort((a, b) => a[0] - b[0]);
    const take = Math.min(opts.connections, cands.length);
    for (let k = 0; k < take; k += 1) links.push([i, cands[k][1]]);
    links.push([i, hubIndices[owner[i]]]);
  }

  const chordPairs = [];
  for (let c = 0; c < opts.chords; c += 1) {
    const a = Math.floor(rnd() * points.length);
    const b = Math.floor(rnd() * points.length);
    if (a !== b) chordPairs.push([a, b]);
  }

  return {
    points,
    owner,
    links,
    chordPairs,
    hubPos: hubIndices.map((i) => points[i]),
    phases: points.map(() => rnd() * TAU),
  };
}

/**
 * 把标签沿圆周推开，避免互相压字。
 * 相邻标签之间的最小间距按文字宽度算，收敛后返回每个标签自己的角度。
 */
function relaxAngles(items, radius) {
  const order = items.map((_, i) => i).sort((a, b) => items[a].theta - items[b].theta);
  const th = order.map((i) => items[i].theta);
  const n = order.length;
  for (let iter = 0; iter < 24; iter += 1) {
    for (let k = 0; k < n; k += 1) {
      const kn = (k + 1) % n;
      const ax = Math.cos(th[k]) * radius;
      const ay = Math.sin(th[k]) * radius;
      const bx = Math.cos(th[kn]) * radius;
      const by = Math.sin(th[kn]) * radius;
      const d = Math.hypot(bx - ax, by - ay);
      const want = (items[order[k]].w + items[order[kn]].w) / 2 + 18;
      if (d < want && d > 0.01) {
        const push = (want - d) / 2 / radius;
        th[k] -= push;
        th[kn] += push;
      }
    }
  }
  const out = new Array(items.length);
  order.forEach((idx, k) => {
    out[idx] = th[k];
  });
  return out;
}

/* ------------------------------------------------------------------ *
 * 组件
 * ------------------------------------------------------------------ */

/**
 * 多球体网络：按能力簇分成若干个球，每个球**各转各的**——
 * 倾角、速度、方向、初始相位都不同，一眼能看出它们彼此独立。
 * 每个球体都能被单独拖拽，悬停出引线标注，点击展开全部名字。
 */
export default function NeuronGlobe({
  hubs = [],
  colors = ['#4E93AB', '#D8F2F8'],
  backgroundColor = 'transparent',
  nodesPerSphere = 170,
  connections = 3,
  reach = 0.2,
  clustering = 0.3,
  chords = 12,
  radius = 0.4,
  originY = 0.5,
  lineOpacity = 0.5,
  nodeSize = 0.8,
  depthFade = 0.55,
  spin = 1,
  interactive = true,
  draggable = true,
  groupBy = 'group',
  hoverRadius = 0.28,
  clickPulse = true,
  pulseSpeed = 1.2,
  seed = 7,
  paused = false,
  dpr = 2,
  onHover = null,
  onExpand = null,
  className = '',
  style,
  children,
}) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const netRef = useRef([]);
  const hoverRef = useRef(-1);
  const hoverSphereRef = useRef(-1);
  const expandedRef = useRef([]);
  const onExpandRef = useRef(onExpand);
  onExpandRef.current = onExpand;
  // 渲染 effect 只跑一次，里面闭包拿到的 hubs 必须是当前值
  const hubsRef = useRef(hubs);
  hubsRef.current = hubs;

  const settingsRef = useRef({});
  settingsRef.current = {
    colors,
    backgroundColor,
    lineOpacity,
    nodeSize,
    depthFade,
    spin,
    interactive,
    draggable,
    hoverRadius,
    clickPulse,
    pulseSpeed,
    paused,
    dpr,
    radius,
    originY,
  };

  // 球体划分：groupBy='group' 按能力簇分球，'all' 把所有工具聚成一个球
  const hubKey = `${groupBy}|${hubs.map((h) => h.name).join('|')}`;
  useEffect(() => {
    const byGroup = new Map();
    for (const hub of hubsRef.current) {
      const key = groupBy === 'all' ? '_' : hub.group || '_';
      if (!byGroup.has(key)) byGroup.set(key, []);
      byGroup.get(key).push(hub);
    }
    const list = [...byGroup.values()];
    netRef.current = list.map((groupHubs, i) => ({
      hubs: groupHubs,
      net: buildNetwork(groupHubs, {
        seed: seed + i * 17,
        nodes: nodesPerSphere,
        connections,
        reach,
        clustering,
        chords,
      }),
      // 每个球各转各的：倾角 / 速度 / 方向 / 初始相位都不同
      tilt: 12 + ((i * 23) % 27),
      speed: 0.68 + ((i * 7) % 5) * 0.17,
      dir: i % 2 === 0 ? 1 : -1,
      phase: i * 1.37,
    }));
  }, [hubKey, seed, nodesPerSphere, connections, reach, clustering, chords]);

  // 渲染循环
  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!root || !canvas || !ctx) return undefined;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const hubColor = new Map(hubsRef.current.map((h) => [h.name, h.color || '#D8F2F8']));

    let w = 0;
    let h = 0;
    let ratio = 1;
    let visible = true;
    let raf = 0;
    let last = performance.now();
    let expandArr = [];
    let labelAngles = [];
    let spin = [];
    const pulses = [];

    // 预渲染一枚柔光精灵，星点与枢纽都靠它出光晕，避免每帧建渐变
    const sprite = document.createElement('canvas');
    const S = 64;
    sprite.width = S;
    sprite.height = S;
    const sctx = sprite.getContext('2d');
    const grad = sctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.28)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, S, S);

    const resize = () => {
      const cfg = settingsRef.current;
      ratio = Math.min(window.devicePixelRatio || 1, cfg.dpr);
      w = root.clientWidth;
      h = root.clientHeight;
      canvas.width = Math.max(1, Math.round(w * ratio));
      canvas.height = Math.max(1, Math.round(h * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(root);
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
    });
    io.observe(root);

    const local = (event) => {
      const rect = root.getBoundingClientRect();
      return [event.clientX - rect.left, event.clientY - rect.top];
    };

    /**
     * 每个球在版心里的位置与半径。
     * 两端要留出引线环 + 文字的宽度，否则最外侧的标签会被画布切掉；
     * 留白按"环半径 + 文字宽度"算，球体大小由剩下的空间反推。
     */
    const layout = () => {
      const cfg = settingsRef.current;
      const n = netRef.current.length || 1;
      // 窄屏画布窄，引线环与文字预留必须收窄，否则球被挤成一小团
      const compact = w < 640;
      const ring = compact ? 16 : 44;
      const textW = compact ? 54 : 78;
      const gap = compact ? 14 : 26;
      // 12R + 2*(ring + textW) + (n-1)*gap = w  ->  解出球半径
      const R = Math.max(
        40,
        Math.min((w - 2 * (ring + textW) - (n - 1) * gap) / (2 * n), h * 0.36),
      );
      const pad = R + ring + textW;
      const step = 2 * R + gap;
      const total = 2 * R * n + (n - 1) * gap;
      const start = (w - total) / 2 + R;
      return {
        R,
        cx: (i) => start + i * step,
        cy: h * cfg.originY,
        labelR: R + ring,
      };
    };

    /** 把屏幕坐标反投影回某个球的球面方向，用于点击脉冲 */
    const unproject = (px, py, R, cx, cy, tiltRad, ang) => {
      const dx = (px - cx) / R;
      const dy = (cy - py) / R;
      const sq = dx * dx + dy * dy;
      if (sq > 1) return null;
      const dz = Math.sqrt(1 - sq);
      const ct = Math.cos(tiltRad);
      const st = Math.sin(tiltRad);
      const y = dy * ct + dz * st;
      const z = -dy * st + dz * ct;
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      return normalize3([dx * ca - z * sa, y, dx * sa + z * ca]);
    };

    const draw = (now) => {
      const cfg = settingsRef.current;
      const spheres = netRef.current;
      if (!spheres.length || !visible) return;

      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const time = now / 1000;

      const L = layout();
      const compact = w < 640;

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (cfg.backgroundColor !== 'transparent') {
        ctx.fillStyle = cfg.backgroundColor;
        ctx.fillRect(0, 0, w, h);
      }

      const netColor = cfg.colors[0];
      const hiColor = cfg.colors[1];
      const base = reduce ? 0 : (cfg.spin * TAU) / 60;

      // 每个球自己的自转状态
      if (spin.length !== spheres.length) {
        spin = spheres.map((sp, i) => ({
          angle: sp.phase,
          tilt: sp.tilt,
          velY: 0,
          velX: 0,
          dragging: false,
          moved: 0,
          lastX: 0,
          lastY: 0,
        }));
      }
      for (let i = 0; i < spheres.length; i += 1) {
        const st = spin[i];
        const sp = spheres[i];
        if (!st.dragging) {
          // 基础自转 + 鼠标给的角速度；俯仰拧过头会慢慢回正
          st.angle += (base * sp.speed * sp.dir + st.velY) * dt;
          st.tilt += st.velX * dt;
          st.velY *= Math.exp(-dt / 0.7);
          st.velX *= Math.exp(-dt / 0.7);
          if (Math.abs(st.velY) < 0.001) st.velY = 0;
          if (Math.abs(st.velX) < 0.001) st.velX = 0;
          st.tilt += (sp.tilt - st.tilt) * (1 - Math.exp(-dt / 1.1));
        }
      }

      const hoverHub = hoverRef.current;
      const hoverSphere = hoverSphereRef.current;
      if (expandedRef.current.length !== spheres.length) {
        expandedRef.current = new Array(spheres.length).fill(false);
        expandArr = new Array(spheres.length).fill(0);
      }
      const anyExpanded = expandedRef.current.some(Boolean);

      for (let si = 0; si < spheres.length; si += 1) {
        const sp = spheres[si];
        const net = sp.net;
        const st = spin[si];
        const cx = L.cx(si);
        const cy = L.cy;
        const R = L.R;
        const ang = st.angle;
        const tiltRad = (st.tilt * Math.PI) / 180;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        const ct = Math.cos(tiltRad);
        const stt = Math.sin(tiltRad);

        // 投影：先绕 Y 自转，再绕 X 前倾
        const n = net.points.length;
        const px = new Float32Array(n);
        const py = new Float32Array(n);
        const pz = new Float32Array(n);
        for (let i = 0; i < n; i += 1) {
          const p = net.points[i];
          const x = p[0] * ca + p[2] * sa;
          const z = -p[0] * sa + p[2] * ca;
          const y2 = p[1] * ct - z * stt;
          const z2 = p[1] * stt + z * ct;
          px[i] = cx + x * R;
          py[i] = cy - y2 * R;
          pz[i] = z2;
        }

        const thisHover = hoverSphere === si ? hoverHub : -1;

        // 每个球各自有展开进度；任何一个球展开时，其它球压暗做聚焦
        const wantExp = expandedRef.current[si] ? 1 : 0;
        const cur = expandArr[si] ?? 0;
        expandArr[si] = cur + (wantExp - cur) * (1 - Math.exp(-dt / 0.28));
        const exp = expandArr[si];
        const dim = anyExpanded && exp <= 0.02 ? 0.5 : 1;

        // 连线：按 alpha 分桶批量描边。
        // 逐条 stroke() 在几千条线时会成为主要瓶颈——每条都是一次独立光栅化。
        const BUCKETS = 6;
        const step = cfg.lineOpacity / BUCKETS;
        const buckets = Array.from({ length: BUCKETS }, () => []);
        const hotLinks = [];

        for (const [i, j] of net.links) {
          const depth = (pz[i] + pz[j]) / 2;
          const f = 0.5 + 0.5 * depth;
          const alpha = cfg.lineOpacity * (1 - cfg.depthFade * (1 - f)) * dim;
          if (alpha <= 0.012) continue;
          if (thisHover >= 0 && (net.owner[i] === thisHover || net.owner[j] === thisHover)) {
            hotLinks.push(i, j);
            continue;
          }
          const b = Math.min(BUCKETS - 1, Math.max(0, Math.floor(alpha / step)));
          buckets[b].push(i, j);
        }

        ctx.lineCap = 'round';
        ctx.strokeStyle = netColor;
        ctx.lineWidth = 0.6;
        for (let b = 0; b < BUCKETS; b += 1) {
          const list = buckets[b];
          if (!list.length) continue;
          ctx.globalAlpha = (b + 0.5) * step;
          ctx.beginPath();
          for (let k = 0; k < list.length; k += 2) {
            ctx.moveTo(px[list[k]], py[list[k]]);
            ctx.lineTo(px[list[k + 1]], py[list[k + 1]]);
          }
          ctx.stroke();
        }

        // 长弦
        ctx.strokeStyle = netColor;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        let chordAny = false;
        for (const [i, j] of net.chordPairs) {
          const depth = (pz[i] + pz[j]) / 2;
          const f = 0.5 + 0.5 * depth;
          const alpha = cfg.lineOpacity * 0.32 * (1 - cfg.depthFade * (1 - f));
          if (alpha <= 0.012) continue;
          ctx.moveTo(px[i], py[i]);
          ctx.lineTo(px[j], py[j]);
          chordAny = true;
        }
        if (chordAny) {
          ctx.globalAlpha = cfg.lineOpacity * 0.16;
          ctx.stroke();
        }

        // 悬停簇的高亮线。别调太亮：簇内连线密集，稍高就会糊成一团白。
        if (hotLinks.length) {
          ctx.strokeStyle = hiColor;
          ctx.lineWidth = 0.9;
          ctx.globalAlpha = Math.min(1, cfg.lineOpacity * 1.5);
          ctx.beginPath();
          for (let k = 0; k < hotLinks.length; k += 2) {
            ctx.moveTo(px[hotLinks[k]], py[hotLinks[k]]);
            ctx.lineTo(px[hotLinks[k + 1]], py[hotLinks[k + 1]]);
          }
          ctx.stroke();
        }

        // 背景星点：分桶批量填圆点，再只给最亮的一批叠光晕。
        const NB = 4;
        const nBuckets = Array.from({ length: NB }, () => []);
        const bloom = [];
        for (let i = 0; i < n; i += 1) {
          const f = 0.5 + 0.5 * pz[i];
          // 降级动效时冻结闪烁，否则画面每帧仍在变，等于没降级
          const twinkle = reduce ? 0.85 : 0.7 + 0.3 * Math.sin(time * 1.7 + net.phases[i]);
          const hot = thisHover >= 0 && net.owner[i] === thisHover;
          const r = cfg.nodeSize * (0.5 + 0.75 * f) * (hot ? 1.35 : 1);
          const alpha = (1 - cfg.depthFade * (1 - f)) * twinkle * (hot ? 1.2 : 1) * dim;
          if (alpha <= 0.02) continue;
          const a = Math.min(1, alpha);
          const b = Math.min(NB - 1, Math.floor(a * NB));
          nBuckets[b].push(i, r);
          if (a > 0.62 || hot) bloom.push(i, r * 3.2, a);
        }

        ctx.fillStyle = hiColor;
        for (let b = 0; b < NB; b += 1) {
          const list = nBuckets[b];
          if (!list.length) continue;
          ctx.globalAlpha = (b + 0.5) / NB;
          ctx.beginPath();
          for (let k = 0; k < list.length; k += 2) {
            const i = list[k];
            ctx.moveTo(px[i] + list[k + 1], py[i]);
            ctx.arc(px[i], py[i], list[k + 1], 0, TAU);
          }
          ctx.fill();
        }

        ctx.globalCompositeOperation = 'lighter';
        for (let k = 0; k < bloom.length; k += 3) {
          const i = bloom[k];
          const size = bloom[k + 1];
          ctx.globalAlpha = Math.min(1, bloom[k + 2]);
          ctx.drawImage(sprite, px[i] - size, py[i] - size, size * 2, size * 2);
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;

        // ---- 枢纽：位置 / 朝向 / 名字宽度 ----
        const hubsInfo = [];
        for (let hi = 0; hi < sp.hubs.length; hi += 1) {
          const hub = sp.hubs[hi];
          const p = net.hubPos[hi];
          const x = p[0] * ca + p[2] * sa;
          const z = -p[0] * sa + p[2] * ca;
          const y2 = p[1] * ct - z * stt;
          const z2 = p[1] * stt + z * ct;
          hubsInfo.push({
            hi,
            hub,
            hx: cx + x * R,
            hy: cy - y2 * R,
            z2,
            theta: Math.atan2(-y2, x),
            color: hubColor.get(hub.name) || hiColor,
            w: 0,
          });
        }
        ctx.font = '500 11px "JetBrains Mono", ui-monospace, monospace';
        ctx.textBaseline = 'middle';
        for (const it of hubsInfo) it.w = ctx.measureText(it.hub.name).width;

        // 枢纽光点
        for (const it of hubsInfo) {
          const f = 0.5 + 0.5 * it.z2;
          const isHot = it.hi === thisHover;
          const size = (6 + 8 * f) * (isHot ? 1.8 : 1);
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = Math.min(1, (0.5 + 0.5 * f) * dim);
          ctx.drawImage(sprite, it.hx - size, it.hy - size, size * 2, size * 2);
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = 1;
        }

        /**
         * 引线式标注：从枢纽拉一条线出去，名字落在线的末端。
         * 暗色四向描边代替 shadowBlur —— shadowBlur 每帧每条文字都要单独做一次
         * 模糊光栅化，是最典型的掉帧来源；四向偏移描边便宜得多，效果几乎一样。
         */
        const drawCallout = (it, theta, alpha, strong, anchorR) => {
          const ux = Math.cos(theta);
          const uy = Math.sin(theta);
          const ax = cx + ux * anchorR;
          const ay = cy + uy * anchorR;

          ctx.strokeStyle = it.color;
          ctx.globalAlpha = alpha * 0.55;
          ctx.lineWidth = strong ? 1.2 : 0.75;
          ctx.beginPath();
          ctx.moveTo(it.hx, it.hy);
          ctx.lineTo(ax, ay);
          ctx.stroke();

          let tx;
          let ty;
          let align;
          if (ux > 0.32) {
            align = 'left';
            tx = ax + 9;
            ty = ay;
          } else if (ux < -0.32) {
            align = 'right';
            tx = ax - 9;
            ty = ay;
          } else {
            align = 'center';
            tx = ax;
            ty = ay + (uy > 0 ? 16 : -16);
          }
          ctx.textAlign = align;
          ctx.globalAlpha = alpha * 0.85;
          ctx.fillStyle = 'rgba(4, 7, 11, 0.92)';
          ctx.fillText(it.hub.name, tx, ty - 1);
          ctx.fillText(it.hub.name, tx, ty + 1);
          ctx.fillText(it.hub.name, tx - 1, ty);
          ctx.fillText(it.hub.name, tx + 1, ty);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = strong ? '#FFFFFF' : it.color;
          ctx.fillText(it.hub.name, tx, ty);
          ctx.globalAlpha = 1;
        };

        if (exp > 0.02) {
          // 展开态：该球上所有工具各拉一条引线到外圈，名字沿圆周排开
          const key = si;
          if (!labelAngles[key] || labelAngles[key].length !== hubsInfo.length) {
            labelAngles[key] = hubsInfo.map((it) => it.theta);
          }
          const targets = relaxAngles(hubsInfo, L.labelR);
          for (let i = 0; i < hubsInfo.length; i += 1) {
            let d = targets[i] - labelAngles[key][i];
            while (d > Math.PI) d -= TAU;
            while (d < -Math.PI) d += TAU;
            // 平滑跟随，否则每帧重排会让标签抖动
            labelAngles[key][i] += d * 0.16;
            const it = hubsInfo[i];
            const fade = Math.max(0.46, Math.min(1, (it.z2 + 0.34) / 0.6));
            drawCallout(it, labelAngles[key][i], fade * exp, it.hi === thisHover, L.labelR);
          }
        } else {
          // 常态：名字贴着星点，只在正面且不压字时才画
          const placed = [];
          const order = hubsInfo.map((_, i) => i).sort((a, b) => hubsInfo[b].z2 - hubsInfo[a].z2);
          for (const i of order) {
            if (compact) break;
            const it = hubsInfo[i];
            if (it.hi === thisHover) continue;
            const fade = Math.max(0, Math.min(1, (it.z2 + 0.12) / 0.42));
            if (fade <= 0.05) continue;
            const right = it.hx > cx;
            const tx = right ? it.hx - 11 : it.hx + 11;
            const rect = { x: right ? tx - it.w : tx, y: it.hy - 8, w: it.w + 4, h: 16 };
            const clash = placed.some(
              (r) => !(rect.x + rect.w < r.x || r.x + r.w < rect.x || rect.y + rect.h < r.y || r.y + r.h < rect.y),
            );
            if (clash) continue;
            placed.push(rect);
            ctx.textAlign = right ? 'right' : 'left';
            ctx.globalAlpha = fade * 0.8;
            ctx.fillStyle = 'rgba(4, 7, 11, 0.92)';
            ctx.fillText(it.hub.name, tx, it.hy - 1);
            ctx.fillText(it.hub.name, tx, it.hy + 1);
            ctx.fillText(it.hub.name, tx - 1, it.hy);
            ctx.fillText(it.hub.name, tx + 1, it.hy);
            ctx.globalAlpha = fade * 0.88;
            ctx.fillStyle = it.color;
            ctx.fillText(it.hub.name, tx, it.hy);
            ctx.globalAlpha = 1;
          }
          // 悬停的枢纽由引线接管：线从星点拉出去，名字落在末端
          if (thisHover >= 0 && hubsInfo[thisHover]) {
            const it = hubsInfo[thisHover];
            const own = Math.hypot(it.hx - cx, it.hy - cy);
            drawCallout(it, it.theta, 1, true, own + 46);
          }
        }
      }

      // 点击脉冲
      ctx.globalCompositeOperation = 'lighter';
      for (const p of pulses) {
        for (let si = 0; si < spheres.length; si += 1) {
          if (p.sphere !== undefined && p.sphere !== si) continue;
          const net = spheres[si].net;
          const st = spin[si];
          const cx = L.cx(si);
          const R = L.R;
          const tiltRad = (spin[si].tilt * Math.PI) / 180;
          const ca = Math.cos(st.angle);
          const sa = Math.sin(st.angle);
          const ct = Math.cos(tiltRad);
          const stt = Math.sin(tiltRad);
          for (let i = 0; i < net.points.length; i += 1) {
            const pt = net.points[i];
            const dot = pt[0] * p.dir[0] + pt[1] * p.dir[1] + pt[2] * p.dir[2];
            const ang = Math.acos(Math.max(-1, Math.min(1, dot)));
            if (ang > p.age) continue;
            const fade = (1 - ang / p.age) ** 2;
            const x = pt[0] * ca + pt[2] * sa;
            const z = -pt[0] * sa + pt[2] * ca;
            const y2 = pt[1] * ct - z * stt;
            const sx = cx + x * R;
            const sy = L.cy - y2 * R;
            const size = 3 + 6 * fade;
            ctx.globalAlpha = fade * 0.9;
            ctx.drawImage(sprite, sx - size, sy - size, size * 2, size * 2);
          }
        }
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    };

    // 只跑一个循环。draw 内部绝不能再排下一帧，
    // 否则 loop 与 draw 各排一次，回调数每帧翻倍、指数增长。
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      // 离屏时整帧跳过，别做无谓的重绘
      if (!visible) {
        last = now;
        return;
      }
      draw(now);
    };
    raf = requestAnimationFrame(loop);

    /* ---- 指针交互 ---- */
    /** 找到指针落在哪个球上，以及该球里最近的那个枢纽 */
    const pick = (mx, my) => {
      const cfg = settingsRef.current;
      const spheres = netRef.current;
      const L = layout();
      let bestSphere = -1;
      let bestHub = -1;
      let bestD = Infinity;
      for (let si = 0; si < spheres.length; si += 1) {
        const sp = spheres[si];
        const st = spin[si];
        const cx = L.cx(si);
        const ca = Math.cos(st.angle);
        const sa = Math.sin(st.angle);
        const tiltRad = (st.tilt * Math.PI) / 180;
        const ct = Math.cos(tiltRad);
        const stt = Math.sin(tiltRad);
        const limit = L.R * cfg.hoverRadius;
        for (let hi = 0; hi < sp.net.hubPos.length; hi += 1) {
          const p = sp.net.hubPos[hi];
          const x = p[0] * ca + p[2] * sa;
          const z = -p[0] * sa + p[2] * ca;
          const y2 = p[1] * ct - z * stt;
          const z2 = p[1] * stt + z * ct;
          if (z2 < -0.2) continue;
          const hx = cx + x * L.R;
          const hy = L.cy - y2 * L.R;
          const d = Math.hypot(mx - hx, my - hy);
          if (d < bestD && d < limit) {
            bestD = d;
            bestHub = hi;
            bestSphere = si;
          }
        }
      }
      return { sphere: bestSphere, hub: bestHub };
    };

    const onMove = (event) => {
      if (!settingsRef.current.interactive) return;
      const [mx, my] = local(event);
      const hit = pick(mx, my);
      if (hit.hub !== hoverRef.current || hit.sphere !== hoverSphereRef.current) {
        hoverRef.current = hit.hub;
        hoverSphereRef.current = hit.sphere;
        const hs = hit.sphere >= 0 ? netRef.current[hit.sphere]?.hubs ?? [] : [];
        onHover?.(hit.hub >= 0 ? hs[hit.hub] : null);
      }
    };


    const onLeave = () => {
      if (hoverRef.current !== -1 || hoverSphereRef.current !== -1) {
        hoverRef.current = -1;
        hoverSphereRef.current = -1;
        onHover?.(null);
      }
      spin.forEach((st) => {
        st.dragging = false;
      });
    };

    const onDown = (event) => {
      if (!settingsRef.current.interactive) return;
      const [mx, my] = local(event);
      // 落在哪个球上就拖哪个球
      const spheres = netRef.current;
      const L = layout();
      let target = -1;
      for (let si = 0; si < spheres.length; si += 1) {
        const dx = mx - L.cx(si);
        const dy = my - L.cy;
        if (Math.hypot(dx, dy) <= L.R * 1.15) {
          target = si;
          break;
        }
      }
      if (target < 0) return;
      const st = spin[target];
      if (!st) return;
      st.dragging = true;
      st.moved = 0;
      st.lastX = event.clientX;
      st.lastY = event.clientY;
      root.setPointerCapture?.(event.pointerId);
    };

    const onUp = (event) => {
      const cfg = settingsRef.current;
      const spheres = netRef.current;
      let dragged = false;
      let hitSphere = -1;
      for (let si = 0; si < spheres.length; si += 1) {
        const st = spin[si];
        if (st.dragging) {
          dragged = true;
          hitSphere = si;
          st.dragging = false;
        }
      }
      root.releasePointerCapture?.(event.pointerId);
      if (!dragged) return;
      const st = spin[hitSphere];
      if (st.moved > 6) return;

      const [mx, my] = local(event);
      const L = layout();
      const sp = spheres[hitSphere];
      const dir = unproject(
        mx,
        my,
        L.R,
        L.cx(hitSphere),
        L.cy,
        (spin[hitSphere].tilt * Math.PI) / 180,
        spin[hitSphere].angle,
      );
      if (!dir) return;
      // 点在球上：切换该球的工具名展开（可叠加多个球）
      const list = expandedRef.current;
      list[hitSphere] = !list[hitSphere];
      onExpandRef.current?.(list.filter(Boolean).length);
      if (cfg.clickPulse) pulses.push({ dir, age: 0, sphere: hitSphere });
    };

    const onDrag = (event) => {
      if (!settingsRef.current.draggable) return;
      for (let si = 0; si < spin.length; si += 1) {
        const st = spin[si];
        if (!st.dragging) continue;
        const dx = event.clientX - st.lastX;
        const dy = event.clientY - st.lastY;
        st.lastX = event.clientX;
        st.lastY = event.clientY;
        st.moved += Math.hypot(dx, dy);
        // 横向拖 -> 绕 Y 轴自转；纵向拖 -> 拧俯仰。拖得越快，转得越快。
        const stepY = dx * 0.006;
        const stepX = -dy * 0.05;
        st.angle += stepY;
        st.tilt = Math.max(-68, Math.min(68, st.tilt + stepX));
        st.velY = stepY * 12;
        st.velX = stepX * 12;
      }
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointermove', onDrag);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointerup', onUp);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointermove', onDrag);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <div ref={rootRef} className={`${s.root} ${className}`.trim()} style={style}>
      <canvas ref={canvasRef} className={s.canvas} data-globe-canvas aria-hidden="true" />
      {children}
    </div>
  );
}