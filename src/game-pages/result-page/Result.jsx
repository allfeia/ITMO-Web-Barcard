import React, {useEffect} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Typography, Button, IconButton, Stack } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LiquorIcon from '@mui/icons-material/Liquor';
import CocktailCanvas from './CocktailCanvas';
import './Result.css';

function Result() {
    const navigate = useNavigate();
    const isBarman = sessionStorage.getItem("isBarman") === "true";

    const totalScore = useSelector((state) => {
        const stages = state.game.stages;
        return (
            (stages.stage1?.score || 0) +
            (stages.stage2?.score || 0) +
            (stages.stage3?.score || 0)
        );
    });

    const handleReplay = () => {
        navigate('/levelPage');
    };
    const handleBar = () => {
        navigate('/menu');
    };
    const handleOrder = () => {
        navigate('/order');
    };

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

        const sendScoreToServer = async () => {
            const scoreSent = localStorage.getItem(`scoreSent_${currentUser.id}_${new Date().toLocaleDateString()}`);
            if (totalScore > 0 && currentUser.login && !scoreSent) {
                try {
                    const response = await fetch('/api/rating/update-score', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            login: currentUser.login,
                            score: totalScore
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log('Очки успешно обновлены:', data);
                        localStorage.setItem(`scoreSent_${currentUser.id}_${new Date().toLocaleDateString()}`, 'true');
                    }
                } catch (error) {
                    console.error('Ошибка:', error);
                }
            }
        };
        if (isBarman) {
            sendScoreToServer();
        }
    }, [totalScore, isBarman]);

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
                    <>
                        Ваш результат: {totalScore} ★
                    </>
                )}
            </Typography>

            <div className="cocktail-container">
                <CocktailCanvas />
            </div>

            <Stack
                direction="row"
                spacing={4}
                justifyContent="center"
                className="button-stack"
            >
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
                <Button
                    variant="contained"
                    disableElevation
                    disableRipple
                    className="order-button"
                    onClick={handleOrder}
                >
                    Заказать
                </Button>
            )}
        </Box>
    );
}

export default Result;