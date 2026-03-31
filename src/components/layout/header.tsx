'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, LogIn, LayoutGrid } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { NAV_MENU_DEFAULT, type NavItem, type School } from '@/lib/data';
import type { NavLink } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn, convertGoogleDriveLink, getDashboardByRole } from '@/lib/utils';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/theme-toggle';
import { ScrollArea } from '@/components/ui/scroll-area';

type HeaderProps = {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  setActiveTab: (tab: NavLink) => void;
  schoolData: School | null;
  isSchoolDataLoading: boolean;
};

const Header = ({
  isMenuOpen,
  setIsMenuOpen,
  setActiveTab,
  schoolData,
  isSchoolDataLoading,
}: HeaderProps) => {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthClick = () => {
    if (user) {
      const dashboardUrl = getDashboardByRole(user.profile?.role);
      router.push(dashboardUrl);
    } else {
      router.push('/login');
    }
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const AuthButton = ({ className, showLabel = true }: { className?: string, showLabel?: boolean }) => {
    if (!mounted || isUserLoading) return <Skeleton className={cn('h-10 w-10 sm:w-24 rounded-lg', className)} />;

    return (
      <Button
        onClick={handleAuthClick}
        variant={user ? "default" : "outline"}
        className={cn(
          "px-4 h-10 rounded-xl font-bold text-xs transition-all",
          user ? "bg-primary text-white shadow-lg shadow-blue-100" : "border-input hover:bg-muted",
          className
        )}
      >
        {user ? (
            <span className='flex items-center gap-2'>
                <LayoutGrid size={14} /> <span className={cn(showLabel ? "inline" : "hidden")}>{showLabel && 'Dashboard'}</span>
            </span>
        ) : (
          <span className='flex items-center gap-2'>
            <LogIn size={14} /> <span className={cn(showLabel ? "inline" : "hidden")}>{showLabel && 'Masuk'}</span>
          </span>
        )}
      </Button>
    );
  };
  
  const currentMenu = (schoolData?.customMenu || NAV_MENU_DEFAULT).filter(item => item.id !== 'exambro');

  const renderNavItems = (items: NavItem[]) => {
    return items.map((item, idx) => {
      if (item.children && item.children.length > 0) {
        return (
          <DropdownMenu key={idx}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors focus:outline-none uppercase tracking-wide">
                {item.label}
                <ChevronDown className="h-3.5 w-3.5 opacity-40" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 p-2 rounded-2xl shadow-2xl border-border bg-white mt-2">
              {item.children.map((child, cIdx) => (
                <DropdownMenuItem
                  key={cIdx}
                  onClick={() => child.id && setActiveTab(child.id)}
                  className='font-bold text-[11px] cursor-pointer rounded-xl py-3 px-4 focus:bg-blue-50 focus:text-primary transition-all uppercase tracking-wider'
                >
                  {child.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      } else {
        return (
          <button
            key={idx}
            onClick={() => item.id && setActiveTab(item.id)}
            className='px-4 py-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors uppercase tracking-wide'
          >
            {item.label}
          </button>
        );
      }
    });
  };

  return (
    <header className={cn(
      "sticky top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all duration-500",
      isScrolled ? "h-16 shadow-sm" : "h-24"
    )}>
      <div className="max-w-7xl mx-auto px-6 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-4 group"
          >
            <div className="relative w-12 h-12 overflow-hidden rounded-2xl bg-blue-50 p-2 transition-all duration-500 group-hover:scale-110 shadow-sm border border-blue-100">
              {!mounted || isSchoolDataLoading ? (
                <Skeleton className="w-full h-full rounded-md" />
              ) : (
                <Image
                  src={convertGoogleDriveLink(schoolData?.logoUrl || "https://picsum.photos/seed/logo/40/40")}
                  alt="Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                  priority
                  unoptimized
                />
              )}
            </div>
            <div className="flex flex-col items-start leading-tight hidden sm:flex text-left">
                <span className="font-black text-base text-slate-900 tracking-tighter uppercase italic">
                {!mounted ? "SMKS PGRI 2" : (schoolData?.shortName || "SMKS PGRI 2")}
                </span>
                <span className='text-[9px] font-black text-primary uppercase tracking-[0.3em]'>Digital Hub</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-2">
             {mounted && renderNavItems(currentMenu)}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
             <AuthButton className="hidden sm:flex" />
             <div className='h-8 w-px bg-slate-100 mx-1 hidden sm:block'></div>
             <ThemeToggle />
             <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl h-11 w-11 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-primary transition-all">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 w-full sm:w-[400px] border-none shadow-3xl bg-white">
                    <SheetHeader className="p-8 border-b border-slate-100 text-left bg-blue-50/30">
                        <SheetTitle className='font-black text-2xl tracking-tighter uppercase italic'>Menu Utama</SheetTitle>
                    </SheetHeader>
                    
                    <ScrollArea className='h-[calc(100vh-180px)] py-8'>
                        {mounted && currentMenu.map((mainItem, mIdx) => (
                          <div key={mIdx} className="px-8 mb-8">
                            <h3 className="px-3 text-[10px] font-black tracking-[0.3em] text-primary mb-4 uppercase">{mainItem.label}</h3>
                            {mainItem.children ? (
                              <div className="grid grid-cols-1 gap-1">
                                {mainItem.children.map((child, cIdx) => (
                                  <button
                                    key={cIdx}
                                    onClick={() => { child.id && setActiveTab(child.id); setIsMenuOpen(false); }}
                                    className="w-full text-left py-3.5 px-4 rounded-2xl text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-primary transition-all uppercase tracking-wide"
                                  >
                                    {child.label}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <button
                                onClick={() => { mainItem.id && setActiveTab(mainItem.id); setIsMenuOpen(false); }}
                                className="w-full text-left py-3.5 px-4 rounded-2xl text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-primary transition-all uppercase tracking-wide"
                              >
                                {mainItem.label}
                              </button>
                            )}
                          </div>
                        ))}
                    </ScrollArea>
                    
                    <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                        <AuthButton className="w-full h-16 text-sm rounded-2xl shadow-2xl bg-primary text-white" />
                    </div>
                </SheetContent>
              </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;