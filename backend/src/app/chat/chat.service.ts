import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
} from "@nestjs/common";
import { CreateChatDto } from "./dto/create-chat.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Raw, Repository } from "typeorm";
import { Chat, MessageStatusEnum } from "./entities/chat.entity";
import { GetLlmAnswerDto } from "./dto/get-llm-answer.dto";
import axios from "axios";
import { SetRatingDto } from "./dto/set-rating.dto";
import { SetMessageIdDto } from "./dto/set-message-id.dto";
import { GetAllChatsDto } from "./dto/get-all-chats.dto";

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Chat)
        private readonly chatRepository: Repository<Chat>,
    ) {}

    async isCreateById(id: number) {
        const chat = await this.chatRepository.findOneBy({ id });
        return !!chat;
    }

    async createChatMessage(dto: CreateChatDto) {
        const newChatMessage = {
            question: dto.question,
            userId: dto.userId,
            fullName: dto.fullName,
            userName: dto.userName,
            firstClass: "",
            secondClass: "",
            answer: "",
        };

        if (dto.oldMessageId) {
            const chatMessage = await this.chatRepository.findOne({
                where: { messageId: dto.oldMessageId },
            });
            if (!chatMessage)
                throw new BadRequestException(
                    "The old chat message doesn't exist!",
                );

            await this.chatRepository.update(chatMessage.id, {
                status: MessageStatusEnum.REGENERATE,
            });

            newChatMessage.question = chatMessage.question;
            newChatMessage.userId = chatMessage.userId;
            newChatMessage.fullName = chatMessage.fullName;
            newChatMessage.userName = chatMessage.userName;
        }

        const answer = await this.getLlmAnswer({
            question: newChatMessage.question,
        });

        if (!answer) throw new InternalServerErrorException();

        newChatMessage.answer = answer["answer"];
        newChatMessage.firstClass = answer["class_1"];
        newChatMessage.secondClass = answer["class_2"];

        return await this.chatRepository.save(newChatMessage);
    }

    async getLlmAnswer(dto: GetLlmAnswerDto) {
        try {
            const response = await axios.post(
                "https://rutube.pincode-dev.ru/ai-api/predict",
                {
                    question: dto.question,
                },
            );

            return {
                answer: response?.data.answer,
                class_1: response?.data.class_1,
                class_2: response?.data.class_2,
            };
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async findAllChat(dto: GetAllChatsDto) {
        const getSearchQuery = (search: string) =>
            Raw((alias) => `LOWER(${alias}) Like LOWER(:value)`, {
                value: `%${search}%`,
            });

        const filter: FindManyOptions<Chat> = {
            where: {},
            order: {
                createdAt: "desc",
            },
        };

        if (dto.page && dto.count) {
            filter["skip"] = +dto.count * (+dto.page - 1);
            filter["take"] = +dto.count;
        }

        if (dto.status)
            filter["where"] = { ...filter["where"], status: dto.status };

        if (dto.search)
            filter["where"] = {
                ...filter["where"],
                question: getSearchQuery(dto.search),
            };

        const chats = await this.chatRepository.find(filter);
        const totalCount = await this.chatRepository.count({
            where: {
                status: dto.status,
                question: dto.search ? getSearchQuery(dto.search) : undefined,
            },
        });

        return {
            chats,
            totalChatsCount: totalCount,
            pageCount: Math.ceil(totalCount / dto.count),
        };
    }

    async findOne(id: number) {
        if (!(await this.isCreateById(id)))
            throw new BadRequestException("The chat message doesn't exist!");

        return await this.chatRepository.findOne({
            where: { id: id },
        });
    }

    async setMessageId(dto: SetMessageIdDto) {
        if (!(await this.isCreateById(dto.id)))
            throw new BadRequestException("The chat message doesn't exist!");

        await this.chatRepository.update(dto.id, { messageId: dto.messageId });
    }

    async setRating(dto: SetRatingDto) {
        const chatMessage = await this.chatRepository.findOne({
            where: { messageId: dto.messageId },
        });
        if (!chatMessage)
            throw new BadRequestException("The message doesn't exist!");

        await this.chatRepository.update(chatMessage.id, {
            status: MessageStatusEnum.RESOLVED,
            rating: dto.rating,
        });

        return {
            id: chatMessage.id,
            rating: dto.rating,
        };
    }
}
