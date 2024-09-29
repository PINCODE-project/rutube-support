import { IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateChatDto {
    @ApiProperty({
        description: "Вопрос пользователя",
        example: "Какие требования к Shorts?",
    })
    @IsString()
    question: string;

    @ApiProperty({
        description: "ID telegram пользователя",
        example: "123123324123",
    })
    @IsString()
    userId: string;

    @ApiProperty({ description: "ФИО пользователя", example: "Рожков Максим" })
    @IsString()
    fullName: string;

    @ApiProperty({ description: "Логин пользователя", example: "@catdevelop" })
    @IsString()
    userName: string;

    @ApiProperty({
        description: "ID сообщения, если перегенерируем прошлый запрос",
        example: "8fc6e7b0-fabd-486e-b7aa-411cf8b173d8",
    })
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    oldMessageId?: string;
}

export class CreateChatResponseDto {
    @ApiProperty({
        description: "ID созданного обращения",
        example: "8fc6e7b0-fabd-486e-b7aa-411cf8b173d8",
    })
    chatId: string;

    @ApiProperty({
        description: "Ответ модели",
        example:
            "Длительность до 60 секунд. Вертикальная ориентация. Высота больше ширины.",
    })
    answer: string;

    @ApiProperty({ description: "Категория обращения", example: "ВИДЕО" })
    firstClass: string;

    @ApiProperty({
        description: "Подкатегория обращения",
        example: "Загрузка видео",
    })
    secondClass: string;

    @ApiProperty({
        description: "Ссылка на WebApp",
        example: "http://example.com",
    })
    form?: string | null;
}
