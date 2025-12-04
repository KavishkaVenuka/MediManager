"use client";

import React from 'react';
import { BriefcaseMedical, Package, Home, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname?.startsWith(path);
    };

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/main-store', icon: Package, label: 'Main-Store' },
        { path: '/pharmacy', icon: BriefcaseMedical, label: 'Pharmacy' },
        { path: '/point-of-sale', icon: ShoppingCart, label: 'Point-of-sale' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            <div className="bg-white border-t border-gray-100 px-8 py-2 pb-5 flex justify-between items-center rounded-t-[2rem] shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">

                {navItems.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`
                                relative flex items-center justify-center
                                p-3 rounded-2xl transition-all duration-300 ease-out
                                ${active ? '-translate-y-6' : ''}
                            `}
                        >
                            {/* Animated Background Box */}
                            {active && (
                                <motion.div
                                    layoutId="active-nav-box"
                                    className="absolute inset-0 bg-teal-500 rounded-2xl shadow-xl shadow-teal-500/40 border-[6px] border-white"
                                    initial={false}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30
                                    }}
                                />
                            )}

                            {/* Icon */}
                            <span className="relative z-10">
                                <Icon
                                    size={active ? 24 : 26}
                                    strokeWidth={active ? 2.5 : 2}
                                    className={`transition-colors duration-200 ${active ? 'text-white' : 'text-gray-400 group-hover:text-teal-500'}`}
                                />
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* Safe area spacer for mobile */}
            <div className="h-4 bg-white" />
        </div>
    );
}