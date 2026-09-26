// 녹화 공통 도구: Playwright 페이지를 CDP 스크린캐스트로 찍어 30fps 클립(clips/<name>.mp4 + 프레임)으로 저장
import { chromium } from 'playwright';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
export const FF = process.env.FFMPEG || '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
// 화면에 localhost 대신 배포 주소가 보이도록, 배포 주소 요청을 로컬 개발 서버로 돌려 받음(실제 배포 서버에는 접속하지 않음)
export const BASE = 'https://edu-ethics.vercel.app';
const LOCAL = process.env.LOCAL || 'http://localhost:5173';
const DPR = Number(process.env.DPR || 1.5);
// 앱 폰트(S-Core Dream CDN)를 녹화 환경에서 못 받으므로 로컬 Pretendard로 통일
const FONT = `*{font-family:"Pretendard","S-Core Dream",sans-serif !important}`;

export async function session(fn) {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: DPR });
  await ctx.route(BASE + '/**', async route => {
    const response = await route.fetch({ url: route.request().url().replace(BASE, LOCAL) });
    await route.fulfill({ response });
  });
  await ctx.addInitScript(css => {
    // 녹화용: 교사 PIN 화면 건너뛰기(앱 코드 수정 없이 sessionStorage 값만 설정)
    try { sessionStorage.setItem('edu-ethics:teacher-unlocked', 'yes'); } catch {}
    document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); });
  }, FONT);
  try { await fn(ctx); } finally { await b.close(); }
}

// 녹화 시작 → stop()을 부르면 끝. 여러 페이지를 동시에 녹화할 수 있음
export async function startRec(page, name, size = { w: 1600, h: 900 }) {
  const dir = `clips/${name}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', async f => {
    const i = frames.length; frames.push(f.metadata.timestamp);
    fs.writeFileSync(`${dir}/${String(i).padStart(5, '0')}.jpg`, Buffer.from(f.data, 'base64'));
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  const W = 2 * Math.round(size.w * DPR / 2), H = 2 * Math.round(size.h * DPR / 2);
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
  const start = Date.now() / 1000;
  const marks = [];
  const stop = async () => {
    const end = Date.now() / 1000;
    await cdp.send('Page.stopScreencast');
    // 첫 프레임 이전 구간은 첫 프레임으로 채워 시간축을 녹화 시작 시각에 맞춤
    const ts = frames.slice(); if (ts.length) ts[0] = Math.min(ts[0], start);
    let list = '';
    ts.forEach((t, i) => { const next = i + 1 < ts.length ? ts[i + 1] : end; list += `file '${String(i).padStart(5, '0')}.jpg'\nduration ${Math.max(0.001, next - t).toFixed(4)}\n`; });
    list += `file '${String(ts.length - 1).padStart(5, '0')}.jpg'\n`;
    fs.writeFileSync(`${dir}/list.txt`, list);
    execFileSync(FF, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', `${dir}/list.txt`, '-vf', `fps=30,scale=${W}:${H}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', `clips/${name}.mp4`]);
    fs.writeFileSync(`clips/${name}.marks.txt`, marks.map(m => `${m[0].toFixed(2)} ${m[1]}`).join('\n'));
    console.log(name, frames.length, 'frames', (end - start).toFixed(1), 's');
  };
  return { stop, mark: label => marks.push([Date.now() / 1000 - start, label]) };
}

export async function record(page, name, actions, size) {
  const r = await startRec(page, name, size);
  await actions(r.mark);
  await r.stop();
}

// 가상 학생(더미 데이터): 앱의 "같은 기기 데모" 모드가 쓰는 BroadcastChannel에 접속 신호와 투표를 보냄
export async function startBots(page, room, lessonId, count = 28) {
  await page.evaluate(async ({ room, lessonId, count }) => {
    const { getLessonConfig } = await import('/src/data/lessons.ts');
    const lesson = getLessonConfig(lessonId);
    const ch = new BroadcastChannel(`edu-ethics:${room}`);
    const bots = Array.from({ length: count }, (_, i) => ({ id: `student-demo-${i + 1}`, role: 'student', nickname: `판정관${i + 1}`, teamId: (i % 6) + 1, onlineAt: Date.now() }));
    let joined = 0; // 학생들이 한 명씩 들어오는 모습
    const beat = () => bots.slice(0, joined).forEach(m => ch.postMessage({ scope: 'presence', action: 'heartbeat', member: { ...m, onlineAt: Date.now() } }));
    setInterval(beat, 3000);
    window.botJoin = async (over = 4000) => { for (let i = 0; i < count; i++) { joined = i + 1; ch.postMessage({ scope: 'presence', action: 'join', member: { ...bots[i], onlineAt: Date.now() } }); await new Promise(r => setTimeout(r, over / count)); } };
    const sessionKey = 'edu-ethics:teacher-session:v1' + (lessonId === 1 ? '' : `:lesson-${lessonId}`);
    // dist: [green, yellow, red] 인원, reasons: 이유 인덱스 가중치, over: 몇 ms에 걸쳐 도착할지
    window.botVote = async (dist, reasons, over = 6000, skip = 0) => {
      const snap = JSON.parse(localStorage.getItem(sessionKey));
      const round = lesson.rounds[snap.roundIndex]; const phase = round.phases[snap.phaseIndex];
      const choices = [...Array(dist[0]).fill('green'), ...Array(dist[1]).fill('yellow'), ...Array(dist[2]).fill('red')];
      const pool = reasons.flatMap((w, i) => Array(w).fill(i)); const P = pool.length, rs = [3, 5, 7, 11].find(x => P % x !== 0) || 1;
      const n = choices.length, step = [7, 5, 11, 13].find(s => n % s !== 0) || 1; // 선택 순서를 섞어 막대가 고르게 자라도록
      const order = bots.slice(skip, skip + n).map((b, i) => ({ b, c: choices[(i * step) % n], i }));
      for (const { b, c, i } of order) {
        const reason = phase.suggestedReasonTags[pool[(i * rs + 1) % P]];
        const vote = { studentId: b.id, teamId: b.teamId, roundId: round.id, phaseId: phase.id, choice: c, reasonId: reason.id, submittedAt: Date.now() };
        ch.postMessage({ scope: 'event', event: { kind: 'vote-submit', senderId: b.id, sentAt: Date.now(), receiptId: `r-${b.id}-${Date.now()}`, vote } });
        await new Promise(r => setTimeout(r, over / choices.length * (0.5 + ((i * 37) % 10) / 10)));
      }
    };
  }, { room, lessonId, count });
}
