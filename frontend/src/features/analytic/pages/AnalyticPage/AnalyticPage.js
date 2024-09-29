import styles from "./AnalyticPage.module.css";
import { Group, Loader, Select, Stack, Text } from "@mantine/core";
import DateCountChart from "../../components/DateCountChart/DateCountChart";
import { useChats } from "../../../../hooks/useChats";
import { useCallback, useState } from "react";
import RatingCountChart from "../../components/RatingCountChart/RatingCountChart";
import InfoBlocks from "../../components/InfoBlocks/InfoBlocks";
import WordCloudChart from "../../components/WordcloudChart/WordcloudChart";
import { useFirstClassCount } from "../../../../hooks/useFirstClassCount";
import { useSecondClassCount } from "../../../../hooks/useSecondClassCount";
import { useChatsCount } from "../../../../hooks/useChatsCount";

const periods = {
    "За сегодня": "day",
    "За месяц": "month",
    "За год": "year",
};

const AnalyticPage = () => {
    const [dateCountChartPeriod, setDateCountChartPeriod] = useState("За сегодня");
    const [firstClassFilter, setFirstClassFilter] = useState("Все категории");

    const { chats, isLoading: isLoadingChats } = useChats();
    const { firstClassCount, isLoading: isLoadingFirstClassCount } = useFirstClassCount();
    const { secondClassCount, isLoading: isLoadingSecondClassCount } = useSecondClassCount(firstClassFilter);
    const { chatsCount, isLoading: isLoadingChatsCount } = useChatsCount();

    const onWordClick = useCallback((e) => {
        setFirstClassFilter(e.text);
    }, []);

    return (
        <div className={styles.container}>
            <Stack>
                <h1 className={styles.title}>Аналитика</h1>

                {isLoadingChats && <Loader />}

                <Stack gap={100}>
                    {!isLoadingChatsCount && <InfoBlocks info={chatsCount} />}

                    {!isLoadingChats && (
                        <Stack>
                            <Group justify="space-between">
                                <Text>Количество обращений</Text>
                                <Select
                                    radius="md"
                                    label="Выборка данных"
                                    data={["За сегодня", "За месяц", "За год"]}
                                    allowDeselect={false}
                                    onChange={setDateCountChartPeriod}
                                    value={dateCountChartPeriod}
                                />
                            </Group>

                            <DateCountChart chats={chats.chats} period={periods[dateCountChartPeriod]} />
                        </Stack>
                    )}

                    {!isLoadingChats && (
                        <Stack>
                            <Group justify="space-between">
                                <Text>Количество оценок</Text>
                            </Group>

                            <RatingCountChart chats={chats.chats} period={periods[dateCountChartPeriod]} />
                        </Stack>
                    )}

                    {!isLoadingFirstClassCount && firstClassCount && (
                        <Stack>
                            <Text>Количество обращений по категории (Класс 1)</Text>
                            <WordCloudChart classCount={firstClassCount} onWordClick={onWordClick} />
                        </Stack>
                    )}

                    <Stack>
                        <Group justify="space-between">
                            <Text>Количество обращений по подкатегории (Класс 2)</Text>
                            {firstClassCount && (
                                <Select
                                    radius="md"
                                    label="Выборка данных"
                                    data={["Все категории", ...Object.keys(firstClassCount)]}
                                    allowDeselect={false}
                                    onChange={setFirstClassFilter}
                                    value={firstClassFilter}
                                />
                            )}
                        </Group>

                        {!isLoadingSecondClassCount && <WordCloudChart classCount={secondClassCount} />}
                        {isLoadingSecondClassCount && (
                            <div className={styles.wordCloudContainer}>
                                <Loader />
                            </div>
                        )}
                    </Stack>
                </Stack>
            </Stack>
        </div>
    );
};

export default AnalyticPage;
