'use client';

import React, { useState } from 'react';
import { 
  Store, 
  Search, 
  Filter, 
  RefreshCw, 
  Trash2, 
  Plus, 
  DollarSign 
} from 'lucide-react';

// --- 1. Data Shape (Matches your table columns) ---
interface ShelfItem {
  id: string;
  name: string;
  packSize: number; // e.g., (100)
  price: number;
  qty: number;
}

// --- Dummy Data ---
const initialData: ShelfItem[] = [
  { id: '1', name: 'Asprin 75mg', packSize: 100, price: 1250.00, qty: 1 },
  { id: '2', name: 'Panadol 500mg', packSize: 100, price: 2500.00, qty: 1 },
  { id: '3', name: 'Amoxicillin', packSize: 50, price: 1121.00, qty: 300 },
  { id: '4', name: 'Metformin', packSize: 100, price: 850.00, qty: 5 },
  { id: '5', name: 'Omeprazole', packSize: 100, price: 1500.00, qty: 10 },
];

const PharmacyShelf = () => {
  const [items, setItems] = useState<ShelfItem[]>(initialData);

  // Calculate Total Value dynamically
  const totalValue = items.reduce((acc, item) => acc + (item.price * item.qty), 0);

  // Formatter
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency', currency: 'LKR', minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50 font-sans">
      
      {/* --- 1. Header & Summary Section (Sticky) --- */}
      <div className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-100">
        
        {/* Top Bar: Title */}
        <div className="px-5 py-3 flex justify-between items-center bg-emerald-50/50">
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Store className="text-emerald-600" size={22} />
            Pharmacy Shelf
          </h1>
          <button className="p-2 bg-white rounded-full text-gray-500 hover:text-emerald-600 shadow-sm transition-colors">
            <Filter size={18} />
          </button>
        </div>

        {/* Stats Dashboard (Matches your screenshot's Top Right area) */}
        <div className="px-5 py-4 bg-white">
          <div className="flex flex-col gap-3">
             {/* Total Value Badge */}
             <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Value</span>
                <span className="text-lg font-bold text-emerald-700">
                  {formatCurrency(totalValue)}
                </span>
             </div>

             {/* Action Buttons Row */}
             <div className="flex gap-3">
                <button className="flex-1 bg-purple-600 text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 shadow-sm active:bg-purple-700 transition-colors">
                   <Plus size={16} /> Direct Stock
                </button>
                <div className="relative flex-[1.5]">
                   <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                   <input 
                      type="text" 
                      placeholder="Search items..." 
                      className="w-full bg-gray-100 text-gray-700 text-sm rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                   />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* --- 2. List Content --- */}
      <div className="px-4 py-4 space-y-3 pb-24">
        {items.map((item) => (
          <ShelfItemCard key={item.id} item={item} formatCurrency={formatCurrency} />
        ))}
      </div>

    </div>
  );
};

// --- Sub-Component: Individual Mobile Card ---
// Separated for cleaner state management (input handling)
const ShelfItemCard = ({ 
  item, 
  formatCurrency 
}: { 
  item: ShelfItem, 
  formatCurrency: (n: number) => string 
}) => {
  const [adjustVal, setAdjustVal] = useState('');

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
      
      {/* Top Half: Info */}
      <div className="p-4 border-b border-gray-50">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-gray-900 font-bold text-base leading-tight">
              {item.name} <span className="text-gray-400 font-normal text-xs">({item.packSize})</span>
            </h3>
          </div>
          <div className="text-right">
             {/* Total Price (Derived) */}
             <span className="block font-bold text-gray-900">
               {formatCurrency(item.price * item.qty)}
             </span>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
           <span className="text-gray-500 font-medium">
             {formatCurrency(item.price)} <span className="text-xs text-gray-400">/ unit</span>
           </span>
           {/* Current Qty Highlight (Green text from screenshot) */}
           <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-sm">
             Qty: {item.qty}
           </span>
        </div>
      </div>

      {/* Bottom Half: Actions Toolbar */}
      <div className="bg-gray-50/50 p-3 flex items-center justify-between gap-4">
        
        {/* Left: Adjust Input Group */}
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs font-bold text-gray-400 uppercase hidden sm:block">Adjust</span>
          <div className="flex items-center relative flex-1 max-w-[140px]">
             <input 
                type="number" 
                placeholder={item.qty.toString()}
                value={adjustVal}
                onChange={(e) => setAdjustVal(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-gray-300"
             />
             <button className="absolute right-1 p-1.5 text-gray-400 hover:text-emerald-600 active:scale-90 transition-transform">
                <RefreshCw size={14} />
             </button>
          </div>
        </div>

        {/* Right: Delete Action */}
        <button className="group flex items-center justify-center w-10 h-10 bg-white border border-red-100 rounded-lg text-red-500 active:bg-red-50 transition-colors shadow-sm">
          <Trash2 size={18} className="group-active:scale-90 transition-transform"/>
        </button>

      </div>
    </div>
  );
};

export default PharmacyShelf;