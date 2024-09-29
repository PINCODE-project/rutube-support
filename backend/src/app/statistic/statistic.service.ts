import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Chat, MessageStatusEnum } from "../chat/entities/chat.entity";

@Injectable()
export class StatisticService {
    constructor(
        @InjectRepository(Chat)
        private readonly chatRepository: Repository<Chat>,
    ) {}

    async findAllChatsCount() {
        const chats = await this.chatRepository.find();

        let allCount = 0;
        let resolvedCount = 0;
        let regenerateCount = 0;
        let inProgressCount = 0;

        for (const chat of chats) {
            allCount += 1;
            if (chat.status === MessageStatusEnum.RESOLVED) resolvedCount += 1;
            if (chat.status === MessageStatusEnum.REGENERATE)
                regenerateCount += 1;
            if (chat.status === MessageStatusEnum.IN_PROGRESS)
                resolvedCount += 1;
        }

        return {
            allCount,
            resolvedCount,
            regenerateCount,
            inProgressCount,
        };
    }

    async findFirstClass() {
        const requests = await this.chatRepository.find();
        const result = {};
        for (let request of requests) {
            if (Object.keys(result).indexOf(request.firstClass) !== -1) {
                result[request.firstClass] += 1;
            } else {
                if (request.firstClass) result[request.firstClass] = 1;
            }
        }

        return result;
    }

    async findSecondClass(firstClassFilter: string) {
        const requests = await this.chatRepository.find(
            firstClassFilter
                ? {
                      where: {
                          firstClass: firstClassFilter,
                      },
                  }
                : {},
        );
        const result = {};
        for (let request of requests) {
            if (Object.keys(result).indexOf(request.secondClass) !== -1) {
                result[request.secondClass] += 1;
            } else {
                if (request.secondClass) result[request.secondClass] = 1;
            }
        }

        return result;
    }
}
