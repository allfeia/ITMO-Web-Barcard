import {Link} from "react-router-dom";
import {useEffect} from "react";

function StartPage() {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const barIdFromUrl = params.get("barId");
        if (barIdFromUrl) {
            sessionStorage.setItem("barId", barIdFromUrl);
            console.log(sessionStorage.getItem("barId"));
        }
    }, []);
    return (
        <>
            <h1>Start</h1>
            <nav>
                <Link to="/signInPage">SignInPage</Link>
            </nav>
        </>
    )
}
export default StartPage;