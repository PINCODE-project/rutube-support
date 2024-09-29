import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { StatisticService } from "./statistic.service";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("statistic")
@Controller("statistic")
export class StatisticController {
    constructor(private readonly statisticService: StatisticService) {}

    @ApiBearerAuth()
    @Get("chats-count")
    @UseGuards(JwtAuthGuard)
    findRequestsCount() {
        return this.statisticService.findAllChatsCount();
    }

    @ApiOperation({ summary: "Получение количества категорий" })
    @ApiBearerAuth()
    @Get("class/first-count")
    @UseGuards(JwtAuthGuard)
    findFirstClass() {
        return this.statisticService.findFirstClass();
    }

    @ApiOperation({ summary: "Получение количества подкатегорий" })
    @ApiBearerAuth()
    @Get("class/second-count")
    @UseGuards(JwtAuthGuard)
    findSecondClass(@Query("firstClassFilter") firstClassFilter: string) {
        return this.statisticService.findSecondClass(firstClassFilter);
    }
}
