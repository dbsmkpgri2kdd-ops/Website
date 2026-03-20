'use client';

import { collection, query, doc, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, deleteDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type NewsArticle } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

type Comment = {
  id: string;
  name: string;
  comment: string;
  createdAt: { seconds: number; nanoseconds: number; } | Date;
};

type CommentManagerProps = {
  article: NewsArticle;
};

export function CommentManager({ article }: CommentManagerProps) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const commentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const commentsRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/newsArticles/${article.id}/comments`);
    return query(commentsRef, orderBy('createdAt', 'desc'));
  }, [firestore, article.id]);

  const { data: comments, isLoading } = useCollection<Comment>(commentsQuery);
  
  const handleDelete = (commentId: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus komentar ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/newsArticles/${article.id}/comments`, commentId);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Komentar telah dihapus.' });
    }
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const jsDate = date.seconds ? new Date(date.seconds * 1000) : date;
    return format(jsDate, "d MMM yyyy, HH:mm", { locale: idLocale });
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pengirim</TableHead>
            <TableHead>Komentar</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">Memuat komentar...</TableCell>
            </TableRow>
          )}
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <TableRow key={comment.id}>
                <TableCell className="font-medium">{comment.name}</TableCell>
                <TableCell className="max-w-xs truncate">{comment.comment}</TableCell>
                <TableCell>{formatDate(comment.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(comment.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            !isLoading && <TableRow><TableCell colSpan={4} className="text-center">Belum ada komentar pada artikel ini.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
