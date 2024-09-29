import { Module } from "@nestjs/common";
import { StatisticService } from "./statistic.service";
import { StatisticController } from "./statistic.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Chat } from "../chat/entities/chat.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Chat])],
    controllers: [StatisticController],
    providers: [StatisticService],
})
export class StatisticModule {}
