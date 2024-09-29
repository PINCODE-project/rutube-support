import os
import logging
import requests
import pandas as pd
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from werkzeug.utils import secure_filename
from typing import List, Optional

# Инициализация FastAPI
app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешить доступ с любых доменов
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# URL для вызова различных API
LLM_API_URL = "http://95.174.94.205:5015/chat"
GET_RETRIEVE_URL = "http://retrieve_api:5021/get_retrieve"
ADD_DOCUMENT_URL = "http://retrieve_api:5021/add_documents"
GET_CLASSES_URL = "http://classifier_api:5023/predict"

# Папка для загрузки файлов
UPLOAD_FOLDER = '/media'
ALLOWED_EXTENSIONS = {'xlsx'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Pydantic модель для запроса вопроса
class QuestionRequest(BaseModel):
    question: str


def get_retrieve(question: str, collection_name: str):
    """
    Получает примеры вопросов-ответов из коллекций на основе запроса пользователя.

    Аргументы:
        question (str): Вопрос пользователя.
        collection_name (str): Название коллекции для поиска.

    Возвращает:
        list: Примеры вопросов-ответов с контекстом.
        HTTPException: Возвращает исключение в случае ошибки API.
    """
    near_questions = []
    data = {
        "question": question,
        "collection_name": "all",
        "top_k": 2
    }
    response = requests.post(GET_RETRIEVE_URL, json=data)
    if response.status_code == 200:
        near_questions +=  response.json()['near']

    data = {
        "question": question,
        "collection_name": collection_name,
        "top_k": 2
    }
    response = requests.post(GET_RETRIEVE_URL, json=data)
    if response.status_code == 200:
        near_questions += response.json()['near']
    return near_questions
    raise HTTPException(status_code=response.status_code, detail=response.text)


def response_gpt(messages: List[dict]):
    """
    Отправляет запрос на API GPT и возвращает ответ модели.

    Аргументы:
        messages (list): Список сообщений для GPT.

    Возвращает:
        str: Ответ от GPT.
        HTTPException: Возвращает исключение в случае ошибки API.
    """
    response = requests.post(LLM_API_URL, json={"messages": messages})
    if response.status_code == 200:
        return response.json()['response']
    raise HTTPException(status_code=response.status_code, detail=response.text)


def create_prompt(question: str, collection_name: str):
    """
    Создает промпт для модели GPT на основе вопроса пользователя и примеров.

    Аргументы:
        question (str): Вопрос пользователя.
        collection_name (str): Название коллекции для контекста.

    Возвращает:
        tuple: Промпт для GPT и список контекстных документов.
    """
    examples_qa = get_retrieve(question, collection_name)
    merge_examples = {}
    for example in examples_qa:
        merge_examples.setdefault(example.get('data'), []).append(example.get('answer'))

    examples = ''
    for example_question, example_answers in merge_examples.items():
        examples += f"\n\n[ {example_question} : " + (" ".join(example_answers)).replace('\n', ' ') + " ]"
    prompt = [
        {
            "role": "system",
            "content": "Ты — оператор технической поддержки Rutube (рутуб). "
                       "Твоя задача — отвечать на вопросы пользователей чётко, развернуто и вежливо, используя только предоставленный контекст. "
                       "Тебе приходит вопрос пользователя и примеры вопросов-ответов в формате [ Вопрос : ответ ]. "
                       "Все ответы должны быть на русском языке. Ты обязан здороваться в начале каждого ответа. "
                       "Тебе всегда нужно полагаться только на ту информацию, которая есть в переданном контексте."
                       "Выбирай только нужную информацию из контекста, которая близка к вопросу пользователя. "
                       "Если информации для ответа недостаточно или она отсутствует, ты должен ответить только фразой: 'Не знаю'. "
                       "Обязательно отвечай 'Не знаю', если информации из сообщения пользователя недостаточно. "
                       "Не пиши 'Не знаю', если по инструкциям можешь ответь на вопрос пользорвателя.  "
                       "Ты не должен придумывать информацию, делать предположения и дублировать вопросы в ответе. "
                       "Максимально обогати ответ релевантной информацией из контекста, чтоб он передавал весь смысл из релевантного контекста."
                       "Пользователь видит только свой вопрос, не рассказывай ему про примеры вопросов и ответов. "
                       "Никогда не выводи в ответе YouTube (ютуб) "
                       "Твоя манера общения должна быть дружелюбной и профессиональной."
        },
        {
            "role": "user",
            "content": f"Вопрос пользователя:\n'{question}'\n\nПримеры вопросов-ответов (контекст):'{examples}'"
        }
    ]
    return prompt, examples_qa

def ask_gpt_answer_by_context(question: str, collection_name: str):
    """
    Получает ответ от GPT на основе вопроса и контекстных документов из коллекции.

    Аргументы:
        question (str): Вопрос пользователя.
        collection_name (str): Название коллекции для контекста.

    Возвращает:
        dict: Ответ GPT и контекстные документы.
    """
    prompt, context_docs = create_prompt(question, collection_name)
    answer = response_gpt(prompt).strip()
    return {"answer": answer.strip()}


def get_classes(question: str):
    """
    Определяет классы для вопроса пользователя с помощью классификатора.

    Аргументы:
        question (str): Вопрос пользователя.

    Возвращает:
        dict: Прогнозируемые классы для вопроса.
        HTTPException: Возвращает исключение в случае ошибки API.
    """
    response = requests.post(GET_CLASSES_URL, json={"text": question})
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail=response.text)


