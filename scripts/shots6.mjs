import { chromium } from 'playwright';
const b = await chromium.launch({executablePath: process.env.PWEXE});
for (const [n,vp] of [['d',{width:1280,height:900}],['m',{width:390,height:844}]]) {
const p = await b.newPage({viewport:vp});
await p.goto('http://localhost:4173'); await p.waitForTimeout(2500);
await p.locator('.parade').screenshot({path:`/tmp/claude-0/shots/par-${n}.png`});
await p.locator('.features').screenshot({path:`/tmp/claude-0/shots/feat-${n}.png`});
}
await b.close();
