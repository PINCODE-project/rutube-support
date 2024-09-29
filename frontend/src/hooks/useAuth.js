import { localStorageKeys } from "../core/models/localStorageKeys";
import { AuthService } from "../services/auth.service";

export function useAuth() {
    const localUser = {
        accessToken: localStorage.getItem(localStorageKeys.accessToken),
    };

    if (localUser.id && localUser.login && localUser.accessToken) {
        const a = AuthService.isTokenValid(localUser.accessToken);
        console.log(a);
        return {
            isAuth: true,
            ...localUser,
        };
    }

    return {
        isAuth: false,
    };
}
