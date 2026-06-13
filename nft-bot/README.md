# 🤖 BITER NFT Bot — Telegram маркетплейс NFT на TON

Telegram бот для приёма и продажи NFT на блокчейне TON. Пользователи могут выставлять свои NFT, просматривать маркетплейс и покупать NFT других участников.

---

## 📁 Структура проекта

```
nft-bot/
├── main.py                  ← Точка входа
├── requirements.txt         ← Python зависимости
├── .env.example             ← Пример конфигурации
├── .env                     ← Ваши секреты (создать вручную!)
└── bot/
    ├── config.py            ← Загрузка конфигурации
    ├── handlers/
    │   ├── start.py         ← /start, /wallet, /help
    │   ├── nft.py           ← /sell, /my_nfts
    │   └── marketplace.py   ← /marketplace, /buy
    └── database/
        └── db.py            ← SQLite: пользователи, NFT, транзакции
```

---

## 🚀 Как запустить бота (пошагово)

### Шаг 1 — Создайте бота в Telegram

1. Откройте Telegram и найдите `@BotFather`
2. Отправьте команду `/newbot`
3. Придумайте **имя бота** (например: `BITER NFT Market`)
4. Придумайте **username** (должен заканчиваться на `bot`, например: `biter_nft_bot`)
5. BotFather выдаст вам **токен** вида: `7234567890:AAF_xyz...`
6. Скопируйте токен — он понадобится в следующем шаге

### Шаг 2 — Настройте конфигурацию

```bash
# Скопируйте .env.example в .env
cp .env.example .env
```

Откройте `.env` и заполните:

```env
BOT_TOKEN=7234567890:AAF_ваш_токен_здесь

# TON API (опционально для верификации транзакций)
# Получить на: https://toncenter.com/api/v2/
TON_API_KEY=ваш_ключ_api

# Сеть: mainnet (реальные деньги) или testnet (тест)
TON_NETWORK=testnet

# Комиссия маркетплейса в %
MARKETPLACE_FEE=2.5

# Минимальная цена NFT в TON
MIN_PRICE=0.1

# Ваш Telegram ID (найти через @userinfobot)
ADMIN_IDS=123456789
```

### Шаг 3 — Установите зависимости

```bash
# Создайте виртуальное окружение (рекомендуется)
python -m venv venv

# Активируйте его:
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Установите пакеты
pip install -r requirements.txt
```

### Шаг 4 — Запустите бота

```bash
python main.py
```

Если всё настроено верно, вы увидите в консоли:
```
2026-06-06 08:00:00 [INFO] База данных инициализирована
2026-06-06 08:00:00 [INFO] Бот запускается...
```

Откройте вашего бота в Telegram и отправьте `/start` ✅

---

## 💎 Команды бота

| Команда | Описание |
|---------|----------|
| `/start` | Запустить бота, главное меню |
| `/wallet` | Подключить TON кошелёк |
| `/sell` | Выставить NFT на продажу (5 шагов) |
| `/my_nfts` | Просмотр своих NFT |
| `/marketplace` | Все активные NFT |
| `/buy` | Инструкция по покупке |
| `/help` | Помощь |

---

## ⚙️ Как устроена продажа NFT

```
Продавец                           Покупатель
   │                                   │
   ├─ /sell                            │
   ├─ Вводит адрес NFT                 │
   ├─ Вводит название/описание         │
   ├─ Указывает цену в TON             │
   ├─ Подтверждает листинг             │
   │                                   │
   │         /marketplace              │
   │              ← Видит NFT ─────────┤
   │                                   ├─ Нажимает "Купить"
   │                                   ├─ Получает реквизиты
   │                                   ├─ Переводит TON
   │                                   ├─ Подтверждает оплату
   │                                   │
   ├─ Получает уведомление             │
   └─ TON приходит на кошелёк         └─ NFT переходит к нему
```

---

## 🌐 Деплой на VPS (рабочий сервер)

### Вариант 1 — Простой (через screen)

```bash
# Установите screen
sudo apt install screen

# Запустите в фоновом режиме
screen -S nft-bot
python main.py

# Отсоединиться: Ctrl+A, затем D
# Подключиться обратно: screen -r nft-bot
```

### Вариант 2 — Через systemd (рекомендуется для production)

Создайте файл `/etc/systemd/system/nft-bot.service`:

```ini
[Unit]
Description=BITER NFT Telegram Bot
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/home/ubuntu/nft-bot
ExecStart=/home/ubuntu/nft-bot/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Включить и запустить
sudo systemctl enable nft-bot
sudo systemctl start nft-bot

# Проверить статус
sudo systemctl status nft-bot

# Логи
sudo journalctl -u nft-bot -f
```

### Вариант 3 — Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

```bash
docker build -t nft-bot .
docker run -d --env-file .env --name nft-bot nft-bot
```

---

## 🔑 Где получить TON API Key

1. Зайдите на [https://toncenter.com](https://toncenter.com/api/v2/)
2. Прокрутите до раздела "Get API Key"
3. Войдите через Telegram
4. Скопируйте ключ в `.env`

> Без API ключа бот работает, но с лимитом запросов (1 запрос/сек).

---

## 🔧 TON Testnet для тестирования

1. Создайте тестовый кошелёк в [Tonkeeper](https://tonkeeper.com) → переключитесь на testnet
2. Получите тестовые TON: [https://t.me/testgiver_ton_bot](https://t.me/testgiver_ton_bot)
3. В `.env` установите `TON_NETWORK=testnet`

---

## 📊 База данных

SQLite файл создаётся автоматически в `data/nft_bot.db`.

Таблицы:
- `users` — пользователи и их TON кошельки
- `nfts` — листинги NFT с ценами и статусами
- `transactions` — история всех транзакций

---

## 🛡️ Безопасность

- **Никогда** не публикуйте `.env` файл в публичные репозитории
- Добавьте `.env` в `.gitignore`
- Регулярно меняйте токен бота при подозрении на компрометацию
- В production используйте TON API для верификации транзакций (а не доверяйте пользователю на слово)

---

## 📞 Контакты

Разработчик: **BITER**  
Telegram: [@biter](https://t.me/biter)  
GitHub: [github.com/biter](https://github.com/biter)
