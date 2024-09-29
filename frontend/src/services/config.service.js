export class ConfigService {
    // static HOST = "http://localhost:5000";
    static HOST = "https://rutube.pincode-dev.ru/backend";
    static API = `${this.HOST}/api`;
    static STATIC = `${this.API}/static`;

    static URLS = {
        LOGIN: `${this.API}/auth/login`,
        IS_VALID_TOKEN: `${this.API}/user`,
        GET_PROFILE: `${this.API}/user/`,
        GET_CHATS: `${this.API}/chat`,
        GET_FIRST_CLASS_COUNT: `${this.API}/statistic/class/first-count`,
        GET_SECOND_CLASS_COUNT: `${this.API}/statistic/class/second-count`,
        GET_CHATS_COUNT: `${this.API}/statistic/chats-count`,
    };
}
