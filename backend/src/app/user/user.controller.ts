import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto, CreateUserResponseDto } from "./dto/create-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiExcludeEndpoint,
    ApiOkResponse,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import { getBadRequestErrors, getUnauthorizedError } from "../utils/getErrors";
import { GetUserResponseDto } from "./dto/get-user.dto";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @ApiExcludeEndpoint()
    @ApiTags("auth")
    @ApiOperation({ summary: "Регистрация нового пользователя" })
    @ApiBody({ type: CreateUserDto })
    @ApiCreatedResponse({
        description: "Пользователь успешно создан.",
        type: CreateUserResponseDto,
    })
    @ApiResponse(
        getBadRequestErrors("Неверные данные", [
            {
                error: "This email already exist!",
                description: "Почта уже существует",
            },
            {
                error: "This login already exist!",
                description: "Логин уже существует",
            },
        ]),
    )
    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @ApiTags("user")
    @ApiOperation({ summary: "Получение профиля пользователя" })
    @ApiOkResponse({
        description: "Профиль успешно получен",
        type: GetUserResponseDto,
    })
    @ApiResponse(
        getBadRequestErrors("Неверные данные", [
            {
                error: "The user is not found!",
                description: "Пользователь не найден",
            },
        ]),
    )
    @ApiResponse(getUnauthorizedError())
    @ApiBearerAuth()
    @Get("/")
    @UseGuards(JwtAuthGuard)
    findOneByAccessToken(@Req() req) {
        return this.userService.findOneById(req.user.id);
    }
}
