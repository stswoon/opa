# `opa-send-control` — панель ввода и отправки сообщений

## Обзор

`opa-send-control` — веб-компонент (Custom Element), отвечающий за ввод текста сообщения и его отправку в активную комнату чата. Компонент реализован в файле `client/src/app/components/opa-send-control.ts` и представляет собой нижнюю панель макета приложения: текстовое поле (`<textarea>`) и кнопку отправки на базе UI5 Web Components.

Компонент не хранит историю сообщений и не подписывается на изменения состояния приложения. Его единственная задача — собрать текст от пользователя и передать его в глобальный сервис `window.app` (экземпляр `AppService`), который далее отправляет данные по WebSocket.

```
┌─────────────────────────────────────────────────────────────────┐
│  Пользователь вводит текст в <textarea>                       │
│         │                                                       │
│         ├── Клик по ui5-button ──► window.app.send(msg)        │
│         │                                                       │
│         └── Ctrl+S в textarea ──► window.app.send(value)      │
│                     │                                           │
│                     ▼                                           │
│            AppService.send(message)                             │
│                     │                                           │
│                     ▼                                           │
│     WsService.send({ userId, text: message })                 │
│                     │                                           │
│                     ▼                                           │
│     WebSocket → сервер → обновление AppState → opa-messages     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Регистрация и подключение

### Custom Element

Компонент регистрируется в глобальном реестре браузера под именем `opa-send-control`:

```typescript
customElements.define("opa-send-control", OpaSendControl);
```

Класс `OpaSendControl` наследует абстрактный базовый класс `AbstractComponent`, который в свою очередь расширяет нативный `HTMLElement`. Это стандартный паттерн Web Components API: при первом подключении элемента к DOM вызывается `connectedCallback`, который один раз выполняет `render()`.

### Импорт в приложение

Модуль подключается как побочный эффект (side-effect import) в точке входа `client/src/main.ts`:

```typescript
import "./app/components/opa-send-control"
```

Регистрация происходит при загрузке модуля, до вызова `AppService.init()`.

### Размещение в разметке

В `client/index.html` компонент размещён внутри сеточного макета `.opa-content-layout` с CSS-классом `area-c` (нижняя строка, занимает две центральные колонки):

```html
<opa-send-control class="area-c"></opa-send-control>
```

Соседние компоненты в макете:

| Класс    | Компонент           | Зона сетки | Назначение                          |
|----------|---------------------|------------|-------------------------------------|
| `area-a` | `opa-header`        | Верх       | Заголовок, кнопки комнаты           |
| `area-b` | `opa-messages`      | Центр      | Лента сообщений                     |
| `area-c` | `opa-send-control`  | Низ        | Ввод и отправка сообщений           |
| `area-d` | `opa-user-list`     | Справа     | Список пользователей комнаты        |

---

## Архитектура и базовый класс

### `AbstractComponent`

`OpaSendControl` использует инфраструктуру `AbstractComponent` (`client/src/app/AbstractComponent.ts`):

- **Шаблон** — функция `templateTypeFunction`, возвращающая HTML-строку.
- **Рендер** — метод `render()` записывает результат шаблона в `innerHTML` элемента.
- **Жизненный цикл** — `connectedCallback` гарантирует однократный рендер при монтировании.
- **Атрибуты** — `OpaSendControl` не объявляет `observedAttributes`, поэтому перерисовка по атрибутам не используется.

`OpaSendControl` переопределяет `render()`:

1. Вызывает `super.render()` — вставляет шаблон в DOM.
2. Навешивает обработчик `keydown` на `<textarea>` для горячей клавиши Ctrl+S.

Это отличает компонент от, например, `opa-header`, который полностью полагается на шаблон и Alpine.js без дополнительных слушателей в `render()`.

### Зависимости модуля

| Зависимость              | Назначение                                      |
|--------------------------|-------------------------------------------------|
| `AbstractComponent`      | Базовый класс веб-компонента                    |
| `strings`                | Локализованные строки интерфейса                |
| Alpine.js (глобально)    | Реактивное связывание `x-model`, `x-bind`       |
| UI5 Button (глобально)   | Кнопка `<ui5-button>` (импорт в `main.ts`)      |
| `window.app` / AppService| Отправка сообщения, управление видимостью       |

---

## Шаблон и разметка

Полный шаблон компонента:

```html
<div class="opa-chat-controls" x-data="{msg:''}">
    <textarea x-model="msg"></textarea>
    <ui5-button
        x-bind:disabled="!msg"
        x-on:click="window.app.send(msg);msg='';"
        design="Emphasized"
    >Send</ui5-button>
