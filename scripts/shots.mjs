import { chromium } from 'playwright';
const out='/tmp/claude-0/shots';
const b = await chromium.launch({executablePath: process.env.PWEXE});
for (const [name, vp] of [['desk',{width:1280,height:860}],['mob',{width:390,height:844}]]) {
  const p = await b.newPage({viewport:vp, deviceScaleFactor: 1});
  p.on('pageerror', e=>console.log('ERR',e.message));
  await p.goto('http://localhost:4173'); await p.waitForTimeout(800);
  await p.screenshot({path:`${out}/${name}-1home.png`, fullPage:true});
  await p.getByText('Новая игра').click();
  await p.screenshot({path:`${out}/${name}-2opp.png`, fullPage:true});
  await p.getByText('Лиса', {exact:true}).click();
  await p.locator('[data-cell="2-2"]').first().click();
  await p.locator('[data-cell="5-5"]').first().hover();
  await p.screenshot({path:`${out}/${name}-3setup.png`, fullPage:true});
  await p.getByText('Случайно').click();
  await p.getByText('Начать прятки!').click();
  for (let i=0;i<25;i++){ const c=p.locator('.board.enemy .cell.clickable'); if(await c.count()===0){await p.waitForTimeout(900);continue;} await c.nth(Math.floor(Math.random()*await c.count())).click(); await p.waitForTimeout(150);}
  await p.waitForTimeout(1500);
  await p.screenshot({path:`${out}/${name}-4battle.png`, fullPage:true});
}
await b.close();
