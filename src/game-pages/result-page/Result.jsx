import React, {useEffect, useState} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Typography, Button, IconButton, Stack } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LiquorIcon from '@mui/icons-material/Liquor';
import CocktailCanvas from './CocktailCanvas';
import './Result.css';
import { useAuth } from "../../authContext/useAuth.js";
import OrderModal from "../OderCard.jsx";

function Result() {
    const navigate = useNavigate();
    const { isBarman, currentUser } = useAuth();

    const totalScore = useSelector((state) => {
        const stages = state.game.stages;
        return (
            (stages.stage1?.score || 0) +
            (stages.stage2?.score || 0) +
            (stages.stage3?.score || 0)
        );
    });

    const cocktailId = useSelector((state) => {state.game.cocktailId})

    const handleReplay = () => navigate('/levelPage');
    const handleBar = () => navigate('/menu');

    const [orderOpen, setOrderOpen] = useState(false);

    const handleOrderOpen = () => setOrderOpen(true);
    const handleOrderClose = () => setOrderOpen(false);

    useEffect(() => {
        if (!isBarman || !currentUser?.login || totalScore <= 0) return;

        const sendScoreToServer = async () => {
            const today = new Date().toLocaleDateString();
            const scoreSentKey = `scoreSent_${currentUser.id}_${today}`;

            if (localStorage.getItem(scoreSentKey)) return;

            try {
                const response = await fetch('/api/rating/update-score', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        login: currentUser.login,
                        score: totalScore
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Очки успешно добавлены к рейтингу:', data);
                    localStorage.setItem(scoreSentKey, 'true');
                } else {
                    console.error('Ошибка сервера:', await response.text());
                }
            } catch (error) {
                console.error('Ошибка сети при отправке очков:', error);
            }
        };

        sendScoreToServer();
    }, [totalScore, isBarman, currentUser]);

    return (
        <Box className="result-screen">
            <Typography variant="h4" component="h1" className="titleResult">
                Готово!
            </Typography>

            <Typography variant="h5" className="subtitle">
                {isBarman ? (
                    <>
                        <Link
                            to="/top"
                            style={{ color: 'inherit', textDecoration: 'underline' }}
                        >
                            Рейтинг
                        </Link>
                        : {totalScore} ★
                    </>
                ) : (
                    <>Ваш результат: {totalScore} ★</>
                )}
            </Typography>

            <div className="cocktail-container">
                <CocktailCanvas />
            </div>

            <Stack direction="row" spacing={4} justifyContent="center" className="button-stack">
                <Box className="icon-button-container">
                    <IconButton
                        color="inherit"
                        size="large"
                        onClick={handleReplay}
                        title="переиграть"
                        className="control-icon-button"
                    >
                        <RefreshIcon fontSize="large" />
                    </IconButton>
                    <Typography className="icon-label">Переиграть</Typography>
                </Box>

                <Box className="icon-button-container">
                    <IconButton
                        color="inherit"
                        size="large"
                        onClick={handleBar}
                        title="бар"
                        className="control-icon-button"
                    >
                        <LiquorIcon fontSize="large" />
                    </IconButton>
                    <Typography className="icon-label">Бар</Typography>
                </Box>
            </Stack>

            {!isBarman && (
                <>
                    <Button
                        variant="contained"
                        disableElevation
                        disableRipple
                        className="order-button"
                        onClick={handleOrderOpen}
                    >
                        Заказать
                    </Button>
                    <OrderModal
                        open={orderOpen}
                        onClose={handleOrderClose}
                        cocktailId={cocktailId}
                    />
                </>
            )}
        </Box>
    );
}

export default Result;