"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Code2, Edit, Share, Trash2, X, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import AddTemplate from "./addTemplate";
import { InputCode } from "@/components/input-code";

// Syntax highlighter component
const SyntaxHighlighter = ({ code, language }: { code: string; language: string }) => {
  return (
    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-400 font-mono">{language}</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(code);
              toast.success("Code copied to clipboard!");
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const blob = new Blob([code], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `code.${language}`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default function Templates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [showInputCode, setShowInputCode] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const [currentCode, setCurrentCode] = useState({ content: "", language: "", title: "" });
  const [shareLink, setShareLink] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);

  // ✅ Fetch templates from API
  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      toast.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // ✅ Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 6);
        }
      },
      { threshold: 1.0 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, []);

  // ✅ Handle successful template creation/update
  const handleTemplateAdded = (newTemplate: any) => {
    if (editingTemplate) {
      // Update existing template
      setTemplates(prev => prev.map(t => t._id === newTemplate._id ? newTemplate : t));
      toast.success("Template updated successfully!");
    } else {
      // Add new template
      setTemplates(prev => [newTemplate, ...prev]);
      toast.success("Template saved successfully!");
    }
    setShowInputCode(false);
    setEditingTemplate(null);
  };

  // ✅ Handle template deletion
  const handleDelete = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const res = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete template");

      setTemplates(prev => prev.filter(t => t._id !== templateId));
      toast.success("Template deleted successfully!");
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  // ✅ Handle template editing
  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setShowInputCode(true);
  };

  // ✅ Handle code viewing
  const handleViewCode = async (template: any) => {
    try {
      const response = await fetch(template.codeurl);
      const code = await response.text();
      const language = template.codeurl.split('.').pop() || 'txt';
      
      setCurrentCode({
        content: code,
        language: language,
        title: template.title
      });
      setShowCodeViewer(true);
    } catch (error) {
      console.error("Error fetching code:", error);
      toast.error( "Failed to load code");
    }
  };

  // ✅ Handle template sharing
  const handleShare = async (templateId: string) => {
    try {
      const res = await fetch("/api/templates/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });

      if (!res.ok) throw new Error("Failed to generate share link");

      const data = await res.json();
      setShareLink(data.shareLink);
      setShowShareDialog(true);
    } catch (error) {
      console.error("Error generating share link:", error);
      toast.error("Failed to generate share link");
    }
  };

  const visibleTemplates = templates.slice(0, visibleCount);

  return (
    <div>
      <div className="flex items-end justify-end">
        <AddTemplate onClick={() => {
          setEditingTemplate(null);
          setShowInputCode(true);
        }} />

        {showInputCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300">
            <div className="flex items-center justify-center p-6 w-full max-w-2xl transition-all duration-300">
              <InputCode 
                onSuccess={handleTemplateAdded}
                onCancel={() => {
                  setShowInputCode(false);
                  setEditingTemplate(null);
                }}
                editingTemplate={editingTemplate}
              />
            </div>
          </div>
        )}
      </div>

      {/* Code Viewer Dialog */}
      <Dialog open={showCodeViewer} onOpenChange={setShowCodeViewer}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              {currentCode.title}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh]">
            <SyntaxHighlighter 
              code={currentCode.content} 
              language={currentCode.language} 
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This link will be valid for 10 minutes only.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 border rounded-md bg-muted"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                  toast.success("Link copied to clipboard!");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <section
        id="templates"
        className="py-20 px-6 md:px-20 bg-[var(--bg-primary)] text-[var(--text)] min-h-screen"
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center text-3xl md:text-4xl font-bold mb-12 text-[var(--primary)]"
        >
          All Templates
        </motion.h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-800 rounded-lg h-72 w-full"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {visibleTemplates.map((template) => (
              <motion.div
                key={template._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="overflow-hidden flex flex-col h-full border border-border/50 hover:border-primary/20 transition-all hover:shadow-lg group bg-[var(--card-bg)] relative">
                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={() => handleShare(template._id)}
                      >
                        <Share className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDelete(template._id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="aspect-video w-full overflow-hidden bg-muted relative">
                    <div 
                      className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center cursor-pointer"
                      onClick={() => handleViewCode(template)}
                    >
                      <Button size="sm" variant="secondary" className="rounded-full">
                        <Code2 className="h-4 w-4 mr-1" />
                        View Code
                      </Button>
                    </div>
                    <img
                      src="/placeholder.svg"
                      alt={template.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors text-lg">
                      {template.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {template.tags.slice(0, 3).map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{template.tags.length - 3}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription className="text-sm line-clamp-3">
                      {template.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div ref={loadMoreRef} className="h-20 mt-10 flex justify-center items-center">
          {visibleCount < templates.length && !loading && (
            <p className="text-[var(--secondary)]">Loading more...</p>
          )}
        </div>
      </section>
    </div>
  );
}