@app.post("/predict")
async def get_answer_by_context(data: QuestionRequest):
    """
    Эндпоинт для получения ответа от GPT с контекстом.

    Принимает:
        data (QuestionRequest): Вопрос пользователя в формате JSON.

    Возвращает:
        JSONResponse: Ответ GPT с контекстом.
    """
    question = data.question
    classes = get_classes(question)
    collection_name = classes.get('class_1', 'ОТСУТСТВУЕТ').strip()
    ans = ask_gpt_answer_by_context(question, collection_name)
    ans['class_1'] = "" if classes.get('class_1', '') == "ОТСУТСТВУЕТ" else classes.get('class_1', '').strip()
    ans['class_2'] = "" if classes.get('class_2', '') == "ОТСУТСТВУЕТ" else classes.get('class_2', '').strip()
    return JSONResponse(content=ans)


@app.post("/add_excel")
async def add_excel(
        file: UploadFile = File(...),
        question_type: Optional[str] = Form("Вопрос пользователя"),
        answer_type: Optional[str] = Form("Ответ из БЗ")
):
    """
    Эндпоинт для загрузки данных из Excel и добавления их в коллекцию.

    Принимает:
        file (UploadFile): Файл Excel в формате .xlsx.
        question_type (str): Название столбца с вопросами (по умолчанию "Вопрос пользователя").
        answer_type (str): Название столбца с ответами (по умолчанию "Ответ из БЗ").

    Возвращает:
        JSONResponse: Сообщение об успешной загрузке или ошибке.
    """
    if file.filename.split('.')[-1] not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file format. Only .xlsx files are allowed.")

    filename = secure_filename(file.filename)
    file_location = os.path.join(UPLOAD_FOLDER, filename)

    with open(file_location, "wb") as f:
        f.write(await file.read())

    # Чтение Excel файла
    dataset = pd.read_excel(file_location)

    # Формирование списка документов для добавления
    item_list = []
    for _, row in dataset.iterrows():
        item = {
            "collection_name": str(row['Классификатор 1 уровня']),
            "data": str(row[question_type]),
            "answer": str(row[answer_type]),
            "topic_name": str(row['Классификатор 2 уровня'])
        }
        item_list.append(item)

    logger.info(item_list[:2])  # Логирование для отладки

    # Отправка документов на сервер
    response = requests.post(ADD_DOCUMENT_URL, json={"documents": item_list})
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail=response.text)


if __name__ == "__main__":
    import uvicorn

    # Запуск сервера FastAPI
    uvicorn.run(app, host="0.0.0.0", port=5022, reload=True)