# Компонент `opa-messages`

Документация по веб-компоненту отображения сообщений чата в приложении OPA (One-Page-App).

**Исходный файл:** `client/src/app/components/opa-messages.ts`

---

## Содержание

1. [Назначение и место в архитектуре](#назначение-и-место-в-архитектуре)
2. [Custom Element](#custom-element)
3. [Базовый класс AbstractComponent](#базовый-класс-abstractcomponent)
4. [Подписка на состояние через AppService.onStateChange](#подписка-на-состояние-через-appserviceonstatechange)
5. [Модели данных AppStateModels](#модели-данных-appstatemodels)
6. [Логика преобразования и рендеринга сообщений](#логика-преобразования-и-рендеринга-сообщений)
7. [Шаблон Alpine.js и директива x-for](#шаблон-alpinejs-и-директива-x-for)
8. [Форматирование даты](#форматирование-даты)
9. [Системные сообщения](#системные-сообщения)
10. [Поведение автоскролла](#поведение-автоскролла)
11. [Пустое состояние (empty state)](#пустое-состояние-empty-state)
12. [Стилизация](#стилизация)
13. [Использование в HTML и жизненный цикл видимости](#использование-в-html-и-жизненный-цикл-видимости)
14. [Поток данных от сервера до DOM](#поток-данных-от-сервера-до-dom)
15. [Примеры кода](#примеры-кода)
16. [Ограничения и особенности реализации](#ограничения-и-особенности-реализации)

---

## Назначение и место в архитектуре

`opa-messages` — это **кастомный HTML-элемент**, отвечающий за отображение ленты сообщений комнаты чата. Компонент:

- не запрашивает данные самостоятельно;
- подписывается на глобальное состояние приложения через `AppService.onStateChange`;
- получает актуальный снимок комнаты (`AppState`) при каждом обновлении по WebSocket;
- преобразует «сырые» сообщения сервера в представление, удобное для UI;
- перерисовывает DOM и прокручивает ленту к последнему сообщению.

В разметке приложения компонент занимает центральную область сетки (`area-b`) рядом с полем ввода (`opa-send-control`) и списком пользователей (`opa-user-list`).

```
┌─────────────────────────────────────────────────────────┐
│                      opa-header                         │
├───────────────────────────────────────┬─────────────────┤
│                                       │                 │
│           opa-messages                │  opa-user-list  │
│         (лента сообщений)             │                 │
│                                       │                 │
├───────────────────────────────────────┤                 │
│         opa-send-control              │                 │
└───────────────────────────────────────┴─────────────────┘
```

---

## Custom Element

### Регистрация

Компонент регистрируется в глобальном реестре браузера под именем `opa-messages`:

```typescript
customElements.define("opa-messages", OpaMessages);
```

После импорта модуля в `main.ts`:

```typescript
import "./app/components/opa-messages"
```

элемент `<opa-messages>` становится доступен в HTML так же, как встроенные теги.

### Класс OpaMessages

```typescript
class OpaMessages extends AbstractComponent {
    constructor() {
        super(template, { messages: [] });
        // подписка на AppService...
    }

    render() {
        super.render();
        // автоскролл...
    }
}
```

| Свойство | Значение |
|----------|----------|
| Тег | `opa-messages` |
| Базовый класс | `AbstractComponent` (наследует `HTMLElement`) |
| Начальное состояние | `{ messages: [] }` |
| Атрибуты (`observedAttributes`) | не переопределены — компонент не реагирует на HTML-атрибуты |
| Shadow DOM | не используется — разметка пишется напрямую в `innerHTML` |

### Подключение в index.html

```html
<div class="opa-content-layout">
    <opa-header class="area-a"></opa-header>
    <opa-messages class="area-b"></opa-messages>
    <opa-send-control class="area-c"></opa-send-control>
    <opa-user-list class="area-d"></opa-user-list>
</div>
```

Класс `area-b` задаёт позицию в CSS Grid (`grid-area: b`) и растягивает блок сообщений на две строки сетки.

---

## Базовый класс AbstractComponent

`OpaMessages` наследует общую инфраструктуру из `client/src/app/AbstractComponent.ts`.

### Жизненный цикл рендеринга

1. **`connectedCallback`** — при первом добавлении элемента в DOM вызывается `render()` один раз (`rendered` флаг предотвращает повтор).
2. **`render()`** — собирает параметры шаблона из HTML-атрибутов и `this.state`, затем устанавливает `this.innerHTML = this.template(params)`.
3. **`attributeChangedCallback`** — при изменении наблюдаемых атрибутов (для `OpaMessages` список пуст) снова вызывает `render()`.

```typescript
protected render() {
    let params: any = {};
    const observedAttributes = (this.constructor as any).observedAttributes;
    for (let attribute of observedAttributes) {
        params[attribute] = this.getAttribute(attribute);
    }
    params = { ...params, ...this.state };
    this.innerHTML = this.template(params);
}
```

Для `opa-messages` в шаблон попадает только `this.state.messages`, так как наблюдаемых атрибутов нет.

### Функция шаблона

Шаблон — это обычная JavaScript-функция, возвращающая HTML-строку:

```typescript
const template = ({ messages }) => {
    messages = JSON.stringify(messages || []);
    return `...`;
};
```

Параметр `messages` сериализуется в JSON и встраивается в атрибут Alpine `x-data`, что позволяет передать массив объектов в реактивное состояние Alpine.js.

---

## Подписка на состояние через AppService.onStateChange

### Механизм AppService

`AppService` (`client/src/app/services/AppService.ts`) реализует простой **pub/sub** для состояния комнаты:

```typescript
let callbacks: Function[] = [];

const processStateChange = (appState: AppState): void =>
    callbacks.forEach(callback => callback(appState));

const onStateChange = (callback: Function): any => {
    callbacks.push(callback);
    return {
        unsubscribe: () => callbacks = callbacks.filter(item => item != callback)
    };
};
```

| Этап | Что происходит |
|------|----------------|
| WebSocket получает JSON | `WsService` вызывает `wsRoomCallback.message` |
| Парсинг состояния | `AppService.connect` → `processStateChange(state)` |
| Рассылка подписчикам | каждый callback получает объект `AppState` |
| OpaMessages | обновляет `this.state.messages` и вызывает `this.render()` |

### Код подписки в конструкторе OpaMessages

```typescript
AppService.onStateChange((appState: AppState) => {
    const messages = appState.messages.map(msg => {
        let user = appState.users.find(user => user.id === msg.userId);
        let userName = user ? user.name : msg.userId;
        return {
            author: userName,
            text: msg.text,
            date: (new Date(msg.date)).toLocaleTimeString(),
            system: msg.userId === "_system"
        };
    });
    this.state.messages = messages || [];
    this.render();
});
```

**Важные детали:**

- Подписка создаётся **в конструкторе** и живёт до перезагрузки страницы.
- Метод `onStateChange` возвращает объект с `unsubscribe`, но `OpaMessages` **не вызывает отписку** при удалении элемента из DOM.
- При каждом изменении состояния комнаты (новое сообщение, вход/выход пользователя, смена имени) сервер рассылает полный снимок `Room`/`AppState`, и компонент перерисовывает **всю** ленту заново.
- Видимость компонента управляется отдельно: `AppService.showRoom()` / `hideRoom()` меняют `style.display` у первого `<opa-messages>` на странице.

---

## Модели данных AppStateModels

Файл: `client/src/app/services/AppStateModels.ts`

### User

```typescript
export interface User {
    id: string;
    name: string;
    active: boolean;
}
```

### Message (сырое сообщение с сервера)

```typescript
export interface Message {
    id: string;
    text: string;
    userId: string;
    date: string; // milisec — комментарий в коде; фактически сервер шлёт number
}
```

### AppState

```typescript
export interface AppState {
    users: User[];
    messages: Message[]; // last 5 min messages — задумка; на сервере пока без фильтрации
}
```

### View-модель сообщения (внутри OpaMessages)

Компонент не использует интерфейс TypeScript для view-модели, но фактически создаёт объекты такого вида:

| Поле | Тип | Источник |
|------|-----|----------|
| `author` | `string` | `users.find(u => u.id === msg.userId).name` или fallback `msg.userId` |
| `text` | `string` | `msg.text` |
| `date` | `string` | `(new Date(msg.date)).toLocaleTimeString()` |
| `system` | `boolean` | `msg.userId === "_system"` |

---

## Логика преобразования и рендеринга сообщений

### Шаг 1: сопоставление автора

```typescript
let user = appState.users.find(user => user.id === msg.userId);
let userName = user ? user.name : msg.userId;
```

- Если пользователь найден в `appState.users`, отображается его **имя** (`name`).
- Если нет (например, пользователь уже удалён, но сообщение осталось), показывается **идентификатор** (`userId`).

### Шаг 2: определение системного сообщения

```typescript
system: msg.userId === "_system"
```

На сервере (`roomService.ts`) системные события записываются с `userId: "_system"`:

- `"User \"{userId}\" was added"` — при первом входе пользователя;
- `"user \"{userId}\" left the room"` — при окончательном выходе.

### Шаг 3: полная перерисовка

```typescript
this.state.messages = messages || [];
this.render();
```

Каждое обновление состояния:

1. Заменяет массив сообщений в `this.state`.
2. Вызывает `super.render()` → новый `innerHTML` с актуальным JSON в `x-data`.
3. Alpine.js инициализируется заново на новом DOM (CDN-версия подключена глобально в `main.ts`).

---

## Шаблон Alpine.js и директива x-for

Alpine.js подключается в `main.ts`:

```typescript
import "alpinejs/dist/cdn.min.js"
```

### Полный шаблон

```html
<div class="opa-messages" x-data='{ messages : [...] }'>
    <template x-for="message in messages">
        <div class="opa-messages_item" x-bind:class="{ '_system': message.system }">
            <span class="opa-messages_item-date" x-text="message.date"></span>
            <span class="opa-messages_item-author" x-text="message.author"></span>
            <span class="opa-messages_item-delimiter">:</span>
            <span class="opa-messages_item-text" x-text="message.text"></span>
        </div>
    </template>
</div>
```

### Разбор директив Alpine

| Директива | Назначение |
|-----------|------------|
| `x-data='{ messages : ... }'` | Локальное реактивное состояние; массив вставляется через `JSON.stringify` |
| `x-for="message in messages"` | Итерация по массиву; для каждого элемента создаётся блок `.opa-messages_item` |
| `x-bind:class="{ '_system': message.system }"` | Условный CSS-класс `_system` для системных сообщений |
| `x-text="message.date"` | Текстовое содержимое span без интерпретации HTML |
| `x-text="message.author"` | Имя автора |
| `x-text="message.text"` | Тело сообщения |

### Почему JSON.stringify в x-data

```typescript
messages = JSON.stringify(messages || []);
return `
    <div class="opa-messages" x-data='{ messages : ${messages} }'>
```

Атрибут `x-data` — строка в одинарных кавычках. Массив объектов нужно сериализовать в валидный JSON, чтобы Alpine получил JavaScript-массив при инициализации. Fallback `|| []` гарантирует пустой массив вместо `undefined`.

### Структура одного сообщения в DOM

```
.opa-messages_item
├── .opa-messages_item-date      → "14:32:05"
├── .opa-messages_item-author    → "Alice"
├── .opa-messages_item-delimiter → ":"
└── .opa-messages_item-text      → "Привет!"
```

Для системного сообщения класс `_system` скрывает автора и меняет оформление (см. [Стилизация](#стилизация)).

---

## Форматирование даты

```typescript
date: (new Date(msg.date)).toLocaleTimeString()
```

| Аспект | Описание |
|--------|----------|
| Входное значение | `msg.date` — метка времени с сервера (миллисекунды с эпохи Unix) |
| Преобразование | конструктор `Date` принимает number или string |
| Вывод | локализованное **время** без даты, например `14:32:05` или `2:32:05 PM` в зависимости от локали браузера |
| Часовой пояс | локальный часовой пояс пользователя |

**Пример:**

```typescript
const msg = { date: 1720709520000 }; // серверное значение
(new Date(msg.date)).toLocaleTimeString();
// ru-RU: "14:32:00"
// en-US: "2:32:00 PM"
```

Дата **не** форматируется через `Intl.DateTimeFormat` явно — используется стандартное поведение `toLocaleTimeString()` без аргументов локали, поэтому формат зависит от настроек браузера.

---

## Системные сообщения

Системные сообщения — особый тип записей в ленте.

### Условие

```typescript
system: msg.userId === "_system"
```

### Отличия в UI

При `system === true`:

1. На элемент `.opa-messages_item` добавляется модификатор `._system`.
2. CSS центрирует текст, уменьшает шрифт, делает цвет серым.
3. Блок `.opa-messages_item-author` **скрыт** (`display: none`), поэтому видны только дата и текст (разделитель `:` остаётся).

Пример отображения системного сообщения:

```
        14:30:01 : User "abc-123" was added
```

(автор не показывается, строка визуально центрирована)

---

## Поведение автоскролла

После каждого рендера компонент прокручивает контейнер сообщений к низу:

```typescript
render() {
    super.render();
    setTimeout(() => {
        let objDiv = document.querySelector(".opa-messages")!;
        objDiv.scrollTop = objDiv.scrollHeight;
    }, 0);
}
```

### Как это работает

| Шаг | Действие |
|-----|----------|
| 1 | `super.render()` заменяет `innerHTML` — DOM пересоздаётся |
| 2 | `setTimeout(..., 0)` откладывает скролл до следующего тика event loop |
| 3 | Браузер успевает рассчитать `scrollHeight` после отрисовки Alpine `x-for` |
| 4 | `scrollTop = scrollHeight` прокручивает `.opa-messages` к последнему сообщению |

### Контейнер скролла

Скроллится элемент `.opa-messages` (не сам custom element `<opa-messages>`):

```css
.opa-messages {
    border: 1px solid black;
    overflow: auto;
    height: 100%;
}
```

`height: 100%` заполняет ячейку grid; при переполнении появляется вертикальная полоса прокрутки.

### Особенности

- Скролл выполняется **при каждом** обновлении состояния, в том числе при входе/выходе пользователей (не только при новых сообщениях).
- Используется `document.querySelector(".opa-messages")` — **глобальный** селектор. На странице предполагается один экземпляр; при нескольких компонентах прокрутится только первый найденный.
- Пользователь не может «удержать» позицию просмотра при чтении истории — любое обновление состояния снова прокрутит вниз.

---

## Пустое состояние (empty state)

### Текущее поведение

Явного UI для пустой ленты **нет**. При `messages: []`:

- контейнер `.opa-messages` рендерится с пустым `x-data`;
- директива `x-for` не создаёт ни одного `.opa-messages_item`;
- пользователь видит **пустой прямоугольник** с рамкой (стили `.opa-messages`).

```typescript
super(template, { messages: [] }); // начальное состояние
```

До подключения к комнате или до первого WebSocket-сообщения лента пуста. Компонент скрыт (`display: none`), пока пользователь не в комнате (`AppService.hideRoom()`).

### Когда лента снова пуста

На практике после входа в комнату массив сообщений обычно уже содержит системные записи о пользователях. Полностью пустой массив возможен только на свежей комнате до первого события.

### Как добавить empty state (рекомендация)

Alpine позволяет добавить блок без изменения TypeScript:

```html
<template x-if="messages.length === 0">
    <div class="opa-messages_empty">Сообщений пока нет</div>
</template>
<template x-for="message in messages">
    ...
</template>
```

Сейчас такой разметки в исходнике нет — это задокументированное отсутствие функциональности, а не скрытая логика.

---

## Стилизация

Файл: `client/src/style.css`

```css
.opa-messages {
    border: 1px solid black;
    overflow: auto;
    height: 100%;
}

.opa-messages_item {
    display: flex;
    padding-bottom: 5px;
}

.opa-messages_item > span {
    padding-right: 3px;
}

.opa-messages_item-date {
    color: gray;
}

.opa-messages_item-author {
    font-weight: bold;
}

.opa-messages_item._system {
    font-size: x-small;
    color: gray;
    justify-content: center;
}

.opa-messages_item._system > .opa-messages_item-author {
    display: none;
}
```

| Класс | Визуальный эффект |
|-------|-------------------|
| `.opa-messages` | Рамка, прокрутка, заполнение высоты ячейки |
| `.opa-messages_item` | Flex-строка, отступ снизу 5px |
| `.opa-messages_item-date` | Серый цвет времени |
| `.opa-messages_item-author` | Жирное имя |
| `._system` | Мелкий серый центрированный текст |
| `._system .opa-messages_item-author` | Скрыт |

---

## Использование в HTML и жизненный цикл видимости

### Показ и скрытие

`AppService` управляет видимостью при наличии параметра `?room=` в URL:

```typescript
const showRoom = (): void => {
    document.getElementsByTagName("opa-messages")[0].style.display = "block";
    // ...
};

const hideRoom = (): void => {
    document.getElementsByTagName("opa-messages")[0].style.display = "none";
    // ...
};
```

| Состояние | `display` | Содержимое |
|-----------|-----------|------------|
| Нет комнаты | `none` | компонент в DOM, но не виден |
| Комната активна | `block` | лента обновляется по WebSocket |

Компонент **не удаляется** из DOM при выходе из комнаты — только скрывается.

---

## Поток данных от сервера до DOM

```
┌──────────────┐     WebSocket      ┌─────────────┐
│ RoomService  │ ─────────────────► │  WsService  │
│  (server)    │   JSON Room state  │  (client)   │
└──────────────┘                    └──────┬──────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │   AppService    │
                                  │ processStateChange
                                  └────────┬────────┘
                                           │ onStateChange callbacks
                                           ▼
                                  ┌─────────────────┐
                                  │  OpaMessages    │
                                  │ map + render()  │
                                  └────────┬────────┘
                                           │ innerHTML + Alpine x-for
                                           ▼
                                  ┌─────────────────┐
                                  │  DOM .opa-messages
                                  └─────────────────┘
```

### Отправка сообщения пользователем (обратный путь)

```
opa-send-control → AppService.send(text)
    → WsService.send({ userId, text })
    → server RoomService.messageFromUser
    → addMessage + broadcastRoomState
    → все клиенты получают обновлённый AppState
    → OpaMessages перерисовывается
```

---

## Примеры кода

### Минимальное использование в HTML

```html
<opa-messages class="area-b"></opa-messages>
```

Достаточно наличия тега после импорта модуля. Дополнительная инициализация не требуется.

### Пример входящего AppState с сервера

```json
{
  "users": [
    { "id": "user-1", "name": "Алиса", "active": true },
    { "id": "user-2", "name": "Боб", "active": true }
  ],
  "messages": [
    {
      "id": "msg-1",
      "text": "User \"user-1\" was added",
      "userId": "_system",
      "date": 1720709400000
    },
    {
      "id": "msg-2",
      "text": "Привет, комната!",
      "userId": "user-1",
      "date": 1720709520000
    }
  ]
}
```

### Результат преобразования в OpaMessages

```javascript
[
  {
    author: "_system", // fallback: пользователь _system не в users
    text: "User \"user-1\" was added",
    date: "14:30:00",
    system: true
  },
  {
    author: "Алиса",
    text: "Привет, комната!",
    date: "14:32:00",
    system: false
  }
]
```

> **Примечание:** для системных сообщений `author` технически заполняется строкой `"_system"`, но в DOM автор скрыт CSS-классом `._system`.

### Подписка на состояние в другом компоненте (аналогичный паттерн)

```typescript
import { AppService } from "../services/AppService";
import { AppState } from "../services/AppStateModels";

const subscription = AppService.onStateChange((appState: AppState) => {
    console.log("Новое состояние:", appState.messages.length, "сообщений");
});

// при необходимости отписаться:
subscription.unsubscribe();
```

### Программная проверка автоскролла

```javascript
const container = document.querySelector(".opa-messages");
const atBottom =
    container.scrollTop + container.clientHeight >= container.scrollHeight - 1;
console.log("Прокрутка внизу:", atBottom);
```

### Создание тестового сообщения (сервер)

```typescript
// server/src/services/roomService.ts
this.addMessage(`User "${userId}" was added`, "_system");
this.addMessage(parsedMsg.text, parsedMsg.userId);
```

---

## Ограничения и особенности реализации

| Тема | Описание |
|------|----------|
| Полная перерисовка | Каждое обновление заменяет весь `innerHTML`; Alpine переинициализируется. Для длинных лент возможны мерцания и потеря фокуса. |
| Нет виртуализации | Все сообщения из `AppState` рендерятся в DOM без пагинации. |
| Глобальный querySelector | Автоскролл ищет `.opa-messages` в документе, а не внутри `this`. |
| Нет отписки | Callback `onStateChange` не удаляется при `disconnectedCallback`. |
| Тип `date` | В `AppStateModels` указан `string`, сервер (`roomModels.ts`) использует `number`. `new Date()` обрабатывает оба варианта. |
| Фильтр «5 минут» | Комментарий в `AppStateModels` описывает задумку; `RoomService` пока хранит все сообщения без обрезки. |
| XSS | Текст выводится через `x-text` (экранирование Alpine), не через `innerHTML` сообщения — относительно безопасно. |
| Локализация | Формат времени зависит от браузера; явная локаль `ru-RU` не задана. |
| Empty state | Нет текста-заглушки для пустой ленты. |
| Множественные экземпляры | Архитектура рассчитана на один `<opa-messages>` на странице. |

---

## Связанные файлы

| Файл | Роль |
|------|------|
| `client/src/app/components/opa-messages.ts` | Реализация компонента |
| `client/src/app/AbstractComponent.ts` | Базовый класс веб-компонентов |
| `client/src/app/services/AppService.ts` | Pub/sub состояния, видимость комнаты |
| `client/src/app/services/AppStateModels.ts` | TypeScript-интерфейсы клиента |
| `client/src/app/services/WsService.ts` | WebSocket-транспорт |
| `client/src/main.ts` | Импорт Alpine.js и компонента |
| `client/index.html` | Разметка страницы |
| `client/src/style.css` | Стили ленты сообщений |
| `server/src/services/roomService.ts` | Генерация и рассылка сообщений |

---

## Краткая справка

```html
<!-- Разметка -->
<opa-messages class="area-b"></opa-messages>
```

```typescript
// Ключевые зависимости
import { AppService } from "../services/AppService";
import { AppState } from "../services/AppStateModels";
import { AbstractComponent } from "../AbstractComponent";

// Регистрация
customElements.define("opa-messages", OpaMessages);
```

**Поведение в одном предложении:** компонент подписывается на `AppService.onStateChange`, преобразует сообщения комнаты в view-модель с автором и локальным временем, рендерит список через Alpine `x-for` и после каждой перерисовки прокручивает `.opa-messages` к последнему сообщению.
