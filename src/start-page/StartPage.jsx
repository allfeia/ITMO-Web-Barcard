import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import './StartPage.css';
import { drawBlueGlass } from '../glasses/BlueGlass.js';
import { drawPinkGlass } from '../glasses/PinkGlass.js';
import { drawRedGlass } from '../glasses/RedGlass.js';
import { drawYellowGlass } from '../glasses/YellowGlass.js';
import GlassCanvas from './GlassCanvas';
import { Button } from '@mui/material';

const glassDrawers = [drawBlueGlass, drawPinkGlass, drawRedGlass, drawYellowGlass];

function StartPage() {
    const navigate = useNavigate();
    const [isBarman, setIsBarman] = useState<null | boolean>(null);

    useEffect(() => {
        sessionStorage.removeItem("barId");
        sessionStorage.removeItem("isBarman");
        setIsBarman(null);

        const params = new URLSearchParams(window.location.search);
        const barId = params.get("barId");
        const isBarmanParam = params.get("isBarman");

        if (barId !== null) {
            sessionStorage.setItem("barId", barId);
        }

        if (isBarmanParam !== null) {
            const normalized = isBarmanParam === "true" ? "true" : "false";
            sessionStorage.setItem("isBarman", normalized);
            setIsBarman(isBarmanParam === "true");
        }
    }, []);

    useEffect(() => {
        const handlePopstate = () => {
            sessionStorage.removeItem("barId");
            sessionStorage.removeItem("isBarman");
            setIsBarman(null);

            const params = new URLSearchParams(window.location.search);
            const barId = params.get("barId");
            const isBarmanParam = params.get("isBarman");

            if (barId !== null) {
                sessionStorage.setItem("barId", barId);
            }

            if (isBarmanParam !== null) {
                const normalized = isBarmanParam === "true" ? "true" : "false";
                sessionStorage.setItem("isBarman", normalized);
                setIsBarman(isBarmanParam === "true");
            }
        };

        window.addEventListener("popstate", handlePopstate);
        return () => window.removeEventListener("popstate", handlePopstate);
    }, []);

    const handleStartClick = () => {
        if (isBarman === true) {
            navigate("/signInPage");
        } else if (isBarman === false) {
            navigate("/menu");
        }
    };

    const tracks = [
        { speed: 18, reverse: false },
        { speed: 22, reverse: true },
        { speed: 20, reverse: false },
        { speed: 25, reverse: true },
        { speed: 21, reverse: false },
    ];

    return (
        <div className="StartPage">
            <h1 className="title">Barcard</h1>
            <div className="tracks-container">
                <div className="tracks-rotated">
                    {tracks.map((track, trackIndex) => (
                        <div
                            key={trackIndex}
                            className={`track ${track.reverse ? "reverse" : "forward"}`}
                            style={{ "--speed": `${track.speed}s` }}
                        >
                            <div className="track-inner">
                                {Array.from({ length: 32 }, (_, i) => {
                                    const drawFn = glassDrawers[i % glassDrawers.length];
                                    return <GlassCanvas key={i} draw={drawFn} />;
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Button
                variant="contained"
                disableElevation
                className="start-button"
                onClick={handleStartClick}
            >
                Начать
            </Button>
        </div>
    );
}

export default StartPage;