'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy, deleteDoc } from 'firebase/firestore';
import { useCollection, useFirestore, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
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
import { Edit, LoaderCircle, Users, ShieldCheck, UserCog, GraduationCap, Briefcase, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/firebase';
import { Badge } from '@/components/ui/badge';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile & { id: string } | null>(null);
  const { user: currentUser } = useUser();

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

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingUser(null);
      form.reset();
    }
  }, [isDialogOpen, form]);
  
  const handleEdit = (user: UserProfile & { id: string }) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = async (user: UserProfile & { id: string }) => {
    if (!firestore || !user.id) return;
    if (confirm(`Hapus akses database untuk ${user.email}? Tindakan ini tidak menghapus akun autentikasi, hanya profil databasenya.`)) {
      try {
        await deleteDoc(doc(firestore, 'users', user.id));
        toast({ title: 'Profil Dihapus', description: 'Profil pengguna telah dihapus dari database.' });
      } catch (e) {
        toast({ variant: 'destructive', title: 'Gagal Menghapus', description: 'Anda tidak memiliki izin.' });
      }
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !editingUser) return;
    
    const docRef = doc(firestore, 'users', editingUser.id);
    updateDocumentNonBlocking(docRef, values);
    toast({ title: 'Peran Diperbarui', description: `Pengguna ${editingUser.email} sekarang memiliki akses sebagai ${values.role}.` });
    
    setIsDialogOpen(false);
  }

  const getRoleBadge = (role: UserProfile['role']) => {
    const roleInfo = USER_ROLES.find(r => r.value === role);
    const Icon = roleInfo?.icon || Users;
    
    switch(role) {
      case 'admin': return <Badge className="bg-red-500 hover:bg-red-600"><Icon size={12} className="mr-1" /> Admin</Badge>;
      case 'guru': return <Badge className="bg-amber-500 hover:bg-amber-600"><Icon size={12} className="mr-1" /> Guru</Badge>;
      case 'siswa': return <Badge className="bg-blue-500 hover:bg-blue-600"><Icon size={12} className="mr-1" /> Siswa</Badge>;
      case 'alumni': return <Badge className="bg-slate-500 hover:bg-slate-600"><Icon size={12} className="mr-1" /> Alumni</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  }
  
  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users /> Manajemen Pengguna & Hak Akses</CardTitle>
            <CardDescription>Kelola peran seluruh pengguna yang telah login untuk mengatur hak akses ke fitur internal.</CardDescription>
        </CardHeader>
        <CardContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ubah Peran Pengguna</DialogTitle>
                    <DialogDescription>Pilih peran baru untuk mengatur apa yang dapat diakses oleh pengguna ini.</DialogDescription>
                </DialogHeader>
                {editingUser && (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                            <div className="bg-muted p-4 rounded-xl space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Detail Pengguna</p>
                                <p className="font-bold text-foreground">{editingUser.displayName || 'Tanpa Nama'}</p>
                                <p className="text-sm text-muted-foreground">{editingUser.email}</p>
                            </div>
                             <FormField control={form.control} name="role" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pilih Peran Baru</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Pilih peran" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {USER_ROLES.map(role => (
                                              <SelectItem key={role.value} value={role.value}>
                                                <div className="flex items-center gap-2">
                                                  <role.icon size={16} />
                                                  <span>{role.label}</span>
                                                </div>
                                              </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <Button type="submit" className="w-full h-12 rounded-xl font-bold" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <LoaderCircle className="animate-spin mr-2"/>}
                                Perbarui Hak Akses
                            </Button>
                        </form>
                    </Form>
                )}
                </DialogContent>
            </Dialog>
            <div className="rounded-xl border overflow-hidden">
                <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                    <TableHead>Nama Pengguna</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Peran Saat Ini</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center py-10"><LoaderCircle className="animate-spin mx-auto text-primary" /></TableCell>
                    </TableRow>
                    )}
                    {users && users.length > 0 ? (
                    users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-semibold">{user.displayName || '-'}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => handleEdit(user as UserProfile & { id: string })}
                                        disabled={user.id === currentUser?.uid}
                                        className="rounded-lg"
                                    >
                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleDelete(user as UserProfile & { id: string })}
                                        disabled={user.id === currentUser?.uid}
                                        className="rounded-lg text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    !isLoading && <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Tidak ada pengguna ditemukan. Pastikan sudah ada yang login.</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
