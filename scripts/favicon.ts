import { BABY, PAL } from '../src/ui/sprites';
import { writeFileSync } from 'fs';
let r='';BABY.forEach((row,y)=>[...row].forEach((ch,x)=>{if(ch!=='.')r+=`<rect x="${x}" y="${y}" width="1" height="1" fill="${PAL[ch]}"/>`}));
writeFileSync('public/favicon.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">${r}</svg>`);
