export const getMonthPreset = () => {
    const monthPreset = {};
    for (let i = 0; i <= 31; i++)
        monthPreset[
            `${i.toString().padStart(2, "0")}.${(new Date().getMonth() + 1).toString().padStart(2, "0")}`
        ] = 0;
    return monthPreset;
};

export const getDayPreset = () => {
    const dayPreset = {};
    for (let i = 0; i < 24; i++) dayPreset[i.toString().padStart(2, "0") + ":00"] = 0;
    return dayPreset;
};

export const getYearPreset = () => {
    const yearPreset = {};
    for (let i = 0; i < 12; i++)
        yearPreset[`${i.toString().padStart(2, "0")}.${new Date().getFullYear()}`] = 0;
    return yearPreset;
};
