from typing import List
from pydantic import BaseModel
import os
from dotenv import find_dotenv, load_dotenv
from fastapi import HTTPException
from langchain_community.chat_models import ChatLlamaCpp

# Загружаем переменные окружения
load_dotenv(find_dotenv())

def get_env_variable(var_name: str) -> str:
    """
    Получает значение переменной окружения по ее имени.

    Аргументы:
        var_name (str): Имя переменной окружения.

    Возвращает:
        str: Значение переменной окружения.

    Вызывает:
        ValueError: Если переменная окружения не найдена.
    """
    value = os.getenv(var_name)
    if value is None:
        raise ValueError(f"Environment variable '{var_name}' not found.")
    return value

# Инициализация модели ChatLlamaCpp
def initialize_model():
    """
    Инициализирует и возвращает модель ChatLlamaCpp на основе переменных окружения.

    Возвращает:
        ChatLlamaCpp: Инициализированная модель.

    Вызывает:
        HTTPException: Если переменная окружения не найдена или происходит ошибка при инициализации.
    """

    try:
        model_path = get_env_variable('MODEL_PATH')
        n_ctx = get_env_variable('N_CTX')
        n_parts = get_env_variable('N_PARTS')
        # n_threads = get_env_variable('N_THREADS')
        n_gpu_layers = get_env_variable('N_GPU_LAYERS')
        n_batch = get_env_variable('N_BATCH')
        top_k = get_env_variable('TOP_K')
        top_p = get_env_variable('TOP_P')
        temperature = get_env_variable('TEMPERATURE')
        repeat_penalty = get_env_variable('REPEAT_PENALTY')
        max_tokens = get_env_variable('MAX_TOKENS')

        model = ChatLlamaCpp(
            model_path=model_path,
            n_ctx=n_ctx,
            n_parts=n_parts,
            n_gpu_layers=n_gpu_layers,
            # n_threads=n_threads,
            max_tokens=max_tokens,
            n_batch=n_batch,
            top_k=top_k,
            top_p=top_p,
            temperature=temperature,
            repeat_penalty=repeat_penalty,
            verbose=True
        )

        return model


    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Модель для хранения информации о контексте и примерах
class Message(BaseModel):
    role: str
    content: str

# Основная модель для обработки вопросов пользователей
class Messages(BaseModel):
    messages: List[Message]
