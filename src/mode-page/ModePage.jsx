import {useEffect, useRef} from 'react'
import './mode-page.css'
import '../commonStyles.css'
import {drawAll} from "./bottoms-utils/drawAll.js";
import {useGoTo} from "../useGoTo.js";

function ModePage() {
    const canvasRefBarman = useRef(null);
    const canvasRefGuest = useRef(null);

    const goTo = useGoTo();

    useEffect(() => {
        drawAll(canvasRefBarman.current, canvasRefGuest.current);

    }, []);

    //style={{border: "1px solid #999"}}
  return (
    <div className="mode-container">
        <h1 className="mode-title">Выберете<br/>режим</h1>
        <div className="mode-buttons">
            <button className="mode-button" id="visitor">
                <canvas ref={canvasRefGuest} width="320" height="82"></canvas>
                <span>Посетитель</span>
            </button>
            <button className="mode-button" id="barman" onClick={() => goTo("/signInPage")}>
                <canvas ref={canvasRefBarman} width="320" height="82" ></canvas>
                <span>Бармен</span>
            </button>

            <div className="curve">

            </div>


        </div>
    </div>
  )

}

export default ModePage
