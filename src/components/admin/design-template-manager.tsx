'use client';

import { useState } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { SCHOOL_DATA_ID, type School } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Palette, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Template = {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  previewClass: string;
};

const TEMPLATES: Template[] = [
  { id: 'official-blue-yellow', name: 'Official Brand', description: 'Royal Blue & Vibrant Yellow (Default).', primaryColor: '221.2 83.2% 53.3%', accentColor: '47.9 95.8% 53.1%', previewClass: 'bg-[#3b82f6]' },
  { id: 'clean-minimalist', name: 'Clean Minimalist', description: 'Ultra clean white with standard blue accents.', primaryColor: '221 83% 53%', accentColor: '214 32% 91%', previewClass: 'bg-white' },
];

export function DesignTemplateManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isUpdating, setIsUpdating] = useState(false);

  const schoolDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'schools', SCHOOL_DATA_ID);
  }, [firestore]);

  const { data: schoolData, isLoading } = useDoc<School>(schoolDocRef);

  const handleSelectTemplate = async (template: Template) => {
    if (!firestore || !schoolDocRef) return;
    
    setIsUpdating(true);
    try {
      setDocumentNonBlocking(schoolDocRef, {
        selectedTemplate: template.id,
        primaryColor: template.primaryColor,
        accentColor: template.accentColor
      }, { merge: true });
      
      toast({
        title: 'Tema Diterapkan',
        description: `Warna identitas "${template.name}" telah aktif secara global.`,
      });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Gagal memperbarui tema' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="py-20 flex justify-center"><LoaderCircle className="animate-spin text-primary h-8 w-8" /></div>;

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-black font-headline tracking-tighter uppercase">Kustomisasi Visual</h2>
        <p className="text-muted-foreground text-sm font-medium mt-1">Pilih konfigurasi warna resmi sekolah Anda.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATES.map((tpl) => {
          const isActive = schoolData?.selectedTemplate === tpl.id || (tpl.id === 'official-blue-yellow' && !schoolData?.selectedTemplate);
          
          return (
            <Card 
              key={tpl.id} 
              className={cn(
                "relative group cursor-pointer border-2 transition-all duration-300 overflow-hidden rounded-[2.5rem]",
                isActive ? "border-primary shadow-xl scale-[1.02]" : "border-slate-100 hover:border-primary/20 bg-white"
              )}
              onClick={() => !isUpdating && handleSelectTemplate(tpl)}
            >
              <div className={cn("h-32 w-full relative", tpl.previewClass)}>
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <Palette size={40} />
                </div>
                {isActive && (
                  <div className="absolute top-4 right-4 bg-primary text-white p-1.5 rounded-full shadow-lg">
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </div>
              <CardHeader className="p-6">
                <CardTitle className="text-lg font-bold tracking-tight uppercase">{tpl.name}</CardTitle>
                <CardDescription className="text-xs font-medium leading-relaxed">{tpl.description}</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <div className="flex gap-2">
                  <div className="h-4 w-12 rounded-full" style={{ backgroundColor: `hsl(${tpl.primaryColor})` }}></div>
                  <div className="h-4 w-8 rounded-full" style={{ backgroundColor: `hsl(${tpl.accentColor})` }}></div>
                </div>
              </CardContent>
              {isUpdating && isActive && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10">
                  <LoaderCircle className="animate-spin text-primary" />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}