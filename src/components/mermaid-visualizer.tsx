"use client";

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download, ImageDown, Save, FolderOpen, Loader2 } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface MermaidVisualizerProps {
  mermaidCode: string;
  onSaveDiagram: (code: string) => void;
  onLoadDiagram: () => string | null;
}

// Helper to ensure unique IDs for Mermaid rendering
let mermaidRenderIdCounter = 0;

export function MermaidVisualizer({ mermaidCode, onSaveDiagram, onLoadDiagram }: MermaidVisualizerProps) {
  const mermaidDivRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base', // Using 'base' allows more CSS control if needed
      // For a professional look matching the theme, consider 'neutral' or 'forest' if they fit.
      // Or use themeVariables to align with CSS variables, e.g.:
      // themeVariables: {
      //   primaryColor: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(), // This needs to be HSL to HEX or RGB if mermaid needs that
      //   lineColor: getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim(),
      //   textColor: getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim(),
      // }
      // The above themeVariables approach is complex due to HSL format. Simpler to use a built-in theme for now.
      // Using 'default' or 'neutral' might be good starting points. Let's stick to 'base' for now for flexibility.
      securityLevel: 'loose', // Allow more flexibility, ensure code is from trusted source (user input)
      fontFamily: '"Inter", sans-serif', // Match app font
    });
  }, []);

  useEffect(() => {
    if (mermaidCode && mermaidDivRef.current) {
      setIsRendering(true);
      setRenderError(null);
      // Clear previous diagram explicitly
      mermaidDivRef.current.innerHTML = '';
      
      const renderMermaid = async () => {
        try {
          const uniqueId = `mermaid-diagram-${mermaidRenderIdCounter++}`;
          // Mermaid render can sometimes throw an error directly, or fail silently.
          // The callback style of mermaid.render is safer.
          const {svg} = await mermaid.render(uniqueId, mermaidCode);
          if (mermaidDivRef.current) {
            mermaidDivRef.current.innerHTML = svg;
            setSvgContent(svg);
          }
        } catch (error: any) {
          console.error("Mermaid rendering error:", error);
          let errorMessage = "Error rendering diagram.";
          if (error && typeof error.message === 'string') {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
          setRenderError(errorMessage);
          if (mermaidDivRef.current) {
            mermaidDivRef.current.innerHTML = `<div class="p-4 text-destructive-foreground bg-destructive rounded-md"><p class="font-bold">Diagram Error:</p><p class="font-mono text-sm">${errorMessage}</p></div>`;
          }
          setSvgContent(null);
        } finally {
          setIsRendering(false);
        }
      };
      
      // Add a small delay to allow DOM to update if mermaidCode changes rapidly
      const timer = setTimeout(renderMermaid, 100);
      return () => clearTimeout(timer);

    } else if (mermaidDivRef.current) {
      mermaidDivRef.current.innerHTML = '<p class="text-muted-foreground p-4">Enter Mermaid code in the editor to see your diagram.</p>';
      setSvgContent(null);
      setRenderError(null);
      setIsRendering(false);
    }
  }, [mermaidCode]);

  const handleExportSVG = () => {
    if (svgContent) {
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Exported as SVG", description: "Diagram saved as diagram.svg" });
    } else {
      toast({ variant: "destructive", title: "Export Error", description: "No diagram to export." });
    }
  };

  const handleExportPNG = () => {
    if (svgContent && mermaidDivRef.current?.firstChild) {
      const svgElement = mermaidDivRef.current.firstChild as SVGElement;
      const {width: svgWidth, height: svgHeight} = svgElement.getBBox && svgElement.getBBox().width && svgElement.getBBox().height ? svgElement.getBBox() : { width: svgElement.clientWidth, height: svgElement.clientHeight };


      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast({ variant: "destructive", title: "Export Error", description: "Could not create canvas context." });
        return;
      }

      const img = new Image();
      const scale = 2; // For better resolution
      
      // Fallback if getBBox is not reliable or returns 0
      const effectiveWidth = svgWidth > 0 ? svgWidth : 600;
      const effectiveHeight = svgHeight > 0 ? svgHeight : 400;

      canvas.width = effectiveWidth * scale;
      canvas.height = effectiveHeight * scale;
      
      img.onload = () => {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--background-rgb') || 'white'; // Use actual background color
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, effectiveWidth, effectiveHeight);
        URL.revokeObjectURL(img.src); // Clean up blob URL

        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = 'diagram.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast({ title: "Exported as PNG", description: "Diagram saved as diagram.png" });
      };
      img.onerror = (e) => {
        console.error("Error loading SVG into image for PNG export", e);
        toast({ variant: "destructive", title: "Export Error", description: "Could not load SVG for PNG export." });
        URL.revokeObjectURL(img.src); // Clean up blob URL
      };
      
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      img.src = URL.createObjectURL(svgBlob);

    } else {
      toast({ variant: "destructive", title: "Export Error", description: "No diagram to export or SVG content is invalid." });
    }
  };
  
  return (
    <Card className="w-full md:w-1/2 h-full flex flex-col shadow-lg rounded-lg m-2">
      <CardHeader className="p-4 border-b flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-headline">Visualization Canvas</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportSVG} disabled={!svgContent || isRendering}>
            <Download className="mr-2 h-4 w-4" /> Export SVG
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPNG} disabled={!svgContent || isRendering}>
            <ImageDown className="mr-2 h-4 w-4" /> Export PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex items-center justify-center bg-muted/30 overflow-hidden">
        <ScrollArea className="w-full h-full rounded-md border bg-background">
           {isRendering && (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Rendering diagram...</p>
            </div>
          )}
          <div 
            ref={mermaidDivRef} 
            className="w-full h-full p-4 min-h-[300px] flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full" // Ensure SVG scales
            aria-live="polite"
            data-ai-hint="diagram chart" // for placeholder image if needed, though we render dynamically
          >
            {/* Mermaid diagram will be rendered here */}
          </div>
        </ScrollArea>
      </CardContent>
       <CardFooter className="p-4 border-t flex justify-between items-center">
         <p className="text-xs text-muted-foreground">
            {renderError ? "Diagram has errors." : svgContent ? "Diagram rendered successfully." : "Waiting for code..."}
         </p>
         <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => onSaveDiagram(mermaidCode)} disabled={isRendering || !mermaidCode}>
                <Save className="mr-2 h-4 w-4" /> Save Diagram
            </Button>
            <Button variant="outline" size="sm" onClick={onLoadDiagram} disabled={isRendering}>
                <FolderOpen className="mr-2 h-4 w-4" /> Load Diagram
            </Button>
         </div>
      </CardFooter>
    </Card>
  );
}
