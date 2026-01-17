import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(username, email, password);
            navigate('/');
        } catch (err) {
            // Handle Zod Error Array or Error Message
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0].message : (msg || 'Registration failed'));
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 bg-surface p-8 rounded-xl border border-gray-700">
            <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>
            {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-center text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-background border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
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
                <button type="submit" className="w-full bg-secondary hover:bg-purple-600 text-white font-bold py-2 rounded-lg transition mt-4">Sign Up</button>
            </form>
            <p className="mt-4 text-center text-gray-400 text-sm">
                Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
            </p>
        </div>
    );
};

export default Register;
