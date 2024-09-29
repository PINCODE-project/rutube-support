import { Accordion, ActionIcon, Group, Rating, Stack, Text } from "@mantine/core";
import { IconCopy, IconReload } from "@tabler/icons-react";
import styles from "./ChatItem.module.css";
import { notifications } from "@mantine/notifications";
import { useClipboard } from "@mantine/hooks";

const ChatItem = ({ item }) => {
    const clipboard = useClipboard();

    const handleCopyAnswer = (answer) => {
        clipboard.copy(answer);
        notifications.show({
            color: "green",
            title: "Сообщение успешно скопировано! 🌟",
        });
    };

    return (
        <Accordion.Item key={`chat${item.id}`} value={`chat${item.id}`}>
            <Accordion.Control>
                <Group justify="space-between" pr={20}>
                    <Stack gap={2}>
                        <Text fz="md" lh="md">
                            Обращение №{item.id}
                        </Text>
                        <Text fz="md" lh="md" className={styles.date}>
                            {new Date(item.createdAt).toLocaleString("ru-RU")}
                        </Text>
                    </Stack>
                    {item.status === "RESOLVED" && item.rating && (
                        <Text fz="md" lh="md">
                            <Rating value={item.rating} readOnly />
                        </Text>
                    )}
                    {item.status === "REGENERATE" && <IconReload />}
                </Group>
            </Accordion.Control>
            <Accordion.Panel>
                <Stack>
                    <Stack gap={2}>
                        <Text fz="md" lh="md" fw="bold">
                            Информация о пользователе:
                        </Text>
                        <Text fz="md" lh="md">
                            Telegram ID: {item.userId}
                        </Text>
                        <Text fz="md" lh="md">
                            Логин пользователя: {item.userName}
                        </Text>
                        <Text fz="md" lh="md">
                            ФИ пользователя: {item.fullName}
                        </Text>
                    </Stack>

                    <Stack gap={2}>
                        <Text fz="md" lh="md">
                            <b>Категория:</b> {item.firstClass}
                        </Text>
                        <Text fz="md" lh="md">
                            <b>Подкатегория:</b> {item.secondClass}
                        </Text>
                    </Stack>

                    <Stack gap={2}>
                        <Text fz="md" lh="md">
                            <b>Вопрос:</b>
                        </Text>
                        <Text fz="md" lh="md" className={styles.textbox}>
                            {item.question}
                        </Text>
                    </Stack>
                    <Stack gap={2}>
                        <Text fz="md" lh="md">
                            <b>Ответ:</b>
                        </Text>
                        <div className={styles.answer}>
                            {item.answer}
                            <ActionIcon
                                className={styles.copyButton}
                                variant="light"
                                color="gray"
                                onClick={() => handleCopyAnswer(item.answer)}
                            >
                                <IconCopy />
                            </ActionIcon>
                        </div>
                    </Stack>
                </Stack>
            </Accordion.Panel>
        </Accordion.Item>
    );
};

export default ChatItem;
