"use client";

import { useEffect, useState, useRef } from "react";
import { Code2, Edit, Share, Trash2, Copy, Download, FileText, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import AddTemplate from "./addTemplate";
import { InputCode } from "@/components/input-code";

// Enhanced Syntax highlighter component with better language detection
const SyntaxHighlighter = ({ code, language }: { code: string; language: string }) => {
  const getLanguageExtension = (lang: string) => {
    const extensions: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml',
      'xml': 'xml',
      'sql': 'sql',
      'php': 'php',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'kt': 'kotlin',
      'swift': 'swift',
      'txt': 'text'
    };
    return extensions[lang.toLowerCase()] || lang;
  };

  const displayLanguage = getLanguageExtension(language);

  return (
    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto border border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-400 font-mono uppercase tracking-wide">
          {displayLanguage}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-gray-700"
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
            className="text-gray-400 hover:text-white hover:bg-gray-700"
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
              toast.success("Code downloaded successfully!");
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap overflow-x-auto">
        <code className="language-javascript">{code}</code>
      </pre>
    </div>
  );
};

// Helper function to get language icon color
const getLanguageColor = (language: string) => {
  const colors: { [key: string]: string } = {
    'javascript': 'text-yellow-400',
    'typescript': 'text-blue-400',
    'python': 'text-green-400',
    'html': 'text-orange-400',
    'css': 'text-purple-400',
    'json': 'text-gray-400',
    'markdown': 'text-gray-300',
    'yaml': 'text-red-400',
    'sql': 'text-pink-400',
    'php': 'text-indigo-400',
    'java': 'text-red-500',
    'cpp': 'text-blue-500',
    'c': 'text-blue-600',
    'csharp': 'text-purple-500',
    'ruby': 'text-red-400',
    'go': 'text-cyan-400',
    'rust': 'text-orange-500',
    'kotlin': 'text-purple-400',
    'swift': 'text-orange-400'
  };
  return colors[language.toLowerCase()] || 'text-gray-400';
};

