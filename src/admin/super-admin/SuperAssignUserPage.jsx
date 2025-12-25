import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import FormGroup from '@mui/material/FormGroup'; 
import FormControlLabel from '@mui/material/FormControlLabel'; 
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {IconButton, InputAdornment} from "@mui/material";
import WestIcon from "@mui/icons-material/West";
import Checkbox from '@mui/material/Checkbox';
import { useNavigate } from 'react-router-dom';
import "../admin.css"

export default function SuperAssignUserPage() {
  const goTo = useNavigate();

  const [bars, setBars] = useState([]);
  const [form, setForm] = useState({
    barName: '',
    roles: ['bar_admin'], 
    name: '',
    login: '',
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState('');
  const [err, setErr] = useState('');
  const [passwordHint, setPasswordHint] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPass, setShowPass] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('/api/admin/bars', {
          credentials: 'include',
        });
        const data = await resp.json().catch(()=>[]);
        if (resp.ok) setBars(data);
      } catch (e) {
        console.error('Ошибка загрузки баров', e);
      }
    })();
  }, []);


  function onToggleRole(role) {
    setForm(p => {
      const set = new Set(p.roles || []);
      if (set.has(role)) set.delete(role); else set.add(role);
      const next = Array.from(set);
      return { ...p, roles: next };
    });
    setOkMsg('');
    setErr('');
  }

  function onChange(e) {
  const { name, value } = e.target;
  setForm(p => ({ ...p, [name]: value }));
  setOkMsg('');
  setErr('');

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
}

async function onSubmit(e) {
  e.preventDefault();
  let hasError = false;

  setOkMsg('');
  setErr('');
  setPasswordError('');

  if (!form.barName.trim()) { setErr('Выберите бар'); return; }
  if (!form.name.trim() || !form.login.trim() || !form.email.trim() || !form.password.trim()) {
    setErr('Заполните все поля пользователя'); 
    return;
  }

  if (!form.email.trim()) {
      setErr('Введите email');
      return;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setErr('Некорректный email');
      return;
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

  const roles = Array.from(new Set(form.roles || [])).filter(
    r => r === 'staff' || r === 'bar_admin'
  );
  if (roles.length === 0) { setErr('Выберите хотя бы одну роль'); return; }
  if (roles.length > 2) { setErr('Недопустимый набор ролей'); return; }
  if (hasError) return;

  setLoading(true);
  try {
    const resp = await fetch('/api/super/users/register-in-bar', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        barName: form.barName.trim(),
        roles,
        name: form.name.trim(),
        login: form.login.trim(),
        email: form.email.trim(),
        password: form.password
      })
    });

    const data = await resp.json().catch(() => ({}));

    if (resp.status === 409) {
      setErr(data?.error || 'Сотрудник с такими данными уже существует');
      return;
    }

    if (!resp.ok) {
      setErr(data?.error || 'Непредвиденная печенюшка');
      return;
    }

    setOkMsg(data?.message || 'Готово');
  } catch {
    setErr('Сетевая ошибка');
  } finally {
    setLoading(false);
  }
}

  return (
    <>
        <Button
            className="back-btn"
            variant="text"
            onClick={() => goTo(-1)}
            data-testid="back-button"
            style={{ cursor: 'pointer' }}
        >
            <WestIcon className="learn-arrow" sx={{fontSize: "30px"}}/>
        </Button>
        <Box component="form" onSubmit={onSubmit} className="form" sx={{ maxWidth: 560 }}>
        <Typography variant="h1" className='form-title' sx={{ mt: 10 }}>Добавить сотрудника</Typography>

        <TextField className="form-input" label="Бар" name="barName" select value={form.barName} onChange={onChange}>
          {bars.map(b => <MenuItem key={b.id} value={b.name}>{b.name}</MenuItem>)}
        </TextField>

        <Typography sx={{ mt: 1, mb: 1 }}>Роли</Typography>
        <FormGroup row className="form-input">
          <FormControlLabel
            className='form-check-box'
            control={<Checkbox
              checked={form.roles.includes('staff')}
              onChange={() => onToggleRole('staff')} />}
            label="staff" />
          <FormControlLabel
            className='form-check-box'
            control={<Checkbox
              checked={form.roles.includes('bar_admin')}
              onChange={() => onToggleRole('bar_admin')} />}
            label="bar_admin" />
        </FormGroup>

        <TextField className="form-input" label="Имя пользователя" name="name" value={form.name} onChange={onChange} />
        <TextField className="form-input" label="Логин" name="login" value={form.login} onChange={onChange} />
        <TextField className="form-input" label="Email" name="email" value={form.email} onChange={onChange} />
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

        {err && <Typography color="error" sx={{ mt: 1 }}>{err}</Typography>}
        {okMsg && <Typography color="success.main" sx={{ mt: 1 }}>{okMsg}</Typography>}

        <Button disabled={loading} variant="contained" type="submit" className="form-button">
          {loading ? 'Отправка...' : 'Добавить'}
        </Button>
      </Box></>
  );
}