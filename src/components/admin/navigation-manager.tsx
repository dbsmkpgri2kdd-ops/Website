
'use client';

import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { SCHOOL_DATA_ID, type School, type NavItem, NAV_MENU_DEFAULT } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MoveUp, MoveDown, Plus, Trash2, Save, LayoutGrid, ChevronRight, ChevronDown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export function NavigationManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const schoolDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'schools', SCHOOL_DATA_ID) : null, [firestore]);
  const { data: schoolData, isLoading } = useDoc<School>(schoolDocRef);

  const [menuItems, setMenuItems] = useState<NavItem[]>([]);

  useEffect(() => {
    if (schoolData?.customMenu) {
      setMenuItems(schoolData.customMenu);
    } else {
      setMenuItems(NAV_MENU_DEFAULT);
    }
  }, [schoolData]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...menuItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setMenuItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = menuItems.filter((_, i) => i !== index);
    setMenuItems(newItems);
  };

  const addItem = () => {
    setMenuItems([...menuItems, { label: 'Menu Baru', id: 'home' as any }]);
  };

  const updateItemLabel = (index: number, label: string) => {
    const newItems = [...menuItems];
    newItems[index].label = label;
    setMenuItems(newItems);
  };

  const addChildItem = (parentIdx: number) => {
    const newItems = [...menuItems];
    if (!newItems[parentIdx].children) newItems[parentIdx].children = [];
    newItems[parentIdx].children?.push({ label: 'Sub Menu Baru', id: 'home' as any });
    setMenuItems(newItems);
  };

  const removeChildItem = (parentIdx: number, childIdx: number) => {
    const newItems = [...menuItems];
    newItems[parentIdx].children = newItems[parentIdx].children?.filter((_, i) => i !== childIdx);
    setMenuItems(newItems);
  };

  const updateChildLabel = (parentIdx: number, childIdx: number, label: string) => {
    const newItems = [...menuItems];
    if (newItems[parentIdx].children) {
      newItems[parentIdx].children![childIdx].label = label;
    }
    setMenuItems(newItems);
  };

  const handleSave = () => {
    if (!schoolDocRef) return;
    updateDocumentNonBlocking(schoolDocRef, { customMenu: menuItems });
    toast({ title: 'Menu Disimpan', description: 'Navigasi website telah diperbarui secara global.' });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <Alert className="bg-primary/5 border-primary/20">
        <LayoutGrid className="h-4 w-4 text-primary" />
        <AlertTitle className='font-black uppercase tracking-widest text-[10px]'>Navigation Engine v2.0</AlertTitle>
        <AlertDescription className='text-xs font-medium'>
          Atur struktur menu navigasi utama. Perubahan akan berdampak pada Header dan Footer website.
        </AlertDescription>
      </Alert>

      <Card className="shadow-2xl border-none rounded-[2rem]">
        <CardHeader>
          <CardTitle className="font-headline font-black italic uppercase">Struktur Navigasi</CardTitle>
          <CardDescription>Gunakan tombol panah untuk mengatur urutan menu utama dan sub-menu.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {menuItems.map((item, idx) => (
              <div key={idx} className="space-y-3 p-6 bg-white/5 border border-white/5 rounded-3xl group">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItem(idx, 'up')} disabled={idx === 0}>
                      <MoveUp size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItem(idx, 'down')} disabled={idx === menuItems.length - 1}>
                      <MoveDown size={14} />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <Input 
                      value={item.label} 
                      onChange={(e) => updateItemLabel(idx, e.target.value)}
                      className="bg-transparent border-none font-black text-lg h-8 focus-visible:ring-0 px-0 uppercase tracking-tighter italic"
                    />
                    <p className='text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em]'>Menu Utama</p>
                  </div>
                  <div className='flex gap-2'>
                    <Button variant="outline" size="sm" className="h-8 rounded-xl font-bold text-[9px] uppercase tracking-widest" onClick={() => addChildItem(idx)}>
                      <Plus size={12} className="mr-1" /> Sub-menu
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeItem(idx)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                {/* Sub Menu Area */}
                {item.children && item.children.length > 0 && (
                  <div className="ml-10 space-y-2 border-l-2 border-primary/20 pl-6 mt-4">
                    {item.children.map((child, cIdx) => (
                      <div key={cIdx} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-primary/20 transition-all">
                        <ChevronRight size={14} className='text-primary' />
                        <Input 
                          value={child.label} 
                          onChange={(e) => updateChildLabel(idx, cIdx, e.target.value)}
                          className="bg-transparent border-none font-bold text-xs h-6 focus-visible:ring-0 px-0 uppercase tracking-widest"
                        />
                        <Button variant="ghost" size="icon" className="text-destructive h-6 w-6 opacity-40 hover:opacity-100" onClick={() => removeChildItem(idx, cIdx)}>
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full h-14 rounded-2xl border-dashed border-2 font-black uppercase tracking-[0.2em] text-[10px]" onClick={addItem}>
            <Plus size={16} className="mr-2" /> Tambah Menu Utama
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end sticky bottom-8 z-50">
        <Button onClick={handleSave} size="lg" className="font-black px-12 h-16 rounded-3xl shadow-3xl glow-primary hover:scale-105 transition-all uppercase tracking-widest">
          <Save className="mr-2 h-5 w-5" /> Terapkan Navigasi Global
        </Button>
      </div>
    </div>
  );
}
