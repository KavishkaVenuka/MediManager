'use client';

import React, { useState } from 'react';
import { ChevronLeft, Calendar, Search, Plus, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';

const InwardRegisterForm = () => {
    const router = useRouter();
    // Simple state management for demonstration (replace with react-hook-form later)
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0], // Default to today
        destination: 'Main Store',
        drugName: '',
        packSize: '',
        qty: '',
        free: '',
        buyPrice: '',
        retailPrice: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Reusable Input Styles ---
    const labelStyle = "block text-sm font-bold text-gray-700 mb-1.5 ml-1";
    const inputContainerStyle = "relative flex items-center";
    const inputStyle = "w-full bg-white border border-gray-200 text-gray-800 font-medium rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent transition-all placeholder:text-gray-400 placeholder:font-normal shadow-sm";
    const iconStyle = "absolute left-4 text-gray-400 pointer-events-none";

    return (
        <div className="flex flex-col h-full min-h-screen bg-gray-50 font-sans">

            {/* --- Header (Sticky) --- */}
            <div className="sticky top-0 z-10 bg-[#00C2A8] border-b border-gray-100 px-5 py-6 rounded-b-3xl shadow-md">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 active:scale-95 transition-all backdrop-blur-sm"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        Inward Register
                    </h1>
                </div>
            </div>

            {/* --- Form Container --- */}
            <div className="flex-1 px-4 py-6 overflow-y-auto pb-32"> {/* pb-32 for button clearance */}

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-6">

                    {/* Section 1: Logistics */}
                    <div className="space-y-4">
                        {/* Date Picker */}
                        <div>
                            <label htmlFor="date" className={labelStyle}>Buying Date</label>
                            <div className={inputContainerStyle}>
                                <Calendar size={20} className={iconStyle} />
                                {/* 'pl-12' makes room for the icon */}
                                <input
                                    type="date"
                                    name="date"
                                    id="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className={`${inputStyle} pl-12 appearance-none`}
                                />
                            </div>
                        </div>

                        {/* Destination Select */}
                        <div>
                            <label htmlFor="destination" className={labelStyle}>Destination</label>
                            <div className={inputContainerStyle}>
                                <Store size={20} className={iconStyle} />
                                <select
                                    name="destination"
                                    id="destination"
                                    value={formData.destination}
                                    onChange={handleChange}
                                    className={`${inputStyle} pl-12 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23A0AEC0%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-13%205.4A17.6%2017.6%200%200%200%200%2087.2c0%205%201.8%209.3%205.4%2013l128%20128c3.6%203.6%207.8%205.4%2013%205.4s9.3-1.8%2013-5.4l128-128c3.6-3.6%205.4-7.8%205.4-13%200-5-1.8-9.3-5.4-13z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:12px_12px] bg-[right_1rem_center]`}
                                >
                                    <option value="Main Store">Main Store</option>
                                    <option value="Pharmacy">Pharmacy</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Section 2: Item Details */}
                    <div className="space-y-4">
                        {/* Drug Search */}
                        <div>
                            <label htmlFor="drugName" className={labelStyle}>Drug Name</label>
                            <div className={inputContainerStyle}>
                                <Search size={20} className={iconStyle} />
                                <input
                                    type="text"
                                    name="drugName"
                                    id="drugName"
                                    placeholder="Search repository..."
                                    className={`${inputStyle} pl-12`}
                                />
                            </div>
                        </div>

                        {/* Pack Size */}
                        <div>
                            <label htmlFor="packSize" className={labelStyle}>Pack Size</label>
                            <input
                                type="number" inputMode="numeric" placeholder="e.g., 100"
                                name="packSize" id="packSize"
                                className={inputStyle}
                            />
                        </div>

                        {/* Row: Qty & Free (Side-by-side for small numbers) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="qty" className={labelStyle}>Qty (Packs)</label>
                                <input
                                    type="number" inputMode="numeric" placeholder="0"
                                    name="qty" id="qty"
                                    className={inputStyle}
                                />
                            </div>
                            <div>
                                <label htmlFor="free" className={labelStyle}>Free Issues</label>
                                <input
                                    type="number" inputMode="numeric" placeholder="0"
                                    name="free" id="free"
                                    className={inputStyle}
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Section 3: Pricing */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Buy Price with Currency Prefix */}
                        <div>
                            <label htmlFor="buyPrice" className={labelStyle}>Buy Price</label>
                            <div className={inputContainerStyle}>
                                <span className="absolute left-4 text-gray-400 font-semibold text-sm">LKR</span>
                                <input
                                    type="number" inputMode="decimal" placeholder="0.00"
                                    name="buyPrice" id="buyPrice"
                                    // pl-14 gives room for the "LKR" text
                                    className={`${inputStyle} pl-14 text-right`}
                                />
                            </div>
                        </div>

                        {/* Retail Price with Currency Prefix */}
                        <div>
                            <label htmlFor="retailPrice" className={labelStyle}>Retail Price</label>
                            <div className={inputContainerStyle}>
                                <span className="absolute left-4 text-gray-400 font-semibold text-sm">LKR</span>
                                <input
                                    type="number" inputMode="decimal" placeholder="0.00"
                                    name="retailPrice" id="retailPrice"
                                    className={`${inputStyle} pl-14 text-right`}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- Submit Action (Sticky Bottom) --- */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button className="w-full bg-[#00C2A8] text-white text-lg font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-100 active:scale-[0.98] transition-transform">
                    <Plus size={24} strokeWidth={3} />
                    Add Item to Queue
                </button>
            </div>

        </div>
    );
};

export default InwardRegisterForm;