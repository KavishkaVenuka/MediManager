"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Search,
    Filter,
    MoreVertical,
    AlertCircle,
    ShoppingCart,
    Plus,
    Minus,
    X,
    Pill,
    Droplets,
    Syringe,
    Package,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { supabase } from '@/utils/superbase/client';

/**
 * TYPES
 */
type StockStatus = 'critical' | 'warning' | 'ok';

interface Medicine {
    id: string;
    name: string;
    category: string;
    currentStock: number;
    minStock: number;
    maxStock: number;
    unit: string;
    lastOrdered: string;
    price: number;
}

/**
 * HELPER FUNCTIONS
 */
const getStockStatus = (current: number, min: number): StockStatus => {
    if (current <= min * 0.25) return 'critical'; // Less than 25% of min stock
    if (current <= min) return 'warning';
    return 'ok';
};

const getCategoryIcon = (category: string) => {
    if (category.includes('Syrup') || category.includes('Pediatric')) return <Droplets size={18} />;
    if (category.includes('Diabetes')) return <Syringe size={18} />;
    return <Pill size={18} />;
};

/**
 * COMPONENTS
 */

// 1. Stock Level Progress Bar
const StockProgressBar = ({ current, max, status }: { current: number, max: number, status: StockStatus }) => {
    const percentage = Math.min(100, (current / max) * 100);

    const colors = {
        critical: 'bg-red-500',
        warning: 'bg-amber-500',
        ok: 'bg-emerald-500'
    };

    return (
        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-500 ${colors[status]}`}
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};

// 2. Filter Chip
const FilterChip = ({ label, active, onClick, count }: { label: string, active: boolean, onClick: () => void, count?: number }) => (
    <button
        onClick={onClick}
        className={`
      px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
      ${active
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}
    `}
    >
        {label}
        {count !== undefined && (
            <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] ${active ? 'bg-white/20' : 'bg-gray-100'}`}>
                {count}
            </span>
        )}
    </button>
);

