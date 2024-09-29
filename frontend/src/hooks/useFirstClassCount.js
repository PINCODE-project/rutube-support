import { useQuery } from "@tanstack/react-query";
import { StatisticService } from "../services/statistic.service";

export function useFirstClassCount() {
    const { data, isLoading } = useQuery({
        queryKey: ["getFirstClassCount"],
        queryFn: () => StatisticService.getFirstClassCount(),
        select: (data) => data.data,
        refetchInterval: 10000,
    });

    return { firstClassCount: data, isLoading };
}
