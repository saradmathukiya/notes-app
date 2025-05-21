import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { Button } from "./ui/button";
import { validateEmail, validatePassword, calculatePasswordStrength } from '../utils/validation';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setPasswordStrength(calculatePasswordStrength(newPassword));
    };

    const getPasswordStrengthColor = (strength) => {
        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
        return colors[Math.min(strength, colors.length - 1)];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate email
        if (!validateEmail(email)) {
            return setError('Please enter a valid email address');
        }

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return setError(passwordValidation.errors[0]);
        }

        // Validate password match
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        try {
            setLoading(true);
            const result = await register(email, password);
            if (result.success) {
                navigate('/notes');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to create an account');
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
                                Register
                            </h2>
                            <div className="w-24"></div>
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
                                        autoComplete="new-password"
                                        required
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={handlePasswordChange}
                                    />
                                    {/* Password strength indicator */}
                                    <div className="mt-2">
                                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                                                style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Password strength: {passwordStrength}/5
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                                        Confirm Password
                                    </label>
                                    <input
                                        id="confirm-password"
                                        name="confirm-password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading ? 'Creating account...' : 'Create account'}
                                </Button>
                            </div>

                            <div className="text-sm text-center">
                                <Link
                                    to="/login"
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Already have an account? Sign in
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register; 