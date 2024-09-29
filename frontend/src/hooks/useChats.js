import { useQuery } from "@tanstack/react-query";
import { ChatService } from "../services/chat.service";

export function useChats(page, status, search) {
    const { data, isLoading } = useQuery({
        queryKey: ["getChats", page, status, search],
        queryFn: () => ChatService.getChats(page, status, search),
        select: (data) => data.data,
        refetchInterval: 10000,
    });

    return { chats: data, isLoading };
}
