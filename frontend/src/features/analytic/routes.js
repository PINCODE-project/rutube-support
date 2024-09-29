import React from "react";
import { MainLayout } from "../../components/MainLayout";
import ChatsPage from "./pages/AnalyticPage/AnalyticPage";

export const analyticRoutes = [
    {
        element: <MainLayout />,
        children: [
            {
                path: "/analytic",
                element: <ChatsPage />,
            },
        ],
    },
];
