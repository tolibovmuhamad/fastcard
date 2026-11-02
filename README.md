# fastcart — интернет-магазин

Витрина интернет-магазина по макету из Figma: каталог с фильтрами, карточка товара, корзина, оформление заказа, избранное и личный кабинет. Данные приходят из REST API, интерфейс на трёх языках (английский, русский, таджикский), есть светлая и тёмная тема.

![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?logo=shadcnui&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38)

## Возможности

- **Главная.** Карусель, Flash Sales с таймером, категории, хиты продаж, новинки.
- **Каталог.** Сетка товаров, сортировка, фильтры по категориям, брендам, цене и рейтингу, подгрузка «ещё товаров», поиск из шапки.
- **Карточка товара.** Галерея, выбор цвета и размера, количество, «Купить сейчас», похожие товары.
- **Корзина.** Изменение количества, купон, итоговая сумма. Корзина сохраняется в браузере и переживает перезагрузку.
- **Оформление заказа.** Форма доставки, сводка, выбор способа оплаты (оплата — заглушка), экран успешного заказа.
- **Личный кабинет.** Профиль с редактированием через API, история заказов, избранное.
- **Авторизация.** Вход и регистрация по JWT, защищённые маршруты, роль читается из токена.
- **Три языка и тёмная тема** с переключателями в шапке. Выбор запоминается, при первом визите тема берётся из настроек системы.
- **Адаптив** под десктоп, планшет и телефон, ленивая загрузка страниц.

## Стек

React 19 · TypeScript · Vite · React Router · Zustand · Axios · Tailwind CSS v4 · shadcn/ui (Radix UI) · i18next · ESLint + Prettier

## Как устроено

- **Состояние в Zustand:** отдельные сторы для авторизации, корзины, избранного, заказов и темы.
- **Единый axios-клиент** подставляет токен в запросы и при `401` разлогинивает пользователя.
- **Страницы грузятся лениво** через `React.lazy`, каждая — отдельным чанком.
- **Типы моделей** описаны по Swagger API.

## Запуск

```bash
npm install
cp .env.example .env
npm run dev     # http://localhost:5173
```

API: [store-api.softclub.tj](https://store-api.softclub.tj/swagger/index.html), адрес задаётся переменной `VITE_API_BASE_URL`.

## Команды

| Команда | Что делает |
|---|---|
| `npm run dev` | Дев-сервер |
| `npm run build` | Проверка типов + прод-сборка |
| `npm run preview` | Предпросмотр сборки |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Структура

```
src/
  app/          корневой лейаут
  pages/        страницы (по одной на маршрут)
  components/   лейаут (шапка, подвал) и UI-компоненты shadcn
  store/        Zustand-сторы: auth, cart, favorites, orders, theme
  api/          axios-клиент и запросы
  i18n/         переводы en / ru / tj
  routes/       маршруты и защищённые роуты
```

Техническое задание — [TZ_fastcard.md](TZ_fastcard.md), план работ — [ROADMAP.md](ROADMAP.md).
