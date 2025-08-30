"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Code2, Copy, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";

// Syntax highlighter component
const SyntaxHighlighter = ({ code, language }: { code: string; language: string }) => {
  return (
    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-400 font-mono">{language}</span>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => {
              navigator.clipboard.writeText(code);
              toast("Code copied to clipboard!" );
            }}>
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

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;
  
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    async function fetchSharedTemplate() {
      try {
        const res = await fetch(`/api/share/${token}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Failed to load shared template");
        }
        
        setTemplate(data.template);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchSharedTemplate();
    }
  }, [token]);

  // Update time remaining every second
  useEffect(() => {
    if (!template) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const shareTime = new Date(template.createdAt).getTime();
      const expiry = shareTime + (10 * 60 * 1000); // 10 minutes
      const remaining = expiry - now;

      if (remaining <= 0) {
        setTimeRemaining("Expired");
        return;
      }

      const minutes = Math.floor(remaining / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [template]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
            <Button className="mt-4" onClick={() => window.location.href = '/'}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const language = template.codeurl.split('.').pop() || 'txt';

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Code2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Shared Code Template</h1>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className={`font-mono ${timeRemaining === 'Expired' ? 'text-destructive' : ''}`}>
                {timeRemaining === 'Expired' ? 'Link Expired' : `Expires in: ${timeRemaining}`}
              </span>
            </div>
          </div>
        </div>

        {/* Template Info */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{template.title}</CardTitle>
                <CardDescription className="text-base">
                  {template.description}
                </CardDescription>
              </div>
              <Button
                onClick={() => window.open('/', '_blank')}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View More Templates
              </Button>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-4">
              {template.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
        </Card>

        {/* Code Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Source Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SyntaxHighlighter 
              code={template.codeContent} 
              language={language}
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>This is a temporary share link that expires 10 minutes after creation.</p>
          <p>Want to create your own code templates? <a href="/" className="text-primary hover:underline">Visit our platform</a></p>
        </div>
      </div>
    </div>
  );
}