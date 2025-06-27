import React from "react";
import styles from "../../styles/shared/Card.module.css";

const Card = ({ title, description, children, className }) => {
  return (
    <div className={`${styles.card} ${className || ""}`}>
      {(title || description) && (
        <div className={styles.cardHeader}>
          {title && <h2>{title}</h2>}
          {description && <p>{description}</p>}
        </div>
      )}
      <div className={styles.cardBody}>{children}</div>
    </div>
  );
};

export default Card;
