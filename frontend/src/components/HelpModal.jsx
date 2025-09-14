import React, { useEffect, useRef, useCallback } from "react";
import styles from "../styles/HelpModal.module.css";

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const dialogRef = useRef(null);
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    // Move focus to dialog for screen readers and keyboard users
    if (dialogRef.current) {
      dialogRef.current.focus();
    }
  }, []);

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick} role="presentation">
      <div
        id="help-modal"
        className={styles.modalContent}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        tabIndex="-1"
        ref={dialogRef}
        onKeyDown={onKeyDown}
      >
        <div className={styles.modalHeader}>
          <h2 id="help-modal-title" className={styles.modalTitle}>Directory Tracer - Help</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.helpContent}>
          <div className={styles.helpSection}>
            <h3>Target URLs</h3>
            <p>
              Enter target URLs to scan, one per line. (e.g.,
              http://example.com)
            </p>
          </div>

          <div className={styles.helpSection}>
            <h3>Scan Mode</h3>
            <p>
              <strong>Normal:</strong> Standard website scanning
            </p>
            <p>
              <strong>Darkweb:</strong> Use Tor proxy for scanning .onion
              domains
            </p>
          </div>

          <div className={styles.helpSection}>
            <h3>Maximum Crawling Depth</h3>
            <p>
              Set the maximum depth for recursive exploration of internal links.
              Higher values will increase scan time.
            </p>
          </div>

          <div className={styles.helpSection}>
            <h3>Respect robots.txt Rules</h3>
            <p>
              Choose whether to follow access restriction rules specified in the
              website's robots.txt file.
            </p>
          </div>

          <div className={styles.helpSection}>
            <h3>Dictionary Settings</h3>
            <p>
              Edit the list of directories to scan. You can use the default
              dictionary or add/remove custom items.
            </p>
          </div>

          <div className={styles.helpSection}>
            <h3>Exclusion List</h3>
            <p>Enter domains or URLs to exclude from scanning, one per line.</p>
          </div>

          <div className={styles.helpSection}>
            <h3>Session Cookies (Optional)</h3>
            <p>
              If the target website requires authentication to access certain
              areas, you can provide your browser's session cookie string.
            </p>
            <p>
              <strong>How to get cookies:</strong>
            </p>
            <ol>
              <li>Log in to the target website in your browser.</li>
              <li>Open Developer Tools (F12).</li>
              <li>
                Go to "Application" (Chrome/Edge) or "Storage" (Firefox) tab.
              </li>
              <li>Find "Cookies" under Storage section.</li>
              <li>
                Copy session cookies as: <code>name1=value1; name2=value2</code>
              </li>
            </ol>
            <p>
              <strong>Note:</strong> Session cookies allow authenticated
              scanning. Handle with care as they provide access to your
              logged-in session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
