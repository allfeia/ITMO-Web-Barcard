import {canvaStyles} from "../bottoms-utils/canvaStyles.js";

export function drawRedGlass(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvaStyles(canvas);
    ctx.fillStyle = "#E35C5C";

    //бокал
    ctx.beginPath();
    ctx.roundRect(107, 5, 35, 45, 2);
    ctx.fill();


    //ножка
    ctx.beginPath();
    ctx.fillRect(122, 49, 5, 35);

}