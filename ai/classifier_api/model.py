import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModel


def mean_pooling(model_output, attention_mask):
    """
    Выполняет mean pooling для агрегирования эмбеддингов токенов на основе маски внимания.

    Аргументы:
        model_output (torch.Tensor): Выход модели, содержащий эмбеддинги всех токенов.
        attention_mask (torch.Tensor): Маска внимания, указывающая на валидные токены.

    Возвращает:
        torch.Tensor: Средние эмбеддинги, усреднённые по валидным токенам.
    """
    token_embeddings = model_output[0]  # Первый элемент содержит эмбеддинги токенов
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
    sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
    return sum_embeddings / sum_mask


class MultiTaskRuBERT(nn.Module):
    """
    Модель для многоуровневой классификации на основе RuBERT.

    Модель использует предобученный AutoModel для получения эмбеддингов токенов,
    а затем применяет два классификатора для двухуровневой классификации.

    Аргументы:
        model_name (str): Имя предобученной модели (например, из Hugging Face).
        n_classes_lvl1 (int): Количество классов для первого уровня классификации.
        n_classes_lvl2 (int): Количество классов для второго уровня классификации.
    """

    def __init__(self, model_name, n_classes_lvl1, n_classes_lvl2):
        """
        Инициализация модели: загрузка предобученного BERT и добавление классификаторов для двух уровней.

        Аргументы:
            model_name (str): Имя предобученной модели (например, из Hugging Face).
            n_classes_lvl1 (int): Количество классов для первого уровня классификации.
            n_classes_lvl2 (int): Количество классов для второго уровня классификации.
        """
        super(MultiTaskRuBERT, self).__init__()

        # Загрузка предобученного BERT
        self.bert = AutoModel.from_pretrained(model_name)

        # Замораживание большинства слоев, кроме последних слоев и pooler
        for name, param in self.bert.named_parameters():
            if not ("encoder.layer.12" in name or
                    "encoder.layer.13" in name or
                    "encoder.layer.14" in name or
                    "encoder.layer.15" in name or
                    "encoder.layer.16" in name or
                    "encoder.layer.17" in name or
                    "encoder.layer.18" in name or
                    "encoder.layer.19" in name or
                    "encoder.layer.20" in name or
                    "encoder.layer.21" in name or
                    "encoder.layer.22" in name or
                    "encoder.layer.23" in name or
                    "pooler" in name):
                param.requires_grad = False

        # Слой Dropout для регуляризации
        self.drop = nn.Dropout(p=0.05)

        # Классификаторы для уровней 1 и 2
        self.classifier_lvl1 = nn.Linear(self.bert.config.hidden_size, n_classes_lvl1)
        self.classifier_lvl2 = nn.Linear(self.bert.config.hidden_size, n_classes_lvl2)

    def forward(self, input_ids, attention_mask):
        """
        Прямой проход через модель.

        Аргументы:
            input_ids (torch.Tensor): Входные ID токенов (размерность: batch_size x seq_len).
            attention_mask (torch.Tensor): Маска внимания (размерность: batch_size x seq_len).

        Возвращает:
            Tuple[torch.Tensor, torch.Tensor]: Логиты для первого и второго уровня классификации.
        """
        # Получаем выходные эмбеддинги из BERT
        outputs = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask
        )

        # Используем pooler_output для представления последовательности
        pooled_output = outputs.pooler_output

        # Применяем Dropout для регуляризации
        output = self.drop(pooled_output)

        # Классификация на уровень 1 и уровень 2
        logits_lvl1 = self.classifier_lvl1(output)
        logits_lvl2 = self.classifier_lvl2(output)

        return logits_lvl1, logits_lvl2
