'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Pill,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Trash2,
  Store,
  Search,
  Filter,
  Plus,
  ShoppingCart
} from 'lucide-react';
import { supabase } from '@/utils/superbase/client';


interface ShelfItem {
  item_id: string;
  buy_price: number;
  pack_qty: number;
  pill_qty: number;
  medicine: {
    name: string;
    pack_size: number;
    weight: number;
  };
}

const PharmacyShelf = () => {
  const router = useRouter();
  const [items, setItems] = useState<ShelfItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('pharmacy')
          .select(`
            *,
            medicine (
              name,
              pack_size,
              weight
            )
          `);

        if (error) throw error;
        setItems(data as any); // Type assertion needed due to join
      } catch (error: any) {
        console.error('Error fetching pharmacy inventory:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // --- Filter Logic ---
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter(item =>
      item.medicine.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, items]);

  // Calculate Total Value dynamically
  const totalValue = items.reduce((acc, item) => acc + (item.buy_price * item.pack_qty), 0);

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
              <button
                onClick={() => router.push('/buy-stock')}
                className="flex-1 bg-purple-600 text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 shadow-sm active:bg-purple-700 transition-colors"
              >
                <Plus size={16} /> Direct Stock
              </button>
              <div className="relative flex-[1.5]">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100 text-gray-700 text-sm rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. List Content --- */}
      <div className="px-4 py-4 space-y-4 pb-24">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
            Error: {error}
          </div>
        )}
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading pharmacy inventory...</div>
        ) : items.length === 0 && !error ? (
          <div className="text-center py-10 text-gray-500">No items in pharmacy.</div>
        ) : (
          filteredItems.map((item) => (
            <ShelfItemCard key={item.item_id + item.buy_price} item={item} formatCurrency={formatCurrency} />
          ))
        )}
      </div>

    </div>
  );
};

