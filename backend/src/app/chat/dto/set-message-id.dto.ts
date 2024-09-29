import { IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SetMessageIdDto {
    @ApiProperty({ description: "ID обращения", example: 123123 })
    @IsNumber()
    id: number;

    @ApiProperty({
        description: "ID сообщения",
        example: "5014020b-2a53-4be2-b094-084567f2be2c",
    })
    @IsString()
    messageId: string;
}
