import json
import requests
from telegram import InlineKeyboardMarkup, InlineKeyboardButton, Message, WebAppInfo


class BotSettings:
    """
    Класс для управления настройками бота и взаимодействия с API бэкэнда.

    Args:
        config_path (str): Путь к файлу конфигурации (JSON).
    """
    def __init__(self, config_path: str):
        with open(config_path, 'r') as file:
            config = json.load(file)

        self.bot_token = config.get("bot_token", "")
        self.backend_url = config.get("backend_url", "")
        self.login = config.get("login", "")
        self.password = config.get("password", "")
        self.access_token = ''
        self.auth()

    def auth(self):
        """
        Метод для аутентификации пользователя через бэкэнд и получения токена.
        """
        response = requests.post(url=f'{self.backend_url}/auth/login', data={
            'login': self.login,
            'password': self.password
        })

        self.access_token = response.json()['accessToken']

    def get_headers(self):
        """
        Возвращает заголовки для авторизованных запросов к бэкэнду.

        Returns:
            dict: Словарь с заголовками, включающий Bearer-токен.
        """
        return {
            "Authorization": f'Bearer {self.access_token}'
        }

    def create_chat_url(self) -> str:
        """
        Возвращает URL для создания чата в API бэкэнда.

        Returns:
            str: URL для создания чата.
        """
        return f"{self.backend_url}/chat"

    def set_rating_url(self) -> str:
        """
        Возвращает URL для установки рейтинга ответа в API бэкэнда.

        Returns:
            str: URL для установки рейтинга.
        """
        return f"{self.backend_url}/chat/set-rating"

    def set_message_id_url(self) -> str:
        """
        Возвращает URL для сохранения идентификатора сообщения в API бэкэнда.

        Returns:
            str: URL для сохранения идентификатора сообщения.
        """
        return f"{self.backend_url}/chat/set-message-id"


def create_answer_message(**kwargs) -> str:
    """
    Создает текст сообщения с ответом на запрос пользователя.

    Args:
        kwargs (dict): Данные ответа, включая ID обращения, ответ, категории.

    Returns:
        str: Сформированный текст сообщения с данными ответа.
    """
    return (f'· Обращение № {kwargs.get("id")} ·\n\n'
            f'```Ответ:\n{kwargs.get("answer")}```\n\n · Дополнительно · \n'
            f'Категория обращения: {kwargs.get("firstClass")}\n'
            f'Подкатегория обращения: {kwargs.get("secondClass")}')


def create_close_request_message(request_id: int, mark) -> str:
    """
    Создает текст сообщения с результатом оценки обращения.

    Args:
        request_id (int): Идентификатор обращения.
        mark (int): Оценка пользователя.

    Returns:
        str: Текст сообщения с результатом оценки.
    """
    return f'Обращение № {request_id} оценено: {mark}'


def get_payload(message: Message) -> dict:
    """
    Формирует данные для отправки запроса в LLM на основе сообщения пользователя.

    Args:
        message (Message): Сообщение от пользователя Telegram.

    Returns:
        dict: Словарь с данными пользователя и текстом запроса.
    """
    return {
        'userId': str(message.from_user.id),
        'fullName': message.from_user.full_name,
        'userName': message.from_user.name,
        'question': message.text
    }


def get_inline_keyboard() -> InlineKeyboardMarkup:
    """
    Создает инлайн-клавиатуру для оценки ответа и перегенерации.

    Returns:
        InlineKeyboardMarkup: Разметка инлайн-клавиатуры с кнопками оценки и перегенерации.
    """
    return InlineKeyboardMarkup([[
        InlineKeyboardButton('\u0031\uFE0F\u20E3', callback_data='1'),
        InlineKeyboardButton('\u0032\uFE0F\u20E3', callback_data='2'),
        InlineKeyboardButton('\u0033\uFE0F\u20E3', callback_data='3'),
        InlineKeyboardButton('\u0034\uFE0F\u20E3', callback_data='4'),
        InlineKeyboardButton('\u0035\uFE0F\u20E3', callback_data='5')],
        [InlineKeyboardButton('Получить новый ответ 🔄', callback_data='Получить новый ответ 🔄')]
    ])


def create_request_id(message: Message, is_before=False) -> str:
    """
    Создает уникальный идентификатор для обращения.

    Args:
        message (Message): Сообщение от пользователя Telegram.
        is_before (bool): Если True, создается ID для предыдущего сообщения.

    Returns:
        str: Сгенерированный идентификатор обращения.
    """
    message_id = message.id
    if is_before:
        message_id -= 1
    return f'{message.chat_id}{message_id}'


def get_web_app(link: str) -> InlineKeyboardMarkup:
    """
    Создает клавиатуру с кнопкой для перехода на веб-приложение.

    Args:
        link (str): Ссылка на веб-приложение.

    Returns:
        InlineKeyboardMarkup: Инлайн-клавиатура с кнопкой для открытия веб-приложения.
    """
    return InlineKeyboardMarkup(
        [[InlineKeyboardButton("✏️ Форма для подачи заявки ✏️", web_app=WebAppInfo(link))]]
    )


def create_message_id(message: Message) -> str:
    """
    Создает уникальный идентификатор сообщения на основе его ID и чата.

    Args:
        message (Message): Сообщение от пользователя Telegram.

    Returns:
        str: Сгенерированный идентификатор сообщения.
    """
    return f'{message.chat_id}{message.id}'
