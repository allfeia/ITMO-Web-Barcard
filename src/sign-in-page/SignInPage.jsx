import {useEffect, useRef} from "react";
import '../commonStyles.css'
import './sign-in-page.css'
import drawOlive from "./olive.js";
import BarmanAuthForm from "./BarmanAuthForm.jsx";


function SignInPage() {
    const canvasRefOlive = useRef(null);

    useEffect(() => {
        const canvas = canvasRefOlive.current;
        if (!canvas) return;

        requestAnimationFrame(() => {
            drawOlive(canvas);
        });
    }, []);

    //style={{border: "1px solid #999"}}
    return (
        <div className="sign-in-page">
            <div className="sign-in-container">
                <canvas className="sign-in-olive" ref={canvasRefOlive} width="100" height="55"></canvas>
                <h1 className="sign-in-title">Вход</h1>
                <div className="sign-in-form">
                    <BarmanAuthForm />
                </div>
            </div>
        </div>

    )
}
export default SignInPage;