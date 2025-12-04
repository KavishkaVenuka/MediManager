"use client";

import { ReactNode } from 'react';
import { useState } from 'react';

import Link from 'next/link';

interface DashboardCardProps {
    title: string;
    icon: ReactNode;
    color?: string;
    href?: string;
}

export default function DashboardCard({ title, icon, color = "text-primary-teal", href }: DashboardCardProps) {
    const [isClicked, setIsClicked] = useState(false);

    const CardContent = (
        <div
            onClick={() => setIsClicked(!isClicked)}
            className="group bg-white p-6 rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center aspect-square gap-3 active:scale-[0.98] hover:scale-105 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:bg-gray-50 transition-all duration-300 ease-out cursor-pointer min-h-[140px]"
        >
            <div className={`${color} group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <span className={`font-semibold text-base text-center transition-colors duration-300 leading-tight ${isClicked ? 'text-primary-teal' : 'text-gray-800 group-hover:text-primary-teal'}`}>
                {title}
            </span>
        </div>
    );

    if (href) {
        return <Link href={href} className="block">{CardContent}</Link>;
    }

    return CardContent;
}
