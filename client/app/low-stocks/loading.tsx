import React from 'react';

export const LowStockSkeletonCard = () => {
    return (
        <div className="bg-white rounded-3xl p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-50 relative overflow-hidden animate-pulse">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-3 pl-2">
                <div className="flex items-center gap-3 w-full">
                    {/* Icon Container Placeholder */}
                    <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0"></div>

                    {/* Text Info Placeholder */}
                    <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                    </div>
                </div>

                {/* Stock Badge Placeholder */}
                <div className="w-20 h-8 bg-gray-100 rounded-lg shrink-0 ml-2"></div>
            </div>

            {/* Progress & Stats Section */}
            <div className="pl-2 mt-4">
                <div className="flex justify-between mb-2">
                    <div className="h-3 bg-gray-100 rounded w-16"></div>
                    <div className="h-3 bg-gray-100 rounded w-20"></div>
                </div>
                {/* Progress Bar Placeholder */}
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-200 w-2/3"></div>
                </div>
            </div>

            {/* Actions Row Placeholder */}
            <div className="mt-4 pl-2 flex items-center justify-between border-t border-gray-50 pt-3">
                <div className="h-3 bg-gray-100 rounded w-24"></div>
                <div className="h-8 bg-gray-900/10 rounded-xl w-28"></div>
            </div>
        </div>
    );
};

const Loading = () => {
    return (
        <div className="px-6 mt-4 space-y-4">
            {Array(6).fill(null).map((_, index) => (
                <LowStockSkeletonCard key={index} />
            ))}
        </div>
    );
};

export default Loading;
