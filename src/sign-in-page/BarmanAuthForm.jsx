import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {useGoTo} from "../useGoTo.js";

export default function BarmanAuthForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const goTo = useGoTo();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setUsernameError("");
        setPasswordError("");

        let hasError = false;
        if (!username.trim()) {
            setUsernameError("Введите почту / логин / имя");
            hasError = true;
        }
        if (!password.trim()) {
            setPasswordError("Введите пароль");
            hasError = true;
        }
        if (hasError) return;

        const barId = sessionStorage.getItem("barId");
        if (!barId) {
            console.log("Ошибка: barId не найден. QR не был сканирован.");
            return;
        }

        try {
            const response = await fetch("/api/barman/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    barId,
                    username,
                    barPassword: password
                })
            });

            const data = await response.json();

            if (response.status === 403) {
                setPasswordError("Неверный пароль");
                return;
            }

            if (!response.ok) {
                console.log("API ERROR:", data.error);
                return;
            }

            console.log("SUCCESS", data);
            goTo("/menu");

        } catch (err) {
            console.log("NETWORK ERROR:", err);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            className="sign-in-form"
        >
            <TextField
                className="sign-in-form-input"
                label="Почта / Логин / Имя"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={Boolean(usernameError)}
                helperText={usernameError}
            />

            <TextField
                className="sign-in-form-input"
                label="Пароль"
                variant="outlined"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={Boolean(passwordError)}
                helperText={passwordError}
            />

            <Button variant="contained" type="submit" className="sign-in-form-button">
                Войти
            </Button>
        </Box>
    );
}
