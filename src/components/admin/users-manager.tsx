
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy, deleteDoc } from 'firebase/firestore';
import { useCollection, useFirestore, updateDocumentNonBlocking, useMemoFirebase, useUser, setDocumentNonBlocking } from '@/firebase';
import { type UserProfile } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Edit, LoaderCircle, Users, ShieldCheck, UserCog, GraduationCap, Briefcase, Trash2, Key, Sparkles, Fingerprint } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  role: z.enum(['admin', 'guru', 'siswa', 'alumni']),
});

const USER_ROLES: { value: UserProfile['role']; label: string; icon: any }[] = [
  { value: 'admin', label: 'Administrator', icon: ShieldCheck },
  { value: 'guru', label: 'Guru / Staf', icon: UserCog },
  { value: 'siswa', label: 'Siswa Aktif', icon: GraduationCap },
  { value: 'alumni', label: 'Alumni', icon: Briefcase },
];

export function UsersManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile & { id: string } | null>(null);
  
  const isAdmin = currentUser?.profile?.role === 'admin';

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), orderBy('email'));
  }, [firestore]);

  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (editingUser) {
      form.reset({ role: editingUser.role });
    }
  }, [editingUser, form]);

  const handleEdit = (user: UserProfile & { id: string }) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleSelfPromote = async () => {
    if (!firestore || !currentUser?.uid) return;
    
    const userRef = doc(firestore, 'users', currentUser.uid);
    const initRef = doc(firestore, 'app_roles/initialized/init', 'system');

    try {
      updateDocumentNonBlocking(userRef, { role: 'admin' });
      setDocumentNonBlocking(initRef, { 
        initialized: true, 
        initializedBy: currentUser.email,
        at: new Date()
      });
      toast({ title: 'Akses diberikan', description: 'Anda sekarang adalah Administrator.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Gagal' });
    }
  };

  const handleDelete = async (user: UserProfile & { id: string }) => {
    if (!firestore || !user.id) return;
    if (confirm(`Hapus akses database untuk ${user.email}? Profil ini tidak akan bisa login.`)) {
      try {
        await deleteDoc(doc(firestore, 'users', user.id));
        toast({ title: 'Profil dihapus', description: 'Data pengguna telah dibersihkan.' });
      } catch (e) {
        toast({ variant: 'destructive', title: 'Gagal' });
      }
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !editingUser) return;
    const docRef = doc(firestore, 'users', editingUser.id);
    updateDocumentNonBlocking(docRef, values);
    toast({ title: 'Peran diperbarui', description: `Hak akses telah diubah.` });
    setIsDialogOpen(false);
  }

  const getRoleBadge = (role: UserProfile['role']) => {
    const roleInfo = USER_ROLES.find(r => r.value === role);
    const Icon = roleInfo?.icon || Users;
    
    switch(role) {
      case 'admin': return <Badge className="bg-red-500/10 text-red-600 border-none px-3 py-1 rounded-lg font-bold text-[9px]"><Icon size={10} className="mr-1" /> Admin</Badge>;
      case 'guru': return <Badge className="bg-amber-500/10 text-amber-600 border-none px-3 py-1 rounded-lg font-bold text-[9px]"><Icon size={10} className="mr-1" /> Guru</Badge>;
      case 'siswa': return <Badge className="bg-blue-500/10 text-blue-600 border-none px-3 py-1 rounded-lg font-bold text-[9px]"><Icon size={10} className="mr-1" /> Siswa</Badge>;
      case 'alumni': return <Badge className="bg-slate-500/10 text-slate-600 border-none px-3 py-1 rounded-lg font-bold text-[9px]"><Icon size={10} className="mr-1" /> Alumni</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
        {!isAdmin && (
            <Card className="border-primary/20 bg-primary/5 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Key size={120} /></div>
                <CardHeader>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-3 bg-primary text-white rounded-2xl shadow-lg"><ShieldCheck size={24} /></div>
                        <div>
                            <CardTitle className="text-xl font-bold">Akses administrator</CardTitle>
                            <CardDescription>Aktifkan akses penuh ke sistem manajemen sekolah.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                    <Alert className="bg-white/50 dark:bg-black/20 border-none">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <AlertTitle className='font-bold text-sm'>Sistem baru terdeteksi</AlertTitle>
                        <AlertDescription className='text-xs'>
                            Sebagai pendaftar pertama, Anda berhak mempromosikan akun Anda menjadi Administrator utama.
                        </AlertDescription>
                    </Alert>
                    <Button onClick={handleSelfPromote} size="lg" className="w-full h-14 rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]">
                        Aktifkan hak akses admin <ShieldCheck className='ml-2' />
                    </Button>
                </CardContent>
            </Card>
        )}

        {isAdmin && (
            <Card className="shadow-lg border-none rounded-[2rem] bg-card/50 backdrop-blur-md overflow-hidden">
                <CardHeader className="p-8 border-b border-border">
                    <CardTitle className="text-xl font-bold italic uppercase flex items-center gap-3 font-headline">
                      <Users size={24} className="text-primary" /> Manajemen pengguna
                    </CardTitle>
                    <CardDescription className="text-[10px] mt-1 uppercase font-bold tracking-widest opacity-60">Kontrol hak akses dan sinkronisasi data profil.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border">
                            <TableHead className="px-8 font-bold text-[10px] uppercase opacity-40">Nama & identitas</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase opacity-40">Email akses</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase opacity-40">Tingkat peran</TableHead>
                            <TableHead className="text-right px-8 font-bold text-[10px] uppercase opacity-40">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && <TableRow><TableCell colSpan={4} className="text-center py-20"><LoaderCircle className="animate-spin mx-auto text-primary" /></TableCell></TableRow>}
                            {users?.map((u) => (
                                <TableRow key={u.id} className="border-border hover:bg-muted/20 group">
                                    <TableCell className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold">{u.displayName?.charAt(0)}</div>
                                            <div>
                                                <p className="font-bold text-sm tracking-tight">{u.displayName || u.email?.split('@')[0] || '-'}</p>
                                                {u.role === 'siswa' && u.nis && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-[8px] font-bold border-primary/20 text-primary h-4 px-1.5"><Fingerprint size={8} className="mr-1" /> {u.nis}</Badge>
                                                        <span className="text-[9px] font-bold text-muted-foreground">{u.className || 'Belum Sinkron'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell><span className="text-xs font-medium text-muted-foreground">{u.email}</span></TableCell>
                                    <TableCell>{getRoleBadge(u.role)}</TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary" onClick={() => handleEdit(u as UserProfile & { id: string })} disabled={u.id === currentUser?.uid}><Edit size={16} /></Button>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 text-destructive opacity-40 hover:opacity-100" onClick={() => handleDelete(u as UserProfile & { id: string })} disabled={u.id === currentUser?.uid}><Trash2 size={16} /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && users?.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground">Belum ada pengguna terdaftar.</TableCell></TableRow>}
                        </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl">
                <DialogHeader className="p-8 bg-primary/5 border-b border-border">
                    <DialogTitle className="text-xl font-bold italic uppercase font-headline">Ubah hak akses</DialogTitle>
                    <DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Akun: {editingUser?.email}</DialogDescription>
                </DialogHeader>
                {editingUser && (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
                            <FormField control={form.control} name="role" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest opacity-60">Pilih peran baru</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger className="h-12 rounded-xl bg-muted/50 border-border"><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent className="rounded-xl border-border bg-card/95 backdrop-blur-xl">
                                            {USER_ROLES.map(role => (
                                              <SelectItem key={role.value} value={role.value} className="py-3 font-bold text-[10px] uppercase">
                                                <div className="flex items-center gap-3"><role.icon size={14} className="text-primary" /><span>{role.label}</span></div>
                                              </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <Button type="submit" className="w-full h-14 rounded-xl font-bold shadow-xl shadow-primary/20">Simpan perubahan</Button>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    </div>
  );
}
