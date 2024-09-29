import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from qdrant_client import QdrantClient
from qdrant_client.http.models import PointStruct, VectorParams, Distance
from transformers import AutoTokenizer, AutoModel
from typing import List

# Инициализация приложения FastAPI
app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Позволить доступ с любых доменов
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Загрузка токенизатора и модели
tokenizer = AutoTokenizer.from_pretrained("intfloat/multilingual-e5-large")
model = AutoModel.from_pretrained("intfloat/multilingual-e5-large")

# Инициализация клиента Qdrant
qdrant_client = QdrantClient(url="http://qdrantrag", port=6333)

# Pydantic модели
class AddCollectionsRequest(BaseModel):
    collections: List[str]

class RetrieveRequest(BaseModel):
    question: str
    collection_name: str
    top_k: int = 5

class Document(BaseModel):
    collection_name: str
    data: str
    topic_name: str
    answer: str = ""

class AddDocumentsRequest(BaseModel):
    documents: List[Document]

@app.post("/add_collections")
async def add_collections(request: AddCollectionsRequest):
    """
    Создание новых коллекций в Qdrant.

    Ожидает JSON с ключом 'collections', содержащим список коллекций.

    Возвращает JSON со списком успешно добавленных коллекций и тех, которые уже существуют.
    """
    result = {"added": [], "not_added": []}
    collections_list = get_existing_collections()

    for collection_name in request.collections:
        if collection_name not in collections_list:
            qdrant_client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=1024, distance=Distance.COSINE)
            )
            result['added'].append(collection_name)
        else:
            result['not_added'].append(collection_name)

    return result


@app.get("/get_collections")
async def get_collections():
    """
    Получение списка всех коллекций, существующих в Qdrant.

    Возвращает JSON со списком имен коллекций.
    """
    collections_list = get_existing_collections()
    return collections_list


@app.post("/get_retrieve")
async def get_retrieve(request: RetrieveRequest):
    """
    Поиск ближайших документов на основе векторного представления запроса.

    Ожидает JSON с ключами 'question' (текст запроса) и 'collection_name' (имя коллекции).

    Возвращает JSON со списком найденных документов.
    """
    results = retrieve_documents(request.question, model, tokenizer, request.collection_name, request.top_k)
    return {"near": results}


@app.post("/add_documents")
async def add_documents(request: AddDocumentsRequest):
    """
    Добавление новых документов в коллекцию Qdrant.

    Ожидает JSON с ключом 'documents', содержащим список документов, где каждый документ содержит:
    - 'collection_name': имя коллекции,
    - 'data': текст данных,
    - 'topic_name': название темы,
    - 'answer': (необязательное поле) текст ответа.

    Возвращает JSON с сообщением об успешном добавлении документов.
    """
    for document in request.documents:
        add_vector_to_bd(
            document.collection_name,
            document.data,
            {"topic_name": document.topic_name, "answer": document.answer}
        )
        add_vector_to_bd(
            "all",
            document.data,
            {"topic_name": document.topic_name, "answer": document.answer}
        )
    return {"message": "Documents added successfully"}


def add_vector_to_bd(collection_name, data, metadata):
    """
    Добавление новой точки в векторную базу данных Qdrant.

    - collection_name: имя коллекции для добавления.
    - data: текст документа.
    - metadata: метаданные для документа (напр. 'topic_name' и 'answer').
    """
    new_embedding = embed_documents([data], model, tokenizer).numpy().tolist()[0]
    new_id = qdrant_client.count(collection_name=collection_name).count
    new_point = PointStruct(id=new_id, vector=new_embedding, payload={"data": data, **metadata})
    qdrant_client.upsert(collection_name=collection_name, points=[new_point])


def embed_documents(documents, model, tokenizer):
    """
    Создание эмбеддингов для списка документов.

    - documents: список текстов для токенизации и создания эмбеддингов.

    Возвращает тензор эмбеддингов.
    """
    inputs = tokenizer(documents, return_tensors='pt', padding=True, truncation=True)
    with torch.no_grad():
        embeddings = model(**inputs).last_hidden_state.mean(dim=1)
    return embeddings


def retrieve_documents(query, model, tokenizer, collection_name, top_k):
    """
    Поиск документов на основе запроса.

    - query: текст запроса.
    - model: предобученная модель для генерации эмбеддингов.
    - tokenizer: токенизатор для преобразования текста запроса.
    - collection_name: имя коллекции для поиска.
    - top_k: количество топовых документов для возврата.

    Возвращает список найденных документов.
    """
    query_embedding = embed_documents([query], model, tokenizer).squeeze(0).tolist()
    search_result = qdrant_client.search(
        collection_name=collection_name,
        query_vector=query_embedding,
        limit=top_k
    )
    return [hit.payload for hit in search_result]


def get_existing_collections():
    """
    Получает список всех коллекций, существующих в Qdrant.

    Возвращает:
        List[str]: Список имен коллекций в Qdrant.
    """
    collections_list = []
    for collection in qdrant_client.get_collections():
        for c in list(collection[1]):
            collections_list.append(c.name)
    return collections_list


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5021)
