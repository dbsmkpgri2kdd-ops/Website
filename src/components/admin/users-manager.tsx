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
import { Edit, LoaderCircle, Users, ShieldCheck, UserCog, GraduationCap, Briefcase, Trash2, ShieldAlert, Sparkles, Key } from 'lucide-react';
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
      // 1. Promote user to admin
      updateDocumentNonBlocking(userRef, { role: 'admin' });
      
      // 2. Lock the system by creating the initialization flag
      setDocumentNonBlocking(initRef, { 
        initialized: true, 
        initializedBy: currentUser.email,
        at: new Date()
      });

      toast({ title: 'Akses Diberikan!', description: 'Anda sekarang adalah Administrator sistem ini.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Gagal', description: 'Pastikan koneksi internet stabil.' });
    }
  };

  const handleDelete = async (user: UserProfile & { id: string }) => {
    if (!firestore || !user.id) return;
    if (confirm(`Hapus akses database untuk ${user.email}? Tindakan ini tidak menghapus akun autentikasi, hanya profil databasenya.`)) {
      try {
        await deleteDoc(doc(firestore, 'users', user.id));
        toast({ title: 'Profil Dihapus', description: 'Profil pengguna telah dihapus dari database.' });
      } catch (e) {
        toast({ variant: 'destructive', title: 'Gagal Menghapus', description: 'Izin ditolak.' });
      }
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !editingUser) return;
    const docRef = doc(firestore, 'users', editingUser.id);
    updateDocumentNonBlocking(docRef, values);
    toast({ title: 'Peran Diperbarui', description: `Hak akses telah diubah.` });
    setIsDialogOpen(false);
  }

  const getRoleBadge = (role: UserProfile['role']) => {
    const roleInfo = USER_ROLES.find(r => r.value === role);
    const Icon = roleInfo?.icon || Users;
    
    switch(role) {
      case 'admin': return <Badge className="bg-red-500"><Icon size={12} className="mr-1" /> Admin</Badge>;
      case 'guru': return <Badge className="bg-amber-500"><Icon size={12} className="mr-1" /> Guru</Badge>;
      case 'siswa': return <Badge className="bg-blue-500"><Icon size={12} className="mr-1" /> Siswa</Badge>;
      case 'alumni': return <Badge className="bg-slate-500"><Icon size={12} className="mr-1" /> Alumni</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
        {/* Setup Mode: Terlihat jika user belum Admin */}
        {!isAdmin && (
            <Card className="border-primary/20 bg-primary/5 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                    <Key size={120} />
                </div>
                <CardHeader>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-3 bg-primary text-white rounded-2xl shadow-lg">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black">Akses Administrator</CardTitle>
                            <CardDescription>Aktifkan akses penuh ke seluruh fitur sistem manajemen sekolah.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                    <Alert className="bg-white/50 dark:bg-black/20 border-none">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <AlertTitle className='font-bold text-sm'>Sistem Terdeteksi Baru</AlertTitle>
                        <AlertDescription className='text-xs'>
                            Sebagai pengguna pertama, Anda berhak mempromosikan akun Anda sendiri menjadi Administrator tunggal tanpa perlu membuka Firebase Console.
                        </AlertDescription>
                    </Alert>
                    <Button onClick={handleSelfPromote} size="lg" className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                        AKTIFKAN HAK AKSES ADMIN <ShieldCheck className='ml-2' />
                    </Button>
                </CardContent>
            </Card>
        )}

        {/* Daftar User: Hanya dikelola jika sudah Admin */}
        {isAdmin && (
            <Card className="shadow-lg rounded-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users /> Manajemen Pengguna</CardTitle>
                    <CardDescription>Kelola peran dan hak akses seluruh pengguna sistem.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border overflow-hidden">
                        <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                            <TableHead>Nama Pengguna</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Peran</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && <TableRow><TableCell colSpan={4} className="text-center py-10"><LoaderCircle className="animate-spin mx-auto text-primary" /></TableCell></TableRow>}
                            {users?.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell className="font-semibold">{u.displayName || u.email?.split('@')[0] || '-'}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>{getRoleBadge(u.role)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(u as UserProfile & { id: string })} disabled={u.id === currentUser?.uid}><Edit className="h-4 w-4 mr-2" /> Edit</Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(u as UserProfile & { id: string })} disabled={u.id === currentUser?.uid} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && users?.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Belum ada pengguna terdaftar.</TableCell></TableRow>}
                        </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ubah Peran Pengguna</DialogTitle>
                    <DialogDescription>Atur tingkat akses untuk akun <strong>{editingUser?.email}</strong>.</DialogDescription>
                </DialogHeader>
                {editingUser && (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                            <FormField control={form.control} name="role" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pilih Peran Baru</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {USER_ROLES.map(role => (
                                              <SelectItem key={role.value} value={role.value}>
                                                <div className="flex items-center gap-2"><role.icon size={16} /><span>{role.label}</span></div>
                                              </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <Button type="submit" className="w-full h-12 rounded-xl font-bold">Simpan Perubahan</Button>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    </div>
  );
}
