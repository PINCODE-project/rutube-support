import React from "react";
import { Button, Image } from "@mantine/core";
import Logo from "../../assets/images/Logo.svg";
import { UserButton } from "../UserButton/UserButton";
import { useUser } from "../../hooks/useUser";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

const Header = () => {
    const { user, isLoading: isLoadingUser } = useUser();

    const navigate = useNavigate();

    const navigateToChat = () => navigate("/");
    const navigateToAnalytic = () => navigate("/analytic");

    return (
        <div className={styles.header}>
            <div className={styles.logoContainer}>
                <Image src={Logo} height={30} w="auto" />
            </div>

            <div className={styles.navbarContainer}>
                <Button variant="subtle" color="gray" radius="md" onClick={navigateToChat}>
                    Обращения
                </Button>
                <Button variant="subtle" color="gray" radius="md" onClick={navigateToAnalytic}>
                    Аналитика
                </Button>
            </div>

            <div className={styles.profileContainer}>{!isLoadingUser && <UserButton user={user} />}</div>
        </div>
    );
};

export default Header;
