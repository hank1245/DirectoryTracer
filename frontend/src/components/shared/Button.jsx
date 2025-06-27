import React from "react";
import styles from "../../styles/shared/Button.module.css";

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  onClick,
  type = "button",
  className,
  ...props
}) => {
  const buttonClass = `${styles.btn} ${
    styles[`btn${variant.charAt(0).toUpperCase() + variant.slice(1)}`]
  } ${styles[`btn${size.charAt(0).toUpperCase() + size.slice(1)}`]} ${
    className || ""
  }`;

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
