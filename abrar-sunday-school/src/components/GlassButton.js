import React from 'react';
import styles from './GlassButton.module.css';

const GlassButton = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    onClick,
    type = 'button',
    className = ''
}) => {
    const variantClass = {
        primary: styles.primary,
        secondary: styles.secondary,
        success: styles.success,
        danger: styles.danger,
        ghost: styles.ghost
    };

    const sizeClass = {
        sm: styles.sm,
        md: styles.md,
        lg: styles.lg
    };

    return (
        <button
            type={type}
            className={`
        ${styles.btn}
        ${variantClass[variant]}
        ${sizeClass[size]}
        ${fullWidth ? styles.fullWidth : ''}
        ${disabled || loading ? styles.disabled : ''}
        ${className}
      `}
            onClick={onClick}
            disabled={disabled || loading}
        >
            {loading ? (
                <span className={styles.spinner}></span>
            ) : (
                children
            )}
        </button>
    );
};

export default GlassButton;
