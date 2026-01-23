import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import WestIcon from '@mui/icons-material/West';
import './topList.css';
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

import { db } from '../mocks/db';

export default function TopList() {
    const goTo = useNavigate();

    const barId = JSON.parse(localStorage.getItem('currentBar'))?.id || 123;

    const [barName, setBarName] = useState("Загрузка...");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBarAndRating = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/bar/${barId}/with-rating`);

            if (!response.ok) {
                throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            setBarName(data.bar?.name || "Бар без названия");
            setUsers(data.rating || []);
            setError(null);
        } catch (err) {
            console.error('Ошибка загрузки данных бара и рейтинга:', err);
            setError(err.message);

            // fallback — берём напрямую из мока (db)
            const fallbackBar = db.bars.find(b => b.id === barId) || { name: "Без названия" };
            setBarName(fallbackBar.name);

            const fallbackUsers = db.users
                .filter(u => u.bar_id === barId)
                .sort((a, b) => b.score - a.score)
                .map(u => ({ login: u.login, score: u.score }));

            setUsers(fallbackUsers.length > 0 ? fallbackUsers : [
                { login: "alex_ivanov", score: 4850 },
                { login: "maria_smirnova", score: 4720 },
                { login: "dmitry_petrov", score: 4630 },
                { login: "anna_kuznetsova", score: 4550 },
                { login: "sergey_vasiliev", score: 4410 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBarAndRating();
        const interval = setInterval(fetchBarAndRating, 30000);
        return () => clearInterval(interval);
    }, [barId]);

    const formatScore = (score) =>
        score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    return (
        <div className="top-page">
            <Button
                className="back-btn"
                variant="text"
                onClick={() => {
                    goTo(-1);
                }}
                data-testid="back-button"
            >
                <WestIcon className="learn-arrow" sx={{ fontSize: "30px" }} />
            </Button>

            <div className="page-content">
                <h1 className="top-title">
                    Рейтинг<br />бара
                </h1>

                <div className="bar-name-container">
                    <Link to="/menu" className="bar-name-link">
                        {barName}
                    </Link>
                </div>

                <div className="bar-divider"></div>

                <div className="users-rating-list">
                    {loading ? (
                        <div className="loading">Загрузка рейтинга...</div>
                    ) : error ? (
                        <div className="error">
                            {error} <br />
                            Показан резервный рейтинг
                        </div>
                    ) : users.length === 0 ? (
                        <div className="empty-rating">
                            <p>Рейтинг пуст</p>
                            <p>Станьте первым участником!</p>
                        </div>
                    ) : (
                        users.map((user, index) => (
                            <div
                                key={user.login || index}
                                className="user-rating-item"
                            >
                                <div className="user-details">
                                    <span className="user-login">{user.login}</span>
                                    <span className="user-score">
                                        {formatScore(user.score)} очков
                                    </span>
                                </div>
                                <div className="star-position">
                                    {index < 3 ? (
                                        <StarIcon className="star-icon filled-star" />
                                    ) : (
                                        <StarBorderIcon
                                            className="star-icon border-star"
                                            sx={{ strokeWidth: "0.5" }}
                                        />
                                    )}
                                    <span
                                        className={`position-number ${
                                            index < 3 ? 'top-three' : 'other'
                                        }`}
                                    >
                                        {index + 1}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}