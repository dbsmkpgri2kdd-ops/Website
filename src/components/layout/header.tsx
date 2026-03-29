
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X, LogIn, DatabaseZap } from 'lucide-react';
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

  useEffect(() => {
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
    if (isUserLoading) return <Skeleton className={cn('h-10 w-10 sm:w-24 rounded-xl', className)} />;

    return (
      <Button
        onClick={handleAuthClick}
        variant={user ? "default" : "outline"}
        className={cn(
          "px-3 sm:px-6 h-10 rounded-xl font-black text-[9px] tracking-[0.2em] uppercase transition-all hover:scale-105 shadow-xl",
          !user && "border-white/10 hover:bg-white/5",
          className
        )}
      >
        {user ? (
            <span className='flex items-center gap-2'>
                <DatabaseZap size={14} /> <span className={cn(showLabel ? "inline" : "hidden")}>{showLabel && 'DASBOR'}</span>
            </span>
        ) : (
          <span className='flex items-center gap-2'>
            <LogIn size={14} /> <span className={cn(showLabel ? "inline" : "hidden")}>{showLabel && 'MASUK'}</span>
          </span>
        )}
      </Button>
    );
  };
  
  const currentMenu = schoolData?.customMenu || NAV_MENU_DEFAULT;

  const renderNavItems = (items: NavItem[]) => {
    return items.map((item, idx) => {
      if (item.children && item.children.length > 0) {
        return (
          <DropdownMenu key={idx}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 hover:text-primary transition-colors focus:outline-none">
                {item.label}
                <ChevronDown className="h-3 w-3 opacity-40" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2 rounded-2xl shadow-2xl border-white/5 bg-card/95 backdrop-blur-3xl">
              {item.children.map((child, cIdx) => (
                <DropdownMenuItem
                  key={cIdx}
                  onClick={() => child.id && setActiveTab(child.id)}
                  className='font-bold text-[9px] uppercase tracking-widest cursor-pointer rounded-xl py-3 px-4 focus:bg-primary/10 focus:text-primary mb-1 transition-all'
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
            className='px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 hover:text-primary transition-colors'
          >
            {item.label}
          </button>
        );
      }
    });
  };

  return (
    <header className={cn(
      "sticky top-0 w-full z-50 bg-background border-b border-white/5 transition-all duration-300",
      isScrolled ? "h-16 shadow-lg" : "h-20"
    )}>
      <div className="max-w-7xl mx-auto px-6 h-full">
        <div className="flex justify-between items-center h-full">
          {/* LOGO */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-9 h-9 overflow-hidden rounded-xl bg-white p-1.5 shadow-xl transition-transform group-hover:rotate-12 group-hover:scale-110">
              {isSchoolDataLoading ? (
                <Skeleton className="w-full h-full rounded-lg" />
              ) : (
                <Image
                  src={convertGoogleDriveLink(schoolData?.logoUrl || "https://picsum.photos/seed/logo/40/40")}
                  alt="Logo Sekolah"
                  width={36}
                  height={36}
                  className="object-contain"
                  priority
                />
              )}
            </div>
            <div className="flex flex-col items-start leading-none hidden sm:flex">
                <span className="font-black text-sm tracking-tight uppercase">
                {schoolData?.shortName || "SMKS PGRI 2"}
                </span>
                <span className='text-[7px] font-bold text-primary uppercase tracking-[0.4em] mt-0.5'>Digital Excellence</span>
            </div>
          </button>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center space-x-1">
             {renderNavItems(currentMenu)}
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-3">
             {/* AKSES LOGIN MOBILE & DESKTOP */}
             <AuthButton className="flex" showLabel={true} />
             
             <ThemeToggle />
             
             {/* SIDEBAR MOBILE TRIGGER */}
             <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 sm:h-10 sm:w-10 hover:bg-white/5">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 w-full sm:w-[400px] border-none shadow-3xl bg-background/95 backdrop-blur-3xl">
                    <SheetHeader className="p-8 border-b border-white/5">
                        <div className="flex items-center gap-3 text-primary mb-4">
                          <DatabaseZap size={18} />
                          <span className='text-[9px] font-black uppercase tracking-[0.4em]'>Portal Core v7.5</span>
                        </div>
                        <SheetTitle className='text-left font-black text-3xl uppercase tracking-tighter italic'>MENU PORTAL</SheetTitle>
                    </SheetHeader>
                    
                    <ScrollArea className='h-[calc(100vh-180px)] py-6'>
                        {currentMenu.map((mainItem, mIdx) => (
                          <div key={mIdx} className="px-8 mb-8">
                            <h3 className="px-2 text-[8px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 mb-4">{mainItem.label}</h3>
                            {mainItem.children ? (
                              <div className="grid grid-cols-1 gap-1">
                                {mainItem.children.map((child, cIdx) => (
                                  <button
                                    key={cIdx}
                                    onClick={() => { child.id && setActiveTab(child.id); setIsMenuOpen(false); }}
                                    className="w-full text-left py-3.5 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 hover:text-primary transition-all"
                                  >
                                    {child.label}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <button
                                onClick={() => { mainItem.id && setActiveTab(mainItem.id); setIsMenuOpen(false); }}
                                className="w-full text-left py-3.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:text-primary transition-all"
                              >
                                {mainItem.label}
                              </button>
                            )}
                          </div>
                        ))}
                    </ScrollArea>
                    
                    <div className="p-8 border-t border-white/5 bg-white/5">
                        <AuthButton className="w-full h-14 text-sm" showLabel={true} />
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
