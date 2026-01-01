import React from 'react';
import { Package, Search, Filter } from 'lucide-react';

import { SkeletonCard } from '@/components/SkeletonCard';

const Loading = () => {
    // Create an array of 8 items to render skeleton cards
    const skeletons = Array(8).fill(null);

    return (
        <div className="flex flex-col h-full bg-gray-50 pb-24 font-sans">
            {/* --- Header Section (Static Placeholder) --- */}
            <div className="sticky top-0 z-10 bg-[#00C2A8] border-b border-gray-100 px-5 py-4 rounded-b-3xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Package className="text-[#00C2A8]" size={24} />
                        Main Store
                    </h1>
                    {/* Item Count Badge Placeholder */}
                    <div className="h-6 w-20 bg-teal-50/50 rounded-full animate-pulse"></div>
                </div>

                <div className="relative">
                    {/* Search Bar Placeholder */}
                    <div className="w-full bg-gray-100 rounded-xl h-12 animate-pulse"></div>
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <div className="absolute right-3 top-3 text-gray-400 bg-white p-1 rounded-md shadow-sm border border-gray-100">
                        <Filter size={16} />
                    </div>
                </div>
            </div>

            {/* --- List Section --- */}
            <div className="px-4 py-4 space-y-4 overflow-y-auto">
                {skeletons.map((_, index) => (
                    <SkeletonCard key={index} />
                ))}
            </div>
        </div>
    );
};

export default Loading;
