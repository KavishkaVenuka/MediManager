import React from 'react';

export const SkeletonCard = () => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
            <div className="p-4">
                {/* Card Header: Name and Price */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                        {/* Name Placeholder */}
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        {/* Pack Size Badge Placeholder */}
                        <div className="h-5 bg-gray-100 rounded w-1/2"></div>
                    </div>

                    <div className="text-right flex flex-col items-end ml-4">
                        {/* Price Placeholder */}
                        <div className="h-6 bg-gray-200 rounded w-20 mb-1"></div>
                        {/* Chevron Placeholder */}
                        <div className="h-5 w-5 bg-gray-100 rounded-full"></div>
                    </div>
                </div>

                {/* Card Body: Stock Statistics Grid */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                    {/* Pack Count Box Placeholder */}
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl border border-gray-100 bg-gray-50 h-20">
                        <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-8"></div>
                    </div>

                    {/* Pill Count Box Placeholder */}
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl border border-gray-100 bg-gray-50 h-20">
                        <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-8"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