</div>
```

Текст кнопки подставляется из `strings.OpaSendControl.send` (значение по умолчанию: `"Send"`).

### Контейнер `.opa-chat-controls`

Корневой `<div>` внутри shadowless-элемента (innerHTML напрямую в custom element):

- Инициализирует Alpine-контекст: `x-data="{msg:''}"`.
- Содержит единственное реактивное поле `msg` — текущий текст сообщения.
- Стилизуется как flex-контейнер с выравниванием по центру и зазором 10px (см. раздел «Стили»).

### `<textarea>`

- Стандартный HTML-элемент без атрибутов `placeholder`, `rows`, `maxlength`.
- Связан с Alpine через `x-model="msg"` — двустороннее связывание: ввод пользователя обновляет `msg`, изменение `msg` обновляет значение поля.
- Занимает всю доступную ширину и высоту контейнера (CSS: `width: 100%`, `height: 100%`).
- После отправки сообщения поле очищается (см. разделы «Кнопка отправки» и «Горячая клавиша Ctrl+S»).

### `<ui5-button>` (UI5 Web Components)

Кнопка из библиотеки SAP UI5 Web Components (`@ui5/webcomponents`). Глобальная регистрация тега выполняется в `main.ts`:

```typescript
import "@ui5/webcomponents/dist/Button";
```

Параметры кнопки в шаблоне:

| Атрибут / директива     | Значение                              | Описание                                           |
|-------------------------|---------------------------------------|----------------------------------------------------|
| `design`                | `"Emphasized"`                        | Акцентный (основной) стиль кнопки UI5               |
| `x-bind:disabled`       | `"!msg"`                              | Кнопка неактивна, пока `msg` — falsy               |
| `x-on:click`            | `window.app.send(msg);msg='';`        | Отправка и очистка поля                            |
| Текстовое содержимое    | `strings.OpaSendControl.send`         | Подпись «Send»                                     |

`design="Emphasized"` — визуально выделяет кнопку как главное действие на панели, в том же стиле, что и кнопка «Save» в `opa-username-popup`.

Фиксированная ширина кнопки задаётся CSS: `width: 100px`.

---

## Alpine.js: реактивность и `x-model`

Alpine.js подключается глобально в `main.ts`:

```typescript
import "alpinejs/dist/cdn.min.js"
```

### Контекст `x-data`

```javascript
{ msg: '' }
```

- `msg` — единственное реактивное свойство компонента ввода.
- Начальное значение — пустая строка.
- Используется и для привязки к textarea, и для условия `disabled` на кнопке.

### `x-model="msg"`

Директива `x-model` на `<textarea>` обеспечивает:

- **Ввод → состояние**: каждый символ, введённый пользователем, синхронизируется с `msg`.
- **Состояние → ввод**: при программном изменении `msg` (например, `msg=''` после клика) поле очищается.

Alpine создаёт внутренний объект `_x_model` на DOM-элементе с методом `set()` — этот механизм используется при очистке поля через Ctrl+S (см. ниже).

### `x-bind:disabled="!msg"`

Кнопка отправки **отключена** (атрибут `disabled`), когда выражение `!msg` истинно:

- Пустая строка `""` → кнопка disabled.
- Строка из пробелов `"   "` → кнопка **активна** (пробелы — truthy в JavaScript).
- Любой непустой текст → кнопка активна.

Это единственная форма «валидации» на уровне UI для клика по кнопке.

### `x-on:click`

Обработчик клика выполняет два действия в одном выражении:

1. `window.app.send(msg)` — отправляет текущее значение `msg` в AppService.
2. `msg=''` — сбрасывает реактивное состояние и очищает textarea через `x-model`.

Порядок важен: сначала отправка, затем очистка.

---

## Интеграция с `window.app.send`

### Глобальный объект `window.app`

В `main.ts` сервис приложения экспонируется в глобальную область:

```typescript
import { AppService } from "./app/services/AppService";
(window as any).app = AppService;
```

Шаблон обращается к `window.app.send` явно (в отличие от `opa-header`, где используется сокращение `app.createRoom()` без префикса `window.` — оба варианта эквивалентны в браузере).

### Метод `AppService.send`

```typescript
const send = (message: string): void =>
    WsService.send({ userId: getUserId(), text: message });
