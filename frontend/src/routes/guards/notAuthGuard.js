import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../../services/token.service";
import { Loader } from "@mantine/core";

const NotAuthGuard = () => {
    const accessToken = getToken();
    const [isValid, setIsValid] = useState(null);

    useEffect(() => {
        if (accessToken) {
            setIsValid(false);
        } else {
            setIsValid(true);
        }
    }, [accessToken]);

    if (isValid === false) {
        return <Navigate to="/home" />;
    }

    if (isValid === null) {
        return <Loader />;
    }

    return <Outlet />;
};

export default NotAuthGuard;
