# Используем официальный базовый образ Python
FROM python:3.12-slim

# Обновите пакеты и установите wget
RUN apt-get update && apt-get install -y wget

# Создаем рабочую директорию
WORKDIR /app

# Загрузите файл best_model.pth
RUN wget https://storage.yandexcloud.net/rutube-hack/classifier_model.bin
#COPY classifier_model.bin /app/classifier_model.bin

# Копируем файл зависимостей
COPY requirements.txt /app/requirements.txt

# Устанавливаем Python-зависимости
RUN pip install --no-cache-dir --upgrade pip && \
    pip install -r requirements.txt --no-cache-dir

# Копируем остальные файлы в контейнер
COPY . .

# Открываем порт для API
EXPOSE 5023

# Определяем команду для запуска приложения
CMD ["uvicorn", "classifier_server:app", "--host", "0.0.0.0", "--port", "5023", "--workers", "2"]
