import { AppShell } from "@mantine/core";
import { Outlet } from "react-router-dom";
import React from "react";
import styles from "./MainLayout.module.css";
import Header from "../Header";

export function MainLayout() {
    return (
        <AppShell header={{ height: 70 }}>
            <AppShell.Header pl="sm" className={styles.navbar} withBorder={false}>
                <Header />
            </AppShell.Header>
            <AppShell.Main className={styles.container}>
                <Outlet />
            </AppShell.Main>
        </AppShell>
    );
}
