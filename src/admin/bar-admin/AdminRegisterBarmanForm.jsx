import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {IconButton, InputAdornment} from "@mui/material";
import WestIcon from "@mui/icons-material/West";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../authContext/useAuth.js';

export default function AdminRegisterBarmanForm() {
  const goTo = useNavigate();
  const { token, roles, barId } = useAuth();

  const [form, setForm] = useState({
    name: '',
    login: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState(null);
  const [commonErr, setCommonErr] = useState(null);

  const [nameError, setNameError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [passwordHint, setPasswordHint] = useState('');
  const [showPass, setShowPass] = useState(true);

  function onChange(e) {
  const { name, value } = e.target;
  setForm(p => ({ ...p, [name]: value }));

  if (name === 'name') setNameError('');
  if (name === 'login') setLoginError('');
  if (name === 'email') setEmailError('');
  if (name === 'password') {
    setPasswordError('');
    const len = value.length;
    if (/\s/.test(value)) {
      setPasswordError('Пароль не должен содержать пробелы');
      setPasswordHint('');
    } else if (len > 0 && len < 6) {
      setPasswordHint('Пароль должен быть минимум 6 символов');
    } else {
      setPasswordHint('');
    }
  }

  setCommonErr(null);
  setOkMsg(null);
}

async function onSubmit(e) {
  e.preventDefault();
  setCommonErr(null);
  setOkMsg(null);

  let hasError = false;
  setNameError('');
  setLoginError('');
  setEmailError('');
  setPasswordError('');

  if (!form.name.trim()) { setNameError('Введите имя'); hasError = true; }
  if (!form.login.trim()) { setLoginError('Введите логин'); hasError = true; }
  if (!form.email.trim()) {
    setEmailError('Введите почту'); hasError = true;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    setEmailError('Некорректный e‑mail'); hasError = true;
  }

  if (!form.password.trim()) {
    setPasswordError('Введите пароль');
    hasError = true;
  } else if (/\s/.test(form.password)) {
    setPasswordError('Пароль не должен содержать пробелы');
    hasError = true;
  } else if (form.password.length < 6) {
    setPasswordError('Пароль должен быть минимум 6 символов');
    hasError = true;
  }
  if (hasError) return;

  if (!Array.isArray(roles) || !roles.includes('bar_admin') || !barId) {
    setCommonErr('Нет контекста бара');
    return;
  }

  setLoading(true);
  try {
    const resp = await fetch('/api/super/users/register-in-bar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : undefined
      },
      body: JSON.stringify({
        barId: Number(sessionStorage.getItem('barId')),
        roles: ['staff'],
        name: form.name.trim(),
        login: form.login.trim(),
        email: form.email.trim(),
        password: form.password
      })
    });
      const data = await resp.json().catch(() => ({}));

      if (resp.status === 403) {
        const msg = data?.error || 'Запрещено';
        setCommonErr(msg);
        return;
      }

      if (resp.status === 404) {
        const msg = data?.error || 'Не найдено';
        setCommonErr(msg);
        return;
      }

            if (resp.status === 409) {
        const msg = data?.error || 'Сотрудник с такими данными уже существует';
        setCommonErr(msg);
        return;
      }

      if (!resp.ok) {
        throw new Error(data?.error || resp.statusText || 'Ошибка регистрации');
      }

      setOkMsg(data?.message || 'Бармен зарегистрирован');
    } catch (err) {
      setCommonErr(err.message || 'Сетевая ошибка');
    } finally {
      setLoading(false);
    }
  }

  return (
    <><WestIcon
      className="back-arrow-fav"
      sx={{ fontSize: "30px" }}
      onClick={() => goTo('/account')} />
      <Box component="form" onSubmit={onSubmit} className="form">
        <Typography variant="h2" className='form-title'>Добавить бармена</Typography>

        <TextField
          className="form-input"
          label="Имя"
          variant="outlined"
          name="name"
          value={form.name}
          onChange={onChange}
          error={Boolean(nameError)}
          helperText={nameError} />

        <TextField
          className="form-input"
          label="Логин"
          variant="outlined"
          name="login"
          value={form.login}
          onChange={onChange}
          error={Boolean(loginError)}
          helperText={loginError} />

        <TextField
          className="form-input"
          label="Почта"
          variant="outlined"
          name="email"
          value={form.email}
          onChange={onChange}
          error={Boolean(emailError)}
          helperText={emailError} />

        <TextField
          className="form-input"
          label="Пароль"
          variant="outlined"
          type={showPass ? "password" : "text"}
          name="password"
          value={form.password}
          onChange={onChange}
          error={Boolean(passwordError)}
          helperText={passwordError || passwordHint}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPass(!showPass)}>
                  {showPass ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>

              </InputAdornment>
            ),
          }} />

        {commonErr && (
          <Typography color="error" sx={{ mt: 1 }}>
            {commonErr}
          </Typography>
        )}
        {okMsg && (
          <Typography color="success.main" sx={{ mt: 1 }}>
            {okMsg}
          </Typography>
        )}

        <Button
          variant="contained"
          type="submit"
          disabled={loading}
          className="form-button"
        >
          {loading ? 'Отправка...' : 'Добавить'}
        </Button>
      </Box></>
  );
}