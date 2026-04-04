'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, LogIn, LayoutGrid, X } from 'lucide-react';
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
    window.addEventListener('scroll', handleScroll, { passive: true });
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

  const AuthButton = ({ className, showText = false }: { className?: string, showText?: boolean }) => {
    if (!mounted || isUserLoading) return <Skeleton className={cn('h-9 rounded-lg', className?.includes('w-full') ? 'w-full h-12' : 'w-9')} />;

    const isFullWidth = className?.includes('w-full');

    return (
      <Button
        onClick={handleAuthClick}
        variant={user ? "default" : "accent"}
        size={isFullWidth || (showText && !isFullWidth) ? "default" : "icon"}
        aria-label={user ? "Dashboard" : "Masuk"}
        className={cn(
          "h-10 rounded-xl transition-all shrink-0 font-bold text-xs",
          !isFullWidth && !showText && "w-10",
          user ? "bg-primary text-white" : "bg-accent text-accent-foreground",
          className
        )}
      >
        {user ? (
          <>
            <LayoutGrid size={18} className={cn((isFullWidth || showText) && "mr-2")} />
            {(isFullWidth || showText) && <span>Dashboard</span>}
          </>
        ) : (
          <>
            <LogIn size={18} className={cn((isFullWidth || showText) && "mr-2")} />
            {(isFullWidth || showText) && <span>Masuk</span>}
          </>
        )}
      </Button>
    );
  };
  
  const currentMenu = schoolData?.customMenu || NAV_MENU_DEFAULT;
  const defaultLogo = 'https://firebasestorage.googleapis.com/v0/b/firebasestudio-images/o/user-uploaded-image.png?alt=media';

  const handleNavigate = (tab?: NavLink) => {
    if (!tab) return;
    setActiveTab(tab);
    if (isMenuOpen) setIsMenuOpen(false);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderNavItems = (items: NavItem[]) => {
    return items.map((item, idx) => {
      if (item.children && item.children.length > 0) {
        return (
          <DropdownMenu key={idx}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold text-slate-600 hover:text-primary transition-all focus:outline-none">
                {item.label}
                <ChevronDown className="h-3 w-3 opacity-40" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2 rounded-2xl shadow-xl border-slate-100 bg-white mt-4 animate-reveal">
              {item.children.map((child, cIdx) => (
                <DropdownMenuItem
                  key={cIdx}
                  onClick={() => handleNavigate(child.id)}
                  className='font-bold text-[12px] cursor-pointer rounded-xl py-2.5 px-4 focus:bg-primary/5 focus:text-primary transition-all'
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
            onClick={() => handleNavigate(item.id)}
            className='px-4 py-2 text-[13px] font-bold text-slate-600 hover:text-primary transition-all'
          >
            {item.label}
          </button>
        );
      }
    });
  };

  return (
    <header className={cn(
      "sticky top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all duration-300",
      isScrolled ? "h-16" : "h-24"
    )}>
      <div className="max-w-7xl mx-auto px-6 h-full">
        <nav className="flex justify-between items-center h-full">
          <button
            onClick={() => setActiveTab('home')}
            aria-label="Beranda"
            className="flex items-center gap-3.5 group"
          >
            <div className="relative w-10 h-10 overflow-hidden rounded-2xl bg-primary/5 p-1 transition-all duration-300 group-hover:scale-105 border border-primary/5 shadow-inner">
              {!mounted || isSchoolDataLoading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : (
                <Image
                  src={convertGoogleDriveLink(schoolData?.logoUrl || defaultLogo)}
                  alt="Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                  unoptimized
                />
              )}
            </div>
            <div className="flex flex-col items-start leading-none text-left">
                <span className="font-extrabold text-[16px] text-slate-900 tracking-tight">
                {!mounted ? "SMKS PGRI 2" : (schoolData?.shortName || "SMKS PGRI 2")}
                </span>
            </div>
          </button>

          <div className="hidden lg:flex items-center space-x-1">
             {mounted && renderNavItems(currentMenu)}
          </div>

          <div className="flex items-center gap-3">
             <AuthButton className="h-9 sm:h-10" />
             <div className='h-8 w-px bg-slate-100 mx-1 hidden sm:block'></div>
             <ThemeToggle />
             <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Buka Menu" className="rounded-xl h-10 w-10 bg-slate-50 hover:bg-primary/5 text-slate-600 hover:text-primary transition-all">
                    <Menu size={22} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 w-full sm:w-[350px] border-none shadow-2xl bg-white">
                    <SheetHeader className="p-10 border-b border-slate-50 text-left bg-slate-50/20">
                        <SheetTitle className='font-extrabold text-2xl tracking-tight text-slate-900'>Menu navigasi</SheetTitle>
                    </SheetHeader>
                    
                    <ScrollArea className='h-[calc(100vh-200px)] py-8'>
                        {mounted && currentMenu.map((mainItem, mIdx) => (
                          <div key={mIdx} className="px-10 mb-10">
                            <h3 className="px-4 text-[10px] font-black tracking-widest text-primary mb-5 opacity-40 uppercase">{mainItem.label}</h3>
                            {mainItem.children ? (
                              <div className="grid grid-cols-1 gap-1.5">
                                {mainItem.children.map((child, cIdx) => (
                                  <button
                                    key={cIdx}
                                    onClick={() => { handleNavigate(child.id); }}
                                    className="w-full text-left py-3.5 px-5 rounded-2xl text-[14px] font-bold text-slate-700 hover:bg-primary/5 hover:text-primary transition-all"
                                  >
                                    {child.label}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <button
                                onClick={() => { handleNavigate(mainItem.id); }}
                                className="w-full text-left py-3.5 px-5 rounded-2xl text-[14px] font-bold text-slate-700 hover:bg-primary/5 hover:text-primary transition-all"
                              >
                                {mainItem.label}
                              </button>
                            )}
                          </div>
                        ))}
                    </ScrollArea>
                    
                    <div className="p-10 border-t border-slate-50">
                        <AuthButton className="w-full h-14 rounded-2xl shadow-xl glow-primary" showText={true} />
                    </div>
                </SheetContent>
              </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;