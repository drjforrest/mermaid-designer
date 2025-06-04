"use client";

import { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { generateMermaidDiagram } from '@/ai/flows/mermaid-diagram-generation';
import { mermaidSyntaxRepair } from '@/ai/flows/mermaid-syntax-repair';
import { Wand2, ShieldCheck, Lightbulb, Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface MermaidCodeEditorProps {
  onCodeChange: (code: string) => void;
  initialCode?: string;
  mermaidCode: string; 
  setMermaidCode: (code: string) => void;
}

export function MermaidCodeEditor({ onCodeChange, initialCode = '', mermaidCode, setMermaidCode }: MermaidCodeEditorProps) {
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairInfo, setRepairInfo] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setMermaidCode(initialCode);
    }
  }, [initialCode, setMermaidCode]);
  
  useEffect(() => {
    onCodeChange(mermaidCode);
  }, [mermaidCode, onCodeChange]);

  const handleGenerateWithAI = async () => {
    if (!description.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a description for the diagram." });
      return;
    }
    setIsLoadingAI(true);
    setRepairInfo(null);
    try {
      const result = await generateMermaidDiagram({ description });
      setMermaidCode(result.mermaidCode);
      toast({ title: "Diagram Generated", description: "Mermaid code generated from your description." });
      setIsGenerateDialogOpen(false);
      setDescription('');
    } catch (error) {
      console.error("Error generating diagram:", error);
      toast({ variant: "destructive", title: "AI Generation Error", description: "Could not generate diagram. Please try again." });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleRepairSyntax = async () => {
    setIsRepairing(true);
    setRepairInfo(null);
    try {
      const result = await mermaidSyntaxRepair({ mermaidCode });
      setMermaidCode(result.repairedMermaidCode);
      if (result.explanation) {
        setRepairInfo({ message: `Syntax Repaired: ${result.explanation}`, type: 'success' });
        toast({ title: "Syntax Repaired", description: result.explanation });
      } else {
         setRepairInfo({ message: "No syntax errors found or code automatically corrected.", type: 'info' });
        toast({ title: "Syntax Checked", description: "No errors found or code repaired." });
      }
    } catch (error) {
      console.error("Error repairing syntax:", error);
      setRepairInfo({ message: "Failed to repair syntax. Please check the code manually.", type: 'error' });
      toast({ variant: "destructive", title: "Syntax Repair Error", description: "Could not repair syntax." });
    } finally {
      setIsRepairing(false);
    }
  };
  
  return (
    <Card className="w-full md:w-1/2 h-full flex flex-col shadow-lg rounded-lg m-2">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-lg font-headline">Mermaid Code Editor</CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col overflow-hidden">
        <div className="flex space-x-2 mb-3">
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Wand2 className="mr-2 h-4 w-4" /> Generate with AI
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Generate Diagram with AI</DialogTitle>
                <DialogDescription>
                  Describe the diagram you want to create. The AI will generate the Mermaid code for you.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Textarea
                  placeholder="e.g., A flowchart with three steps: Start, Process, End"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px] font-code"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleGenerateWithAI} disabled={isLoadingAI} className="bg-primary hover:bg-primary/90">
                  {isLoadingAI && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={handleRepairSyntax} disabled={isRepairing}>
            {isRepairing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
            Repair Syntax
          </Button>
          {/* Autocomplete might be complex for now, placeholder for future */}
          {/* <Button variant="outline" size="sm" disabled>
            <Lightbulb className="mr-2 h-4 w-4" /> Autocomplete
          </Button> */}
        </div>
        {repairInfo && (
          <Alert variant={repairInfo.type === 'error' ? 'destructive' : 'default'} className={`mb-3 ${repairInfo.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : repairInfo.type === 'error' ? '' : 'bg-blue-100 border-blue-400 text-blue-700'}`}>
            <Info className="h-4 w-4" />
            <AlertTitle>{repairInfo.type.charAt(0).toUpperCase() + repairInfo.type.slice(1)}</AlertTitle>
            <AlertDescription>{repairInfo.message}</AlertDescription>
          </Alert>
        )}
        <ScrollArea className="flex-grow rounded-md border">
          <Textarea
            placeholder="Enter Mermaid code here... e.g., graph TD; A-->B;"
            value={mermaidCode}
            onChange={(e) => setMermaidCode(e.target.value)}
            className="w-full h-full min-h-[300px] resize-none p-3 font-code text-sm !border-0 !ring-0 focus-visible:!ring-0"
            aria-label="Mermaid Code Input"
          />
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
         <p className="text-xs text-muted-foreground">Tip: Use AI to generate or repair your Mermaid diagrams.</p>
      </CardFooter>
    </Card>
  );
}
