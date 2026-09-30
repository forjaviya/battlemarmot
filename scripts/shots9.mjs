import { chromium } from 'playwright';
const b = await chromium.launch({executablePath: process.env.PWEXE});
for (const w of [1280, 900, 700, 390]) {
const p = await b.newPage({viewport:{width:w,height:900}});
await p.goto('http://localhost:4173'); await p.waitForTimeout(300);
await p.evaluate(()=>localStorage.setItem('suyr.layout.v1', JSON.stringify([{id:0,length:4,row:0,col:0,orientation:'h'},{id:1,length:3,row:2,col:0,orientation:'h'},{id:2,length:3,row:4,col:0,orientation:'h'},{id:3,length:2,row:6,col:0,orientation:'h'},{id:4,length:2,row:8,col:0,orientation:'h'},{id:5,length:2,row:0,col:6,orientation:'h'},{id:6,length:1,row:2,col:6,orientation:'h'},{id:7,length:1,row:4,col:6,orientation:'h'},{id:8,length:1,row:6,col:6,orientation:'h'},{id:9,length:1,row:8,col:6,orientation:'h'}])));
await p.getByText('Новая игра').first().click(); await p.locator('.opp-normal').click(); await p.waitForTimeout(500);
await p.locator('.board').first().click({position:{x:5,y:5}});
await p.locator('.setup-toolbar').screenshot({path:`/tmp/claude-0/shots/tb-${w}.png`});
}
await b.close();
