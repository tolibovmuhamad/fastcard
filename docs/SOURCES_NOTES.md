# Сверка с источниками истины — результаты Этапа 0

Документ фиксирует то, что подтверждено по **Swagger** (`https://store-api.softclub.tj/swagger/v1/swagger.json`)
и по **макету Figma** (`C:\Users\XBIT-2025\Desktop\figma`). Это закрывает пометки «сверить со Swagger» из ТЗ.
Дата сверки: 2026-06-24.

Базовый адрес API: `https://store-api.softclub.tj`

---

## 1. Эндпоинты API (подтверждено по Swagger)

### Account (авторизация)
- `POST /Account/register` — регистрация
- `POST /Account/login` — вход

### Product
- `GET /Product/get-products` — список/поиск/фильтрация
- `GET /Product/get-product-by-id` — детали товара
- `POST /Product/add-product` — создать (multipart, с изображениями)
- `PUT /Product/update-product` — изменить
- `POST /Product/add-image-to-product` — добавить изображение
- `DELETE /Product/delete-image-from-product` — удалить изображение
- `DELETE /Product/delete-product` — удалить

Параметры `GET /Product/get-products` (все необязательные):
`UserId` (string), `ProductName` (string), `MinPrice` (double), `MaxPrice` (double),
`BrandId` (int), `ColorId` (int), `CategoryId` (int), `SubcategoryId` (int),
`PageNumber` (int), `PageSize` (int).

### Category / SubCategory
- `GET /Category/get-categories`, `GET /Category/get-category-by-id`,
  `POST /Category/add-category` (с изображением), `PUT /Category/update-category`, `DELETE /Category/delete-category`
- `GET /SubCategory/get-sub-category`, `GET /SubCategory/get-sub-category-by-id`,
  `POST /SubCategory/add-sub-category`, `PUT /SubCategory/update-sub-category`, `DELETE /SubCategory/delete-sub-category`

### Brand / Color
- Полный CRUD: `get-brands` / `get-brand-by-id` / `add-brand` / `update-brand` / `delete-brand`
- Полный CRUD: `get-colors` / `get-color-by-id` / `add-color` / `update-color` / `delete-color`

### Cart (корзина — на стороне сервера!)
- `GET /Cart/get-products-from-cart`
- `POST /Cart/add-product-to-cart`
- `PUT /Cart/increase-product-in-cart`
- `PUT /Cart/reduce-product-in-cart`
- `DELETE /Cart/delete-product-from-cart`
- `DELETE /Cart/clear-cart`

### UserProfile (профиль и роли)
- `GET /UserProfile/get-user-profiles` (пагинация)
- `GET /UserProfile/get-user-profile-by-id`
- `PUT /UserProfile/update-user-profile` (multipart, с изображением)
- `DELETE /UserProfile/delete-user`
- `POST /UserProfile/addrole-from-user` — назначить роль
- `DELETE /UserProfile/remove-role-from-user` — снять роль
- `GET /UserProfile/get-user-roles` — список ролей

Все эндпоинты требуют Bearer-токен (JWT).

---

## 2. Модели данных (подтверждено по Swagger)

- **RegisterDto** (обязательные): `userName`, `phoneNumber`, `email`, `password`, `confirmPassword`
- **LoginDto** (обязательные): `userName`, `password`
- **Product**: `ProductName` (≤100), `Description` (≤500), `Code`, `Price` (double), `Quantity` (int),
  `Weight`, `Size`, `HasDiscount` (bool), `DiscountPrice` (double?), `BrandId`, `ColorId`, `SubCategoryId`, `Images` (binary[])
- **Category**: `CategoryName`, `CategoryImage` (binary)
- **SubCategory**: `SubCategoryName`, `CategoryId`
- **Brand**: `BrandName`
- **Color**: `ColorName`
- **UserProfile**: `FirstName`, `LastName`, `Email`, `PhoneNumber`, `Dob` (date), `Image` (binary), `Roles`

> Точные TypeScript-типы будут описаны в `src/types/` при настройке проекта (Этап 1) и уточнены
> по фактическим ответам API.

---

