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
    if (isLoading) {
      return; 
    }

    if (error || !user) {
      router.replace('/login');
      return;
    }

    if (!user.profile || !user.profile.role) {
      toast({
        variant: 'destructive',
        title: 'Profil Pengguna Tidak Lengkap',
        description: 'Akun Anda belum memiliki peran. Silakan login melalui Mode Uji Coba untuk konfigurasi awal.',
      });
      router.replace('/login');
      return;
    }

    const userRole = user.profile.role;
    if (!allowedRoles.includes(userRole)) {
      const userDashboard = getDashboardByRole(userRole);
      toast({
        variant: 'destructive',
        title: 'Akses Ditolak',
        description: `Anda tidak memiliki izin untuk mengakses halaman ini.`,
      });
      router.replace(userDashboard);
      return;
    }

  }, [user, isLoading, error, router, toast, allowedRoles]);


  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
        <p className="mt-4 text-muted-foreground font-medium">Memverifikasi akses...</p>
      </div>
    );
  }
  
  if (!user || !user.profile || !allowedRoles.includes(user.profile.role)) {
    return (
       <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
        <p className="mt-4 text-muted-foreground font-medium">Mengarahkan...</p>
      </div>
    );
  }

  return <>{children}</>;
}