```

Поведение:

1. Берёт `userId` из `localStorage` (ключ `"userId"`). При первом запуске `init()` создаёт UUID, если id отсутствует.
2. Формирует объект `{ userId, text: message }`.
3. Передаёт его в `WsService.send`, который сериализует в JSON и отправляет через открытый WebSocket.

**Валидация на уровне AppService отсутствует**: пустые строки, пробелы и произвольный текст передаются на сервер без проверки. Единственное ограничение на стороне UI — `disabled` кнопки при пустом `msg` (не распространяется на Ctrl+S).

### Цепочка до сервера

```
OpaSendControl
    → window.app.send(text)
        → AppService.send(text)
            → WsService.send({ userId, text })
                → ws.send(JSON.stringify(...))
                    → GET /api/roomState?roomId=... (WebSocket)
```

WebSocket устанавливается в `AppService.connect()` только при наличии:

- параметра `room` в URL (`?room=<uuid>`);
- сохранённого имени пользователя в `localStorage` (`userName`).

Если соединение не установлено, вызов `WsService.send` может завершиться ошибкой (обращение к неинициализированному `ws`). Компонент `opa-send-control` это не обрабатывает.

### Отображение отправленных сообщений

После успешной обработки на сервере состояние комнаты (`AppState`) возвращается по WebSocket. Компонент `opa-messages` подписан на `AppService.onStateChange` и перерисовывает ленту. `opa-send-control` с этим потоком не связан напрямую.

---

## Горячая клавиша Ctrl+S

Помимо клика по кнопке, отправка реализована через обработчик клавиатуры, добавляемый в переопределённом `render()`:

```typescript
this.querySelector("textarea")!.addEventListener("keydown", e => {
    if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        (<any>window).app.send((<any>e.target).value);
        (<any>this.querySelector("textarea"))._x_model.set("")
    }
});
```

### Условие срабатывания

- `e.ctrlKey === true` — зажата клавиша Ctrl (на macOS в браузере обычно срабатывает Control, не Command).
- `e.key === "s"` — нажата клавиша S.

### Действия при срабатывании

1. **`e.preventDefault()`** — блокирует стандартное поведение браузера (сохранение страницы по Ctrl+S).
2. **`window.app.send(e.target.value)`** — отправляет **значение DOM-элемента** textarea, а не переменную Alpine `msg`. В нормальном режиме они синхронизированы через `x-model`, но теоретически могут расходиться при гонках или ручном вмешательстве в DOM.
3. **`_x_model.set("")`** — очищает поле через внутренний API Alpine.js. Закомментированная альтернатива `e.target.value = ""` не используется, так как не обновляет реактивное состояние `msg` и могла бы рассинхронизировать кнопку `disabled`.

### Отличия Ctrl+S от клика по кнопке

| Аспект              | Клик по `ui5-button`     | Ctrl+S в textarea              |
|---------------------|--------------------------|--------------------------------|
| Источник текста     | Alpine `msg`             | `e.target.value`               |
| Очистка поля        | `msg=''`                 | `_x_model.set("")`             |
| Проверка на пустоту | Кнопка disabled при `!msg` | **Нет проверки** — можно отправить пустую строку |
| Блокировка default  | Не требуется             | `preventDefault()`             |

Пользователь может отправить пустое сообщение сочетанием Ctrl+S, даже когда кнопка неактивна.

### Повторная привязка обработчика

`render()` вызывается только один раз (`AbstractComponent.connectedCallback` с флагом `rendered`). Обработчик `keydown` вешается единожды — дублирования слушателей нет.

При гипотетическом повторном `render()` (если бы компонент перерисовывался) старый textarea был бы уничтожен вместе с `innerHTML`, а новый получил бы новый слушатель. Текущая реализация `OpaSendControl` не вызывает повторный `render()`.

---

## Состояния disabled и видимости

### Disabled кнопки отправки

Кнопка `<ui5-button>` получает атрибут `disabled` через Alpine, когда `msg` является falsy-значением:

- Пустое поле → кнопка серая/неактивная, клик не обрабатывается.
- Непустой текст → кнопка активна.

**Textarea не имеет состояния disabled** — поле ввода всегда доступно, независимо от наличия комнаты или WebSocket-соединения (с точки зрения самого компонента).

### Видимость всего компонента

`OpaSendControl` не управляет своей видимостью изнутри. За это отвечает `AppService`:

**Показать** (пользователь в комнате, в URL есть `?room=...`):

```typescript
document.getElementsByTagName("opa-send-control")[0].style.display = "block";
```

**Скрыть** (комната не создана / пользователь не в комнате):

```typescript
document.getElementsByTagName("opa-send-control")[0].style.display = "none";
```

Функции `showRoom()` и `hideRoom()` вызываются из `init()` в зависимости от наличия query-параметра `room`. Одновременно переключаются `opa-messages`, `opa-user-list` и атрибут `room-exist` у `opa-header`.

По умолчанию в CSS для custom element явный `display` не задан; до вызова `init()` элемент может быть видимым в DOM, пока `AppService` не скроет его через `hideRoom()`.

### Отсутствующие состояния

В текущей реализации **не реализованы**:

- индикатор «отправка…» / loading;
- блокировка ввода при обрыве WebSocket;
- блокировка при отсутствии имени пользователя;
- визуальная обратная связь об ошибке отправки;
- `readonly` / `disabled` для textarea.

---

## Локализация (`strings.ts`)

Строки интерфейса вынесены в централизованный объект `strings` (`client/src/app/strings.ts`):

```typescript
export const strings = {
    // ...
    OpaSendControl: {
        send: "Send"
    },
    // ...
};
```

Использование в шаблоне:

```typescript
>${strings.OpaSendControl.send}</ui5-button>
```

Подход соответствует другим компонентам (`OpaHeader`, `OpaUsernamePopup`, `OpaUserList`). Для русификации достаточно изменить значение `send`, например, на `"Отправить"`. Перезагрузка приложения подхватит новую строку при следующем `render()` (при текущей архитектуре — при первой загрузке страницы).

---

## Стили

Стили определены в `client/src/style.css`.

### Позиция в сетке (`.area-c`)

```css
.area-c {
    grid-area: c;
}
```

Компонент занимает нижнюю строку центральной области макета `grid-template-areas`:

```
"a a a"
"b b d"
"b b d"
"c c d"
```

Высота строки с `area-c` задана как `50px` (`grid-template-rows: ... 50px`).

### Внутренний layout (`.opa-chat-controls`)

```css
.opa-chat-controls {
    display: flex;
    height: 100%;
    align-items: center;
    gap: 10px;
}

