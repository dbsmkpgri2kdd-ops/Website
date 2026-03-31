
'use client';
import { Home, Newspaper, UserPlus, LayoutGrid } from 'lucide-react';
import type { NavLink } from '@/lib/data';
import { cn } from '@/lib/utils';

type BottomNavProps = {
  activeTab: NavLink;
  setActiveTab: (tab: NavLink) => void;
  setIsMenuOpen: (isOpen: boolean) => void;
};

/**
 * Bilah navigasi bawah khusus mobile.
 */
export default function BottomNav({ activeTab, setActiveTab, setIsMenuOpen }: BottomNavProps) {
  const navItems = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'berita-pengumuman', label: 'Berita', icon: Newspaper },
    { id: 'ppdb-online', label: 'PPDB', icon: UserPlus },
  ];

  const handleNavClick = (tab: NavLink) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full bg-background/95 backdrop-blur-2xl border-t border-white/10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)]">
      <div className="h-16 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id as NavLink)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 transition-all duration-300",
                isActive ? "text-primary scale-110" : "text-muted-foreground opacity-60"
              )}
            >
              <item.icon className={cn("w-5 h-5 mb-1", isActive ? "stroke-[2.5px]" : "stroke-2")} />
              <span className="text-[10px] font-bold tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
        
        {/* AKSES MENU (Hamburger) */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="flex flex-col items-center justify-center flex-1 text-muted-foreground opacity-60 hover:opacity-100 active:scale-95"
        >
          <LayoutGrid className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold tracking-tight">Menu</span>
        </button>
      </div>
    </div>
  );
}
