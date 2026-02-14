import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiLogIn, FiZap } from 'react-icons/fi';
import AnimatedButton from '../components/common/AnimatedButton';
import GlassCard from '../components/common/GlassCard';

const FloatingParticle = ({ delay }) => (
    <motion.div
        className="absolute w-2 h-2 bg-white rounded-full opacity-20"
        initial={{ y: '100vh', x: Math.random() * window.innerWidth }}
        animate={{
            y: '-10vh',
            x: Math.random() * window.innerWidth,
        }}
        transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay,
            ease: 'linear',
        }}
    />
);

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
            toast.success('🎉 Welcome back!', {
                position: 'top-right',
                autoClose: 2000,
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed', {
                position: 'top-right',
            });
        } finally {
            setLoading(false);
        }
    };

    // Stagger animation for form elements
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-700">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
                </div>
            </div>

            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
                <FloatingParticle key={i} delay={i * 0.5} />
            ))}

            {/* Login card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
                className="relative z-10 w-full max-w-md"
            >
                <GlassCard className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
                    {/* Header */}
                    <motion.div
                        className="text-center mb-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={itemVariants} className="mb-4 flex justify-center">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/50">
                                <FiZap className="w-8 h-8 text-white" />
                            </div>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-4xl font-bold text-white mb-2 tracking-tight"
                        >
                            PCB Inventory
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-purple-100">
                            INVICTUS Hackathon - Electrolyte Solutions
                        </motion.p>
                    </motion.div>

                    {/* Form */}
                    <motion.form
                        onSubmit={handleSubmit}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-5"
                    >
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-200" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all backdrop-blur-sm"
                                    placeholder="admin@electrolyte.com"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-200" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all backdrop-blur-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <AnimatedButton
                                type="submit"
                                loading={loading}
                                icon={<FiLogIn />}
                                className="w-full py-3 text-lg bg-white text-purple-700 hover:shadow-xl"
                                variant="secondary"
                            >
                                Sign In
                            </AnimatedButton>
                        </motion.div>
                    </motion.form>

                    {/* Demo credentials */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-6 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl"
                    >
                        <p className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                            <FiZap className="w-4 h-4" />
                            Demo Credentials
                        </p>
                        <p className="text-xs text-purple-100">Email: admin@electrolyte.com</p>
                        <p className="text-xs text-purple-100">Password: admin123</p>
                    </motion.div>

                    {/* Signup link */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="mt-4 text-center"
                    >
                        <p className="text-sm text-purple-100">
                            Don't have an account?{' '}
                            <a
                                href="/signup"
                                className="font-semibold text-white hover:text-purple-200 transition-colors underline"
                            >
                                Sign up
                            </a>
                        </p>
                    </motion.div>

                    {/* Footer text */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-6 text-center text-xs text-purple-200"
                    >
                        Secure authentication powered by JWT
                    </motion.p>
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default Login;
