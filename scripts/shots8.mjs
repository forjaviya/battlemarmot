import { chromium } from 'playwright';
const b = await chromium.launch({executablePath: process.env.PWEXE});
const p = await b.newPage({viewport:{width:1280,height:900}});
await p.goto('http://localhost:4173'); await p.waitForTimeout(300);
// burrow 1 starts down (i%2==0 up) -> click to bring up, wait, click again
await p.locator('.burrow').nth(1).click(); await p.waitForTimeout(500);
await p.locator('.burrow').nth(1).click();
for (const t of [150,300,300]) { await p.waitForTimeout(t); await p.locator('.parade').screenshot({path:`/tmp/claude-0/shots/t${t}-${Date.now()%1000}.png`}); }
await b.close();
const m = await chromium.launch({executablePath: process.env.PWEXE});
const q = await m.newPage({viewport:{width:600,height:800}}); await q.goto('http://localhost:4173'); await q.waitForTimeout(500);
await q.locator('.parade').screenshot({path:'/tmp/claude-0/shots/par600.png'}); await m.close();
