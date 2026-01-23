import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton, InputAdornment, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext/useAuth.js";

export default function BarmanAuthForm() {
    const { setRoles, setSavedCocktailsId, setBarName, setBarSite } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [barKey, setBarKey] = useState("");

    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [barKeyError, setBarKeyError] = useState("");
    const [loginError, setLoginError] = useState("");

    const [showPass, setShowPass] = useState(true);
    const [showKey, setShowKey] = useState(true);

    const goTo = useNavigate();

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
        if (!barKey.trim()) {
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
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    barId: Number(barId),
                    username,
                    password,
                    barKey,
                }),
            });

            const data = await response.json();
            console.log("Ответ сервера:", data);

            if (!response.ok) {
                setLoginError(data.error || "Неверные учетные данные");
                return;
            }

            if (response.ok) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                localStorage.setItem('currentBar', JSON.stringify({ id: barId, name: data.barName }));
                setRoles(data.user.roles);
                setBarName(data.barName);
                setBarSite(data.barSite);
                setSavedCocktailsId(data.saved_cocktails_id);

                console.log("SUCCESS", data);
                goTo("/menu");
            }
        } catch (err) {
            console.log("NETWORK ERROR:", err);
            setLoginError("Ошибка сети. Попробуйте позже.");
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            className="sign-in-form"
        >
            <TextField
                id="auth-username"
                className="sign-in-form-input"
                label="Почта / Логин / Имя"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={Boolean(usernameError)}
                helperText={usernameError}
            />

            <TextField
                id="auth-password"
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
                                {showPass ? <VisibilityIcon /> : <VisibilityOffIcon />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            <TextField
                id="auth-barkey"
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
                                {showKey ? <VisibilityIcon /> : <VisibilityOffIcon />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            {loginError && !usernameError && !passwordError && !barKeyError && (
                <Typography color="error" variant="body1">
                    {loginError}
                </Typography>
            )}

            <Button variant="contained" type="submit" className="sign-in-form-button">
                Войти
            </Button>
        </Box>
    );
}