import { AreaChart } from "@mantine/charts";
import { getDayPreset, getMonthPreset, getYearPreset } from "../../../../core/utils/getPresets";

const DateCountChart = ({ chats, period }) => {
    const getData = () => {
        let dict = {};
        let result = [];

        console.log(chats);
        if (period === "day") dict = getDayPreset();

        if (period === "month") dict = getMonthPreset();

        if (period === "year") dict = getYearPreset();

        chats.forEach((chat) => {
            let chatDate;
            if (period === "day") {
                chatDate = `${("0" + new Date(chat.createdAt).getHours()).slice(-2)}:00`;
            }

            if (period === "month")
                chatDate = `${("0" + new Date(chat.createdAt).getDate()).slice(-2)}.${("0" + (new Date(chat.createdAt).getMonth() + 1)).slice(-2)}`;

            if (period === "year")
                chatDate = `${("0" + (new Date(chat.createdAt).getMonth() + 1)).slice(-2)}.${new Date(chat.createdAt).getFullYear()}`;

            if (Object.keys(dict).indexOf(chatDate) !== -1) dict[chatDate] += 1;
            else dict[chatDate] = 1;
        });

        for (let key in dict) if (dict.hasOwnProperty(key)) result.push({ date: key, count: dict[key] });

        return result;
    };

    return (
        <AreaChart
            h={300}
            data={getData(chats)}
            dataKey="date"
            series={[
                {
                    name: "count",
                    label: "Количество обращений",
                    color: "indigo.6",
                },
            ]}
            curveType="linear"
            connectNulls={true}
        />
    );
};

export default DateCountChart;
