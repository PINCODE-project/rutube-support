from transformers import BertTokenizer, BertModel
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from transformers import AdamW
from tqdm import tqdm
import numpy as np
import pandas as pd

# Используем для загрузки данных
class MultiLabelDataset(Dataset):
    def __init__(self, texts, labels_lvl1, labels_lvl2, tokenizer, max_len):
        self.texts = texts
        self.labels_lvl1 = labels_lvl1
        self.labels_lvl2 = labels_lvl2
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, item):
        text = self.texts[item]
        label_lvl1 = self.labels_lvl1[item]
        label_lvl2 = self.labels_lvl2[item]

        encoding = self.tokenizer.encode_plus(
            text,
            add_special_tokens=True,
            max_length=self.max_len,
            return_token_type_ids=False,
            padding='max_length',
            return_attention_mask=True,
            return_tensors='pt',
            truncation=True
        )

        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'label_lvl1': torch.tensor(label_lvl1, dtype=torch.long),
            'label_lvl2': torch.tensor(label_lvl2, dtype=torch.long)
        }

def calculate_correct_predictions(preds, labels):
    _, preds_max = torch.max(preds, dim=1)
    correct = torch.eq(preds_max, labels).sum().item()
    return correct

# Функция для тренировки
def train_epoch(model, data_loader, loss_fn, optimizer, device, scheduler, n_examples):
    model.train()
    losses = []
    correct_predictions_lvl1 = 0
    correct_predictions_lvl2 = 0
    total_examples = 0  # Общее количество обработанных примеров

    # Прогресс-бар с использованием tqdm
    loop = tqdm(data_loader, leave=True, total=len(data_loader))
    
    for batch_idx, d in enumerate(loop):
        input_ids = d["input_ids"].to(device)
        attention_mask = d["attention_mask"].to(device)
        labels_lvl1 = d["label_lvl1"].to(device)
        labels_lvl2 = d["label_lvl2"].to(device)

        # Получаем предсказания модели
        outputs_lvl2 = model(
            input_ids=input_ids,
            attention_mask=attention_mask
        )

        # Считаем потери для обоих классов
        loss_lvl1 = loss_fn(outputs_lvl2, labels_lvl2)
        # loss_lvl2 = loss_fn(outputs_lvl2, labels_lvl2)
        # loss = (loss_lvl1 + loss_lvl2) / 2
        loss = loss_lvl1

        # Считаем количество правильных предсказаний
        batch_correct_lvl1 = calculate_correct_predictions(outputs_lvl2, labels_lvl2)
        correct_predictions_lvl1 += batch_correct_lvl1
        batch_size = labels_lvl2.size(0)
        total_examples += batch_size
        losses.append(loss.item())

        # Обратное распространение ошибки
        loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

        # Шаг оптимизации и обновление scheduler
        optimizer.step()
        scheduler.step()

        # Сбрасываем градиенты
        optimizer.zero_grad()

        # Обновляем прогресс-бар и выводим текущие значения потерь и точности
        loop.set_description(f"Batch {batch_idx + 1}/{len(data_loader)}")
        loop.set_postfix({
            'loss': loss.item(),
            'acc_lvl1': correct_predictions_lvl1 / total_examples,
            # 'acc_lvl2': correct_predictions_lvl2 / total_examples
        })

    # Возвращаем среднюю точность и потери
    return correct_predictions_lvl1 / total_examples, np.mean(losses)

# Функция для валидации
def eval_model(model, data_loader, loss_fn, device, n_examples):
    model.eval()
    losses = []
    correct_predictions_lvl1 = 0
    correct_predictions_lvl2 = 0
    total_examples = 0  # Общее количество обработанных примеров

    with torch.no_grad():
        for d in data_loader:
            input_ids = d["input_ids"].to(device)
            attention_mask = d["attention_mask"].to(device)
            labels_lvl1 = d["label_lvl1"].to(device)
            labels_lvl2 = d["label_lvl2"].to(device)

            outputs_lvl2 = model(
                input_ids=input_ids,
                attention_mask=attention_mask
            )

            loss_lvl1 = loss_fn(outputs_lvl2, labels_lvl2)
            # loss_lvl2 = loss_fn(outputs_lvl2, labels_lvl2)
            # loss = (loss_lvl1 + loss_lvl2) / 2
            loss = loss_lvl1

            # Считаем количество правильных предсказаний
            batch_correct_lvl1 = calculate_correct_predictions(outputs_lvl2, labels_lvl2)
            correct_predictions_lvl1 += batch_correct_lvl1
            batch_size = labels_lvl2.size(0)
            total_examples += batch_size
            losses.append(loss.item())

    # Возвращаем среднюю точность и потери
    return correct_predictions_lvl1 / total_examples, np.mean(losses)


