import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useAuth } from '../../AuthContext.jsx';
import { useGoTo } from '../../useGoTo.js';
import "../admin.css";

export default function SuperLoginPage() {
  const { setToken, setRoles, setBarId } = useAuth();
  const goTo = useGoTo();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!username || !password) {
      setErr('Введите логин и пароль');
      return;
    }
    setErr('');
    setLoading(true);
    try {
      const resp = await fetch('/api/super/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        setErr(data?.error || 'Ошибка входа');
        return;
      }

      if (data.token) setToken(data.token);
      setRoles(Array.isArray(data?.user?.roles) ? data.user.roles : ['super_admin']);
      setBarId(null);

      goTo('/administration');
    } catch (e2) {
      setErr('Сетевая ошибка');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box component="form" onSubmit={onSubmit} autoComplete="off" className="form">
      <Typography variant="h2"  className="form-title">
        Вход супер-админа
      </Typography>

      <TextField
        className='form-input'
        label="Логин/Email/Имя"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        fullWidth
        margin="normal"
        autoComplete="username"
      />

      <TextField
        className='form-input'
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
        autoComplete="current-password"
      />

      {err && (
        <Typography color="error" sx={{ mt: 1 }}>
          {err}
        </Typography>
      )}

      <Button variant="contained" type="submit" disabled={loading} className="form-button">
        {loading ? 'Входим…' : 'Войти'}
      </Button>
    </Box>
  );
}