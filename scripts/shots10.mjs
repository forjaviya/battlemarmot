import { chromium } from 'playwright';
const b = await chromium.launch({executablePath: process.env.PWEXE});
for (const w of [700, 390]) {
const p = await b.newPage({viewport:{width:w,height:1400}});
await p.goto('http://localhost:4173'); await p.waitForTimeout(300);
await p.getByText('Новая игра').first().click(); await p.locator('.opp-normal').click(); await p.waitForTimeout(500);
const bb = await p.locator('.setup .board').boundingBox(); const db = await p.locator('.dock').boundingBox(); const tb = await p.locator('.tb-actions').boundingBox();
console.log(w,'board',Math.round(bb.x),Math.round(bb.x+bb.width),'dock',Math.round(db.x),Math.round(db.x+db.width),'tb',Math.round(tb.x),Math.round(tb.x+tb.width));
await p.screenshot({path:`/tmp/claude-0/shots/su-${w}.png`, fullPage:true});
}
await b.close();
