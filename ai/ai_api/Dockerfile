# Используем официальный базовый образ Python
FROM python:3.12-slim

# Создаем рабочую директорию
WORKDIR /app

# Копируем файл с зависимостями
COPY requirements.txt .

# Устанавливаем зависимости Python
RUN pip install --no-cache-dir -r requirements.txt

# Копируем исходный код приложения в контейнер
COPY . .

# Определяем команду для запуска приложения
CMD ["uvicorn", "ai_server:app", "--host", "0.0.0.0", "--port", "5022", "--workers", "2"]