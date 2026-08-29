'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { Activity } from 'lucide-react';
import { usePathname } from 'next/navigation';
export default function Navigation() {
    const pathname = usePathname();
    return (_jsx("nav", { className: "w-full border-b border-gray-800 bg-[#050505] sticky top-0 z-50", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-8", children: [_jsxs(Link, { href: "/", className: "flex items-center gap-3 text-white font-bold tracking-tight text-xl", children: [_jsx(Activity, { className: "text-red-500", size: 24 }), " BlastRadius"] }), _jsxs("div", { className: "hidden md:flex items-center gap-6 text-sm font-mono", children: [_jsx(Link, { href: "/", className: `${pathname === '/' ? 'text-white' : 'text-gray-500 hover:text-gray-300'} transition-colors`, children: "Product" }), _jsx(Link, { href: "/#how-it-works", className: "text-gray-500 hover:text-gray-300 transition-colors", children: "How It Works" }), _jsx(Link, { href: "/analyze", className: `${pathname === '/analyze' ? 'text-white' : 'text-gray-500 hover:text-gray-300'} transition-colors`, children: "Analysis" })] })] }), _jsx(Link, { href: "/analyze", className: "bg-white text-black font-semibold font-mono text-xs py-2 px-4 rounded hover:bg-gray-200 transition-colors", children: "Analyze Repository" })] }) }));
}
