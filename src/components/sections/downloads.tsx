'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type DownloadableFile } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { Folder, FileText, Download } from 'lucide-react';
import { Button } from '../ui/button';

const DownloadsSection = () => {
  const firestore = useFirestore();
  const filesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/downloadableFiles`);
    return query(ref, orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: files, isLoading } = useCollection<DownloadableFile>(filesQuery);

  const groupedFiles = useMemo(() => {
    if (!files) return {};
    return files.reduce((acc, file) => {
      const category = file.category || 'Lainnya';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(file);
      return acc;
    }, {} as Record<string, DownloadableFile[]>);
  }, [files]);

  return (
    <section className="py-16 max-w-5xl mx-auto px-6 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold font-headline text-primary">Pusat Unduhan</h2>
        <p className="text-lg text-muted-foreground mt-2">Unduh formulir, modul, dan dokumen penting lainnya di sini.</p>
      </div>
      <div className="space-y-12">
        {isLoading && Array.from({length: 2}).map((_, i) => (
            <div key={i}>
                <Skeleton className='h-8 w-48 mb-6' />
                <div className="space-y-4">
                    <Skeleton className='h-20 w-full' />
                    <Skeleton className='h-20 w-full' />
                </div>
            </div>
        ))}
        {Object.entries(groupedFiles).map(([category, categoryFiles]) => (
          <div key={category}>
            <h3 className="text-2xl font-bold mb-6 font-headline text-primary flex items-center gap-3">
              <Folder /> {category}
            </h3>
            <div className="space-y-4">
              {categoryFiles.map((file) => (
                <Card key={file.id} className="shadow-md hover:shadow-lg transition-shadow rounded-xl">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                        <FileText className='text-primary' />
                    </div>
                    <div className="flex-grow">
                        <h4 className="font-bold text-lg">{file.title}</h4>
                        {file.description && (
                            <p className="text-sm text-muted-foreground mt-1">{file.description}</p>
                        )}
                    </div>
                    <Button asChild>
                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" download>
                            <Download className="mr-2 h-4 w-4" />
                            Unduh
                        </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
         {!isLoading && (!files || files.length === 0) && (
            <p className="text-muted-foreground text-center py-10">Admin belum menambahkan file untuk diunduh.</p>
        )}
      </div>
    </section>
  );
};

export default DownloadsSection;
