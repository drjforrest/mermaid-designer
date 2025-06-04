
"use client";

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download, ImageDown, Save, FolderOpen, Loader2, Settings } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MermaidVisualizerProps {
  mermaidCode: string;
  onSaveDiagram: (code: string) => void;
  onLoadDiagram: () => string | null;
  diagramTheme: string;
  onDiagramThemeChange: (theme: string) => void;
  diagramFontFamily: string;
  onDiagramFontFamilyChange: (font: string) => void;
  flowchartUseMaxWidth: boolean;
  onFlowchartUseMaxWidthChange: (useMaxWidth: boolean) => void;
}

let mermaidRenderIdCounter = 0;

const availableFonts = [
  { value: 'Inter', label: 'Inter (App Default)' },
  { value: 'Source Code Pro', label: 'Source Code Pro (Code Font)' },
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial / Helvetica' },
  { value: 'Verdana, Geneva, sans-serif', label: 'Verdana / Geneva' },
  { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
  { value: 'monospace', label: 'Monospace' },
];

export function MermaidVisualizer({ 
  mermaidCode, 
  onSaveDiagram, 
  onLoadDiagram, 
  diagramTheme, 
  onDiagramThemeChange,
  diagramFontFamily,
  onDiagramFontFamilyChange,
  flowchartUseMaxWidth,
  onFlowchartUseMaxWidthChange,
}: MermaidVisualizerProps) {
  const mermaidDivRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: diagramTheme,
      securityLevel: 'loose', 
      fontFamily: diagramFontFamily,
      flowchart: {
        useMaxWidth: flowchartUseMaxWidth,
      }
    });
  }, [diagramTheme, diagramFontFamily, flowchartUseMaxWidth]);

  useEffect(() => {
    if (mermaidCode && mermaidDivRef.current) {
      setIsRendering(true);
      setRenderError(null);
      // It's important to clear previous content before rendering.
      mermaidDivRef.current.innerHTML = ''; 
      
      const renderMermaid = async () => {
        try {
          const uniqueId = `mermaid-diagram-${mermaidRenderIdCounter++}`;
          // Ensure the div is clean for the new render attempt
          if (mermaidDivRef.current) mermaidDivRef.current.innerHTML = '';
          const {svg} = await mermaid.render(uniqueId, mermaidCode);
          if (mermaidDivRef.current) { // Check ref again in case component unmounted
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
      
      // Using a timeout can sometimes help with race conditions or rapid updates.
      const timer = setTimeout(renderMermaid, 50); 
      return () => clearTimeout(timer);

    } else if (mermaidDivRef.current) {
      mermaidDivRef.current.innerHTML = '<p class="text-muted-foreground p-4">Enter Mermaid code in the editor to see your diagram.</p>';
      setSvgContent(null);
      setRenderError(null);
      setIsRendering(false);
    }
  }, [mermaidCode, diagramTheme, diagramFontFamily, flowchartUseMaxWidth]); // Re-render if any of these change

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
      const scale = 2; 
      
      const effectiveWidth = svgWidth > 0 ? svgWidth : 600;
      const effectiveHeight = svgHeight > 0 ? svgHeight : 400;

      canvas.width = effectiveWidth * scale;
      canvas.height = effectiveHeight * scale;
      
      img.onload = () => {
        // Use the application's current background color for the canvas
        let bgColor = 'white';
        if (typeof window !== 'undefined') {
            const bodyStyles = getComputedStyle(document.body);
            bgColor = bodyStyles.backgroundColor || 'white';
        }
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, effectiveWidth, effectiveHeight);
        URL.revokeObjectURL(img.src);

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
        if (img.src.startsWith('blob:')) { // Only revoke if it's a blob URL we created
           URL.revokeObjectURL(img.src); 
        }
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
        <div className="flex space-x-2 items-center">
           <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm"><Settings className="mr-2 h-4 w-4" /> Options</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Diagram Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Adjust global diagram rendering options.
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="diagramTheme">Theme</Label>
                    <Select value={diagramTheme} onValueChange={onDiagramThemeChange}>
                      <SelectTrigger id="diagramTheme" className="col-span-2 h-8 text-xs" aria-label="Select Diagram Theme">
                        <SelectValue placeholder="Theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="base">Base</SelectItem>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="forest">Forest</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="diagramFont">Font</Label>
                    <Select value={diagramFontFamily} onValueChange={onDiagramFontFamilyChange}>
                      <SelectTrigger id="diagramFont" className="col-span-2 h-8 text-xs" aria-label="Select Diagram Font Family">
                        <SelectValue placeholder="Font" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFonts.map(font => (
                          <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="flowchartMaxWidth">Flowchart Max Width</Label>
                     <div className="col-span-2 flex items-center justify-start">
                        <Switch
                            id="flowchartMaxWidth"
                            checked={flowchartUseMaxWidth}
                            onCheckedChange={onFlowchartUseMaxWidthChange}
                            aria-label="Toggle flowchart use max width"
                        />
                     </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="sm" onClick={handleExportSVG} disabled={!svgContent || isRendering}>
            <Download className="mr-2 h-4 w-4" /> SVG
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPNG} disabled={!svgContent || isRendering}>
            <ImageDown className="mr-2 h-4 w-4" /> PNG
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
            className="w-full h-full p-4 min-h-[300px] flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full"
            aria-live="polite"
            data-ai-hint="diagram chart"
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
                <Save className="mr-2 h-4 w-4" /> Save
            </Button>
            <Button variant="outline" size="sm" onClick={onLoadDiagram} disabled={isRendering}>
                <FolderOpen className="mr-2 h-4 w-4" /> Load
            </Button>
         </div>
      </CardFooter>
    </Card>
  );
}
