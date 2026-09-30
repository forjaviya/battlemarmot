import { newGame, startBattle, aiShoot } from '../src/game/engine';
import { randomFleet, allSunk, canPlace } from '../src/game/board';
import type { Difficulty } from '../src/game/types';
for (const d of ['easy','normal','hard'] as Difficulty[]) {
  let total=0, N=300, bad=0;
  for (let i=0;i<N;i++){
    let s = startBattle(newGame(d), randomFleet());
    // validate fleet
    const f = s.player.marmots; if (!f.every(m=>canPlace(f,m,m.id))) bad++;
    s = {...s, turn:'ai'};
    let n=0;
    while (s.phase==='battle'){ s = {...s, turn:'ai'}; const r = aiShoot(s); if(!r) throw new Error('null move'); s=r.state; n++; if(n>100) throw new Error('loop'); }
    if(!allSunk(s.player)) throw new Error('not over');
    const cells = new Set(s.player.shots.map(x=>x.row*10+x.col)); if (cells.size!==s.player.shots.length) throw new Error('repeat');
    total+=n;
  }
  console.log(d, 'avg shots', (total/N).toFixed(1), 'invalid fleets', bad);
}
