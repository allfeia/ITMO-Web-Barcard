import React, { useEffect } from "react";
import WestIcon from "@mui/icons-material/West";
import Button from "@mui/material/Button";
import drawHint from "./hint.js";

export default function PageHeader({ title, showHint = false, onBack, onHintClick, hintCanvasRef }) {

    useEffect(() => {
        if (showHint && hintCanvasRef.current) {
            drawHint(hintCanvasRef.current);
        }
    }, [showHint, hintCanvasRef]);

    return (
        <div className="page-header">
            <Button
                className="back-btn"
                variant="text"
                onClick={onBack}
                data-testid="back-button"
            >
                <WestIcon className="learn-arrow" sx={{ fontSize: "30px" }} />
            </Button>

            <h1 className="ingredient-title">{title}</h1>

            {showHint && (
                <canvas
                    className="hint-icon"
                    ref={hintCanvasRef}
                    style={{ width: 50, height: 50 }}
                    onClick={onHintClick}
                />
            )}
        </div>
    );
}
