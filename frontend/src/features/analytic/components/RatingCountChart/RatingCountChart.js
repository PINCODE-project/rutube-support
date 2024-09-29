import { BarChart } from "@mantine/charts";

const RatingCountChart = ({ chats, period }) => {
    const getData = () => {
        let dict = {
            "Оценка 1": 0,
            "Оценка 2": 0,
            "Оценка 3": 0,
            "Оценка 4": 0,
            "Оценка 5": 0,
            "Перегенерировано": 0,
            "Нет оценки": 0,
        };
        let result = [];

        chats.forEach((chat) => {
            let chatRating;
            if (chat.status === "IN_PROGRESS") {
                chatRating = "Нет оценки";
            }

            if (chat.status === "REGENERATE") {
                chatRating = "Перегенерировано";
            }

            if (chat.status === "RESOLVED") {
                chatRating = `Оценка ${chat.rating}`;
            }

            if (Object.keys(dict).indexOf(chatRating) !== -1) {
                dict[chatRating] += 1;
            } else {
                dict[chatRating] = 1;
            }
        });

        for (let key in dict) {
            if (dict.hasOwnProperty(key)) {
                result.push({ rating: key, [key]: dict[key] });
            }
        }

        return result;
    };

    return (
        <BarChart
            h={300}
            data={getData(chats)}
            dataKey="rating"
            type="stacked"
            series={[
                { name: "Оценка 1", color: "indigo.2" },
                { name: "Оценка 2", color: "indigo.3" },
                { name: "Оценка 3", color: "indigo.5" },
                { name: "Оценка 4", color: "indigo.7" },
                { name: "Оценка 5", color: "indigo.9" },
                { name: "Перегенерировано", color: "red.5" },
                { name: "Нет оценки", color: "gray.6" },
            ]}
            tickLine="xy"
            gridAxis="xy"
        />
    );
};

export default RatingCountChart;
