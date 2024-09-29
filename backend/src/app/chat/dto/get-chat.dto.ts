import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { MessageStatusEnum } from "../entities/chat.entity";

export class GetChatDto {
    // Path param
    @ApiProperty({ description: "Id обращения", example: 123123 })
    @IsString()
    chat_id: string;
}

export class GetChatResponseDto {
    @ApiProperty({
        description: "Id чата",
        example: "ae4b87a4-96fc-464a-af26-d773aad77bda",
    })
    id: string;

    @ApiProperty({
        description: "Краткое описание",
        example: "Тестовый вопрос",
    })
    topic: string;

    @ApiProperty({ description: "Статус", example: "RESOLVED" })
    status: MessageStatusEnum;

    @ApiProperty({
        description: "Дата создания обращения",
        example: "2024-06-15T04:37:43.476Z",
    })
    createdAt: Date;
}
