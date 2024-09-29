import { useQuery } from "@tanstack/react-query";
import { StatisticService } from "../services/statistic.service";

export function useSecondClassCount(firstClassFilter) {
    const { data, isLoading } = useQuery({
        queryKey: ["getSecondClassCount", firstClassFilter],
        queryFn: () => StatisticService.getSecondClassCount(firstClassFilter),
        select: (data) => data.data,
        refetchInterval: 10000,
    });

    return { secondClassCount: data, isLoading };
}
