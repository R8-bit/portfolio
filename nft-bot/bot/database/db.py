"""
База данных SQLite — инициализация и работа с данными.
"""

import aiosqlite
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

DB_PATH = Path(__file__).parent.parent.parent / "data" / "nft_bot.db"


async def init_db():
    """Создаёт таблицы базы данных при первом запуске."""
    DB_PATH.parent.mkdir(exist_ok=True)

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id          INTEGER PRIMARY KEY,
                user_id     INTEGER UNIQUE NOT NULL,
                username    TEXT,
                wallet      TEXT,
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS nfts (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                seller_id       INTEGER NOT NULL,
                nft_address     TEXT NOT NULL UNIQUE,
                collection      TEXT,
                name            TEXT NOT NULL,
                description     TEXT,
                image_url       TEXT,
                price_ton       REAL NOT NULL,
                status          TEXT DEFAULT 'active',  -- active | sold | cancelled
                buyer_id        INTEGER,
                created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                sold_at         TIMESTAMP,
                FOREIGN KEY (seller_id) REFERENCES users(user_id)
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                nft_id      INTEGER NOT NULL,
                seller_id   INTEGER NOT NULL,
                buyer_id    INTEGER NOT NULL,
                price_ton   REAL NOT NULL,
                fee_ton     REAL NOT NULL,
                tx_hash     TEXT,
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (nft_id) REFERENCES nfts(id)
            )
        """)
        await db.commit()
        logger.info("Таблицы базы данных созданы/проверены")


async def get_or_create_user(user_id: int, username: str | None) -> dict:
    """Получает или создаёт пользователя в базе данных."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        await db.execute(
            "INSERT OR IGNORE INTO users (user_id, username) VALUES (?, ?)",
            (user_id, username)
        )
        await db.commit()
        cursor = await db.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
        row = await cursor.fetchone()
        return dict(row) if row else {}


async def set_wallet(user_id: int, wallet: str):
    """Сохраняет TON-кошелёк пользователя."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE users SET wallet = ? WHERE user_id = ?",
            (wallet, user_id)
        )
        await db.commit()


async def get_wallet(user_id: int) -> str | None:
    """Возвращает TON-кошелёк пользователя."""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "SELECT wallet FROM users WHERE user_id = ?", (user_id,)
        )
        row = await cursor.fetchone()
        return row[0] if row else None


async def add_nft(seller_id: int, nft_address: str, name: str,
                  description: str, price_ton: float,
                  collection: str = "", image_url: str = "") -> int:
    """Добавляет NFT на продажу."""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            """INSERT INTO nfts (seller_id, nft_address, name, description,
               price_ton, collection, image_url)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (seller_id, nft_address, name, description, price_ton, collection, image_url)
        )
        await db.commit()
        return cursor.lastrowid


async def get_active_nfts(limit: int = 10, offset: int = 0) -> list[dict]:
    """Возвращает активные NFT для маркетплейса."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """SELECT n.*, u.username as seller_name, u.wallet as seller_wallet
               FROM nfts n
               JOIN users u ON n.seller_id = u.user_id
               WHERE n.status = 'active'
               ORDER BY n.created_at DESC
               LIMIT ? OFFSET ?""",
            (limit, offset)
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


async def get_user_nfts(user_id: int) -> list[dict]:
    """Возвращает NFT конкретного пользователя."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM nfts WHERE seller_id = ? ORDER BY created_at DESC",
            (user_id,)
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


async def get_nft_by_id(nft_id: int) -> dict | None:
    """Возвращает NFT по ID."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """SELECT n.*, u.username as seller_name, u.wallet as seller_wallet
               FROM nfts n
               JOIN users u ON n.seller_id = u.user_id
               WHERE n.id = ?""",
            (nft_id,)
        )
        row = await cursor.fetchone()
        return dict(row) if row else None


async def mark_nft_sold(nft_id: int, buyer_id: int, tx_hash: str, fee: float):
    """Отмечает NFT как проданный и создаёт запись транзакции."""
    async with aiosqlite.connect(DB_PATH) as db:
        # Обновляем статус NFT
        nft = await get_nft_by_id(nft_id)
        if not nft:
            return
        await db.execute(
            "UPDATE nfts SET status='sold', buyer_id=?, sold_at=CURRENT_TIMESTAMP WHERE id=?",
            (buyer_id, nft_id)
        )
        # Записываем транзакцию
        await db.execute(
            """INSERT INTO transactions (nft_id, seller_id, buyer_id, price_ton, fee_ton, tx_hash)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (nft_id, nft['seller_id'], buyer_id, nft['price_ton'], fee, tx_hash)
        )
        await db.commit()


async def cancel_nft(nft_id: int, user_id: int) -> bool:
    """Отменяет листинг NFT (только владелец)."""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "UPDATE nfts SET status='cancelled' WHERE id=? AND seller_id=? AND status='active'",
            (nft_id, user_id)
        )
        await db.commit()
        return cursor.rowcount > 0
