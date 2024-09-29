import { ApiProperty } from "@nestjs/swagger";

export class GetUserResponseDto {
    @ApiProperty({
        description: "Id пользователя",
        example: "d2a0ca88-4639-405b-9a79-b4496cc103aa",
    })
    id: string;

    @ApiProperty({ description: "Логин", example: "CatDev" })
    login: string;

    @ApiProperty({ description: "Почта", example: "r.maximka@mail.ru" })
    email: string;

    @ApiProperty({ description: "Имя", example: "Максим" })
    firstName: string;

    @ApiProperty({ description: "Фамилия", example: "Рожков" })
    secondName: string;

    @ApiProperty({ description: "Пароль", example: "P@ssw0rd" })
    password: string;
}
