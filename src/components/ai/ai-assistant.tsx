

'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bot, Send, User, X, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chatWithSchoolAI } from '@/ai/flows/school-assistant-flow';

/**
 * Komponen Floating AI Assistant.
 * Menangani chat interaktif antara pengguna dan AI asisten sekolah.
 */
export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Halo! Saya asisten SMKS PGRI 2 Kedondong. Ada yang bisa saya bantu terkait info sekolah, pendaftaran, atau fasilitas?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatWithSchoolAI({ query: userMsg });
      setMessages(prev => [...prev, { role: 'ai', text: response.answer }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Maaf, saya sedang mengalami kendala teknis. Silakan tanyakan kembali beberapa saat lagi.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-[60]">
      {isOpen ? (
        <Card className="w-[320px] sm:w-[380px] h-[500px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 duration-300 border-primary/20 overflow-hidden rounded-2xl">
          <CardHeader className="bg-primary text-white flex flex-row items-center justify-between py-4 px-5">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot size={20} />
              </div>
              <CardTitle className="text-sm font-bold font-headline tracking-tight">SmartSchool Assistant</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10 h-8 w-8">
              <X size={18} />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border",
                  m.role === 'user' ? "bg-primary text-white" : "bg-white text-primary"
                )}>
                  {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={cn(
                  "p-3 rounded-2xl text-sm max-w-[80%] shadow-sm",
                  m.role === 'user' 
                    ? "bg-primary text-white rounded-tr-none" 
                    : "bg-white border rounded-tl-none text-foreground"
                )}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center">
                  <Bot size={14} className='text-primary'/>
                </div>
                <div className="bg-white border p-3 rounded-2xl rounded-tl-none">
                  <LoaderCircle className="animate-spin text-primary h-4 w-4" />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4 border-t bg-background">
            <div className="flex w-full gap-2">
              <Input 
                placeholder="Tanya info sekolah..." 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="rounded-full h-10 border-primary/10 focus-visible:ring-primary"
              />
              <Button size="icon" onClick={handleSend} disabled={isLoading} className="rounded-full h-10 w-10 shrink-0">
                <Send size={16} />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ) : (
        <Button 
          onClick={() => setIsOpen(true)} 
          className="h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-white hover:scale-110 transition-transform flex items-center justify-center p-0"
        >
          <Bot size={28} />
        </Button>
      )}
    </div>
  );
}

