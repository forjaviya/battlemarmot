import { chromium } from 'playwright';
const b = await chromium.launch({executablePath: process.env.PWEXE});
for (const w of [1280, 900, 390]) {
const p = await b.newPage({viewport:{width:w,height:1000}});
await p.goto('http://localhost:4173'); await p.waitForTimeout(300);
await p.getByText('Новая игра').first().click(); await p.locator('.opp-normal').click(); await p.waitForTimeout(400);
await p.getByText('Случайно').first().click(); await p.getByText('Начать', {exact:true}).click(); await p.waitForTimeout(500);
const r = await p.evaluate(()=>[...document.querySelectorAll('.battle .board')].map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.width)]}));
const m = await p.locator('.msg').boundingBox();
console.log(w, JSON.stringify(r), 'msg', Math.round(m.x), Math.round(m.x+m.width));
if (w===390) { await p.getByText('Мои сурки').first().click(); await p.waitForTimeout(200); const r2 = await p.evaluate(()=>[...document.querySelectorAll('.battle .board')].map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.width)]})); console.log('own tab', JSON.stringify(r2)); }
await p.screenshot({path:`/tmp/claude-0/shots/bt-${w}.png`});
}
await b.close();
