'use client';

import React from 'react';
import { LogIn, ChevronDown, User, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { NAV_MENU, type NavItem, type School } from '@/lib/data';
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
  const { user, isLoading: isAuthLoading } = useUser();
  const router = useRouter();

  const handleAuthClick = () => {
    if (user) {
      const dashboardUrl = getDashboardByRole(user.profile?.role);
      router.push(dashboardUrl);
    } else {
      router.push('/login');
    }
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  const AuthButton = ({ className }: { className?: string }) => {
    if (isAuthLoading) {
      return <Skeleton className={cn('h-10 w-28 rounded-full', className)} />;
    }

    return (
      <Button
        onClick={handleAuthClick}
        className={cn("font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all rounded-full px-6", className)}
      >
        {user ? (
          <>
            <User className="mr-2 h-4 w-4" />
            Dashboard
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </>
        )}
      </Button>
    );
  };
  
  const renderNavItems = (items: NavItem[]) => {
    return items.map((item) => {
      if (item.children && item.children.length > 0) {
        return (
          <DropdownMenu key={item.label}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="font-bold transition-all text-sm px-4 hover:text-primary data-[state=open]:text-primary data-[state=open]:bg-primary/5 rounded-full">
                {item.label}
                <ChevronDown className="ml-1 h-4 w-4 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 p-3 rounded-2xl shadow-2xl border-primary/5 bg-card/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
              {item.children.map((child) => (
                <DropdownMenuItem
                  key={child.id}
                  onClick={() => setActiveTab(child.id!)}
                  className='font-bold cursor-pointer rounded-xl py-3 px-4 focus:bg-primary/10 focus:text-primary mb-1 last:mb-0 transition-colors'
                >
                  <child.icon className="mr-3 h-5 w-5 text-primary/60" />
                  {child.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      } else {
        return (
          <Button
            key={item.id}
            variant="ghost"
            onClick={() => setActiveTab(item.id!)}
            className='font-bold transition-all text-sm px-4 hover:text-primary rounded-full'
          >
            {item.label}
          </Button>
        );
      }
    });
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 lg:h-20 items-center">
          {/* Brand Logo */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="relative w-9 h-9 lg:w-11 lg:h-11 overflow-hidden rounded-xl bg-white p-1.5 shadow-xl shadow-primary/5 border border-primary/5 group-hover:scale-110 transition-transform duration-500">
              {isSchoolDataLoading ? (
                <Skeleton className="w-full h-full rounded-lg" />
              ) : (
                <Image
                  src={convertGoogleDriveLink(schoolData?.logoUrl || "https://picsum.photos/seed/logo/40/40")}
                  alt="School Logo"
                  fill
                  className="object-contain"
                  unoptimized
                  priority
                />
              )}
            </div>
            <div className="flex flex-col items-start text-left">
              {isSchoolDataLoading ? (
                <Skeleton className="h-5 w-24 lg:w-32" />
              ) : (
                <span className="font-black text-base lg:text-xl leading-none font-headline group-hover:text-primary transition-colors tracking-tight">
                  {schoolData?.shortName}
                </span>
              )}
            </div>
          </button>

          {/* Main Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center px-8">
             {renderNavItems(NAV_MENU)}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
             <ThemeToggle />
             <div className="h-8 w-[1px] bg-primary/10 mx-2"></div>
             <AuthButton />
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-2">
             <ThemeToggle />
             <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors">
                    <Menu className="h-5 w-5 text-primary" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col p-0 w-[85%] max-w-sm border-l-primary/10 bg-card">
                    <SheetHeader className="p-6 border-b bg-muted/20">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-white p-1.5 rounded-xl border border-primary/5 shadow-2xl relative">
                              <Image 
                                src={convertGoogleDriveLink(schoolData?.logoUrl || "https://picsum.photos/seed/logo/40/40")} 
                                alt="Logo" 
                                fill 
                                className="object-contain"
                                unoptimized
                              />
                           </div>
                           <SheetTitle className='font-black text-xl font-headline text-primary tracking-tight'>{schoolData?.shortName || "Menu"}</SheetTitle>
                        </div>
                    </SheetHeader>
                    
                    <ScrollArea className='flex-grow py-4'>
                        {NAV_MENU.map((mainItem) => (
                          <div key={mainItem.label} className="px-4 mb-4">
                            {mainItem.children ? (
                              <div className="space-y-1">
                                <h3 className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">{mainItem.label}</h3>
                                {mainItem.children.map((child) => (
                                  <Button
                                    key={child.id}
                                    variant={'ghost'}
                                    onClick={() => {
                                      setActiveTab(child.id!);
                                      setIsMenuOpen(false);
                                    }}
                                    className="w-full justify-start py-3 px-4 flex items-center gap-3 rounded-xl text-sm h-auto font-bold hover:bg-primary/5 hover:text-primary transition-all group"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                      <child.icon size={16} />
                                    </div>
                                    {child.label}
                                  </Button>
                                ))}
                              </div>
                            ) : (
                              <Button
                                key={mainItem.id}
                                variant={'ghost'}
                                onClick={() => {
                                  setActiveTab(mainItem.id!);
                                  setIsMenuOpen(false);
                                }}
                                className="w-full justify-start py-3 px-4 flex items-center gap-3 rounded-xl text-base h-auto font-black hover:bg-primary/5 hover:text-primary transition-all group"
                              >
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                  <mainItem.icon size={16} />
                                </div>
                                {mainItem.label}
                              </Button>
                            )}
                          </div>
                        ))}
                    </ScrollArea>
                    
                    <div className="p-6 border-t bg-muted/10 space-y-4">
                        <AuthButton className="w-full justify-center py-6 rounded-2xl text-base shadow-2xl" />
                        <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold opacity-50">
                          © {new Date().getFullYear()} {schoolData?.shortName}
                        </p>
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