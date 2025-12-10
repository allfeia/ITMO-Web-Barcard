import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
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
    const [searchParams] = useSearchParams();

    const [isBarman, setIsBarman] = useState(null);

    useEffect(() => {
        const barId = searchParams.get("barId");
        const isBarmanParam = searchParams.get("isBarman");

        if (barId && isBarmanParam !== null) {
            sessionStorage.setItem("barId", String(barId));
            sessionStorage.setItem("isBarman", String(isBarmanParam));
            setIsBarman(isBarmanParam === "true");
        }
    }, [searchParams]);

    const whoIsEntered = () => {
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
                            className={`track ${track.reverse ? 'reverse' : 'forward'}`}
                            style={{ '--speed': `${track.speed}s` }}
                        >
                            <div className="track-inner">
                                {[...Array(32)].map((_, i) => {
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
                onClick={whoIsEntered}
            >
                Начать
            </Button>
        </div>
    );
}

export default StartPage;