
"use client";

import { Projector } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Projector className="h-6 w-6 text-primary shrink-0" />
          <span className="font-headline text-xl font-bold text-primary tracking-tight">Mermaid VizLab</span>
        </div>
        <div className="flex items-center ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
