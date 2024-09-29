import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GetLlmAnswerDto {
    @ApiProperty({
        description: "Вопрос к боту",
        example: "Какие требования к Shorts?",
    })
    @IsString()
    question: string;
}

export class GetLlmAnswerResponseDto {
    @ApiProperty({
        description: "Ответ модели",
        example:
            "Длительность до 60 секунд. Вертикальная ориентация. Высота больше ширины.",
    })
    answer: string;

    @ApiProperty({ description: "Категория обращения", example: "ВИДЕО" })
    class_1: string;

    @ApiProperty({
        description: "Подкатегория обращения",
        example: "Загрузка видео",
    })
    class_2: string;
}
