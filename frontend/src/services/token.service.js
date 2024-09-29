import { localStorageKeys } from "../core/models/localStorageKeys";

const tokenKey = localStorageKeys.accessToken;

export const setToken = (token) => {
    localStorage.setItem(tokenKey, token);
};

export const getToken = () => {
    return localStorage.getItem(tokenKey);
};

export const removeToken = () => {
    localStorage.removeItem(tokenKey);
};

export const hasToken = () => {
    return getToken() !== null;
};
