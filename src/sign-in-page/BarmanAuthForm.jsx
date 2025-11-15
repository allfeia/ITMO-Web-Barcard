import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {useGoTo} from "../useGoTo.js";
import {IconButton, InputAdornment} from "@mui/material";

export default function BarmanAuthForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [barKey, setBarKey] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [barKeyError, setBarKeyError] = useState("");
    const [showPass, setShowPass] = useState(true);
    const [showKey, setShowKey] = useState(true);

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
                type={showPass ? "password" : "text"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={Boolean(passwordError)}
                helperText={passwordError}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setShowPass(!showPass)}>
                                { showPass ? <VisibilityIcon /> : <VisibilityOffIcon /> }
                            </IconButton>

                        </InputAdornment>
                    ),
                }}

            />

            <TextField
                className="sign-in-form-input"
                label="Барный ключ"
                variant="outlined"
                type={showKey ? "password" : "text"}
                value={barKey}
                onChange={(e) => setBarKey(e.target.value)}
                error={Boolean(barKeyError)}
                helperText={barKeyError}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setShowKey(!showKey)}>
                                { showKey ? <VisibilityIcon /> : <VisibilityOffIcon /> }
                            </IconButton>

                        </InputAdornment>
                    ),
                }}
            />

            <Button variant="contained" type="submit" className="sign-in-form-button">
                Войти
            </Button>
        </Box>
    );
}
