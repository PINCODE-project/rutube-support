import styles from "./ChatsPage.module.css";
import { Accordion, Group, Loader, Pagination, Select, Stack } from "@mantine/core";
import { useChats } from "../../../../hooks/useChats";
import ChatItem from "../../components/ChatItem/ChatItem";
import { useState } from "react";

const Statuses = {
    "Все статусы": undefined,
    "Не закрыто": "IN_PROGRESS",
    "Перегенерировано": "REGENERATE",
    "Оценено": "RESOLVED",
};

const ChatsPage = () => {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("Все статусы");
    const [search, setSearch] = useState("");
    const { chats, isLoading: isLoadingChats } = useChats(
        page,
        Statuses[status],
        search ? search : undefined,
    );

    const getItems = (items) => items.map((item) => <ChatItem item={item} key={`chat${item.id}`} />);

    return (
        <div className={styles.container}>
            <Stack>
                <h1 className={styles.title}>История обращений</h1>

                <Group>
                    <Select
                        radius="md"
                        label="Статус обращения"
                        placeholder="Статус обращения"
                        data={["Все статусы", "Не закрыто", "Перегенерировано", "Оценено"]}
                        allowDeselect={false}
                        value={status}
                        onChange={(value) => {
                            setStatus(value);
                            setPage(1);
                        }}
                    />
                </Group>

                {isLoadingChats && <Loader />}

                {!isLoadingChats && (
                    <Accordion variant="separated" radius="lg">
                        {getItems(chats.chats)}
                    </Accordion>
                )}

                {!isLoadingChats && (
                    <Group justify="end">
                        <Pagination total={chats.pageCount} value={page} onChange={setPage} mt="sm" />
                    </Group>
                )}
            </Stack>
        </div>
    );
};

export default ChatsPage;
