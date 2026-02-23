import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiLogIn, FiZap, FiCheckCircle, FiShield, FiArrowRight } from 'react-icons/fi';
import AnimatedButton from '../components/common/AnimatedButton';
import GlassCard from '../components/common/GlassCard';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            toast.success('🎉 Welcome back, Commander!', {
                position: 'top-right',
                autoClose: 2000,
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed', {
                theme: 'colored'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-950 overflow-hidden font-inter">
            {/* Left Side - Creative Hero */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-center p-20 overflow-hidden">
                {/* Animated Background blobs */}
                <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
                        <FiZap className="text-purple-400" />
                        <span className="text-purple-300 text-sm font-semibold uppercase tracking-wider">Enterprise Inventory v2.0</span>
                    </div>

                    <h1 className="text-6xl font-black text-white leading-tight mb-6">
                        Manage Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
                            PCB Ecosystem
                        </span>
                    </h1>

                    <p className="text-slate-400 text-xl max-w-lg mb-12 leading-relaxed">
                        Streamline production, track components, and optimize procurement with our AI-driven management suite.
                    </p>

                    <div className="grid grid-cols-2 gap-8">
                        {[
                            { icon: FiShield, title: 'Secure', desc: 'JWT & Role-based' },
                            { icon: FiCheckCircle, title: 'Accurate', desc: 'Real-time tracking' },
                        ].map((feat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + (i * 0.1) }}
                                className="flex flex-col gap-3"
                            >
                                <div className="p-3 w-fit bg-slate-900 border border-slate-800 rounded-xl text-purple-400">
                                    <feat.icon size={24} />
                                </div>
                                <h3 className="text-white font-bold">{feat.title}</h3>
                                <p className="text-slate-500 text-sm">{feat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Decorative mesh */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative">
                {/* Mobile/Tablet Background elements */}
                <div className="lg:hidden absolute inset-0 bg-mesh-dark opacity-40 -z-10"></div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-12 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-white mb-3">Sign In</h2>
                        <p className="text-slate-400">Welcome back! Please enter your details.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-400 transition-colors">
                                    <FiMail />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="input-premium pl-12"
                                    placeholder="admin@electrolyte.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-sm font-medium text-slate-300">Password</label>
                                <a href="#" className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors">Forgot password?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-400 transition-colors">
                                    <FiLock />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="input-premium pl-12"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-1">
                            <input type="checkbox" id="remember" className="rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-900" />
                            <label htmlFor="remember" className="text-sm text-slate-400 select-none">Remember for 30 days</label>
                        </div>

                        <AnimatedButton
                            type="submit"
                            loading={loading}
                            className="w-full py-4 text-lg font-bold gradient-purple shadow-glow-purple"
                        >
                            Sign In
                        </AnimatedButton>
                    </form>

                    {/* Social/Demo footer */}
                    <div className="mt-8 pt-8 border-t border-slate-800 space-y-6">
                        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <FiZap className="text-yellow-500" /> Demo Credentials
                            </h4>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-slate-300">admin@electrolyte.com</p>
                                    <p className="text-xs text-slate-500">Pass: admin123</p>
                                </div>
                                <button
                                    onClick={() => { setEmail('admin@electrolyte.com'); setPassword('admin123'); }}
                                    className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                                >
                                    Auto-fill <FiArrowRight />
                                </button>
                            </div>
                        </div>

                        <p className="text-center text-slate-500 text-sm">
                            Don't have an account? {' '}
                            <a href="/signup" className="text-white font-bold hover:underline">Get started for free</a>
                        </p>
                    </div>
                </motion.div>

                {/* Footer copyright */}
                <div className="absolute bottom-6 text-slate-600 text-xs">
                    © 2026 Electrolyte Solutions. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default Login;
