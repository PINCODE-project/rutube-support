import { IsEnum, IsOptional } from "class-validator";
import { MessageStatusEnum } from "../entities/chat.entity";
import { ApiProperty } from "@nestjs/swagger";

export class GetAllChatsDto {
    @IsOptional()
    count?: number;

    @IsOptional()
    page?: string;

    @IsOptional()
    search?: string;

    @IsOptional()
    @IsEnum(MessageStatusEnum)
    status?: MessageStatusEnum;
}

export class GetAllChatsResponseDto {
    @ApiProperty({
        description: "ID чата",
        example: "856a287b-fb09-4be8-abfb-fbe5ef8a2c2c",
    })
    id: string;

    @ApiProperty({
        description: "Краткое описание обращения",
        example: "Краткая тема вопроса",
    })
    topic: number;

    @ApiProperty({
        description: "Статус обращения",
        example: "IN_PROGRESS",
        type: "enum",
        enum: MessageStatusEnum,
    })
    status: MessageStatusEnum;

    @ApiProperty({
        description: "Дата создания обращения",
        example: "2024-06-15T04:37:43.476Z",
    })
    createdAt: Date;
}
