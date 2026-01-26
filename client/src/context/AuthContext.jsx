import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // api service now handles the Authorization header automatically
                    const { data } = await api.get('/api/auth/me');
                    setUser(data);
                } catch (error) {
                    console.error("Auth manifestation failure:", error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkUserLoggedIn();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/api/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        setUser(data);
    };

    const register = async (username, email, password) => {
        const { data } = await api.post('/api/auth/register', { username, email, password });
        localStorage.setItem('token', data.token);
        setUser(data);
    };

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const { email, displayName, uid } = result.user;

            const { data } = await api.post('/api/auth/google', {
                email,
                username: displayName || email.split('@')[0],
                googleId: uid
            });

            localStorage.setItem('token', data.token);
            setUser(data);
            return data;
        } catch (error) {
            console.error("Google Auth Error:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
