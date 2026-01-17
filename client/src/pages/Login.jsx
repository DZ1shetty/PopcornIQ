import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 bg-surface p-8 rounded-xl border border-gray-700">
            <h2 className="text-3xl font-bold text-center mb-6">Welcome Back</h2>
            {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-center text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <input
                        type="email"
                        required
                        className="w-full bg-background border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                    <input
                        type="password"
                        required
                        className="w-full bg-background border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-indigo-600 text-white font-bold py-2 rounded-lg transition mt-4">Login</button>
            </form>
            <p className="mt-4 text-center text-gray-400 text-sm">
                Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link>
            </p>
        </div>
    );
};

export default Login;
