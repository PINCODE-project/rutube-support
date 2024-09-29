import axios from "axios";
import { ConfigService } from "./config.service";
import { localStorageKeys } from "../core/models/localStorageKeys";

export class StatisticService {
    static getChatsCount() {
        return axios.get(ConfigService.URLS.GET_CHATS_COUNT, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(localStorageKeys.accessToken)}`,
            },
        });
    }

    static getFirstClassCount() {
        return axios.get(ConfigService.URLS.GET_FIRST_CLASS_COUNT, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(localStorageKeys.accessToken)}`,
            },
        });
    }

    static getSecondClassCount(firstClassFilter) {
        return axios.get(ConfigService.URLS.GET_SECOND_CLASS_COUNT, {
            params: {
                firstClassFilter: firstClassFilter !== "Все категории" ? firstClassFilter : undefined,
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem(localStorageKeys.accessToken)}`,
            },
        });
    }
}
