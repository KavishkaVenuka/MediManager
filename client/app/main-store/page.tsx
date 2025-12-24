'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package, Search, Filter, Pill,
  ChevronDown, ChevronUp, RefreshCw,
  ArrowRightLeft, Trash2
} from 'lucide-react';
import { supabase } from '@/utils/superbase/client';

// 1. Define the Data Shape
interface InventoryItem {
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

const InventoryCard = ({ item, onUpdate }: { item: InventoryItem, onUpdate: (itemId: string, buyPrice: number, newQty: number) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [adjustQty, setAdjustQty] = useState<string>('');
  const [transferQty, setTransferQty] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    const newQty = parseInt(adjustQty);
    if (isNaN(newQty)) {
      alert('Please enter a valid number');
      return;
    }

    try {
      setUpdating(true);
      const { error } = await supabase
        .from('main_store')
        .update({ pack_qty: newQty })
        .eq('item_id', item.item_id)
        .eq('buy_price', item.buy_price);

      if (error) throw error;

      onUpdate(item.item_id, item.buy_price, newQty);
      setAdjustQty('');
      alert('Stock updated successfully');
    } catch (error: any) {
      console.error('Error updating stock:', error);
      alert('Error updating stock: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleTransfer = async () => {
    const qtyToTransfer = parseInt(transferQty);
    if (isNaN(qtyToTransfer) || qtyToTransfer <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    if (qtyToTransfer > item.pack_qty) {
      alert('Insufficient stock in Main Store');
      return;
    }

    try {
      setUpdating(true);

      // 1. Reduce from Main Store
      const { error: mainStoreError } = await supabase
        .from('main_store')
        .update({ pack_qty: item.pack_qty - qtyToTransfer })
        .eq('item_id', item.item_id)
        .eq('buy_price', item.buy_price);

      if (mainStoreError) throw mainStoreError;

      // 2. Upsert to Pharmacy
      // Check if exists
      const { data: pharmacyItem, error: fetchError } = await supabase
        .from('pharmacy')
        .select('pack_qty')
        .eq('item_id', item.item_id)
        .eq('buy_price', item.buy_price)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (pharmacyItem) {
        // Update existing
        const { error: updateError } = await supabase
          .from('pharmacy')
          .update({ pack_qty: pharmacyItem.pack_qty + qtyToTransfer })
          .eq('item_id', item.item_id)
          .eq('buy_price', item.buy_price);
        if (updateError) throw updateError;
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('pharmacy')
          .insert({
            item_id: item.item_id,
            buy_price: item.buy_price,
            pack_qty: qtyToTransfer,
            pill_qty: 0 // Default
          });
        if (insertError) throw insertError;
      }

      // 3. Update local state
      onUpdate(item.item_id, item.buy_price, item.pack_qty - qtyToTransfer);
      setTransferQty('');
      alert('Stock transferred successfully');

    } catch (error: any) {
      console.error('Error transferring stock:', error);
      alert('Error transferring stock: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

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
              {item.medicine?.name || 'Unknown Item'}
            </h3>
            {/* Pack Size Badge - Subtle */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-teal-700 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
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
            <span className="block font-bold text-[#00C2A8] text-lg">
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

          {/* Control: Adjust Stock 
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
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="bg-gray-900 text-white px-5 rounded-lg font-medium active:scale-95 transition-transform disabled:opacity-50"
              >
                {updating ? '...' : 'Update'}
              </button>
            </div>
          </div>
          */}

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
              <button
                onClick={handleTransfer}
                disabled={updating}
                className="flex-1 bg-purple-50 text-purple-700 font-bold rounded-lg flex items-center justify-center gap-2 active:bg-purple-100 transition-colors disabled:opacity-50"
              >
                {updating ? '...' : 'Transfer'}
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
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('main_store')
          .select(`
            *,
            medicine (
              name,
              pack_size,
              weight
            )
          `);

        console.log('Main Store Data:', data);
        console.log('Main Store Error:', error);

        if (error) throw error;
        setItems(data as any); // Type assertion needed due to join
      } catch (error: any) {
        console.error('Error fetching inventory:', error);
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

  const handleStockUpdate = (itemId: string, buyPrice: number, newQty: number) => {
    setItems(prevItems => prevItems.map(item =>
      item.item_id === itemId && item.buy_price === buyPrice
        ? { ...item, pack_qty: newQty }
        : item
    ));
  };

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
            {items.length} Items
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search drugs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
            Error: {error}
          </div>
        )}
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading inventory...</div>
        ) : items.length === 0 && !error ? (
          <div className="text-center py-10 text-gray-500">No items in stock.</div>
        ) : (
          filteredItems.map((item) => (
            <InventoryCard
              key={item.item_id + item.buy_price}
              item={item}
              onUpdate={handleStockUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default InventoryList;