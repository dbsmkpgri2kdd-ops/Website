'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, MessageSquare, Send, User, LoaderCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { School } from '@/lib/data';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type AiAssistantProps = {
    schoolData: School | null;
    isSchoolDataLoading: boolean;
};

export default function AiAssistant({ schoolData, isSchoolDataLoading }: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, setIsPending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsPending(true);

    // Respon instan untuk mode statis yang ringan
    setTimeout(() => {
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: `Terima kasih! Saya adalah asisten informasi ${schoolData?.shortName || 'sekolah'}. Untuk saat ini, Anda dapat menemukan informasi lengkap melalui menu navigasi kami atau menghubungi admin langsung via WhatsApp di bagian Kontak.` 
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsPending(false);
    }, 600);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  
  useEffect(() => {
    if(isOpen && messages.length === 0){
        const welcomeMessage = `Halo! Ada yang bisa saya bantu terkait ${schoolData?.name || 'sekolah kami'}?`;
        setMessages([{ role: 'assistant', content: welcomeMessage }]);
    }
  }, [isOpen, messages.length, schoolData]);

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50 animate-bounce"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare size={24} />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex flex-col p-0 w-full sm:max-w-md border-none">
          <SheetHeader className="p-6 bg-primary text-primary-foreground">
            <div className="flex items-center justify-between">
                <SheetTitle className="flex items-center gap-2 text-white font-headline">
                <Bot /> Asisten Sekolah
                </SheetTitle>
            </div>
          </SheetHeader>
          <ScrollArea className="flex-grow px-6" ref={scrollAreaRef}>
            <div className="space-y-4 py-6">
              {messages.map((message, index) => (
                <div key={index} className={cn('flex items-end gap-2', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 bg-primary/10 text-primary shrink-0">
                       <AvatarFallback><Bot size={16} /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn('max-w-[85%] rounded-2xl p-3 text-sm shadow-sm', message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none')}>
                    {message.content}
                  </div>
                </div>
              ))}
              {isPending && (
                <div className="flex items-end gap-2 justify-start">
                    <Avatar className="h-8 w-8 bg-muted animate-pulse"><AvatarFallback><LoaderCircle className="animate-spin h-4 w-4" /></AvatarFallback></Avatar>
                    <div className="bg-muted rounded-2xl p-3 text-sm rounded-bl-none animate-pulse">Mengetik...</div>
                </div>
              )}
            </div>
          </ScrollArea>
          <SheetFooter className="p-4 border-t bg-background">
            <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan sesuatu..."
                disabled={isPending}
                className="rounded-full"
              />
              <Button type="submit" size="icon" disabled={isPending || !input.trim()} className="rounded-full">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