## 3. ❗ Чего НЕТ в API (важно для объёма)

- **Нет эндпоинтов заказов / checkout / оплаты / истории заказов.** В Swagger отсутствуют любые
  Order/Checkout/Payment/Purchase.
  → Оформление заказа (ТЗ 6.5, roadmap 4.3) и экран успеха (4.4) — только **заглушка** на фронте
    (согласуется с тем, что оплата по ТЗ — заглушка).
  → «My Order» / история заказов (есть в навигации макета и в roadmap 5.4) и **управление заказами в
    админке (roadmap 6.4)** — **бэкенда нет**. Нужно решение: мок на фронте или вынести из рамок.
- **Нет refresh-токена.** При `401` → logout + редирект на вход (refresh-ветку не делаем).
- **Нет OAuth / «Sign up with Google».** На макете входа его тоже нет → исключаем из рамок.
- **Нет сброса пароля.** На макете входа есть ссылка «Forget Password?», но эндпоинта нет
  → ссылка-заглушка (disabled/«в разработке») либо вне рамок.
- **Нет отдельного эндпоинта избранного / wishlist.** Экран Wishlist в макете есть
  → `favoritesStore` хранить на клиенте (localStorage). (Возможна связь через параметр `UserId`
    в `get-products` — проверить опытным путём при реализации.)

---

## 4. Авторизация / JWT — что осталось проверить на этапе интеграции

- **Тело ответа `POST /Account/login` в Swagger не описано** (`200: Success` без схемы).
  Реальную форму ответа (где access-токен, как называется поле) проверить запросом при реализации Этапа 2.
- **Поле роли в JWT** — точное название claim неизвестно из Swagger. Декодировать токен при первом
  входе и зафиксировать (роли управляются через `UserProfile/get-user-roles` и `addrole-from-user`).
- Вход по `userName` + `password` (а не по email). На макете поле подписано «Email or phone number» —
  расхождение с `LoginDto.userName`; уточнить, что именно принимает бэкенд.

---

## 5. Корзина: сервер vs localStorage

API имеет **серверную корзину** (`/Cart/*`, требует авторизацию), а ТЗ/CLAUDE.md предписывают
`cartStore` + localStorage (корзина гостя переживает сессии). Предлагаемая схема:
- **Гость** — корзина в localStorage (сервер недоступен без токена).
- **Авторизован** — синхронизация с серверной корзиной `/Cart/*` (и слияние локальной при входе).

Финальное решение принять в начале Этапа 4.

---

## 6. Макет Figma — состав экранов (подтверждено)

13 экспортов = **12 уникальных экранов** (совпадает с CLAUDE.md):
HomePage (2 секции-экспорта), Products (каталог), Product Details, Cart, CheckOut, Account (кабинет),
Wishlist, Log In, Sign Up, Contact, About, 404 Error.

Брендинг на макете:
- **Логотип в шапке: `fastcart`** (строчными, с иконкой тележки).
- В подвале блок назван «Exclusive», копирайт «Rimel 2022» (это рудименты исходного шаблона).

Навигация (шапка): Home · Contact · About · Sign Up · поиск · избранное · корзина.
Дропдаун аккаунта: Account · My Order · Logout.
Подвал: Account (My Account, Cart, Wishlist, Shop) · Quick Link (Privacy Policy, Terms Of Use, FAQ, Contact).

> Экраны из навигации/подвала **без отдельного макета**: My Order (история), Shop, FAQ,
> Privacy Policy, Terms Of Use, Address Book, Payment Options, экран успеха оформления.

---

## 7. Рекомендации по блокерам ROADMAP

- **0.6 (название проекта):** взять **`fastcart`** — так в логотипе макета. Папку `fatscard`
  и упоминания `fastcard` привести к `fastcart`.
- **0.5 (экраны без макета):** заказы (история/админ-управление) бэкендом **не поддержаны** —
  делать как фронтовый мок или вынести из рамок. Остальное (FAQ, Privacy, Terms, Shop, Address Book,
  Payment Options) — простые статические/заглушечные страницы по аналогии или вне рамок.
  Требуется решение пользователя.
