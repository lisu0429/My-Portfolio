// 生成 Hero 视频背景：浏览器渲染「数据晶格场」动画 -> webm -> ffmpeg 转 mp4
// 用法: node scripts/gen-hero-video.mjs
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/');
const { chromium } = require('playwright');
import fs from 'node:fs';

const W = 1920, H = 1080, DURATION = 16, FPS = 30;
const OUT = process.argv[2] || 'public/media/hero-loop.webm';

const page_html = `<!doctype html><html><body style="margin:0;background:#07090C;overflow:hidden">
<canvas id="c" width="${W}" height="${H}"></canvas>
<script>
const c = document.getElementById('c'), x = c.getContext('2d');
const W=${W}, H=${H}, DURATION=${DURATION};
let seed=20261029;
const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const N=190;
const nodes=[];
for(let i=0;i<N;i++){
  const u=rnd()*2-1, v=rnd()*2-1, w=rnd()*2-1;
  const L=Math.hypot(u,v,w)||1;
  nodes.push({u:u/L,v:v/L,w:w/L,r:0.25+rnd()*1.85,phase:rnd()*Math.PI*2,
    brass:rnd()<0.18,size:0.7+rnd()*1.9});
}
const f=2.4;
function draw(t){
  const p=t/DURATION*Math.PI*2;
  x.fillStyle='#07090C'; x.fillRect(0,0,W,H);
  const g=x.createRadialGradient(W*0.70,H*0.32,0,W*0.70,H*0.32,W*0.66);
  g.addColorStop(0,'rgba(60,46,24,0.34)');
  g.addColorStop(0.42,'rgba(22,30,42,0.18)');
  g.addColorStop(1,'rgba(7,9,12,0)');
  x.fillStyle=g; x.fillRect(0,0,W,H);
  const proj=[];
  for(const n of nodes){
    const cs=Math.cos(p), sn=Math.sin(p);
    const X=n.u*cs-n.w*sn, Z=n.u*sn+n.w*cs;
    const Y=n.v+0.06*Math.sin(p*2+n.phase);
    const depth=Z*n.r+1.7;
    const s=f/(f+depth);
    proj.push({px:W*0.5+X*n.r*W*0.5*s, py:H*0.52-Y*n.r*H*0.5*s, s,
      brass:n.brass, size:n.size});
  }
  x.lineWidth=1;
  for(let i=0;i<proj.length;i++){
    for(let j=i+1;j<proj.length;j++){
      const a=proj[i],b=proj[j];
      const d=Math.hypot(a.px-b.px,a.py-b.py);
      if(d<175){
        const al=(1-d/175)*0.17*Math.min(a.s,b.s)*1.25;
        if(al<=0.004) continue;
        x.strokeStyle=(a.brass&&b.brass)?'rgba(201,151,79,'+al.toFixed(3)+')':'rgba(168,194,220,'+al.toFixed(3)+')';
        x.beginPath();x.moveTo(a.px,a.py);x.lineTo(b.px,b.py);x.stroke();
      }
    }
  }
  for(const n of proj){
    const r=n.size*Math.max(0.5,n.s*1.6);
    const a=Math.max(0,Math.min(1,(n.s-0.25)*2.2))*0.78;
    if(a<=0.01) continue;
    const col=n.brass?'201,151,79':'214,226,240';
    x.fillStyle='rgba('+col+','+a.toFixed(3)+')';
    x.beginPath();x.arc(n.px,n.py,r,0,6.2832);x.fill();
    if(n.s>0.78){
      const hg=x.createRadialGradient(n.px,n.py,0,n.px,n.py,r*7);
      hg.addColorStop(0,'rgba('+col+','+(a*0.22).toFixed(3)+')');
      hg.addColorStop(1,'rgba('+col+',0)');
      x.fillStyle=hg;x.beginPath();x.arc(n.px,n.py,r*7,0,6.2832);x.fill();
    }
  }
}
let start=null;
function loop(ts){
  if(start===null) start=ts;
  draw(((ts-start)/1000)%DURATION);
  requestAnimationFrame(loop);
}
draw(0);
requestAnimationFrame(loop);
window.__record = (ms) => new Promise(resolve => {
  const stream = c.captureStream(${FPS});
  const rec = new MediaRecorder(stream, {mimeType:'video/webm;codecs=vp9', videoBitsPerSecond:7000000});
  const chunks=[];
  rec.ondataavailable = e => { if(e.data.size) chunks.push(e.data); };
  rec.onstop = async () => {
    const blob = new Blob(chunks, {type:'video/webm'});
    const buf = await blob.arrayBuffer();
    let bin=''; const bytes=new Uint8Array(buf);
    const CH=0x8000;
    for(let i=0;i<bytes.length;i+=CH) bin+=String.fromCharCode.apply(null,bytes.subarray(i,i+CH));
    resolve(btoa(bin));
  };
  rec.start();
  setTimeout(()=>rec.stop(), ms);
});
</script></body></html>`;

const EXE = 'C:/Users/Administrator/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';
const browser = await chromium.launch({ executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required','--force-device-scale-factor=1'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.setContent(page_html);
await page.waitForTimeout(1200);
console.log('recording...');
const b64 = await page.evaluate((ms) => window.__record(ms), DURATION * 1000);
await browser.close();
fs.writeFileSync(OUT, Buffer.from(b64, 'base64'));
console.log('written', OUT, (fs.statSync(OUT).size / 1024 / 1024).toFixed(2) + 'MB');


