'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ShoppingCart,
  Search,
  ChevronDown,
  Minus,
  Plus,
  Package,
  Pill,
  CheckCircle2,
  Filter
} from 'lucide-react';

import { supabase } from '@/utils/superbase/client';

// --- Types ---
interface Drug {
  id: string; // Changed to string for UUID
  name: string;
  dosage: string;
  stockStatus: string;
  price: number;
  fullPacksStock: number;
  loosePillsStock: number;
  type: string;
}

const App = () => {
  // --- State ---
  const [inventory, setInventory] = useState<Drug[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from('point_of_sale')
        .select(`
          item_id,
          buy_price,
          pack_qty,
          pill_qty,
          medicine (
            name,
            pack_size
          )
        `);

      if (error) {
        console.error('Error fetching inventory:', error);
        return;
      }

      if (data) {
        const mappedData: Drug[] = data.map((item: any) => ({
          id: item.item_id,
          name: item.medicine?.name || 'Unknown',
          dosage: `${item.medicine?.pack_size || 0}/pack`,
          stockStatus: item.pack_qty < 10 ? "Low Stock" : "In Stock",
          price: item.buy_price, // Using buy_price as price for now
          fullPacksStock: item.pack_qty,
          loosePillsStock: item.pill_qty,
          type: "tablet" // Default type
        }));
        setInventory(mappedData);
      }
    };

    fetchInventory();
  }, []);

  // --- Filter Logic ---
  const filteredInventory = useMemo(() => {
    if (!searchQuery) return inventory;
    return inventory.filter(drug =>
      drug.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, inventory]);

  // --- Calculations ---
  const total = selectedDrug ? selectedDrug.price * quantity : 0;

  // --- Handlers ---
  const handleSelectDrug = (drug: Drug) => {
    setSelectedDrug(drug);
    setQuantity(1);
    setIsDropdownOpen(false);
    // Optional: Auto-fill filter with selected name, or keep it as filter.
    // Keeping it as filter allows user to see they are searching.
  };

  const adjustQuantity = (amount: number) => {
    const newQty = quantity + amount;
    if (newQty >= 1) setQuantity(newQty);
  };

  const handleConfirmSale = async () => {
    if (!selectedDrug) return;

    // Check for sufficient stock
    if (selectedDrug.fullPacksStock < quantity) {
      alert('Insufficient stock!');
      return;
    }

    try {
      // 1. Create Sale Record
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert([{ total_amount: total }])
        .select()
        .single();

      if (saleError) throw saleError;
      if (!saleData) throw new Error("Failed to create sale record");

      const saleId = saleData.id;

      // 2. Create Sale Item Record
      const { error: itemError } = await supabase
        .from('sale_items')
        .insert([{
          sale_id: saleId,
          item_id: selectedDrug.id,
          qty: quantity,
          unit_price: selectedDrug.price,
          total_price: total
        }]);

      if (itemError) throw itemError;

      // 3. Deduct stock from Supabase
      const { error: stockError } = await supabase
        .from('point_of_sale')
        .update({
          pack_qty: selectedDrug.fullPacksStock - quantity,
          last_updated: new Date().toISOString()
        })
        .eq('item_id', selectedDrug.id)
        .eq('buy_price', selectedDrug.price);

      if (stockError) throw stockError;

      // Update local state
      setInventory(prevInventory =>
        prevInventory.map(item =>
          item.id === selectedDrug.id && item.price === selectedDrug.price
            ? { ...item, fullPacksStock: item.fullPacksStock - quantity }
            : item
        )
      );

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedDrug(null);
        setQuantity(1);
        setSearchQuery("");
      }, 2000);

    } catch (error: any) {
      console.error('Error processing sale:', error);
      alert('Error processing sale: ' + error.message);
    }
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative pb-40">

      {/* --- Header --- */}
      <div className="bg-[#00C2A8] px-6 pt-10 pb-16 rounded-b-[2.5rem] shadow-lg relative z-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Point of Sale</h1>
          </div>
          <div className="w-8 h-8 bg-teal-400/30 rounded-full border-2 border-teal-200/50"></div>
        </div>
      </div>

      {/* --- Main Card --- */}
      <div className="px-4 -mt-10 relative z-10 max-w-lg mx-auto">
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">

          {/* Field 1: Filter */}
          <div className="mb-5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">
              Filter
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00C2A8] transition-colors">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search drug name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!isDropdownOpen) setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full bg-slate-50 text-slate-800 pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C2A8]/20 focus:border-[#00C2A8] transition-all font-medium"
              />
            </div>
          </div>

          {/* Field 2: Select Drug */}
          <div className="mb-5 relative" ref={dropdownRef}>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">
              Select Drug
            </label>

            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full text-left bg-slate-50 py-3.5 px-4 rounded-xl border transition-all flex items-center justify-between group ${isDropdownOpen ? 'border-[#00C2A8] ring-2 ring-[#00C2A8]/10' : 'border-slate-200 hover:border-[#00C2A8]/50'
                }`}
            >
              <span className={`font-medium truncate ${selectedDrug ? 'text-slate-800' : 'text-slate-400'}`}>
                {selectedDrug
                  ? `${selectedDrug.name} (${selectedDrug.dosage}) - LKR ${selectedDrug.price}`
                  : "Select a drug..."}
              </span>
              <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-[#00C2A8]' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 max-h-60 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map(drug => (
                    <div
                      key={`${drug.id}-${drug.price}`}
                      onClick={() => handleSelectDrug(drug)}
                      className="p-3 hover:bg-teal-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-700 text-sm">{drug.name}</p>
                          <p className="text-xs text-slate-500">{drug.dosage} • Stock: {drug.fullPacksStock}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#00C2A8] font-bold text-sm">LKR {drug.price}</p>
                          {drug.stockStatus === "Low Stock" && (
                            <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium">Low</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 text-sm">No items found</div>
                )}
              </div>
            )}
          </div>

          {/* Field 3: Quantity */}
          <div className="mb-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => adjustQuantity(-1)}
                className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-xl text-slate-600 active:scale-95 transition-transform hover:bg-slate-200"
              >
                <Minus size={20} />
              </button>

              <div className="flex-1 relative">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full text-center bg-slate-50 border border-slate-200 rounded-xl py-3 text-xl font-bold text-slate-800 focus:outline-none focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/20 transition-all"
                />
              </div>

              <button
                onClick={() => adjustQuantity(1)}
                className="w-12 h-12 flex items-center justify-center bg-[#00C2A8] text-white rounded-xl active:scale-95 transition-transform shadow-lg shadow-teal-500/30 hover:bg-teal-600"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

        </div>

        {/* --- Selection Summary (Only visible when drug selected) --- */}
        {selectedDrug && (
          <div className="mt-4 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/50 animate-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-500 text-sm font-medium">Subtotal</span>
              <span className="text-slate-800 font-bold">LKR {total.toLocaleString()}</span>
            </div>

            {/* Stock Indicators */}
            <div className="flex gap-2">
              <div className="flex-1 bg-white rounded-lg p-2 flex items-center justify-center gap-2 border border-slate-100 shadow-sm">
                <Package size={14} className="text-orange-400" />
                <span className="text-xs font-bold text-slate-600">{selectedDrug.fullPacksStock} Packs</span>
              </div>
              <div className="flex-1 bg-white rounded-lg p-2 flex items-center justify-center gap-2 border border-slate-100 shadow-sm">
                <Pill size={14} className="text-blue-400" />
                <span className="text-xs font-bold text-slate-600">{selectedDrug.loosePillsStock} Pills</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- Sticky Bottom Bar --- */}
      <div className="fixed bottom-24 left-0 right-0 px-4 z-30 pointer-events-none">
        <div className="max-w-lg mx-auto bg-white border border-slate-100 p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center justify-between gap-4 pointer-events-auto">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Payable</p>
            <p className="text-2xl font-black text-slate-800 tracking-tight">
              LKR {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <button
            onClick={handleConfirmSale}
            disabled={!selectedDrug}
            className={`flex-1 max-w-[180px] py-3.5 px-6 rounded-xl font-bold text-base shadow-xl transition-all ${selectedDrug
              ? 'bg-[#00C2A8] text-white shadow-teal-500/40 active:scale-[0.97]'
              : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
              }`}
          >
            Confirm Sale
          </button>
        </div>
      </div>

      {/* --- Success Modal --- */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-xs text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-teal-50">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Sale Added!</h2>
            <p className="text-slate-500 font-medium">LKR {total.toLocaleString()} has been recorded.</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;