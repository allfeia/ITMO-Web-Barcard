import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
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

  function onChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (name === 'name') setNameError('');
    if (name === 'login') setLoginError('');
    if (name === 'email') setEmailError('');
    if (name === 'password') setPasswordError('');
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
    if (!form.password.trim()) { setPasswordError('Введите пароль'); hasError = true; }
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
    <Box component="form" onSubmit={onSubmit} className="form">
      <Typography variant="h2" className='form-title'>Создание бармена</Typography>

      <TextField className="form-input" label="Имя" variant="outlined" name="name" value={form.name} onChange={onChange} error={Boolean(nameError)} helperText={nameError} />
      <TextField className="form-input" label="Логин" variant="outlined" name="login" value={form.login} onChange={onChange} error={Boolean(loginError)} helperText={loginError} />
      <TextField className="form-input" label="Почта" variant="outlined" name="email" value={form.email} onChange={onChange} error={Boolean(emailError)} helperText={emailError} />
      <TextField className="form-input" label="Пароль" variant="outlined" type="password" name="password" value={form.password} onChange={onChange} error={Boolean(passwordError)} helperText={passwordError} />

      {commonErr && <Typography color="error" sx={{ mt: 1 }}>{commonErr}</Typography>}
      {okMsg && <Typography color="success.main" sx={{ mt: 1 }}>{okMsg}</Typography>}

      <Button variant="contained" type="submit" disabled={loading} className="form-button">{loading ? 'Отправка...' : 'Зарегистрировать'}</Button>
      <Button variant="text" type="button" onClick={() => goTo('/account')} sx={{ mt: 1 }} className="form-button" >На главную</Button>
    </Box>
  );
}