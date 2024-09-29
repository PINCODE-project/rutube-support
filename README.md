<p align="center">
  <img align="center" src="https://github.com/PINCODE-project/rutube-support/blob/main/service/Logo.png?raw=true" alt="Logo" style="width:500px;"/>
</p>

🤯 Сложность веб сервисов растет с каждым, не всегда можно легко найти какие-то функции в сервисе. Из-за этого растет потребность в техподдержке для этих сервисов. Но большинство вопросов, задаваемых пользователями, являются либо типовыми, либо уже описаны в базе знаний продукта.

💪 Мы разработали ИИ-помощник, позволяющий сократить время ответа технической поддержки до 30-60 секунд. Наш ИИ-помощник сам найдет правильный ответ в базе знаний и составит ответ, который невозможно отличить от человеческого. Специалисту только останется перепроверить ответ и отправить его пользователю.

💯 Немного цифр:
- Cреднее время получения ответа – 5 секунд
- Наша система способна обрабатывать более 20000 запросов за сутки
- Точность классификации ответов около 85%, а точность самого ответа около 70%

🥸 Такая скорость и точность ответа достигается благодаря тому, что мы не пытаемся искать ответ по всей базе знаний. С помощью дообученного нами классификатора мы определяем тему обращения и производим поиск наиболее близких ответов. Далее большая языковая модель обрабатывает эти данные и генерирует ответ.

😎 Помимо ИИ-помощника в нашем решение также предусмотрена уникальная функция аналитики обращений, что позволяет наглядно увидеть пользу от нашего продукта.

Вся наша система обёрнута в docker-compose, что позволяет легко развернуть её на любом сервере.

СТЕК:
LLM Phi-3-medium-128k-instruct-GGUF, BERT, intfloat/multilingual-e5-large, Docker, Qdrant, FastAPI, PyTorch, LangChain, Cuda, Uvicorn, LlamaCpp, React, NestJs

## Основные ссылки

[Телеграм бот](https://t.me/rutube_support_pincode_bot)

[Админ панель](https://rutube.pincode-dev.ru/) (Логин: RutubeAdmin |
Пароль: RutubeP@ssw0rd)

[Бэкенд для хранения статистики и истории обращений](https://rutube.pincode-dev.ru/backend/)

[Документация для бэкенда](https://rutube.pincode-dev.ru/backend/core/docs)
(Логин: RutubeAdmin |
Пароль: RutubeP@ssw0rd)


[Документация AI-API](https://hack-rutube-docs.pincode-dev.ru) (Дополнительно есть коллекция для Postman в репозитории)


## Иллюстрации

![Demo1](https://github.com/PINCODE-project/rutube-support/blob/main/service/Demo1.png?raw=true "Rutube")
![Demo2](https://github.com/PINCODE-project/rutube-support/blob/main/service/Demo2.png?raw=true "Rutube")
![Demo3](https://github.com/PINCODE-project/rutube-support/blob/main/service/Demo3.png?raw=true "Rutube")
![Demo4](https://github.com/PINCODE-project/rutube-support/blob/main/service/Demo4.png?raw=true "Rutube")

## Нагрузочное тестирование

![Test](https://github.com/PINCODE-project/rutube-support/blob/main/service/Demo5.png?raw=true "Rutube")

