"""
Хэндлер продажи NFT (/sell, /my_nfts).
FSM для пошагового ввода данных NFT.
"""

from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.utils.keyboard import InlineKeyboardBuilder

from bot.database.db import (
    get_wallet, add_nft, get_user_nfts, cancel_nft, get_nft_by_id
)
from bot.config import MIN_PRICE, MARKETPLACE_FEE

router = Router()


class SellStates(StatesGroup):
    waiting_nft_address = State()
    waiting_name = State()
    waiting_description = State()
    waiting_price = State()
    waiting_image = State()
    confirm = State()


@router.message(Command("sell"))
@router.callback_query(F.data == "sell_nft")
async def cmd_sell(event: Message | CallbackQuery, state: FSMContext):
    user_id = event.from_user.id
    wallet = await get_wallet(user_id)

    if not wallet:
        text = (
            "❌ Для продажи NFT сначала подключите кошелёк.\n"
            "Используйте /wallet"
        )
        if isinstance(event, CallbackQuery):
            await event.message.answer(text)
            await event.answer()
        else:
            await event.answer(text)
        return

    text = (
        "🎨 <b>Выставить NFT на продажу</b>\n\n"
        "Шаг 1/5: Отправьте <b>адрес NFT</b> в TON блокчейне.\n\n"
        "Адрес выглядит так: <code>EQD...xyz</code>\n"
        "Найти его можно в вашем кошельке (Tonkeeper, MyTonWallet и т.д.)"
    )
    if isinstance(event, CallbackQuery):
        await event.message.answer(text)
        await event.answer()
    else:
        await event.answer(text)

    await state.set_state(SellStates.waiting_nft_address)


@router.message(SellStates.waiting_nft_address)
async def process_nft_address(message: Message, state: FSMContext):
    address = message.text.strip()

    if not (address.startswith("EQ") or address.startswith("UQ")) or len(address) < 48:
        await message.answer("❌ Неверный адрес NFT. Попробуйте ещё раз:")
        return

    await state.update_data(nft_address=address)
    await message.answer(
        "✅ Адрес принят!\n\n"
        "Шаг 2/5: Введите <b>название</b> вашего NFT:"
    )
    await state.set_state(SellStates.waiting_name)


@router.message(SellStates.waiting_name)
async def process_name(message: Message, state: FSMContext):
    name = message.text.strip()
    if len(name) < 2 or len(name) > 100:
        await message.answer("❌ Название должно быть от 2 до 100 символов. Попробуйте ещё раз:")
        return

    await state.update_data(name=name)
    await message.answer(
        f"✅ Название: <b>{name}</b>\n\n"
        "Шаг 3/5: Напишите <b>описание</b> NFT (до 500 символов):\n"
        "Или отправьте /skip для пропуска"
    )
    await state.set_state(SellStates.waiting_description)


@router.message(SellStates.waiting_description)
async def process_description(message: Message, state: FSMContext):
    if message.text == "/skip":
        description = ""
    else:
        description = message.text.strip()[:500]

    await state.update_data(description=description)
    await message.answer(
        "Шаг 4/5: Укажите <b>цену</b> в TON.\n\n"
        f"Минимальная цена: <b>{MIN_PRICE} TON</b>\n"
        f"Комиссия маркетплейса: <b>{MARKETPLACE_FEE}%</b>"
    )
    await state.set_state(SellStates.waiting_price)


@router.message(SellStates.waiting_price)
async def process_price(message: Message, state: FSMContext):
    try:
        price = float(message.text.replace(",", "."))
    except ValueError:
        await message.answer("❌ Введите корректную цену (например: 5.5):")
        return

    if price < MIN_PRICE:
        await message.answer(f"❌ Минимальная цена: {MIN_PRICE} TON. Попробуйте ещё раз:")
        return

    fee = price * MARKETPLACE_FEE / 100
    await state.update_data(price=price, fee=fee)
    await message.answer(
        f"✅ Цена: <b>{price} TON</b>\n"
        f"Комиссия: <b>{fee:.4f} TON</b>\n"
        f"Получите: <b>{price - fee:.4f} TON</b>\n\n"
        "Шаг 5/5: Отправьте ссылку на <b>изображение</b> NFT (URL):\n"
        "Или /skip для пропуска"
    )
    await state.set_state(SellStates.waiting_image)


