import { Modal, Fade, Paper, Typography, Button } from "@mui/material";

function ErrorModal({ open, onClose, errorCount }) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            slotProps={{
                backdrop: {
                    sx: {
                        backdropFilter: "blur(8px)",
                        transition: "0.6s",
                    },
                },
            }}
            className="menu-flipped-card"
        >
            <Fade in={open} timeout={300}>
                <Paper className="menu-flipped-card-content" sx={{ textAlign: "center" }}>
                    <Typography variant="h5" gutterBottom>
                        Найдено ошибок: {errorCount}
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{ marginTop: 1, backgroundColor: "#333", color: "#fff" }}
                        onClick={onClose}
                    >
                        Закрыть
                    </Button>
                </Paper>
            </Fade>
        </Modal>
    );
}

export default ErrorModal;
