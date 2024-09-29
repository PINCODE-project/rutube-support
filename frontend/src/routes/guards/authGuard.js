import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../../services/token.service";
import { Loader } from "@mantine/core";

const AuthGuard = () => {
    const accessToken = getToken();
    const [isValid, setIsValid] = useState(null);

    useEffect(() => {
        if (accessToken) {
            setIsValid(true);
        } else {
            setIsValid(false);
        }
    }, [accessToken]);

    if (isValid === false) {
        return <Navigate to="/login" />;
    }

    if (isValid === null) {
        return <Loader />;
    }

    return <Outlet />;
};

export default AuthGuard;
