
'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { getDashboardByRole } from '@/lib/utils';

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles: string[];
};

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, error } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isLoading) return; 

    if (error || !user) {
      router.replace('/login');
      return;
    }

    if (!user.profile || !user.profile.role) {
      // Profile handles auto-creation in provider.tsx
      return;
    }

    const userRole = user.profile.role;
    if (!allowedRoles.includes(userRole)) {
      const userDashboard = getDashboardByRole(userRole);
      toast({
        variant: 'destructive',
        title: 'Akses Dibatasi',
        description: `Anda tidak memiliki izin. Mengalihkan ke dashboard Anda...`,
      });
      router.replace(userDashboard);
      return;
    }

  }, [user, isLoading, error, router, toast, allowedRoles]);


  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
        <p className="mt-4 text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Memverifikasi Identitas...</p>
      </div>
    );
  }
  
  if (!user || !user.profile || !allowedRoles.includes(user.profile.role)) {
    return (
       <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
        <p className="mt-4 text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Mengarahkan...</p>
      </div>
    );
  }

  return <>{children}</>;
}
