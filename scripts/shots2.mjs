import { chromium } from 'playwright';
const b = await chromium.launch({executablePath: process.env.PWEXE});
const p = await b.newPage({viewport:{width:1000,height:700}});
// fake history for stats
await p.goto('http://localhost:4173');
await p.evaluate(()=>{const h=[];const ds=['easy','normal','hard'];for(let i=0;i<14;i++){const d=ds[i%3];const won=d==='easy'?true:d==='normal'?i%2===0:i%5===0;h.push({id:'g'+i,difficulty:d,won,shots:40+i,hits:20,accuracy:20/(40+i),durationSec:200+i*7,finishedAt:Date.now()-i*3600e3,synced:false})}localStorage.setItem('suyr.history.v1',JSON.stringify(h))});
await p.reload(); await p.getByText('Статистика').first().click(); await p.waitForTimeout(600);
await p.screenshot({path:'/tmp/claude-0/shots/stats.png', fullPage:true});
await p.getByText('Меню').first().click(); await p.getByText('Новая игра').first().click(); await p.waitForTimeout(700);
await p.locator('.opponents').screenshot({path:'/tmp/claude-0/shots/opp.png'});
await b.close();
