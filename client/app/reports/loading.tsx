import React from "react";

interface LoadingProps {
    activeTab?: "inventory" | "sales";
}

export default function Loading({ activeTab = "inventory" }: LoadingProps) {
    return (
        <div className="animate-pulse">
            {/* Action Bar Skeleton */}
            <div className="mb-6">
                {activeTab === "inventory" ? (
                    <div className="flex flex-col gap-3">
                        {/* Search Input Skeleton */}
                        <div className="h-[46px] w-full bg-gray-200 rounded-xl"></div>

                        {/* Inventory Buttons: Grid 2 */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="h-[42px] bg-gray-200 rounded-xl"></div>
                            <div className="h-[42px] bg-gray-200 rounded-xl"></div>
                        </div>
                    </div>
                ) : (
                    /* Sales Buttons: Grid 3 (Export, Import, Trash) */
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-3">
                        <div className="h-[42px] bg-gray-200 rounded-xl"></div>
                        <div className="h-[42px] bg-gray-200 rounded-xl"></div>
                        <div className="w-12 h-[42px] bg-gray-200 rounded-xl"></div>
                    </div>
                )}
            </div>

            {/* List Items Skeleton */}
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center h-[82px]">
                        <div className="flex-1">
                            {/* Item Name */}
                            <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
                            {/* Date */}
                            <div className="h-3 w-1/3 bg-gray-100 rounded"></div>
                        </div>
                        <div className="flex gap-2">
                            {/* Stat Box 1 */}
                            <div className="min-w-[3.5rem] h-12 bg-gray-100 rounded-lg"></div>
                            {/* Stat Box 2 */}
                            <div className="min-w-[3.5rem] h-12 bg-gray-100 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
