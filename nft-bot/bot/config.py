"""
Конфигурация бота.
Загружает переменные окружения из .env файла.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Telegram Bot Token (получить у @BotFather)
BOT_TOKEN: str = os.getenv("BOT_TOKEN", "")

# TON API настройки
TON_API_KEY: str = os.getenv("TON_API_KEY", "")
TON_NETWORK: str = os.getenv("TON_NETWORK", "mainnet")  # mainnet или testnet

# Комиссия маркетплейса (в процентах)
MARKETPLACE_FEE: float = float(os.getenv("MARKETPLACE_FEE", "2.5"))

# Минимальная цена продажи (в TON)
MIN_PRICE: float = float(os.getenv("MIN_PRICE", "0.1"))

# Администраторы бота (Telegram user IDs)
ADMIN_IDS: list[int] = [
    int(uid) for uid in os.getenv("ADMIN_IDS", "").split(",") if uid
]

if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN не найден в .env файле!")
