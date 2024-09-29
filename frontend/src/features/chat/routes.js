import React from "react";
import { MainLayout } from "../../components/MainLayout";
import ChatsPage from "./pages/ChatsPage/ChatsPage";

export const chatsRoutes = [
    {
        element: <MainLayout />,
        children: [
            {
                path: "",
                element: <ChatsPage />,
            },
        ],
    },
];
