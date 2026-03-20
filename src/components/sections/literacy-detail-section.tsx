'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import type { LiteracyArticle } from '@/lib/data';
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { convertGoogleDriveLink } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type LiteracyDetailProps = {
  article: LiteracyArticle;
  onBack: () => void;
};

const LiteracyDetailSection = ({ article, onBack }: LiteracyDetailProps) => {
  const articleDate = article.datePublished ? 
    format(new Date(article.datePublished.seconds * 1000), "d MMMM yyyy", { locale: idLocale })
    : 'Tanggal tidak tersedia';

  return (
    <section className="py-16 max-w-4xl mx-auto px-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="mb-8 -ml-4">
        <ArrowLeft className="mr-2" />
        Kembali ke Pojok Literasi
      </Button>
      
      <Badge variant="secondary" className="mb-4">{article.category}</Badge>
      <h1 className="text-3xl font-bold font-headline text-primary mb-4 leading-tight">{article.title}</h1>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-6 border-y py-3">
        <div className="flex items-center gap-2">
            <User size={16} />
            <span className='font-medium'>{article.studentName} - {article.studentClass}</span>
        </div>
        <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>{articleDate}</span>
        </div>
      </div>

      {article.imageUrl && (
        <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl mb-8 border">
          <Image 
            src={convertGoogleDriveLink(article.imageUrl)} 
            alt={article.title} 
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      
      <div className="prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-base md:text-lg whitespace-pre-wrap">
        {article.content}
      </div>
    </section>
  );
};

export default LiteracyDetailSection;
