import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {useGoTo} from "../useGoTo.js";

export default function BarmanAuthForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [barKey, setBarKey] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [barKeyError, setBarKeyError] = useState("");

    const goTo = useGoTo();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setUsernameError("");
        setPasswordError("");
        setBarKeyError("");

        let hasError = false;
        if (!username.trim()) {
            setUsernameError("Введите почту / логин / имя");
            hasError = true;
        }
        if (!password.trim()) {
            setPasswordError("Введите пароль");
            hasError = true;
        }
        if(!barKey.trim()){
            setBarKeyError("Введите ключ бара");
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
                    barPassword: password,
                    barKey: barKey
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

            <TextField
                className="sign-in-form-input"
                label="Барный ключ"
                variant="outlined"
                value={barKey}
                onChange={(e) => setBarKey(e.target.value)}
                error={Boolean(barKeyError)}
                helperText={barKeyError}
            />

            <Button variant="contained" type="submit" className="sign-in-form-button">
                Войти
            </Button>
        </Box>
    );
}
