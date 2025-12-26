import React, { useEffect, useMemo, useState } from 'react';
import { TextField, Button, Typography, Box, MenuItem } from '@mui/material';
import WestIcon from "@mui/icons-material/West";
import { useNavigate } from 'react-router-dom';
import "../admin.css"
import { useApiFetch } from "../../apiFetch.js";

export default function SuperGrantBarAdminPage() {
  const goTo = useNavigate();
  const apiFetch = useApiFetch();

  const [bars, setBars] = useState([]);
  const [barId, setBarId] = useState('');
  const [staff, setStaff] = useState([]);
  const [userId, setUserId] = useState('');
  const [make, setMake] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loadingBars, setLoadingBars] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);

  useEffect(() => {
    let abort = false;
    async function loadBars() {
      setLoadingBars(true);
      try {
        const resp = await fetch('/api/admin/bars', {
          credentials: 'include',
        });
        const data = await resp.json().catch(() => ([]));
        if (!abort) {
          if (resp.ok) setBars(Array.isArray(data) ? data : []);
          else setBars([]);
        }
      } catch {
        if (!abort) setBars([]);
      } finally {
        if (!abort) setLoadingBars(false);
      }
    }
    loadBars();
    return () => { abort = true; };
  }, []);

  useEffect(() => {
    let abort = false;
    async function loadStaff() {
      setStaff([]);
      setUserId('');
      if (!barId) return;
      setLoadingStaff(true);
      try {
        const resp = await apiFetch(`/api/admin/bars/${barId}/staff`, {
          credentials: 'include',
        });
        const data = await resp.json().catch(() => ([]));
        if (!abort) {
          if (resp.ok) setStaff(Array.isArray(data) ? data : []);
          else setStaff([]);
        }
      } catch {
        if (!abort) setStaff([]);
      } finally {
        if (!abort) setLoadingStaff(false);
      }
    }
    loadStaff();
    return () => { abort = true; };
  }, [barId]);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(''); setErr('');
    if (!barId) { setErr('Сначала выберите бар'); return; }
    if (!userId) { setErr('Выберите сотрудника'); return; }
    try {
      const resp = await fetch('/api/super/grant-bar-admin', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ userId: Number(userId), makeBarAdmin: make })
      });
      const data = await resp.json().catch(()=>({}));
      if (!resp.ok) { setErr(data?.error || 'Ошибка'); return; }
    } catch {
      setErr('Сетевая ошибка');
    }
  }

  const barsOptions = useMemo(() => bars.map(b => ({ value: String(b.id), label: b.name })), [bars]);
  const staffOptions = useMemo(() => staff.map(u => ({
    value: String(u.id),
    label: `${u.name || u.login || u.email}`
  })), [staff]);

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
        <Typography variant="h1" className='form-title' sx={{ mt: 8 }}>Выдать/снять роль администратора бара</Typography>

        <TextField
          className="form-input"
          label="Бар"
          select
          value={barId}
          onChange={e => setBarId(e.target.value)}
          disabled={loadingBars}
        >
          {barsOptions.map(b => (
            <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>
          ))}
        </TextField>

        <TextField
          className="form-input"
          label="Сотрудник бара"
          select
          value={userId}
          onChange={e => setUserId(e.target.value)}
          disabled={!barId || loadingStaff}
          helperText={!barId ? 'Выберите бар, чтобы отобразить сотрудников' : (staffOptions.length === 0 ? 'В этом баре пока нет сотрудников' : '')}
        >
          {staffOptions.map(u => (
            <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
          ))}
        </TextField>

        <TextField className="form-input" label="Действие" select value={make ? 'grant' : 'revoke'} onChange={e => setMake(e.target.value === 'grant')}>
          <MenuItem value="grant">Выдать права администратора бара</MenuItem>
          <MenuItem value="revoke">Убрать права администратора бара</MenuItem>
        </TextField>

        {err && <Typography color="error" sx={{ mt: 1 }}>{err}</Typography>}
        {msg && <Typography color="success.main" sx={{ mt: 1 }}>{msg}</Typography>}
        <Button type="submit" variant="contained" className='form-button'>Сохранить</Button>
      </Box></>
  );
}