import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import WestIcon from '@mui/icons-material/West';
import './topList.css';
import { useState, useEffect } from "react";
import StarIcon from '@mui/icons-material/Star';
import { useAuth } from "../authContext/useAuth.js";
import '../commonStyles.css'

export default function TopList() {
    const goTo = useNavigate();
    const { barId, barName, barSite } = useAuth();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRating = async () => {
        if (!barId) {
            setError("ID бара не найден");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/bar/${barId}/with-rating`);

            if (!response.ok) {
                throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            setUsers(data.rating || []);
        } catch (err) {
            console.error('Ошибка загрузки рейтинга:', err);
            setError(err.message || "Не удалось загрузить рейтинг");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRating();
    }, [barId]);

    const formatScore = (score) =>
        score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    const handleBarSiteClick = (e) => {
        e.preventDefault();
        if (barSite) {
            window.open(barSite, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="top-page">
            <Button
                className="back-btn"
                variant="text"
                onClick={() => goTo(-1)}
                data-testid="back-button"
            >
                <WestIcon className="learn-arrow" sx={{ fontSize: "30px" }} />
            </Button>

            <div className="page-content">
                <h1 className="top-title">
                    Рейтинг бара
                </h1>

                <div className="bar-name-container">
                    {barSite ? (
                        <a
                            href={barSite}
                            onClick={handleBarSiteClick}
                            className="bar-name-link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {barName || "Бар"}
                        </a>
                    ) : (
                        <span className="bar-name-link">
                            {barName || "Бар"}
                        </span>
                    )}
                </div>

                <div className="bar-divider"></div>

                <div className="page-content-inner">
                    <div className="users-rating-list">
                        {loading ? (
                            <div className="loading">Загрузка рейтинга...</div>
                        ) : error ? (
                            <div className="error">
                                {error}
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
                                        <StarIcon className="star-icon filled-star" />
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
        </div>
    );
}