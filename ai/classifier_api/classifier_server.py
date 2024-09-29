from typing import Dict

from fastapi import FastAPI
from starlette.responses import JSONResponse
from transformers import AutoTokenizer
import torch
import joblib
from model import MultiTaskRuBERT

app = FastAPI()

# Устройство для выполнения модели (по умолчанию 'cpu')


# Загрузка энкодеров для уровней 1 и 2
le_lvl1 = joblib.load('le_lvl1.pkl')
le_lvl2 = joblib.load('le_lvl2.pkl')

# Получение количества классов для каждого уровня
n_classes_lvl1 = len(le_lvl1.classes_)
n_classes_lvl2 = len(le_lvl2.classes_)

# Загрузка модели и токенизатора
model_name = "ai-forever/sbert_large_nlu_ru"
model = MultiTaskRuBERT(model_name, n_classes_lvl1, n_classes_lvl2)
if torch.cuda.is_available():
    device = torch.device("cuda")
    model.load_state_dict(torch.load("classifier_model.bin"))
else:
    device = torch.device("cpu")
    model.load_state_dict(torch.load("classifier_model.bin", map_location=torch.device('cpu')))
model = model.to(device)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Максимальная длина для токенизации
max_len = 128


def predict(text: str, model: MultiTaskRuBERT, tokenizer: AutoTokenizer, le_lvl1, le_lvl2, max_len: int = 64):
    """
    Выполняет предсказание уровней классификации на основе входного текста.

    Аргументы:
        text (str): Входной текст для классификации.
        model (MultiTaskRuBERT): Модель для выполнения классификации.
        tokenizer (AutoTokenizer): Токенизатор для обработки текста.
        le_lvl1 (LabelEncoder): Энкодер классов для первого уровня.
        le_lvl2 (LabelEncoder): Энкодер классов для второго уровня.
        max_len (int): Максимальная длина токенизированного текста (по умолчанию 64).

    Возвращает:
        Tuple[str, str]: Предсказанные классы для уровня 1 и уровня 2.
    """
    # Токенизация текста
    encoding = tokenizer.encode_plus(
        text,
        add_special_tokens=True,
        max_length=max_len,
        return_token_type_ids=False,
        padding='max_length',
        truncation=True,
        return_attention_mask=True,
        return_tensors='pt',
    )

    # Перемещение тензоров на устройство
    input_ids = encoding['input_ids'].to(device)
    attention_mask = encoding['attention_mask'].to(device)

    # Отключение градиентов для выполнения предсказания
    with torch.no_grad():
        # Получаем предсказания модели для каждого уровня
        outputs_lvl1, outputs_lvl2 = model(
            input_ids=input_ids,
            attention_mask=attention_mask
        )

        # Выбираем класс с наивысшей вероятностью для каждого уровня
        _, preds_lvl1 = torch.max(outputs_lvl1, dim=1)
        _, preds_lvl2 = torch.max(outputs_lvl2, dim=1)

    # Преобразование индексов классов в метки
    predicted_class_lvl1 = le_lvl1.inverse_transform(preds_lvl1.cpu().numpy())
    predicted_class_lvl2 = le_lvl2.inverse_transform(preds_lvl2.cpu().numpy())

    return predicted_class_lvl1, predicted_class_lvl2


@app.get("/")
def read_root():
    """
    Эндпоинт для проверки статуса API.

    Возвращает:
        dict: Сообщение о статусе работы сервера.
    """
    return {"message": "Hello, World!"}


@app.post("/predict")
def process_text(data: Dict):
    """
    Эндпоинт для обработки текста и возврата предсказанных классов.

    Аргументы:
        data (Dict): JSON объект с текстом для классификации. Ожидает ключ 'text'.

    Возвращает:
        JSONResponse: Предсказанные классы для уровня 1 и уровня 2.
    """
    # Извлекаем текст из запроса
    text = data.get('text')

    # Выполняем предсказание
    predicted_lvl1, predicted_lvl2 = predict(text, model, tokenizer, le_lvl1, le_lvl2, max_len)

    # Возвращаем результат в формате JSON
    return JSONResponse(content={"class_1": str(predicted_lvl1[0]), "class_2": str(predicted_lvl2[0])})


if __name__ == "__main__":
    import uvicorn

    # Запуск приложения FastAPI
    uvicorn.run(app, host="0.0.0.0", port=5023)
