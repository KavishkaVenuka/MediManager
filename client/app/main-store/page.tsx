'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package, Search, Filter, Pill,
  ChevronDown, ChevronUp, RefreshCw,
  ArrowRightLeft, Trash2
} from 'lucide-react';

// 1. Define the Data Shape
interface InventoryItem {
  id: string;
  name: string;
  packSize: number;
  price: number;
  pack_qty: number;
  pill_qty: number;
}

// Dummy Data
const inventoryData: InventoryItem[] = [
  { id: '1', name: 'Asprin 75mg', packSize: 100, price: 1250.00, pack_qty: 1, pill_qty: 10 },
  { id: '2', name: 'Panadol 500mg', packSize: 120, price: 2500.00, pack_qty: 5, pill_qty: 101 },
  { id: '3', name: 'Amoxicillin', packSize: 50, price: 1121.00, pack_qty: 500, pill_qty: 11 },
  { id: '4', name: 'Metformin', packSize: 100, price: 850.00, pack_qty: 5, pill_qty: 11 },
  { id: '5', name: 'Vitamin C', packSize: 30, price: 400.00, pack_qty: 51, pill_qty: 11 },
  { id: '6', name: 'Omeprazole', packSize: 100, price: 1500.00, pack_qty: 32, pill_qty: 11 },
];

const InventoryCard = ({ item }: { item: InventoryItem }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [adjustQty, setAdjustQty] = useState<string>('');
  const [transferQty, setTransferQty] = useState<string>('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStockStatus = (qty: number) => {
    if (qty === 0) return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', label: 'Out of Stock' };
    if (qty < 10) return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', label: 'Low Stock' };
    return { color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-100', label: 'Good' };
  };

  const status = getStockStatus(item.pack_qty);

  return (
    <div className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 overflow-hidden
      ${isExpanded ? 'border-teal-500 ring-1 ring-teal-500' : 'border-gray-100'}`}
    >
      <div
        className="p-4 cursor-pointer active:scale-[0.99] transition-transform duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Card Header: Name and Price */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-800 leading-tight">
              {item.name}
            </h3>
            {/* Pack Size Badge - Subtle */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-teal-700 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                {item.packSize} / pack
              </span>
              {/* Low Stock Badge */}
              {item.pack_qty < 10 && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                  Low Stock
                </span>
              )}
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <span className="block font-bold text-[#00C2A8] text-lg">
              {formatCurrency(item.price)}
            </span>
            {/* Chevron for expansion */}
            <div className="mt-1 text-gray-400">
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </div>

        {/* Card Body: Stock Statistics Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {/* Pack Count Box */}
          <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${status.bg} ${status.border}`}>
            <span className={`text-xs uppercase font-semibold tracking-wider ${status.color} opacity-70 mb-0.5`}>
              Full Packs
            </span>
            <div className="flex items-center gap-1.5">
              <Package size={16} className={status.color} />
              <span className={`text-xl font-bold ${status.color}`}>
                {item.pack_qty}
              </span>
            </div>
          </div>

          {/* Pill Count Box */}
          <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${status.bg} ${status.border}`}>
            <span className={`text-xs uppercase font-semibold tracking-wider ${status.color} opacity-70 mb-0.5`}>
              Loose Pills
            </span>
            <div className="flex items-center gap-1.5">
              <Pill size={16} className="text-gray-400" />
              <span className={`text-xl font-bold ${status.color}`}>
                {item.pill_qty}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Expanded Action Panel --- */}
      {isExpanded && (
        <div className="bg-gray-50 border-t border-gray-100 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">

          {/* Control: Adjust Stock */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-2">
              <RefreshCw size={12} /> Adjust Physical Stock
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder={item.pack_qty.toString()}
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <button className="bg-gray-900 text-white px-5 rounded-lg font-medium active:scale-95 transition-transform">
                Update
              </button>
            </div>
          </div>

          {/* Control: Transfer Stock */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-2">
              <ArrowRightLeft size={12} /> Transfer Stock
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Qty"
                value={transferQty}
                onChange={(e) => setTransferQty(e.target.value)}
                className="w-24 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 text-center font-bold focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
              <button className="flex-1 bg-purple-50 text-purple-700 font-bold rounded-lg flex items-center justify-center gap-2 active:bg-purple-100 transition-colors">
                Transfer
              </button>
              <button className="w-12 bg-red-50 text-red-500 border border-red-100 rounded-lg flex items-center justify-center active:bg-red-100 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InventoryList = () => {
  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24 font-sans">

      {/* --- Header Section --- */}
      <div className="sticky top-0 z-10 bg-[#00C2A8] border-b border-gray-100 px-5 py-4 rounded-b-3xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-[#00C2A8]" size={24} />
            Main Store
          </h1>
          <span className="text-xs font-semibold bg-teal-50 text-teal-700 px-3 py-1 rounded-full border border-teal-100">
            {inventoryData.length} Items
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search drugs..."
            className="w-full bg-gray-100 text-gray-700 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-gray-400"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
          <div className="absolute right-3 top-3 text-gray-400 bg-white p-1 rounded-md shadow-sm border border-gray-100">
            <Filter size={16} />
          </div>
        </div>
      </div>

      {/* --- List Section --- */}
      <div className="px-4 py-4 space-y-4 overflow-y-auto">
        {inventoryData.map((item) => (
          <InventoryCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default InventoryList;