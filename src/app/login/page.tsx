'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword, signInAnonymously, signOut } from 'firebase/auth';
import { useAuth, useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, ShieldAlert, UserCog, GraduationCap, LogIn, Sparkles, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import type { UserProfile, School as SchoolType } from '@/lib/data';
import { SCHOOL_DATA_ID } from '@/lib/data';
import { convertGoogleDriveLink, getDashboardByRole } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  email: z.string().email('Email tidak valid.'),
  password: z.string().min(6, 'Password minimal 6 karakter.'),
});

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testRole, setTestRole] = useState<string | null>(null);
  const { user: alreadyLoggedInUser, isLoading: isUserLoading } = useUser();

  const schoolDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'schools', SCHOOL_DATA_ID);
  }, [firestore]);
  const { data: schoolData, isLoading: isSchoolDataLoading } = useDoc<SchoolType>(schoolDocRef);

  // Redirect if user is already logged in
  useEffect(() => {
    if (!isUserLoading && alreadyLoggedInUser?.profile?.role) {
      const targetDashboard = getDashboardByRole(alreadyLoggedInUser.profile.role);
      router.replace(targetDashboard);
    }
  }, [alreadyLoggedInUser, isUserLoading, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  // Fast login function (Tester Mode)
  const handleTestLogin = async (role: UserProfile['role']) => {
    if (!auth || !firestore) return;
    setIsTesting(true);
    setTestRole(role);
    
    try {
      // Clear old session
      if (auth.currentUser) {
        await signOut(auth);
      }

      // 1. Sign in anonymously
      const userCredential = await signInAnonymously(auth);
      
      // 2. Create profile for this anonymous UID
      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      const testProfile: UserProfile = {
        email: `tester-${role}@example.com`,
        displayName: `Tester ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        role: role
      };
      
      await setDoc(userDocRef, testProfile);
      
      toast({
        title: 'Login Berhasil',
        description: `Masuk sebagai ${testProfile.displayName} (Mode Uji Coba).`,
      });
      
      // Navigate to dashboard
      router.push(getDashboardByRole(role));

    } catch (error) {
      console.error("Test login error:", error);
      toast({
        variant: 'destructive',
        title: 'Gagal Login',
        description: 'Terjadi kesalahan sistem saat mencoba mode uji coba.',
      });
    } finally {
      setIsTesting(false);
      setTestRole(null);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth || !firestore) return;
    setIsSubmitting(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userProfile = userDoc.data() as UserProfile;
        toast({
            title: 'Login Berhasil',
            description: `Selamat datang kembali, ${userProfile.displayName || 'Pengguna'}!`,
        });
        router.push(getDashboardByRole(userProfile.role));
      } else {
        // Fallback for users with no profile record
        const newUserProfile: UserProfile = {
          email: userCredential.user.email!,
          role: 'siswa',
          displayName: userCredential.user.email!.split('@')[0] || 'Siswa Baru',
        };
        await setDoc(userDocRef, newUserProfile);
        toast({
            title: 'Login Berhasil',
            description: `Profil Anda telah dikonfigurasi secara otomatis.`,
        });
        router.push(getDashboardByRole(newUserProfile.role));
      }
    } catch (error: any) {
        console.error("Login error:", error);
        toast({
            variant: 'destructive',
            title: 'Login Gagal',
            description: error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' 
                ? 'Email atau password salah.' 
                : 'Terjadi kesalahan. Silakan coba lagi nanti.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (isUserLoading || alreadyLoggedInUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
        <p className="mt-4 text-muted-foreground animate-pulse font-medium">Memeriksa autentikasi...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 dark:bg-slate-950 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <Card className="shadow-2xl rounded-[2rem] border-primary/5 overflow-hidden bg-card/80 backdrop-blur-xl">
            <div className="bg-primary/5 p-8 text-center border-b border-primary/5">
                {isSchoolDataLoading ? (
                  <Skeleton className="w-20 h-20 rounded-2xl mx-auto mb-4" />
                ) : (
                  <div className="relative w-20 h-20 mx-auto mb-4 bg-white rounded-2xl p-2 shadow-xl border border-primary/5">
                    <Image 
                      src={convertGoogleDriveLink(schoolData?.logoUrl || "https://picsum.photos/seed/logo/80/80")} 
                      alt="Logo Sekolah" 
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                )}
                <CardTitle className="text-2xl font-black font-headline text-primary tracking-tight">Portal Akademik</CardTitle>
                <CardDescription className="text-muted-foreground mt-1 font-medium">
                  {schoolData?.name || "Selamat Datang"}
                </CardDescription>
            </div>
            
            <CardContent className="p-8 space-y-8">
                {/* Standard Login Form */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className='font-bold text-xs uppercase tracking-widest text-muted-foreground'>Alamat Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="nama@email.com" {...field} className="h-12 rounded-xl bg-muted/20 border-primary/10 focus:ring-primary/20" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className='font-bold text-xs uppercase tracking-widest text-muted-foreground'>Kata Sandi</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} className="h-12 rounded-xl bg-muted/20 border-primary/10 focus:ring-primary/20" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full font-black h-12 rounded-xl text-lg shadow-lg hover:shadow-primary/20 transition-all active:scale-95" disabled={isSubmitting || isTesting}>
                        {isSubmitting ? (
                          <>
                            <LoaderCircle className="animate-spin mr-2 h-5 w-5" />
                            Menghubungkan...
                          </>
                        ) : (
                          <>
                            <LogIn className="mr-2 h-5 w-5" />
                            Masuk Ke Akun
                          </>
                        )}
                      </Button>
                  </form>
                </Form>

                {/* Tester Mode / Quick Access */}
                <div className="space-y-6 pt-2">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full opacity-50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-4 text-muted-foreground font-black tracking-[0.2em] flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        Mode Uji Coba
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      type="button"
                      className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-primary/10 hover:border-primary/40 hover:bg-primary/5 transition-all group text-left w-full disabled:opacity-50"
                      onClick={() => handleTestLogin('admin')}
                      disabled={isTesting || isSubmitting}
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <ShieldAlert className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-sm text-foreground">Akses Admin</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kelola Seluruh Sistem</p>
                      </div>
                      {isTesting && testRole === 'admin' ? (
                        <LoaderCircle className="animate-spin h-5 w-5 text-primary" />
                      ) : (
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      )}
                    </button>
                    
                    <button 
                      type="button"
                      className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-accent/10 hover:border-accent/40 hover:bg-accent/5 transition-all group text-left w-full disabled:opacity-50"
                      onClick={() => handleTestLogin('guru')}
                      disabled={isTesting || isSubmitting}
                    >
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
                        <UserCog className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-sm text-foreground">Akses Guru</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Input Nilai & Absensi</p>
                      </div>
                      {isTesting && testRole === 'guru' ? (
                        <LoaderCircle className="animate-spin h-5 w-5 text-accent" />
                      ) : (
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                      )}
                    </button>

                    <button 
                      type="button"
                      className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-emerald-500/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group text-left w-full disabled:opacity-50"
                      onClick={() => handleTestLogin('siswa')}
                      disabled={isTesting || isSubmitting}
                    >
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-sm text-foreground">Akses Siswa</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Lihat Rapor & Jadwal</p>
                      </div>
                      {isTesting && testRole === 'siswa' ? (
                        <LoaderCircle className="animate-spin h-5 w-5 text-emerald-500" />
                      ) : (
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                      )}
                    </button>
                  </div>
                </div>
            </CardContent>
        </Card>
        
        <div className="text-center space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            &copy; {new Date().getFullYear()} {schoolData?.shortName || "SMKS PGRI 2"}. All Rights Reserved.
          </p>
          <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="text-muted-foreground hover:text-primary rounded-full px-6 font-bold">
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
}
