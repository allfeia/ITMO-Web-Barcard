import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import WestIcon from "@mui/icons-material/West";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../authContext/useAuth.js';
import { useApiFetch } from "../../apiFetch.js";

export default function AdminRegisterBarmanForm() {
  const goTo = useNavigate();
  const apiFetch = useApiFetch();
  const { roles, barId } = useAuth();

  const [form, setForm] = useState({
    name: '',
    login: '',
    email: '',
  });

  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState(null);
  const [commonErr, setCommonErr] = useState(null);

  const [nameError, setNameError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [emailError, setEmailError] = useState('');


  function onChange(e) {
  const { name, value } = e.target;
  setForm(p => ({ ...p, [name]: value }));

  if (name === 'name') setNameError('');
  if (name === 'login') setLoginError('');
  if (name === 'email') setEmailError('');

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

  if (!form.name.trim()) { setNameError('Введите имя'); hasError = true; }
  if (!form.login.trim()) { setLoginError('Введите логин'); hasError = true; }
  if (!form.email.trim()) {
    setEmailError('Введите почту'); hasError = true;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    setEmailError('Некорректный e‑mail'); hasError = true;
  }

  if (hasError) return;

  if (!Array.isArray(roles) || !roles.includes('bar_admin') || !barId) {
    setCommonErr('Нет контекста бара');
    return;
  }

  setLoading(true);
  try {
    const resp = await apiFetch('/api/super/users/register-in-bar', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        barId: Number(sessionStorage.getItem('barId')),
        roles: ['staff'],
        name: form.name.trim(),
        login: form.login.trim(),
        email: form.email.trim(),
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
    <>
        <Button
            className="back-btn"
            onClick={() => goTo(-1)}
            data-testid="back-button"
            style={{ cursor: 'pointer' }}
        >
            <WestIcon className="learn-arrow" sx={{fontSize: "30px"}}/>
        </Button>
      <Box component="form" onSubmit={onSubmit} className="form">
        <Typography variant="h2" className='form-title' sx={{ mt: 6 }}>Добавить бармена</Typography>

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