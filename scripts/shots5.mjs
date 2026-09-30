import { chromium } from 'playwright';
const b = await chromium.launch({executablePath: process.env.PWEXE});
for (const [n,vp] of [['1280',{width:1280,height:900}],['1024',{width:1024,height:800}]]) {
const p = await b.newPage({viewport:vp});
await p.goto('http://localhost:4173'); await p.waitForTimeout(500);
if (n==='1280') { await p.locator('.features').screenshot({path:'/tmp/claude-0/shots/feat2.png'}); }
await p.getByText('Новая игра').first().click(); await p.waitForTimeout(300);
if (n==='1280') await p.locator('.opp-list').screenshot({path:'/tmp/claude-0/shots/opp2.png'});
await p.locator('.opp-normal').click(); await p.waitForTimeout(800);
const bb = await p.locator('.setup .board').boundingBox(); const db = await p.locator('.dock').boundingBox();
console.log(n, 'board', Math.round(bb.y), Math.round(bb.y+bb.height), 'dock', Math.round(db.y), Math.round(db.y+db.height));
await p.screenshot({path:`/tmp/claude-0/shots/setup-${n}.png`});
}
await b.close();
