import React, { useCallback } from "react";
import { Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useLogin } from "../../../../hooks/useLogin";
import { HttpStatusCode } from "axios";
import { notifications } from "@mantine/notifications";
import styles from "./LoginForm.module.css";
import { useNavigate } from "react-router-dom";

export function LoginForm() {
    const navigate = useNavigate();

    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            login: "",
            password: "",
        },
    });

    const onErrorLogin = (error) => {
        if (error.status === HttpStatusCode.Unauthorized) {
            form.setErrors({
                login: "Неверные данные",
                password: "Неверные данные",
            });
            notifications.show({
                title: "Неверный логин или пароль!",
                color: "red",
            });
        }
    };

    const onSuccessLogin = (data) => {
        notifications.show({
            title: "Вы успешно авторизовались!",
            color: "green",
        });
        navigate("/");
    };

    const login = useLogin(onSuccessLogin, onErrorLogin);

    const loginHandler = useCallback((values) => {
        login.mutate(values);
    }, []);

    return (
        <Paper withBorder shadow="md" p={30} radius="md">
            <Stack align="stretch" justify="center" gap={"xl"}>
                <Stack justify="center" gap={"md"}>
                    <Title ta="center">👋 Добро пожаловать!</Title>
                    <Text ta="center" className={styles.description}>
                        Rutube.Support - интеллектуальный помощник оператора службы поддержки
                    </Text>
                </Stack>

                <form onSubmit={form.onSubmit(loginHandler)}>
                    <TextInput
                        label="Логин"
                        placeholder="Введите логин"
                        key={form.key("login")}
                        {...form.getInputProps("login")}
                        required
                        autoFocus
                        radius="md"
                        size="md"
                        disabled={login.isPending}
                    />
                    <PasswordInput
                        label="Пароль"
                        placeholder="*****"
                        key={form.key("password")}
                        {...form.getInputProps("password")}
                        required
                        radius="md"
                        mt="md"
                        size="md"
                        disabled={login.isPending}
                        classNames={{ input: styles.passwordInput }}
                    />
                    <Button type="submit" fullWidth mt="xl" radius="md" size="md" disabled={login.isPending}>
                        Войти
                    </Button>
                </form>
            </Stack>
        </Paper>
    );
}
