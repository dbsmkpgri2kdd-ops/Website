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
            toast({ title: "Sistem offline", description: "Koneksi database tidak tersedia.", variant: "destructive" });
            return;
        }
        
        setIsSubmitting(true);

        try {
            if (isRegisterMode) {
                if (nis.length < 4) {
                    toast({ title: "NIS tidak valid", description: "Masukkan Nomor Induk Siswa yang benar.", variant: "destructive" });
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

                toast({ title: "Pendaftaran berhasil", description: "Akun Anda telah dibuat. Melakukan sinkronisasi data..." });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                toast({ title: "Berhasil masuk", description: "Selamat datang kembali." });
            }
        } catch (error: any) {
            let message = "Email atau kata sandi tidak valid.";
            if (error.code === 'auth/weak-password') message = "Kata sandi minimal 6 karakter.";
            if (error.code === 'auth/email-already-in-use') message = "Email sudah terdaftar.";
            
            toast({ title: "Akses ditolak", description: message, variant: "destructive" });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden tech-mesh">
            <div className="max-w-md w-full space-y-6 animate-reveal relative z-10">
                <button 
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors mb-4 group tracking-tight"
                >
                    <ArrowLeft size={14} className='group-hover:-translate-x-1 transition-transform'/> Kembali ke beranda
                </button>

                <Card className="border-slate-100 shadow-3xl rounded-[2.5rem] overflow-hidden bg-white border-2">
                    <CardHeader className="text-center pt-12 pb-8">
                        <div className="mb-8 mx-auto w-16 h-16 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center shadow-inner relative">
                            <ShieldCheck size={32} />
                            <Sparkles size={14} className='absolute -top-1 -right-1 text-accent animate-pulse' />
                        </div>
                        <CardTitle className="text-3xl font-black tracking-tighter text-slate-900 font-headline leading-none">
                            {isRegisterMode ? 'Buat Akun.' : 'Portal Masuk.'}
                        </CardTitle>
                        <CardDescription className="text-xs font-bold text-slate-400 mt-2">
                            SMKS PGRI 2 KEDONDONG
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="px-10 pb-12">
                        {!auth && (
                            <Alert variant="destructive" className="mb-8 rounded-2xl border-none bg-red-50">
                                <ShieldAlert className="h-4 w-4" />
                                <AlertTitle className='font-bold text-[11px] uppercase tracking-widest'>Konfigurasi</AlertTitle>
                                <AlertDescription className="text-[11px] font-medium">Layanan autentikasi belum siap.</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleAuth} className="space-y-5">
                            {isRegisterMode && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Nomor Induk Siswa (NIS)</Label>
                                    <div className='relative'>
                                        <Input 
                                            type="text" 
                                            placeholder="Masukkan NIS Anda" 
                                            required 
                                            value={nis}
                                            onChange={(e) => setNis(e.target.value)}
                                            className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:border-primary pl-12 text-sm font-bold tracking-widest"
                                            disabled={isSubmitting}
                                        />
                                        <Fingerprint className='absolute left-4 top-3.5 text-primary opacity-30' size={20} />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Alamat Email</Label>
                                <div className='relative'>
                                    <Input 
                                        type="email" 
                                        placeholder="nama@email.com" 
                                        required 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:border-primary pl-12 text-sm font-bold"
                                        disabled={isSubmitting}
                                    />
                                    <Mail className='absolute left-4 top-3.5 text-primary opacity-30' size={20} />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Kata Sandi</Label>
                                <div className="relative">
                                    <Input 
                                        type={showPassword ? "text" : "password"} 
                                        required 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:border-primary pl-12 pr-12 text-sm font-bold"
                                        placeholder='Min. 6 karakter'
                                        disabled={isSubmitting}
                                    />
                                    <KeyRound className='absolute left-4 top-3.5 text-primary opacity-30' size={20} />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-4 text-slate-400 hover:text-primary transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                    </button>
                                </div>
                            </div>
                            
                            <Button 
                                type="submit" 
                                disabled={isSubmitting || !auth} 
                                className="w-full font-black text-xs h-14 rounded-2xl shadow-xl glow-primary uppercase tracking-[0.2em] mt-6 bg-primary text-white border-none hover:scale-[1.01] transition-all"
                            >
                                {isSubmitting ? (
                                    <LoaderCircle className="animate-spin mr-3 h-5 w-5" />
                                ) : (
                                    isRegisterMode ? <UserPlus className="mr-3 h-5 w-5"/> : <LogIn className="mr-3 h-5 w-5"/>
                                )}
                                {isSubmitting ? 'Memproses...' : (isRegisterMode ? 'Daftar Sekarang' : 'Masuk Sistem')}
                            </Button>

                            <div className="pt-8 text-center border-t border-slate-50 mt-8">
                                <button 
                                    type="button" 
                                    onClick={() => setIsRegisterMode(!isRegisterMode)}
                                    className="text-[11px] font-bold text-slate-400 hover:text-primary transition-colors"
                                    disabled={isSubmitting}
                                >
                                    {isRegisterMode ? 'Sudah memiliki akun? Masuk di sini' : 'Belum memiliki akun? Buat baru'}
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                
                <p className='text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest'>
                    &copy; 2025 SMKS PGRI 2 KEDONDONG
                </p>
            </div>
        </div>
    );
}