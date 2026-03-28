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
import { Eye, EyeOff, KeyRound, Mail, LogIn, UserPlus, ShieldAlert, LoaderCircle, Sparkles, ArrowLeft } from 'lucide-react';
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
            toast({ title: "System Offline", description: "Database connection failed.", variant: "destructive" });
            return;
        }
        
        setIsSubmitting(true);

        try {
            if (isRegisterMode) {
                await createUserWithEmailAndPassword(auth, email, password);
                toast({ title: "Account Created", description: "Setting up your digital workspace..." });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                toast({ title: "Welcome Back", description: "Authentication successful." });
            }
        } catch (error: any) {
            console.error("Auth error:", error);
            let message = "Invalid credentials. Please try again.";
            if (error.code === 'auth/weak-password') message = "Password must be at least 6 characters.";
            if (error.code === 'auth/email-already-in-use') message = "This email is already registered.";
            
            toast({ title: "Access Denied", description: message, variant: "destructive" });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden tech-mesh">
            {/* Background Zen Elements */}
            <div className='absolute top-0 left-0 w-full h-full bg-primary/5 opacity-30 pointer-events-none'></div>
            <div className='absolute -top-48 -right-48 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-pulse'></div>
            <div className='absolute -bottom-48 -left-48 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] animate-pulse' style={{ animationDelay: '2s' }}></div>

            <div className="max-w-md w-full space-y-8 animate-reveal">
                <button 
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors mb-4"
                >
                    <ArrowLeft size={14} /> Back to Portal
                </button>

                <Card className="glass-premium border-white/5 rounded-[2rem] overflow-hidden">
                    <CardHeader className="text-center pt-12 pb-6">
                        <div className="mb-6 mx-auto w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/20">
                            <Sparkles size={32} />
                        </div>
                        <CardTitle className="text-3xl font-black tracking-tight uppercase">
                            {isRegisterMode ? 'Join Us' : 'Identity'}
                        </CardTitle>
                        <CardDescription className="uppercase text-[9px] font-bold tracking-[0.4em] text-muted-foreground pt-2">
                            Digital Campus Authentication
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="px-8 pb-12">
                        {!auth && (
                            <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/20 rounded-xl">
                                <ShieldAlert className="h-4 w-4" />
                                <AlertTitle className='font-bold uppercase text-[10px] tracking-widest'>Critical Error</AlertTitle>
                                <AlertDescription className="text-[10px]">Firebase configuration not detected.</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleAuth} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground ml-1">Email Reference</Label>
                                <div className='relative'>
                                    <Input 
                                        type="email" 
                                        placeholder="name@campus.id" 
                                        required 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 rounded-xl bg-white/5 border-white/5 focus:border-primary/50 text-white pl-10"
                                        disabled={isSubmitting}
                                    />
                                    <Mail className='absolute left-3.5 top-3.5 text-muted-foreground' size={16} />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground ml-1">Security Key</Label>
                                <div className="relative">
                                    <Input 
                                        type={showPassword ? "text" : "password"} 
                                        required 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 rounded-xl bg-white/5 border-white/5 focus:border-primary/50 text-white pl-10 pr-12"
                                        placeholder='••••••••'
                                        disabled={isSubmitting}
                                    />
                                    <KeyRound className='absolute left-3.5 top-3.5 text-muted-foreground' size={16} />
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
                                className="w-full font-black text-xs h-14 rounded-xl shadow-2xl transition-all hover:scale-[1.02] uppercase tracking-[0.3em]"
                            >
                                {isSubmitting ? (
                                    <LoaderCircle className="animate-spin mr-2 h-4 w-4" />
                                ) : (
                                    isRegisterMode ? <UserPlus className="mr-2 h-4 w-4"/> : <LogIn className="mr-2 h-4 w-4"/>
                                )}
                                {isSubmitting ? 'Verifying...' : (isRegisterMode ? 'Create Profile' : 'Authenticate')}
                            </Button>

                            <div className="pt-6 text-center border-t border-white/5 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setIsRegisterMode(!isRegisterMode)}
                                    className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
                                    disabled={isSubmitting}
                                >
                                    {isRegisterMode ? 'Existing Member? Sign In' : 'New Member? Request Access'}
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                
                <p className='text-center text-[8px] font-medium text-muted-foreground/40 uppercase tracking-[0.5em]'>
                    Secured by SMKS PGRI 2 Kedondong Encryption
                </p>
            </div>
        </div>
    );
}