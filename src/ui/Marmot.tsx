import type { Orientation } from '../game/types';
import { H_HEAD_GRUMPY, H_HEAD_SLEEP, PixelSprite, marmotSegments, marmotSegmentsH } from './sprites';

/**
 * Сурок длины n. Вертикальный - стоит столбиком (как настоящие сурки в степи),
 * горизонтальный - лежит: голова слева, тельце вытянуто вправо, хвостик в конце.
 */
export function Marmot({ length, orientation, className, dim, face }: { length: number; orientation: Orientation; className?: string; dim?: boolean; face?: 'sleep' | 'grumpy' }) {
  const vertical = orientation === 'v' || length === 1;
  const segs = vertical ? marmotSegments(length) : [...marmotSegmentsH(length)];
  if (!vertical && face) segs[0] = face === 'sleep' ? H_HEAD_SLEEP : H_HEAD_GRUMPY;
  // склеиваем сегменты в один спрайт - без швов между клетками
  const rows = vertical ? segs.flat() : segs[0].map((_, y) => segs.map((seg) => seg[y]).join(''));
  return (
    <div className={`marmot ${vertical ? 'marmot-v' : 'marmot-h'} ${className ?? ''}`} style={{ filter: dim ? 'grayscale(0.7) brightness(0.9)' : undefined }}>
      <PixelSprite rows={rows} className="whole" />
    </div>
  );
}
