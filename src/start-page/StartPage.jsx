import React, { useEffect, useState } from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import './StartPage.css';
import { drawBlueGlass } from '../glasses/BlueGlass.js';
import { drawPinkGlass } from '../glasses/PinkGlass.js';
import { drawRedGlass } from '../glasses/RedGlass.js';
import { drawYellowGlass } from '../glasses/YellowGlass.js';
import GlassCanvas from './GlassCanvas';
import {Box, Button, Typography} from '@mui/material';
import {useAuth} from "../authContext/useAuth.js";

const glassDrawers = [drawBlueGlass, drawPinkGlass, drawRedGlass, drawYellowGlass];

function StartPage() {
    const goTo = useNavigate();
    const { pathname } = useLocation();
    const { setBarId, setIsBarman } = useAuth();
    const [isBarmanChecker, setIsBarmanChecker] = useState(null);
    const [hasValidParams, setHasValidParams] = useState(true);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const barId = params.get("barId");
        const isBarmanParam = params.get("isBarman");


        if (pathname.startsWith("/super") || pathname.startsWith("/administration")) {
            return;
        } else if (!barId || !isBarmanParam) {
            setHasValidParams(false);
            return;
        }

        setBarId(barId);
        setIsBarman(isBarmanParam === "true");
        setIsBarmanChecker(isBarmanParam === "true");

        sessionStorage.setItem("barId", barId);
        sessionStorage.setItem("isBarman", isBarmanParam);

    }, []);

    const whoIsEntered = () => {
        if (isBarmanChecker === true) {
            goTo("/signInPage");
        } else if (isBarmanChecker === false) {
            goTo("/menu");
        } else {
            console.log("неизвестный пользователь");
        }
    };

    const tracks = [
        { speed: 18, reverse: false },
        { speed: 22, reverse: true },
        { speed: 20, reverse: false },
        { speed: 25, reverse: true },
        { speed: 21, reverse: false },
    ];

    if (!hasValidParams) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    px: 2,
                }}
            >
                <Typography variant="h5">
                    Пожалуйста, отсканируйте QR-код, чтобы продолжить
                </Typography>
            </Box>
        );
    }

    return (
        <div className="StartPage">
            <h1 className="titleStart">Barcard</h1>
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
                onClick={whoIsEntered}
            >
                Начать
            </Button>
        </div>
    );
}

export default StartPage;