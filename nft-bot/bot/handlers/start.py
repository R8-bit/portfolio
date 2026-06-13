"""
Хэндлер /start — приветствие и подключение кошелька.
"""

from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.filters import CommandStart, Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.utils.keyboard import InlineKeyboardBuilder

from bot.database.db import get_or_create_user, set_wallet, get_wallet

router = Router()


class WalletStates(StatesGroup):
    waiting_wallet = State()


WELCOME_TEXT = """
🤖 <b>BITER NFT Marketplace Bot</b>

Привет, <b>{name}</b>! Добро пожаловать в NFT маркетплейс на TON блокчейне.

<b>Что умеет этот бот:</b>
🎨 Выставлять ваши NFT на продажу
🛒 Покупать NFT других пользователей
📋 Просматривать свои активные листинги
💰 Получать уведомления о продажах

<b>Команды:</b>
/sell — Выставить NFT на продажу
/my_nfts — Мои NFT
/marketplace — Просмотреть маркетплейс
/wallet — Настроить кошелёк
/help — Помощь

{wallet_status}
"""


@router.message(CommandStart())
async def cmd_start(message: Message):
    user = await get_or_create_user(
        user_id=message.from_user.id,
        username=message.from_user.username
    )
    wallet = user.get('wallet')

    if wallet:
        wallet_status = f"✅ <b>Кошелёк подключён:</b> <code>{wallet[:8]}...{wallet[-4:]}</code>"
    else:
        wallet_status = "⚠️ <b>Кошелёк не подключён.</b> Используйте /wallet для настройки."

    kb = InlineKeyboardBuilder()
    kb.button(text="🛒 Маркетплейс", callback_data="open_marketplace")
    kb.button(text="➕ Продать NFT", callback_data="sell_nft")
    kb.button(text="💼 Мои NFT", callback_data="my_nfts")
    kb.button(text="⚙️ Кошелёк", callback_data="setup_wallet")
    kb.adjust(2, 2)

    await message.answer(
        WELCOME_TEXT.format(
            name=message.from_user.first_name,
            wallet_status=wallet_status
        ),
        reply_markup=kb.as_markup()
    )


@router.message(Command("wallet"))
@router.callback_query(F.data == "setup_wallet")
async def cmd_wallet(event: Message | CallbackQuery, state: FSMContext):
    text = (
        "💼 <b>Настройка TON кошелька</b>\n\n"
        "Отправьте ваш TON-адрес кошелька.\n"
        "Например: <code>EQD...abc</code>\n\n"
        "⚠️ Убедитесь, что адрес правильный — на него будут поступать средства."
    )
    if isinstance(event, CallbackQuery):
        await event.message.answer(text)
        await event.answer()
    else:
        await event.answer(text)

    await state.set_state(WalletStates.waiting_wallet)


@router.message(WalletStates.waiting_wallet)
async def process_wallet(message: Message, state: FSMContext):
    wallet = message.text.strip()

    # Базовая валидация TON адреса
    if not (wallet.startswith("EQ") or wallet.startswith("UQ")) or len(wallet) < 48:
        await message.answer(
            "❌ Неверный формат TON адреса.\n\n"
            "Адрес должен начинаться с <b>EQ</b> или <b>UQ</b> и содержать 48 символов.\n"
            "Попробуйте ещё раз:"
        )
        return

    await set_wallet(user_id=message.from_user.id, wallet=wallet)
    await state.clear()

    await message.answer(
        f"✅ <b>Кошелёк успешно подключён!</b>\n\n"
        f"<code>{wallet}</code>\n\n"
        f"Теперь вы можете продавать NFT. Используйте /sell"
    )


@router.message(Command("help"))
async def cmd_help(message: Message):
    await message.answer(
        "📖 <b>Справка по боту</b>\n\n"
        "<b>Как продать NFT:</b>\n"
        "1. Настройте TON кошелёк /wallet\n"
        "2. Используйте /sell и следуйте инструкциям\n"
        "3. Укажите адрес NFT, название, цену\n"
        "4. Ваш NFT появится в маркетплейсе\n\n"
        "<b>Как купить NFT:</b>\n"
        "1. Откройте /marketplace\n"
        "2. Выберите понравившийся NFT\n"
        "3. Нажмите «Купить» и следуйте инструкциям\n"
        "4. Переведите TON на указанный адрес\n\n"
        "<b>Комиссия:</b> 2.5% от суммы продажи\n\n"
        "По вопросам: @biter"
    )
