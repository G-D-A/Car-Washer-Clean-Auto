# Clean-Auto — сайт-визитка автомойки

Одностраничный сайт автомойки в Киеве с услугами, ценами и онлайн-записью. Заявки с формы сохраняются в MongoDB через собственный API на Express. Интерфейс на украинском: цены в гривнах, телефоны +380.

![Главный экран сайта](docs/screenshot.png)

## Возможности

- Главный экран с фото авто, преимуществами и кнопками записи.
- Карточки услуг с ценами и длительностью; кнопка «Записатися» сразу подставляет услугу в форму.
- Форма записи с проверкой имени, украинского номера телефона, даты (не в прошлом) и времени.
- Номер телефона открывает чат в Telegram.
- Адаптивная вёрстка: телефон, планшет, десктоп; мобильное меню.
- API сохраняет заявки в MongoDB; список заявок доступен только по секретному токену.

## Стек

| Часть | Технологии |
| --- | --- |
| Фронтенд | React 19, TypeScript, Vite, CSS Modules |
| Бэкенд | Node.js, Express 5, Mongoose |
| База данных | MongoDB 8 в Docker |
| Качество кода | oxlint, `tsc` |

## Структура

```
client/
  components/      компоненты; у каждого своя папка: X.tsx, X.module.css, index.ts
    Header/  Hero/  Services/  BookingForm/  Footer/
  data/            контакты и список услуг
  lib/booking.ts   проверка заявки — общая для формы и сервера
  assets/          изображения
  index.css        CSS-переменные и базовые стили
server/
  index.ts         запуск Express и подключение к MongoDB
  routes/          маршруты /api/bookings
  models/          схема заявки Mongoose
```

## Запуск локально

Понадобятся Node.js 22+ и Docker.

1. Установить зависимости:

   ```bash
   npm install
   ```

2. Создать файл `.env` из примера и задать свой `ADMIN_TOKEN`:

   ```bash
   cp .env.example .env
   ```

3. Запустить MongoDB в Docker (первый раз):

   ```bash
   docker run -d --name car-wash-mongo -p 27017:27017 -v car-wash-mongo-data:/data/db mongo:8
   ```

   В следующие разы достаточно `docker start car-wash-mongo`.

4. Запустить фронтенд и API одной командой:

   ```bash
   npm run dev:all
   ```

   Сайт: http://localhost:5173, API: http://localhost:3001.

## Скрипты

| Команда | Что делает |
| --- | --- |
| `npm run dev` | только фронтенд (Vite) |
| `npm run dev:server` | только API с перезапуском при изменениях |
| `npm run dev:all` | фронтенд и API вместе |
| `npm run build` | проверка типов и сборка в `dist/` |
| `npm run lint` | проверка кода oxlint |
| `npm run preview` | просмотр собранной версии |

## Переменные окружения

| Переменная | Пример | Назначение |
| --- | --- | --- |
| `PORT` | `3001` | порт API |
| `MONGODB_URI` | `mongodb://localhost:27017/car-wash` | адрес базы |
| `ADMIN_TOKEN` | `change-me` | секрет для просмотра заявок |

## API

| Метод | Путь | Описание |
| --- | --- | --- |
| `GET` | `/api/health` | состояние сервера и базы |
| `POST` | `/api/bookings` | создать заявку; `201` при успехе, `400` с ошибками полей |
| `GET` | `/api/bookings` | последние 100 заявок; нужен заголовок `x-admin-token` |

Пример просмотра заявок:

```bash
curl -H "x-admin-token: $ADMIN_TOKEN" http://localhost:3001/api/bookings
```
