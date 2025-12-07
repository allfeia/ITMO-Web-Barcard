import {Fade, Modal, Paper, Typography} from "@mui/material";
import EastIcon from '@mui/icons-material/East';
import {useNavigate} from "react-router-dom";

function RecipeCard({open, onClose, cocktail}) {
    const goTo = useNavigate();

    return (
        <Modal
            className="menu-flipped-card"
            open={open}
            onClose={onClose}
            slotProps={{
                backdrop: {
                    sx: {
                        backdropFilter: "blur(8px)",
                        transition: "0.6s"
                    }
                }
            }}
        >
            <Fade in={open} timeout={300}>
                <Paper className="menu-flipped-card-content">
                    <Typography variant="h4" className="cocktail-name">{cocktail.name}</Typography>
                    <Typography
                        component="div"
                        className="learn"
                        onClick={() => goTo("/levelPage")}
                    >
                        <Typography variant="h6" className="learn-cocktail">Изучить</Typography>
                        <EastIcon
                            className="learn-arrow"
                            sx={{ fontSize: "30px" }}
                        />
                    </Typography>
                </Paper>
            </Fade>

        </Modal>

    )
}
export default RecipeCard;