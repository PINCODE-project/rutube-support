import { useQuery } from "@tanstack/react-query";
import { StatisticService } from "../services/statistic.service";

export function useChatsCount() {
    const { data, isLoading } = useQuery({
        queryKey: ["getChatsCount"],
        queryFn: () => StatisticService.getChatsCount(),
        select: (data) => data.data,
        refetchInterval: 10000,
    });

    return { chatsCount: data, isLoading };
}
