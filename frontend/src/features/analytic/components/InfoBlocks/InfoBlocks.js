import { Group, Paper, Text, Title } from "@mantine/core";

const InfoBlocks = ({ info }) => {
    return (
        <Group>
            <Paper shadow="md" radius="lg" withBorder p="xl">
                <Title order={3}>Всего обращений</Title>
                <Text fz={32}>{info.allCount}</Text>
            </Paper>

            <Paper shadow="md" radius="lg" withBorder p="xl">
                <Title order={3}>Перегенерированных обращений</Title>
                <Text fz={32}>{info.regenerateCount}</Text>
            </Paper>

            <Paper shadow="md" radius="lg" withBorder p="xl">
                <Title order={3}>Обращений с оценкой</Title>
                <Text fz={32}>{info.resolvedCount}</Text>
            </Paper>
        </Group>
    );
};

export default InfoBlocks;
