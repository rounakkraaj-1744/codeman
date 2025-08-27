"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, Code2, Save, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface InputCodeProps {
  onSuccess: (template: any) => void;
  onCancel: () => void;
  editingTemplate?: any;
}

export function InputCode({ onSuccess, onCancel, editingTemplate }: InputCodeProps) {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Pre-populate form when editing
  useEffect(() => {
    if (editingTemplate) {
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) {
        (form.elements.namedItem('title') as HTMLInputElement).value = editingTemplate.title;
        (form.elements.namedItem('description') as HTMLTextAreaElement).value = editingTemplate.description;
        (form.elements.namedItem('tags') as HTMLInputElement).value = editingTemplate.tags.join('.');
      }
    }
  }, [editingTemplate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const url = editingTemplate 
        ? `/api/templates/${editingTemplate._id}` 
        : "/api/templates";
      
      const method = editingTemplate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Operation failed");
      }

      const data = await res.json();
      console.log("Template operation successful:", data);
      
      // Reset form
      form.reset();
      setSelectedFile(null);
      
      // Call the success callback with the template
      onSuccess(data.template);
      
    } catch (err) {
      console.error("Error with template operation:", err);
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="w-full max-w-2xl relative shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4 z-10 hover:bg-destructive/10 hover:text-destructive"
          onClick={onCancel}
        >
          <X className="h-5 w-5" />
        </Button>
        
        <CardHeader className="space-y-2 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Code2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">
              {editingTemplate ? "Update Template" : "Save Your Code Template"}
            </CardTitle>
          </div>
          <p className="text-muted-foreground">
            {editingTemplate 
              ? "Make changes to your existing template"
              : "Upload your code and make it discoverable by others"
            }
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-2">
                  Template Title
                  <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="title" 
                  name="title" 
                  type="text" 
                  required 
                  placeholder="e.g., React Authentication Hook"
                  className="focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-semibold flex items-center gap-2">
                  Tags
                  <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="tags" 
                  name="tags" 
                  type="text" 
                  required 
                  placeholder="React.TypeScript.Hook (use dots to separate)"
                  className="focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                Description
              </Label>
              <Textarea 
                id="description" 
                name="description"
                placeholder="Describe what your code does, how to use it, any dependencies..."
                className="min-h-[100px] focus:ring-2 focus:ring-primary/20 resize-none"
                rows={4}
              />
            </div>

            {/* File Upload Area */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Code Source</Label>
              
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
                  dragActive
                    ? "border-primary bg-primary/5 scale-105"
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file"
                  name="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  
                  {selectedFile ? (
                    <div className="text-center">
                      <p className="font-medium text-primary">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <p className="font-medium">
                        Drop your code file here, or <span className="text-primary underline">browse</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports: .js, .ts, .tsx, .py, .java, .rs, .cpp, .c, .go, and more
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* OR Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted-foreground/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-4 text-muted-foreground font-medium">
                    OR PASTE CODE DIRECTLY
                  </span>
                </div>
              </div>

              {/* Code Textarea */}
              <div className="space-y-2">
                <Textarea
                  id="code"
                  name="code"
                  placeholder="public class HelloWorld {&#10;    public static void main(String[] args) {&#10;        System.out.println(&quot;Hello, World!&quot;);&#10;    }&#10;}"
                  className="min-h-[120px] font-mono text-sm focus:ring-2 focus:ring-primary/20 resize-none"
                  rows={6}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 h-12 text-lg font-semibold"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent" />
                    {editingTemplate ? "Updating..." : "Saving..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    {editingTemplate ? "Update Template" : "Save Template"}
                  </div>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                className="h-12 px-6"
                onClick={() => {
                  const form = document.querySelector('form') as HTMLFormElement;
                  form?.reset();
                  setSelectedFile(null);
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}