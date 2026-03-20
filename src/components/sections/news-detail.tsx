'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import type { NewsArticle } from '@/lib/data';
import { SCHOOL_DATA_ID } from '@/lib/data';
import { ArrowLeft, Calendar, Tag, User, Send, LoaderCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { convertGoogleDriveLink } from '@/lib/utils';

type NewsDetailProps = {
  article: NewsArticle;
  onBack: () => void;
};

type Comment = {
  id: string;
  name: string;
  comment: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | Date;
};

const NewsDetailSection = ({ article, onBack }: NewsDetailProps) => {
  const articleDate = article.datePublished ? 
    format(new Date(article.datePublished.seconds * 1000), "d MMMM yyyy", { locale: idLocale })
    : 'Tanggal tidak tersedia';
    
  const firestore = useFirestore();

  const [commenterName, setCommenterName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const commentsRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/newsArticles/${article.id}/comments`);
    return query(commentsRef, orderBy('createdAt', 'desc'));
  }, [firestore, article.id]);

  const { data: comments, isLoading: areCommentsLoading } = useCollection<Comment>(commentsQuery);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commenterName.trim() && commentText.trim() && firestore) {
      setIsSubmitting(true);
      const commentsRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/newsArticles/${article.id}/comments`);
      
      addDocumentNonBlocking(commentsRef, {
        articleId: article.id.toString(),
        name: commenterName,
        comment: commentText,
        createdAt: serverTimestamp(),
      });
      
      // Optimistic UI update
      setCommenterName('');
      setCommentText('');
      setIsSubmitting(false);
      
    }
  };


  return (
    <section className="py-16 max-w-4xl mx-auto px-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="mb-8 -ml-4">
        <ArrowLeft className="mr-2" />
        Kembali ke Berita
      </Button>
      
      <h1 className="text-3xl font-bold font-headline text-primary mb-4 leading-tight">{article.title}</h1>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-6">
        <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>{articleDate}</span>
        </div>
        <div className="flex items-center gap-2">
            <Tag size={16} />
            <span>{article.category}</span>
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

      {/* Comment Section */}
      <div className="mt-16 pt-12 border-t">
          <h3 className="text-2xl font-bold font-headline mb-6">Tinggalkan Komentar</h3>
          <Card className="p-6 rounded-2xl">
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <Input 
                      placeholder="Nama Anda" 
                      value={commenterName}
                      onChange={(e) => setCommenterName(e.target.value)}
                      required
                      disabled={isSubmitting}
                  />
                  <Textarea 
                      placeholder="Tulis komentar Anda di sini..." 
                      rows={4}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      required
                      disabled={isSubmitting}
                  />
                  <Button type="submit" disabled={isSubmitting || !firestore}>
                      {isSubmitting ? <LoaderCircle className="animate-spin mr-2" /> : <Send className="mr-2" />} 
                      {isSubmitting ? "Mengirim..." : "Kirim Komentar"}
                  </Button>
              </form>
          </Card>

          <div className="mt-12 space-y-8">
              <h3 className="text-2xl font-bold font-headline mb-6">{comments?.length ?? 0} Komentar</h3>
              {areCommentsLoading && <p className="text-muted-foreground">Memuat komentar...</p>}
              
              {comments && comments.map((comment) => {
                const commentDate = comment.createdAt instanceof Date 
                    ? comment.createdAt 
                    : new Date((comment.createdAt?.seconds ?? 0) * 1000);

                return (
                  <div key={comment.id} className="flex items-start gap-4">
                      <Avatar>
                          <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                      <div>
                          <p className="font-bold">{comment.name}</p>
                          <p className="text-sm text-muted-foreground mb-2">
                              {format(commentDate, "d MMMM yyyy, HH:mm", { locale: idLocale })}
                          </p>
                          <p className="text-foreground/90">{comment.comment}</p>
                      </div>
                  </div>
                )
              })}
              
              {!areCommentsLoading && comments?.length === 0 && (
                  <p className="text-muted-foreground">Belum ada komentar. Jadilah yang pertama!</p>
              )}
          </div>
      </div>
    </section>
  );
};

export default NewsDetailSection;
