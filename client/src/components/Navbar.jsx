import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-surface border-b border-gray-700 py-4">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-primary">PopcornIQ</Link>
                <div className="flex items-center space-x-6">
                    <Link to="/" className="hover:text-primary transition">Home</Link>
                    {user ? (
                        <>
                            <span className="text-gray-400">Hello, {user.username}</span>
                            <button onClick={handleLogout} className="text-accent hover:text-red-400 transition">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-primary transition">Login</Link>
                            <Link to="/register" className="btn-primary">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
