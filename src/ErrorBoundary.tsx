import React, { Component, ErrorInfo } from 'react';

// Global error handler for JavaScript errors
const setupGlobalErrorHandler = (setErrorMessage: React.Dispatch<React.SetStateAction<string>>) => {
  window.onerror = (message, source, lineno, colno, error) => {
    // Set the error message for uncaught errors
    setErrorMessage(`JavaScript Error: ${message} at ${source}:${lineno}:${colno}`);
    console.error("JavaScript error caught:", message, error);
    return true; // Prevent the default handler
  };
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  // Run when a React error is caught in the component tree
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  // Component lifecycle method for logging the error
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React error caught:", error, errorInfo);
  }

  // Initialize global JavaScript error handler
  componentDidMount() {
    setupGlobalErrorHandler((message) => {
      this.setState({ hasError: true, errorMessage: message });
    });
  }

  render() {
    // If there's an error, show the fallback UI with the error message
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h1></h1>
          <p>{this.state.errorMessage}</p>
        </div>
      );
    }

    // Otherwise, render the children (the app content)
    return this.props.children;
  }
}

export default ErrorBoundary;
