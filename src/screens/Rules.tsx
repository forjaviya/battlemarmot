import { Marmot } from '../ui/Marmot';
import { HOLE, PEEK, PixelSprite, STAR } from '../ui/sprites';
import { MARMOT_NAMES } from '../ui/sprites';

export function Rules({ onBack }: { onBack: () => void }) {
  return (
    <div className="screen rules">
      <div className="screen-head">
        <button className="btn ghost small" onClick={onBack}>← Меню</button>
        <h2>Как играть</h2>
      </div>
      <div className="panel prose">
        <p>Это классический «Морской бой», только вместо кораблей — сурки, а вместо моря — казахская степь. Никто не воюет: мы играем в прятки.</p>
        <h3>1. Спрячь сурков</h3>
        <p>У каждого игрока поле 10×10 и 10 сурков:</p>
        <ul className="fleet-legend">
          {[4, 3, 2, 1].map((len, i) => (
            <li key={len}>
              <span className="legend-sprite" style={{ width: `${len * 22}px` }}><Marmot length={len} orientation="h" /></span>
              {MARMOT_NAMES[len]} (длина {len}) × {i + 1}
            </li>
          ))}
        </ul>
        <p>Сурки стоят прямо — лёжа или столбиком — и не касаются друг друга даже углами.</p>
        <h3>2. Ищи сурков соседа</h3>
        <ul className="legend">
          <li><PixelSprite rows={HOLE} size={28} /> <b>Пусто</b> — ход переходит сопернику.</li>
          <li><PixelSprite rows={PEEK} size={28} /> <b>Попался!</b> — нашёл часть сурка, ходи ещё раз и ищи рядом.</li>
          <li><PixelSprite rows={STAR} className="legend-star" /> <b>Сурок найден</b> — целиком. Клетки вокруг него автоматически отмечаются как пустые.</li>
        </ul>
        <p>В одну клетку дважды заглянуть нельзя. Побеждает тот, кто первым найдёт всех 10 сурков соседа.</p>
        <h3>3. Соперники</h3>
        <ul>
          <li><b>Жаворонок</b> — ищет почти наугад.</li>
          <li><b>Лиса</b> — проверяет норки через одну и прочёсывает всё вокруг найденного хвостика.</li>
          <li><b>Беркут</b> — считает вероятность для каждой клетки. Попробуй обыграть!</li>
        </ul>
        <p>Компьютер не подглядывает: он знает только то, что видно и тебе — где уже искали и что нашли.</p>
        <h3>Сохранение</h3>
        <p>Партия сохраняется автоматически — можно закрыть вкладку и продолжить позже. Войди в аккаунт, чтобы история и статистика были доступны на любом устройстве.</p>
        <p className="kbd-hint">Клавиатура: стрелки — перемещение по полю, Enter — выбрать клетку, R — повернуть сурка.</p>
      </div>
    </div>
  );
}
