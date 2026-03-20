'use client';
import { Construction } from 'lucide-react';

type PlaceholderSectionProps = {
  title: string;
  description: string;
};

const PlaceholderSection = ({ title, description }: PlaceholderSectionProps) => {
  return (
    <section className="py-16 max-w-4xl mx-auto px-6 animate-fade-in flex flex-col items-center justify-center text-center h-[60vh]">
      <div className="p-6 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400 mb-6">
        <Construction size={48} />
      </div>
      <h2 className="text-3xl font-bold font-headline text-primary mb-4">{title}</h2>
      <p className="text-lg text-muted-foreground max-w-2xl">
        {description}
      </p>
    </section>
  );
};

export default PlaceholderSection;
