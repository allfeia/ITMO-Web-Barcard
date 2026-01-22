import React from 'react';
import { Box, Typography } from '@mui/material';

function OrderPage() {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: '#EFEEEC',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                p: 3,
            }}
        >
            <Typography
                variant="h5"
                sx={{
                    maxWidth: 600,
                    lineHeight: 1.4,
                }}
            >
                Мы уже мешаем что-то невероятное специально для вас!
            </Typography>
        </Box>
    );
}

export default OrderPage;