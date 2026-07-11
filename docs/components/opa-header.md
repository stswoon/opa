# Компонент `opa-header`

Заголовочная панель приложения OPA Boilerplate. Предоставляет пользователю основные действия: смена имени, создание комнаты и выход из комнаты. Отображает подсказку, если комната ещё не создана, и содержит глобальный toast для показа ошибок WebSocket.

**Исходный файл:** `client/src/app/components/opa-header.ts`  
**Базовый класс:** `client/src/app/AbstractComponent.ts`  
**Строки интерфейса:** `client/src/app/strings.ts` → секция `OpaHeader`  
**Регистрация:** `client/src/main.ts` (side-effect import)  
**Использование в разметке:** `client/index.html`

---

## Содержание

1. [Обзор и назначение](#обзор-и-назначение)
2. [Custom Element](#custom-element)
3. [Наследование от AbstractComponent](#наследование-от-abstractcomponent)
4. [Наблюдаемые атрибуты (observed attributes)](#наблюдаемые-атрибуты-observed-attributes)
5. [Структура шаблона](#структура-шаблона)
6. [Использование Alpine.js](#использование-alpinejs)
7. [UI5 Web Components](#ui5-web-components)
8. [Взаимодействие с пользователем](#взаимодействие-с-пользователем)
9. [Методы AppService через `window.app`](#методы-appservice-через-windowapp)
10. [CSS-классы и стили](#css-классы-и-стили)
11. [Пример HTML-использования](#пример-html-использования)
12. [Жизненный цикл компонента](#жизненный-цикл-компонента)
13. [Интеграция с AppService](#интеграция-с-appservice)
14. [Строки локализации](#строки-локализации)
15. [Зависимости и порядок загрузки](#зависимости-и-порядок-загрузки)
16. [Особенности реализации и ограничения](#особенности-реализации-и-ограничения)

---

## Обзор и назначение

`opa-header` — это **Web Component** (Custom Element), который рендерит горизонтальную панель управления в верхней части сеточного макета приложения. Компонент не содержит собственной бизнес-логики: все действия делегируются глобальному объекту `window.app` (экземпляр `AppService`).

Основные функции:

| Функция | Описание |
|---------|----------|
| Смена имени пользователя | Открывает диалог `opa-username-popup` |
| Создание комнаты | Генерирует UUID, перенаправляет на URL с параметром `?room=` |
| Выход из комнаты | Отключает WebSocket, очищает состояние, возвращает на главную |
| Индикация отсутствия комнаты | Показывает заголовок «Create Room First» и анимацию «тряски» кнопки |
| Глобальные ошибки | Содержит `ui5-toast` с `id="wcToastError"`, вызываемый из `AppService` |

Компонент **всегда видим** (в отличие от `opa-messages`, `opa-send-control`, `opa-user-list`, которые скрываются при отсутствии комнаты).

---

## Custom Element

| Свойство | Значение |
|----------|----------|
| **Тег** | `<opa-header>` |
| **Имя класса** | `OpaHeader` |
| **Регистрация** | `customElements.define("opa-header", OpaHeader)` |
| **Shadow DOM** | Не используется — контент рендерится в `innerHTML` элемента |
| **Публичный API** | Только HTML-атрибут `room-exist`; методов и свойств не экспортирует |

Регистрация происходит при импорте модуля в `main.ts`:

```typescript
import "./app/components/opa-header"
```

После загрузки модуля тег `<opa-header>` становится валидным в HTML и может использоваться без дополнительной инициализации.

---

## Наследование от AbstractComponent

`OpaHeader` наследует абстрактный класс `AbstractComponent`, который расширяет нативный `HTMLElement` и реализует паттерн **рендеринга по шаблону**:

```typescript
class OpaHeader extends AbstractComponent {
    constructor() {
        super(template);  // передаёт функцию-шаблон в базовый класс
    }

    static get observedAttributes() {
        return ["room-exist"];
    }
}
```

### Что делает `AbstractComponent`

1. **Хранит функцию-шаблон** (`templateTypeFunction`) — функция `(params) => string`, возвращающая HTML-строку.
2. **Метод `render()`** — собирает параметры из наблюдаемых атрибутов и `state`, вызывает шаблон, записывает результат в `this.innerHTML`.
3. **`connectedCallback`** — при первом подключении к DOM вызывает `render()` один раз (флаг `rendered`).
4. **`attributeChangedCallback`** — при изменении любого наблюдаемого атрибута вызывает `render()` повторно.

Алгоритм сбора параметров в `render()`:

```typescript
let params: any = {};
for (let attribute of observedAttributes) {
    params[attribute] = this.getAttribute(attribute);  // null, если атрибут не задан
}
params = {...params, ...this.state};
this.innerHTML = this.template(params);
```

Для `opa-header` в `params` попадает ключ `"room-exist"` со значением строки (`"true"`, `"false"`) или `null`.

---

## Наблюдаемые атрибуты (observed attributes)

### `room-exist`

| Свойство | Значение |
|----------|----------|
| **Имя атрибута** | `room-exist` |
| **Тип в DOM** | Строковый HTML-атрибут |
| **Управление** | Программно через `AppService.showRoom()` / `AppService.hideRoom()` |
| **Начальное значение в `index.html`** | Не задано (отсутствует) |

#### Кто устанавливает атрибут

`AppService` управляет атрибутом при инициализации и смене состояния комнаты:

```typescript
// showRoom() — комната существует (есть ?room= в URL)
document.getElementsByTagName("opa-header")[0].setAttribute("room-exist", true);
// → в DOM: room-exist="true"

// hideRoom() — комнаты нет
document.getElementsByTagName("opa-header")[0].setAttribute("room-exist", false);
// → в DOM: room-exist="false"
```

> **Примечание:** `setAttribute` всегда приводит значение к строке. Булевы `true`/`false` становятся `"true"`/`"false"`.

#### Как атрибут попадает в шаблон

В функции `template`:

```typescript
const roomExist = params["room-exist"];
// ...
x-data='{ roomExist: ${roomExist} }'
```

| Значение `getAttribute("room-exist")` | Результат в `x-data` | Поведение Alpine |
|--------------------------------------|----------------------|------------------|
| `"true"` | `{ roomExist: true }` | `roomExist` — истинно |
| `"false"` | `{ roomExist: false }` | `roomExist` — ложно |
| `null` (атрибут не задан) | `{ roomExist: null }` | `roomExist` — ложно (falsy) |

#### Влияние на UI

| `roomExist` (falsy) | `roomExist` (truthy) |
|---------------------|----------------------|
| Кнопка «Create Room» получает класс `_shake` (анимация тряски) | Класс `_shake` не применяется |
| Заголовок `ui5-title` виден (`x-show="!roomExist"`) | Заголовок скрыт |

---

## Структура шаблона

Шаблон — это функция, возвращающая HTML-строку. Корневой элемент:

```html
<div class="opa-header" x-data='{ roomExist: <значение> }'>
    <!-- дочерние элементы -->
</div>
```

### Дерево DOM (после рендеринга)

```
opa-header                          ← Custom Element (host)
└── div.opa-header                  ← корень Alpine.js (x-data)
    ├── ui5-button                  ← «Change Name»
    ├── ui5-button                  ← «Create Room» (условный класс _shake)
    ├── ui5-button                  ← «Leave Room»
    ├── ui5-toast#wcToastError      ← toast ошибок (скрыт по умолчанию)
    └── ui5-title[level=H1]         ← «Create Room First» (условная видимость)
```

### Порядок элементов

1. **Кнопка смены имени** — всегда видна, без Alpine-директив.
2. **Кнопка создания комнаты** — с динамическим классом через `x-bind:class`.
3. **Кнопка выхода** — всегда видна.
4. **Toast ошибок** — невидим до вызова `.show()`, глобальный `id`.
5. **Заголовок-подсказка** — условно видим через `x-show`.

### Интерполяция строк

Тексты кнопок и заголовков подставляются из `strings.OpaHeader` на этапе компиляции шаблона (при каждом `render()`), а не через Alpine:

```typescript
${strings.OpaHeader.changeName}      // "Change Name"
${strings.OpaHeader.createRoom}      // "Create Room"
${strings.OpaHeader.leaveRoom}       // "Leave Room"
${strings.OpaHeader.error}           // "Some error occurred"
${strings.OpaHeader.createRoomFirst} // "Create Room First"
```

---

## Использование Alpine.js

Alpine.js подключается глобально в `main.ts`:

```typescript
import "alpinejs/dist/cdn.min.js"
```

Компонент использует Alpine **внутри** `innerHTML`, а не на самом custom element. Alpine инициализируется на корневом `div.opa-header` после каждого `render()`.

### Директива `x-data`

```html
<div class="opa-header" x-data='{ roomExist: true }'>
```

Создаёт локальное реактивное состояние с одним полем `roomExist`. Значение инициализируется из HTML-атрибута `room-exist` при рендеринге (не обновляется реактивно при смене атрибута без полного перерендера).

### Директива `x-bind:class` (сокращённо `:`)

```html
<ui5-button x-bind:class="{ '_shake': !roomExist }" ...>
```

| Условие | Класс | Эффект |
|---------|-------|--------|
| `!roomExist === true` | `_shake` добавляется | CSS-анимация тряски на кнопке «Create Room» |
| `roomExist === true` | `_shake` отсутствует | Обычное отображение кнопки |

Используется объектный синтаксис Alpine: ключ — имя класса, значение — булево условие.

### Директива `x-show`

```html
<ui5-title level="H1" x-show="!roomExist">...</ui5-title>
```

| `roomExist` | Видимость заголовка |
|-------------|---------------------|
| falsy (`false`, `null`) | Заголовок «Create Room First» **виден** |
| truthy (`true`) | Заголовок **скрыт** (`display: none`) |

### Что Alpine **не** делает в этом компоненте

- Нет `x-on:click` / `@click` — обработчики заданы через нативный `onclick`.
- Нет `x-model`, `x-for`, `x-if` — только `x-data`, `x-bind:class`, `x-show`.
- Состояние `roomExist` не синхронизируется с атрибутом host-элемента автоматически; при `attributeChangedCallback` → `render()` DOM пересоздаётся и Alpine переинициализируется.

---

## UI5 Web Components

Компоненты SAP UI5 Web Components импортируются в `main.ts`:

| Тег | Модуль | Роль в `opa-header` |
|-----|--------|---------------------|
| `<ui5-button>` | `@ui5/webcomponents/dist/Button` | Три кнопки действий |
| `<ui5-toast>` | `@ui5/webcomponents/dist/Toast` | Уведомление об ошибке |
| `<ui5-title>` | `@ui5/webcomponents/dist/Title` | Заголовок-подсказка H1 |

### `<ui5-button>` (×3)

Стандартные кнопки UI5. Атрибут `onclick` вызывает методы `window.app` напрямую (не через Alpine).

```html
<ui5-button onclick="app.showUsernamePopup()">Change Name</ui5-button>
<ui5-button x-bind:class="{ '_shake': !roomExist }" onclick="app.createRoom()">Create Room</ui5-button>
<ui5-button onclick="app.leaveRoom()">Leave Room</ui5-button>
```

### `<ui5-toast>`

```html
<ui5-toast id="wcToastError" placement="TopCenter">Some error occurred</ui5-toast>
```

| Атрибут / свойство | Значение |
|--------------------|----------|
| `id` | `wcToastError` — глобальный идентификатор для `AppService.showError()` |
| `placement` | `TopCenter` — позиция в верхней центральной части экрана |
| Текст | `strings.OpaHeader.error` |
| Показ | `(window as any).wcToastError.show()` из `AppService` |

Toast размещён внутри header, но доступен глобально по `id` (элемент в light DOM документа).

### `<ui5-title>`

```html
<ui5-title level="H1" x-show="!roomExist">Create Room First</ui5-title>
```

| Атрибут | Значение |
|---------|----------|
| `level` | `H1` — семантический уровень заголовка |
| Видимость | Управляется Alpine `x-show="!roomExist"` |

---

## Взаимодействие с пользователем

### 1. Кнопка «Change Name»

| Параметр | Значение |
|----------|----------|
| **Действие пользователя** | Клик по кнопке |
| **Обработчик** | `onclick="app.showUsernamePopup()"` |
| **Результат** | Открывается диалог `opa-username-dialog` в компоненте `opa-username-popup`; в поле ввода подставляется текущее имя из `localStorage` |
| **Условия** | Доступна всегда (с комнатой и без) |

### 2. Кнопка «Create Room»

| Параметр | Значение |
|----------|----------|
| **Действие пользователя** | Клик по кнопке |
| **Обработчик** | `onclick="app.createRoom()"` |
| **Результат** | Генерируется UUID комнаты, выполняется редирект на `origin?room=<uuid>` |
| **Визуальная обратная связь** | При отсутствии комнаты (`!roomExist`) кнопка «трясётся» (класс `_shake`) |
| **После редиректа** | `AppService.init()` → `showRoom()` → `room-exist="true"` |

### 3. Кнопка «Leave Room»

| Параметр | Значение |
|----------|----------|
| **Действие пользователя** | Клик по кнопке |
| **Обработчик** | `onclick="app.leaveRoom()"` |
| **Результат** | `WsService.disconnect()`, очистка `roomId` и callbacks, редирект на `origin` без query-параметров |
| **После редиректа** | `AppService.init()` → `hideRoom()` → `room-exist="false"`, остальные панели скрыты |

### 4. Заголовок «Create Room First»

| Параметр | Значение |
|----------|----------|
| **Тип** | Информационный (не кликабельный) |
| **Видимость** | Только когда `roomExist` ложно |
| **Назначение** | Подсказка пользователю создать комнату перед использованием чата |

### 5. Toast ошибки

| Параметр | Значение |
|----------|----------|
| **Триггер** | Не пользователь — вызывается из `AppService` при ошибке WebSocket |
| **Метод показа** | `showError()` → `window.wcToastError.show()` |
| **Текст** | «Some error occurred» |
| **Закрытие** | Стандартное поведение `ui5-toast` (автоскрытие / клик пользователя по UI5) |

---

## Методы AppService через `window.app`

Глобальный объект создаётся в `main.ts`:

```typescript
(window as any).app = AppService;
```

В шаблоне `opa-header` вызываются **три метода** через inline-обработчики `onclick`:

### `app.showUsernamePopup()`

```typescript
const showUsernamePopup = (): void => {
    document.querySelector(".opa-username-component > ui5-input")!
        .setAttribute("value", getUserName() || "");
    const dialog: any = document.getElementById("opa-username-dialog");
    dialog.show();
}
```

| | |
|---|---|
| **Назначение** | Открыть popup смены имени |
| **Зависимости** | DOM-элементы из `opa-username-popup` |
| **Данные** | `localStorage.userName` |

### `app.createRoom()`

```typescript
const createRoom = (): void => {
    roomId = uuid();
    window.location.href = window.location.origin + "?room=" + roomId;
};
```

| | |
|---|---|
| **Назначение** | Создать новую комнату |
| **Побочные эффекты** | Полная перезагрузка страницы с новым URL |
| **После загрузки** | `init()` подключает WebSocket, `showRoom()` обновляет UI |

### `app.leaveRoom()`

```typescript
const leaveRoom = (): void => {
    WsService.disconnect();
    roomId = null;
    callbacks = [];
    window.location.href = window.location.origin;
};
```

| | |
|---|---|
| **Назначение** | Покинуть текущую комнату |
| **Побочные эффекты** | Отключение WS, очистка подписок, перезагрузка страницы |
| **После загрузки** | `init()` → `hideRoom()`, чат-панели скрыты |

### Косвенная связь: `showError()` (не через onclick)

```typescript
const showError = (): void => (window as any).wcToastError.show();
```

Вызывается из callback ошибки WebSocket в `AppService.connect()`. Использует `ui5-toast` с `id="wcToastError"`, размещённый внутри `opa-header`.

### Полный экспорт `AppService` (справочно)

Методы, **не** вызываемые напрямую из `opa-header`, но доступные через `window.app`:

`getRoomId`, `getUserId`, `getUserName`, `closeUsernamePopup`, `setNewUserId`, `setNewUserName`, `init`, `send`, `onStateChange`

---

## CSS-классы и стили

Стили определены в `client/src/style.css`.

### На host-элементе (в `index.html`)

| Класс | Источник | Назначение |
|-------|----------|------------|
| `area-a` | `index.html` | Привязка к CSS Grid: `grid-area: a` — верхняя строка на всю ширину |

```css
.area-a {
    grid-area: a;
}
```

Сетка `.opa-content-layout`:

```
grid-template-areas:
    "a a a"    ← opa-header (area-a)
    "b b d"
    "b b d"
    "c c d"
```

Высота строки `a`: `50px` (`grid-template-rows: 50px 1fr 1fr 50px`).

### Внутри шаблона

| Класс | Элемент | Назначение |
|-------|---------|------------|
| `opa-header` | `div` (корень шаблона) | Контейнер панели (правило пустое, зарезервировано для будущих стилей) |
| `_shake` | `ui5-button` «Create Room» | Анимация привлечения внимания, когда комната не создана |

### Анимация `_shake`

```css
.opa-header > ._shake {
    animation: shake 0.25s;
    animation-delay: 1s;
    animation-iteration-count: 5;
}

@keyframes shake {
    0%   { transform: rotate(0deg); }
    25%  { transform: rotate(5deg); }
    50%  { transform: rotate(0deg); }
    75%  { transform: rotate(-5deg); }
    100% { transform: rotate(0deg); }
}
```

| Параметр | Значение |
|----------|----------|
| Длительность одного цикла | 0.25 с |
| Задержка перед стартом | 1 с |
| Количество повторений | 5 |
| Эффект | Покачивание ±5° |

Селектор `.opa-header > ._shake` применяется только к **прямым потомкам** с классом `_shake` внутри `div.opa-header`.

---

## Пример HTML-использования

### Фактическое использование в проекте (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <title>OPA Boilerplate</title>
    <script type="module" src="/src/main.ts" defer></script>
</head>
<body>

<opa-username-popup></opa-username-popup>
<div class="opa-content-layout">
    <opa-header class="area-a"></opa-header>
    <opa-messages class="area-b"></opa-messages>
    <opa-send-control class="area-c"></opa-send-control>
    <opa-user-list class="area-d"></opa-user-list>
</div>

</body>
</html>
```

### Минимальный автономный пример

```html
<!DOCTYPE html>
<html>
<head>
    <script type="module" src="/src/main.ts"></script>
</head>
<body>
    <!-- Без room-exist: подсказка и тряска кнопки «Create Room» -->
    <opa-header></opa-header>

    <!-- С активной комнатой: подсказка скрыта, тряски нет -->
    <opa-header room-exist="true"></opa-header>
</body>
</html>
```

### Программное управление атрибутом

```javascript
const header = document.querySelector('opa-header');

// Комната создана
header.setAttribute('room-exist', 'true');

// Комнаты нет
header.setAttribute('room-exist', 'false');

// Удалить атрибут (эквивалент «нет комнаты»)
header.removeAttribute('room-exist');
```

### Результирующая разметка после рендеринга (пример)

При `room-exist="false"`:

```html
<opa-header class="area-a">
    <div class="opa-header" x-data="{ roomExist: false }">
        <ui5-button onclick="app.showUsernamePopup()">Change Name</ui5-button>
        <ui5-button class="_shake" onclick="app.createRoom()">Create Room</ui5-button>
        <ui5-button onclick="app.leaveRoom()">Leave Room</ui5-button>
        <ui5-toast id="wcToastError" placement="TopCenter">Some error occurred</ui5-toast>
        <ui5-title level="H1">Create Room First</ui5-title>
    </div>
</opa-header>
```

---

## Жизненный цикл компонента

### Диаграмма жизненного цикла

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Загрузка main.ts                                             │
│    ├── import alpinejs                                            │
│    ├── import UI5 components                                      │
│    ├── import opa-header.ts → customElements.define()             │
│    └── window.app = AppService; AppService.init()                 │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Парсинг HTML → обнаружен <opa-header class="area-a">          │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. connectedCallback() [первый раз]                              │
│    ├── rendered === false → rendered = true                       │
│    └── render()                                                   │
│         ├── params["room-exist"] = null (атрибут не задан)        │
│         ├── innerHTML = template(params)                          │
│         └── Alpine инициализирует div.opa-header                  │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. AppService.init()                                              │
│    ├── roomId из URL.searchParams.get("room")                     │
│    ├── roomId есть → showRoom() → setAttribute("room-exist", true)  │
│    └── roomId нет  → hideRoom() → setAttribute("room-exist", false) │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. attributeChangedCallback()                                     │
│    └── render() — полная перерисовка innerHTML                    │
│         └── Alpine переинициализируется на новом DOM                │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. Пользовательские действия / ошибки WS                          │
│    ├── Клики → window.app.*() → возможен location.href redirect   │
│    └── WS error → showError() → wcToastError.show()               │
└─────────────────────────────────────────────────────────────────┘
```

### Этапы подробно

#### 1. Регистрация Custom Element

Выполняется при импорте `opa-header.ts`. До этого момента `<opa-header>` в HTML — неизвестный элемент.

#### 2. `connectedCallback`

Наследуется из `AbstractComponent`. Вызывается браузером при вставке элемента в DOM.

- Срабатывает **только один раз** благодаря флагу `rendered`.
- Повторные перемещения элемента в DOM **не** вызывают повторный рендер через `connectedCallback`.

#### 3. `render()`

- Читает `room-exist` через `getAttribute`.
- Генерирует HTML из `template(params)`.
- Заменяет всё содержимое host-элемента (`innerHTML`).
- В консоль выводится: `Params for OpaHeader template: { "room-exist": ... }`.

#### 4. `attributeChangedCallback`

Вызывается при изменении `room-exist`. Каждый вызов → полный `render()`.

> **Важно:** При перерендере уничтожается предыдущий DOM, включая экземпляр Alpine и ссылку на `ui5-toast`. UI5-компоненты пересоздаются; `id="wcToastError"` снова доступен глобально после инициализации UI5.

#### 5. `disconnectedCallback`

Не реализован в `AbstractComponent` и `OpaHeader`. При удалении элемента из DOM специальной очистки нет.

### Сценарии перерендеринга

| Событие | Триггер `render()` |
|---------|-------------------|
| Первое появление в DOM | `connectedCallback` |
| `AppService.showRoom()` | `attributeChangedCallback` |
| `AppService.hideRoom()` | `attributeChangedCallback` |
| Ручной `setAttribute("room-exist", ...)` | `attributeChangedCallback` |
| Навигация `createRoom()` / `leaveRoom()` | Полная перезагрузка страницы → цикл с начала |

---

## Интеграция с AppService

`opa-header` — центральный, но пассивный участник управления видимостью комнаты:

```
URL (?room=uuid)
       │
       ▼
  AppService.init()
       │
       ├── roomId найден ──► showRoom()
       │                      ├── opa-messages: display block
       │                      ├── opa-send-control: display block
       │                      ├── opa-user-list: display block
       │                      └── opa-header: room-exist="true"
       │
       └── roomId нет ──────► hideRoom()
                              ├── opa-messages: display none
                              ├── opa-send-control: display none
                              ├── opa-user-list: display none
                              └── opa-header: room-exist="false"
```

`opa-header` не скрывается через `display`, а меняет внутреннее состояние UI (подсказка, анимация).

---

## Строки локализации

Все пользовательские тексты — в `client/src/app/strings.ts`, секция `OpaHeader`:

| Ключ | Значение (EN) | Элемент |
|------|---------------|---------|
| `changeName` | `"Change Name"` | Кнопка 1 |
| `createRoom` | `"Create Room"` | Кнопка 2 |
| `leaveRoom` | `"Leave Room"` | Кнопка 3 |
| `error` | `"Some error occurred"` | Toast |
| `createRoomFirst` | `"Create Room First"` | Заголовок H1 |

Для локализации достаточно изменить значения в `strings.OpaHeader`; компонент подхватит их при следующем `render()`.

---

## Зависимости и порядок загрузки

```
main.ts
├── alpinejs/dist/cdn.min.js          (глобальный Alpine)
├── @ui5/webcomponents/dist/Button
├── @ui5/webcomponents/dist/Title
├── @ui5/webcomponents/dist/Toast
├── ./app/components/opa-header.ts    (регистрация <opa-header>)
├── ./style.css                       (.opa-header, ._shake, .area-a)
├── AppService
│   └── обращается к opa-header по tag name
└── window.app = AppService
```

**Требования:**

- `opa-header` должен быть в DOM до вызова `AppService.init()` (в `main.ts` `init()` вызывается после импорта компонентов — порядок корректный).
- `opa-username-popup` должен существовать до `showUsernamePopup()` (в `index.html` объявлен выше layout).
- Alpine должен быть загружен до первого `render()`, чтобы обработать `x-data` / `x-show` / `x-bind:class`.

---

## Особенности реализации и ограничения

1. **Глобальные `onclick` и `window.app`** — обработчики завязаны на глобальную переменную; модульное тестирование шаблона затруднено без подмены `window.app`.

2. **Полный перерендер при смене атрибута** — `innerHTML` перезаписывается целиком; состояние UI5/Alpine не сохраняется между рендерами (для текущего UI это не критично).

3. **Строковая интерполяция `roomExist`** — значение атрибута вставляется в шаблон как литерал JavaScript (`true`/`false`/`null`), а не как строка в кавычках. Работает для `"true"`/`"false"`, но произвольные строки могут сломать `x-data`.

4. **Toast с фиксированным `id`** — `wcToastError` единственный на странице; дублирование `opa-header` приведёт к конфликту id.

5. **Пустое CSS-правило `.opa-header`** — класс зарезервирован; визуальное оформление панели определяется стилями UI5 и сеткой, не кастомными правилами контейнера.

6. **`getElementsByTagName("opa-header")[0]`** — `AppService` предполагает ровно один экземпляр компонента на странице.

7. **Кнопка «Leave Room» всегда активна** — даже без комнаты; `leaveRoom()` всё равно выполнит disconnect и редирект на origin.

---

## Сводная таблица

| Характеристика | Значение |
|----------------|----------|
| Тег | `<opa-header>` |
| Атрибуты | `room-exist` |
| Shadow DOM | Нет |
| Alpine | `x-data`, `x-bind:class`, `x-show` |
| UI5 | `ui5-button`, `ui5-toast`, `ui5-title` |
| `window.app` | `showUsernamePopup`, `createRoom`, `leaveRoom` |
| Косвенно | `wcToastError` ← `showError()` |
| CSS | `area-a`, `opa-header`, `_shake` |
| Файл | `client/src/app/components/opa-header.ts` |
