import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiUser, FiUserPlus, FiZap, FiShield, FiCheckCircle, FiActivity } from 'react-icons/fi';
import AnimatedButton from '../components/common/AnimatedButton';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'USER'
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await register(
                formData.username,
                formData.email,
                formData.password,
                formData.role
            );
            toast.success('🎉 Account created successfully! Welcome to the team.', {
                position: 'top-right',
                autoClose: 2000,
            });
            setTimeout(() => navigate('/'), 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-950 overflow-hidden font-inter">
            {/* Left Side - Register Hero */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-center p-20 overflow-hidden">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
                        <FiUserPlus className="text-blue-400" />
                        <span className="text-blue-300 text-sm font-semibold uppercase tracking-wider">Join the Network</span>
                    </div>

                    <h1 className="text-6xl font-black text-white leading-tight mb-6">
                        Scale Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                            Production Power
                        </span>
                    </h1>

                    <p className="text-slate-400 text-xl max-w-lg mb-12 leading-relaxed">
                        Join hundreds of engineers optimizing their PCB manufacturing workflows with our advanced toolkit.
                    </p>

                    <div className="space-y-6">
                        {[
                            { icon: FiCheckCircle, text: 'Unlimited Component Tracking' },
                            { icon: FiActivity, text: 'Real-time Production Analytics' },
                            { icon: FiZap, text: 'Automated Procurement Triggers' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (i * 0.1) }}
                                className="flex items-center gap-4 text-slate-300"
                            >
                                <div className="text-blue-400">
                                    <item.icon size={20} />
                                </div>
                                <span className="font-medium">{item.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative overflow-y-auto custom-scrollbar">
                <div className="lg:hidden absolute inset-0 bg-mesh-dark opacity-40 -z-10"></div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md py-12"
                >
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-white mb-3">Create Account</h2>
                        <p className="text-slate-400">Start your journey with Electrolyte Solutions.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                    <FiUser />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    required
                                    className="input-premium pl-12"
                                    placeholder="yourname"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                    <FiMail />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="input-premium pl-12"
                                    placeholder="you@company.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                        <FiLock />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        className="input-premium pl-12"
                                        placeholder="••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Confirm</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                        <FiLock />
                                    </div>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        required
                                        className="input-premium pl-12"
                                        placeholder="••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Account Role</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors z-10">
                                    <FiShield />
                                </div>
                                <select
                                    name="role"
                                    className="input-premium pl-12 appearance-none cursor-pointer"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="USER" className="bg-slate-900">Standard User</option>
                                    <option value="ADMIN" className="bg-slate-900">Administrator</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <AnimatedButton
                            type="submit"
                            loading={loading}
                            className="w-full py-4 text-lg font-bold gradient-primary shadow-glow-purple mt-4"
                        >
                            Create Account
                        </AnimatedButton>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            Already have an account? {' '}
                            <Link to="/login" className="text-white font-bold hover:underline">Sign in instead</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Signup;
