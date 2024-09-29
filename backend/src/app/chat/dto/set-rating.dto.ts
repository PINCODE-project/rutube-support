import { IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SetRatingDto {
    @ApiProperty({
        description: "ID сообщения",
        example: "5014020b-2a53-4be2-b094-084567f2be2c",
    })
    @IsString()
    messageId: string;

    @ApiProperty({ description: "Рейтинг ответа", example: 5 })
    @IsNumber()
    rating: number;
}

export class SetRatingResponseDto {
    @ApiProperty({ description: "ID обращения", example: 123123123 })
    id: number;

    @ApiProperty({ description: "Рейтинг ответа", example: 5 })
    rating: number;
}
