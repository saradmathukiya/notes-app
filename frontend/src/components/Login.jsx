import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const result = await login(email, password);
            if (result.success) {
                navigate('/notes');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to log in');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[calc(100vh-2rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => navigate('/')}
                                className="inline-flex items-center text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back
                            </button>
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                                Sign in
                            </h2>
                            <div className="w-24"></div> {/* Spacer for alignment */}
                        </div>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                                    <div className="text-sm text-red-700">{error}</div>
                                </div>
                            )}
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Signing in...' : 'Sign in'}
                                </button>
                            </div>

                            <div className="text-sm text-center">
                                <Link
                                    to="/register"
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Don't have an account? Register
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login; 