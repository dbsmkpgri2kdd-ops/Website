
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
    if (!mounted || isUserLoading) return <Skeleton className={cn('h-11 w-11 rounded-xl', className)} />;

    return (
      <Button
        onClick={handleAuthClick}
        variant={user ? "default" : "outline"}
        size="icon"
        className={cn(
          "h-11 w-11 rounded-xl transition-all shrink-0",
          user ? "bg-primary text-white shadow-xl glow-primary border-none" : "border-slate-200 text-slate-600 hover:bg-slate-50",
          className
        )}
      >
        {user ? <LayoutGrid size={20} /> : <LogIn size={20} />}
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
              <button className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-black text-slate-700 hover:text-primary transition-colors focus:outline-none uppercase tracking-widest">
                {item.label}
                <ChevronDown className="h-3 w-3 opacity-40" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2 rounded-2xl shadow-3xl border-slate-100 bg-white mt-4 animate-reveal">
              {item.children.map((child, cIdx) => (
                <DropdownMenuItem
                  key={cIdx}
                  onClick={() => child.id && setActiveTab(child.id)}
                  className='font-bold text-[10px] cursor-pointer rounded-xl py-3.5 px-4 focus:bg-primary/5 focus:text-primary transition-all uppercase tracking-widest'
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
            className='px-4 py-2 text-[11px] font-black text-slate-700 hover:text-primary transition-colors uppercase tracking-widest'
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
            <div className="relative w-12 h-12 overflow-hidden rounded-2xl bg-primary/5 p-1.5 transition-all duration-500 group-hover:scale-110 shadow-sm border border-primary/10">
              {!mounted || isSchoolDataLoading ? (
                <Skeleton className="w-full h-full rounded-md" />
              ) : (
                <Image
                  src={convertGoogleDriveLink(schoolData?.logoUrl || defaultLogo)}
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
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-1">
             {mounted && renderNavItems(currentMenu)}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
             <AuthButton className="hidden md:flex" />
             <div className='h-8 w-px bg-slate-100 mx-1 hidden md:block'></div>
             <ThemeToggle />
             <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl h-11 w-11 bg-slate-50 hover:bg-primary/5 text-slate-600 hover:text-primary transition-all">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 w-full sm:w-[400px] border-none shadow-3xl bg-white">
                    <SheetHeader className="p-10 border-b border-slate-100 text-left bg-slate-50/30">
                        <SheetTitle className='font-black text-3xl tracking-tighter uppercase italic font-headline text-slate-900'>Navigasi Utama</SheetTitle>
                    </SheetHeader>
                    
                    <ScrollArea className='h-[calc(100vh-200px)] py-8'>
                        {mounted && currentMenu.map((mainItem, mIdx) => (
                          <div key={mIdx} className="px-10 mb-10">
                            <h3 className="px-4 text-[10px] font-black tracking-[0.4em] text-primary mb-5 uppercase">{mainItem.label}</h3>
                            {mainItem.children ? (
                              <div className="grid grid-cols-1 gap-1.5">
                                {mainItem.children.map((child, cIdx) => (
                                  <button
                                    key={cIdx}
                                    onClick={() => { child.id && setActiveTab(child.id); setIsMenuOpen(false); }}
                                    className="w-full text-left py-4 px-5 rounded-2xl text-[11px] font-black text-slate-700 hover:bg-primary/5 hover:text-primary transition-all uppercase tracking-widest"
                                  >
                                    {child.label}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <button
                                onClick={() => { mainItem.id && setActiveTab(mainItem.id); setIsMenuOpen(false); }}
                                className="w-full text-left py-4 px-5 rounded-2xl text-[11px] font-black text-slate-700 hover:bg-primary/5 hover:text-primary transition-all uppercase tracking-widest"
                              >
                                {mainItem.label}
                              </button>
                            )}
                          </div>
                        ))}
                    </ScrollArea>
                    
                    <div className="p-10 border-t border-slate-100 bg-slate-50/50">
                        <AuthButton className="w-full h-16 rounded-2xl shadow-3xl bg-accent text-accent-foreground border-none" />
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
