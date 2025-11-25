import { Link} from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../AuthContext.jsx'; 
import drawHeartIcon from '../icons/heartIcon.js';
import drawStarIcon from '../icons/starIcon.js';
import drawUserIcon from '../icons/userIcon.js';
import './personal-account.css';
import '../commonStyles.css';

function PersonalAccountPage() {
  const canvasRefHeart = useRef(null);
  const canvasRefStar = useRef(null);
  const canvasRefUser = useRef(null);

  const { token, roles} = useAuth(); 
  const isBarAdmin = Array.isArray(roles) && roles.includes("bar_admin");

  const [username, setUsername] = useState('');
  const [points, setPoints] = useState(0);

  useEffect(() => {
    drawUserIcon(canvasRefUser.current, { color: '#fff', filled: true });
    drawStarIcon(canvasRefStar.current, { color: '#fff', filled: true });
    drawHeartIcon(canvasRefHeart.current, { color: '#fff', filled: true });
  }, []);

  useEffect(() => {
    if (!token) return; 

    let aborted = false;

    (async () => {
      try {
        const resp = await fetch('/api/me', {
          headers: { Authorization: `Bearer ${token}` } 
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
  }, [token]);

  return (
    <div className="screen">
      <div className="row row-compact">
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

      <Link to="" className="linkRow">
        <span className="linkFull">
          <span>Избранное</span>
          <canvas
            className="icon icon-inline"
            ref={canvasRefHeart}
          />
        </span>
      </Link>

        {isBarAdmin && (
          <Link
            to="/admin/staff/register"
            className="linkRow"
          >
            <span className="linkFull">Добавить сотрудника</span>
          </Link>
        )}
    </div>
  );
}

export default PersonalAccountPage;