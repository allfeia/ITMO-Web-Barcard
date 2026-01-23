import React from 'react';
import Button from "@mui/material/Button";

export default function HardModeFailModal({ open, onClose, onChangeMode }) {
    if (!open) return null;

    return (
        <div
            className="modal-overlay"
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1500,
            }}
            onClick={onClose}
        >
            <div
                className="modal-container"
                style={{
                    backgroundColor: '#EFEEEC',
                    color: '#333',
                    padding: '32px',
                    borderRadius: '4px',
                    width: '75%',
                    maxWidth: '450px',
                    position: 'relative',
                    boxShadow: '10px 10px 5px rgba(0,0,0,0.2), 0 8px 32px rgba(0,0,0,0.35)',
                    border: '1px solid #333',
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
                onClick={e => e.stopPropagation()}
            >
                <h3
                    className="modal-title"
                    style={{
                        margin: '0 0 24px 0',
                        fontSize: '2rem',
                        color: '#333',
                        fontWeight: 'normal',
                        lineHeight: '1.2',
                        textAlign: 'center',
                    }}
                >
                    Превышено количество ошибок
                </h3>

                <div
                    className="modal-content"
                    style={{
                        marginBottom: '32px',
                        textAlign: 'center',
                        fontSize: '1.1rem',
                        color: '#444',
                        lineHeight: '1.5',
                    }}
                >
                    <p style={{ margin: 0 }}>
                        Попробуйте другой режим обучения.
                    </p>
                </div>

                <div
                    className="modal-actions"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        alignItems: 'center',
                    }}
                >
                    <Button
                        variant="contained"
                        className="modal-button primary"
                        sx={{
                            backgroundColor: '#333',
                            color: '#EFEEEC',
                            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                            fontSize: '1.2rem',
                            fontWeight: '300',
                            padding: '14px 32px',
                            width: '100%',
                            maxWidth: '320px',
                            borderRadius: '4px',
                            textTransform: 'none',
                            border: '2px solid #333',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: '#111',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
                            },
                        }}
                        onClick={onChangeMode}
                    >
                        Выбрать другой режим
                    </Button>
                </div>
            </div>
        </div>
    );
}