'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import type { OsisPost } from '@/lib/data';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { convertGoogleDriveLink } from '@/lib/utils';

type OsisCornerDetailProps = {
  post: OsisPost;
  onBack: () => void;
};

const OsisCornerDetailSection = ({ post, onBack }: OsisCornerDetailProps) => {
  const postDate = post.datePublished ? 
    format(new Date(post.datePublished.seconds * 1000), "d MMMM yyyy", { locale: idLocale })
    : 'Tanggal tidak tersedia';

  return (
    <section className="py-16 max-w-4xl mx-auto px-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="mb-8 -ml-4">
        <ArrowLeft className="mr-2" />
        Kembali ke Osis Corner
      </Button>
      
      <h1 className="text-3xl font-bold font-headline text-primary mb-4 leading-tight">{post.title}</h1>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-6 border-y py-3">
        <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>{postDate}</span>
        </div>
        <div className="flex items-center gap-2">
            <Tag size={16} />
            <span>{post.category}</span>
        </div>
      </div>

      {post.imageUrl && (
        <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl mb-8 border">
          <Image 
            src={convertGoogleDriveLink(post.imageUrl)} 
            alt={post.title} 
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      
      <div className="prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-base md:text-lg whitespace-pre-wrap">
        {post.content}
      </div>
    </section>
  );
};

export default OsisCornerDetailSection;
