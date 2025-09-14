import React, { useId } from "react";
import styles from "../styles/FormSection.module.css";

const FormSection = ({ title, description, children }) => {
  const headingId = useId();
  return (
    <section className={styles.card} aria-labelledby={headingId}>
      <div className={styles.cardHeader}>
        <h2 id={headingId}>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      <div className={styles.cardBody}>{children}</div>
    </section>
  );
};

export default FormSection;
