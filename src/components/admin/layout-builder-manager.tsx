
'use client';

import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { SCHOOL_DATA_ID, type School } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { GripVertical, MoveUp, MoveDown, Save, Layout, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const DEFAULT_SECTIONS = [
  { id: 'hero', label: 'Impact Hero Banner', desc: 'Area utama fullscreen di bagian atas.' },
  { id: 'partners', label: 'Industry Slider', desc: 'Daftar logo mitra industri yang bekerjasama.' },
  { id: 'stats', label: 'School Statistics', desc: 'Angka pencapaian sekolah (Siswa, Guru, dll).' },
  { id: 'majors', label: 'Academic Programs', desc: 'Blok informasi jurusan unggulan.' },
  { id: 'showcase', label: 'Student Portfolio', desc: 'Pameran karya terbaik dari para siswa.' },
  { id: 'news', label: 'Activity Updates', desc: 'Berita, pengumuman, dan agenda terbaru.' },
  { id: 'cta', label: 'Call to Action', desc: 'Banner ajakan pendaftaran di bagian bawah.' },
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
      
      // Menambahkan section default yang mungkin belum ada di order
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
    toast({ title: 'Tata Letak Disimpan', description: 'Urutan bagian di halaman Beranda telah diperbarui.' });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <Alert className="bg-primary/5 border-primary/20">
        <Layout className="h-4 w-4 text-primary" />
        <AlertTitle className='font-black uppercase tracking-widest text-[10px]'>Page Builder v2.0</AlertTitle>
        <AlertDescription className='text-xs font-medium'>
          Atur urutan bagian pada halaman depan dengan memindahkan posisi modul di bawah ini. Modul di posisi teratas akan muncul pertama.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className='lg:col-span-2 space-y-4'>
          {sections.map((section, idx) => {
            const isVisible = schoolData?.layoutSettings?.[`show${section.id.charAt(0).toUpperCase() + section.id.slice(1)}` as keyof typeof schoolData.layoutSettings] !== false;
            
            return (
              <Card key={section.id} className={cn(
                "shadow-2xl border-white/5 bg-white/5 rounded-3xl hover:border-primary/20 transition-all group overflow-hidden",
                !isVisible && "opacity-40"
              )}>
                <CardContent className="p-0 flex items-center">
                  <div className="p-6 bg-white/[0.02] border-r border-white/5 text-primary shrink-0">
                    <GripVertical size={24} className='opacity-40 group-hover:opacity-100 transition-opacity' />
                  </div>
                  <div className="flex-1 p-6">
                    <div className='flex items-center gap-3 mb-1'>
                      <h4 className="font-black uppercase text-sm tracking-widest italic">{section.label}</h4>
                      {!isVisible && <div className='px-2 py-0.5 bg-destructive/10 text-destructive text-[8px] font-black rounded uppercase'>Nonaktif</div>}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed max-w-md">{section.desc}</p>
                  </div>
                  <div className="flex gap-2 p-6">
                    <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 bg-white/5 hover:bg-primary/10" onClick={() => moveSection(idx, 'up')} disabled={idx === 0}>
                      <MoveUp size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 bg-white/5 hover:bg-primary/10" onClick={() => moveSection(idx, 'down')} disabled={idx === sections.length - 1}>
                      <MoveDown size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className='space-y-6'>
          <Card className='rounded-3xl bg-primary/5 border-primary/10'>
            <CardHeader>
              <CardTitle className='text-sm font-black uppercase tracking-widest'>Petunjuk Penggunaan</CardTitle>
            </CardHeader>
            <CardContent className='text-xs space-y-4 text-muted-foreground font-medium leading-relaxed'>
              <p>1. Gunakan tombol panah untuk memindahkan modul ke atas atau ke bawah.</p>
              <p>2. Modul yang tampil pudar menandakan modul tersebut sedang dinonaktifkan melalui menu <strong>KONFIGURASI</strong>.</p>
              <p>3. Klik tombol <strong>Terapkan Tata Letak</strong> untuk menyimpan urutan baru secara permanen.</p>
            </CardContent>
          </Card>
          
          <div className="sticky top-24">
            <Button onClick={handleSave} size="lg" className="w-full font-black h-20 rounded-[2rem] shadow-3xl glow-primary hover:scale-105 transition-all uppercase tracking-widest">
              <Save className="mr-3 h-6 w-6" /> Simpan Tata Letak
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
