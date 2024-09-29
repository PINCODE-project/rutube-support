import axios from "axios";
import { ConfigService } from "./config.service";
import { localStorageKeys } from "../core/models/localStorageKeys";

export class ChatService {
    static getChats(page, status, search) {
        return axios.get(ConfigService.URLS.GET_CHATS, {
            params: {
                page: page,
                status: status,
                search: search,
                count: 20,
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem(localStorageKeys.accessToken)}`,
            },
        });
    }

    static getRecord(recordId) {
        return axios.get(`${ConfigService.URLS.GET_RECORDS}/${recordId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(localStorageKeys.accessToken)}`,
            },
        });
    }
}
