import React, { useEffect, useRef } from 'react';

const CocktailCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        const width = 200;
        const height = 260;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.scale(dpr, dpr);

        const centerX = 100;
        const centerY = 85;

        // ─── ножка ───
        ctx.fillStyle = '#333';
        ctx.fillRect(centerX - 3.5, centerY + 30, 7, 120);

        // ─── основание ───
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 148);
        ctx.lineTo(centerX - 48, centerY + 165);
        ctx.lineTo(centerX + 48, centerY + 165);
        ctx.closePath();
        ctx.fillStyle = '#333';
        ctx.fill();

        // ─── чаша бокала ───
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 65, 46, 0, 0, Math.PI, false);
        ctx.fillStyle = '#333';
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = Math.max(2, Math.round(3 * dpr) / dpr);
        ctx.stroke();

        // ─── оливка + шпажка ───
        ctx.save();

        const oliveScale = 0.22;
        const oliveX = centerX;
        const oliveY = centerY - 25;

        ctx.translate(oliveX, oliveY);
        ctx.scale(oliveScale, oliveScale);

        // Оливка
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(205.5, 130.5, 80, 60, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#EFEEEC';
        ctx.lineWidth = 4.5;
        ctx.stroke();

        // красная точка
        ctx.fillStyle = '#EFEEEC';
        ctx.beginPath();
        ctx.ellipse(160.5, 160.5, 15, 10, 4, 0, Math.PI * 2);
        ctx.fill();

        // Шпажка — нижняя часть (в бокале)
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(160, 190);
        ctx.lineTo(100, 245);
        ctx.lineTo(153, 187);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#EFEEEC';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Шпажка — верхняя часть
        ctx.beginPath();
        ctx.moveTo(310, 20);
        ctx.lineTo(320, 30);
        ctx.lineTo(267, 83);
        ctx.lineTo(263, 76);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="cocktail-canvas"
            width="200"
            height="260"
            aria-label="Нарисованный коктейль с оливкой"
        />
    );
};

export default CocktailCanvas;