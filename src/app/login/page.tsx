'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase'; 
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, KeyRound, Mail, LogIn, UserPlus, ShieldAlert, LoaderCircle, Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getDashboardByRole } from '@/lib/utils';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    
    const router = useRouter();
    const { toast } = useToast();
    const auth = useAuth();
    const { user, profile } = useUser();

    useEffect(() => {
        if (user && profile) {
            const dashboardUrl = getDashboardByRole(profile.role);
            router.replace(dashboardUrl);
        }
    }, [user, profile, router]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth) {
            toast({ title: "Sistem Offline", description: "Koneksi database tidak tersedia.", variant: "destructive" });
            return;
        }
        
        setIsSubmitting(true);

        try {
            if (isRegisterMode) {
                await createUserWithEmailAndPassword(auth, email, password);
                toast({ title: "Pendaftaran Berhasil", description: "Mengarahkan ke dashboard Anda..." });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                toast({ title: "Berhasil Masuk", description: "Selamat datang kembali." });
            }
        } catch (error: any) {
            let message = "Email atau kata sandi tidak valid.";
            if (error.code === 'auth/weak-password') message = "Kata sandi minimal 6 karakter.";
            if (error.code === 'auth/email-already-in-use') message = "Email sudah terdaftar.";
            
            toast({ title: "Akses Ditolak", description: message, variant: "destructive" });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden tech-mesh">
            <div className='absolute top-0 left-0 w-full h-full bg-primary/5 opacity-40 pointer-events-none'></div>
            
            <div className="max-w-md w-full space-y-6 animate-reveal relative z-10">
                <button 
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-4"
                >
                    <ArrowLeft size={16} /> Kembali ke beranda
                </button>

                <Card className="border-border shadow-2xl rounded-[2rem] overflow-hidden bg-card/80 backdrop-blur-md">
                    <CardHeader className="text-center pt-10 pb-4">
                        <div className="mb-4 mx-auto w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                            <ShieldCheck size={28} />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                            {isRegisterMode ? 'Buat akun baru' : 'Identitas digital'}
                        </CardTitle>
                        <CardDescription className="text-sm font-medium text-muted-foreground">
                            Akses Portal Terpadu SMKS PGRI 2 Kedondong
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="px-8 pb-10">
                        {!auth && (
                            <Alert variant="destructive" className="mb-6 rounded-xl">
                                <ShieldAlert className="h-4 w-4" />
                                <AlertTitle className='font-bold text-xs'>Kesalahan konfigurasi</AlertTitle>
                                <AlertDescription className="text-[11px]">Layanan autentikasi belum siap.</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleAuth} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-foreground ml-1">Alamat email</Label>
                                <div className='relative'>
                                    <Input 
                                        type="email" 
                                        placeholder="nama@siswa.sch.id" 
                                        required 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-11 rounded-xl bg-background border-border focus:border-primary pl-10"
                                        disabled={isSubmitting}
                                    />
                                    <Mail className='absolute left-3.5 top-3 text-muted-foreground' size={16} />
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-foreground ml-1">Kata sandi</Label>
                                <div className="relative">
                                    <Input 
                                        type={showPassword ? "text" : "password"} 
                                        required 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-11 rounded-xl bg-background border-border focus:border-primary pl-10 pr-12"
                                        placeholder='Min. 6 karakter'
                                        disabled={isSubmitting}
                                    />
                                    <KeyRound className='absolute left-3.5 top-3 text-muted-foreground' size={16} />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-4 text-muted-foreground hover:text-primary transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                                    </button>
                                </div>
                            </div>
                            
                            <Button 
                                type="submit" 
                                disabled={isSubmitting || !auth} 
                                className="w-full font-bold text-sm h-12 rounded-xl shadow-lg transition-all hover:scale-[1.01] mt-2"
                            >
                                {isSubmitting ? (
                                    <LoaderCircle className="animate-spin mr-2 h-4 w-4" />
                                ) : (
                                    isRegisterMode ? <UserPlus className="mr-2 h-4 w-4"/> : <LogIn className="mr-2 h-4 w-4"/>
                                )}
                                {isSubmitting ? 'Memverifikasi...' : (isRegisterMode ? 'Daftar sekarang' : 'Masuk ke portal')}
                            </Button>

                            <div className="pt-6 text-center border-t border-border mt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setIsRegisterMode(!isRegisterMode)}
                                    className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                                    disabled={isSubmitting}
                                >
                                    {isRegisterMode ? 'Sudah memiliki akun? Masuk' : 'Belum punya akun? Daftar gratis'}
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                
                <p className='text-center text-[10px] font-semibold text-muted-foreground/60'>
                    &copy; 2025 SMKS PGRI 2 Kedondong - Tim IT Digital Excellence
                </p>
            </div>
        </div>
    );
}