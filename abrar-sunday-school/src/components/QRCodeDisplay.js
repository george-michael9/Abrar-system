import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import styles from './QRCodeDisplay.module.css';

const QRCodeDisplay = ({ data, size = 200, id }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current && data) {
            QRCode.toCanvas(canvasRef.current, data, {
                width: size,
                margin: 2,
                color: {
                    dark: '#00D4FF',
                    light: '#0A0A0F'
                }
            });
        }
    }, [data, size]);

    return (
        <div className={styles.qrContainer}>
            <canvas ref={canvasRef} id={id} className={styles.qrCanvas} />
        </div>
    );
};

export default QRCodeDisplay;
