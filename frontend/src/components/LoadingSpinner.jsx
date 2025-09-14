import React from "react";
import styles from "../styles/LoadingSpinner.module.css";

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div
      className={styles.loadingContainer}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className={styles.loader} aria-hidden="true"></div>
      <p>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
