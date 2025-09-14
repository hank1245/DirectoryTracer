import React, { Suspense, useEffect } from "react";
import styles from "../styles/App.module.css";
import ScanForm from "../components/ScanForm";
import LoadingSpinner from "../components/LoadingSpinner";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FormSection from "../components/FormSection";
import ErrorBoundary from "../components/ErrorBoundary";
import { useScan } from "../hooks/useScan";
import { useReportGenerator } from "../hooks/useReportGenerator";

const ResultTable = React.lazy(() =>
  import(
    /* webpackChunkName: "result-table" */
    /* webpackPrefetch: true */
    "../components/ResultTable"
  )
);

const ScanSummary = React.lazy(() =>
  import(
    /* webpackChunkName: "scan-summary" */
    /* webpackPrefetch: true */
    "../components/ScanSummary"
  )
);

export default function ScannerPage() {
  const {
    results,
    loading,
    scanMetadata,
    rawScanData,
    handleScan,
    getScanSummary,
    scanError,
  } = useScan();

  const { generateReport } = useReportGenerator(
    results,
    scanMetadata,
    rawScanData
  );

  const scanSummary = getScanSummary();

  useEffect(() => {
    if (loading) {
      import(
        /* webpackChunkName: "result-table" */
        "../components/ResultTable"
      );
      import(
        /* webpackChunkName: "scan-summary" */
        "../components/ScanSummary"
      );
    }
  }, [loading]);

  return (
    <ErrorBoundary>
      <div className={styles.container}>
        <Header />

        <main id="main-content" role="main" tabIndex="-1" aria-busy={loading || undefined}>
          <FormSection
            title="Scan Configuration"
            description="Configure the options below and start scanning."
          >
            <ScanForm onScan={handleScan} isLoading={loading} />
          </FormSection>
          {loading && (
            <LoadingSpinner message="Scanning in progress. Please wait..." />
          )}
          {scanError && (
            <div className={styles.errorMessage} role="alert" aria-live="assertive">
              {scanError}
            </div>
          )}
          {!loading && !scanError && (
            <>
              {scanSummary && Object.keys(scanSummary).length > 0 && (
                <Suspense fallback={null}>
                  <ScanSummary
                    summary={scanSummary}
                    onGenerateReport={generateReport}
                  />
                </Suspense>
              )}

              {scanMetadata &&
                scanMetadata.serverInfos &&
                scanMetadata.serverInfos.length > 0 && (
                  <section className={styles.serverInfoSection} aria-labelledby="server-info-heading">
                    <h3 id="server-info-heading">Server Information:</h3>
                    {scanMetadata.serverInfos.map((si, index) => (
                      <div key={index} className={styles.serverInfoItem}>
                        <strong>Target: {si.target}</strong>
                        <ul>
                          {Object.entries(si.info).map(([key, value]) => (
                            <li key={key}>
                              <em>
                                {key
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                                :
                              </em>{" "}
                              {String(value)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </section>
                )}

              {Object.keys(results).length > 0 && (
                <FormSection
                  title="Scan Results"
                  description="List of discovered directories (Status codes 200, 403)"
                >
                  <Suspense fallback={null}>
                    <ResultTable results={results} />
                  </Suspense>
                </FormSection>
              )}
            </>
          )}
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  );
}
