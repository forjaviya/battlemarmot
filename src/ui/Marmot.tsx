import type { Orientation } from '../game/types';
import { H_HEAD_GRUMPY, H_HEAD_SLEEP, PixelSprite, marmotSegments, marmotSegmentsH } from './sprites';

/**
 * Сурок длины n. Вертикальный — стоит столбиком (как настоящие сурки в степи),
 * горизонтальный — лежит: голова слева, тельце вытянуто вправо, хвостик в конце.
 */
export function Marmot({ length, orientation, className, dim, face }: { length: number; orientation: Orientation; className?: string; dim?: boolean; face?: 'sleep' | 'grumpy' }) {
  const vertical = orientation === 'v' || length === 1;
  const segs = vertical ? marmotSegments(length) : [...marmotSegmentsH(length)];
  if (!vertical && face) segs[0] = face === 'sleep' ? H_HEAD_SLEEP : H_HEAD_GRUMPY;
  return (
    <div className={`marmot ${vertical ? 'marmot-v' : 'marmot-h'} ${className ?? ''}`} style={{ filter: dim ? 'grayscale(0.7) brightness(0.9)' : undefined }}>
      {segs.map((s, i) => (
        <PixelSprite key={i} rows={s} className="seg" />
      ))}
    </div>
  );
}
