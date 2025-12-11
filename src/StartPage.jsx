import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import './commonStyles.css';
import {useAuth} from "./authContext/useAuth.js";

function StartPage() {

    const goTo = useNavigate();
    const { setBarId, setIsBarman } = useAuth();
    const [isBarmanChecker, setIsBarmanChecker] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const barId = params.get("barId");
        const isBarmanParam = params.get("isBarman");

        if (barId && isBarmanParam) {
            setBarId(barId);
            setIsBarman(isBarmanParam === "true");
            setIsBarmanChecker(isBarmanParam === "true");

            sessionStorage.setItem("barId", barId);
            sessionStorage.setItem("isBarman", isBarmanParam);

        }
    }, []);

    const whoIsEntered = () => {
        if (isBarmanChecker) {
            goTo("/signInPage");
        } else if (!isBarmanChecker) {
            goTo("/menu");
        } else {
            console.log("неизвестный пользователь");
        }
    }
    return (
        <>
            <h1>Начать</h1>
            <button onClick={whoIsEntered}>Начать</button>
        </>
    )
}
export default StartPage;