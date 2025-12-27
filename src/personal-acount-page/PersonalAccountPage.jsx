import {Link, useNavigate} from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../authContext/useAuth.js'; 
import drawHeartIcon from '../icons/heartIcon.js';
import drawStarIcon from '../icons/starIcon.js';
import drawUserIcon from '../icons/userIcon.js';
import './personal-account.css';
import '../commonStyles.css';
import WestIcon from '@mui/icons-material/West';
import Button from "@mui/material/Button";
import { useApiFetch } from "../apiFetch.js";

function PersonalAccountPage() {
  const canvasRefHeart = useRef(null);
  const canvasRefStar = useRef(null);
  const canvasRefUser = useRef(null);

  const { roles } = useAuth();
  const isBarAdmin = Array.isArray(roles) && roles.includes("bar_admin");

  const [username, setUsername] = useState('');
  const [points, setPoints] = useState(0);

  const [resetLoading, setResetLoading] = useState(false);

  const goTo = useNavigate();
  const apiFetch = useApiFetch();

  useEffect(() => {
    drawUserIcon(canvasRefUser.current, { color: '#fff', filled: true });
    drawStarIcon(canvasRefStar.current, { color: '#fff', filled: true });
    drawHeartIcon(canvasRefHeart.current, { color: '#fff', filled: true });
  }, []);

  useEffect(() => {

    let aborted = false;

    (async () => {
      try {
        const resp = await apiFetch('/api/me', {
          credentials: 'include',
        });
        if (!resp.ok) {
          return;
        }
        const data = await resp.json();
        if (aborted) return;
        setUsername(data?.login || '');
        setPoints(typeof data?.points === 'number' ? data.points : 0);
      } catch (e) {
        if (!aborted) console.error('Failed to load profile', e);
      }
    })();

    return () => { aborted = true; };
  }, []);

  const requestPasswordReset = async () => {
  if (resetLoading) return;

  setResetLoading(true);
  try {
    const resp = await fetch("/api/password/request-reset", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });

    if (!resp.ok) {
      let msg = "Не удалось отправить код. Попробуйте позже.";
      try {
        const j = await resp.json();
        msg = j?.message || j?.error || msg;
      } catch (_) {}
      return;
    }
  } catch (e) {
  } finally {
    setResetLoading(false);
  }
};

  return (
    <div className="screen">
        <Button
            className="back-btn"
            variant="text"
            onClick={() => goTo(-1)}
            data-testid="back-button"
            style={{ cursor: 'pointer' }}
        >
            <WestIcon className="learn-arrow" sx={{fontSize: "30px", color: 'white'}}/>
        </Button>
      <div className="row row-compact" style={{ marginTop: '30px' }}>
        <canvas
          className="icon icon-user"
          ref={canvasRefUser}
        />
        <span className="username">{username}</span>
      </div>

      <div className="row row-compact rating">
        <span className="label">Рейтинг:</span>
        <span className="value">{points}</span>
        <canvas
          className="icon icon-inline"
          ref={canvasRefStar}
        />
      </div>

      <Link to="" className="linkRow">Рейтинг бара</Link>

      <Link to="/favourities" className="linkRow">
        <span className="linkFull">
          <span>Избранное</span>
          <canvas
            className="icon icon-inline"
            ref={canvasRefHeart}
          />
        </span>
      </Link>

      <Link
        to="/password?mode=reset"
        className="linkRow"
        onClick={requestPasswordReset}
      >
        Сменить пароль
      </Link>

      {isBarAdmin && (
        <Link to="/admin/staff/register" className="linkRow">
          <span className="linkFull">Добавить сотрудника</span>
        </Link>
      )}
    </div>
  );
}

export default PersonalAccountPage;