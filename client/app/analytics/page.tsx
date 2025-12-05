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
import { supabase } from '@/utils/superbase/client';

/**
 * TYPES
 */
interface ActivityItem {
    id: string;
    item: string;
    action: string;
    quantity: number;
    time: string;
}

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
const InventoryDonutChart = ({ revenue, profit }: { revenue: number, profit: number }) => {
    const cost = Math.max(0, revenue - profit);
    const profitMargin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

    const chartData = [
        { name: 'Cost', value: cost, color: '#ef4444' }, // Red-500
        { name: 'Profit', value: profit, color: '#3b82f6' }, // Blue-500
    ];

    return (
        <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsPie width={400} height={400}>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#374151', fontWeight: 600 }}
                        formatter={(value: number) => `LKR ${value.toLocaleString()}`}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </RechartsPie>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-3xl font-bold text-gray-800">{profitMargin}%</span>
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Profit Margin</span>
            </div>
        </div>
    );
};

// 3. Main Dashboard View
const DashboardView = ({ onNavigate, totalRevenue }: { onNavigate: (page: string) => void, totalRevenue: number }) => {
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
                    <p className="text-xl font-bold text-gray-800">LKR {totalRevenue.toLocaleString()}</p>
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
const AnalyticsView = ({ onBack, revenue, profit, recentActivity }: { onBack: () => void, revenue: number, profit: number, recentActivity: ActivityItem[] }) => {
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
                <InventoryDonutChart revenue={revenue} profit={profit} />
            </div>

            {/* Recent Activity List */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    {recentActivity.length === 0 ? (
                        <div className="text-center py-4 text-gray-400">No recent activity.</div>
                    ) : (
                        recentActivity.map((activity) => (
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
                                        {activity.quantity > 0 ? '+' : ''}{activity.quantity}
                                    </p>
                                    <p className="text-xs text-gray-400">{activity.time}</p>
                                </div>
                            </div>
                        ))
                    )}
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
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                // 1. Fetch Total Revenue
                const { data: salesData, error: salesError } = await supabase
                    .from('sales')
                    .select('total_amount');

                if (salesError) throw salesError;

                const revenue = salesData?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
                setTotalRevenue(revenue);

                // 2. Fetch Data for Profit Calculation
                const { data: saleItems, error: itemsError } = await supabase
                    .from('sale_items')
                    .select('item_id, qty, unit_price');

                if (itemsError) throw itemsError;

                const { data: inwardData, error: inwardError } = await supabase
                    .from('inward_register')
                    .select('item_id, buy_price')
                    .order('date', { ascending: false });

                if (inwardError) throw inwardError;

                const buyPriceMap = new Map();
                inwardData?.forEach(item => {
                    if (!buyPriceMap.has(item.item_id)) {
                        buyPriceMap.set(item.item_id, item.buy_price);
                    }
                });

                let profit = 0;
                saleItems?.forEach(item => {
                    const buyPrice = buyPriceMap.get(item.item_id) || 0;
                    const margin = item.unit_price - buyPrice;
                    profit += margin * item.qty;
                });

                setTotalProfit(profit);

                // 3. Fetch Recent Activity (Inward Register)
                const { data: recentData, error: recentError } = await supabase
                    .from('inward_register')
                    .select(`
                        id,
                        created_at,
                        qty_packs,
                        medicine ( name )
                    `)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (recentError) throw recentError;

                if (recentData) {
                    const mappedActivity: ActivityItem[] = recentData.map((item: any) => ({
                        id: item.id,
                        item: item.medicine?.name || 'Unknown',
                        action: 'Restocked',
                        quantity: item.qty_packs,
                        time: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'
                    }));
                    setRecentActivity(mappedActivity);
                }

            } catch (error) {
                console.error("Error calculating metrics:", error);
            }
        };

        fetchMetrics();
    }, []);

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

                    {/* Title - Analytics */}
                    <div className="flex-1 flex justify-center">
                        <h1 className="text-white text-xl font-bold tracking-wide">Analytics</h1>
                    </div>

                    {/* User Avatar */}
                    <button className="bg-teal-400/50 p-2 rounded-full text-white hover:bg-teal-400 transition-colors">
                        <User className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="relative min-h-screen">
                {currentView === 'dashboard' ? (
                    <DashboardView onNavigate={handleNavigate} totalRevenue={totalRevenue} />
                ) : (
                    <AnalyticsView onBack={() => setCurrentView('dashboard')} revenue={totalRevenue} profit={totalProfit} recentActivity={recentActivity} />
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