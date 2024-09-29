from fastapi import FastAPI
from models import initialize_model
from chains import generate_chat_response
from models import Messages

# Инициализация приложения FastAPI
app = FastAPI()

# Инициализация модели
model = initialize_model()

@app.post("/chat")
async def quick_response(messages: Messages):
    """
    Получение быстрого ответа от модели на основе сообщений пользователя.

    Аргументы:
        messages (Messages): Объект сообщений с ролью и содержимым.

    Возвращает:
        dict: Ответ модели на основе контекста и сообщений.
    """
    # Генерация ответа на основе модели и переданных сообщений
    result = generate_chat_response(model, messages)
    return {"response": result}

if __name__ == "__main__":
    import uvicorn
    # Запуск сервера FastAPI
    uvicorn.run(app, host="0.0.0.0", port=5015)