// --- Sub-Component: Individual Mobile Card ---
const ShelfItemCard = ({
  item,
  formatCurrency
}: {
  item: ShelfItem,
  formatCurrency: (n: number) => string
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [adjustVal, setAdjustVal] = useState('');
  const [updating, setUpdating] = useState(false);

  const getStockStatus = (qty: number) => {
    if (qty === 0) return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', label: 'Out of Stock' };
    if (qty < 10) return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', label: 'Low Stock' };
    return { color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-100', label: 'Good' };
  };

  const status = getStockStatus(item.pack_qty);

  const handleReturnToStore = async () => {
    const qty = parseInt(adjustVal);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    if (qty > item.pack_qty) {
      alert('Insufficient stock in Pharmacy to return');
      return;
    }

    try {
      setUpdating(true);

      // 1. Reduce from Pharmacy
      const { error: pharmacyError } = await supabase
        .from('pharmacy')
        .update({ pack_qty: item.pack_qty - qty })
        .eq('item_id', item.item_id)
        .eq('buy_price', item.buy_price);

      if (pharmacyError) throw pharmacyError;

      // 2. Add to Main Store
      // Check if exists in Main Store (it should, but good to be safe or use RPC if available, but here we do manual check/update)
      const { data: mainStoreItem, error: fetchError } = await supabase
        .from('main_store')
        .select('pack_qty')
        .eq('item_id', item.item_id)
        .eq('buy_price', item.buy_price)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (mainStoreItem) {
        const { error: updateError } = await supabase
          .from('main_store')
          .update({ pack_qty: mainStoreItem.pack_qty + qty })
          .eq('item_id', item.item_id)
          .eq('buy_price', item.buy_price);
        if (updateError) throw updateError;
      } else {
        // If it doesn't exist in main store (unlikely given the flow, but possible if deleted), insert it
        const { error: insertError } = await supabase
          .from('main_store')
          .insert({
            item_id: item.item_id,
            buy_price: item.buy_price,
            pack_qty: qty,
            pill_qty: 0
          });
        if (insertError) throw insertError;
      }

      alert('Stock returned to Main Store successfully');
      setAdjustVal('');
      // Ideally we should trigger a refresh of the list here, but for now we rely on the parent or manual refresh
      // Since we don't have a callback to refresh parent, we might want to add one or just reload
      window.location.reload();

    } catch (error: any) {
      console.error('Error returning stock:', error);
      alert('Error returning stock: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleTransferToPOS = async () => {
    const qty = parseInt(adjustVal);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    if (qty > item.pack_qty) {
      alert('Insufficient stock to transfer');
      return;
    }

    try {
      setUpdating(true);

      // 1. Reduce from Pharmacy
      const { error: pharmacyError } = await supabase
        .from('pharmacy')
        .update({ pack_qty: item.pack_qty - qty })
        .eq('item_id', item.item_id)
        .eq('buy_price', item.buy_price);

      if (pharmacyError) throw pharmacyError;

      // 2. Add to Point of Sale
      // Check if exists in POS
      const { data: posItem, error: fetchError } = await supabase
        .from('point_of_sale')
        .select('pack_qty')
        .eq('item_id', item.item_id)
        .eq('buy_price', item.buy_price)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (posItem) {
        // Update existing
        const { error: updateError } = await supabase
          .from('point_of_sale')
          .update({ pack_qty: posItem.pack_qty + qty })
          .eq('item_id', item.item_id)
          .eq('buy_price', item.buy_price);
        if (updateError) throw updateError;
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('point_of_sale')
          .insert({
            item_id: item.item_id,
            buy_price: item.buy_price,
            pack_qty: qty,
            pill_qty: 0
          });
        if (insertError) throw insertError;
      }

      alert('Stock transferred to POS successfully');
      setAdjustVal('');
      window.location.reload();

    } catch (error: any) {
      console.error('Error transferring to POS:', error);
      alert('Error transferring to POS: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 overflow-hidden
      ${isExpanded ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-100'}`}
    >
      <div
        className="p-4 cursor-pointer active:scale-[0.99] transition-transform duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Card Header: Name and Price */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-800 leading-tight">
              {item.medicine?.name || 'Unknown Item'}
            </h3>
            {/* Pack Size Badge - Subtle */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-emerald-700 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                {item.medicine?.weight}mg • {item.medicine?.pack_size || 0} / pack
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
            <span className="block font-bold text-emerald-600 text-lg">
              {formatCurrency(item.buy_price)}
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
              <RefreshCw size={12} /> Adjust Stock
            </label>
            <div className="flex flex-col gap-3">
              {/* Input Row */}
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Enter quantity..."
                  value={adjustVal}
                  onChange={(e) => setAdjustVal(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                />
                <span className="absolute right-4 top-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider pointer-events-none">
                  Units
                </span>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Add Stock Button */}
                <button
                  onClick={handleReturnToStore}
                  disabled={updating}
                  className="flex flex-col items-center justify-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 p-3 rounded-xl font-bold active:scale-[0.98] transition-all hover:bg-emerald-100 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Package size={20} className="mb-1" />
                  <span className="text-sm">to Stock</span>
                </button>

                {/* POS / Sell Button */}
                <button
                  onClick={handleTransferToPOS}
                  disabled={updating}
                  className="flex flex-col items-center justify-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 p-3 rounded-xl font-bold active:scale-[0.98] transition-all hover:bg-blue-100 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <ShoppingCart size={20} className="mb-1" />
                  <span className="text-sm"> to POS</span>
                </button>
              </div>
            </div>
          </div>

          {/* Delete Button 
          <button
            onClick={handleDelete}
            className="w-full bg-white text-red-500 border border-red-100 p-3 rounded-xl font-bold flex items-center justify-center gap-2 active:bg-red-50 transition-colors shadow-sm"
          >
            <Trash2 size={18} /> Remove Item
          </button>
          */}
        </div>
      )}
    </div>
  );
};

export default PharmacyShelf;