import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import FormGroup from '@mui/material/FormGroup'; 
import FormControlLabel from '@mui/material/FormControlLabel'; 
import Checkbox from '@mui/material/Checkbox';
import { useAuth } from '../../authContext/useAuth.js';
import { useNavigate } from 'react-router-dom';
import "../admin.css"

export default function SuperAssignUserPage() {
  const { token } = useAuth();
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

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('/api/admin/bars', {
          headers: { Authorization: token ? `Bearer ${token}` : undefined }
        });
        const data = await resp.json().catch(()=>[]);
        if (resp.ok) setBars(data);
      } catch {}
    })();
  }, [token]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setOkMsg('');
    setErr('');
  }

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

  async function onSubmit(e) {
    e.preventDefault();
    setOkMsg(''); setErr('');
    if (!form.barName.trim()) { setErr('Выберите бар'); return; }
    if (!form.name.trim() || !form.login.trim() || !form.email.trim() || !form.password.trim()) {
      setErr('Заполните все поля пользователя'); return;
    }
    const roles = Array.from(new Set(form.roles || [])).filter(r => r === 'staff' || r === 'bar_admin');
    if (roles.length === 0) { setErr('Выберите хотя бы одну роль'); return; }
    if (roles.length > 2) { setErr('Недопустимый набор ролей'); return; }
    setLoading(true);
    try {
      const resp = await fetch('/api/super/users/register-in-bar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : undefined
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
      const data = await resp.json().catch(()=>({}));
      if (!resp.ok) {
        setErr(data?.error || 'Ошибка назначения');
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
    <Box component="form" onSubmit={onSubmit} className="form" sx={{ maxWidth: 560 }}>
      <Typography variant="h1" sx={{ mb: 2 }} className='form-title'>Создание сотрудника</Typography>

      <TextField className="form-input" label="Бар" name="barName" select value={form.barName} onChange={onChange}>
        {bars.map(b => <MenuItem key={b.id} value={b.name}>{b.name}</MenuItem>)}
      </TextField>

      <Typography sx={{ mt: 1, mb: 1 }}>Роли</Typography>
      <FormGroup row className="form-input">
        <FormControlLabel
          control={
            <Checkbox
              checked={form.roles.includes('staff')}
              onChange={() => onToggleRole('staff')}
            />
          }
          label="staff"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={form.roles.includes('bar_admin')}
              onChange={() => onToggleRole('bar_admin')}
            />
          }
          label="bar_admin"
        />
      </FormGroup>

      <TextField className="form-input" label="Имя пользователя" name="name" value={form.name} onChange={onChange} />
      <TextField className="form-input" label="Логин" name="login" value={form.login} onChange={onChange} />
      <TextField className="form-input" label="Email" name="email" value={form.email} onChange={onChange} />
      <TextField className="form-input" label="Пароль" name="password" type="password" value={form.password} onChange={onChange} />

      {err && <Typography color="error" sx={{ mt: 1 }}>{err}</Typography>}
      {okMsg && <Typography color="success.main" sx={{ mt: 1 }}>{okMsg}</Typography>}

      <Button disabled={loading} variant="contained" type="submit" className="form-button">
        {loading ? 'Отправка...' : 'Сохранить'}
      </Button>
      <Button variant="contained"  type="button" onClick={() => goTo('/administration')} sx={{ mt: 1 }} className='form-button'>На главную</Button>
    </Box>
  );
}