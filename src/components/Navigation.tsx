'use client';
import Link from 'next/link';
import { Activity } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="w-full border-b border-gray-800 bg-[#050505] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 text-white font-bold tracking-tight text-xl">
            <Activity className="text-red-500" size={24} /> BlastRadius
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-mono">
            <Link href="/" className={`${pathname === '/' ? 'text-white' : 'text-gray-500 hover:text-gray-300'} transition-colors`}>
              Product
            </Link>
            <Link href="/#how-it-works" className="text-gray-500 hover:text-gray-300 transition-colors">
              How It Works
            </Link>
            <Link href="/analyze" className={`${pathname === '/analyze' ? 'text-white' : 'text-gray-500 hover:text-gray-300'} transition-colors`}>
              Analysis
            </Link>
          </div>
        </div>
        
        <Link 
          href="/analyze"
          className="bg-white text-black font-semibold font-mono text-xs py-2 px-4 rounded hover:bg-gray-200 transition-colors"
        >
          Analyze Repository
        </Link>
      </div>
    </nav>
  );
}
