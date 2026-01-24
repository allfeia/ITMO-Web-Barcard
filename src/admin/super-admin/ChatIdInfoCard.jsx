import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Link,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "./chatIdInfoCard.css";
import "../../commonStyles.css";

export default function ChatIdInfoModal({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className="chatid-modal"
      PaperProps={{
        className: "chatid-modal__paper",
      }}
    >
      <Box className="chatid-modal__paperInner">
        <IconButton
          onClick={onClose}
          className="chatid-modal__close"
          aria-label="Закрыть"
        >
          <CloseIcon />
        </IconButton>

        <DialogTitle className="chatid-modal__title">
          Как получить ID чата в Telegram
        </DialogTitle>

        <DialogContent className="chatid-modal__content">
          <Box className="chatid-modal__text">
            <Typography component="p" className="chatid-modal__p">
              1. Создайте группу в Телеграм
            </Typography>
            <Typography component="p" className="chatid-modal__p">
  2. Добавьте в созданную группу бот{" "}
  <Link
    href="https://t.me/BarcardOders_bot"
    // target="_blank"
    className = "chatid-modal_link"
  >
    @BarcardOders_bot
  </Link>
</Typography>
            <Typography component="p" className="chatid-modal__p">
              3. Напишите команду /chatid
            </Typography>
            <Typography component="p" className="chatid-modal__p">
              4. Скопируйте значение и вставьте в поле "ID чата в Telegram"
            </Typography>
            <Typography component="p" className="chatid-modal__hint">
              Обратите внимание ID группы может быть отрицательным числом
            </Typography>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
}