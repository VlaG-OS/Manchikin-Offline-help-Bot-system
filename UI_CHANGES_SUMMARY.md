# Сводка изменений UI

## ✅ ИСПРАВЛЕНИЕ 1: Пустое место внизу страницы
- **style.css**: `body { height: 100vh; }` → `body { min-height: 100dvh; }`
- Теперь body адаптируется под контент, не создаёт лишнего пространства

## ✅ ИСПРАВЛЕНИЕ 2: Показать поле "Уровень монстра"
- **style.css**: Удалено правило `.setup-section .input-group { display: none; }`
- Добавлены мобильные стили для компактного вида:
  - `display: flex` с `justify-content: space-between`
  - label слева, input 70px справа
  - Высота 44px (удобно для пальца)

## ✅ ИСПРАВЛЕНИЕ 3: Кнопка "Следующий ход" на мобильных
- **index.html**: Убран `style="display: none;"`, добавлен класс `next-turn-btn-mobile`
- **style.css**: 
  - На десктопе (min-width: 769px): `.next-turn-btn-mobile { display: none; }`
  - На мобильных (max-width: 768px): `.next-turn-btn-mobile { display: block; }`, высота 48px
  - Кнопка в `.players-panel` скрыта на мобильных

## ✅ ИСПРАВЛЕНИЕ 4: Мобильный layout — всё на экране
### Панель игроков (.players-panel):
- `display: flex`, `flex-direction: row`, `flex-wrap: wrap`
- Каждый `.player-item`: `flex: 1 1 calc(50% - 3px)`, минимум 44px высоты
- Кнопки ±: 44x44px (font-size: 1.2em)

### game-area:
Порядок элементов сверху вниз:
1. Кнопка "Следующий ход" (48px)
2. Поле "Уровень монстра" (44px, компактное)
3. Кнопка "Бросить кости" (52px)
4. Карточки ботов
5. Итоги
6. Кнопка "Настройки игры" (48px)

### Карточки ботов (.results-section):
- 1-2 бота: `grid-template-columns: 1fr` (одна колонка)
- 3+ бота: `grid-template-columns: 1fr 1fr` (две колонки)
- Карточки: `max-height: 160px`

## ✅ ИСПРАВЛЕНИЕ 5: Добавить бот-каунт в мобильные настройки
- **index.html**: В `.mobile-settings-panel` добавлен блок:
```html
<div class="input-group">
    <label>Количество ботов:</label>
    <input type="number" id="botCountMobile" min="1" max="6" value="1" onchange="syncBotCount()">
</div>
```

## ✅ ИСПРАВЛЕНИЕ 6: Кнопки — размер под палец
На мобильных (max-width: 768px):
- `.main-btn`: `min-height: 52px`, `padding: 14px`
- `.next-turn-btn-mobile`: `min-height: 48px`, `padding: 12px`
- `.reset-btn`: `min-height: 48px`, `padding: 12px`
- `.tactics-btn`: `min-height: 48px`, `padding: 12px`
- `.mobile-settings-trigger`: `min-height: 48px`, `padding: 12px`
- `.level-btn`: `44x44px`, `font-size: 1.2em`
- Все кнопки: `font-size: 1em` минимум

## Проверка на iPhone 14 (390x844)
Ожидаемые результаты:
- ✅ Поле "Уровень монстра" видно и компактно
- ✅ Нет пустого пространства внизу
- ✅ Кнопка "Следующий ход" видна вверху game-area
- ✅ При 1 боте всё помещается без зума
- ✅ Все кнопки 44px+ (легко попасть пальцем)
- ✅ Игроки в строку по 2 (для 2 игроков)
- ✅ Карточки ботов: 1 колонка при 1-2 ботах, 2 колонки при 3+

## Что НЕ тронуто (как требовалось)
- ❌ script.js — НЕ ОТКРЫВАЛИ
- ❌ Визуальный стиль (цвета, шрифты, градиенты) — НЕ МЕНЯЛИ
- ❌ Логика модальных окон — НЕ МЕНЯЛИ
- ❌ ID атрибуты элементов — НЕ ПЕРЕИМЕНОВЫВАЛИ