def train_epoch_v2(model, data_loader, loss_fn, optimizer, device, scheduler, n_examples):
    model.train()
    losses = []
    correct_predictions_lvl1 = 0
    correct_predictions_lvl2 = 0
    total_examples = 0  # Общее количество обработанных примеров

    # Прогресс-бар с использованием tqdm
    loop = tqdm(data_loader, leave=True, total=len(data_loader))

    for batch_idx, d in enumerate(loop):
        input_ids = d["input_ids"].to(device)
        attention_mask = d["attention_mask"].to(device)
        labels_lvl1 = d["label_lvl1"].to(device)
        labels_lvl2 = d["label_lvl2"].to(device)

        # Получаем предсказания модели
        outputs_lvl1, outputs_lvl2 = model(
            input_ids=input_ids,
            attention_mask=attention_mask
        )

        # Считаем потери для обоих классов
        loss_lvl1 = loss_fn(outputs_lvl1, labels_lvl1)
        loss_lvl2 = loss_fn(outputs_lvl2, labels_lvl2)
        loss = (loss_lvl1 + loss_lvl2) / 2

        # Считаем количество правильных предсказаний
        batch_correct_lvl1 = calculate_correct_predictions(outputs_lvl1, labels_lvl1)
        batch_correct_lvl2 = calculate_correct_predictions(outputs_lvl2, labels_lvl2)
        correct_predictions_lvl1 += batch_correct_lvl1
        correct_predictions_lvl2 += batch_correct_lvl2
        batch_size = labels_lvl1.size(0)
        total_examples += batch_size
        losses.append(loss.item())

        # Обратное распространение ошибки
        loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

        # Шаг оптимизации и обновление scheduler
        optimizer.step()
        scheduler.step()

        # Сбрасываем градиенты
        optimizer.zero_grad()

        # Обновляем прогресс-бар и выводим текущие значения потерь и точности
        loop.set_description(f"Batch {batch_idx + 1}/{len(data_loader)}")
        loop.set_postfix({
            'loss': loss.item(),
            'acc_lvl1': correct_predictions_lvl1 / total_examples,
            'acc_lvl2': correct_predictions_lvl2 / total_examples
        })

    # Возвращаем среднюю точность и потери
    return correct_predictions_lvl1 / total_examples, correct_predictions_lvl2 / total_examples, np.mean(losses)

# Функция для валидации
def eval_model_v2(model, data_loader, loss_fn, device, n_examples):
    model.eval()
    losses = []
    correct_predictions_lvl1 = 0
    correct_predictions_lvl2 = 0
    total_examples = 0  # Общее количество обработанных примеров

    with torch.no_grad():
        for d in data_loader:
            input_ids = d["input_ids"].to(device)
            attention_mask = d["attention_mask"].to(device)
            labels_lvl1 = d["label_lvl1"].to(device)
            labels_lvl2 = d["label_lvl2"].to(device)

            outputs_lvl1, outputs_lvl2 = model(
                input_ids=input_ids,
                attention_mask=attention_mask
            )

            loss_lvl1 = loss_fn(outputs_lvl1, labels_lvl1)
            loss_lvl2 = loss_fn(outputs_lvl2, labels_lvl2)
            loss = (loss_lvl1 + loss_lvl2) / 2

            # Считаем количество правильных предсказаний
            batch_correct_lvl1 = calculate_correct_predictions(outputs_lvl1, labels_lvl1)
            batch_correct_lvl2 = calculate_correct_predictions(outputs_lvl2, labels_lvl2)
            correct_predictions_lvl1 += batch_correct_lvl1
            correct_predictions_lvl2 += batch_correct_lvl2
            batch_size = labels_lvl1.size(0)
            total_examples += batch_size
            losses.append(loss.item())

    # Возвращаем среднюю точность и потери
    return correct_predictions_lvl1 / total_examples, correct_predictions_lvl2 / total_examples, np.mean(losses)