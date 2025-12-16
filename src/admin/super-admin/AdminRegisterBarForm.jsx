import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import WestIcon from "@mui/icons-material/West";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../authContext/useAuth.js';


export default function AdminRegisterBarForm() {
  const goTo = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState({
    name: '',
    address: '',
    description: '',
    website: '',
    barKey: '',
  });

  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState(null);
  const [commonErr, setCommonErr] = useState(null);

  const [nameError, setNameError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [websiteError, setWebsiteError] = useState('');
  const [barKeyError, setBarKeyError] = useState('');

  function onChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));

    if (name === 'name') setNameError('');
    if (name === 'address') setAddressError('');
    if (name === 'description') setDescriptionError('');
    if (name === 'website') setWebsiteError('');
    if (name === 'barKey') setBarKeyError('');
    setCommonErr(null);
    setOkMsg(null);
  }

  function isValidUrl(str) {
    if (!str) return true;
    try {
      const u = new URL(str);
      return Boolean(u.protocol && u.host);
    } catch {
      return false;
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setCommonErr(null);
    setOkMsg(null);

    setNameError('');
    setAddressError('');
    setDescriptionError('');
    setWebsiteError('');
    setBarKeyError('');

    let hasError = false;

    if (!form.name.trim()) {
      setNameError('Введите название бара');
      hasError = true;
    }

    if (form.website.trim() && !isValidUrl(form.website.trim())) {
      setWebsiteError('Некорректный URL');
      hasError = true;
    }

    if (!form.barKey.trim()) {
      setBarKeyError('Введите ключ бара');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        description: form.description.trim() || undefined,
        website: form.website.trim() || undefined,
        barKey: form.barKey.trim(),
      };

      const resp = await fetch('/api/admin/bars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : undefined
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => ({}));

      if (resp.status === 401) {
        setCommonErr('Не авторизовано');
        return;
      }
      if (resp.status === 403) {
        setCommonErr(data?.error || 'Доступ запрещён');
        return;
      }
      if (resp.status === 400) {
        const msg = data?.error || 'Некорректные данные формы';
        if (msg.toLowerCase().includes('ключ')) {
          setBarKeyError('Некорректный ключ бара');
        } else {
          setCommonErr(msg);
        }
        return;
      }

      if (!resp.ok) {
        throw new Error(data?.error || resp.statusText || 'Ошибка создания бара');
      }

      setOkMsg(data?.message || `Бар создан${data?.name ? `: ${data.name}` : ''}`);
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
      onClick={() => goTo('/administration')} />
      <Box component="form" onSubmit={onSubmit} className="form">
        <Typography variant="h1" className="form-title">Добавить бар</Typography>
        <TextField className="form-input" label="Название бара" variant="outlined" name="name" value={form.name} onChange={onChange} error={Boolean(nameError)} helperText={nameError} />
        <TextField className="form-input" label="Адрес" variant="outlined" name="address" value={form.address} onChange={onChange} error={Boolean(addressError)} helperText={addressError} />
        <TextField className="orm-input" label="Описание" variant="outlined" name="description" value={form.description} onChange={onChange} multiline minRows={3} error={Boolean(descriptionError)} helperText={descriptionError} />
        <TextField className="form-input" label="Web‑site (URL)" variant="outlined" name="website" value={form.website} onChange={onChange} error={Boolean(websiteError)} helperText={websiteError} />
        <TextField className="form-input" label="Ключ бара" variant="outlined" name="barKey" value={form.barKey} onChange={onChange} error={Boolean(barKeyError)} helperText={barKeyError} type="password" />
        {commonErr && <Typography color="error" sx={{ mt: 1 }}>{commonErr}</Typography>}
        {okMsg && <Typography color="success.main" sx={{ mt: 1 }}>{okMsg}</Typography>}
        <Button variant="contained" type="submit" className="form-button" disabled={loading}>{loading ? 'Отправка...' : 'Создать бар'}</Button>
      </Box></>
  );
}