// Helper function to extract file extension from URL
const getFileExtension = (url: string) => {
  if (!url) return 'txt';
  
  const urlParts = url.split('.');
  let extension = 'txt';
  
  if (urlParts.length > 1) {
    extension = urlParts[urlParts.length - 1].toLowerCase().split('?')[0].split('#')[0];
  }
  
  // Alternative: extract from filename in URL
  const filename = url.split('/').pop() || '';
  if (filename.includes('.')) {
    const fileExtension = filename.split('.').pop()?.toLowerCase().split('?')[0].split('#')[0];
    if (fileExtension) {
      extension = fileExtension;
    }
  }
  
  return extension;
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
  const [codeLoading, setCodeLoading] = useState(false);

  // ✅ Fetch templates from API
  const fetchTemplates = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/templates");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
      } else {
        throw new Error(data.message || "Failed to fetch templates");
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
    
    // Refresh the templates list to ensure consistency
    fetchTemplates();
  };

  // ✅ Enhanced Handle template deletion with better error handling
  const handleDelete = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const res = await fetch(`http://localhost:8080/api/templates/${templateId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `HTTP error! status: ${res.status}`);
      }

      if (data.success) {
        setTemplates(prev => prev.filter(t => t._id !== templateId));
        toast.success("Template deleted successfully!");
      } else {
        throw new Error(data.message || "Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error(`Failed to delete template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // ✅ Handle template editing
  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setShowInputCode(true);
  };

  // ✅ Enhanced Handle code viewing with better error handling and language detection
  const handleViewCode = async (template: any) => {
    console.log("Template codeurl:", template.codeurl);
    
    if (!template.codeurl) {
      toast.error("No code URL available for this template");
      return;
    }

    setCodeLoading(true);
    
    try {
      // Use API proxy to fetch code content to avoid CORS issues
      const response = await fetch('http://localhost:8080/api/templates/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          codeUrl: template.codeurl,
          templateId: template._id 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch code: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to retrieve code content");
      }
      
      const code = data.code;
      
      if (!code || !code.trim()) {
        throw new Error("Code file is empty or contains no readable content");
      }
      
      const language = getFileExtension(template.codeurl);
      
      console.log("Detected language:", language);
      
      setCurrentCode({
        content: code,
        language: language,
        title: template.title
      });
      setShowCodeViewer(true);
    } catch (error) {
      console.error("Error fetching code:", error);
      toast.error(`Failed to load code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCodeLoading(false);
    }
  };

  // ✅ Enhanced Handle template sharing with better error handling
  const handleShare = async (templateId: string) => {
    try {
      const res = await fetch("http://localhost:8080/api/templates/share", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ templateId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `HTTP error! status: ${res.status}`);
      }

      if (data.success && data.shareLink) {
        setShareLink(data.shareLink);
        setShowShareDialog(true);
        toast.success("Share link generated successfully!");
      } else {
        throw new Error(data.message || "Failed to generate share link");
      }
    } catch (error) {
      console.error("Error generating share link:", error);
      toast.error(`Failed to generate share link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const visibleTemplates = templates.slice(0, visibleCount);

  return (
    <div>
      <div className="flex items-end justify-end">
        <div className="my-8 mx-12">
          <AddTemplate onClick={() => {
          setEditingTemplate(null);
          setShowInputCode(true);
        }} />
        </div>

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

      {/* Enhanced Code Viewer Dialog */}
      <Dialog open={showCodeViewer} onOpenChange={setShowCodeViewer}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Code2 className="h-5 w-5" />
              {currentCode.title}
              <Badge variant="secondary" className="ml-auto text-xs">
                .{currentCode.language}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[75vh] pr-2">
            {codeLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading code...</span>
              </div>
            ) : (
              <SyntaxHighlighter 
                code={currentCode.content} 
                language={currentCode.language} 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share className="h-5 w-5" />
              Share Template
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share this template with others. This link will be valid for 10 minutes.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm select-all"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                  toast.success("Share link copied to clipboard!");
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleTemplates.map((template) => (
              <motion.div
                key={template._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="group relative overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 bg-gradient-to-br from-[var(--card-bg)] to-[var(--card-bg)]/80 backdrop-blur-sm h-full flex flex-col">
                  
                  {/* Gradient overlay for visual appeal */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Action buttons */}
                  <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                    <div className="flex gap-1.5 bg-background/90 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-border/50">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 hover:bg-blue-500/20 hover:text-blue-400"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEdit(template);
                        }}
                        title="Edit template"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 hover:bg-green-500/20 hover:text-green-400"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleShare(template._id);
                        }}
                        title="Share template"
                      >
                        <Share className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 hover:bg-red-500/20 hover:text-red-400"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(template._id);
                        }}
                        title="Delete template"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Header section with file info */}
                  <div className="p-6 pb-4">
                    {/* File type and language indicator */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700`}>
                          <FileText className={`h-4 w-4 ${getLanguageColor(getFileExtension(template.codeurl || ''))}`} />
                        </div>
                        <div>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs font-mono ${getLanguageColor(getFileExtension(template.codeurl || ''))} bg-background/50`}
                          >
                            .{getFileExtension(template.codeurl || 'txt')}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Quick view code button */}
                      
                    </div>

                    {/* Title */}
                    <CardTitle className="group-hover:text-primary transition-colors text-lg font-semibold line-clamp-2 mb-2 leading-tight">
                      {template.title}
                    </CardTitle>
                    
                    {/* Description */}
                    <CardDescription className="text-sm text-muted-foreground/80 line-clamp-3 leading-relaxed">
                      {template.description}
                    </CardDescription>
                  </div>

                  {/* Tags section */}
                  <div className="px-6 pb-4 flex-grow">
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {template.tags.slice(0, 3).map((tag: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs bg-background/30 border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-colors"
                          >
                            <Tag className="h-2.5 w-2.5 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-muted/50 border-border/50"
                          >
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer with creation date or metadata */}
                  <div className="px-6 py-3 border-t border-border/30 bg-background/30">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {template.createdAt 
                            ? new Date(template.createdAt).toLocaleDateString()
                            : 'Recently added'
                          }
                        </span>
                      </div>
                      
                      {/* Interactive preview button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/10 hover:text-primary"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleViewCode(template);
                        }}
                      >
                        Preview →
                      </Button>
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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