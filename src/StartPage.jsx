import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import './commonStyles.css';

function StartPage() {

    const goTo = useNavigate();
    const [isBarman, setIsBarman] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const barId = params.get("barId");
        const isBarmanParam = params.get("isBarman");

        if (barId && isBarmanParam) {
            sessionStorage.setItem("barId", barId);
            sessionStorage.setItem("isBarman", isBarmanParam);

            setIsBarman(isBarmanParam === "true");

            console.log(sessionStorage.getItem("barId"));
            console.log(sessionStorage.getItem("isBarman"));

        }
    }, []);

    const whoIsEntered = () => {
        if (isBarman) {
            goTo("/signInPage");
        } else if (!isBarman) {
            goTo("/menu");
        } else {
            console.log("неизвестный пользователь");
        }
    }
    return (
        <>
            <h1>Start</h1>
            <button onClick={whoIsEntered}>Начать</button>
        </>
    )
}
export default StartPage;