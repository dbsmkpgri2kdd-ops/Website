'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase'; 
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, KeyRound, Mail, LogIn, TestTube } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({
                title: "Login Berhasil",
                description: "Selamat datang kembali! Anda akan diarahkan ke dashboard.",
                variant: "success",
            });
            router.push('/');
        } catch (error: any) {
            console.error("Error logging in:", error);
            toast({
                title: "Login Gagal",
                description: error.message || "Email atau password salah. Silakan coba lagi.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTestLogin = () => {
        setEmail('demo@gmail.com');
        setPassword('123456');
    };

    return (
        <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
            <Card className="max-w-md w-full shadow-lg rounded-2xl">
                <CardHeader className="text-center">
                    <div className="mb-4 mx-auto">
                        <Image src="/logo.png" alt="Logo" width={80} height={80} />
                    </div>
                    <CardTitle className="text-3xl font-bold font-headline text-primary">Selamat Datang</CardTitle>
                    <CardDescription>Silakan masuk untuk melanjutkan ke dasbor Anda.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center"><Mail className="mr-2 h-4 w-4"/>Email</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="contoh@email.com" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="text-base"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="flex items-center"><KeyRound className="mr-2 h-4 w-4"/>Password</Label>
                            <div className="relative">
                                <Input 
                                    id="password" 
                                    type={showPassword ? "text" : "password"} 
                                    required 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="text-base pr-10"
                                    placeholder='••••••••'
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground"
                                >
                                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                        </div>
                         <Button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="w-full font-bold text-lg py-6"
                        >
                            <LogIn className="mr-2 h-5 w-5"/>
                            {isSubmitting ? 'Memproses...' : 'Masuk'}
                        </Button>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Atau coba login
                                </span>
                            </div>
                        </div>
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={handleTestLogin}
                            className="w-full"
                        >
                            <TestTube className="mr-2 h-4 w-4"/>
                            Gunakan Akun Demo
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}