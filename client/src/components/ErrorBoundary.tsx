import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">An unexpected error occurred. Please try again.</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
