import { useRoutes } from "react-router-dom";
import { authRoutes } from "../features/auth/routes";
import NotAuthGuard from "./guards/notAuthGuard";
import AuthGuard from "./guards/authGuard";
import { errorsRoutes } from "../features/errors/routes";
import { chatsRoutes } from "../features/chat/routes";
import { analyticRoutes } from "../features/analytic/routes";

const routes = [
    {
        element: <NotAuthGuard />,
        children: [...authRoutes],
    },
    {
        element: <AuthGuard />,
        children: [...chatsRoutes, ...analyticRoutes, ...errorsRoutes],
    },
];

export const RootRouter = () => useRoutes(routes);
