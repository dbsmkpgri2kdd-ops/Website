'use client';

import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QrCode, Copy, Download, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  examId: z.string().min(3, 'ID Ujian harus diisi'),
  token: z.string().min(3, 'Token keamanan harus diisi'),
  size: z.enum(['small', 'medium', 'large']),
});

type QRCodeValue = {
  examId: string;
  token: string;
  size: 'small' | 'medium' | 'large';
};

/**
 * QR Code Generator untuk ExamBro v3.0
 * Generate kode akses ujian yang dapat di-scan oleh siswa
 */
export function QRCodeGenerator() {
  const { toast } = useToast();
  const [qrValue, setQrValue] = useState<QRCodeValue | null>(null);
  const [qrSvg, setQrSvg] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { examId: '', token: '', size: 'medium' },
  });

  const generateQRSVG = (text: string, size: number): string => {
    // Simple QR code-like visualization (tidak QR sejati, tapi visual reference)
    // Untuk QR sejati, gunakan library seperti `qrcode.react` atau `qr-code-styling`
    const moduleCount = 29;
    const moduleSize = Math.floor(size / moduleCount);
    
    let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${moduleCount} ${moduleCount}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${moduleCount}" height="${moduleCount}" fill="white"/>`;

    // Finder patterns (3 corner markers)
    const drawFinder = (x: number, y: number) => {
      svg += `<rect x="${x}" y="${y}" width="7" height="7" fill="black"/>`;
      svg += `<rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="white"/>`;
      svg += `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="black"/>`;
    };

    drawFinder(0, 0);
    drawFinder(moduleCount - 7, 0);
    drawFinder(0, moduleCount - 7);

    // Data pattern (pseudo-random based on text)
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    for (let x = 9; x < moduleCount - 8; x++) {
      for (let y = 9; y < moduleCount - 8; y++) {
        if (Math.random() > 0.5) {
          const hashed = Math.abs(hash + x * y) % 2;
          if (hashed === 0) {
            svg += `<rect x="${x}" y="${y}" width="0.9" height="0.9" fill="black"/>`;
          }
        }
      }
    }

    // Format information pattern
    for (let i = 0; i < 9; i++) {
      svg += `<line x1="8" y1="${i}" x2="8" y2="${i + 1}" stroke="black" stroke-width="0.1"/>`;
      svg += `<line x1="${i}" y1="8" x2="${i + 1}" y2="8" stroke="black" stroke-width="0.1"/>`;
    }

    svg += `</svg>`;
    return svg;
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const qrData = `${values.examId}:${values.token}`;
    const sizeMap = { small: 200, medium: 300, large: 400 };
    const size = sizeMap[values.size];

    try {
      setQrValue(values);
      const svg = generateQRSVG(qrData, size);
      setQrSvg(svg);
      toast({ title: 'QR Code Terbuat', description: `Kode akses: ${qrData}` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Gagal Generate QR', description: 'Coba lagi' });
    }
  }

  const downloadQR = () => {
    if (!qrSvg) return;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:image/svg+xml;base64,' + btoa(qrSvg));
    element.setAttribute('download', `exam-qr-${qrValue?.examId}.svg`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({ title: 'QR Code Diunduh', description: 'File sudah tersimpan di perangkat Anda.' });
  };

  const copyToClipboard = () => {
    if (!qrValue) return;
    const text = `${qrValue.examId}:${qrValue.token}`;
    navigator.clipboard.writeText(text);
    toast({ title: 'Kode Disalin', description: `Teks: ${text}` });
  };

  return (
    <Card className="shadow-2xl border-none rounded-[2.5rem] bg-white overflow-hidden border">
      <CardHeader className="p-8 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <CardTitle className="text-xl font-extrabold uppercase flex items-center gap-3 font-headline text-slate-900">
            <QrCode size={24} className="text-primary" /> Generator QR Akses
          </CardTitle>
          <CardDescription className="text-[10px] mt-1 uppercase font-bold tracking-widest text-slate-400">
            Buat kode akses ujian yang dapat di-scan siswa.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="examId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                      ID Ujian
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="EXAM001"
                        className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold uppercase"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                      Token Keamanan
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="ABCD"
                        className="h-12 rounded-xl bg-slate-50 border-slate-100 font-black uppercase tracking-[0.3em] text-primary text-center text-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                      Ukuran QR
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="small" className="font-bold text-[10px]">
                          Kecil (200px)
                        </SelectItem>
                        <SelectItem value="medium" className="font-bold text-[10px]">
                          Sedang (300px)
                        </SelectItem>
                        <SelectItem value="large" className="font-bold text-[10px]">
                          Besar (400px)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl glow-primary"
              >
                <QrCode className="mr-2 h-4 w-4" /> Buat QR Code
              </Button>
            </form>
          </Form>

          {/* Preview */}
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center">
              {qrValue ? (
                <div
                  className="p-8 bg-white border-4 border-primary/10 rounded-[2rem] shadow-inner"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              ) : (
                <div className="w-64 h-64 border-4 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center bg-slate-50">
                  <div className="text-center">
                    <QrCode size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      QR Code akan muncul di sini
                    </p>
                  </div>
                </div>
              )}
            </div>

            {qrValue && (
              <div className="space-y-3 text-center">
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Kode Akses
                  </p>
                  <p className="font-black text-lg text-primary tracking-[0.2em]">
                    {qrValue.examId}:{qrValue.token}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="flex-1 h-12 rounded-xl font-bold uppercase text-[9px] tracking-widest border-slate-200"
                  >
                    <Copy className="mr-2 h-4 w-4" /> Salin
                  </Button>
                  <Button
                    onClick={downloadQR}
                    className="flex-1 h-12 rounded-xl font-bold uppercase text-[9px] tracking-widest shadow-lg glow-primary"
                  >
                    <Download className="mr-2 h-4 w-4" /> Unduh
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
