"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    User,
    Home,
    Plus,
    Package,
    ShoppingCart,
    PieChart,
    ClipboardList,
    Gauge,
    TrendingUp,
    ChevronLeft,
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import {
    PieChart as RechartsPie,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';

/**
 * MOCK DATA
 */
const CHART_DATA = [
    { name: 'Cost', value: 200, color: '#ef4444' }, // Red-500
    { name: 'Profit', value: 80, color: '#3b82f6' }, // Blue-500
];

const RECENT_ACTIVITY = [
    { id: 1, item: 'Acetaminophen', action: 'Restocked', quantity: +50, time: '2h ago' },
    { id: 2, item: 'Metformin', action: 'Sold', quantity: -12, time: '4h ago' },
    { id: 3, item: 'Salbutamol', action: 'Low Stock', quantity: 10, time: '5h ago' },
];

/**
 * COMPONENTS
 */

// 1. Background Pattern Component (Geometric Network)
const BackgroundPattern = () => (
    <div className="absolute inset-0 z-0 opacity-10 pointer-events-none overflow-hidden">
        <svg width="100%" height="100%">
            <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#0d9488" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {/* Decorative Lines simulating the network graph in screenshot */}
            <path d="M50 100 L200 300 L350 150" stroke="#0d9488" strokeWidth="0.5" fill="none" />
            <path d="M300 400 L150 200 L50 500" stroke="#0d9488" strokeWidth="0.5" fill="none" />
            <circle cx="200" cy="300" r="3" fill="#0d9488" />
            <circle cx="150" cy="200" r="3" fill="#0d9488" />
        </svg>
    </div>
);

// 2. Custom Donut Chart Component
const InventoryDonutChart = () => {
    return (
        <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsPie width={400} height={400}>
                    <Pie
                        data={CHART_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {CHART_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#374151', fontWeight: 600 }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </RechartsPie>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-3xl font-bold text-gray-800">12%</span>
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Profit Margine</span>
            </div>
        </div>
    );
};

// 3. Main Dashboard View
const DashboardView = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
    return (
        <div className="p-6 pt-32 space-y-6 relative z-10 pb-24">
            {/* Grid Menu */}
            <div className="grid grid-cols-2 gap-4">
                {/* Analytics Card */}
                <button
                    onClick={() => onNavigate('analytics')}
                    className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-95 flex flex-col items-center justify-center gap-3 aspect-square group"
                >
                    <div className="p-3 bg-teal-50 rounded-full group-hover:bg-teal-100 transition-colors">
                        <PieChart className="w-8 h-8 text-teal-600" />
                    </div>
                    <span className="font-semibold text-gray-700">Analytics</span>
                </button>

                {/* Inventory Card */}
                <button className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-95 flex flex-col items-center justify-center gap-3 aspect-square group">
                    <div className="p-3 bg-teal-50 rounded-full group-hover:bg-teal-100 transition-colors">
                        <ClipboardList className="w-8 h-8 text-teal-600" />
                    </div>
                    <span className="font-semibold text-gray-700">Inventory</span>
                </button>

                {/* Low Stocks Card */}
                <button className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-95 flex flex-col items-center justify-center gap-3 aspect-square group">
                    <div className="p-3 bg-teal-50 rounded-full group-hover:bg-teal-100 transition-colors">
                        <Gauge className="w-8 h-8 text-teal-600" />
                    </div>
                    <span className="font-semibold text-teal-500">Low stocks</span>
                </button>

                {/* Reports Card */}
                <button className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-95 flex flex-col items-center justify-center gap-3 aspect-square group">
                    <div className="p-3 bg-teal-50 rounded-full group-hover:bg-teal-100 transition-colors">
                        <TrendingUp className="w-8 h-8 text-teal-600" />
                    </div>
                    <span className="font-semibold text-gray-700">Reports</span>
                </button>
            </div>

            {/* Quick Stats Row */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-400 font-medium uppercase">Total Revenue</p>
                    <p className="text-xl font-bold text-gray-800">$45,231.89</p>
                </div>
                <div className="flex items-center text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                    <ArrowUpRight size={16} />
                    <span className="text-sm font-bold ml-1">+12%</span>
                </div>
            </div>
        </div>
    );
};

// 4. Analytics Detail View
const AnalyticsView = ({ onBack }: { onBack: () => void }) => {
    return (
        <div className="p-6 pt-32 space-y-6 relative z-10 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header for View */}
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors text-white/90"
                    style={{ marginTop: '-4rem' }} // Pull up into the teal header area
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <span className="text-white font-semibold text-lg" style={{ marginTop: '-4rem' }}>Analytics</span>
                <button
                    className="p-2 -mr-2 hover:bg-black/5 rounded-full transition-colors text-white/90"
                    style={{ marginTop: '-4rem' }}
                >
                    <MoreHorizontal className="w-6 h-6" />
                </button>
            </div>

            {/* Chart Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Distribution of Profit</h3>
                <InventoryDonutChart />
            </div>

            {/* Recent Activity List */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    {RECENT_ACTIVITY.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${activity.quantity > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                                    {activity.quantity > 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">{activity.item}</p>
                                    <p className="text-xs text-gray-400">{activity.action}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold text-sm ${activity.quantity > 0 ? 'text-emerald-600' : 'text-gray-800'}`}>
                                    {activity.quantity > 0 ? '+' : ''}{activity.quantity === 0 ? '⚠' : activity.quantity}
                                </p>
                                <p className="text-xs text-gray-400">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// 5. Main App Component
export default function AnalyticsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('home');
    const [currentView, setCurrentView] = useState('analytics'); // 'dashboard' or 'analytics'

    const handleNavigate = (view: string) => {
        setCurrentView(view);
        // When manually navigating, we might want to update the tab to match context, 
        // but for now we keep 'home' active unless it's a completely different section.
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 relative overflow-x-hidden">
            {/* Background Pattern */}
            <BackgroundPattern />

            {/* Top Header - Curved */}
            <header className="fixed top-0 left-0 right-0 z-20">
                <div className="bg-teal-500 h-28 relative rounded-b-[2.5rem] shadow-lg flex items-center justify-between px-6 pt-6">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="mr-3 p-2 bg-teal-400/50 rounded-full text-white hover:bg-teal-400 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Search Bar - Only show on dashboard for this demo */}
                    {currentView === 'dashboard' ? (
                        <div className="flex-1 mr-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full bg-white rounded-full py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-teal-300 shadow-sm transition-shadow"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1" /> /* Spacer for alignment */
                    )}

                    {/* User Avatar */}
                    <button className="bg-teal-400/50 p-2 rounded-full text-white hover:bg-teal-400 transition-colors">
                        <User className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="relative min-h-screen">
                {currentView === 'dashboard' ? (
                    <DashboardView onNavigate={handleNavigate} />
                ) : (
                    <AnalyticsView onBack={() => setCurrentView('dashboard')} />
                )}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 rounded-t-[2rem] shadow-[0_-5px_20px_rgba(0,0,0,0.03)] px-8 py-4 z-30 flex items-center justify-between safe-area-bottom">

                {/* Home Button (Active Style) */}
                <button
                    onClick={() => { setActiveTab('home'); setCurrentView('dashboard'); }}
                    className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? '-translate-y-2' : ''}`}
                >
                    <div className={`${activeTab === 'home' ? 'bg-teal-500 shadow-lg shadow-teal-500/30 text-white' : 'bg-transparent text-gray-400'} p-3 rounded-xl transition-all`}>
                        <Home className="w-6 h-6" />
                    </div>
                </button>

                {/* Add Button */}
                <button
                    onClick={() => setActiveTab('add')}
                    className={`flex flex-col items-center gap-1 transition-all`}
                >
                    <div className={`${activeTab === 'add' ? 'text-teal-500' : 'text-gray-400'} p-2`}>
                        <Plus className="w-7 h-7" />
                    </div>
                </button>

                {/* Inventory/Box Button */}
                <button
                    onClick={() => setActiveTab('box')}
                    className={`flex flex-col items-center gap-1 transition-all`}
                >
                    <div className={`${activeTab === 'box' ? 'text-teal-500' : 'text-gray-400'} p-2`}>
                        <Package className="w-6 h-6" />
                    </div>
                </button>

                {/* Cart Button */}
                <button
                    onClick={() => setActiveTab('cart')}
                    className={`flex flex-col items-center gap-1 transition-all`}
                >
                    <div className={`${activeTab === 'cart' ? 'text-teal-500' : 'text-gray-400'} p-2`}>
                        <ShoppingCart className="w-6 h-6" />
                    </div>
                </button>
            </nav>

            <style>{`
        .safe-area-bottom {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }
      `}</style>
        </div>
    );
}