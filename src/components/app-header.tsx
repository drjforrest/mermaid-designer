"use client";

import { Projector } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Projector className="h-6 w-6 mr-2 text-primary" />
          <span className="font-headline text-xl font-bold text-primary">Mermaid VizLab</span>
        </div>
        {/* Add navigation or actions here if needed */}
      </div>
    </header>
  );
}