.opa-chat-controls > textarea {
    height: 100%;
    width: 100%;
}

.opa-chat-controls > ui5-button {
    width: 100px;
}
```

- Flex-ряд: textarea растягивается, кнопка фиксированной ширины 100px.
- Вертикальное выравнивание по центру.
- Отступ между полем и кнопкой — 10px.

Специфичных стилей для состояния `disabled` кнопки или фокуса textarea в проекте нет — используются стандартные стили браузера и тема UI5.

---

## Полный исходный код компонента

```typescript
import { AbstractComponent } from "../AbstractComponent";
import { strings } from "../strings";

const template = () => `
<div class="opa-chat-controls" x-data="{msg:''}">
    <textarea x-model="msg"></textarea>
    <ui5-button
        x-bind:disabled="!msg"
        x-on:click="window.app.send(msg);msg='';"
        design="Emphasized"
    >${strings.OpaSendControl.send}</ui5-button>
</div>
`;

class OpaSendControl extends AbstractComponent {
    constructor() {
        super(template);
    }

    protected render() {
        super.render();

        this.querySelector("textarea")!.addEventListener("keydown", e => {
            if (e.ctrlKey && e.key === "s") {
                e.preventDefault();
                (<any>window).app.send((<any>e.target).value);
                (<any>this.querySelector("textarea"))._x_model.set("")
            }
        });
    }
}

