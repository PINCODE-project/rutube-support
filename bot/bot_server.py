from telegram import Update
from telegram.ext import CommandHandler, MessageHandler, filters, CallbackQueryHandler, ApplicationBuilder
from bot_helper import *

# Загрузка настроек бота из файла JSON
settings = BotSettings('bot_settings.json')

# Инициализация приложения Telegram-бота
app = ApplicationBuilder().token(settings.bot_token).build()


async def start(update: Update, _):
    """
    Обработчик команды /start.
    Отправляет приветственное сообщение пользователю и предлагает задать вопрос.

    Args:
        update (Update): Объект Telegram Update, представляющий входящее сообщение.
        _ (ContextTypes.DEFAULT_TYPE): Контекст выполнения, не используется.
    """
    await update.message.reply_text('Привет👋\nЧем я могу тебе помочь?')


async def handle_message(update: Update, _):
    """
    Основной обработчик сообщений и callback'ов.
    Если сообщение является текстовым, отправляет его на обработку в LLM.
    Если это callback (нажатие на кнопку), обрабатывает либо оценку ответа, либо перегенерацию.

    Args:
        update (Update): Объект Telegram Update, представляющий входящее сообщение или callback.
        _ (ContextTypes.DEFAULT_TYPE): Контекст выполнения, не используется.
    """
    if update.callback_query is None:
        await get_answer_from_llm(update)
        return

    callback = update.callback_query
    await callback.answer()

    mark = callback.data
    if not mark.isdigit():
        await regenerate_answer(update)
        return

    data = {
        'messageId': create_message_id(update.effective_message),
        'rating': int(mark)
    }
    response = set_rating(data)

    request_id = response.json()['id']

    await callback.edit_message_text(
        text=create_close_request_message(request_id, mark),
        reply_markup=InlineKeyboardMarkup([])
    )


async def get_answer_from_llm(update: Update):
    """
    Обрабатывает вопрос пользователя, отправляя его на API LLM для получения ответа.
    Также обрабатывает случай, когда доступна форма для заполнения.

    Args:
        update (Update): Объект Telegram Update, представляющий входящее сообщение.
    """
    payload = get_payload(update.message)
    try:
        response_data = get_answer(payload)
        await update.message.reply_text(
            text=create_answer_message(**response_data),
            parse_mode='Markdown'
        )

        if response_data.get('form') is not None:
            link = response_data.get('form')
            await update.message.reply_text(
                text=f'📃 В ответе доступна форма для заполнения 📃',
                reply_markup=get_web_app(link)
            )

        rating_message = await update.message.reply_text(
            text="✨ Оцените ответ ✨\nВажно: Вы можете запросить новый ответ, если вас не устраивает текущий",
            reply_markup=get_inline_keyboard()
        )

        set_message_id(int(response_data['id']), rating_message)

    except requests.exceptions.RequestException as e:
        await update.message.reply_text("Упс! Ошибка...")


async def regenerate_answer(update: Update):
    """
    Перегенерирует ответ пользователя на основе предыдущего сообщения.
    Отправляет запрос в API для перегенерации, обновляет сообщение с новым ответом.

    Args:
        update (Update): Объект Telegram Update, представляющий callback от нажатия инлайн-кнопки.
    """
    callback = update.callback_query
    message = callback.message
    payload = {
        'question': '',
        'userId': str(message.from_user.id),
        'fullName': message.from_user.full_name,
        'userName': message.from_user.name,
        'oldMessageId': create_message_id(update.effective_message),
    }
    try:
        response_data = get_answer(payload)

        await callback.edit_message_text(
            text=create_answer_message(**response_data),
            parse_mode='Markdown'
        )

        if response_data.get('form') is not None:
            await app.bot.send_message(
                chat_id=message.chat_id,
                text='📃 В ответе доступна форма для заполнения 📃',
                reply_markup=get_web_app(response_data)
            )

        rating_message = await app.bot.send_message(
            chat_id=message.chat_id,
            text="✨ Оцените ответ ✨\nВажно: Вы можете запросить новый ответ, если вас не устраивает текущий",
            reply_markup=get_inline_keyboard()
        )

        set_message_id(response_data['id'], rating_message)

    except requests.exceptions.RequestException as e:
        await update.message.reply_text("Упс! Ошибка...")


def set_rating(data: dict) -> requests.Response:
    """
    Отправляет рейтинг ответа на сервер через POST-запрос.
    Если авторизация истекла, обновляет токен и повторно отправляет запрос.

    Args:
        data (dict): Данные для отправки рейтинга (messageId и оценка).

    Returns:
        requests.Response: Ответ от сервера.
    """
    response = requests.post(
        url=settings.set_rating_url(),
        headers=settings.get_headers(),
        json=data
    )
    if response.status_code == 401:
        settings.auth()
        response = requests.post(
            url=settings.set_rating_url(),
            headers=settings.get_headers(),
            json=data
        )
    return response


def get_answer(payload: dict) -> dict:
    """
    Отправляет запрос в API для получения ответа от LLM.
    Если авторизация истекла, обновляет токен и повторяет запрос.

    Args:
        payload (dict): Данные запроса для отправки в LLM (например, вопрос пользователя).

    Returns:
        dict: Ответ от API в формате JSON.

    Raises:
        requests.exceptions.RequestException: Если возникла ошибка при запросе.
    """
    response = requests.post(
        url=settings.create_chat_url(),
        headers=settings.get_headers(),
        json=payload)
    if response.status_code == 401:
        settings.auth()
        response = requests.post(
            url=settings.create_chat_url(),
            headers=settings.get_headers(),
            json=payload)
    response.raise_for_status()
    return response.json()


def set_message_id(request_id: int, message: Message):
    """
    Сохраняет идентификатор сообщения в системе через POST-запрос.
    Если авторизация истекла, обновляет токен и повторно отправляет запрос.

    Args:
        request_id (int): Идентификатор запроса.
        message (Message): Объект Telegram Message, для которого нужно сохранить ID.
    """
    response = requests.post(
        url=settings.set_message_id_url(),
        headers=settings.get_headers(),
        json={
            'id': request_id,
            'messageId': create_message_id(message)
        })
    if response.status_code == 401:
        settings.auth()
        requests.post(
            url=settings.set_message_id_url(),
            headers=settings.get_headers(),
            json={
                'id': request_id,
                'messageId': create_message_id(message)
            }
        )


if __name__ == '__main__':
    """
    Основная точка входа в приложение. Инициализация бота и добавление обработчиков.
    """
    app.add_handler(CommandHandler("start", start))  # Хендлер команды /start
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))  # Хендлер для текстовых сообщений
    app.add_handler(CallbackQueryHandler(handle_message))  # Хендлер для инлайн-кнопок
    app.run_polling()  # Запуск бота в режиме polling (опрос сервера)
