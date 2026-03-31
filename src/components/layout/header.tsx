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
          "px-4 h-10 rounded-lg font-bold text-xs transition-all",
          !user && "border-input hover:bg-muted",
          className
        )}
      >
        {user ? (
            <span className='flex items-center gap-2'>
                <LayoutGrid size={14} /> <span className={cn(showLabel ? "inline" : "hidden")}>{showLabel && 'Dasbor'}</span>
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
              <button className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors focus:outline-none">
                {item.label}
                <ChevronDown className="h-3 w-3 opacity-40" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 p-1.5 rounded-xl shadow-xl border-border bg-popover">
              {item.children.map((child, cIdx) => (
                <DropdownMenuItem
                  key={cIdx}
                  onClick={() => child.id && setActiveTab(child.id)}
                  className='font-medium text-xs cursor-pointer rounded-lg py-2.5 px-3 focus:bg-primary/10 focus:text-primary transition-all'
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
            className='px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors'
          >
            {item.label}
          </button>
        );
      }
    });
  };

  return (
    <header className={cn(
      "sticky top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300",
      isScrolled ? "h-16 shadow-sm" : "h-20"
    )}>
      <div className="max-w-7xl mx-auto px-6 h-full">
        <div className="flex justify-between items-center h-full">
          {/* LOGO */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-10 h-10 overflow-hidden rounded-lg bg-primary/5 p-1.5 transition-transform group-hover:scale-105">
              {!mounted || isSchoolDataLoading ? (
                <Skeleton className="w-full h-full rounded-md" />
              ) : (
                <Image
                  src={convertGoogleDriveLink(schoolData?.logoUrl || "https://picsum.photos/seed/logo/40/40")}
                  alt="Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                  unoptimized
                />
              )}
            </div>
            <div className="flex flex-col items-start leading-tight hidden sm:flex text-left">
                <span className="font-bold text-sm text-foreground tracking-tight">
                {!mounted ? "SMKS PGRI 2" : (schoolData?.shortName || "SMKS PGRI 2")}
                </span>
                <span className='text-[10px] font-semibold text-muted-foreground'>Portal Digital</span>
            </div>
          </button>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center space-x-1">
             {mounted && renderNavItems(currentMenu)}
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-3">
             <AuthButton className="hidden sm:flex" />
             <ThemeToggle />
             <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-lg h-10 w-10 bg-muted hover:bg-muted/80">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 w-full sm:w-[350px] border-none shadow-2xl bg-background">
                    <SheetHeader className="p-6 border-b border-border text-left">
                        <SheetTitle className='font-bold text-xl'>Menu Utama</SheetTitle>
                    </SheetHeader>
                    
                    <ScrollArea className='h-[calc(100vh-160px)] py-4'>
                        {mounted && currentMenu.map((mainItem, mIdx) => (
                          <div key={mIdx} className="px-6 mb-6">
                            <h3 className="px-2 text-[10px] font-bold tracking-widest text-muted-foreground mb-2 uppercase">{mainItem.label}</h3>
                            {mainItem.children ? (
                              <div className="grid grid-cols-1 gap-0.5">
                                {mainItem.children.map((child, cIdx) => (
                                  <button
                                    key={cIdx}
                                    onClick={() => { child.id && setActiveTab(child.id); setIsMenuOpen(false); }}
                                    className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-medium hover:bg-muted transition-all"
                                  >
                                    {child.label}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <button
                                onClick={() => { mainItem.id && setActiveTab(mainItem.id); setIsMenuOpen(false); }}
                                className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-medium hover:bg-muted transition-all"
                              >
                                {mainItem.label}
                              </button>
                            )}
                          </div>
                        ))}
                    </ScrollArea>
                    
                    <div className="p-6 border-t border-border bg-muted/20">
                        <AuthButton className="w-full h-14 text-sm rounded-2xl shadow-lg" />
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