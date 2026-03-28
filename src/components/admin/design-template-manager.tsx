
'use client';

import { useState } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { SCHOOL_DATA_ID, type School } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Layout, Palette, Sparkles, LoaderCircle } from 'lucide-react';
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
  { id: 'obsidian-minimal', name: 'Minimal Obsidian', description: 'Deep dark matte with royal blue accents.', primaryColor: '221 83% 53%', accentColor: '262 83% 58%', previewClass: 'bg-[#0a0c1b]' },
  { id: 'cyber-neon', name: 'Neon Cyberpunk', description: 'Electric cyan and futuristic purple glow.', primaryColor: '190 100% 50%', accentColor: '280 100% 60%', previewClass: 'bg-black' },
  { id: 'emerald-nature', name: 'Emerald Fresh', description: 'Soothing nature-inspired greens and clean white.', primaryColor: '160 84% 39%', accentColor: '142 71% 45%', previewClass: 'bg-[#f0f9f4]' },
  { id: 'corporate-blue', name: 'Corporate Blue', description: 'Professional stable blue for institutions.', primaryColor: '221 83% 53%', accentColor: '210 40% 96.1%', previewClass: 'bg-[#f8fafc]' },
  { id: 'slate-pro', name: 'Slate Professional', description: 'Sophisticated greys with subtle deep blue.', primaryColor: '215 25% 27%', accentColor: '217 32% 17%', previewClass: 'bg-[#1e293b]' },
  { id: 'royal-gold', name: 'Royal Gold', description: 'Elegant black and shimmering gold highlights.', primaryColor: '45 93% 47%', accentColor: '45 100% 50%', previewClass: 'bg-black' },
  { id: 'crimson-academic', name: 'Crimson Classic', description: 'Traditional academic red with crisp white.', primaryColor: '0 72% 51%', accentColor: '0 84% 60%', previewClass: 'bg-white' },
  { id: 'midnight-galaxy', name: 'Midnight Galaxy', description: 'Deep cosmic purple and starlight effects.', primaryColor: '262 83% 58%', accentColor: '280 100% 70%', previewClass: 'bg-[#020617]' },
  { id: 'pure-zen', name: 'Pure Minimalist', description: 'Ultra-clean white space and simple typography.', primaryColor: '0 0% 0%', accentColor: '0 0% 20%', previewClass: 'bg-white' },
  { id: 'sunset-bloom', name: 'Sunset Warmth', description: 'Energetic oranges and soft coral tones.', primaryColor: '24 95% 53%', accentColor: '32 95% 44%', previewClass: 'bg-[#fff7ed]' },
  { id: 'lavender-dreams', name: 'Lavender Mist', description: 'Soft pastel purples for a modern friendly feel.', primaryColor: '262 83% 58%', accentColor: '262 83% 80%', previewClass: 'bg-[#faf5ff]' },
  { id: 'cyber-lime', name: 'Tech Lime', description: 'High-contrast dark mode with neon lime.', primaryColor: '75 100% 50%', accentColor: '84 100% 59%', previewClass: 'bg-[#050505]' },
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
        title: 'Design Applied',
        description: `Theme "${template.name}" is now active across the platform.`,
      });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Update Failed' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="py-20 flex justify-center"><LoaderCircle className="animate-spin text-primary h-8 w-8" /></div>;

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-black font-headline tracking-tighter uppercase italic">Design Engine <span className="text-primary">v1.0</span></h2>
        <p className="text-muted-foreground text-sm font-medium mt-1">Transform your school's digital identity with a single click.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {TEMPLATES.map((tpl) => {
          const isActive = schoolData?.selectedTemplate === tpl.id;
          
          return (
            <Card 
              key={tpl.id} 
              className={cn(
                "relative group cursor-pointer border-2 transition-all duration-500 overflow-hidden rounded-[2.5rem]",
                isActive ? "border-primary shadow-2xl scale-[1.02]" : "border-white/5 hover:border-white/20 hover:-translate-y-1 bg-white/5"
              )}
              onClick={() => !isUpdating && handleSelectTemplate(tpl)}
            >
              <div className={cn("h-32 w-full relative", tpl.previewClass)}>
                <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                  <Sparkles size={40} className="text-white" />
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
                  <div className="h-4 w-8 rounded-full opacity-50" style={{ backgroundColor: `hsl(${tpl.accentColor})` }}></div>
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
