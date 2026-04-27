import {Button} from "@mui/material";
import './psy-quest.css'
import WestIcon from "@mui/icons-material/West";
import {useNavigate} from "react-router-dom";

function PsyQuest() {
    const goTo = useNavigate();
    return (
        <div className="san-wrap">
            <Button
                className="back-btn"
                variant="text"
                onClick={() => goTo(-1)}
                data-testid="back-button"
            >
                <WestIcon className="learn-arrow" sx={{fontSize: "30px"}}/>
            </Button>
            <div className="san-card san-fade-in opportunity-panel">
                <div className="opportunity-panel">
                    <p className="san-h1">Мы подберём вам коктейли по вашему самочувствию!</p>
                    {/*<p className="san-body">Мы подберём вам коктейли по вашему самочувствию!</p>*/}
                    <Button
                        variant="contained"
                        className="san-btn"
                        onClick={() => goTo("/san")}
                    >
                        Пройти опросник
                    </Button>
                </div>
            </div>
        </div>
    )
}
export default PsyQuest;