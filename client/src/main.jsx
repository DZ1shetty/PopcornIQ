import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { ToastProvider } from './components/Toast';

import { ThemeProvider } from './context/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <WatchlistProvider>
                        <ToastProvider>
                            <App />
                        </ToastProvider>
                    </WatchlistProvider>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    </React.StrictMode>,
);