// 3. Main Page Component
export default function LowStock() {
    const router = useRouter();
    const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');
    const [search, setSearch] = useState('');
    const [selectedItem, setSelectedItem] = useState<Medicine | null>(null); // For "Reorder" modal
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMedicines = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('main_store')
                    .select(`
                        item_id,
                        pack_qty,
                        buy_price,
                        last_updated,
                        medicine ( name, weight )
                    `);

                if (error) throw error;

                if (data) {
                    const mappedData: Medicine[] = data.map((item: any) => ({
                        id: item.item_id,
                        name: item.medicine?.name || 'Unknown',
                        category: 'General', // Default as schema doesn't have category
                        currentStock: item.pack_qty,
                        minStock: 20, // Default threshold
                        maxStock: 100, // Default max
                        unit: 'packs',
                        lastOrdered: item.last_updated ? new Date(item.last_updated).toLocaleDateString() : 'N/A',
                        price: item.buy_price
                    }));
                    setMedicines(mappedData);
                }
            } catch (error) {
                console.error("Error fetching low stock data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMedicines();
    }, []);

    // Filter Logic
    const filteredData = medicines.filter(item => {
        const status = getStockStatus(item.currentStock, item.minStock);
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all'
            ? status !== 'ok' // Show all low stocks (warning + critical)
            : status === filter;

        return matchesSearch && matchesFilter;
    });

    const criticalCount = medicines.filter(i => getStockStatus(i.currentStock, i.minStock) === 'critical').length;
    const allLowStockCount = medicines.filter(i => getStockStatus(i.currentStock, i.minStock) !== 'ok').length;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-24">

            {/* --- HEADER SECTION --- */}
            <div className="bg-teal-500 pb-8 rounded-b-[2.5rem] shadow-lg relative z-10">
                {/* Top Bar */}
                <div className="px-6 pt-6 pb-6 flex items-center justify-between text-white">
                    <button className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-lg font-semibold tracking-wide">Low Stocks</h1>
                    <button className="p-2 -mr-2 hover:bg-white/10 rounded-full transition-colors">
                        <Filter size={22} />
                    </button>
                </div>

                {/* Search Bar (Floating effect) */}
                <div className="px-6 relative z-20 translate-y-4">
                    <div className="bg-white rounded-2xl shadow-lg shadow-teal-900/5 p-2 flex items-center">
                        <Search className="ml-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search medicines..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full p-2 outline-none text-gray-700 placeholder-gray-400"
                        />
                    </div>
                </div>
            </div>

            {/* --- FILTER TABS --- */}
            <div className="mt-8 px-6 overflow-x-auto no-scrollbar flex gap-3 pb-2">
                <FilterChip
                    label="All Alerts"
                    active={filter === 'all'}
                    onClick={() => setFilter('all')}
                    count={allLowStockCount}
                />
                <FilterChip
                    label="Critical"
                    active={filter === 'critical'}
                    onClick={() => setFilter('critical')}
                    count={criticalCount}
                />
                <FilterChip
                    label="Warning"
                    active={filter === 'warning'}
                    onClick={() => setFilter('warning')}
                />
            </div>

            {/* --- LIST CONTENT --- */}
            <div className="px-6 mt-4 space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading stock data...</div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-300" />
                        <p>No stock alerts found.</p>
                    </div>
                ) : (
                    filteredData.map((item) => {
                        const status = getStockStatus(item.currentStock, item.minStock);
                        const isCritical = status === 'critical';

                        return (
                            <div key={item.id} className="bg-white rounded-3xl p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-50 relative overflow-hidden group">
                                {/* Critical Indicator Strip */}
                                {isCritical && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-400" />
                                )}

                                <div className="flex items-start justify-between mb-3 pl-2">
                                    <div className="flex items-center gap-3">
                                        {/* Icon Container */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCritical ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                                            {getCategoryIcon(item.category)}
                                        </div>

                                        {/* Text Info */}
                                        <div>
                                            <h3 className="font-bold text-gray-800 leading-tight">{item.name}</h3>
                                            <p className="text-xs text-gray-400 font-medium">{item.category}</p>
                                        </div>
                                    </div>

                                    {/* Stock Badge */}
                                    <div className={`text-right px-2.5 py-1 rounded-lg ${isCritical ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                        <p className="text-sm font-bold">{item.currentStock} <span className="text-[10px] uppercase font-normal">{item.unit}</span></p>
                                    </div>
                                </div>

                                {/* Progress & Stats */}
                                <div className="pl-2">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Min: {item.minStock}</span>
                                        <span className={isCritical ? 'text-red-500 font-medium' : 'text-amber-500 font-medium'}>
                                            {isCritical ? 'Critical Level' : 'Low Stock'}
                                        </span>
                                    </div>
                                    <StockProgressBar current={item.currentStock} max={item.maxStock} status={status} />
                                </div>

                                {/* Actions Row */}
                                <div className="mt-4 pl-2 flex items-center justify-between border-t border-gray-50 pt-3">
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock size={12} /> Last: {item.lastOrdered}
                                    </span>
                                    <button
                                        onClick={() => router.push('/buy-stock')}
                                        className="bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-xl active:scale-95 transition-transform flex items-center gap-2"
                                    >
                                        <ShoppingCart size={14} />
                                        Inventry
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* --- SIMPLE RESTOCK MODAL (Overlay) --- */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full sm:w-96 rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Restock Order</h2>
                                <p className="text-sm text-gray-500">How many units to order?</p>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100">
                                <X size={20} className="text-gray-400" /> {/* Close Icon logic */}
                            </button>
                        </div>

                        <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 mb-6">
                            <div className="text-left">
                                <p className="font-bold text-gray-800">{selectedItem.name}</p>
                                <p className="text-xs text-gray-500">Current: {selectedItem.currentStock} {selectedItem.unit}</p>
                            </div>
                            <div className="flex items-center gap-3 bg-white shadow-sm rounded-xl px-2 py-1">
                                <button className="p-2 hover:text-teal-600 active:scale-90 transition-transform"><Minus size={18} /></button>
                                <span className="font-bold w-8 text-center">50</span>
                                <button className="p-2 hover:text-teal-600 active:scale-90 transition-transform"><Plus size={18} /></button>
                            </div>
                        </div>

                        <button
                            className="w-full bg-teal-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            onClick={() => {
                                // Add logic here
                                setSelectedItem(null);
                            }}
                        >
                            Confirm Order
                        </button>
                    </div>
                </div>
            )}

            {/* --- GLOBAL STYLES --- */}
            <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    );
}