@router.message(SellStates.waiting_image)
async def process_image(message: Message, state: FSMContext):
    image_url = "" if message.text == "/skip" else message.text.strip()
    await state.update_data(image_url=image_url)

    data = await state.get_data()

    kb = InlineKeyboardBuilder()
    kb.button(text="✅ Подтвердить", callback_data="confirm_sell")
    kb.button(text="❌ Отменить", callback_data="cancel_sell")
    kb.adjust(2)

    preview = (
        "📋 <b>Проверьте данные NFT:</b>\n\n"
        f"🏷 <b>Название:</b> {data['name']}\n"
        f"📝 <b>Описание:</b> {data.get('description') or 'не указано'}\n"
        f"🔗 <b>Адрес:</b> <code>{data['nft_address'][:12]}...{data['nft_address'][-6:]}</code>\n"
        f"💰 <b>Цена:</b> {data['price']} TON\n"
        f"📉 <b>Комиссия:</b> {data['fee']:.4f} TON\n"
        f"💵 <b>Получите:</b> {data['price'] - data['fee']:.4f} TON\n\n"
        "Подтвердить размещение?"
    )

    await message.answer(preview, reply_markup=kb.as_markup())
    await state.set_state(SellStates.confirm)


@router.callback_query(F.data == "confirm_sell", SellStates.confirm)
async def confirm_sell(callback: CallbackQuery, state: FSMContext):
    data = await state.get_data()
    user_id = callback.from_user.id

    nft_id = await add_nft(
        seller_id=user_id,
        nft_address=data['nft_address'],
        name=data['name'],
        description=data.get('description', ''),
        price_ton=data['price'],
        image_url=data.get('image_url', '')
    )

    await state.clear()
    await callback.message.edit_text(
        f"🎉 <b>NFT выставлен на продажу!</b>\n\n"
        f"ID листинга: <code>#{nft_id}</code>\n"
        f"<b>{data['name']}</b> — {data['price']} TON\n\n"
        f"Покупатели увидят его в /marketplace"
    )
    await callback.answer("✅ NFT добавлен на маркетплейс!")


@router.callback_query(F.data == "cancel_sell")
async def cancel_sell(callback: CallbackQuery, state: FSMContext):
    await state.clear()
    await callback.message.edit_text("❌ Размещение отменено.")
    await callback.answer()


# ── МОИ NFT ──────────────────────────────────────────
@router.message(Command("my_nfts"))
@router.callback_query(F.data == "my_nfts")
async def cmd_my_nfts(event: Message | CallbackQuery):
    user_id = event.from_user.id
    nfts = await get_user_nfts(user_id)

    if not nfts:
        text = "📭 У вас пока нет NFT на маркетплейсе.\n\nИспользуйте /sell для размещения."
        if isinstance(event, CallbackQuery):
            await event.message.answer(text)
            await event.answer()
        else:
            await event.answer(text)
        return

    status_emoji = {'active': '🟢', 'sold': '✅', 'cancelled': '🔴'}

    lines = ["📦 <b>Ваши NFT:</b>\n"]
    for nft in nfts[:10]:
        emoji = status_emoji.get(nft['status'], '⚪')
        lines.append(
            f"{emoji} <b>{nft['name']}</b> — {nft['price_ton']} TON\n"
            f"   ID: <code>#{nft['id']}</code> · Статус: {nft['status']}"
        )
        if nft['status'] == 'active':
            lines[-1] += f"\n   /cancel_{nft['id']} — снять с продажи"
        lines.append("")

    text = "\n".join(lines)
    if isinstance(event, CallbackQuery):
        await event.message.answer(text)
        await event.answer()
    else:
        await event.answer(text)


@router.message(lambda m: m.text and m.text.startswith("/cancel_"))
async def cancel_listing(message: Message):
    try:
        nft_id = int(message.text.split("_")[1])
    except (IndexError, ValueError):
        return

    success = await cancel_nft(nft_id=nft_id, user_id=message.from_user.id)
    if success:
        await message.answer(f"✅ NFT #{nft_id} снят с продажи.")
    else:
        await message.answer("❌ Не удалось снять. NFT не найден или уже продан.")
