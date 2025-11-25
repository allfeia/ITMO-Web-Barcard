import React, { useEffect, useRef } from 'react';

function GlassCanvas({ draw }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas && draw) {
            draw(canvas);
        }
    }, [draw]);

    return (
        <div className="glass-wrapper">
            <canvas
                ref={canvasRef}
                width={75}
                height={75}
                className="glass-icon"
            />
        </div>
    );
}

export default GlassCanvas;