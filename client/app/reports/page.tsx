"use client";

import React, { useState, useEffect } from "react";
import {
  Search, Download, Upload, Trash2,
  History, Package, Calendar, DollarSign,
  ArrowUpRight, Building2, Store
} from "lucide-react";
import ExcelJS from "exceljs";
import { supabase } from '@/utils/superbase/client';

import Loading from "./loading";

export default function DashboardMobile() {
  const [activeTab, setActiveTab] = useState<"inventory" | "sales">("inventory");
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);

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
        // Need sale_items for selling price & qty, and inward_register for buy_price
        const { data: saleItems, error: itemsError } = await supabase
          .from('sale_items')
          .select('item_id, qty, unit_sell_price');

        if (itemsError) throw itemsError;

        const { data: inwardData, error: inwardError } = await supabase
          .from('inward_register')
          .select('item_id, buy_price')
          .order('date', { ascending: false }); // Get latest prices first

        if (inwardError) throw inwardError;

        // Create a map of item_id -> latest buy_price
        const buyPriceMap = new Map();
        inwardData?.forEach(item => {
          if (!buyPriceMap.has(item.item_id)) {
            buyPriceMap.set(item.item_id, item.buy_price);
          }
        });

        // Calculate Profit
        let profit = 0;
        saleItems?.forEach(item => {
          const buyPrice = buyPriceMap.get(item.item_id) || 0;
          const margin = item.unit_sell_price - buyPrice;
          profit += margin * item.qty;
        });

        setTotalProfit(profit);

      } catch (error) {
        console.error("Error calculating metrics:", error);
      }
    };

    fetchMetrics();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "inventory") {
          const { data, error } = await supabase
            .from('inward_register')
            .select(`
              id,
              date,
              qty_packs,
              destination,
              buy_price,
              medicine ( name, weight )
            `)
            .order('date', { ascending: false });

          if (error) throw error;

          if (data) {
            console.log("Raw Inventory Data:", data);
            const mapped = data.map((item: any) => ({
              id: item.id,
              date: item.date,
              name: item.medicine?.name || 'Unknown',
              weight: item.medicine?.weight || 'N/A',
              cost: item.buy_price || 0,
              store: item.destination === 'Main Store' ? item.qty_packs : 0,
              pharma: item.destination === 'Pharmacy' ? item.qty_packs : 0,
              totalCost: (item.buy_price || 0) * item.qty_packs
            }));
            console.log("Mapped Inventory Data:", mapped);
            setInventoryData(mapped);
          }
        } else {
          const { data, error } = await supabase
            .from('sale_items')
            .select(`
              id,
              qty,
              unit_sell_price,
              unit_buy_price,
              medicine ( name, weight ),
              sales ( created_at )
            `)
            .limit(50); // Limit to recent 50 sales for performance

          if (error) throw error;

          if (data) {
            console.log("Raw Sales Data:", data);
            const mapped = data.map((item: any) => ({
              id: item.id,
              time: item.sales?.created_at ? new Date(item.sales.created_at).toLocaleDateString() : 'N/A',
              name: item.medicine?.name || 'Unknown',
              weight: item.medicine?.weight || 'N/A',
              cost: item.unit_buy_price || 0,
              qty: item.qty,
              total: item.qty * item.unit_sell_price,
              totalCost: (item.unit_buy_price || 0) * item.qty
            }));
            console.log("Mapped Sales Data:", mapped);
            setSalesData(mapped);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // --- ACTIONS (Placeholder Logic) ---
  // --- ACTIONS ---
  const handleExport = async (type: string) => {
    const rawData = type === "Inventory" ? inventoryData : salesData;

    if (rawData.length === 0) {
      alert(`No ${type.toLowerCase()} data to export.`);
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(type);

    // Define columns based on data type
    if (type === "Inventory") {
      worksheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Medicine Name", key: "name", width: 25 },
        { header: "Weight", key: "weight", width: 15 },
        { header: "Cost per Unit (LKR)", key: "cost", width: 20 },
        { header: "Store Qty", key: "store", width: 12 },
        { header: "Pharmacy Qty", key: "pharma", width: 15 },
        { header: "Total Cost (LKR)", key: "totalCost", width: 20 },
      ];
    } else {
      worksheet.columns = [
        { header: "Time", key: "time", width: 20 },
        { header: "Medicine Name", key: "name", width: 25 },
        { header: "Weight", key: "weight", width: 15 },
        { header: "Qty", key: "qty", width: 10 },
        { header: "Total Price (Sales)", key: "total", width: 20 },
      ];
    }

    // Add rows
    worksheet.addRows(rawData);

    // Style header row (optional but nice)
    worksheet.getRow(1).font = { bold: true };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Create blob and download
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${type}_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = (type: string) => {
    alert(`Opening file picker for ${type}...`);
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear sales history?")) {
      console.log("Cleared");
    }
  };

  const filteredInventory = inventoryData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">

      {/* --- TOP STATS (Compact for Mobile) --- */}
      <div className="bg-teal-600 pt-6 pb-8 px-4 rounded-b-[2rem] shadow-sm">
        <h1 className="text-white text-xl font-bold mb-2">Reports</h1>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20">
            <p className="text-teal-100 text-xs font-medium uppercase tracking-wider">Revenue</p>
            <p className="text-white text-lg font-bold">LKR {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20">
            <p className="text-teal-100 text-xs font-medium uppercase tracking-wider">Profit</p>
            <p className="text-emerald-300 text-lg font-bold">LKR {totalProfit.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* --- TAB SWITCHER --- */}
      <div className="px-4 -mt-4">
        <div className="bg-white p-1 rounded-2xl shadow-md flex">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === "inventory"
              ? "bg-teal-50 text-teal-600 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
              }`}
          >
            <Package className="w-4 h-4" /> Inventory
          </button>
          <button
            onClick={() => setActiveTab("sales")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === "sales"
              ? "bg-teal-50 text-teal-600 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
              }`}
          >
            <History className="w-4 h-4" /> Sales History
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="px-4 mt-6">

        {loading ? (
          <Loading activeTab={activeTab} />
        ) : (
          <>
            {/* ================= INVENTORY TAB ================= */}
            {activeTab === "inventory" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

                {/* Action Bar: Search + Buttons */}
                <div className="flex flex-col gap-3 mb-6">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search inventory..."
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  </div>

                  {/* Action Buttons Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleExport("Inventory")}
                      className="flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-transform shadow-sm shadow-green-200"
                    >
                      <Download className="w-4 h-4" /> Export
                    </button>
                    <button
                      onClick={() => handleImport("Inventory")}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-transform shadow-sm shadow-blue-200"
                    >
                      <Upload className="w-4 h-4" /> Import
                    </button>
                  </div>
                </div>

                {/* Inventory List */}
                <div className="space-y-3">
                  {filteredInventory.length === 0 ? (
                    <div className="text-center py-4 text-gray-400">No records found.</div>
                  ) : filteredInventory.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-gray-800">{item.name}</h3>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {item.date}
                        </p>
                      </div>
                      <div className="flex gap-2 text-right">
                        <div className="bg-gray-50 p-2 rounded-lg min-w-[3.5rem] flex flex-col items-center">
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Store</span>
                          <span className="font-bold text-gray-700">{item.store}</span>
                        </div>
                        <div className="bg-teal-50 p-2 rounded-lg min-w-[3.5rem] flex flex-col items-center">
                          <span className="text-[10px] text-teal-400 font-bold uppercase">Pharma</span>
                          <span className="font-bold text-teal-700">{item.pharma}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= SALES HISTORY TAB ================= */}
            {activeTab === "sales" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

                {/* Action Bar: Buttons Only (No Search shown in original image for Sales) */}
                <div className="grid grid-cols-[1fr_1fr_auto] gap-3 mb-6">
                  <button
                    onClick={() => handleExport("Sales")}
                    className="flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-transform shadow-sm shadow-green-200"
                  >
                    <Download className="w-4 h-4" /> Export
                  </button>
                  <button
                    onClick={() => handleImport("Sales")}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-transform shadow-sm shadow-blue-200"
                  >
                    <Upload className="w-4 h-4" /> Import
                  </button>
                  <button
                    onClick={handleClearHistory}
                    className="flex items-center justify-center w-12 bg-red-50 text-red-500 rounded-xl active:scale-95 transition-transform border border-red-100"
                    title="Clear History"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Sales List */}
                <div className="space-y-3">
                  <div className="flex justify-between px-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">
                    <span>Transaction Details</span>
                    <span>Value</span>
                  </div>

                  {salesData.length === 0 ? (
                    <div className="text-center py-4 text-gray-400">No sales history found.</div>
                  ) : salesData.map((sale) => (
                    <div key={sale.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">

                      {/* Left: Time & Name */}
                      <div className="flex items-start gap-3">
                        <div className="bg-indigo-50 text-indigo-500 p-2 rounded-full mt-1">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm">{sale.name}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{sale.time}</p>
                          <span className="inline-block mt-1 text-[10px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            Qty: {sale.qty}
                          </span>
                        </div>
                      </div>

                      {/* Right: Total Price */}
                      <div className="text-right">
                        <p className="font-bold text-gray-800 text-sm">
                          LKR {sale.total.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">
                          Completed
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}