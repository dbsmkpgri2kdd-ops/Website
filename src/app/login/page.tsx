'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useUser, useFirestore } from '@/firebase'; 
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, KeyRound, Mail, LogIn, UserPlus, ShieldAlert, LoaderCircle, ArrowLeft, ShieldCheck, Fingerprint, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getDashboardByRole } from '@/lib/utils';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nis, setNis] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    
    const router = useRouter();
    const { toast } = useToast();
    const auth = useAuth();
    const firestore = useFirestore();
    const { user, profile } = useUser();

    useEffect(() => {
        if (user && profile) {
            const dashboardUrl = getDashboardByRole(profile.role);
            router.replace(dashboardUrl);
        }
    }, [user, profile, router]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth || !firestore) {
            toast({ title: "Sistem Offline", description: "Koneksi database tidak tersedia.", variant: "destructive" });
            return;
        }
        
        setIsSubmitting(true);

        try {
            if (isRegisterMode) {
                if (nis.length < 4) {
                    toast({ title: "NIS Tidak Valid", description: "Masukkan Nomor Induk Siswa yang benar.", variant: "destructive" });
                    setIsSubmitting(false);
                    return;
                }

                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                
                await setDoc(doc(firestore, 'users', userCredential.user.uid), {
                    email: email,
                    nis: nis,
                    role: 'siswa',
                    createdAt: serverTimestamp(),
                    displayName: email.split('@')[0]
                }, { merge: true });

                toast({ title: "Pendaftaran Berhasil", description: "Akun Anda telah dibuat. Melakukan sinkronisasi data..." });
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
        <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden tech-mesh">
            <div className="max-w-md w-full space-y-6 animate-reveal relative z-10">
                <button 
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors mb-4 group uppercase tracking-widest"
                >
                    <ArrowLeft size={14} className='group-hover:-translate-x-1 transition-transform'/> Kembali ke beranda
                </button>

                <Card className="border-slate-100 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white border-2">
                    <CardHeader className="text-center pt-10 pb-6">
                        <div className="mb-6 mx-auto w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner relative">
                            <ShieldCheck size={28} />
                            <Sparkles size={12} className='absolute -top-1 -right-1 text-accent' />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tighter text-slate-900 uppercase">
                            {isRegisterMode ? 'Buat Akun' : 'Portal Masuk'}
                        </CardTitle>
                        <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
                            SMKS PGRI 2 KEDONDONG
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="px-8 pb-10">
                        {!auth && (
                            <Alert variant="destructive" className="mb-6 rounded-xl">
                                <ShieldAlert className="h-4 w-4" />
                                <AlertTitle className='font-bold text-[10px] uppercase'>Konfigurasi</AlertTitle>
                                <AlertDescription className="text-[10px]">Layanan autentikasi belum siap.</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleAuth} className="space-y-4">
                            {isRegisterMode && (
                                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Nomor Induk Siswa (NIS)</Label>
                                    <div className='relative'>
                                        <Input 
                                            type="text" 
                                            placeholder="NIS Anda" 
                                            required 
                                            value={nis}
                                            onChange={(e) => setNis(e.target.value)}
                                            className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:border-primary pl-10 text-xs font-mono tracking-widest"
                                            disabled={isSubmitting}
                                        />
                                        <Fingerprint className='absolute left-3.5 top-3 text-primary opacity-30' size={18} />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Alamat Email</Label>
                                <div className='relative'>
                                    <Input 
                                        type="email" 
                                        placeholder="nama@email.com" 
                                        required 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:border-primary pl-10 text-xs"
                                        disabled={isSubmitting}
                                    />
                                    <Mail className='absolute left-3.5 top-3 text-primary opacity-30' size={18} />
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Kata Sandi</Label>
                                <div className="relative">
                                    <Input 
                                        type={showPassword ? "text" : "password"} 
                                        required 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:border-primary pl-10 pr-10 text-xs"
                                        placeholder='Min. 6 karakter'
                                        disabled={isSubmitting}
                                    />
                                    <KeyRound className='absolute left-3.5 top-3 text-primary opacity-30' size={18} />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-3 text-slate-400 hover:text-primary transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                                    </button>
                                </div>
                            </div>
                            
                            <Button 
                                type="submit" 
                                disabled={isSubmitting || !auth} 
                                className="w-full font-bold text-[10px] h-12 rounded-xl shadow-md glow-accent uppercase tracking-[0.3em] mt-4 bg-accent text-accent-foreground border-none hover:scale-[1.01] transition-transform"
                            >
                                {isSubmitting ? (
                                    <LoaderCircle className="animate-spin mr-2 h-4 w-4" />
                                ) : (
                                    isRegisterMode ? <UserPlus className="mr-2 h-4 w-4"/> : <LogIn className="mr-2 h-4 w-4"/>
                                )}
                                {isSubmitting ? 'MEMPROSES...' : (isRegisterMode ? 'DAFTAR' : 'MASUK')}
                            </Button>

                            <div className="pt-6 text-center border-t border-slate-50 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setIsRegisterMode(!isRegisterMode)}
                                    className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                                    disabled={isSubmitting}
                                >
                                    {isRegisterMode ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar'}
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                
                <p className='text-center text-[8px] font-bold uppercase tracking-[0.4em] text-slate-300'>
                    &copy; 2025 SMKS PGRI 2 KEDONDONG
                </p>
            </div>
        </div>
    );
}