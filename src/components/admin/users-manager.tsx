'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Edit, LoaderCircle, Users, ShieldCheck, UserCog, GraduationCap, Briefcase, Trash2, Key, Sparkles, Fingerprint, Clock, UserPlus, Mail, User as UserIcon, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  email: z.string().email('Email tidak valid.'),
  displayName: z.string().min(3, 'Nama minimal 3 karakter.'),
  role: z.enum(['admin', 'guru', 'siswa', 'alumni']),
  session: z.enum(['Pagi', 'Siang']).default('Pagi'),
  nis: z.string().optional(),
  className: z.string().optional(),
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
    defaultValues: {
        email: '',
        displayName: '',
        role: 'siswa',
        session: 'Pagi',
        nis: '',
        className: ''
    }
  });

  useEffect(() => {
    if (editingUser) {
      form.reset({ 
        email: editingUser.email,
        displayName: editingUser.displayName || '',
        role: editingUser.role,
        session: editingUser.session || 'Pagi',
        nis: editingUser.nis || '',
        className: editingUser.className || ''
      });
    } else {
        form.reset({
            email: '',
            displayName: '',
            role: 'siswa',
            session: 'Pagi',
            nis: '',
            className: ''
        });
    }
  }, [editingUser, form, isDialogOpen]);

  const handleAddNew = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (user: UserProfile & { id: string }) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = async (user: UserProfile & { id: string }) => {
    if (!firestore || !user.id) return;
    if (confirm(`Hapus akses database untuk ${user.email}? Tindakan ini permanen.`)) {
      try {
        await deleteDoc(doc(firestore, 'users', user.id));
        toast({ title: 'Profil dihapus', description: 'Data pengguna telah dibersihkan.' });
      } catch (e) {
        toast({ variant: 'destructive', title: 'Gagal menghapus' });
      }
    }
  }

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore) return;

    // Validasi: hanya admin yang boleh membuat akun guru
    if (!editingUser && values.role === 'guru' && !isAdmin) {
      toast({ variant: 'destructive', title: 'Akses Ditolak', description: 'Hanya administrator yang bisa membuat akun guru.' });
      return;
    }

    try {
        if (editingUser) {
            const docRef = doc(firestore, 'users', editingUser.id);
            updateDocumentNonBlocking(docRef, values);
            toast({ title: 'Profil diperbarui', description: `Data ${values.displayName} telah disimpan.` });
        } else {
            // Generate unique document ID using a more robust method
            // Using timestamp + random string to ensure uniqueness
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(2, 8);
            const uniqueId = `user_${timestamp}_${randomSuffix}`;
            
            const docRef = doc(firestore, 'users', uniqueId);
            setDocumentNonBlocking(docRef, {
                ...values,
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Pengguna ditambahkan', description: 'Profil baru telah dibuat di database.' });
        }
        setIsDialogOpen(false);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Kesalahan sistem' });
    }
  }

  const getRoleBadge = (role: UserProfile['role']) => {
    const roleInfo = USER_ROLES.find(r => r.value === role);
    const Icon = roleInfo?.icon || Users;
    
    switch(role) {
      case 'admin': return <Badge className="bg-red-500/10 text-red-700 border-none px-3 py-1 rounded-lg font-bold text-[9px] uppercase tracking-widest"><Icon size={10} className="mr-1" /> Admin</Badge>;
      case 'guru': return <Badge className="bg-amber-500/10 text-amber-700 border-none px-3 py-1 rounded-lg font-bold text-[9px] uppercase tracking-widest"><Icon size={10} className="mr-1" /> Guru</Badge>;
      case 'siswa': return <Badge className="bg-blue-500/10 text-blue-700 border-none px-3 py-1 rounded-lg font-bold text-[9px] uppercase tracking-widest"><Icon size={10} className="mr-1" /> Siswa</Badge>;
      case 'alumni': return <Badge className="bg-slate-500/10 text-slate-700 border-none px-3 py-1 rounded-lg font-bold text-[9px] uppercase tracking-widest"><Icon size={10} className="mr-1" /> Alumni</Badge>;
      default: return <Badge variant="outline" className='font-bold text-[9px] uppercase tracking-widest'>{role}</Badge>;
    }
  }
  
  return (
    <div className="space-y-8 animate-reveal pb-20 font-sans">
        {!isAdmin && (
            <Card className="border-primary/20 bg-primary/5 shadow-xl overflow-hidden relative rounded-[2.5rem]">
                <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Key size={120} /></div>
                <CardHeader className='p-8'>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-primary text-white rounded-2xl shadow-lg"><ShieldCheck size={24} /></div>
                        <div>
                            <CardTitle className="text-2xl font-black font-headline uppercase tracking-tighter">Otorisasi Sistem</CardTitle>
                            <CardDescription className='font-bold text-muted-foreground/80 uppercase text-[10px] tracking-widest'>Aktifkan hak akses administrator utama.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-8 pb-10 space-y-6 relative z-10">
                    <Alert className="bg-white/80 border-none shadow-sm rounded-2xl p-6">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <div className='ml-2'>
                            <AlertTitle className='font-bold text-sm font-headline'>Setup Awal Terdeteksi</AlertTitle>
                            <AlertDescription className='text-xs font-medium opacity-70 leading-relaxed mt-1'>
                                Sebagai pendaftar pertama, Anda memiliki wewenang untuk mengambil alih kendali sistem sebagai Administrator hPanel.
                            </AlertDescription>
                        </div>
                    </Alert>
                    <Button onClick={handleSelfPromote} size="xl" className="w-full rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl glow-primary">
                        Klaim Hak Akses Admin <ShieldCheck className='ml-2' />
                    </Button>
                </CardContent>
            </Card>
        )}

        {isAdmin && (
            <Card className="shadow-2xl border-none rounded-[3rem] bg-white overflow-hidden border">
                <CardHeader className="p-10 border-b border-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div>
                        <div className='flex items-center gap-3 text-primary mb-2'>
                            <Users size={20} />
                            <span className='text-[10px] font-black uppercase tracking-[0.4em]'>Security Engine</span>
                        </div>
                        <CardTitle className="text-3xl font-black italic uppercase tracking-tighter font-headline text-slate-900">
                            User <span className='text-primary not-italic'>Management.</span>
                        </CardTitle>
                        <CardDescription className="text-[10px] mt-2 uppercase font-bold tracking-widest text-slate-400">Kelola identitas, peran, dan sesi operasional civitas.</CardDescription>
                    </div>
                    <Button onClick={handleAddNew} size="xl" className="rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl glow-primary h-16 px-10">
                        <UserPlus className="mr-3 h-5 w-5" /> Tambah Pengguna
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-slate-100">
                                <TableHead className="px-10 py-5 font-bold text-[10px] uppercase tracking-widest text-slate-500">Identitas Profil</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500">Akses Sistem</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500">Role & Shift</TableHead>
                                <TableHead className="text-right px-10 font-bold text-[10px] uppercase tracking-widest text-slate-500">Kontrol</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && <TableRow><TableCell colSpan={4} className="text-center py-24"><LoaderCircle className="animate-spin mx-auto text-primary h-8 w-8" /></TableCell></TableRow>}
                            {users?.map((u) => (
                                <TableRow key={u.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                    <TableCell className="px-10 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black shadow-inner border border-primary/5 uppercase">
                                                {u.displayName?.charAt(0) || u.email?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-sm tracking-tight uppercase italic font-headline text-slate-900">{u.displayName || u.email?.split('@')[0] || '-'}</p>
                                                {u.role === 'siswa' ? (
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <Badge variant="outline" className="text-[8px] font-bold border-slate-200 text-slate-500 h-4 px-2 tracking-widest"><Fingerprint size={8} className="mr-1" /> {u.nis || 'NO-NIS'}</Badge>
                                                        <span className="text-[9px] font-bold text-primary uppercase tracking-widest">{u.className || 'Belum Sinkron'}</span>
                                                    </div>
                                                ) : (
                                                    <p className='text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1'>Pengajar / Staf Administrasi</p>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className='flex items-center gap-2 text-slate-600'>
                                            <Mail size={14} className='opacity-30' />
                                            <span className="text-xs font-bold">{u.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className='flex flex-col gap-2'>
                                            {getRoleBadge(u.role)}
                                            <div className='flex items-center gap-1.5 text-[9px] font-bold text-slate-400 px-1 uppercase tracking-widest'>
                                                <Clock size={10} className='text-primary' />
                                                Sesi {u.session || 'Pagi'}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-10">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5 text-slate-400 hover:text-primary transition-all" onClick={() => handleEdit(u as UserProfile & { id: string })} disabled={u.id === currentUser?.uid}><Edit size={18} /></Button>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all" onClick={() => handleDelete(u as UserProfile & { id: string })} disabled={u.id === currentUser?.uid}><Trash2 size={18} /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && users?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-32 opacity-20">
                                        <Users size={64} className="mx-auto mb-4" />
                                        <p className="text-[11px] font-bold uppercase tracking-[0.4em]">Zero User Records</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[500px] rounded-[3rem] p-0 overflow-hidden border-none shadow-3xl bg-white">
                <DialogHeader className="p-10 bg-slate-50 border-b border-slate-100">
                    <div className='flex items-center gap-4'>
                        <div className='p-3 bg-primary text-white rounded-2xl shadow-xl'>
                            {editingUser ? <UserCog size={24}/> : <UserPlus size={24}/>}
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black italic uppercase font-headline tracking-tight text-slate-900">
                                {editingUser ? 'Ubah Profil' : 'Akses Baru.'}
                            </DialogTitle>
                            <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {editingUser ? `ID: ${editingUser.email}` : 'Daftarkan hak akses baru ke sistem.'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-10 space-y-6">
                        {!editingUser && !isAdmin && (
                          <Alert className="bg-amber-500/5 border-amber-500/20">
                            <ShieldAlert className="h-4 w-4 text-amber-600" />
                            <AlertTitle className='font-bold text-xs uppercase tracking-widest text-amber-700'>Pembatasan Role Guru</AlertTitle>
                            <AlertDescription className='text-[10px] font-bold text-amber-700 uppercase tracking-widest leading-relaxed mt-1'>
                              Hanya administrator yang dapat membuat akun guru. Anda hanya bisa membuat akun siswa atau alumni.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        <div className='space-y-4'>
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Alamat Email</FormLabel>
                                    <FormControl>
                                        <div className='relative'>
                                            <Input {...field} placeholder="nama@sekolah.sch.id" className="h-14 rounded-2xl bg-slate-50 border-slate-100 pl-12 font-bold text-sm" disabled={!!editingUser} />
                                            <Mail className='absolute left-4 top-4.5 text-primary opacity-30' size={20} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>

                            <FormField control={form.control} name="displayName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap</FormLabel>
                                    <FormControl>
                                        <div className='relative'>
                                            <Input {...field} placeholder="Masukkan nama" className="h-14 rounded-2xl bg-slate-50 border-slate-100 pl-12 font-bold text-sm" />
                                            <UserIcon className='absolute left-4 top-4.5 text-primary opacity-30' size={20} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <FormField control={form.control} name="role" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Level Akses</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold text-xs"><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent className="rounded-2xl border-slate-100 bg-white">
                                            {USER_ROLES.filter(role => {
                                              // Tampilkan guru hanya jika admin atau sedang edit user yang statusnya guru
                                              if (role.value === 'guru' && !isAdmin && editingUser?.role !== 'guru') {
                                                return false;
                                              }
                                              return true;
                                            }).map(role => (
                                              <SelectItem key={role.value} value={role.value} className="py-4 font-bold text-[10px] uppercase tracking-widest border-b border-slate-50 last:border-0">
                                                <div className="flex items-center gap-3"><role.icon size={14} className="text-primary" /><span>{role.label}</span></div>
                                              </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>

                            <FormField control={form.control} name="session" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Shift Operasional</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold text-xs"><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent className="rounded-2xl border-slate-100 bg-white">
                                            <SelectItem value="Pagi" className="py-4 font-bold text-[10px] uppercase tracking-widest border-b border-slate-50">SESI PAGI</SelectItem>
                                            <SelectItem value="Siang" className="py-4 font-bold text-[10px] uppercase tracking-widest">SESI SIANG</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>

                        <div className='pt-6 border-t border-slate-100'>
                            <Button type="submit" className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl glow-primary" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <LoaderCircle className="animate-spin mr-3"/> : <ShieldCheck className="mr-3" />}
                                {editingUser ? 'Simpan Perubahan' : 'Daftarkan Pengguna'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    </div>
  );
}