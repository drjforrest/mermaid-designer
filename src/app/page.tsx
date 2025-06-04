
"use client";

import { useState, useEffect, useCallback } from 'react';
import { AppHeader } from '@/components/app-header';
import { MermaidCodeEditor } from '@/components/mermaid-code-editor';
import { MermaidVisualizer } from '@/components/mermaid-visualizer';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = 'mermaidVizLabLastDiagram';
const DIAGRAM_THEME_LOCAL_STORAGE_KEY = 'mermaidVizLabDiagramTheme';
const DIAGRAM_FONT_FAMILY_LOCAL_STORAGE_KEY = 'mermaidVizLabDiagramFontFamily';
const FLOWCHART_USE_MAX_WIDTH_LOCAL_STORAGE_KEY = 'mermaidVizLabFlowchartUseMaxWidth';

export default function Home() {
  const [mermaidCode, setMermaidCode] = useState<string>('');
  const [diagramTheme, setDiagramTheme] = useState<string>('base');
  const [diagramFontFamily, setDiagramFontFamily] = useState<string>('Inter');
  const [flowchartUseMaxWidth, setFlowchartUseMaxWidth] = useState<boolean>(true);

  const debouncedMermaidCode = useDebounce(mermaidCode, 500);
  const { toast } = useToast();

  useEffect(() => {
    const savedCode = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedCode) {
      setMermaidCode(savedCode);
      toast({ title: "Diagram Loaded", description: "Restored your last saved diagram." });
    }

    const savedTheme = localStorage.getItem(DIAGRAM_THEME_LOCAL_STORAGE_KEY);
    if (savedTheme) {
      setDiagramTheme(savedTheme);
    }

    const savedFontFamily = localStorage.getItem(DIAGRAM_FONT_FAMILY_LOCAL_STORAGE_KEY);
    if (savedFontFamily) {
      setDiagramFontFamily(savedFontFamily);
    }

    const savedFlowchartUseMaxWidth = localStorage.getItem(FLOWCHART_USE_MAX_WIDTH_LOCAL_STORAGE_KEY);
    if (savedFlowchartUseMaxWidth !== null) {
      setFlowchartUseMaxWidth(JSON.parse(savedFlowchartUseMaxWidth));
    }
  }, [toast]);
  
  const handleCodeChange = useCallback((newCode: string) => {
    // For now, MermaidCodeEditor will call setMermaidCode directly via prop.
  }, []);

  const handleSaveDiagram = (codeToSave: string) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, codeToSave);
    toast({ title: "Diagram Saved", description: "Your current diagram has been saved locally." });
  };

  const handleLoadDiagram = (): string | null => {
    const savedCode = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedCode) {
      setMermaidCode(savedCode);
      toast({ title: "Diagram Loaded", description: "Loaded your last saved diagram." });
      return savedCode;
    } else {
      toast({ variant: "destructive", title: "Load Error", description: "No diagram found in local storage." });
      return null;
    }
  };

  const handleDiagramThemeChange = (newTheme: string) => {
    setDiagramTheme(newTheme);
    localStorage.setItem(DIAGRAM_THEME_LOCAL_STORAGE_KEY, newTheme);
    toast({ title: "Diagram Theme Changed", description: `Switched to ${newTheme} theme.` });
  };

  const handleDiagramFontFamilyChange = (newFontFamily: string) => {
    setDiagramFontFamily(newFontFamily);
    localStorage.setItem(DIAGRAM_FONT_FAMILY_LOCAL_STORAGE_KEY, newFontFamily);
    toast({ title: "Diagram Font Changed", description: `Switched to ${newFontFamily} font.` });
  };

  const handleFlowchartUseMaxWidthChange = (useMaxWidth: boolean) => {
    setFlowchartUseMaxWidth(useMaxWidth);
    localStorage.setItem(FLOWCHART_USE_MAX_WIDTH_LOCAL_STORAGE_KEY, JSON.stringify(useMaxWidth));
    toast({ title: "Flowchart Setting Changed", description: `Use Max Width set to ${useMaxWidth}.` });
  };
  
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <AppHeader />
      <main className="flex flex-1 flex-col md:flex-row overflow-hidden p-2 md:p-4 gap-2 md:gap-4">
        <MermaidCodeEditor 
          onCodeChange={handleCodeChange} 
          mermaidCode={mermaidCode}
          setMermaidCode={setMermaidCode}
        />
        <MermaidVisualizer 
          mermaidCode={debouncedMermaidCode}
          onSaveDiagram={handleSaveDiagram}
          onLoadDiagram={handleLoadDiagram}
          diagramTheme={diagramTheme}
          onDiagramThemeChange={handleDiagramThemeChange}
          diagramFontFamily={diagramFontFamily}
          onDiagramFontFamilyChange={handleDiagramFontFamilyChange}
          flowchartUseMaxWidth={flowchartUseMaxWidth}
          onFlowchartUseMaxWidthChange={handleFlowchartUseMaxWidthChange}
        />
      </main>
    </div>
  );
}
