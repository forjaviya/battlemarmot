import { chromium } from 'playwright';
const b = await chromium.launch({executablePath: process.env.PWEXE});
for (const [n,vp] of [['d',{width:1280,height:900}],['m',{width:390,height:844}]]) {
const p = await b.newPage({viewport:vp});
await p.goto('http://localhost:4173'); await p.waitForTimeout(500);
await p.getByText('Новая игра').first().click(); await p.waitForTimeout(300);
await p.locator('.opp-normal').click(); await p.waitForTimeout(800);
await p.screenshot({path:`/tmp/claude-0/shots/setup-${n}.png`, fullPage: true});
}
await b.close();