customElements.define("opa-send-control", OpaSendControl);
```

---

## Сравнение с другими компонентами OPA

| Характеристика              | `opa-send-control`        | `opa-messages`              | `opa-header`                |
|-----------------------------|---------------------------|-----------------------------|-----------------------------|
| Подписка на `onStateChange` | Нет                       | Да                          | Нет (атрибут `room-exist`)  |
| Вызов `AppService`          | `send` через `window.app` | `onStateChange` в конструкторе | Методы через `onclick` / Alpine |
| Переопределение `render()`  | Да (keydown)              | Да (автоскролл)             | Нет                         |
| `observedAttributes`        | Нет                       | Нет                         | `["room-exist"]`            |
| UI5-компоненты              | `ui5-button`              | Нет                         | `ui5-button`, `ui5-toast`, `ui5-title` |
| Alpine `x-data`             | `{ msg: '' }`             | `{ messages: [...] }`       | `{ roomExist: boolean }`    |

Паттерн «глобальный `window.app` + Alpine в шаблоне» согласован с `opa-header`. Паттерн «дополнительная логика в `render()` через `addEventListener`» ближе к `opa-username-popup` (валидация имени при сохранении).

---

## Сценарии использования

### Типичный сценарий

1. Пользователь открывает приложение, вводит имя (если первый визит).
2. Создаёт комнату → URL получает `?room=<uuid>` → `showRoom()` показывает `opa-send-control`.
3. Устанавливается WebSocket-соединение.
4. Пользователь вводит текст в textarea → кнопка «Send» становится активной.
5. Клик или Ctrl+S → сообщение уходит на сервер → появляется в `opa-messages`.

### Сценарий без комнаты

`hideRoom()` скрывает компонент (`display: none`). Панель ввода не отображается, пока пользователь не создаст комнату.

### Сценарий без имени пользователя

`AppService.init()` при отсутствии `userName` показывает диалог `opa-username-popup` и **прерывает** подключение к комнате (`return` до `connect()`). Компонент ввода может быть видимым (если есть `room` в URL), но WebSocket не подключён до сохранения имени.

---

## Формат отправляемого сообщения

Объект, уходящий в WebSocket:

```json
{
    "userId": "<uuid из localStorage>",
    "text": "<текст из textarea>"
}
```

Соответствие модели на клиенте (`AppStateModels.ts`): входящие сообщения имеют поля `id`, `text`, `userId`, `date`; исходящее сообщение от клиента содержит только `userId` и `text` — сервер дополняет метаданные.

---

## Ограничения и особенности реализации

1. **Два способа очистки поля** — клик использует Alpine `msg=''`, Ctrl+S — `_x_model.set("")`. Оба корректны при штатной работе Alpine 3.x, но подход разный.

2. **Внутренний API Alpine `_x_model`** — не документирован как публичный; при обновлении Alpine может потребоваться рефакторинг (например, единообразно использовать `msg=''` через доступ к Alpine-компоненту).

3. **Нет trim-валидации** — строка из одних пробелов считается валидной для отправки через кнопку.

4. **Ctrl+S без проверки пустоты** — обходит `disabled` кнопки.

5. **Нет защиты от двойной отправки** — быстрые повторные клики отправят несколько сообщений.

6. **Нет `observedAttributes`** — компонент не реагирует на HTML-атрибуты (в отличие от `opa-header` с `room-exist`).

7. **TypeScript `any`** — обращения к `window`, `e.target` и `_x_model` приведены через `(<any>)` для обхода типизации.

8. **Единственный экземпляр** — `AppService` обращается к `getElementsByTagName("opa-send-control")[0]`, предполагая один элемент на странице.

9. **Горячая клавиша только Ctrl+S** — Enter для отправки не реализован; Shift+Enter для новой строки в textarea работает по умолчанию.

---

## Возможные направления доработки

Ниже перечислены улучшения, **не реализованные** в текущем коде, но полезные при развитии компонента:

- Единый метод `submitMessage()` для клика и Ctrl+S с общей валидацией (`trim`, проверка на пустоту).
- Отправка по Enter (с Shift+Enter для переноса строки).
- Блокировка UI при `!WsService.isConnected` (потребуется расширить WsService).
- Локализация `placeholder` для textarea.
- Атрибут `maxlength` и счётчик символов.
- Использование публичного Alpine API вместо `_x_model`.
- Поддержка `aria-label` / доступности для кнопки и поля ввода.

---

## Связанные файлы

| Файл | Роль |
|------|------|
| `client/src/app/components/opa-send-control.ts` | Реализация компонента |
| `client/src/app/AbstractComponent.ts` | Базовый класс веб-компонентов |
| `client/src/app/strings.ts` | Строка подписи кнопки `OpaSendControl.send` |
| `client/src/app/services/AppService.ts` | `send()`, `showRoom()`, `hideRoom()`, `init()` |
| `client/src/app/services/WsService.ts` | Транспорт WebSocket |
| `client/src/app/services/AppStateModels.ts` | Типы `Message`, `AppState` |
| `client/src/main.ts` | Регистрация Alpine, UI5, `window.app` |
| `client/index.html` | Разметка `<opa-send-control class="area-c">` |
| `client/src/style.css` | Стили `.area-c`, `.opa-chat-controls` |
| `client/src/app/components/opa-messages.ts` | Отображение отправленных сообщений |

---

## Краткая справка

| Вопрос | Ответ |
|--------|-------|
| Тег custom element | `<opa-send-control>` |
| Класс | `OpaSendControl` |
| Отправка по клику | `window.app.send(msg)` + `msg=''` |
| Отправка с клавиатуры | **Ctrl+S** в textarea |
| Когда кнопка неактивна | `msg` пустая строка (`!msg`) |
| Когда компонент скрыт | Нет `?room=` в URL → `hideRoom()` |
| Текст кнопки | `strings.OpaSendControl.send` → `"Send"` |
| UI5-стиль кнопки | `design="Emphasized"` |
| Зависимость от Alpine | `x-data`, `x-model`, `x-bind:disabled`, `x-on:click` |
