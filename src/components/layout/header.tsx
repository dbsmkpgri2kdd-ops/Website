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

  const AuthButton = ({ className }: { className?: string }) => {
    if (!mounted || isUserLoading) return <Skeleton className={cn('h-9 w-9 rounded-lg', className)} />;

    return (
      <Button
        onClick={handleAuthClick}
        variant={user ? "default" : "outline"}
        size="icon"
        className={cn(
          "h-9 w-9 rounded-lg transition-all shrink-0",
          user ? "bg-primary text-white shadow-sm border-none" : "border-slate-200 text-slate-600 hover:bg-slate-50",
          className
        )}
      >
        {user ? <LayoutGrid size={18} /> : <LogIn size={18} />}
      </Button>
    );
  };
  
  const currentMenu = (schoolData?.customMenu || NAV_MENU_DEFAULT).filter(item => item.id !== 'exambro');
  const defaultLogo = 'https://firebasestorage.googleapis.com/v0/b/firebasestudio-images/o/user-uploaded-image.png?alt=media';

  const renderNavItems = (items: NavItem[]) => {
    return items.map((item, idx) => {
      if (item.children && item.children.length > 0) {
        return (
          <DropdownMenu key={idx}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-3 py-2 text-[10.5px] font-bold text-slate-600 hover:text-primary transition-all focus:outline-none tracking-tight">
                {item.label}
                <ChevronDown className="h-3 w-3 opacity-40" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 p-1.5 rounded-xl shadow-xl border-slate-100 bg-white mt-4 animate-reveal">
              {item.children.map((child, cIdx) => (
                <DropdownMenuItem
                  key={cIdx}
                  onClick={() => child.id && setActiveTab(child.id)}
                  className='font-bold text-[10px] cursor-pointer rounded-lg py-2 px-3 focus:bg-primary/5 focus:text-primary transition-all tracking-tight'
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
            className='px-3 py-2 text-[10.5px] font-bold text-slate-600 hover:text-primary transition-all tracking-tight'
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
      isScrolled ? "h-14" : "h-20"
    )}>
      <div className="max-w-7xl mx-auto px-6 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-9 h-9 overflow-hidden rounded-xl bg-primary/5 p-1 transition-all duration-300 group-hover:scale-105 border border-primary/5">
              {!mounted || isSchoolDataLoading ? (
                <Skeleton className="w-full h-full rounded-lg" />
              ) : (
                <Image
                  src={convertGoogleDriveLink(schoolData?.logoUrl || defaultLogo)}
                  alt="Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                  priority
                  unoptimized
                />
              )}
            </div>
            <div className="flex flex-col items-start leading-tight text-left">
                <span className="font-bold text-[13px] text-slate-900 tracking-tighter uppercase">
                {!mounted ? "SMKS PGRI 2" : (schoolData?.shortName || "SMKS PGRI 2")}
                </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-0.5">
             {mounted && renderNavItems(currentMenu)}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
             <AuthButton className="hidden md:flex" />
             <div className='h-6 w-px bg-slate-100 mx-1 hidden md:block'></div>
             <ThemeToggle />
             <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9 bg-slate-50 hover:bg-primary/5 text-slate-600 hover:text-primary transition-all">
                    <Menu size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 w-full sm:w-[320px] border-none shadow-2xl bg-white">
                    <SheetHeader className="p-8 border-b border-slate-50 text-left bg-slate-50/20">
                        <SheetTitle className='font-bold text-xl tracking-tighter uppercase font-headline text-slate-900'>Navigasi</SheetTitle>
                    </SheetHeader>
                    
                    <ScrollArea className='h-[calc(100vh-180px)] py-6'>
                        {mounted && currentMenu.map((mainItem, mIdx) => (
                          <div key={mIdx} className="px-8 mb-8">
                            <h3 className="px-3 text-[9px] font-black tracking-[0.3em] text-primary mb-4 uppercase opacity-40">{mainItem.label}</h3>
                            {mainItem.children ? (
                              <div className="grid grid-cols-1 gap-1">
                                {mainItem.children.map((child, cIdx) => (
                                  <button
                                    key={cIdx}
                                    onClick={() => { child.id && setActiveTab(child.id); setIsMenuOpen(false); }}
                                    className="w-full text-left py-3 px-4 rounded-xl text-[10px] font-bold text-slate-700 hover:bg-primary/5 hover:text-primary transition-all uppercase tracking-tight"
                                  >
                                    {child.label}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <button
                                onClick={() => { mainItem.id && setActiveTab(mainItem.id); setIsMenuOpen(false); }}
                                className="w-full text-left py-3 px-4 rounded-xl text-[10px] font-bold text-slate-700 hover:bg-primary/5 hover:text-primary transition-all uppercase tracking-tight"
                              >
                                {mainItem.label}
                              </button>
                            )}
                          </div>
                        ))}
                    </ScrollArea>
                    
                    <div className="p-8 border-t border-slate-50">
                        <AuthButton className="w-full h-12 rounded-xl bg-accent text-accent-foreground border-none font-bold text-[10px] uppercase tracking-widest" />
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