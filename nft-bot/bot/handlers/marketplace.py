"""
Хэндлер маркетплейса (/marketplace, /buy).
Показывает активные NFT и обрабатывает покупку.
"""

from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.filters import Command
from aiogram.utils.keyboard import InlineKeyboardBuilder

from bot.database.db import get_active_nfts, get_nft_by_id, get_wallet, mark_nft_sold
from bot.config import MARKETPLACE_FEE

router = Router()


def format_nft_card(nft: dict) -> str:
    """Форматирует карточку NFT для отображения."""
    fee = nft['price_ton'] * MARKETPLACE_FEE / 100
    seller = nft.get('seller_name') or f"user_{nft['seller_id']}"
    return (
        f"🖼 <b>{nft['name']}</b>\n"
        f"━━━━━━━━━━━━━━━\n"
        f"📝 {nft.get('description') or 'Описание не указано'}\n\n"
        f"💰 Цена: <b>{nft['price_ton']} TON</b>\n"
        f"📉 Комиссия: <b>{fee:.4f} TON</b>\n"
        f"👤 Продавец: @{seller}\n"
        f"🔗 Адрес NFT: <code>{nft['nft_address'][:12]}...{nft['nft_address'][-6:]}</code>\n"
        f"🆔 ID: <code>#{nft['id']}</code>"
    )


@router.message(Command("marketplace"))
@router.callback_query(F.data == "open_marketplace")
async def cmd_marketplace(event: Message | CallbackQuery):
    nfts = await get_active_nfts(limit=5)

    if not nfts:
        text = (
            "🏪 <b>Маркетплейс BITER NFT</b>\n\n"
            "😔 Пока нет активных листингов.\n\n"
            "Хотите первым выставить NFT? /sell"
        )
        if isinstance(event, CallbackQuery):
            await event.message.answer(text)
            await event.answer()
        else:
            await event.answer(text)
        return

    header = f"🏪 <b>Маркетплейс BITER NFT</b>\nАктивных NFT: {len(nfts)}\n\n"

    for nft in nfts:
        kb = InlineKeyboardBuilder()
        kb.button(text=f"💎 Купить за {nft['price_ton']} TON", callback_data=f"buy_{nft['id']}")
        kb.button(text="🔗 Адрес NFT", callback_data=f"nft_address_{nft['id']}")
        kb.adjust(1)

        card_text = format_nft_card(nft)
        if isinstance(event, CallbackQuery):
            await event.message.answer(card_text, reply_markup=kb.as_markup())
        else:
            await event.answer(card_text, reply_markup=kb.as_markup())

    if isinstance(event, CallbackQuery):
        await event.message.answer(header)
        await event.answer()
    else:
        await event.answer(header)


@router.callback_query(F.data.startswith("nft_address_"))
async def show_nft_address(callback: CallbackQuery):
    nft_id = int(callback.data.split("_")[-1])
    nft = await get_nft_by_id(nft_id)
    if nft:
        await callback.answer(f"Адрес NFT: {nft['nft_address']}", show_alert=True)
    else:
        await callback.answer("NFT не найден", show_alert=True)


@router.callback_query(F.data.startswith("buy_"))
async def process_buy(callback: CallbackQuery):
    nft_id = int(callback.data.split("_")[1])
    nft = await get_nft_by_id(nft_id)

    if not nft:
        await callback.answer("❌ NFT не найден или уже продан", show_alert=True)
        return

    if nft['seller_id'] == callback.from_user.id:
        await callback.answer("❌ Нельзя купить собственный NFT!", show_alert=True)
        return

    if nft['status'] != 'active':
        await callback.answer("❌ Этот NFT уже продан или снят с продажи", show_alert=True)
        return

    buyer_wallet = await get_wallet(callback.from_user.id)
    if not buyer_wallet:
        await callback.message.answer(
            "❌ Для покупки нужен TON кошелёк.\n"
            "Настройте его через /wallet"
        )
        await callback.answer()
        return

    fee = nft['price_ton'] * MARKETPLACE_FEE / 100
    seller_wallet = nft.get('seller_wallet', 'не указан')

    payment_text = (
        f"💳 <b>Оплата NFT «{nft['name']}»</b>\n\n"
        f"Сумма: <b>{nft['price_ton']} TON</b>\n"
        f"Из них комиссия: {fee:.4f} TON\n\n"
        f"<b>Инструкция по оплате:</b>\n"
        f"1. Откройте ваш TON кошелёк (Tonkeeper, MyTonWallet)\n"
        f"2. Переведите <b>{nft['price_ton']} TON</b> на адрес:\n"
        f"   <code>{seller_wallet}</code>\n"
        f"3. В комментарии к транзакции укажите:\n"
        f"   <code>NFT_BUY_{nft_id}</code>\n"
        f"4. После перевода нажмите «Подтвердить оплату»\n\n"
        f"⚠️ NFT будет передан автоматически после подтверждения транзакции в блокчейне."
    )

    kb = InlineKeyboardBuilder()
    kb.button(text="✅ Подтвердить оплату", callback_data=f"confirm_buy_{nft_id}")
    kb.button(text="❌ Отменить", callback_data="cancel_buy")
    kb.adjust(1)

    await callback.message.answer(payment_text, reply_markup=kb.as_markup())
    await callback.answer()


@router.callback_query(F.data.startswith("confirm_buy_"))
async def confirm_buy(callback: CallbackQuery):
    nft_id = int(callback.data.split("_")[-1])
    nft = await get_nft_by_id(nft_id)

    if not nft or nft['status'] != 'active':
        await callback.answer("❌ NFT недоступен", show_alert=True)
        return

    buyer_id = callback.from_user.id
    fee = nft['price_ton'] * MARKETPLACE_FEE / 100

    # В реальном боте здесь идёт верификация через TON API
    # Для демо — имитируем подтверждение
    tx_hash = f"DEMO_{nft_id}_{buyer_id}"

    await mark_nft_sold(
        nft_id=nft_id,
        buyer_id=buyer_id,
        tx_hash=tx_hash,
        fee=fee
    )

    # Уведомление покупателю
    await callback.message.edit_text(
        f"🎉 <b>Поздравляем с покупкой!</b>\n\n"
        f"NFT <b>«{nft['name']}»</b> теперь ваш!\n"
        f"Адрес NFT: <code>{nft['nft_address']}</code>\n\n"
        f"Транзакция: <code>{tx_hash}</code>\n\n"
        f"NFT будет передан на ваш кошелёк в течение нескольких минут."
    )
    await callback.answer("🎉 Покупка совершена!")

    # Уведомление продавцу (в реальном боте через bot.send_message)
    # await bot.send_message(nft['seller_id'], f"💰 Ваш NFT «{nft['name']}» продан!")


@router.callback_query(F.data == "cancel_buy")
async def cancel_buy(callback: CallbackQuery):
    await callback.message.edit_text("❌ Покупка отменена.")
    await callback.answer()


@router.message(Command("buy"))
async def cmd_buy(message: Message):
    await message.answer(
        "💎 <b>Купить NFT</b>\n\n"
        "Перейдите в /marketplace для просмотра доступных NFT.\n"
        "Нажмите кнопку «Купить» под понравившимся NFT."
    )
