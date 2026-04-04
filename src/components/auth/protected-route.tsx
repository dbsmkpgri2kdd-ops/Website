
'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { getDashboardByRole } from '@/lib/utils';

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles: string[];
};

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isUserLoading, userError } = useUser();
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isUserLoading) {
      setIsAllowed(null);
      return;
    }

    if (userError || !user) {
      setIsAllowed(false);
      router.replace('/login');
      return;
    }

    const role = user.profile?.role;
    if (!role) {
      setIsAllowed(false);
      router.replace('/login');
      return;
    }

    if (!allowedRoles.includes(role)) {
      setIsAllowed(false);
      const userDashboard = getDashboardByRole(role);
      toast({
        variant: 'destructive',
        title: 'Akses Dibatasi',
        description: `Anda tidak memiliki izin untuk halaman ini.`,
      });
      router.replace(userDashboard);
      return;
    }

    setIsAllowed(true);

  }, [user, isUserLoading, userError, router, toast, allowedRoles]);


  if (isUserLoading || isAllowed === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <LoaderCircle className="animate-spin h-10 w-10 text-primary" />
        <p className="mt-4 text-muted-foreground font-black uppercase tracking-[0.4em] text-[9px]">Otorisasi Sistem...</p>
      </div>
    );
  }
  
  if (!isAllowed) {
    return (
       <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <LoaderCircle className="animate-spin h-10 w-10 text-primary" />
        <p className="mt-4 text-muted-foreground font-black uppercase tracking-[0.4em] text-[9px]">Mengarahkan Akses...</p>
      </div>
    );
  }

  return <>{children}</>;
}
