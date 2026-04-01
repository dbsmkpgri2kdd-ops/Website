'use client';

import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { SCHOOL_DATA_ID, type School } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { GripVertical, MoveUp, MoveDown, Save, Layout, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const DEFAULT_SECTIONS = [
  { id: 'hero', label: 'Impact hero banner', desc: 'Area visual utama fullscreen di bagian paling atas.' },
  { id: 'partners', label: 'Industry slider', desc: 'Daftar logo mitra industri yang bekerjasama.' },
  { id: 'apps', label: 'Quick app links', desc: 'Grid tautan cepat ke layanan digital mandiri.' },
  { id: 'stats', label: 'School statistics', desc: 'Angka pencapaian sekolah (Siswa, Guru, dll).' },
  { id: 'majors', label: 'Academic programs', desc: 'Blok informasi jurusan unggulan sekolah.' },
  { id: 'news', label: 'Activity updates', desc: 'Berita, pengumuman, dan agenda terbaru.' },
  { id: 'cta', label: 'Call to action', desc: 'Banner ajakan pendaftaran di bagian bawah.' },
];

export function LayoutBuilderManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const schoolDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'schools', SCHOOL_DATA_ID) : null, [firestore]);
  const { data: schoolData, isLoading } = useDoc<School>(schoolDocRef);

  const [sections, setSections] = useState(DEFAULT_SECTIONS);

  useEffect(() => {
    if (schoolData?.layoutSettings?.sectionOrder) {
      const ordered = schoolData.layoutSettings.sectionOrder
        .map(id => DEFAULT_SECTIONS.find(s => s.id === id))
        .filter(Boolean) as typeof DEFAULT_SECTIONS;
      
      DEFAULT_SECTIONS.forEach(s => {
        if (!ordered.find(o => o.id === s.id)) ordered.push(s);
      });
      
      setSections(ordered);
    }
  }, [schoolData]);

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setSections(newSections);
  };

  const handleSave = () => {
    if (!schoolDocRef) return;
    const orderIds = sections.map(s => s.id);
    updateDocumentNonBlocking(schoolDocRef, { 
      'layoutSettings.sectionOrder': orderIds 
    });
    toast({ title: 'Tata letak disimpan', description: 'Urutan bagian di halaman beranda telah diperbarui.' });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className='space-y-2'>
        <h2 className='text-3xl font-black tracking-tighter text-slate-900 font-headline uppercase'>Visual Page Builder</h2>
        <p className='text-[10px] font-bold text-slate-500 uppercase tracking-widest'>Atur urutan bagian beranda tanpa menyentuh kode.</p>
      </div>

      <Alert className="bg-primary/5 border-primary/20 p-6 rounded-[2rem]">
        <Layout className="h-5 w-5 text-primary" />
        <div className='ml-3'>
            <AlertTitle className='font-black uppercase tracking-widest text-[10px] text-primary'>Editor Visual v2.5</AlertTitle>
            <AlertDescription className='text-xs font-bold text-slate-600 mt-1'>
              Gunakan kontrol di bawah untuk memindahkan posisi modul. Perubahan akan langsung berdampak pada halaman depan website.
            </AlertDescription>
        </div>
      </Alert>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className='lg:col-span-2 space-y-4'>
          {sections.map((section, idx) => {
            const isVisible = schoolData?.layoutSettings?.[`show${section.id.charAt(0).toUpperCase() + section.id.slice(1)}` as keyof typeof schoolData.layoutSettings] !== false;
            
            return (
              <Card key={section.id} className={cn(
                "shadow-sm border-slate-200 bg-white rounded-2xl hover:border-primary/20 transition-all group overflow-hidden border-2",
                !isVisible && "opacity-40"
              )}>
                <CardContent className="p-0 flex items-center">
                  <div className="p-6 bg-slate-50 border-r border-slate-100 text-slate-400 shrink-0">
                    <GripVertical size={20} className='group-hover:text-primary transition-colors' />
                  </div>
                  <div className="flex-1 p-6">
                    <div className='flex items-center gap-3 mb-1'>
                      <h4 className="font-black text-sm tracking-tight text-slate-900 uppercase italic font-headline">{section.label}</h4>
                      {!isVisible && <div className='px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black rounded uppercase tracking-widest'>Nonaktif</div>}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-bold leading-relaxed max-w-md uppercase tracking-wider opacity-60">{section.desc}</p>
                  </div>
                  <div className="flex gap-2 p-6">
                    <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-slate-100" onClick={() => moveSection(idx, 'up')} disabled={idx === 0}>
                      <MoveUp size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-slate-100" onClick={() => moveSection(idx, 'down')} disabled={idx === sections.length - 1}>
                      <MoveDown size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className='space-y-6'>
          <Card className='rounded-[2.5rem] bg-slate-50 border-slate-100 border-2 overflow-hidden shadow-md'>
            <CardHeader className='bg-white p-8 border-b'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-primary/10 text-primary rounded-xl'><Info size={18}/></div>
                <CardTitle className='text-[11px] font-black uppercase tracking-[0.2em] font-headline'>Petunjuk penggunaan</CardTitle>
              </div>
            </CardHeader>
            <CardContent className='p-8 space-y-6'>
              <div className='space-y-4'>
                {[
                    "Urutan dari atas ke bawah pada daftar ini mencerminkan urutan di halaman depan.",
                    "Gunakan tombol panah untuk memindahkan modul satu tingkat.",
                    "Modul yang terlihat transparan dapat diaktifkan kembali melalui menu Konfigurasi Sistem.",
                    "Jangan lupa klik tombol simpan di bawah untuk menerapkan perubahan."
                ].map((txt, i) => (
                    <div key={i} className='flex gap-3'>
                        <div className='w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0'></div>
                        <p className='text-[11px] font-bold text-slate-600 leading-relaxed uppercase tracking-wider'>{txt}</p>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="sticky top-24">
            <Button onClick={handleSave} size="lg" className="w-full font-black h-16 rounded-[2rem] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all uppercase tracking-[0.2em] text-xs">
              <Save className="mr-3 h-5 w-5" /> Simpan tata letak
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
