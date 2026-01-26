import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Critical System Failure:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-20 h-20 border-2 border-accent rounded-full animate-pulse mb-8 flex items-center justify-center">
                        <span className="text-accent text-4xl">!</span>
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tight mb-4">Something went wrong.</h1>
                    <p className="text-muted max-w-md mb-12 text-sm font-medium">
                        We encountered an unexpected error. Please try refreshing the page to continue.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-12 py-5 bg-white text-black font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all rounded-sm"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
