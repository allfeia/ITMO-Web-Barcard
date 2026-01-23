import { Fade, Modal, Paper, Typography, Box, TextField, IconButton, Button, Snackbar, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useMemo, useState, useRef, useEffect} from "react";
import { useAuth } from "../authContext/useAuth.js";
import "./orderCard.css";
import "../commonStyles.css"

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 10;
const ERROR_MESSAGES = {
  quantityZero: "Количество коктелей в заказе должно быть больше нуля",
  quantityMax: "Максимально можно заказать 10 коктелей",
  tableZero: "Номер стола должен быть больше нуля",
  tableInvalid: "Поле может содержать только числа",
  tableRequired: "Укажите корректный номер стола",
};

function clampInt(n, min, max) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.min(max, Math.max(min, Math.trunc(x)));
}

function OrderModal({ open, onClose }) {
  const { barId } = useAuth();

  const [tableNumber, setTableNumber] = useState("");
  const [quantityStr, setQuantityStr] = useState("1");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [tableError, setTableError] = useState("");
  const [reachedMaxByButtons, setReachedMaxByButtons] = useState(false);
  const [quantityFocused, setQuantityFocused] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);

  const qtyRowRef = useRef(null);

  const quantity = useMemo(() => {
    const num = parseInt(quantityStr, 10);
    return isNaN(num) ? MIN_QUANTITY : clampInt(num, MIN_QUANTITY, MAX_QUANTITY);
  }, [quantityStr]);

  const tableNum = useMemo(() => {
    const num = parseInt(tableNumber, 10);
    return isNaN(num) ? 0 : num;
  }, [tableNumber]);

  const canSubmit = useMemo(() => {
    const qtyValid = quantity >= MIN_QUANTITY && quantity <= MAX_QUANTITY && quantityStr !== "0";
    const tableValid = tableNum > 0;
    const noErrors = !quantityError || (reachedMaxByButtons && quantity === MAX_QUANTITY);
    return Boolean(barId) && tableValid && qtyValid && noErrors;
  }, [barId, tableNum, quantity, quantityStr, quantityError, reachedMaxByButtons]);

  const validateQuantity = (val) => {
    const num = parseInt(val, 10);
    
    if (val === "0" || num === 0) {
      return ERROR_MESSAGES.quantityZero;
    }
    if (num > MAX_QUANTITY) {
      return ERROR_MESSAGES.quantityMax;
    }
    return "";
  };

  const validateTable = (val) => {
    if (val === "") return "";
    
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      return ERROR_MESSAGES.tableInvalid;
    }
    if (num === 0) {
      return ERROR_MESSAGES.tableZero;
    }
    return "";
  };

  const handleDec = () => {
    setQuantityFocused(true);
    const newVal = Math.max(MIN_QUANTITY, quantity - 1);
    setQuantityStr(String(newVal));
    setQuantityError("");
    setReachedMaxByButtons(false);
  };

  const handleInc = () => {
    setQuantityFocused(true);
    const newVal = Math.min(MAX_QUANTITY, quantity + 1);
    setQuantityStr(String(newVal));
    
    if (newVal === MAX_QUANTITY) {
      setQuantityError(ERROR_MESSAGES.quantityMax);
      setReachedMaxByButtons(true);
    } else {
      setQuantityError("");
      setReachedMaxByButtons(false);
    }
  };

  const handleQuantityChange = (e) => {
    const val = e.target.value;
    if (val === "" || /^\d+$/.test(val)) {
      setQuantityStr(val);
      setReachedMaxByButtons(false);
      setQuantityError(validateQuantity(val));
    }
  };

  const handleQuantityBlur = () => {
    const num = parseInt(quantityStr, 10);
    
    if (isNaN(num) || num < MIN_QUANTITY) {
      setQuantityStr(String(MIN_QUANTITY));
      setQuantityError("");
      setReachedMaxByButtons(false);
    } else if (num > MAX_QUANTITY) {
      setQuantityStr(String(MAX_QUANTITY));
      setQuantityError(ERROR_MESSAGES.quantityMax);
      setReachedMaxByButtons(false);
    } else if (num === MAX_QUANTITY && !reachedMaxByButtons) {
      setQuantityError("");
    }
    
    setQuantityFocused(false);
  };

  const handleTableChange = (e) => {
    const val = e.target.value;
    if (val === "" || /^\d+$/.test(val)) {
      setTableNumber(val);
      setTableError(validateTable(val));
    } else {
      setTableError(ERROR_MESSAGES.tableInvalid);
    }
  };

  const handleTableBlur = () => {
    setTableError(validateTable(tableNumber));
  };

  const resetForm = () => {
    setTableNumber("");
    setQuantityStr("1");
    setQuantityError("");
    setTableError("");
    setErrorText("");
    setReachedMaxByButtons(false);
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const handleSubmit = async () => {
    setErrorText("");
    
    if (!String(tableNumber).trim() || tableNum <= 0) {
      setTableError(ERROR_MESSAGES.tableRequired);
      return;
    }

    if (quantity === 0 || quantity > MAX_QUANTITY) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        barId: Number(barId),
        cocktailId,
        tableNumber,
        quantity,
      };

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = data?.error || `Ошибка отправки заказа (${res.status})`;
        throw new Error(msg);
      }

      resetForm();
      setSnackOpen(true);
      handleClose();
    } catch (e) {
      setErrorText(e?.message || "Ошибка отправки заказа");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (qtyRowRef.current && !qtyRowRef.current.contains(event.target)) {
        setQuantityFocused(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <>
      <Modal
        className="order-modal"
        open={open}
        onClose={handleClose}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(8px)",
              transition: "0.6s",
            },
          },
        }}
      >
        <Fade in={open} timeout={250}>
          <Paper className="order-modal__paper" elevation={6}>
            <Typography variant="h5" className="order-modal__title">
              Заказ
            </Typography>

            <Box className="order-modal__section">
              <Typography className="order-modal__label">Укажите номер стола</Typography>
              <TextField
                value={tableNumber}
                onChange={handleTableChange}
                onBlur={handleTableBlur}
                placeholder="№"
                size="small"
                fullWidth
                inputProps={{ inputMode: "numeric" }}
              />
              {tableError && (
                <Typography className="order-modal__quantity-error" role="alert">
                  {tableError}
                </Typography>
              )}
            </Box>

            <Box className="order-modal__section">
              <Typography className="order-modal__label">Укажите количество</Typography>

              <Box className="order-modal__qtyRow" ref={qtyRowRef}>
                <TextField
                  value={quantityStr}
                  onChange={handleQuantityChange}
                  onBlur={handleQuantityBlur}
                  onFocus={() => setQuantityFocused(true)}
                  className="order-modal__qtyInput"
                  size="small"
                  inputProps={{ inputMode: "numeric" }}
                />

                <Box 
                  className={`order-modal__qtyButtons ${quantityFocused ? 'focused' : ''}`} 
                  onClick={() => setQuantityFocused(true)}
                >
                  <IconButton onClick={handleInc} aria-label="increase">
                    <AddIcon fontSize="small" />
                  </IconButton>
                  <IconButton onClick={handleDec} aria-label="decrease">
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              
              {quantityError && (
                <Typography className="order-modal__quantity-error" role="alert">
                  {quantityError}
                </Typography>
              )}
            </Box>

            {errorText && (
              <Typography className="order-modal__error" role="alert">
                {errorText}
              </Typography>
            )}

            <Button
              variant="contained"
              className="order-modal__submit"
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
            >
              Отправить
            </Button>
          </Paper>
        </Fade>
      </Modal>

      <Snackbar
        open={snackOpen}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          setSnackOpen(false);
        }}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        className="order-snackbar"
      >
        <Alert
          icon={false}
          onClose={() => setSnackOpen(false)}
          severity="success"
          variant="filled"
          className="order-snackbar__alert"
        >
          Заказ отправлен
        </Alert>
      </Snackbar>
    </>
  );
}

export default OrderModal;
