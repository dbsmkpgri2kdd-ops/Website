'use client';
import { Home, Newspaper, UserPlus, LayoutGrid } from 'lucide-react';
import type { NavLink } from '@/lib/data';
import { cn } from '@/lib/utils';

type BottomNavProps = {
  activeTab: NavLink;
  setActiveTab: (tab: NavLink) => void;
  setIsMenuOpen: (isOpen: boolean) => void;
};

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
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-20 bg-background/95 backdrop-blur-lg border-t border-border/50 pb-safe">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id as NavLink)}
              className={cn(
                "inline-flex flex-col items-center justify-center px-2 group transition-all relative",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl mb-1 transition-all",
                isActive ? "bg-primary/10" : "group-hover:bg-muted"
              )}>
                <item.icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
              </div>
              <span className={cn("text-[10px] font-bold tracking-tight uppercase", isActive ? "opacity-100" : "opacity-70")}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full" />
              )}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="inline-flex flex-col items-center justify-center px-2 text-muted-foreground hover:text-foreground group transition-all"
        >
          <div className="p-2 rounded-xl mb-1 group-hover:bg-muted transition-all">
            <LayoutGrid className="w-5 h-5 stroke-[2px]" />
          </div>
          <span className="text-[10px] font-bold tracking-tight opacity-70 uppercase">Menu</span>
        </button>
      </div>
    </div>
  );
}
