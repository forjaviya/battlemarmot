import { randomFleet, fire, publicView, remainingLengths, allSunk } from '../src/game/board';
import { chooseShot, probabilityMap } from '../src/game/ai';
import type { BoardState } from '../src/game/types';
const run=(f:(v:any,rem:number[])=>[number,number])=>{let t=0;for(let i=0;i<200;i++){let b:BoardState={marmots:randomFleet(),shots:[]};let n=0;while(!allSunk(b)){const [r,c]=f(publicView(b),remainingLengths(b));const x=fire(b,r,c)!;b=x.board;n++;}t+=n}return t/200};
console.log('pure random', run((v)=>{const u:[number,number][]=[];v.forEach((row:any[],r:number)=>row.forEach((x,c)=>x==='unknown'&&u.push([r,c])));return u[Math.floor(Math.random()*u.length)]}));
console.log('hard', run((v,rem)=>chooseShot(v,rem,'hard')));
