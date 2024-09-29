from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain.chains import LLMChain
from models import Messages, Message

def generate_chat_response(model, messages: Messages):
    """
    Генерация ответа на основе сообщений пользователя и системных подсказок с использованием модели.

    Аргументы:
        model (ChatLlamaCpp): Инициализированная модель для генерации ответов.
        messages (Messages): Объект сообщений с ролью и содержимым.

    Возвращает:
        str: Сгенерированный ответ модели.
    """
    messages_for_model = ""
    system_prompt = ""
    for message in messages.messages:
        if message.role == "system":
            system_prompt = message.content
        elif message.role == "assistant":
            messages_for_model+=f""""<|assistant|>
            {message.content}<|end|>)"""
        else:
            messages_for_model+=f""""<|user|>
            {message.content}<|end|>)"""

    prompt_template = """"<|system|>
    {system}<|end|>
    {messages}
    <|assistant|>
    """
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "messages"])
    chain = (prompt | model | StrOutputParser())
    result = chain.invoke({"system": system_prompt, "messages": messages_for_model})
    return result
