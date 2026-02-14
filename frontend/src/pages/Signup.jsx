import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiUser, FiUserPlus, FiZap, FiShield } from 'react-icons/fi';
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
            await authService.register(
                formData.username,
                formData.email,
                formData.password,
                formData.role
            );
            toast.success('🎉 Account created successfully! Please login.');
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

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

            {/* Signup card */}
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
                                <FiUserPlus className="w-8 h-8 text-white" />
                            </div>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-4xl font-bold text-white mb-2 tracking-tight"
                        >
                            Create Account
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-purple-100">
                            Join the PCB Inventory System
                        </motion.p>
                    </motion.div>

                    {/* Form */}
                    <motion.form
                        onSubmit={handleSubmit}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                    >
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-200" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all backdrop-blur-sm"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-200" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all backdrop-blur-sm"
                                    placeholder="your.email@company.com"
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
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all backdrop-blur-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-200" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all backdrop-blur-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Account Type
                            </label>
                            <div className="relative">
                                <FiShield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-200 z-10" />
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all backdrop-blur-sm appearance-none cursor-pointer"
                                >
                                    <option value="USER" className="bg-purple-900">User (Standard Access)</option>
                                    <option value="ADMIN" className="bg-purple-900">Admin (Full Control)</option>
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-purple-200">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>
                            <p className="text-xs text-purple-200 mt-1 ml-1">
                                {formData.role === 'ADMIN' ? '⚠️ Admin has full edit/delete permissions' : 'ℹ️ Standard user can view and create entries'}
                            </p>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <AnimatedButton
                                type="submit"
                                loading={loading}
                                icon={<FiUserPlus />}
                                className="w-full py-3 text-lg bg-white text-purple-700 hover:shadow-xl"
                                variant="secondary"
                            >
                                Create Account
                            </AnimatedButton>
                        </motion.div>
                    </motion.form>

                    {/* Login link */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-6 text-center"
                    >
                        <p className="text-sm text-purple-100">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-semibold text-white hover:text-purple-200 transition-colors underline"
                            >
                                Sign in
                            </Link>
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

export default Signup;
