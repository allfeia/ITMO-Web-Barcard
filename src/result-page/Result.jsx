import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Stack } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import LiquorIcon from '@mui/icons-material/Liquor';
import CocktailCanvas from './CocktailCanvas';
import './Result.css';

function Result({ score = 326, onHome }) {
    const navigate = useNavigate();
    const handleReplay = () => {
        navigate('/levelPage');
    };
    const handleBar = () => {
        navigate('/menu');
    };
    const handleOrder = () => {
        navigate('/order');
    };
    return (
        <Box className="result-screen">
            <Typography variant="h4" component="h1" className="titleResult">
                Готово!
            </Typography>

            <Typography variant="h5" className="subtitle">
                Рейтинг: {score} ★
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

                <Box className="icon-button-container">
                    <IconButton
                        color="inherit"
                        size="large"
                        onClick={onHome}
                        title="домой"
                        className="control-icon-button"
                    >
                        <HomeIcon fontSize="large" />
                    </IconButton>
                    <Typography className="icon-label">Домой</Typography>
                </Box>
            </Stack>

            <Button
                variant="contained"
                disableElevation
                disableRipple
                className="order-button"
                onClick={handleOrder}
            >
                Заказать
            </Button>
        </Box>
    );
}

export default Result;