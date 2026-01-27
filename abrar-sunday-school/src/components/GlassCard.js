import React from 'react';
import styles from './GlassCard.module.css';

const GlassCard = ({ children, className = '', hover = true, padding = 'default', onClick }) => {
    const paddingClass = {
        none: styles.paddingNone,
        sm: styles.paddingSm,
        default: styles.paddingDefault,
        lg: styles.paddingLg
    };

    return (
        <div
            className={`${styles.glassCard} ${hover ? styles.hover : ''} ${paddingClass[padding]} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default GlassCard;
