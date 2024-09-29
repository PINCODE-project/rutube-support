import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
} from "@nestjs/common";
import { ChatService } from "./chat.service";
import { CreateChatDto, CreateChatResponseDto } from "./dto/create-chat.dto";
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import { getBadRequestErrors } from "../utils/getErrors";
import { GetChatDto, GetChatResponseDto } from "./dto/get-chat.dto";
import {
    GetAllChatsDto,
    GetAllChatsResponseDto,
} from "./dto/get-all-chats.dto";
import {
    GetLlmAnswerDto,
    GetLlmAnswerResponseDto,
} from "./dto/get-llm-answer.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SetRatingDto, SetRatingResponseDto } from "./dto/set-rating.dto";
import { SetMessageIdDto } from "./dto/set-message-id.dto";

@ApiTags("chat")
@Controller("chat")
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @ApiOperation({ summary: "Создание нового обращения" })
    @ApiCreatedResponse({
        description: "Обращение успешно создано.",
        type: CreateChatResponseDto,
    })
    @ApiResponse(
        getBadRequestErrors("Неверные данные", [
            {
                error: "The old chat message doesn't exist!",
                description: "Обращение не существует!",
            },
        ]),
    )
    @ApiBearerAuth()
    @Post()
    @UseGuards(JwtAuthGuard)
    createChatMessage(@Body() createChatDto: CreateChatDto) {
        return this.chatService.createChatMessage(createChatDto);
    }

    @ApiOperation({
        summary: "Получить ответ от модели",
        description:
            "Рест для тестирования AI API. Запрос не сохраняется в БД и не учитывается в статистике",
    })
    @ApiCreatedResponse({
        description: "Ответ успешно получен.",
        type: GetLlmAnswerResponseDto,
    })
    @ApiResponse(
        getBadRequestErrors("Неверные данные", [
            {
                error: "The product doesn't exist!",
                description: "Продукт не существует",
            },
        ]),
    )
    @Post("/predict")
    getLLMAnswer(@Body() getLlmAnswerDto: GetLlmAnswerDto) {
        return this.chatService.getLlmAnswer(getLlmAnswerDto);
    }

    @ApiOperation({ summary: "Получение всех обращений" })
    @ApiQuery({
        name: "count",
        type: Number,
        description: "Количество обращений на странице",
        required: false,
    })
    @ApiQuery({
        name: "page",
        type: Number,
        description: "Страница",
        required: false,
    })
    @ApiQuery({
        name: "search",
        type: String,
        description: "Поисковый запрос",
        required: false,
    })
    @ApiQuery({
        name: "status",
        type: String,
        description: "Статус обращений",
        required: false,
    })
    @ApiOkResponse({
        description: "Все обращения получены успешно!",
        type: GetAllChatsResponseDto,
        isArray: true,
    })
    @ApiResponse(
        getBadRequestErrors("Неверные данные", [
            {
                error: "The product doesn't exist!",
                description: "Продукт не существует",
            },
        ]),
    )
    @ApiBearerAuth()
    @Get()
    @UseGuards(JwtAuthGuard)
    findAll(@Query() getAllChatsDto: GetAllChatsDto) {
        return this.chatService.findAllChat(getAllChatsDto);
    }

    @ApiOperation({ summary: "Получение обращения" })
    @ApiResponse(
        getBadRequestErrors("Неверные данные", [
            {
                error: "The chat message doesn't exist!",
                description: "Обращение не существует",
            },
        ]),
    )
    @ApiOkResponse({
        description: "Получение истории чата",
        type: GetChatResponseDto,
    })
    @ApiBearerAuth()
    @Get(":chat_id")
    @UseGuards(JwtAuthGuard)
    findOne(@Param() getChatDto: GetChatDto) {
        return this.chatService.findOne(+getChatDto.chat_id);
    }

    @ApiOperation({ summary: "Привязка сообщения из tg к обращению" })
    @ApiResponse(
        getBadRequestErrors("Неверные данные", [
            {
                error: "The chat message doesn't exist!",
                description: "Обращение не существует",
            },
        ]),
    )
    @ApiBearerAuth()
    @Post("/set-message-id")
    @UseGuards(JwtAuthGuard)
    setMessageId(@Body() setMessageIdDto: SetMessageIdDto) {
        return this.chatService.setMessageId(setMessageIdDto);
    }

    @ApiOperation({ summary: "Оценка ответа модели" })
    @ApiResponse(
        getBadRequestErrors("Неверные данные", [
            {
                error: "The message doesn't exist!",
                description: "Сообщение не существует",
            },
        ]),
    )
    @ApiOkResponse({
        description: "Ответ успешно оценён",
        type: SetRatingResponseDto,
    })
    @ApiBearerAuth()
    @Post("/set-rating")
    @UseGuards(JwtAuthGuard)
    setRating(@Body() setRatingDto: SetRatingDto) {
        return this.chatService.setRating(setRatingDto);
    }
}
