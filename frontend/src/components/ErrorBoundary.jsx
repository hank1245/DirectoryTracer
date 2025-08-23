import React from "react";
import styles from "../styles/App.module.css";
import Button from "./shared/Button";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Optionally log to a service
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("App error:", error, info);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) this.props.onRetry();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container} role="alert">
          <main>
            <div className={styles.errorMessage}>
              <h2>Something went wrong.</h2>
              <p>Please try again. If the problem persists, reload the page.</p>
              <Button onClick={this.handleRetry}>Retry</Button>
            </div>
          </main>
        </div>
      );
    }
    return this.props.children;
  }
}
