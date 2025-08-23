import React, { useState, Suspense, useCallback } from "react";
import DictionaryEditor from "./DictionaryEditor";
import styles from "../styles/ScanForm.module.css";
import { usePrefetch } from "../hooks/usePrefetch";
const HelpModal = React.lazy(() =>
  import(
    /* webpackChunkName: "help-modal" */
    /* webpackPrefetch: true */
    "./HelpModal"
  )
);

const ScanForm = ({ onScan, isLoading = false }) => {
  const [targetUrlsInput, setTargetUrlsInput] = useState("");
  const [mode, setMode] = useState("normal");
  const [exclusions, setExclusions] = useState("");
  const [maxDepth, setMaxDepth] = useState(2);
  const [respectRobotsTxt, setRespectRobotsTxt] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [dictionaryConfig, setDictionaryConfig] = useState({
    operations: [],
    useDefault: true,
  });
  const [sessionCookies, setSessionCookies] = useState(""); // ADDED

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetUrlsInput.trim()) {
      alert("Please enter target URLs or IP addresses.");
      return;
    }
    const targetList = targetUrlsInput
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item);

    if (targetList.length === 0) {
      alert("Please enter valid target URLs or IP addresses.");
      return;
    }

    const exclusionList = exclusions
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item);

    onScan(
      targetList,
      mode,
      exclusionList,
      parseInt(maxDepth, 10),
      respectRobotsTxt,
      dictionaryConfig.operations,
      dictionaryConfig.useDefault,
      sessionCookies // ADDED
    );
  };

  const toggleHelp = useCallback(() => {
    setShowHelp((v) => !v);
  }, []);

  const prefetchHelp = usePrefetch([
    () =>
      import(
        /* webpackChunkName: "help-modal" */
        /* webpackPrefetch: true */
        "./HelpModal"
      ),
  ]);

  const prefetchResultsUI = usePrefetch([
    () =>
      import(
        /* webpackChunkName: "result-table" */
        /* webpackPrefetch: true */
        "./ResultTable"
      ),
    () =>
      import(
        /* webpackChunkName: "scan-summary" */
        /* webpackPrefetch: true */
        "./ScanSummary"
      ),
  ]);

  const handleDictionaryChange = (config) => {
    setDictionaryConfig(config);
  };

  return (
    <>
      <Suspense fallback={null}>
        <HelpModal isOpen={showHelp} onClose={toggleHelp} />
      </Suspense>

      <form onSubmit={handleSubmit} className={styles.scanForm}>
        <div className={styles.formHeader}>
          <button
            type="button"
            className={styles.helpButton}
            onClick={toggleHelp}
            onMouseEnter={prefetchHelp}
            onFocus={prefetchHelp}
          >
            Help
          </button>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="targetUrls">
            <span className={styles.formLabel}>Target URL List</span>
            <span className={styles.formHint}>Enter one per line</span>
          </label>
          <textarea
            id="targetUrls"
            placeholder="e.g., http://example.com"
            value={targetUrlsInput}
            onChange={(e) => setTargetUrlsInput(e.target.value)}
            rows="3"
            className={styles.formControl}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="sessionCookies">
            <span className={styles.formLabel}>Session Cookies (Optional)</span>
            <span className={styles.formHint}>
              E.g., cookie1=value1; cookie2=value2
            </span>
          </label>
          <textarea
            id="sessionCookies"
            placeholder="Enter session cookies as a string (e.g., PHPSESSID=abc; user_token=xyz)"
            value={sessionCookies}
            onChange={(e) => setSessionCookies(e.target.value)}
            className={styles.formControl}
            rows="3"
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="scanMode">
              <span className={styles.formLabel}>Scan Mode</span>
            </label>
            <select
              id="scanMode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className={styles.formControl}
            >
              <option value="normal">Normal</option>
              <option value="darkweb">Darkweb (.onion)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="maxDepth">
              <span className={styles.formLabel}>Maximum Crawling Depth</span>
            </label>
            <input
              id="maxDepth"
              type="number"
              value={maxDepth}
              onChange={(e) => setMaxDepth(e.target.value)}
              min="0"
              max="5"
              className={styles.formControl}
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={respectRobotsTxt}
                  onChange={(e) => setRespectRobotsTxt(e.target.checked)}
                  className={styles.formCheckbox}
                />
                <span>Respect robots.txt rules</span>
              </label>
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.dictionarySection}>
            <DictionaryEditor onChange={handleDictionaryChange} />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="exclusions">
            <span className={styles.formLabel}>Domains or URLs to Exclude</span>
            <span className={styles.formHint}>Enter one per line</span>
          </label>
          <textarea
            id="exclusions"
            placeholder="e.g., admin.example.com"
            value={exclusions}
            onChange={(e) => setExclusions(e.target.value)}
            rows="2"
            className={styles.formControl}
          />
        </div>

        <button
          type="submit"
          className={styles.scanButton}
          onMouseEnter={prefetchResultsUI}
          onFocus={prefetchResultsUI}
          disabled={isLoading}
        >
          <span className={styles.icon}>🔍</span>{" "}
          {isLoading ? "Scanning..." : "Start Scan"}
        </button>
      </form>
    </>
  );
};

export default ScanForm;
