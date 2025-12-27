import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./password-page.css";
import "../commonStyles.css";
import {
  Box,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
  Typography,
  Snackbar,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../authContext/useAuth";

function useHashParams() {
  const { hash } = useLocation();
  return useMemo(() => {
    const h = (hash || "").replace(/^#/, "");
    return new URLSearchParams(h);
  }, [hash]);
}

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function PasswordPage() {
  const navigate = useNavigate();

  const query = useQuery();
  const hashParams = useHashParams();

const mode = hashParams.get("mode") || query.get("mode");

const tokenFromHash = hashParams.get("token");

  const MIN_PASSWORD = 8;

  const isReset = mode === "reset";
  const isInvite = mode === "invite";
  const title = isReset ? "Смена пароля" : "Установка пароля";

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const passInvalid = password.length < MIN_PASSWORD;

  const [success, setSuccess] = useState("");

  const [showPass, setShowPass] = useState(true);

  const [code, setCode] = useState("");
  const codeInvalid = code.length < 6;

  const [resendCooldown, setResendCooldown] = useState(null);
  const [resendPending, setResendPending] = useState(false);

  const [countdown, setCountdown] = useState(null);
  const [redirectCanceled, setRedirectCanceled] = useState(false);
  const {setBarId, setRoles, setIsBarman} = useAuth();

  const [snack, setSnack] = useState({
    open: false,
    type: "success", // 'success' | 'error' | 'info' | 'warning'
    text: "",
    autoHideDuration: 5000, 
  });

  const showSnack = (type, text, autoHideDuration = 5000) => {
    setSnack({ open: true, type, text, autoHideDuration });
  };

  const closeSnack = (_, reason) => {
    if (reason === "clickaway") return;
    setSnack((s) => ({ ...s, open: false }));
  };

  const [inviteReady, setInviteReady] = useState(false);
  
  const canEditPassword = !submitting && (isInvite ? inviteReady : true);

  const canSubmit =
    (isInvite ? inviteReady : /^\d{6}$/.test(code)) &&
    password.length >= MIN_PASSWORD &&
    password2.length >= MIN_PASSWORD &&
    password === password2 &&
    !submitting &&
    countdown === null;

  useEffect(() => {
  if (!isInvite) return;

  if (!tokenFromHash) {
    setInviteReady(true);
    return;
  }

  (async () => {
    try {
      const resp = await fetch("/api/password/invite/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: tokenFromHash }),
      });

      const data = await resp.json().catch(() => null);
      if (!resp.ok) throw new Error(data?.error || "Ссылка недействительна");

      setInviteReady(true);

      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?mode=${encodeURIComponent(mode || "invite")}`
      );
    } catch (e) {
      setInviteReady(false);
      showSnack("error", e?.message || "Ссылка недействительна", 5000);
    }
  })();
}, [isInvite, tokenFromHash, mode]);

  async function onSubmit(e) {
    e.preventDefault();
    setSuccess("");

    if (isReset && !/^\d{6}$/.test(code)) {
      const msg = "Введите 6‑ти значный код из письма";
      showSnack("error", msg, 5000);
      return;
    }

    const url = isInvite ? "/api/password/confirm" : "/api/password/confirm-code";
    const body = isInvite ? {password } : { code, password };

    setSubmitting(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Не удалось изменить пароль.");
      }

      const msg = "Пароль успешно установлен";
      setSuccess(msg);

            if (isReset) {
        setRedirectCanceled(false);
        setCountdown(10);
        showSnack("success", msg, 10000);
      }

      if (isInvite) {
        const isBaman = true;
        const barId = data?.barId;
        const roles = data?.roles;
        setBarId(barId);
        setRoles(roles);
        setIsBarman(isBaman);

        setCountdown(10);
        showSnack("success", msg, 10000);
      }
    } catch (err) {
      const msg = err?.message || "Произошла ошибка.";
      showSnack("error", msg, 5000);
    } finally {
      setSubmitting(false);
    }
  }

    useEffect(() => {
    if (!(isReset || isInvite)) return;
    if (countdown === null) return;

    if (countdown <= 0) {
      if (isReset) navigate("/account", { replace: true });
      if (isInvite) navigate("/signInPage", { replace: true });
      return;
    }

    const t = setTimeout(() => setCountdown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, isReset, isInvite, navigate]);

  useEffect(() => {
    if (!isReset) return;
    if (resendCooldown === null) return;

    if (resendCooldown <= 0) {
      setResendCooldown(null);
      return;
    }

    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown, isReset]);

  async function requestResetEmailAgain() {
    if (!isReset) return;
    if (resendPending) return;

    setResendPending(true);

    try {
      const resp = await fetch("/api/password/request-reset", {
        method: "POST",
        credentials: "include",
      });

      if (!resp.ok) {
        let msg = "Не удалось отправить письмо. Попробуйте позже.";
        try {
          const j = await resp.json();
          msg = j?.message || j?.error || msg;
        } catch (err) {
          console.warn("Failed to parse error JSON", err);
        }
        throw new Error(msg);
      }
      showSnack("success", "Письмо отправлено повторно. Проверьте почту.", 5000);
    } catch (e) {
      showSnack("error", e?.message || "Сеть недоступна. Попробуйте позже.", 5000);
    } finally {
      setResendPending(false);
    }
  }

  async function requestInviteEmailAgain() {
  if (!isInvite) return;
  if (resendPending) return;
  if (!inviteReady) {
    showSnack("error", "Ссылка недействительна или сессия истекла", 5000);
    return;
  }

  setResendPending(true);
  try {
    const resp = await fetch("/api/password/request-invite-again", {
      method: "POST",
      credentials: "include",
    });

    if (!resp.ok) {
      let msg = "Не удалось отправить письмо. Попробуйте позже.";
      try {
        const j = await resp.json();
        msg = j?.message || j?.error || msg;
      } catch (err) {
          console.warn("Failed to parse error JSON", err);
        }
      throw new Error(msg);
    }

    showSnack("success", "Приглашение отправлено повторно. Проверьте почту.", 5000);
  } catch (e) {
    showSnack("error", e?.message || "Сеть недоступна. Попробуйте позже.", 5000);
  } finally {
    setResendPending(false);
  }
}

  return (
      <Box className="form-container">
        <Typography className="form-title" variant="h5">
          {title}
        </Typography>

        <Box component="form" onSubmit={onSubmit} className="form">
          {isReset ? (
  <Box className="field-group">
    <TextField
      className="form-input"
      label="Код из письма"
      value={code}
      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
      disabled={!canEditPassword}
      fullWidth
      inputProps={{ inputMode: "numeric" }}
      error={code.length > 0 && codeInvalid}
      helperText={codeInvalid ? `Введите 6-ти значный код из письма` : " "}
    />

    <Typography
      className="ask-text"
      onClick={async () => {
        if (submitting || resendPending || resendCooldown !== null) return;
        setResendCooldown(30);
        await requestResetEmailAgain();
      }}
      sx={{
        cursor:
          submitting || resendPending || resendCooldown !== null
            ? "default"
            : "pointer",
        opacity:
          submitting || resendPending || resendCooldown !== null ? 0.6 : 1,
        userSelect: "none",
      }}
    >
      {resendCooldown !== null
        ? `Повторная отправка кода будет доступна через ${resendCooldown} сек.`
        : resendPending
          ? "Отправка..."
          : "Отправить письмо с кодом повторно"}
    </Typography>
  </Box>
) : null}
<Box className="field-group">
          <TextField
            className="form-input"
            label="Пароль"
            type={showPass ? "password" : "text"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!canEditPassword}
            fullWidth
            error={password.length > 0 && passInvalid}
            helperText={passInvalid ? `Минимум ${MIN_PASSWORD} символов` : " "}
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
          {isInvite ? (
  <Box className="field-group">
    <Typography
      className="ask-text"
      onClick={async () => {
        if (submitting || resendPending || resendCooldown !== null) return;
        setResendCooldown(30);
        await requestInviteEmailAgain();
      }}
      sx={{
        cursor:
          submitting || resendPending || resendCooldown !== null
            ? "default"
            : "pointer",
        opacity:
          submitting || resendPending || resendCooldown !== null ? 0.6 : 1,
        userSelect: "none",
      }}
    >
      {resendCooldown !== null
        ? `Повторная отправка будет доступна через ${resendCooldown} сек.`
        : resendPending
          ? "Отправка..."
          : "Отправить приглашение повторно"}
    </Typography>
  </Box>
) : null}
</Box>
          <Box className="field-group">
  <TextField
    className="form-input"
    label="Подтверждение пароля"
    type={showPass ? "password" : "text"}
    autoComplete="new-password"
    value={password2}
    onChange={(e) => setPassword2(e.target.value)}
    disabled={!canEditPassword}
    fullWidth
    error={password2.length > 0 && password !== password2}
    helperText={
      password2.length > 0 && password !== password2 ? "Пароли не совпадают" : ""
    }
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

  {isReset && success && countdown !== null && !redirectCanceled ? (
    <Box className = "field-group">
      <Typography  className="ask-text">
        Возвращение в аккаунт произойдет через {countdown} сек.
      </Typography>
    </Box>
  ) : null}

    {isInvite && success && countdown !== null ? (
    <Box className = "field-group">
      <Typography className="ask-text">
        Переход на страницу авторизации произойдет через {countdown} сек.
        <br />
        Войти можно по почте, а имя и логин вы получите у администратора бара
      </Typography>
    </Box>
  ) : null}
</Box>
          <Button
            className="form-button"
            type="submit"
            variant="contained"
            fullWidth
            disabled={!canSubmit}
          >
            {submitting ? "Сохранение..." : "Сохранить пароль"}
          </Button>
        </Box>

        <Snackbar
          open={snack.open}
          onClose={closeSnack}
          autoHideDuration={snack.autoHideDuration}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
  icon={false}
  onClose={closeSnack}
  severity={snack.type}
  variant="filled"
  sx={{
    width: "100%",
    bgcolor: snack.type === "success" ? "#B6DDB1" : "#E35C5C",
    color: "#333", 
    "& .MuiAlert-action": {
      alignItems: "center",
      paddingTop: 0,
    },
    "& .MuiIconButton-root": {
      color: "#333", 
    },
  }}
>
  {snack.text}
</Alert>
        </Snackbar>
      </Box>
  );
}