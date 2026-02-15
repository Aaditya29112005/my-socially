import React, { useState, useEffect } from 'react';
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
    const [history, setHistory] = useState<any[]>([]);
    const navigate = useNavigate();

    const BASE_URL = 'http://localhost:5000';

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await apiClient.get('/images');
            if (res.data.status === 'success') {
                setHistory(res.data.data.images);
            }
        } catch (err) {
            console.error('Failed to fetch history', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        navigate('/login');
    };

    const [filters, setFilters] = useState({
        grayscale: false,
        blur: 0,
        tint: ''
    });

    const generateBanner = async () => {
        setLoading(true);
        try {
            const res = await apiClient.post('/images/generate-greeting',
                {
                    name: user.name || 'Architect',
                    ...filters
                },
                { responseType: 'blob' }
            );

            const url = URL.createObjectURL(res.data);
            setBannerPreview(url);
            fetchHistory(); // Refresh gallery after new generation
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

            <main className="container space-y-12">
                <div className="grid grid-cols-12 gap-8">
                    {/* Left Column: Generation Controls */}
                    <div className="col-span-12 lg:col-span-5 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass p-8 space-y-6"
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles className="text-purple-400" />
                                <h2 className="text-xl">Filter Studio</h2>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filters.grayscale}
                                        onChange={(e) => setFilters(f => ({ ...f, grayscale: e.target.checked }))}
                                        className="w-5 h-5 rounded border-white/10 bg-white/5 text-purple-500 focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-muted group-hover:text-white transition-colors">Grayscale Magic</span>
                                </label>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-xs text-muted">Gaussian Blur</span>
                                        <span className="text-xs text-purple-400 font-mono">{filters.blur}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="20"
                                        value={filters.blur}
                                        onChange={(e) => setFilters(f => ({ ...f, blur: parseInt(e.target.value) }))}
                                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <span className="text-xs text-muted">Atmospheric Tint</span>
                                    <div className="flex gap-2">
                                        {['', '#ff0000', '#00ff00', '#0000ff', '#ff00ff'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setFilters(f => ({ ...f, tint: color }))}
                                                className={`w-8 h-8 rounded-full border-2 transition-all ${filters.tint === color ? 'border-purple-500 scale-110 shadow-lg' : 'border-white/10 hover:border-white/30'}`}
                                                style={{ backgroundColor: color || 'transparent', backgroundImage: !color ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)' : '', backgroundSize: '10px 10px', backgroundPosition: '0 0, 5px 5px' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={generateBanner}
                                disabled={loading}
                                className="btn-primary w-full flex-center gap-2"
                            >
                                <ImageIcon size={20} />
                                {loading ? 'Processing...' : 'Generate with Filters'}
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass p-8 space-y-6"
                        >
                            <div className="flex items-center gap-3">
                                <CreditCard className="text-amber-400" />
                                <h2 className="text-xl">Premium Status</h2>
                            </div>
                            <p className="text-muted text-sm">
                                Unlock advanced features and infinite exports.
                            </p>
                            <button
                                onClick={handleCheckout}
                                className="w-full py-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg hover:bg-amber-500 hover:text-white transition-all font-semibold"
                            >
                                Upgrade Now
                            </button>
                        </motion.div>
                    </div>

                    {/* Right Column: Active Preview */}
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
                                    <h3 className="text-muted">Awake the Creator</h3>
                                    <p className="text-muted text-xs">Run the engine to see the magic.</p>
                                </div>
                            ) : (
                                <div className="w-full p-6 animate-float">
                                    <img src={bannerPreview} alt="Preview" className="w-full rounded-xl shadow-2xl border border-white/10" />
                                    <div className="mt-4 flex justify-end">
                                        <a href={bannerPreview} download="creative.webp" className="text-purple-400 text-sm flex items-center gap-1">
                                            <Download size={14} /> Save WebP
                                        </a>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Gallery Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <ImageIcon className="text-purple-400" />
                        <h2 className="text-2xl font-bold">Creative Gallery</h2>
                    </div>

                    <div className="gallery-grid">
                        {history.map((img, idx) => (
                            <motion.div
                                key={img.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass tilt-card p-3 group overflow-hidden cursor-pointer"
                            >
                                <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                                    <img src={`${BASE_URL}${img.url}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Generated" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex-center">
                                        <a href={`${BASE_URL}${img.url}`} download className="p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                            <Download size={18} />
                                        </a>
                                    </div>
                                </div>
                                <div className="px-2">
                                    <p className="text-xs text-muted mb-1">{new Date(img.createdAt).toLocaleDateString()}</p>
                                    <p className="text-sm font-medium truncate">{img.prompt}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
