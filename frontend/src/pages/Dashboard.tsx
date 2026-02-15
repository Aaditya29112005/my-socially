import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Image as ImageIcon, CreditCard, Sparkles, User, Download } from 'lucide-react';
import apiClient from '../api/client';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
    setIsAuthenticated: (val: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setIsAuthenticated }) => {
    const [user] = useState<any>(JSON.parse(localStorage.getItem('user') || '{}'));
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        navigate('/login');
    };

    const generateBanner = async () => {
        setLoading(true);
        try {
            // Requesting the Sharp-powered backend to generate a personalized banner
            const res = await apiClient.post('/images/generate-greeting',
                { name: user.name || 'Architect' },
                { responseType: 'blob' }
            );

            const url = URL.createObjectURL(res.data);
            setBannerPreview(url);
        } catch (err) {
            console.error('Generation failed', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async () => {
        try {
            const res = await apiClient.post('/payments/checkout');
            if (res.data.url) {
                window.location.href = res.data.url;
            }
        } catch (err) {
            console.error('Checkout failed', err);
        }
    };

    return (
        <div className="min-h-screen bg-hsl(var(--bg-dark)) p-6 max-sm:p-4">
            <nav className="container flex justify-between items-center mb-12">
                <h1 className="gradient-text text-2xl">My Socially</h1>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-muted">
                        <User size={18} />
                        <span className="max-sm:hidden">{user.name}</span>
                    </div>
                    <button onClick={handleLogout} className="text-muted hover:text-white transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>
            </nav>

            <main className="container grid grid-cols-12 gap-8">
                {/* Left Column: Generation Controls */}
                <div className="col-span-12 lg:col-span-5 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass p-8 space-y-6"
                    >
                        <div className="flex items-center gap-3">
                            <Sparkles className="text-purple-400" />
                            <h2 className="text-xl">Creative Engine</h2>
                        </div>
                        <p className="text-muted text-sm">
                            Generate a high-performance, personalized greeting banner optimized for production.
                        </p>
                        <button
                            onClick={generateBanner}
                            disabled={loading}
                            className="btn-primary w-full flex-center gap-2"
                        >
                            <ImageIcon size={20} />
                            {loading ? 'Generating brilliance...' : 'Generate Personalized Banner'}
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass p-8 space-y-6 border-amber-500/20"
                    >
                        <div className="flex items-center gap-3">
                            <CreditCard className="text-amber-400" />
                            <h2 className="text-xl">Premium Credits</h2>
                        </div>
                        <p className="text-muted text-sm">
                            You're currently on the free tier. Upgrade for unlimited high-res exports and custom filters.
                        </p>
                        <button
                            onClick={handleCheckout}
                            className="w-full py-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg hover:bg-amber-500 hover:text-white transition-all font-semibold"
                        >
                            Upgrade to Premium for $10
                        </button>
                    </motion.div>
                </div>

                {/* Right Column: Preview & Results */}
                <div className="col-span-12 lg:col-span-7">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass min-h-[400px] flex-center overflow-hidden relative"
                    >
                        {!bannerPreview ? (
                            <div className="text-center p-12 space-y-4">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex-center mx-auto">
                                    <ImageIcon className="text-muted" size={32} />
                                </div>
                                <h3 className="text-muted font-medium">No Preview Yet</h3>
                                <p className="text-muted text-sm max-w-xs mx-auto">
                                    Your dynamic creation will appear here once generated.
                                </p>
                            </div>
                        ) : (
                            <div className="w-full p-6 animate-float">
                                <img
                                    src={bannerPreview}
                                    alt="Personalized Banner"
                                    className="w-full rounded-xl shadow-2xl border border-white/10"
                                />
                                <div className="mt-6 flex justify-end gap-3">
                                    <a
                                        href={bannerPreview}
                                        download="banner.webp"
                                        className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                                    >
                                        <Download size={16} /> Download WebP
                                    </a>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
