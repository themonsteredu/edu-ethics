// 장면별 실제 앱 화면 녹화. 사용: node go.mjs home|l1|l2|l3|l3done  (앱은 `npm run dev`로 Supabase 설정 없이 실행 → 같은 기기 데모 모드)
import { session, record, startRec, startBots, BASE } from './rec.mjs';
const w = ms => new Promise(r => setTimeout(r, ms));
const which = process.argv[2];
const PHONE = { w: 390, h: 844 };

async function openTeacher(ctx, lesson) {
  const t = await ctx.newPage();
  await t.goto(BASE + `/teacher?lesson=${lesson}`); await w(1500);
  const room = (await t.locator('.room-code-badge strong').textContent()).trim();
  const bot = await ctx.newPage(); await bot.goto(BASE + '/'); await startBots(bot, room, lesson);
  await t.bringToFront();
  const next = async () => { await t.locator('.teacher-control-actions button').last().click(); };
  return { t, bot, room, next };
}

await session(async ctx => {
  if (which === 'home') {
    const p = await ctx.newPage();
    await p.goto(BASE + '/'); await w(2500);
    await record(p, 'home', async () => {
      await w(2500);
      await p.evaluate(() => window.scrollTo({ top: document.querySelector('.lesson-series').offsetTop - 60, behavior: 'smooth' }));
      await w(4000);
    });
  }

  if (which === 'l1') {
    const { t, bot, room, next } = await openTeacher(ctx, 1);
    const s = await ctx.newPage(); await s.setViewportSize({ width: PHONE.w, height: PHONE.h });
    await s.goto(BASE + `/join?room=${room}`); await w(1200);
    const rt = await startRec(t, 'l1t'); const rs = await startRec(s, 'l1s', PHONE);
    const mark = l => { rt.mark(l); rs.mark(l); };
    await w(1500); mark('join');
    bot.evaluate(() => window.botJoin(4500));
    await s.getByPlaceholder('예: 민지').pressSequentially('하늘', { delay: 180 }); await w(300);
    await s.locator('select').selectOption('3'); await w(500);
    await s.getByRole('button', { name: /판정소 입장/ }).click(); await w(4000);
    mark('briefing'); await next(); await w(2500);
    await next(); await w(700); await next(); await w(700);
    mark('vote1'); await next(); await w(1500);
    bot.evaluate(() => window.botVote([9, 12, 6], [5, 2, 3, 1], 5500, 1));
    await s.locator('.signal-button--yellow').click(); await w(900);
    await s.locator('.reason-chips button').first().click(); await w(700);
    await s.locator('.submit-judgement').click(); await w(4500);
    mark('result1'); await next(); await w(4000);
    mark('vote2'); await next(); await w(1500);
    bot.evaluate(() => window.botVote([3, 8, 16], [2, 5, 1, 3], 4500, 1));
    await s.locator('.signal-button--red').click(); await w(900);
    await s.locator('.reason-chips button').nth(3).click(); await w(700);
    await s.locator('.submit-judgement').click(); await w(3500);
    mark('result2'); await next(); await w(4500);
    mark('key'); await next(); await w(700); await next(); await w(700); // 조건 2는 건너뛰고 열쇠까지
    while (!(await t.locator('.key-reveal-screen').count())) { await next(); await w(600); }
    mark('keyshown'); await w(4000);
    await rt.stop(); await rs.stop();
  }

  if (which === 'l2') {
    const { t, bot, next } = await openTeacher(ctx, 2);
    await bot.evaluate(() => window.botJoin(300)); await w(800);
    await next(); for (let i = 0; i < 3; i++) { await next(); await w(400); }
    await bot.evaluate(() => window.botVote([7, 9, 11], [3, 4, 2, 1], 800)); await w(1200);
    await record(t, 'l2', async mark => {
      await w(1000); mark('result1'); await next(); await w(4000);
      mark('battle'); await next(); await w(4500);
      mark('vote2'); await next(); await w(800);
      await bot.evaluate(() => window.botVote([15, 9, 3], [2, 4, 3, 1], 2500)); await w(800);
      mark('result2'); await next(); await w(5000);
    });
  }

  if (which === 'l3') {
    const { t, bot, next } = await openTeacher(ctx, 3);
    await bot.evaluate(() => window.botJoin(300)); await w(800);
    await next(); for (let i = 0; i < 3; i++) { await next(); await w(400); }
    await bot.evaluate(() => window.botVote([6, 10, 12], [2, 3, 4, 2], 800)); await w(1200);
    await record(t, 'l3', async mark => {
      await w(1000); mark('result1'); await next(); await w(3500);
      mark('hearing'); await next(); await w(4500);
      mark('vote2'); await next(); await w(800);
      await bot.evaluate(() => window.botVote([2, 19, 7], [5, 2, 3, 2], 2500)); await w(800);
      mark('result2'); await next(); await w(3500);
      mark('final'); await next(); await w(1500); await next(); await w(4500);
    });
  }

  if (which === 'l3done') {
    const { t, bot, next } = await openTeacher(ctx, 3);
    await bot.evaluate(() => window.botJoin(300)); await w(800);
    while (!(await t.locator('.complete-screen').count())) { await next(); await w(250); }
    await t.reload(); await w(1500);
    await record(t, 'l3done', async () => { await w(5000); });
  }
});
